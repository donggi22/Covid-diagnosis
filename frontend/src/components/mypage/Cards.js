import React from 'react';

export const Card = ({ children, onClick, className }) => {
  return (
    <div
      className={`mp-card ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const Stat = ({ label, value, helper }) => {
  return (
    <div className="mp-stat">
      <div className="mp-stat-value">{value}</div>
      <div className="mp-stat-label">{label}</div>
      {helper && <div className="mp-stat-helper">{helper}</div>}
    </div>
  );
};

export const Progress = ({ value = 0 }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="mp-progress">
      <div className="mp-progress-bar" style={{ width: `${clamped}%` }} />
    </div>
  );
};

export const Badge = ({ color = 'gray', children }) => {
  const colorMap = {
    red: { light: '#EF4444', dark: '#F87171' },
    orange: { light: '#F59E0B', dark: '#FBBF24' },
    green: { light: '#10B981', dark: '#34D399' },
    gray: { light: '#6B7280', dark: '#9CA3AF' }
  };
  
  const isDark = document.documentElement.classList.contains('dark');
  const selectedColor = isDark ? colorMap[color].dark : colorMap[color].light;
  
  return (
    <span className="mp-badge" style={{ 
      backgroundColor: `${selectedColor}22`, 
      color: selectedColor, 
      borderColor: `${selectedColor}55` 
    }}>
      {children}
    </span>
  );
};

export const Section = ({ title, action, children }) => (
  <section className="mp-section">
    <div className="mp-section-head">
      <h2>{title}</h2>
      {action}
    </div>
    {children}
  </section>
);




