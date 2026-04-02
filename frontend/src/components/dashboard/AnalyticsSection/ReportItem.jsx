import React from 'react';

const ReportItem = ({ title, by }) => {
  return (
    <li>
      <span className="bullet">•</span>
      <div>
        <p>{title}</p>
        <small>{by} 보고</small>
      </div>
    </li>
  );
};

export default ReportItem;


