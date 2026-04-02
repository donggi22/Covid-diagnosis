import React from 'react';
import { formatDateKorean, extractTime } from '../../utils/timeCalculations';

/**
 * 다가오는 일정 목록 컴포넌트
 */
const UpcomingEvents = ({ events, onEventClick, onAddClick }) => {
  const typeIcons = {
    surgery: '🏥',
    appointment: '💊',
    xray: '📸'
  };

  const typeColors = {
    surgery: 'bg-red-100 text-red-700 border-red-300',      // 수술: 빨간색
    appointment: 'bg-blue-100 text-blue-700 border-blue-300', // 진료: 파란색
    xray: 'bg-yellow-100 text-yellow-700 border-yellow-300'   // X-Ray 검토: 노란색
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const getStatusBadge = (event) => {
    if (event.status === 'needs-review') {
      return (
        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">
          ⚠️ X-Ray 재검토 필요
        </span>
      );
    }
    if (event.status === 'scheduled') {
      // 알림 예정 로직 (30분 전 등)
      return (
        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
          🔔 30분 전 알림 예정
        </span>
      );
    }
    return null;
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex-1 flex flex-col min-h-[412px] max-h-[412px]">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          🔜 다가오는 일정
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">다음 7일</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            예정된 일정이 없습니다
          </p>
          <button
            onClick={onAddClick}
            className="btn btn-primary text-sm"
          >
            일정 추가하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex-1 flex flex-col overflow-hidden min-h-[412px] max-h-[412px]">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
        🔜 다가오는 일정
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">다음 7일</p>
      <ul className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {events.slice(0, 10).map((event) => (
          <li
            key={event.id}
            className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-600 dark:hover:border-indigo-500"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-center gap-2">
              {/* 날짜 + 아이콘 */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0 min-w-[70px]">
                <span className="text-[13px]">{typeIcons[event.type] || '📅'}</span>
                <span>{formatEventDate(event.startDateTime)}</span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[13px] text-gray-900 dark:text-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">
                    {event.patient?.name || '환자 정보 없음'}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      event.priority === 'high' ? 'bg-red-500' :
                      event.priority === 'low' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    title={`우선순위: ${event.priority || 'medium'}`}
                  />
                </div>

                <div className="text-[11px] text-gray-600 dark:text-gray-400">
                  {extractTime(event.startDateTime)} - {extractTime(event.endDateTime)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingEvents;

