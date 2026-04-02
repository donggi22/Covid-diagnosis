import React, { useState, useEffect } from 'react';
import { formatDateKorean, extractTime, calculateDuration } from '../../utils/timeCalculations';
import api from '../../utils/api';

/**
 * 일정 상세 패널 컴포넌트
 */
const ScheduleDetailPanel = ({ schedule, isOpen, onClose, onEdit, onDelete, onComplete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ESC 키로 패널 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !schedule) return null;

  const typeStyles = {
    surgery: {
      bg: 'bg-red-600',
      icon: '🏥',
      label: '수술'
    },
    appointment: {
      bg: 'bg-blue-600',
      icon: '💊',
      label: '진료'
    },
    xray: {
      bg: 'bg-teal-600',
      icon: '📸',
      label: 'X-Ray 검토'
    }
  };

  const style = typeStyles[schedule.type] || typeStyles.appointment;

  const startTime = extractTime(schedule.startDateTime);
  const endTime = extractTime(schedule.endDateTime);
  const { hours, minutes } = calculateDuration(startTime, endTime);
  const durationText = hours > 0 ? `${hours}시간 ${minutes > 0 ? `${minutes}분` : ''}` : `${minutes}분`;

  const statusConfig = {
    completed: { text: '완료', color: 'bg-green-100 text-green-700' },
    'in-progress': { text: '진행 중', color: 'bg-amber-100 text-amber-700' },
    'needs-review': { text: '재검토 필요', color: 'bg-red-100 text-red-700' },
    scheduled: { text: '예정', color: 'bg-blue-100 text-blue-700' }
  };

  const status = statusConfig[schedule.status] || statusConfig.scheduled;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/schedules/${schedule.id}`);
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alert('일정 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        className={`fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* 헤더 */}
          <div className={`${style.bg} text-white p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{style.icon}</span>
                <h2 className="text-2xl font-bold">{style.label}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl leading-none"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">
            {/* 환자 정보 카드 */}
            {schedule.patient && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {schedule.patient.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{schedule.patient.name}</h3>
                    <p className="text-sm text-gray-600">환자 ID: {schedule.patient.patientId || schedule.patient.id}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.patient.age}세 {schedule.patient.gender}
                    </p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                  환자 기록 보기
                </button>
              </div>
            )}

            {/* 일정 상세 정보 */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">일정 정보</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">날짜:</span>{' '}
                  <span className="text-gray-900 font-medium">
                    {formatDateKorean(new Date(schedule.startDateTime))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">시간:</span>{' '}
                  <span className="text-gray-900 font-medium">
                    {startTime} - {endTime} ({durationText})
                  </span>
                </div>
                {schedule.location && (
                  <div>
                    <span className="text-gray-500">장소:</span>{' '}
                    <span className="text-gray-900 font-medium">{schedule.location}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">상태:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>
              </div>
            </div>

            {/* 연결된 케이스 */}
            {schedule.linkedCase && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">연결된 케이스</h3>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                    📸
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      케이스 ID: {schedule.linkedCase.id}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.linkedCase.scanType || 'X-Ray 검사'}
                    </p>
                    {schedule.linkedCase.aiResult && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          AI 결과: {schedule.linkedCase.aiResult}
                        </span>
                        {schedule.linkedCase.aiConfidence && (
                          <span className="ml-2 text-xs text-gray-600">
                            신뢰도: {schedule.linkedCase.aiConfidence}%
                          </span>
                        )}
                      </div>
                    )}
                    <button className="mt-3 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium">
                      케이스 상세보기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 상태 타임라인 */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">상태 타임라인</h3>
              <div className="space-y-3">
                {[
                  { label: '생성됨', date: schedule.createdAt, completed: true },
                  { label: '예약됨', date: schedule.startDateTime, completed: true },
                  { label: '알림 전송', date: null, completed: false },
                  { label: '완료', date: schedule.completedAt, completed: schedule.status === 'completed' }
                ].map((item, idx, array) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        {item.completed && <span className="text-white text-xs">✓</span>}
                      </div>
                      {idx < array.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      {item.date && (
                        <p className="text-xs text-gray-500">
                          {new Date(item.date).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">메모</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {schedule.notes || '메모 없음'}
              </p>
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-2">
            {schedule.status === 'scheduled' && (
              <button
                onClick={() => {
                  onComplete?.();
                  onClose();
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                완료 처리
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onEdit?.();
                  onClose();
                }}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                일정 수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                취소하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">일정 취소 확인</h3>
            <p className="text-gray-700 mb-4">
              정말 이 일정을 취소하시겠습니까?
            </p>
            {schedule.patient && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">환자:</span> {schedule.patient.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">일시:</span>{' '}
                  {formatDateKorean(new Date(schedule.startDateTime))} {startTime}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                아니오
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? '취소 중...' : '예, 취소합니다'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleDetailPanel;

