import React, { useState } from 'react';
import { Bell, Plus, X, Bookmark } from 'react-feather';

/**
 * 의사 공지사항 게시판 컴포넌트
 */
const AnnouncementBoard = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: '11월 정기 회의 일정 안내',
      content: '11월 25일 오후 2시에 정기 회의가 예정되어 있습니다. 모든 의사분들의 참석 부탁드립니다.',
      author: 'Dr. Robert Fox',
      date: '2025-11-18',
      isPinned: true,
      priority: 'high'
    },
    {
      id: 2,
      title: '신규 의료 장비 도입 안내',
      content: '최신 X-Ray 장비가 도입되었습니다. 사용법 교육은 11월 20일 오전 10시에 진행됩니다.',
      author: 'Dr. Brandon',
      date: '2025-11-17',
      isPinned: false,
      priority: 'medium'
    },
    {
      id: 3,
      title: '휴가 신청 관련 안내',
      content: '12월 휴가 신청은 11월 30일까지 마감됩니다. 인사팀으로 신청서를 제출해주세요.',
      author: 'Admin',
      date: '2025-11-16',
      isPinned: false,
      priority: 'low'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium',
    isPinned: false
  });

  // 공지사항 정렬: 고정 공지 > 우선순위 > 날짜
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.date) - new Date(a.date);
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const handleAdd = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    
    const announcement = {
      id: announcements.length + 1,
      ...newAnnouncement,
      author: 'Dr. Robert Fox',
      date: new Date().toISOString().split('T')[0]
    };
    
    setAnnouncements([...announcements, announcement]);
    setNewAnnouncement({ title: '', content: '', priority: 'medium', isPinned: false });
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
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
    <div className="bg-white rounded-[14px] shadow-[0_8px_30px_rgba(16,24,40,0.08)] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Bell className="text-[#4b7bec]" size={18} />
          <h2 className="text-base font-semibold text-slate-800">의사 공지사항</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#4b7bec] text-white rounded hover:bg-[#3b72e5] transition-colors text-xs font-medium"
        >
          <Plus size={14} />
          <span>작성</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-[40px] overflow-y-auto">
        {sortedAnnouncements.length === 0 ? (
          <div className="text-center py-2 text-gray-500">
            <Bell size={18} className="mx-auto mb-1 text-gray-300" />
            <p className="text-xs">공지사항이 없습니다</p>
          </div>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-2 rounded border transition-all hover:shadow-sm ${
                priorityColors[announcement.priority]
              } ${announcement.isPinned ? 'ring-1 ring-yellow-300' : ''}`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {announcement.isPinned && (
                    <Bookmark size={12} className="text-yellow-600 fill-yellow-600 flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-slate-800 text-sm flex-1 truncate">
                    {announcement.title}
                  </h3>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${priorityBadges[announcement.priority]}`}>
                    {announcement.priority === 'high' ? '긴급' : announcement.priority === 'medium' ? '일반' : '낮음'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-600 mb-1 line-clamp-1">
                {announcement.content}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{announcement.author}</span>
                <span className="ml-1 flex-shrink-0">{formatDate(announcement.date)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 공지 작성 모달 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
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

export default AnnouncementBoard;

