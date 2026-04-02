import React from 'react';
import SearchBar from './SearchBar';
import NotificationButton from './NotificationButton';
import MessageButton from './MessageButton';
import UserProfile from './UserProfile';

const Header = ({ onLogout, onProfile }) => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <SearchBar />
        </div>
        <div className="header-actions">
          <NotificationButton />
          <MessageButton />
          <UserProfile onClick={onProfile} />
          <button onClick={onLogout} className="btn btn-secondary">로그아웃</button>
        </div>
      </div>
    </header>
  );
};

export default Header;


