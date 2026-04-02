import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronLeft, ChevronRight, Bookmark } from 'react-feather';
import { useAnnouncements } from '../../contexts/AnnouncementContext';

/**
 * 공지사항 캐러셀 컴포넌트 - 순차적으로 자동 슬라이드
 */
const AnnouncementCarousel = () => {
  const { announcements } = useAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  // 공지사항이 없으면 표시하지 않음
  if (announcements.length === 0) {
    return null;
  }

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (announcements.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 기존 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 새 인터벌 설정
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setIsTransitioning(false);
      }, 300); // 페이드 아웃 시간
    }, 5000); // 5초마다 변경

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [announcements.length, isPaused]);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const currentAnnouncement = announcements[currentIndex];

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-blue-500',
    low: 'bg-gray-500'
  };

  const priorityBadges = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-700'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  return (
    <div
      className="relative w-full h-full flex items-center group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 공지사항 내용 */}
      <div 
        className={`flex-1 flex items-center gap-3 px-8 transition-opacity duration-300 relative ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* 왼쪽 화살표 */}
        {announcements.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all opacity-0 group-hover:opacity-100"
            aria-label="이전 공지"
          >
            <ChevronLeft size={12} />
          </button>
        )}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bell size={16} className="text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {currentAnnouncement.isPinned && (
              <Bookmark size={10} className="text-yellow-600 fill-yellow-600" />
            )}
            <h3 className="text-sm font-bold text-slate-900 truncate" style={{ 
              textShadow: '0 0.5px 0.5px rgba(0, 0, 0, 0.1)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
              {currentAnnouncement.title}
            </h3>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${priorityBadges[currentAnnouncement.priority]}`}>
              {currentAnnouncement.priority === 'high' ? '긴급' : currentAnnouncement.priority === 'medium' ? '일반' : '낮음'}
            </span>
          </div>
          <p className="text-xs text-slate-700 mb-1 line-clamp-1" style={{ 
            textShadow: '0 0.5px 0.5px rgba(0, 0, 0, 0.08)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontWeight: '500'
          }}>
            {currentAnnouncement.content}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-600" style={{ 
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontWeight: '500',
            textShadow: '0 0.5px 0.5px rgba(0, 0, 0, 0.05)'
          }}>
            <span>{currentAnnouncement.author}</span>
            <span>•</span>
            <span>{formatDate(currentAnnouncement.date)}</span>
          </div>
        </div>
        {/* 오른쪽 화살표 */}
        {announcements.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-12 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all opacity-0 group-hover:opacity-100"
            aria-label="다음 공지"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* 인디케이터 */}
      {announcements.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentIndex
                  ? 'w-6 h-1.5 rounded-full bg-blue-500'
                  : 'w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`공지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementCarousel;

