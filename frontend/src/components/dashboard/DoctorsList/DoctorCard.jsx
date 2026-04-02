import React from 'react';
const DoctorCard = ({ name, role }) => (
  <li>
    <img src="https://i.pravatar.cc/60" alt={name} />
    <div><p>{name}</p><small>{role}</small></div>
    <button className="icon-ghost">︙</button>
  </li>
);
export default DoctorCard;


