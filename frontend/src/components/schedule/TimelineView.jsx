import React, { useRef, useEffect } from 'react';
import ScheduleBlock from './ScheduleBlock';
import CurrentTimeIndicator from './CurrentTimeIndicator';

/**
 * 타임라인 뷰 컴포넌트
 */
const TimelineView = ({ schedules, onScheduleClick, onEmptySlotClick, hourHeight = 60 }) => {
  const timelineRef = useRef(null);
  const totalHeight = 24 * hourHeight; // 0am-24pm = 24 hours

  // 시간대 생성 (00:00 - 24:00)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 빈 슬롯 클릭 핸들러
  const handleTimelineClick = (e) => {
    if (e.target === timelineRef.current || e.target.classList.contains('hour-slot')) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickedHour = Math.floor(clickY / hourHeight);
      const clickedMinute = Math.floor((clickY % hourHeight) / hourHeight * 60);
      const clickedTime = `${String(clickedHour).padStart(2, '0')}:${String(Math.floor(clickedMinute / 15) * 15).padStart(2, '0')}`;

      onEmptySlotClick?.(clickedTime);
    }
  };

  // 현재 시간으로 스크롤
  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (timelineRef.current) {
      const currentPosition = (hours * hourHeight) + (minutes / 60 * hourHeight);
      timelineRef.current.scrollTop = currentPosition - 200; // 약간 위로
    }
  }, [hourHeight]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div
        ref={timelineRef}
        className="relative"
        onClick={handleTimelineClick}
        style={{ height: `${totalHeight}px` }}
      >
        {/* 시간 라벨 및 구분선 */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="relative hour-slot"
            style={{ height: `${hourHeight}px` }}
          >
            {/* 시간 라벨 */}
            <div className="absolute left-0 top-0 w-[80px] h-full flex items-start justify-end pr-3 pt-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>

            {/* 구분선 */}
            <div className="absolute left-[80px] right-0 top-0 h-px bg-gray-200 dark:bg-gray-700" />

            {/* 빈 슬롯 영역 (호버 효과) */}
            <div className="absolute left-[80px] right-0 top-0 h-full hour-slot hover:bg-gray-50/50 transition-colors cursor-pointer" />
          </div>
        ))}

        {/* 일정 블록들 */}
        {schedules.map((schedule) => (
          <ScheduleBlock
            key={schedule.id}
            schedule={schedule}
            onClick={onScheduleClick}
            hourHeight={hourHeight}
          />
        ))}

        {/* 현재 시간 표시선 */}
        <CurrentTimeIndicator hourHeight={hourHeight} />
      </div>
    </div>
  );
};

export default TimelineView;

