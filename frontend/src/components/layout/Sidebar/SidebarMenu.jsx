import React from 'react';

const items = [
  ['🧩', '개요'],
  ['🩺', '의사'],
  ['👤', '환자'],
  ['🗂️', '부서'],
  ['📅', '예약'],
  ['💊', '약국'],
  ['💳', '결제'],
];

const secondary = [
  ['📈', '리포트'],
  ['📄', '공지'],
  ['⚙️', '설정'],
];

const SidebarMenu = () => {
  return (
    <nav className="mk-nav">
      {items.map(([icon, label], idx) => (
        <button key={label} className={`mk-nav-item ${idx === 0 ? 'active' : ''}`}>
          {icon} {label}
        </button>
      ))}
      <div className="mk-sep"></div>
      {secondary.map(([icon, label]) => (
        <button key={label} className="mk-nav-item">
          {icon} {label}
        </button>
      ))}
    </nav>
  );
};

export default SidebarMenu;


