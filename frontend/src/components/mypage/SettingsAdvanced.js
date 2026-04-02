import React, { useEffect, useState } from 'react';
import { Section, Card } from './Cards';

const SettingsAdvanced = () => {
  const [sensitivity, setSensitivity] = useState(70);
  const [priority, setPriority] = useState('urgent');
  const [onCall, setOnCall] = useState({ start: '18:00', end: '08:00' });
  const [layout, setLayout] = useState('classic');

  useEffect(() => {
    // load from localStorage
    const data = JSON.parse(localStorage.getItem('mp-settings') || '{}');
    if (data.sensitivity != null) setSensitivity(data.sensitivity);
    if (data.priority) setPriority(data.priority);
    if (data.onCall) setOnCall(data.onCall);
    if (data.layout) setLayout(data.layout);
  }, []);

  useEffect(() => {
    localStorage.setItem('mp-settings', JSON.stringify({ sensitivity, priority, onCall, layout }));
  }, [sensitivity, priority, onCall, layout]);

  return (
    <Section title="설정 추가">
      <div className="mp-grid-2">
        <Card>
          <div className="mp-field">
            <label>AI 민감도 ({sensitivity}%)</label>
            <input type="range" min="0" max="100" value={sensitivity} onChange={e => setSensitivity(Number(e.target.value))} />
          </div>
          <div className="mp-field">
            <label>알림 우선순위</label>
            <div className="mp-radio-row">
              <label><input type="radio" name="prio" checked={priority==='urgent'} onChange={() => setPriority('urgent')} /> 긴급</label>
              <label><input type="radio" name="prio" checked={priority==='normal'} onChange={() => setPriority('normal')} /> 일반</label>
            </div>
          </div>
        </Card>
        <Card>
          <div className="mp-field">
            <label>근무 시간 (온콜)</label>
            <div className="mp-time-row">
              <input type="time" value={onCall.start} onChange={e => setOnCall({ ...onCall, start: e.target.value })} />
              <span className="mp-time-sep">~</span>
              <input type="time" value={onCall.end} onChange={e => setOnCall({ ...onCall, end: e.target.value })} />
            </div>
          </div>
          <div className="mp-field">
            <label>판독 화면 레이아웃</label>
            <select value={layout} onChange={e => setLayout(e.target.value)}>
              <option value="classic">클래식</option>
              <option value="split">분할</option>
              <option value="compare">비교</option>
            </select>
          </div>
        </Card>
      </div>
    </Section>
  );
};

export default SettingsAdvanced;




