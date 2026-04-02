import React from 'react';
const AppointmentRow = ({ row }) => (
  <tr>
    {row.slice(0, 6).map((c, i) => <td key={i}>{c}</td>)}
    <td><button className="icon-ghost">✏️</button><button className="icon-ghost">🗑️</button></td>
  </tr>
);
export default AppointmentRow;


