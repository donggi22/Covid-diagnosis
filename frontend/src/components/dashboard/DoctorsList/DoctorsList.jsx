import React from 'react';
import DoctorCard from './DoctorCard';

const doctors = [
  ['Dr. Brandon', '산부인과'],
  ['Dr. Gregory', '심장내과'],
  ['Dr. Robert', '정형외과'],
  ['Dr. Calvin', '신경과']
];

const DoctorsList = () => (
  <div className="mk-card">
    <div className="mk-head"><h3>의사 목록</h3></div>
    <ul className="doctor">
      {doctors.map(([name, role]) => <DoctorCard key={name} name={name} role={role} />)}
    </ul>
  </div>
);

export default DoctorsList;


