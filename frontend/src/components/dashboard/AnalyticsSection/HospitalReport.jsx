import React from 'react';
import ReportItem from './ReportItem';

const data = [
  { title: '501호 에어컨 고장', by: 'Steve' },
  { title: 'Daniel 휴가 연장', by: 'Androw' },
  { title: '101호 화장실 청소 필요', by: 'Steve' }
];

const HospitalReport = () => {
  return (
    <div className="mk-card">
      <div className="mk-head">
        <h3>병원 리포트</h3>
        <button className="mk-link">전체 보기</button>
      </div>
      <ul className="report">
        {data.map((r) => (
          <ReportItem key={r.title} title={r.title} by={r.by} />
        ))}
      </ul>
    </div>
  );
};

export default HospitalReport;


