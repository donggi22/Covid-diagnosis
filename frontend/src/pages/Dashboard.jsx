import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Users, Activity, FileText, User, Book, Heart, UserCheck, Package, Calendar } from 'react-feather';
import PatientManagement from '../components/PatientManagement';
import MainLayout from '../components/layout/MainLayout';
import DiagnosisDonutChart from '../components/dashboard/DiagnosisDonutChart';
import SurgeryChecklist from '../components/dashboard/SurgeryChecklist';
import UpcomingEvents from '../components/schedule/UpcomingEvents';
import RecentDiagnosisHistory from '../components/dashboard/RecentDiagnosisHistory/RecentDiagnosisHistory';
import ReviewStatusSummary from '../components/dashboard/ReviewStatusSummary/ReviewStatusSummary';
import api from '../utils/api';

// 아래 Tailwind 버전은 단일 파일로 동작하도록 구성되었습니다.
// 필요하면 각 컴포넌트를 components/로 분리하세요.

const Card = ({ className = '', children, style }) => (
  <div className={`bg-white rounded-[14px] shadow-[0_8px_30px_rgba(16,24,40,0.08)] ${className}`} style={style}>{children}</div>
);

const StatCard = ({ IconComponent, title, value, sub }) => (
  <Card className="p-5 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
         style={{ background: 'linear-gradient(135deg, #5b8def, #86a8ff)' }}>
      <IconComponent size={20} strokeWidth={2} />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <div className="text-xl font-semibold leading-6">{value}</div>
      {sub ? <div className="text-xs text-gray-400 mt-0.5">{sub}</div> : null}
    </div>
  </Card>
);


