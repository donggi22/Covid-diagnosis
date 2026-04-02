import React from 'react';
import SuccessItem from './SuccessItem';

const items = [
  ['마취과', 83],
  ['산부인과', 95],
  ['신경과', 100],
  ['종양학', 89],
  ['정형외과', 97],
  ['물리치료', 100]
];

const SuccessStats = () => (
  <div className="mk-card">
    <div className="mk-head">
      <h3>성공률</h3>
      <select><option>2021년 5월</option></select>
    </div>
    <ul className="progress-list">
      {items.map(([label, value]) => (
        <SuccessItem key={label} label={label} value={value} />
      ))}
    </ul>
  </div>
);

export default SuccessStats;


