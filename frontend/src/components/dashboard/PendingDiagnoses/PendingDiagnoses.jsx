import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosisAPI } from '../../../utils/api';

const PendingDiagnoses = () => {
  const [pendingDiagnoses, setPendingDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingDiagnoses = async () => {
      try {
        setLoading(true);
        const data = await diagnosisAPI.getDiagnoses();
        // 대기 중인 진단만 필터링 (상태가 '대기' 또는 'pending'인 것들)
        const pending = data
          .filter(d => {
            const status = d.review?.status || '대기';
            return status === '대기' || status === 'pending' || !status;
          })
          .slice(0, 5); // 최대 5개만 표시
        setPendingDiagnoses(pending);
      } catch (error) {
        console.error('대기 중인 진단 조회 오류:', error);
        setPendingDiagnoses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDiagnoses();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 0 ? '방금 전' : `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}일 전`;
    }
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

  const getUrgencyIcon = (confidence, condition) => {
    const conf = Math.round((confidence || 0) * 100);
    // 신뢰도가 낮거나 COVID/Lung Opacity인 경우 긴급
    if (conf < 70 || condition === 'COVID-19' || condition === 'Lung Opacity') {
      return '🔴';
    } else if (conf < 85) {
      return '🟡';
    }
    return '🟢';
  };

  const handleItemClick = (diagnosisId) => {
    navigate(`/history?diagnosis=${diagnosisId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-slate-500 text-xs">로딩 중...</div>
      </div>
    );
  }

  if (pendingDiagnoses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-slate-500 text-xs">대기 중인 진단이 없습니다.</div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
      {pendingDiagnoses.map((diagnosis) => {
        const patientName = diagnosis.patientId?.name || '알 수 없음';
        const diagnosisResult = diagnosis.aiAnalysis?.findings?.[0]?.condition || '-';
        const confidence = Math.round((diagnosis.aiAnalysis?.confidence || 0) * 100);
        const formattedDate = formatDate(diagnosis.createdAt);
        const urgencyIcon = getUrgencyIcon(diagnosis.aiAnalysis?.confidence, diagnosisResult);

        return (
          <li
            key={diagnosis._id}
            onClick={() => handleItemClick(diagnosis._id)}
            className="flex items-start gap-1.5 p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #5b8def22, #86a8ff22)' }}>
              <span className="text-xs">{urgencyIcon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 truncate">
                {patientName} - {getConditionText(diagnosisResult)}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[9px] text-slate-400">{formattedDate}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                  confidence >= 90
                    ? 'bg-green-100 text-green-700'
                    : confidence >= 70
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {confidence}%
                </span>
              </div>
            </div>
            <button 
              className="text-slate-400 text-xs hover:text-slate-600 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(diagnosis._id);
              }}
            >
              ⋮
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default PendingDiagnoses;

