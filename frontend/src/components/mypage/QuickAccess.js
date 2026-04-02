import React, { useState } from 'react';
import { Section } from './Cards';

const QuickAccess = ({ onGoPending, onOpenRecent, pendingCount = 0 }) => {
  const [roundMode, setRoundMode] = useState(false);

  return (
    <Section title="빠른 접근">
      <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
        <button className="mp-btn" onClick={() => { console.log('판독 대기 목록'); onGoPending && onGoPending(); }}>
          판독 대기 목록 ({pendingCount})
        </button>
        <button className="mp-btn-secondary" onClick={() => { console.log('최근 판독 케이스'); onOpenRecent && onOpenRecent(); }}>
          최근 판독 케이스
        </button>
        <button className="mp-btn" onClick={() => { const v = !roundMode; setRoundMode(v); console.log('회진 모드', v); }}>
          {roundMode ? '회진 모드 해제' : '회진 모드'}
        </button>
      </div>
    </Section>
  );
};

export default QuickAccess;




