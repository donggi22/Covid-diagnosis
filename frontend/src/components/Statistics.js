import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './Statistics.css';

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // 샘플 통계 데이터
    setStats({
      dailyDiagnoses: [
        { date: '01-15', diagnoses: 12 },
        { date: '01-16', diagnoses: 18 },
        { date: '01-17', diagnoses: 15 },
        { date: '01-18', diagnoses: 22 },
        { date: '01-19', diagnoses: 19 },
        { date: '01-20', diagnoses: 25 },
        { date: '01-21', diagnoses: 23 }
      ],
      diagnosisTypes: [
        { name: '정상', value: 45, color: '#10b981' },
        { name: '폐렴 의심', value: 25, color: '#f59e0b' },
        { name: '기타 이상', value: 20, color: '#ef4444' },
        { name: '추가 검사 필요', value: 10, color: '#8b5cf6' }
      ],
      accuracyTrend: [
        { month: '10월', accuracy: 89 },
        { month: '11월', accuracy: 91 },
        { month: '12월', accuracy: 93 },
        { month: '1월', accuracy: 94 }
      ],
      doctorPerformance: [
        { name: '김의사', diagnoses: 45, accuracy: 96 },
        { name: '박의사', diagnoses: 38, accuracy: 94 },
        { name: '이의사', diagnoses: 32, accuracy: 92 },
        { name: '최의사', diagnoses: 28, accuracy: 90 }
      ]
    });
  }, [navigate]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="statistics">
      <header className="page-header">
        <div className="header-content">
          <h1>통계 분석</h1>
          <div className="header-actions">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-input time-select"
            >
              <option value="week">최근 1주</option>
              <option value="month">최근 1개월</option>
              <option value="quarter">최근 3개월</option>
              <option value="year">최근 1년</option>
            </select>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn btn-secondary"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
        </div>
      </header>

      <main className="page-main">
        <div className="container">
          {/* 주요 지표 */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <h3>1,247</h3>
                <p>총 진단 수</p>
                <span className="metric-change positive">+12%</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <h3>94.2%</h3>
                <p>AI 정확도</p>
                <span className="metric-change positive">+2.1%</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <h3>2.3초</h3>
                <p>평균 분석 시간</p>
                <span className="metric-change negative">-0.5초</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <h3>156</h3>
                <p>활성 의료진</p>
                <span className="metric-change positive">+8</span>
              </div>
            </div>
          </div>

          {/* 차트 섹션 */}
          <div className="charts-grid">
            {/* 일별 진단 수 */}
            <div className="chart-card">
              <h2>일별 진단 수</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.dailyDiagnoses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="diagnoses" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={{ fill: '#4f46e5', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 진단 유형 분포 */}
            <div className="chart-card">
              <h2>진단 유형 분포</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.diagnosisTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.diagnosisTypes?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 정확도 추이 */}
            <div className="chart-card">
              <h2>AI 정확도 추이</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[85, 100]} />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 의료진별 성과 */}
            <div className="chart-card">
              <h2>의료진별 성과</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.doctorPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 상세 통계 테이블 */}
          <div className="detailed-stats">
            <h2>상세 통계</h2>
            <div className="stats-table">
              <div className="table-header">
                <div className="table-cell">지표</div>
                <div className="table-cell">현재 값</div>
                <div className="table-cell">이전 대비</div>
                <div className="table-cell">목표</div>
                <div className="table-cell">상태</div>
              </div>
              
              <div className="table-row">
                <div className="table-cell">일일 평균 진단 수</div>
                <div className="table-cell">19.2</div>
                <div className="table-cell positive">+2.3</div>
                <div className="table-cell">20</div>
                <div className="table-cell">
                  <span className="status-indicator good">양호</span>
                </div>
              </div>
              
              <div className="table-row">
                <div className="table-cell">AI 정확도</div>
                <div className="table-cell">94.2%</div>
                <div className="table-cell positive">+2.1%</div>
                <div className="table-cell">95%</div>
                <div className="table-cell">
                  <span className="status-indicator good">양호</span>
                </div>
              </div>
              
              <div className="table-row">
                <div className="table-cell">평균 분석 시간</div>
                <div className="table-cell">2.3초</div>
                <div className="table-cell negative">-0.5초</div>
                <div className="table-cell">3초</div>
                <div className="table-cell">
                  <span className="status-indicator excellent">우수</span>
                </div>
              </div>
              
              <div className="table-row">
                <div className="table-cell">사용자 만족도</div>
                <div className="table-cell">4.6/5</div>
                <div className="table-cell positive">+0.2</div>
                <div className="table-cell">4.5</div>
                <div className="table-cell">
                  <span className="status-indicator excellent">우수</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;



















