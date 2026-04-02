import React from 'react';
import { Card } from './Cards';

const ReadingDashboard = ({ data, loading, onClickDone, onClickPending }) => {
  if (loading) {
    return (
      <div className="mp-grid-2">
        {[0,1].map(i => (
          <div key={i} className="mp-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="mp-grid-2">
      <Card onClick={onClickDone}>
        <div className="mp-stat-value">{data.todayDone}</div>
        <div className="mp-stat-label">완료</div>
      </Card>
      <Card onClick={onClickPending}>
        <div className="mp-stat-value">{data.pending}</div>
        <div className="mp-stat-label">대기중</div>
      </Card>
    </div>
  );
};

export default ReadingDashboard;