const SuccessItem = ({ label, value }) => (
  <li className="grid grid-cols-[1fr_auto] items-center gap-3">
    <span className="text-sm text-slate-500">{label}</span>
    <div className="flex items-center gap-2 w-52">
      <div className="h-2 w-40 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full"
             style={{ width: `${value}%`, background: 'linear-gradient(90deg, #63a3ff, #4b7bec)' }} />
      </div>
      <span className="text-xs text-slate-500">{value}%</span>
    </div>
  </li>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const middleSectionRef = useRef(null);
  const onlineBookingRef = useRef(null);
  const mainContentRef = useRef(null);
  const [sidebarHeight, setSidebarHeight] = useState('auto');
  const [bottomBoxHeight, setBottomBoxHeight] = useState('auto');
  const [currentView, setCurrentView] = useState('dashboard');
  const [monthSchedules, setMonthSchedules] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  useEffect(() => {
    const updateSidebarHeight = () => {
      if (middleSectionRef.current) {
        // 상단 섹션과 중간 섹션의 높이 합계 계산 (병원 출생 박스까지)
        const mainContent = middleSectionRef.current.closest('main');
        if (mainContent) {
          const sections = mainContent.querySelectorAll('section');
          let totalHeight = 0;
          // 상단 섹션 (통계 카드) + 중간 섹션 (병원 출생 박스 포함)
          if (sections.length >= 2) {
            totalHeight = sections[0].offsetHeight + sections[1].offsetHeight;
            // 섹션 간 gap (gap-6 = 1.5rem = 24px)
            totalHeight += 24;
          }
          setSidebarHeight(`${totalHeight}px`);
        }
      }
    };

    // DOM이 완전히 렌더링된 후 높이 계산
    const timer = setTimeout(() => {
      updateSidebarHeight();
    }, 100);

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', updateSidebarHeight);

    // MutationObserver로 DOM 변경 감지
    const observer = new MutationObserver(() => {
      setTimeout(updateSidebarHeight, 50);
    });
    
    if (middleSectionRef.current) {
      observer.observe(middleSectionRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // 메인 콘텐츠의 상단/중간 섹션 관찰
    const mainContent = middleSectionRef.current?.closest('main');
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSidebarHeight);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const updateBottomBoxHeight = () => {
      if (onlineBookingRef.current) {
        const bookingHeight = onlineBookingRef.current.offsetHeight;
        setBottomBoxHeight(`${bookingHeight}px`);
      }
    };

    const timer = setTimeout(() => {
      updateBottomBoxHeight();
    }, 100);

    window.addEventListener('resize', updateBottomBoxHeight);

    const observer = new MutationObserver(() => {
      setTimeout(updateBottomBoxHeight, 50);
    });
    
    if (onlineBookingRef.current) {
      observer.observe(onlineBookingRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateBottomBoxHeight);
      observer.disconnect();
    };
  }, []);

  const stats = [
    { IconComponent: Heart, title: '의사', value: '2,937', sub: '이번 주 의사 3명 합류' },
    { IconComponent: UserCheck, title: '직원', value: '5,453', sub: '휴가 중인 직원 8명' },
    { IconComponent: Users, title: '환자', value: '170K', sub: '신규 입원 환자 175명' },
    { IconComponent: Package, title: '약국', value: '21', sub: '재고 약품 85k개' }
  ];
  const success = [
    ['Anesthetics', 83], ['Gynecology', 95], ['Nerology', 100],
    ['Oncology', 89], ['Orthopedics', 97], ['Physiotherapy', 100]
  ];

  // 샘플 일정 데이터 (개발용)
  const getSampleMonthSchedules = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
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
        startDateTime: new Date(year, month, 17, 9, 0).toISOString(),
        endDateTime: new Date(year, month, 17, 11, 0).toISOString(),
        location: '수술실 1'
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
        startDateTime: new Date(year, month, 17, 14, 0).toISOString(),
        endDateTime: new Date(year, month, 17, 15, 0).toISOString(),
        location: '진료실 A'
      },
      {
        id: '3',
        type: 'xray',
        startDateTime: new Date(year, month, 20, 10, 30).toISOString(),
        endDateTime: new Date(year, month, 20, 11, 0).toISOString()
      },
      {
        id: '4',
        type: 'appointment',
        patient: {
          id: 'pt003',
          patientId: 'PT-1050',
          name: '이민수',
          age: 55,
          gender: '남성'
        },
        startDateTime: new Date(year, month, 22, 9, 0).toISOString(),
        endDateTime: new Date(year, month, 22, 10, 0).toISOString(),
        location: '진료실 B'
      },
      {
        id: '5',
        type: 'surgery',
        patient: {
          id: 'pt004',
          patientId: 'PT-1080',
          name: '박지영',
          age: 38,
          gender: '여성'
        },
        startDateTime: new Date(year, month, 25, 14, 0).toISOString(),
        endDateTime: new Date(year, month, 25, 16, 0).toISOString(),
        location: '수술실 2'
      }
    ];
  };

  // 현재 월의 일정 로드
  const loadMonthSchedules = async (viewDate = calendarViewDate) => {
    try {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // API 호출 시도
      try {
        const response = await api.get(`/api/schedules?startDate=${firstDay.toISOString().split('T')[0]}&endDate=${lastDay.toISOString().split('T')[0]}`);
        setMonthSchedules(response.data || []);
      } catch (e) {
        // startDate/endDate가 안되면 월의 대표 날짜로 시도
        const midDate = new Date(year, month, 15);
        const dateStr = midDate.toISOString().split('T')[0];
        const response = await api.get(`/api/schedules?date=${dateStr}`);
        setMonthSchedules(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('월별 일정 로드 실패:', error);
      // 개발 환경에서는 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        setMonthSchedules(getSampleMonthSchedules());
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
        setUpcomingSchedules(schedules);
      } else {
        setUpcomingSchedules([]);
      }
    }
  };

  // 페이지 포커스 및 라우트 변경 시 일정 다시 로드
  useEffect(() => {
    loadMonthSchedules();
    loadUpcomingSchedules();
    
    const handleFocus = () => {
      loadMonthSchedules();
      loadUpcomingSchedules();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 캘린더 월 변경 시 일정 다시 로드
  useEffect(() => {
    loadMonthSchedules(calendarViewDate);
  }, [calendarViewDate]);

  // 로그인 상태 감지 및 업데이트
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };

    // 초기 상태 확인
    checkLoginStatus();

    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    window.addEventListener('storage', checkLoginStatus);

    // 주기적으로 확인 (같은 탭에서 로그인/로그아웃 시)
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  // 대시보드로 돌아왔을 때 일정 새로고침 및 currentView 초기화
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      loadMonthSchedules();
      loadUpcomingSchedules();
      setCurrentView('dashboard');
    }
  }, [location.pathname]);

  // 특정 날짜의 일정 가져오기
  const getSchedulesForDate = (year, month, day) => {
    // 로컬 시간대 기준으로 날짜 문자열 생성 (YYYY-MM-DD)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return monthSchedules.filter((schedule) => {
      if (!schedule.startDateTime) return false;
      // ISO 문자열에서 날짜 부분만 직접 추출 (타임존 문제 방지)
      const scheduleDateStr = schedule.startDateTime.split('T')[0];
      return scheduleDateStr === dateStr;
    });
  };

  // 특정 날짜의 일정 타입들 가져오기
  const getScheduleTypesForDate = (year, month, day) => {
    // 로컬 시간대 기준으로 날짜 문자열 생성 (YYYY-MM-DD)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return monthSchedules
      .filter((schedule) => {
        if (!schedule.startDateTime) return false;
        // ISO 문자열에서 날짜 부분만 직접 추출 (타임존 문제 방지)
        const scheduleDateStr = schedule.startDateTime.split('T')[0];
        return scheduleDateStr === dateStr;
      })
      .map((schedule) => schedule.type);
  };

  // 캘린더 날짜 클릭 핸들러
  const handleCalendarDateClick = (day, isOther, baseDate = new Date(), event) => {
    if (isOther) return; // 다른 달 날짜는 클릭 불가
    
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const selectedDate = new Date(year, month, day);
    const dateString = selectedDate.toISOString().split('T')[0];
    
    // 바로 일정 관리 페이지로 이동 (사이드바 유지)
    navigate(`/schedule?date=${dateString}`);
  };

  // 간단 캘린더(현재 월) 생성 유틸
  const buildMonthMatrix = (baseDate = new Date()) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth(); // 0-11
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const firstDay = first.getDay(); // 0(Sun)~6(Sat)
    const totalDays = last.getDate(); // 이번 달 일수
    const prevLast = new Date(year, month, 0).getDate(); // 이전 달 마지막 일
    const cells = [];

    // 앞쪽: 이전 달 날짜 채우기
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: prevLast - (firstDay - 1 - i), other: true });
    }

    // 이번 달 날짜 채우기
    for (let d = 1; d <= totalDays; d++) {
      const now = new Date();
      const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      const scheduleTypes = getScheduleTypesForDate(year, month, d);
      cells.push({ day: d, other: false, today: isToday, scheduleTypes });
    }

    // 뒤쪽: 다음 달 날짜 채우기 (주 단위 완성)
    const totalFilled = cells.length;
    const remainder = totalFilled % 7;
    const trailingCount = remainder === 0 ? 0 : 7 - remainder;
    for (let i = 1; i <= trailingCount; i++) {
      cells.push({ day: i, other: true });
    }

    // 6행(42칸) 보장 – 필요 시 다음 달 추가 채우기
    while (cells.length < 42) {
      const nextIndex = cells.length - (firstDay + totalDays) + 1 + trailingCount;
      cells.push({ day: nextIndex, other: true });
    }
    return cells;
  };
  const monthCells = buildMonthMatrix(calendarViewDate);
  const monthLabel = `${calendarViewDate.getFullYear()}년 ${calendarViewDate.getMonth() + 1}월`;

  const handlePreviousMonth = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    setCalendarViewDate(new Date());
  };

  // 커스텀 사이드바 컴포넌트
  const customSidebar = (
    <aside className="self-start" ref={sidebarRef} style={{ height: sidebarHeight, maxHeight: sidebarHeight, minHeight: '400px' }}>
      <Card className="p-4 flex flex-col overflow-hidden" style={{ minHeight: '400px' }}>
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto justify-center">
                {[
                  [Layout, '대시보드', 'dashboard'],
                  [Users, '환자관리', 'patients'],
                  [Activity, 'AI 진단', 'diagnosis'],
                  [FileText, '진단 이력', 'history'],
                  [Calendar, '일정 관리', 'schedule'],
                  [User, '마이페이지', 'mypage'],
                  // [Book, '가이드', 'guide']
                ].map(([IconComponent, label, view]) => {
                  const isActive = currentView === view;
                  return (
                    <button 
                      key={label}
                      onClick={() => {
                        if (view === 'dashboard') {
                          setCurrentView('dashboard');
                        } else if (view === 'patients') {
                          setCurrentView('patients');
                        } else {
                          // 다른 페이지는 기존처럼 라우팅
                          const pathMap = {
                            'diagnosis': '/diagnosis',
                            'history': '/history',
                            'schedule': '/schedule',
                            'mypage': '/mypage',
                            'guide': '/guide'
                          };
                          navigate(pathMap[view] || '/dashboard');
                        }
                      }}
                      className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-[#3b82f6] text-white' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}>
                      <IconComponent 
                        size={18} 
                        className="mr-3"
                        strokeWidth={2}
                        color={isActive ? '#ffffff' : '#475569'}
                      />
                      <span>{label}</span>
                    </button>
                  );
                })}
        </nav>
      </Card>
      <Card className="p-4 mt-6 flex flex-col overflow-hidden" style={currentView === 'patients' ? { minHeight: '150px' } : { height: bottomBoxHeight, minHeight: bottomBoxHeight }}>
        <div className="text-slate-800 dark:text-gray-200 font-semibold mb-4">
          {currentView === 'patients' ? '추가 정보' : '진단 목록'}
        </div>
        {currentView === 'patients' ? (
          <div className="text-sm text-slate-600 dark:text-gray-400 flex-1">
            {/* 여기에 내용 추가 가능 */}
          </div>
        ) : (
          <ReviewStatusSummary />
        )}
      </Card>
    </aside>
  );

  return (
    <>
      <MainLayout
        customSidebar={customSidebar}
        mainContentRef={mainContentRef}
        onLogoClick={() => setCurrentView('dashboard')}
      >
        <>
          {currentView === 'dashboard' && (
            <section className="grid grid-cols-1 xl:grid-cols-[2fr_2fr_2fr] gap-4 items-stretch" ref={middleSectionRef} style={{ minHeight: '416px' }}>
            <Card className="p-3 h-full flex flex-col" style={{ minHeight: '416px' }}>
              <h2 className="text-base font-semibold mb-1.5">진단 분류 분포</h2>
              <div className="flex-1">
                <DiagnosisDonutChart />
              </div>
            </Card>
            <Card className="p-3 h-full flex flex-col" style={{ minHeight: '416px' }}>
              <SurgeryChecklist />
            </Card>
            <Card className="p-3 h-full flex flex-col overflow-hidden" style={{ minHeight: '416px' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="text-base font-semibold text-slate-800">캘린더</div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePreviousMonth}
                    className="text-slate-500 hover:text-slate-700 text-xs px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
                    aria-label="이전 달"
                  >
                    ‹
                  </button>
                  <div className="text-[10px] text-slate-500 font-medium min-w-[65px] text-center">{monthLabel}</div>
                  <button
                    onClick={handleNextMonth}
                    className="text-slate-500 hover:text-slate-700 text-xs px-1 py-0.5 rounded hover:bg-slate-100 transition-colors"
                    aria-label="다음 달"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="flex flex-col flex-1 min-h-0">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 text-center mb-0.5">
                  {['일','월','화','수','목','금','토'].map((d, idx) => (
                    <div 
                      key={d} 
                      className={`py-0.5 text-[9px] font-semibold ${
                        idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-500'
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {/* 날짜 그리드 - 스크롤 가능하게 */}
                <div className="grid grid-cols-7 gap-[2px] flex-1 overflow-y-auto pr-1">
                  {monthCells.map((c, idx) => {
                    // 일정 타입별 색상
                    const typeColors = {
                      surgery: 'bg-red-500',
                      appointment: 'bg-blue-500',
                      xray: 'bg-teal-500'
                    };
                    
                    const typeLabels = {
                      surgery: '수술',
                      appointment: '진료',
                      xray: 'X-Ray'
                    };
                    
                    // 고유한 일정 타입들만 가져오기
                    const uniqueTypes = c.scheduleTypes ? [...new Set(c.scheduleTypes)] : [];
                    const hasSchedules = uniqueTypes.length > 0;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`min-h-[24px] flex flex-col items-center justify-between p-0.5 rounded transition-colors ${
                          !c.other && hasSchedules 
                            ? 'bg-blue-50/50 hover:bg-blue-100/70' 
                            : !c.other 
                            ? 'hover:bg-slate-50' 
                            : ''
                        }`}
                      >
                        <button
                          onClick={(e) => handleCalendarDateClick(c.day, c.other, new Date(), e)}
                          disabled={c.other}
                          className={`w-full h-5 flex items-center justify-center rounded text-[10px] font-medium transition-all ${
                            c.other 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : c.today
                              ? 'bg-[#4b7bec] text-white font-bold shadow-sm hover:bg-[#3b72e5]'
                              : hasSchedules
                              ? 'text-slate-800 font-semibold hover:bg-white/80'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                          title={
                            c.other 
                              ? '' 
                              : `${c.day}일${hasSchedules ? ` - ${uniqueTypes.length}개 일정` : ' - 일정 없음'}`
                          }
                        >
                          {c.day}
                        </button>
                        {/* 일정 표시 - 기존 크기 유지하되 더 명확하게 */}
                        {!c.other && hasSchedules && (
                          <div className="w-full flex items-center justify-center gap-0.5 pb-0.5 mt-0.5">
                            {uniqueTypes.slice(0, 3).map((type, typeIdx) => (
                              <div
                                key={typeIdx}
                                className={`w-1.5 h-1.5 rounded-full ${typeColors[type] || 'bg-slate-400'} shadow-sm`}
                                title={typeLabels[type] || type}
                              />
                            ))}
                            {uniqueTypes.length > 3 && (
                              <div 
                                className="w-1.5 h-1.5 rounded-full bg-slate-400 shadow-sm"
                                title={`+${uniqueTypes.length - 3}개 더`}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* 범례 - 컴팩트하게 */}
                {monthSchedules.length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-slate-600">수술</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-slate-600">진료</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        <span className="text-slate-600">X-Ray</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>
          )}

          {currentView === 'dashboard' ? (
            <section className="grid grid-cols-1 xl:grid-cols-[2.04fr_1fr] gap-6" id="bottom-section">
              {/* 최근 진단 이력 요약 */}
              <div id="recent-diagnosis-section">
                <Card className="p-4 flex flex-col" ref={onlineBookingRef} style={{ height: '412px', minHeight: '412px', maxHeight: '412px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-base text-slate-800 font-semibold">최근 진단 이력</div>
                    <button 
                      onClick={() => navigate('/history')}
                      className="text-[#4b7bec] text-sm font-semibold hover:text-[#3b72e5] transition-colors"
                    >
                      전체 보기
                    </button>
                  </div>
                  <RecentDiagnosisHistory />
                </Card>
              </div>
              
              {/* 다가오는 일정 */}
              <div id="upcoming-events-section">
                <UpcomingEvents
                  events={upcomingSchedules}
                  onEventClick={(event) => {
                    const eventDate = new Date(event.startDateTime);
                    const dateString = eventDate.toISOString().split('T')[0];
                    navigate(`/schedule?date=${dateString}`);
                  }}
                  onAddClick={() => navigate('/schedule')}
                />
              </div>
            </section>
          ) : currentView === 'patients' ? (
            <section className="w-full flex-1 flex flex-col min-h-0" id="patient-management-section">
              <Card className="p-6 flex-1 min-h-0 overflow-y-auto">
                <PatientManagement isEmbed={true} />
              </Card>
            </section>
          ) : null}
        </>
      </MainLayout>
    </>
  );
};

export default DashboardPage;


