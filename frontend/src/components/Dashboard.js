import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import useLang from '../hooks/useLang';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayDiagnosis: 0,
    pendingCases: 0,
    accuracy: 0
  });
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const lang = useLang();

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // 사용자 이름 가져오기
    const storedUserName = localStorage.getItem('userName');
    setUserName(storedUserName || '의료진');

    // 통계 데이터 로드 (실제로는 API에서 가져옴)
    setStats({
      totalPatients: 1247,
      todayDiagnosis: 23,
      pendingCases: 8,
      accuracy: 94.2
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const texts = useMemo(
    () => ({
      ko: {
        title: 'AI 진단 시스템 대시보드',
        welcome: `${userName}님, 안녕하세요!`,
        logout: '로그아웃',
        myPage: '마이페이지',
        stats: {
          totalPatients: '총 환자 수',
          todayDiagnosis: '오늘 진단 수',
          pendingCases: '대기 중인 케이스',
          accuracy: 'AI 정확도'
        },
        quickActionsTitle: '빠른 작업',
        recentActivity: '최근 활동',
        quickActions: [
          { title: '환자 관리', description: '환자 정보 조회 및 관리', icon: '👥', path: '/patients', color: '#4f46e5' },
          { title: 'AI 진단', description: 'AI를 통한 의료 영상 진단', icon: '🤖', path: '/diagnosis', color: '#10b981' },
          { title: '진단 기록', description: '과거 진단 결과 조회', icon: '📋', path: '/history', color: '#f59e0b' },
          { title: '통계 분석', description: '진단 통계 및 분석', icon: '📊', path: '/statistics', color: '#8b5cf6' },
          { title: '기능 가이드', description: '시스템 주요 기능과 사용법 안내', icon: '📖', path: '/guide', color: '#06b6d4' },
          { title: '마이페이지', description: '내 정보 및 설정 관리', icon: '👤', path: '/mypage', color: '#ec4899' }
        ],
        activity: [
          { icon: '🔍', text: '김환자님의 흉부 X-ray 진단 완료', time: '2시간 전' },
          { icon: '📝', text: '이환자님의 진단 기록이 업데이트되었습니다', time: '4시간 전' },
          { icon: '✅', text: 'AI 모델 정확도가 94.2%로 업데이트되었습니다', time: '1일 전' }
        ]
      },
      en: {
        title: 'AI Diagnosis Dashboard',
        welcome: `Welcome, ${userName}!`,
        logout: 'Logout',
        myPage: 'My Page',
        stats: {
          totalPatients: 'Total Patients',
          todayDiagnosis: "Today's Diagnoses",
          pendingCases: 'Pending Cases',
          accuracy: 'AI Accuracy'
        },
        quickActionsTitle: 'Quick Actions',
        recentActivity: 'Recent Activity',
        quickActions: [
          { title: 'Patient Management', description: 'View and manage patient information', icon: '👥', path: '/patients', color: '#4f46e5' },
          { title: 'AI Diagnosis', description: 'Medical image diagnosis with AI', icon: '🤖', path: '/diagnosis', color: '#10b981' },
          { title: 'Diagnosis History', description: 'Review previous diagnosis results', icon: '📋', path: '/history', color: '#f59e0b' },
          { title: 'Analytics', description: 'Diagnosis statistics and analytics', icon: '📊', path: '/statistics', color: '#8b5cf6' },
          { title: 'Feature Guide', description: 'Interactive feature walkthrough', icon: '📖', path: '/guide', color: '#06b6d4' },
          { title: 'My Page', description: 'Manage your profile and settings', icon: '👤', path: '/mypage', color: '#ec4899' }
        ],
        activity: [
          { icon: '🔍', text: 'Completed chest X-ray review for Patient Kim', time: '2 hours ago' },
          { icon: '📝', text: 'Updated diagnosis report for Patient Lee', time: '4 hours ago' },
          { icon: '✅', text: 'AI accuracy updated to 94.2%', time: '1 day ago' }
        ]
      }
    }),
    [userName]
  );

  const t = texts[lang] || texts.ko;
  const quickActions = t.quickActions;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="파일, 환자 또는 기록 검색" />
            </div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" aria-label="알림">🔔</button>
            <button className="icon-btn" aria-label="메시지">💬</button>
            <div className="profile-chip" onClick={() => navigate('/mypage')}>
              <img src="https://i.pravatar.cc/40" alt="user" />
              <div className="chip-text">
                <strong>테스트계정</strong>
                <span>Admin</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">{t.logout}</button>
          </div>
        </div>
      </header>

      <div className="mk-layout">
        <aside className="mk-sidebar">
          <nav className="mk-nav">
            <button className="mk-nav-item active">🧩 개요</button>
            <button className="mk-nav-item">🩺 의사</button>
            <button className="mk-nav-item">👤 환자</button>
            <button className="mk-nav-item">🗂️ 부서</button>
            <button className="mk-nav-item">📅 예약</button>
            <button className="mk-nav-item">💊 약국</button>
            <button className="mk-nav-item">💳 결제</button>
            <div className="mk-sep"></div>
            <button className="mk-nav-item">📈 리포트</button>
            <button className="mk-nav-item">📄 공지</button>
            <button className="mk-nav-item">⚙️ 설정</button>
          </nav>
          <div className="mk-create">
            <div className="mk-create-icon">📁</div>
            <p>새 카테고리 또는 데이터베이스 추가</p>
            <button className="mk-create-btn">+ 새로 만들기</button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="container">
          {/* 상단 요약 카드 4개 */}
          <section className="stats-row">
            {[
              { label: '의사 수', value: '2,937', sub: '이번 주 신규 3명', icon: '👨‍⚕️' },
              { label: '직원 수', value: '5,453', sub: '휴가 중 8명', icon: '🧑‍⚕️' },
              { label: '환자 수', value: '170K', sub: '신규 입원 175명', icon: '🧍' },
              { label: '약국 수', value: '21', sub: '비축 의약품 85k', icon: '💊' }
            ].map((c) => (
              <div className="mk-card stat" key={c.label}>
                <div className="mk-icon">{c.icon}</div>
                <div>
                  <h3>{c.value}</h3>
                  <p>{c.label}</p>
                  <span>{c.sub}</span>
                </div>
              </div>
            ))}
          </section>

          {/* 중간 3열 보드 */}
          <section className="mk-grid-3">
            <div className="mk-card">
              <h3>병원 출생/사망 분석</h3>
              <div className="mk-donut">
                <div className="ring"></div>
                <div className="seg a"></div>
                <div className="seg b"></div>
                <div className="seg c"></div>
              </div>
              <div className="legend">
                <span className="dot a"></span> 출생 45.07%
                <span className="dot b"></span> 사고 18.43%
                <span className="dot c"></span> 사망 29.05%
              </div>
            </div>

            <div className="mk-card">
              <div className="mk-head">
                <h3>병원 리포트</h3>
                <button className="mk-link">전체 보기</button>
              </div>
              <ul className="report">
                {[
                  '501호 에어컨 고장',
                  'Daniel 휴가 연장',
                  '101호 화장실 청소 필요'
                ].map((t) => (
                  <li key={t}>
                    <span className="bullet">•</span>
                    <div>
                      <p>{t}</p>
                      <small>Steve 보고</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mk-card">
              <div className="mk-head">
                <h3>성공률</h3>
                <select>
                  <option>2021년 5월</option>
                </select>
              </div>
              <ul className="progress-list">
                {[
                  ['마취과', 83],
                  ['산부인과', 95],
                  ['신경과', 100],
                  ['종양학', 89],
                  ['정형외과', 97],
                  ['물리치료', 100]
                ].map(([label, val]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <div className="bar"><div className="bar-in" style={{ width: `${val}%` }} /></div>
                    <em>{val}%</em>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 하단: 예약 테이블 + 의사 리스트 */}
          <section className="mk-grid-2">
            <div className="mk-card">
              <div className="mk-head">
                <h3>온라인 예약</h3>
                <button className="mk-link">전체 보기</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>No.</th><th>이름</th><th>일시</th><th>나이</th><th>성별</th><th>담당의</th><th>설정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['01', 'Cameron', '5월 20일 6:30pm', '54', '남', 'Dr. Lee'],
                      ['02', 'Jorge', '5월 20일 7:30pm', '76', '여', 'Dr. Gregory'],
                      ['03', 'Philip', '5월 20일 8:30pm', '47', '남', 'Dr. Bernard'],
                      ['04', 'Nathan', '5월 20일 9:00pm', '40', '여', 'Dr. Mitchell'],
                      ['05', 'Soham', '5월 20일 6:30pm', '43', '여', 'Dr. Randall']
                    ].map((r) => (
                      <tr key={r[0]}>
                        {r.map((c, i) => <td key={i}>{c}</td>)}
                        <td><button className="icon-ghost">✏️</button><button className="icon-ghost">🗑️</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mk-card">
              <div className="mk-head"><h3>의사 목록</h3></div>
              <ul className="doctor">
                {[
                  ['Dr. Brandon', '산부인과'],
                  ['Dr. Gregory', '심장내과'],
                  ['Dr. Robert', '정형외과'],
                  ['Dr. Calvin', '신경과']
                ].map(([name, role]) => (
                  <li key={name}>
                    <img src="https://i.pravatar.cc/60" alt={name} />
                    <div><p>{name}</p><small>{role}</small></div>
                    <button className="icon-ghost">︙</button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

























