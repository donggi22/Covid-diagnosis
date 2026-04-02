import React from 'react';
const SuccessItem = ({ label, value }) => (
  <li>
    <span>{label}</span>
    <div className="bar"><div className="bar-in" style={{ width: `${value}%` }} /></div>
    <em>{value}%</em>
  </li>
);
export default SuccessItem;


