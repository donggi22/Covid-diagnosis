import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TimelineView from '../components/schedule/TimelineView';
import ScheduleDetailPanel from '../components/schedule/ScheduleDetailPanel';
import AddScheduleModal from '../components/schedule/AddScheduleModal';
import UpcomingEvents from '../components/schedule/UpcomingEvents';
import DateNavigator from '../components/schedule/DateNavigator';
import { MiniCalendar } from '../components/schedule/MiniCalendar';
import MainLayout from '../components/layout/MainLayout';
import { formatDateKorean } from '../utils/timeCalculations';
import api from '../utils/api';
import './TimelineSchedule.css';

/**
 * 타임라인 일정 관리 메인 페이지
 */
const TimelineSchedule = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get('date');
  
  // URL 파라미터에서 날짜 가져오기
  const getInitialDate = () => {
    if (dateParam) {
      // YYYY-MM-DD 형식을 로컬 시간대 기준으로 파싱
      const [year, month, day] = dateParam.split('-').map(Number);
      if (year && month && day) {
        // 로컬 시간대 기준으로 날짜 생성 (시간 00:00:00)
        const parsedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    return new Date();
  };

  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [schedules, setSchedules] = useState([]);
  const [monthSchedules, setMonthSchedules] = useState([]); // 월 전체 일정 (캘린더 표시용)
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);

  // 컴포넌트 import/export 문제가 있을 때도 앱이 전체 크래시 나지 않도록 방어용 래퍼
  const resolveComponent = (name, raw) => {
    const comp = raw && raw.default ? raw.default : raw;
    const isValid =
      typeof comp === 'function' ||
      (typeof comp === 'object' && comp && (comp.$$typeof || comp.render));

    if (!isValid) {
      console.error(`[TimelineSchedule] Invalid component "${name}"`, { raw, resolved: comp, type: typeof comp });
      // 문제 있을 때는 단순한 div로 대체해서 전체 페이지가 터지지 않도록 처리
      // 눈에 보이도록 경고 메시지를 렌더링
      // eslint-disable-next-line react/display-name
      return () => (
        <div style={{ padding: '16px', color: 'red', backgroundColor: '#fee2e2', borderRadius: 8 }}>
          {name} 컴포넌트를 불러오는 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.
        </div>
      );
    }

    return comp;
  };

  const ResolvedMainLayout = resolveComponent('MainLayout', MainLayout);
  const ResolvedTimelineView = resolveComponent('TimelineView', TimelineView);
  const ResolvedScheduleDetailPanel = resolveComponent('ScheduleDetailPanel', ScheduleDetailPanel);
  const ResolvedAddScheduleModal = resolveComponent('AddScheduleModal', AddScheduleModal);
  const ResolvedUpcomingEvents = resolveComponent('UpcomingEvents', UpcomingEvents);
  const ResolvedDateNavigator = resolveComponent('DateNavigator', DateNavigator);

  // 현재 날짜의 일정만 필터링
  const currentDateSchedules = useMemo(() => {
    if (!currentDate) return [];
    
    // 현재 날짜의 시작과 끝 시간 설정 (로컬 시간대 기준)
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    // 현재 날짜 문자열 생성 (YYYY-MM-DD)
    const currentDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    
    return schedules.filter((schedule) => {
      if (!schedule.startDateTime) return false;
      
      // ISO 문자열에서 날짜 부분만 추출 (YYYY-MM-DD)
      const scheduleDateStr = schedule.startDateTime.split('T')[0];
      
      // 날짜 문자열로 비교 (타임존 문제 방지)
      return scheduleDateStr === currentDateStr;
    });
  }, [schedules, currentDate]);

  // 일정 로드 (특정 날짜)
  const loadSchedules = async (targetDate = currentDate) => {
    try {
      setLoading(true);
      // 로컬 시간대를 유지하면서 날짜 문자열 생성
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const response = await api.get(`/api/schedules?date=${dateStr}`);
      setSchedules(response.data || []);
    } catch (error) {
      console.error('일정 로드 실패:', error);
      // 개발 환경에서는 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        setSchedules(getSampleSchedules(targetDate));
      } else {
        setSchedules([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 월 전체 일정 로드 (캘린더 표시용)
  const loadMonthSchedules = async (targetDate = currentDate) => {
    try {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      
      // 해당 월의 첫날과 마지막날 계산
      const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      // 날짜 문자열 생성
      const startYear = firstDay.getFullYear();
      const startMonth = String(firstDay.getMonth() + 1).padStart(2, '0');
      const startDay = String(firstDay.getDate()).padStart(2, '0');
      const startDateStr = `${startYear}-${startMonth}-${startDay}`;
      
      const endYear = lastDay.getFullYear();
      const endMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
      const endDay = String(lastDay.getDate()).padStart(2, '0');
      const endDateStr = `${endYear}-${endMonth}-${endDay}`;
      
      const response = await api.get(`/api/schedules?startDate=${startDateStr}&endDate=${endDateStr}`);
      setMonthSchedules(response.data || []);
    } catch (error) {
      console.error('월 일정 로드 실패:', error);
      // 개발 환경에서는 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        setMonthSchedules(getSampleSchedules(targetDate));
      } else {
        setMonthSchedules([]);
      }
    }
  };

  // 다가오는 일정 로드
  const loadUpcomingSchedules = async () => {
    try {
      const response = await api.get('/api/schedules/upcoming?days=7');
      setUpcomingSchedules(response.data || []);
    } catch (error) {
      console.error('다가오는 일정 로드 실패:', error);
      // 개발 환경에서는 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        setUpcomingSchedules(getSampleUpcomingSchedules());
      } else {
        setUpcomingSchedules([]);
      }
    }
  };

  // 컴포넌트 마운트 시 URL에 날짜가 없거나 오늘 날짜가 아니면 오늘 날짜로 설정
  useEffect(() => {
    const today = new Date();
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayYear = normalizedToday.getFullYear();
    const todayMonth = String(normalizedToday.getMonth() + 1).padStart(2, '0');
    const todayDay = String(normalizedToday.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
    
    // URL 파라미터가 없거나 오늘 날짜가 아니면 오늘 날짜로 설정
    if (!dateParam || dateParam !== todayStr) {
      setSearchParams({ date: todayStr }, { replace: true });
      setCurrentDate(normalizedToday);
    }
  }, []);

  // URL 파라미터 변경 시 날짜 업데이트
  useEffect(() => {
    if (dateParam) {
      // 날짜 문자열을 파싱 (YYYY-MM-DD 형식)
      const [year, month, day] = dateParam.split('-').map(Number);
      if (year && month && day) {
        // 로컬 시간대 기준으로 날짜 생성 (시간 00:00:00)
        const parsedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        
        if (!isNaN(parsedDate.getTime())) {
          // 현재 날짜와 비교 (날짜만)
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          const currentDay = currentDate.getDate();
          
          if (
            parsedDate.getFullYear() !== currentYear ||
            parsedDate.getMonth() !== currentMonth ||
            parsedDate.getDate() !== currentDay
          ) {
            setCurrentDate(parsedDate);
          }
        }
      }
    }
  }, [dateParam]);

  // currentDate 변경 시 일정 로드
  useEffect(() => {
    if (currentDate) {
      loadSchedules(currentDate);
      loadMonthSchedules(currentDate); // 월 전체 일정도 함께 로드
    }
  }, [currentDate]);

  useEffect(() => {
    loadUpcomingSchedules();
    // 초기 마운트 시 월 일정 로드
    if (currentDate) {
      loadMonthSchedules(currentDate);
    }
  }, []);

  // 일정 클릭 핸들러
  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDetailPanelOpen(true);
  };

  // 빈 슬롯 클릭 핸들러
  const handleEmptySlotClick = (time) => {
    setSelectedTime(time);
    setIsAddModalOpen(true);
  };

  // 일정 추가 성공 핸들러
  const handleAddSuccess = () => {
    loadSchedules();
    loadMonthSchedules(); // 월 일정도 새로고침
    loadUpcomingSchedules();
  };

  // 일정 수정 핸들러
  const handleEdit = () => {
    setIsAddModalOpen(true);
    // TODO: 수정 모드로 전환
  };

  // 일정 삭제 핸들러
  const handleDelete = () => {
    loadSchedules();
    loadMonthSchedules(); // 월 일정도 새로고침
    loadUpcomingSchedules();
  };

  // 일정 완료 핸들러
  const handleComplete = async () => {
    try {
      await api.put(`/api/schedules/${selectedSchedule.id}`, {
        ...selectedSchedule,
        status: 'completed'
      });
      loadSchedules();
      loadMonthSchedules(); // 월 일정도 새로고침
      loadUpcomingSchedules();
    } catch (error) {
      console.error('일정 완료 처리 실패:', error);
    }
  };

  // 다가오는 일정 클릭 핸들러
  const handleUpcomingEventClick = (event) => {
    const eventDate = new Date(event.startDateTime);
    // 날짜만 추출하고 시간을 00:00:00으로 설정
    const normalizedDate = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      0, 0, 0, 0
    );
    // 로컬 시간대를 유지하면서 날짜 문자열 생성
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const day = String(normalizedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setSearchParams({ date: dateStr });
    setCurrentDate(normalizedDate);
    setSelectedSchedule(event);
    setIsDetailPanelOpen(true);
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date) => {
    // 날짜만 추출하고 시간을 00:00:00으로 설정 (로컬 시간대 기준)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    // 로컬 시간대를 유지하면서 날짜 문자열 생성 (UTC 변환 방지)
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const day = String(normalizedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setSearchParams({ date: dateStr });
    setCurrentDate(normalizedDate);
  };

  // 오늘로 이동
  const handleTodayClick = () => {
    const today = new Date();
    const normalizedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    // 로컬 시간대를 유지하면서 날짜 문자열 생성
    const year = normalizedDate.getFullYear();
    const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const day = String(normalizedDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    setSearchParams({ date: todayStr });
    setCurrentDate(normalizedDate);
  };

  return (
    <ResolvedMainLayout>
      <div className="schedule-management-content">
        <div className="container">
          {/* 상단 헤더 */}
          <div className="management-tools">
            <ResolvedDateNavigator
              currentDate={currentDate}
              onDateChange={handleDateSelect}
              onTodayClick={handleTodayClick}
            />
          </div>

          {/* 메인 콘텐츠 */}
          <div className="schedule-grid">
            {/* 왼쪽: 타임라인 뷰 */}
            <div className="schedule-main">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">일정을 불러오는 중...</p>
                </div>
              ) : (
                <ResolvedTimelineView
                  schedules={currentDateSchedules}
                  onScheduleClick={handleScheduleClick}
                  onEmptySlotClick={handleEmptySlotClick}
                  hourHeight={80}
                />
              )}
            </div>

            {/* 오른쪽: 미니 캘린더 및 다가오는 일정 */}
            <div className="schedule-sidebar">
              <MiniCalendar
                currentDate={currentDate}
                schedules={monthSchedules}
                onDateSelect={handleDateSelect}
                onAddClick={() => {
                  setSelectedTime(null);
                  setIsAddModalOpen(true);
                }}
              />
              <ResolvedUpcomingEvents
                events={upcomingSchedules}
                onEventClick={handleUpcomingEventClick}
                onAddClick={() => setIsAddModalOpen(true)}
              />
            </div>
          </div>

          {/* 모달 및 패널 */}
          <ResolvedAddScheduleModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setSelectedTime(null);
            }}
            onSuccess={handleAddSuccess}
            selectedDate={currentDate}
            selectedTime={selectedTime}
          />

          <ResolvedScheduleDetailPanel
            schedule={selectedSchedule}
            isOpen={isDetailPanelOpen}
            onClose={() => {
              setIsDetailPanelOpen(false);
              setSelectedSchedule(null);
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </ResolvedMainLayout>
  );
};

// 개발용 샘플 데이터
function getSampleSchedules(targetDate = new Date()) {
  const selectedDate = new Date(targetDate);
  return [
    {
      id: '1',
      type: 'surgery',
      patient: {
        id: 'pt001',
        patientId: 'PT-1102',
        name: '김서연',
        age: 42,
        gender: '여성'
      },
      startDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0).toISOString(),
      endDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 11, 0).toISOString(),
      location: '수술실 1',
      status: 'scheduled',
      statusText: '예정',
      priority: 'high',
      notes: '환자 금식 확인 완료'
    },
    {
      id: '2',
      type: 'appointment',
      patient: {
        id: 'pt002',
        patientId: 'PT-1047',
        name: '조아람',
        age: 68,
        gender: '남성'
      },
      startDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 14, 0).toISOString(),
      endDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 15, 0).toISOString(),
      location: '진료실 A',
      status: 'scheduled',
      statusText: '예정',
      priority: 'medium',
      notes: ''
    },
    {
      id: '3',
      type: 'xray',
      patient: null,
      startDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 30).toISOString(),
      endDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 11, 0).toISOString(),
      location: '',
      status: 'completed',
      statusText: '흉부 X-Ray 검토 완료',
      priority: 'medium',
      linkedCase: {
        id: 'case123',
        scanType: '흉부 X-Ray - PA View',
        aiResult: '정상',
        aiConfidence: 94.2,
        reviewed: true
      },
      notes: '',
      createdAt: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7, 8, 0).toISOString()
    }
  ];
}

function getSampleUpcomingSchedules() {
  const today = new Date();
  const schedules = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    schedules.push({
      id: `upcoming-${i}`,
      type: i % 3 === 0 ? 'surgery' : i % 3 === 1 ? 'appointment' : 'xray',
      patient: {
        id: `pt${i}`,
        patientId: `PT-${1000 + i}`,
        name: `환자${i + 1}`,
        age: 50 + i,
        gender: i % 2 === 0 ? '남성' : '여성'
      },
      startDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9 + i, 0).toISOString(),
      endDateTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10 + i, 0).toISOString(),
      status: 'scheduled',
      statusText: '예정',
      priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
    });
  }
  
  return schedules;
}

export default TimelineSchedule;

