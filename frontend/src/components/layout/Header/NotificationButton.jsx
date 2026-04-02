import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Bookmark, Plus } from 'react-feather';
import { useAnnouncements } from '../../../contexts/AnnouncementContext';
import { useToast } from '../../../contexts/ToastContext';

const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { announcements, unreadCount, markAsRead, markAllAsRead, deleteAnnouncement, addAnnouncement } = useAnnouncements();
  const { showError, showInfo } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium',
    isPinned: false
  });

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const handleAdd = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      showError('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    const newAnn = addAnnouncement({
      ...newAnnouncement,
      author: localStorage.getItem('userName') || 'Dr. Robert Fox'
    });
    
    // 새 공지 알림 표시
    showInfo(`새 공지사항: ${newAnn.title}`);
    
    setNewAnnouncement({ title: '', content: '', priority: 'medium', isPinned: false });
    setShowAddModal(false);
  };

  const priorityColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-blue-50 border-blue-200',
    low: 'bg-gray-50 border-gray-200'
  };

  const priorityBadges = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
        aria-label="알림"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="text-[#4b7bec]" size={18} />
              <h3 className="text-base font-semibold text-slate-800">의사 공지사항</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#4b7bec] hover:text-[#3b72e5] transition-colors"
                >
                  모두 읽음
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-2 py-1 bg-[#4b7bec] text-white rounded hover:bg-[#3b72e5] transition-colors text-xs font-medium"
              >
                <Plus size={12} />
                <span>작성</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 공지사항 목록 */}
          <div className="flex-1 overflow-y-auto p-2">
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">공지사항이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                      priorityColors[announcement.priority]
                    } ${announcement.isPinned ? 'ring-1 ring-yellow-300' : ''} ${
                      !announcement.isRead ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => markAsRead(announcement.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {announcement.isPinned && (
                          <Bookmark size={12} className="text-yellow-600 fill-yellow-600 flex-shrink-0" />
                        )}
                        {!announcement.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                        <h4 className="font-semibold text-slate-800 text-sm flex-1 truncate">
                          {announcement.title}
                        </h4>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityBadges[announcement.priority]}`}>
                          {announcement.priority === 'high' ? '긴급' : announcement.priority === 'medium' ? '일반' : '낮음'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
                            deleteAnnouncement(announcement.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mb-1.5 line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">{announcement.author}</span>
                      <span className="ml-1 flex-shrink-0">{formatDate(announcement.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 공지 작성 모달 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-black/30"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">새 공지사항 작성</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="공지사항 제목을 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="공지사항 내용을 입력하세요"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위
                </label>
                <div className="flex gap-3">
                  {['high', 'medium', 'low'].map((priority) => (
                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={newAnnouncement.priority === priority}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {priority === 'high' ? '긴급' : priority === 'medium' ? '일반' : '낮음'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={newAnnouncement.isPinned}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="isPinned" className="text-sm text-gray-700 cursor-pointer">
                  상단 고정
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-[#4b7bec] text-white rounded-lg hover:bg-[#3b72e5] transition-colors"
              >
                작성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
