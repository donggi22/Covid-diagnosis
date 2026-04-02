import React from 'react';
import './ThemeLangToggle.css';
import { useTheme } from '../contexts/ThemeContext';

const ThemeLangToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="theme-lang-toggle">
      <button
        className="toggle-btn theme-btn"
        onClick={toggleDarkMode}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? '라이트 모드' : '다크 모드'}
      >
        {darkMode ? <span className="icon moon">🌙</span> : <span className="icon sun">☀️</span>}
      </button>
    </div>
  );
};

export default ThemeLangToggle;









