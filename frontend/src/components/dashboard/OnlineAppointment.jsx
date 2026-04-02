import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Edit2, Trash2, Plus, AlertCircle } from 'react-feather';
import api from '../../utils/api';

/**
 * 온라인 예약 컴포넌트
 * 예약 목록을 표시하고 관리합니다.
 */
const OnlineAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 예약 목록 로드
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/appointments?limit=5&sort=date');
      setAppointments(response.data || []);
    } catch (error) {
      console.error('예약 목록 로드 실패:', error);
      // 개발 환경에서는 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        setAppointments(getSampleAppointments());
      } else {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // 날짜/시간 포맷팅
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day}(${dayOfWeek}) ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // 상태 배지 색상
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // 상태 한글 변환
  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
        return '확정';
      case 'pending':
        return '대기';
      case 'cancelled':
        return '취소';
      default:
        return '알 수 없음';
    }
  };

  // 예약 수정
  const handleEdit = (appointment) => {
    navigate('/schedule', { 
      state: { 
        appointmentId: appointment._id,
        editMode: true 
      } 
    });
  };

  // 예약 삭제
  const handleDelete = async (appointmentId) => {
    if (!window.confirm('정말 이 예약을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/api/appointments/${appointmentId}`);
      loadAppointments();
    } catch (error) {
      console.error('예약 삭제 실패:', error);
      alert('예약 삭제에 실패했습니다.');
    }
  };

  // 전체 보기
  const handleViewAll = () => {
    navigate('/schedule');
  };

  // 새 예약 추가
  const handleAddNew = () => {
    navigate('/schedule', { state: { addNew: true } });
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-slate-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-base text-slate-800 font-semibold">온라인 예약</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNew}
            className="text-[#4b7bec] text-xs font-medium hover:text-[#3b72e5] transition-colors flex items-center gap-1"
          >
            <Plus size={14} />
            추가
          </button>
          <button
            onClick={handleViewAll}
            className="text-[#4b7bec] text-sm font-semibold hover:text-[#3b72e5] transition-colors"
          >
            전체 보기
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <Calendar size={32} className="text-slate-300 mb-2" />
            <div className="text-sm text-slate-500 font-medium">예약이 없습니다</div>
            <button
              onClick={handleAddNew}
              className="mt-3 text-xs text-[#4b7bec] hover:text-[#3b72e5] font-medium"
            >
              새 예약 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appointment) => {
              const patient = appointment.patientId || appointment.patient || {};
              const patientName = patient.name || '알 수 없음';
              const patientAge = patient.age || '-';
              const patientGender = patient.gender === '남성' || patient.gender === 'M' ? '남' : 
                                   patient.gender === '여성' || patient.gender === 'F' ? '여' : '-';
              const doctor = appointment.doctorId || appointment.doctor || {};
              const doctorName = doctor.name || '담당의 미지정';

              return (
                <div
                  key={appointment._id || appointment.id}
                  className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* 왼쪽: 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {patientName}
                        </span>
                        {patientAge !== '-' && (
                          <span className="text-xs text-slate-500">({patientAge}세, {patientGender})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600">
                          {formatDateTime(appointment.appointmentDate || appointment.startDateTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{doctorName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getStatusColor(appointment.status || 'pending')}`}>
                          {getStatusLabel(appointment.status || 'pending')}
                        </span>
                      </div>
                    </div>

                    {/* 오른쪽: 액션 버튼 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="p-1.5 text-slate-400 hover:text-[#4b7bec] hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id || appointment.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// 개발 환경용 샘플 데이터
const getSampleAppointments = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: 'apt-1',
      _id: 'apt-1',
      patientId: {
        name: '김서연',
        age: 65,
        gender: '여성'
      },
      doctorId: {
        name: 'Dr. Lee'
      },
      appointmentDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 30).toISOString(),
      status: 'confirmed'
    },
    {
      id: 'apt-2',
      _id: 'apt-2',
      patientId: {
        name: '이민수',
        age: 58,
        gender: '남성'
      },
      doctorId: {
        name: 'Dr. Gregory'
      },
      appointmentDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0).toISOString(),
      status: 'pending'
    },
    {
      id: 'apt-3',
      _id: 'apt-3',
      patientId: {
        name: '박지영',
        age: 72,
        gender: '여성'
      },
      doctorId: {
        name: 'Dr. Bernard'
      },
      appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0).toISOString(),
      status: 'confirmed'
    },
    {
      id: 'apt-4',
      _id: 'apt-4',
      patientId: {
        name: '최동욱',
        age: 45,
        gender: '남성'
      },
      doctorId: {
        name: 'Dr. Mitchell'
      },
      appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 30).toISOString(),
      status: 'pending'
    },
    {
      id: 'apt-5',
      _id: 'apt-5',
      patientId: {
        name: '정수진',
        age: 52,
        gender: '여성'
      },
      doctorId: {
        name: 'Dr. Randall'
      },
      appointmentDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 9, 0).toISOString(),
      status: 'confirmed'
    }
  ];
};

export default OnlineAppointment;

