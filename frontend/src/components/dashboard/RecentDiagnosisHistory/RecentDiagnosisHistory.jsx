import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosisAPI } from '../../../utils/api';

const RecentDiagnosisHistory = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentDiagnoses = async () => {
      try {
        setLoading(true);
        const data = await diagnosisAPI.getDiagnoses();
        // 최근 7건만 가져오기 (이미 정렬되어 있음)
        const recent = data.slice(0, 7);
        setDiagnoses(recent);
      } catch (error) {
        console.error('최근 진단 이력 조회 오류:', error);
        setDiagnoses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDiagnoses();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 0 ? '방금 전' : `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '완료':
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '대기':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '확인 필요':
      case 'review_needed':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-400';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      '완료': '완료',
      'confirmed': '완료',
      '대기': '대기',
      'pending': '대기',
      '확인 필요': '확인 필요',
      'review_needed': '확인 필요',
    };
    return statusMap[status] || status || '대기';
  };

  const getConditionText = (condition) => {
    const conditionMap = {
      'Normal': '정상',
      'COVID-19': '코로나19',
      'Lung Opacity': '폐 불투명화',
      'Viral Pneumonia': '바이러스성 폐렴',
      'Pneumonia': '폐렴',
    };
    return conditionMap[condition] || condition;
  };

  const handleRowClick = (diagnosisId) => {
    navigate(`/history?diagnosis=${diagnosisId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-slate-500 dark:text-gray-400 text-sm">로딩 중...</div>
      </div>
    );
  }

  if (diagnoses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-slate-500 dark:text-gray-400 text-sm">최근 진단 이력이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto flex-1 overflow-y-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
          <tr className="text-left text-xs text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-700">
            <th className="px-4 py-2 font-semibold">환자명</th>
            <th className="px-4 py-2 font-semibold">진단일시</th>
            <th className="px-4 py-2 font-semibold">AI 결과</th>
            <th className="px-4 py-2 font-semibold">신뢰도</th>
            <th className="px-4 py-2 font-semibold">상태</th>
          </tr>
        </thead>
        <tbody>
          {diagnoses.map((diagnosis) => {
            const patientName = diagnosis.patientId?.name || '알 수 없음';
            const diagnosisResult = diagnosis.aiAnalysis?.findings?.[0]?.condition || '-';
            const confidence = Math.round((diagnosis.aiAnalysis?.confidence || 0) * 100);
            const status = diagnosis.review?.status || '대기';
            const formattedDate = formatDate(diagnosis.createdAt);

            return (
              <tr
                key={diagnosis._id}
                onClick={() => handleRowClick(diagnosis._id)}
                className="even:bg-slate-50/60 dark:even:bg-gray-700/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors border-b border-slate-100 dark:border-gray-700"
              >
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-gray-300 font-medium">
                  {patientName}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-gray-400">
                  {formattedDate}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-gray-300">
                  <span className="font-medium">
                    {getConditionText(diagnosisResult)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      confidence >= 90
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : confidence >= 70
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {confidence}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                  >
                    {getStatusText(status)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentDiagnosisHistory;

