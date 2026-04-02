import React from 'react';
import AppointmentTable from './AppointmentTable';

const OnlineAppointment = () => (
  <div className="mk-card">
    <div className="mk-head">
      <h3>온라인 예약</h3>
      <button className="mk-link">전체 보기</button>
    </div>
    <AppointmentTable />
  </div>
);

export default OnlineAppointment;


