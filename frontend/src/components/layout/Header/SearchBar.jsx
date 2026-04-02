import React from 'react';

const SearchBar = () => {
  return (
    <div className="search-wrap">
      <span className="search-icon">🔍</span>
      <input className="search-input" placeholder="파일, 환자 또는 기록 검색" />
    </div>
  );
};

export default SearchBar;


