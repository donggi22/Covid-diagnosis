import React, { createContext, useContext, useState, useCallback } from 'react';

const AnnouncementContext = createContext(null);

/**
 * 공지사항 전역 상태 관리
 * Note: ToastContext는 App.js에서 AnnouncementProvider보다 상위에 있어야 합니다.
 */
export const AnnouncementProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: '11월 정기 회의 일정 안내',
      content: '11월 25일 오후 2시에 정기 회의가 예정되어 있습니다. 모든 의사분들의 참석 부탁드립니다.',
      author: 'Dr. Robert Fox',
      date: '2025-11-18',
      isPinned: true,
      priority: 'high',
      isRead: false
    },
    {
      id: 2,
      title: '신규 의료 장비 도입 안내',
      content: '최신 X-Ray 장비가 도입되었습니다. 사용법 교육은 11월 20일 오전 10시에 진행됩니다.',
      author: 'Dr. Brandon',
      date: '2025-11-17',
      isPinned: false,
      priority: 'medium',
      isRead: false
    },
    {
      id: 3,
      title: '휴가 신청 관련 안내',
      content: '12월 휴가 신청은 11월 30일까지 마감됩니다. 인사팀으로 신청서를 제출해주세요.',
      author: 'Admin',
      date: '2025-11-16',
      isPinned: false,
      priority: 'low',
      isRead: false
    }
  ]);

  // 읽지 않은 공지사항 개수
  const unreadCount = announcements.filter(a => !a.isRead).length;

  // 공지사항 추가
  const addAnnouncement = useCallback((announcement) => {
    const newAnnouncement = {
      id: Date.now(),
      ...announcement,
      date: new Date().toISOString().split('T')[0],
      isRead: false
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    
    return newAnnouncement;
  }, []);

  // 공지사항 삭제
  const deleteAnnouncement = useCallback((id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);

  // 공지사항 읽음 처리
  const markAsRead = useCallback((id) => {
    setAnnouncements(prev => 
      prev.map(a => a.id === id ? { ...a, isRead: true } : a)
    );
  }, []);

  // 모든 공지사항 읽음 처리
  const markAllAsRead = useCallback(() => {
    setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
  }, []);

  // 정렬된 공지사항 (고정 > 우선순위 > 날짜)
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <AnnouncementContext.Provider
      value={{
        announcements: sortedAnnouncements,
        unreadCount,
        addAnnouncement,
        deleteAnnouncement,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

/**
 * 공지사항 Context 사용 훅
 */
export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within an AnnouncementProvider');
  }
  return context;
};

