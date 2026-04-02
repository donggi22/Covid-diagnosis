import React, { useState, useEffect } from 'react';
import { diagnosisAPI } from '../../../utils/api';

const ReviewStatusSummary = () => {
  const [statusStats, setStatusStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    reviewNeeded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusStats = async () => {
      try {
        setLoading(true);
        const data = await diagnosisAPI.getDiagnoses();
        
        const stats = {
          total: data.length,
          pending: 0,
          completed: 0,
          reviewNeeded: 0,
        };

        data.forEach(diagnosis => {
          const status = diagnosis.review?.status || 'pending';
          // 백엔드 상태 값: 'pending', 'approved', 'rejected'
          if (status === 'approved') {
            stats.completed++;
          } else if (status === 'rejected') {
            stats.reviewNeeded++;
          } else {
            // 'pending' 또는 기타 상태
            stats.pending++;
          }
        });

        setStatusStats(stats);
      } catch (error) {
        console.error('검토 상태 통계 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusStats();
  }, []);

  const getPercentage = (count) => {
    if (statusStats.total === 0) return 0;
    return Math.round((count / statusStats.total) * 100);
  };

  const statusItems = [
    {
      label: '대기 중',
      count: statusStats.pending,
      percentage: getPercentage(statusStats.pending),
      color: 'bg-yellow-100 text-yellow-700',
      barColor: 'bg-yellow-500',
    },
    {
      label: '검토 완료',
      count: statusStats.completed,
      percentage: getPercentage(statusStats.completed),
      color: 'bg-green-100 text-green-700',
      barColor: 'bg-green-500',
    },
    {
      label: '확인 필요',
      count: statusStats.reviewNeeded,
      percentage: getPercentage(statusStats.reviewNeeded),
      color: 'bg-orange-100 text-orange-700',
      barColor: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-slate-500 text-xs">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 총 진단 수 표시 */}
      <div className="text-center py-2 border-b border-slate-200">
        <div className="text-2xl font-bold text-slate-800">{statusStats.total}</div>
        <div className="text-xs text-slate-500 mt-0.5">총 진단 건수</div>
      </div>

      {/* 상태별 통계 */}
      <ul className="flex flex-col gap-3 flex-1">
        {statusItems.map((item) => (
          <li key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{item.count}건</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.color}`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewStatusSummary;

