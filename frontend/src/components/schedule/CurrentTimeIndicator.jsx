import React, { useState, useEffect } from 'react';
import { getCurrentTimePosition, getTimeString, isBusinessHours } from '../../utils/timeCalculations';

/**
 * 현재 시간 표시선 컴포넌트
 */
const CurrentTimeIndicator = ({ hourHeight = 80 }) => {
  const [position, setPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const timeStr = getTimeString(now);
      
      if (isBusinessHours(timeStr)) {
        const pos = getCurrentTimePosition(hourHeight);
        setPosition(pos);
        setCurrentTime(timeStr);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 초기 업데이트
    updatePosition();

    // 매 분마다 업데이트
    const interval = setInterval(updatePosition, 60000);

    return () => clearInterval(interval);
  }, [hourHeight]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      {/* 빨간 선 */}
      <div className="absolute left-[80px] right-0 h-0.5 bg-red-500" />
      
      {/* 시간 배지 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-r-md shadow-md">
        {currentTime}
      </div>
      
      {/* 펄싱 도트 */}
      <div className="absolute left-[75px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg" />
    </div>
  );
};

export default CurrentTimeIndicator;

