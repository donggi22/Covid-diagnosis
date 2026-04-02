import React from 'react';
import { Card, Section } from './Cards';
// Charts: requires `npm i recharts`
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

const AiCollabStats = ({ agreementRate = 86, feedbackCount = 12, trend = [] }) => {
  const pieData = [
    { name: 'agree', value: agreementRate },
    { name: 'rest', value: 100 - agreementRate }
  ];
  const pieColors = ['#10B981', '#1f2937'];

  return (
    <Section title="AI 협업 통계">
      <div className="mp-grid-3">
        <Card>
          <div className="mp-gauge">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mp-gauge-center">
              <div className="mp-gauge-value">{agreementRate}%</div>
              <div className="mp-gauge-label">AI 일치율</div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="mp-center">
            <div className="mp-kpi-value">{feedbackCount}</div>
            <div className="mp-kpi-label">이번 달 피드백</div>
          </div>
        </Card>
        <Card className="mp-col-span-1 mp-chart-card">
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis dataKey="d" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0b1022', border: '1px solid #1f2937' }} cursor={{ stroke: '#1f2937' }} />
                <Line type="monotone" dataKey="acc" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mp-chart-title">정확도 트렌드</div>
        </Card>
      </div>
    </Section>
  );
};

export default AiCollabStats;




