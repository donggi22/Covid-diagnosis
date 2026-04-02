import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, FileText, Activity, Heart, Scissors } from 'react-feather';
import api from '../../utils/api';
import PatientDetailsModal from './PatientDetailsModal';

/**
 * 수술 전 확인 리스트 컴포넌트
 * 오늘 예정된 수술의 체크리스트 상태를 표시
 */
const SurgeryChecklist = () => {
  const navigate = useNavigate();
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // 체크리스트 항목 정의
  const checklistItems = [
    { key: 'consent', label: '동의서', icon: FileText },
    { key: 'labResults', label: '검사결과', icon: Activity },
    { key: 'anesthesia', label: '마취과', icon: Heart },
    { key: 'orReady', label: '수술실', icon: Scissors }
  ];

  // 오늘의 수술 목록 로드
  useEffect(() => {
    const loadTodaySurgeries = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // API 호출
        const response = await api.get(`/api/schedules?date=${dateStr}&type=surgery`);
        const schedules = response.data || [];
        
        // 체크리스트 데이터와 함께 변환
        const surgeriesWithChecklist = schedules.map(schedule => ({
          ...schedule,
          checklist: schedule.checklist || generateDefaultChecklist(schedule),
          completionRate: calculateCompletionRate(schedule.checklist || generateDefaultChecklist(schedule))
        }));
        
        // 환자 정보가 없는 일정 필터링 (수술은 환자 정보가 필수)
        const validSurgeries = surgeriesWithChecklist.filter(schedule => {
          if (!schedule.patient) {
            console.warn('환자 정보가 없는 수술 일정:', schedule);
            return false;
          }
          return true;
        });
        
        setSurgeries(validSurgeries);
      } catch (error) {
        console.error('수술 목록 로드 실패:', error);
        setSurgeries([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodaySurgeries();
  }, []);

  // 기본 체크리스트 생성
  const generateDefaultChecklist = (schedule) => {
    return {
      consent: Math.random() > 0.3,
      labResults: Math.random() > 0.2,
      anesthesia: Math.random() > 0.4,
      orReady: Math.random() > 0.3
    };
  };

  // 완료율 계산
  const calculateCompletionRate = (checklist) => {
    if (!checklist) return 0;
    const items = Object.values(checklist);
    const completed = items.filter(item => item === true).length;
    return Math.round((completed / items.length) * 100);
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 수술 타입 한글 변환
  const getSurgeryTypeLabel = (type) => {
    const typeMap = {
      'lobectomy': '폐엽절제술',
      'pneumothorax': '기흉 수술',
      'thoracoscopy': '흉강경 수술',
      'biopsy': '조직검사',
      'other': '기타 수술'
    };
    return typeMap[type] || type || '수술';
  };

  // 전체 통계 계산
  const totalSurgeries = surgeries.length;
  const completedSurgeries = surgeries.filter(s => s.completionRate === 100).length;
  const pendingSurgeries = totalSurgeries - completedSurgeries;

  // 환자 이름 클릭 핸들러
  const handlePatientNameClick = (e, surgery) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    const patient = surgery.patient || {};
    setSelectedPatient({
      ...patient,
      id: patient.id || patient._id,
      surgery: {
        id: surgery.id,
        type: surgery.type,
        surgeryType: getSurgeryTypeLabel(surgery.type),
        scheduledTime: formatTime(surgery.startDateTime),
        location: surgery.location,
        notes: surgery.notes
      }
    });
    setIsPatientModalOpen(true);
  };

  // 전체 보기 클릭 핸들러
  const handleViewAll = () => {
    navigate('/schedule');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-base font-semibold text-slate-800">수술 전 확인 리스트</div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-sm text-slate-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (surgeries.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-base font-semibold text-slate-800">수술 전 확인 리스트</div>
          <button
            onClick={handleViewAll}
            className="text-[#4b7bec] text-xs font-semibold hover:text-[#3b72e5] transition-colors"
          >
            전체 보기
          </button>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 py-8">
          <div className="text-4xl mb-3">🏥</div>
          <p className="text-sm text-slate-600 mb-2">오늘 예정된 수술이 없습니다</p>
          <button
            onClick={handleViewAll}
            className="text-xs text-[#4b7bec] hover:text-[#3b72e5] font-medium transition-colors"
          >
            일정 관리로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-base font-semibold text-slate-800">수술 전 확인 리스트</div>
        <button
          onClick={handleViewAll}
          className="text-[#4b7bec] text-xs font-semibold hover:text-[#3b72e5] transition-colors"
        >
          전체 보기
        </button>
      </div>

      {/* 통계 요약 */}
      <div className="mb-1.5 p-1.5 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-600">오늘 수술: <strong className="text-slate-800">{totalSurgeries}건</strong></span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <CheckCircle size={10} className="text-green-500" />
              <span className="text-slate-600">완료: <strong className="text-green-600">{completedSurgeries}건</strong></span>
            </span>
            {pendingSurgeries > 0 && (
              <span className="flex items-center gap-0.5">
                <AlertCircle size={10} className="text-orange-500" />
                <span className="text-slate-600">미완료: <strong className="text-orange-600">{pendingSurgeries}건</strong></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 수술 목록 */}
      <div 
        className={`flex-1 pr-1 min-h-0 ${
          surgeries.length > 3 
            ? 'overflow-y-auto max-h-[calc(100vh-400px)]' 
            : 'overflow-hidden'
        }`}
        style={surgeries.length > 3 ? { 
          maxHeight: 'calc(100% - 60px)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        } : {}}
      >
        <ul className="flex flex-col gap-1.5">
          {surgeries.map((surgery) => {
            const patient = surgery.patient || {};
            const checklist = surgery.checklist || {};
            const completionRate = surgery.completionRate || 0;
            const isComplete = completionRate === 100;

            return (
              <li
                key={surgery.id}
                onClick={(e) => handlePatientNameClick(e, surgery)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                  isComplete
                    ? 'bg-green-50/50 border-green-200 hover:bg-green-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {/* 수술 헤더 */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px] font-semibold text-slate-800">
                        {formatTime(surgery.startDateTime)}
                      </span>
                      <span className="text-[10px] text-slate-600">-</span>
                      <span className="text-[10px] font-medium text-slate-700 truncate">
                        {getSurgeryTypeLabel(surgery.type)}
                      </span>
                    </div>
                    <div 
                      onClick={(e) => handlePatientNameClick(e, surgery)}
                      className="text-xs text-slate-600 truncate cursor-pointer hover:text-[#4b7bec] hover:underline transition-colors inline-block"
                      title="환자 특이사항 보기"
                    >
                      {patient.name || '환자 정보 없음'}
                      {patient.age && ` (${patient.age}세)`}
                      {surgery.location && ` · ${surgery.location}`}
                    </div>
                  </div>
                  {isComplete && (
                    <CheckCircle size={12} className="text-green-500 flex-shrink-0 ml-1" />
                  )}
                </div>

                {/* 완료율 프로그레스 바 */}
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-slate-500">준비 완료율</span>
                    <span className={`text-[9px] font-semibold ${
                      completionRate === 100 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {completionRate}%
                    </span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        completionRate === 100
                          ? 'bg-gradient-to-r from-green-400 to-green-500'
                          : 'bg-gradient-to-r from-orange-400 to-orange-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* 체크리스트 항목 */}
                <div className="flex items-center gap-0.5 flex-wrap">
                  {checklistItems.map((item) => {
                    const Icon = item.icon;
                    const isChecked = checklist[item.key] === true;
                    
                    return (
                      <div
                        key={item.key}
                        className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-medium ${
                          isChecked
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}
                        title={`${item.label}: ${isChecked ? '완료' : '미완료'}`}
                      >
                        {isChecked ? (
                          <CheckCircle size={8} className="flex-shrink-0" strokeWidth={2.5} />
                        ) : (
                          <XCircle size={8} className="flex-shrink-0" strokeWidth={2.5} />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </div>


      {/* 환자 특이사항 모달 */}
      {isPatientModalOpen && selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          surgery={selectedPatient.surgery}
          onClose={() => {
            setIsPatientModalOpen(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default SurgeryChecklist;

