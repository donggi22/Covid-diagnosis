import React from 'react';
import AppointmentRow from './AppointmentRow';

const rows = [
  ['01', 'Cameron', '5월 20일 6:30pm', '54', '남', 'Dr. Lee'],
  ['02', 'Jorge', '5월 20일 7:30pm', '76', '여', 'Dr. Gregory'],
  ['03', 'Philip', '5월 20일 8:30pm', '47', '남', 'Dr. Bernard'],
  ['04', 'Nathan', '5월 20일 9:00pm', '40', '여', 'Dr. Mitchell'],
  ['05', 'Soham', '5월 20일 6:30pm', '43', '여', 'Dr. Randall']
];

const AppointmentTable = () => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th>No.</th><th>이름</th><th>일시</th><th>나이</th><th>성별</th><th>담당의</th><th>설정</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => <AppointmentRow key={row[0]} row={row} />)}
      </tbody>
    </table>
  </div>
);

export default AppointmentTable;


