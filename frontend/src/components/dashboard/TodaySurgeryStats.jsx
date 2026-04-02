import React from 'react';

const DEFAULT_STATS = {
  todayOps: 24,
  avgDurationMinutes: 45,
  occupancyPercent: 68,
  breakdown: [
    { label: '코로나19', colorClass: 'bg-red-400', leftValue: 8, rightValue: 8 },
    { label: '폐렴', colorClass: 'bg-yellow-400', leftValue: 6, rightValue: 6 },
    { label: '폐 불투명화', colorClass: 'bg-blue-400', leftValue: 6, rightValue: 5 },
    { label: '정상', colorClass: 'bg-green-400', leftValue: 5, rightValue: 9 },
  ],
};

const MetricCard = ({ title, value, sub }) => (
  <div className="bg-slate-50 rounded-xl px-5 py-4 flex flex-col justify-between h-[84px]">
    <div className="text-xs text-slate-400 uppercase tracking-wide leading-none">{title}</div>
    <div className="text-3xl font-bold text-slate-800 leading-none">{value}</div>
    {sub && <div className="text-xs text-slate-400 leading-none">{sub}</div>}
  </div>
);

/**
 * KEY: This component uses strict sizing rules:
 * - Parent uses space-y-8 for vertical spacing
 * - Summary metrics section is grid-cols-3 gap-6
 * - Breakdown + Realtime section is grid-cols-2 gap-16 items-start
 * - Each "row" uses fixed height h-[28px] and leading-none
 */
const TodaySurgeryStats = ({ data = DEFAULT_STATS }) => {
  // compute max for bar width normalization
  const maxRight = Math.max(...data.breakdown.map((b) => b.rightValue), 1);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Title - 다른 컴포넌트들과 동일한 상단 여백 */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800">오늘의 수술 통계</h2>
        <p className="text-sm text-slate-500 mt-[6px]">AI 보조 진단 및 흉부 수술 진행 현황</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <MetricCard title="Today Ops" value={data.todayOps} sub="cases" />
        <MetricCard title="Avg Duration" value={`${data.avgDurationMinutes}m`} sub="per surgery" />
        <MetricCard title="Occupancy Rate" value={`${data.occupancyPercent}%`} sub="OR usage" />
      </div>

      {/* Breakdowns + Realtime - flex-1로 남은 공간 채우기 */}
      <div className="grid grid-cols-2 gap-16 items-start flex-1">
        {/* Left column: Breakdown */}
        <div className="flex flex-col h-full">
          <h3 className="text-base font-semibold text-slate-700 mb-4 leading-none h-[24px] flex items-center">케이스 브레이크다운</h3>

          <div className="flex flex-col gap-3">
            {data.breakdown.map((b) => (
              <div
                key={b.label}
                className="flex items-center justify-between w-full h-[28px] leading-none"
                role="group"
                aria-label={`breakdown-${b.label}`}
              >
                <div className="flex items-center gap-3 min-w-[160px]">
                  <span className={`w-[10px] h-[20px] rounded-full ${b.colorClass}`} />
                  <span className="text-sm text-slate-700 leading-none">{b.label}</span>
                </div>

                <span className="text-sm text-slate-600 leading-none w-[28px] text-right">{b.leftValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Realtime */}
        <div className="flex flex-col h-full">
          <h3 className="text-base font-semibold text-slate-700 mb-4 leading-none h-[24px] flex items-center">실시간 업데이트</h3>

          <div className="flex flex-col gap-3">
            {data.breakdown.map((b) => {
              const pct = Math.round((b.rightValue / maxRight) * 100);
              return (
                <div key={b.label} className="flex items-center gap-3 w-full h-[28px] leading-none">
                  <span className="text-sm text-slate-600 leading-none w-[28px] text-right">{b.rightValue}</span>

                  {/* Bar container */}
                  <div className="flex-1 h-[6px] rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${b.colorClass}`}
                      style={{ width: `${pct}%`, transition: 'width 300ms ease' }}
                      aria-hidden
                    />
                  </div>

                  <span className="text-sm text-slate-600 leading-none w-[28px] text-left">{b.rightValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodaySurgeryStats;

