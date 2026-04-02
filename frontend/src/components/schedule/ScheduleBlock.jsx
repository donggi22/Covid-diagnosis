import React, { useState } from 'react';
import { extractTime } from '../../utils/timeCalculations';

/**
 * 개별 일정 블록 컴포넌트
 */
const ScheduleBlock = ({ schedule, onClick, hourHeight = 80 }) => {
  const [isHovered, setIsHovered] = useState(false);

  const startTime = extractTime(schedule.startDateTime);
  const endTime = extractTime(schedule.endDateTime);
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // 위치 계산
  const baseHour = 8;
  const hourOffset = startHours - baseHour;
  const minuteOffset = startMinutes / 60;
  const top = (hourOffset + minuteOffset) * hourHeight;

  // 높이 계산
  const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const height = (totalMinutes / 60) * hourHeight;

  // 타입별 스타일
  const typeStyles = {
    surgery: {
      bg: '#fef2f2',
      border: '#dc2626',
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      icon: '🏥',
      label: '수술'
    },
    appointment: {
      bg: '#eff6ff',
      border: '#2563eb',
      iconBg: '#dbeafe',
      iconColor: '#2563eb',
      icon: '💊',
      label: '진료'
    },
    xray: {
      bg: '#fefce8',      // 노란색 배경
      border: '#eab308',  // 노란색 테두리
      iconBg: '#fef9c3',  // 노란색 아이콘 배경
      iconColor: '#ca8a04', // 노란색 아이콘
      icon: '📸',
      label: 'X-Ray 검토'
    }
  };

  const style = typeStyles[schedule.type] || typeStyles.appointment;

  // 상태별 텍스트 및 색상
  const statusConfig = {
    completed: {
      badge: { bg: '#d1fae5', color: '#065f46', border: '#10b981' },
      text: schedule.statusText || '완료'
    },
    'in-progress': {
      badge: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
      text: schedule.statusText || 'AI 분석 대기 중'
    },
    'needs-review': {
      badge: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
      text: schedule.statusText || 'X-Ray 재검토 필요'
    },
    scheduled: {
      badge: { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' },
      text: schedule.statusText || '예정'
    }
  };

  const status = statusConfig[schedule.status] || statusConfig.scheduled;

  return (
    <div
      className="schedule-block"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: '70px',
        left: '80px',
        right: '20px',
        position: 'absolute',
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: '8px',
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        zIndex: isHovered ? 10 : 1
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(schedule)}
      role="button"
      tabIndex={0}
      aria-label={`${startTime} ${schedule.patient?.name || ''} ${style.label} 일정`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(schedule);
        }
      }}
    >
      <div style={{ padding: '12px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 상단: 타입 + 시간 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: style.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              {style.icon}
            </div>
            <span style={{
              fontWeight: 600,
              fontSize: '14px',
              color: style.border
            }}>
              {style.label}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
            {startTime}
          </span>
        </div>

        {/* 환자 정보 */}
        {schedule.patient && (
          <div style={{
            fontSize: '14px',
            color: '#1f2937',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {schedule.patient.name} <span style={{ color: '#6b7280', fontSize: '13px' }}>({schedule.patient.patientId})</span>
          </div>
        )}

        {/* 상태 배지 */}
        <div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: status.badge.bg,
            color: status.badge.color,
            border: `1px solid ${status.badge.border}`
          }}>
            {status.text}
          </span>
        </div>

        {/* 위치 정보 (공간이 있을 때만) */}
        {height > 100 && schedule.location && (
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>📍</span>
            <span>{schedule.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleBlock;

