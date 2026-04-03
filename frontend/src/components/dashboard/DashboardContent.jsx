import React, { useRef } from 'react';
import { Heart, UserCheck, Users, Package, User, MoreVertical } from 'react-feather';

const Card = ({ className = '', children }) => (
  <div className={`bg-white rounded-[14px] shadow-[0_8px_30px_rgba(16,24,40,0.08)] ${className}`}>{children}</div>
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

const ReportItem = ({ icon, title, by }) => (
  <li className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
         style={{ background: 'linear-gradient(135deg, #5b8def22, #86a8ff22)' }}>
      <span>{icon}</span>
    </div>
    <div className="flex-1">
      <p className="text-[15px] font-medium text-slate-700">{title}</p>
      <p className="text-xs text-slate-400">Reported by {by}</p>
    </div>
    <button className="text-slate-400">⋮</button>
  </li>
);

const AppointmentRow = ({ row }) => (
  <tr className="even:bg-slate-50/60">
    {row.map((cell, idx) => (
      <td key={idx} className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{cell}</td>
    ))}
    <td className="px-4 py-3 whitespace-nowrap">
      <button className="text-slate-500 mr-2">✏️</button>
      <button className="text-slate-500">🗑️</button>
    </td>
  </tr>
);

const DoctorCard = ({ name, role }) => (
  <li className="grid grid-cols-[48px_1fr_auto] items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group border border-transparent hover:border-slate-100">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-105 transition-transform duration-300">
      <User size={24} strokeWidth={2.5} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate leading-tight">{name}</p>
      <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">{role}</p>
    </div>
    <button className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
      <MoreVertical size={16} />
    </button>
  </li>
);

const DoughnutChart = ({ style }) => (
  <div className="relative" style={style}>
    <div className="absolute inset-0 rounded-full bg-gray-100" />
    <div
      className="absolute inset-0 rounded-full"
      style={{
        mask: 'radial-gradient(circle 70px at center, transparent 70px, #000 71px)',
        WebkitMask: 'radial-gradient(circle 70px at center, transparent 70px, #000 71px)',
        background:
          'conic-gradient(#5bd1c0 0 45%, #ffc45d 45% 63%, #ff7b7b 63% 100%)'
      }}
    />
  </div>
);

const buildMonthMatrix = (baseDate = new Date()) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDay = first.getDay();
  const totalDays = last.getDate();
  const prevLast = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevLast - (firstDay - 1 - i), other: true });
  }

  for (let d = 1; d <= totalDays; d++) {
    const now = new Date();
    const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    cells.push({ day: d, other: false, today: isToday });
  }

  const totalFilled = cells.length;
  const remainder = totalFilled % 7;
  const trailingCount = remainder === 0 ? 0 : 7 - remainder;
  for (let i = 1; i <= trailingCount; i++) {
    cells.push({ day: i, other: true });
  }

  while (cells.length < 42) {
    const nextIndex = cells.length - (firstDay + totalDays) + 1 + trailingCount;
    cells.push({ day: nextIndex, other: true });
  }
  return cells;
};

const DashboardContent = () => {
  const middleSectionRef = useRef(null);
  const onlineBookingRef = useRef(null);

  const stats = [
    { IconComponent: Heart, title: '의사', value: '2,937', sub: '이번 주 의사 3명 합류' },
    { IconComponent: UserCheck, title: '직원', value: '5,453', sub: '휴가 중인 직원 8명' },
    { IconComponent: Users, title: '환자', value: '170K', sub: '신규 입원 환자 175명' },
    { IconComponent: Package, title: '약국', value: '21', sub: '재고 약품 85k개' }
  ];

  const reports = [
    { icon: '🧊', title: 'Room 501 AC is not working', by: 'Steve' },
    { icon: '🗓️', title: 'Daniel extended his holiday', by: 'Androw' },
    { icon: '🧼', title: '101 washroom needed to clean', by: 'Steve' }
  ];

  const rows = [
    ['01', 'Cameron', '20 May 6:30pm', '54', 'Male', 'Dr. Lee'],
    ['02', 'Jorge', '20 May 7:30pm', '76', 'Female', 'Dr. Gregory'],
    ['03', 'Philip', '20 May 8:30pm', '47', 'Male', 'Dr. Bernard'],
    ['04', 'Nathan', '20 May 9:00pm', '40', 'Female', 'Dr. Mitchell'],
    ['05', 'Soham', '20 May 6:30pm', '43', 'Female', 'Dr. Randall']
  ];

  const doctors = [
    ['Dr. Brandon', 'Gynecologist'],
    ['Dr. Gregory', 'Cardiologist'],
    ['Dr. Robert', 'Orthopedologist'],
    ['Dr. Calvin', 'Neurologist']
  ];

  const monthCells = buildMonthMatrix();
  const monthLabel = (() => {
    const now = new Date();
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
  })();

  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[2fr_2fr_2fr] gap-4 items-start" ref={middleSectionRef}>
        <Card className="p-6 min-h-[320px]">
          <h2 className="text-base font-semibold mb-3">병원 출생/사망 분석</h2>
          <div className="h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-center">
              <DoughnutChart style={{ height: '210px', width: '210px' }} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 justify-center text-xs text-slate-500">
              <span className="before:inline-block before:w-2.5 before:h-2.5 before:rounded-full before:bg-[#5bd1c0] before:mr-2">출생 45.07%</span>
              <span className="before:inline-block before:w-2.5 before:h-2.5 before:rounded-full before:bg-[#ffc45d] before:mr-2">사고 18.43%</span>
              <span className="before:inline-block before:w-2.5 before:h-2.5 before:rounded-full before:bg-[#ff7b7b] before:mr-2">사망 29.05%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 min-h-[320px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-800 font-semibold">병원 리포트</div>
            <button className="text-[#4b7bec] text-sm font-semibold">전체 보기</button>
          </div>
          <ul className="flex flex-col gap-3">
            {reports.map((r) => <ReportItem key={r.title} {...r} />)}
          </ul>
        </Card>

        <Card className="p-6 min-h-[320px] h-[320px] overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-slate-800 font-semibold">캘린더</div>
              <div className="text-xs text-slate-500">{monthLabel}</div>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] text-slate-500 mb-1">
              {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="py-0.5 leading-none">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-[1px] flex-1 content-start">
              {monthCells.map((c, idx) => (
                <div key={idx} className="h-7 flex items-center justify-center">
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] leading-none transition-colors ${
                      c.other ? 'text-slate-300' : 'text-slate-700'
                    } hover:bg-slate-100 ${
                      c.today ? 'bg-[#4b7bec] text-white font-semibold' : ''
                    }`}
                  >
                    {c.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[3fr_1.5fr] gap-6" id="online-booking-section">
        <Card className="p-6" ref={onlineBookingRef}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-slate-800 font-semibold">온라인 예약</div>
            <button className="text-[#4b7bec] text-sm font-semibold">전체 보기</button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  {['No.', '이름', '일시', '나이', '성별', '담당의', '설정'].map(h => <th key={h} className="px-4 py-2">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => <AppointmentRow key={r[0]} row={r} />)}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3"><div className="text-slate-800 font-semibold">의사 목록</div></div>
          <ul className="flex flex-col gap-3">
            {doctors.map(([name, role]) => {
              const koRole = {
                'Gynecologist': '산부인과',
                'Cardiologist': '심장내과',
                'Orthopedologist': '정형외과',
                'Neurologist': '신경과'
              }[role] || role;
              return <DoctorCard key={name} name={name} role={koRole} />;
            })}
          </ul>
        </Card>
      </section>
    </>
  );
};

export default DashboardContent;
