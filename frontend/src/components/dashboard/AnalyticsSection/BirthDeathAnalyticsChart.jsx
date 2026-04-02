import React from 'react';

const BirthDeathAnalyticsChart = () => {
  return (
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
  );
};

export default BirthDeathAnalyticsChart;


