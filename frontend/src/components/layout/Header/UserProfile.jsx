import React from 'react';

const UserProfile = ({ name = '테스트계정', role = 'Admin', onClick }) => {
  return (
    <div className="profile-chip" onClick={onClick}>
      <img src="https://i.pravatar.cc/40" alt="user" />
      <div className="chip-text">
        <strong>{name}</strong>
        <span>{role}</span>
      </div>
    </div>
  );
};

export default UserProfile;


