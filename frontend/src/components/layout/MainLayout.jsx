import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Users, Activity, FileText, User, Calendar } from 'react-feather';
import NotificationButton from './Header/NotificationButton';
import AnnouncementCarousel from '../dashboard/AnnouncementCarousel';
import logo from '../../logo/logo_0.png';
import ThemeLangToggle from '../ThemeLangToggle';

const Card = ({ className = '', children, style }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-[14px] shadow-[0_8px_30px_rgba(16,24,40,0.08)] ${className}`} style={style}>{children}</div>
);

const MainLayout = ({ children, customSidebar = null, hideSidebar = false, mainContentRef: externalMainContentRef = null, onLogoClick = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const internalMainContentRef = useRef(null);
  const mainContentRef = externalMainContentRef || internalMainContentRef;
  const [sidebarHeight, setSidebarHeight] = useState('auto');
  const [bottomBoxHeight, setBottomBoxHeight] = useState('auto');
  const [userInfo, setUserInfo] = useState({ name: '', role: '', profileImage: null });

  useEffect(() => {
    const updateSidebarHeight = () => {
      if (mainContentRef.current) {
        const sections = mainContentRef.current.querySelectorAll('section');
        let totalHeight = 0;
        if (sections.length >= 2) {
          totalHeight = sections[0].offsetHeight + sections[1].offsetHeight + 24;
        }
        setSidebarHeight(`${totalHeight}px`);
      }
    };

    const timer = setTimeout(() => {
      updateSidebarHeight();
    }, 100);

    window.addEventListener('resize', updateSidebarHeight);

    const observer = new MutationObserver(() => {
      setTimeout(updateSidebarHeight, 50);
    });

    if (mainContentRef.current) {
      observer.observe(mainContentRef.current, {
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
  }, [location.pathname]);

  useEffect(() => {
    const updateBottomBoxHeight = () => {
      if (mainContentRef.current) {
        const sections = mainContentRef.current.querySelectorAll('section');
        if (sections.length >= 3) {
          setBottomBoxHeight(`${sections[2].offsetHeight}px`);
        }
      }
    };

    const timer = setTimeout(() => {
      updateBottomBoxHeight();
    }, 100);

    window.addEventListener('resize', updateBottomBoxHeight);

    const observer = new MutationObserver(() => {
      setTimeout(updateBottomBoxHeight, 50);
    });

    if (mainContentRef.current) {
      observer.observe(mainContentRef.current, {
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
  }, [location.pathname]);

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      const storedUser = localStorage.getItem('user');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserInfo({
            name: user.name || user.username || userName || '',
            role: user.role || user.department || 'Doctor',
            profileImage: user.profileImage || user.avatar || user.image || null
          });
        } catch (e) {
          console.error('Failed to parse user info:', e);
          if (userName) {
            setUserInfo({
              name: userName,
              role: 'Doctor',
              profileImage: null
            });
          }
        }
      } else if (userName) {
        setUserInfo({
          name: userName,
          role: 'Doctor',
          profileImage: null
        });
      }
    } else {
      // 로그인하지 않은 경우 빈 정보로 설정
      setUserInfo({ name: '', role: '', profileImage: null });
    }
  }, []);

  const handleLogout = () => {
    // 모든 사용자 관련 localStorage 데이터 삭제
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    // 사용자 정보 초기화
    setUserInfo({ name: '', role: '', profileImage: null });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm relative">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (onLogoClick) {
                  onLogoClick();
                }
                navigate('/dashboard');
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                   style={{ background: 'linear-gradient(135deg, #5b8def22, #86a8ff22)' }}>
                <img src={logo} alt="MediKit Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">COVISION</span>
            </button>
          </div>
          {/* 공지사항 캐러셀 - 중앙 배치 (헤더에 직접 통합) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-[600px] h-full flex items-center">
            <AnnouncementCarousel />
          </div>
          <div className="flex items-center gap-3">
            <ThemeLangToggle />
            <NotificationButton />
            {userInfo.name && (
              <>
                <div className="flex items-center gap-2 bg-white rounded-full shadow px-2 py-1">
                  <img
                    className="w-8 h-8 rounded-lg object-cover"
                    src={userInfo.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=5b8def&color=fff&size=40`}
                    alt="user"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=5b8def&color=fff&size=40`;
                    }}
                  />
                  <div className="leading-none">
                    <div className="text-xs font-semibold text-slate-700">{userInfo.name}</div>
                    <div className="text-[10px] text-slate-400">{userInfo.role}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-sm text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-600 px-3 py-1.5 rounded-lg dark:hover:bg-gray-700">
                  로그아웃
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className={`mx-auto max-w-[1600px] px-6 py-6 grid grid-cols-1 ${hideSidebar ? '' : 'md:grid-cols-[260px_1fr]'} gap-6 items-start`}>
        {!hideSidebar && (
          customSidebar ? (
            customSidebar
          ) : (
            <aside className="self-start" ref={sidebarRef} style={{ minHeight: '400px' }}>
              <Card className="p-4 flex flex-col overflow-hidden" style={{ minHeight: '400px' }}>
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto justify-center">
                  {[
                    [Layout, '대시보드', '/dashboard'],
                    [Users, '환자관리', '/patients'],
                    [Activity, 'AI 진단', '/diagnosis'],
                    [FileText, '진단 이력', '/history'],
                    [Calendar, '일정 관리', '/schedule'],
                    [User, '마이페이지', '/mypage']
                  ].map(([IconComponent, label, path]) => {
                    const isActive = location.pathname === path;
                    return (
                      <button
                        key={label}
                        onClick={() => navigate(path)}
                        className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-[#3b82f6] text-white'
                            : 'text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700'
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
              <Card className="p-4 mt-6 flex flex-col overflow-hidden" style={{ minHeight: '150px' }}>
                <div className="text-slate-800 dark:text-gray-200 font-semibold mb-4">추가 정보</div>
                <div className="text-sm text-slate-600 dark:text-gray-400 flex-1">
                  {/* 여기에 내용 추가 가능 */}
                </div>
              </Card>
            </aside>
          )
        )}

        <main className="flex flex-col gap-6" ref={mainContentRef}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
