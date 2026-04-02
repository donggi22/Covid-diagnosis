import React, { useEffect, useMemo, useState } from 'react';
import { Card, Section, Badge } from './Cards';
import { useTheme } from '../../contexts/ThemeContext';

const stateLabel = (state) => {
  if (state === 'urgent') return '주의';
  if (state === 'pending') return '관찰 필요';
  return '안정';
};

const STORAGE_KEY = 'patientFavorites';

const sortFavorites = (list) => {
  return [...list].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return 0;
  });
};

const PatientSummary = ({ wards, favorites, onViewAll, onSelectPatient }) => {
  const { darkMode } = useTheme();
  const wardStats = useMemo(() => ([
    { label: 'ICU', count: wards.icu || 0 },
    { label: '일반 병동', count: wards.ward || 0 }
  ]), [wards]);

  const initialFavorites = useMemo(() => {
    if (!favorites) return [];
    return sortFavorites(favorites);
  }, [favorites]);

  const [favList, setFavList] = useState(initialFavorites);

  // 즐겨찾기 상태를 localStorage에서 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavList(sortFavorites(parsed));
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore patient favorites', error);
    }

    // 저장된 값이 없거나 오류가 발생하면 기본 즐겨찾기를 사용
    setFavList(initialFavorites);
  }, [initialFavorites]);

  const toggleBookmark = (id) => {
    setFavList((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, starred: !p.starred } : p
      );
      const sorted = sortFavorites(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      } catch (error) {
        console.warn('Failed to persist patient favorites', error);
      }
      return sorted;
    });
  };

  return (
    <Section title="담당 환자 요약">
      <div className="mp-grid-3">
        <Card>
          <div className="mp-ward">
            {wardStats.map(w => (
              <div key={w.label} className="mp-ward-item">
                <div className="mp-ward-count">{w.count}</div>
                <div className="mp-ward-label">{w.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="mp-col-span-2">
          <div className="mp-fav-head">
            <h3>관심 환자</h3>
            <span className="mp-hint">최대 5명</span>
          </div>
          {favList.length === 0 ? (
            <div className="mp-empty">관심 환자가 없습니다.</div>
          ) : (
            <ul className="mp-patient-list">
              {favList.slice(0,5).map(p => (
                <li
                  key={p.id}
                  className="mp-patient-item"
                  onClick={() => {
                    console.log('select patient', p);
                    onSelectPatient && onSelectPatient(p);
                  }}
                >
                  <button
                    className={`mp-bookmark ${p.starred ? 'on' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(p.id);
                    }}
                    aria-label="즐겨찾기"
                  >
                    ★
                  </button>
                  <div className="mp-patient-main">
                    <div className="mp-patient-name">{p.name}</div>
                    <div className="mp-patient-sub">{p.room} • {p.lastImaging}</div>
                  </div>
                  <div className="mp-patient-state">
                    {p.state === 'urgent' && <Badge key={darkMode} color="red">{stateLabel(p.state)}</Badge>}
                    {p.state === 'pending' && <Badge key={darkMode} color="orange">{stateLabel(p.state)}</Badge>}
                    {p.state === 'normal' && <Badge key={darkMode} color="gray">{stateLabel(p.state)}</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: 12 }}>
            <button className="mp-btn-secondary" onClick={() => { console.log('전체 환자 보기'); onViewAll && onViewAll(); }}>전체 환자 보기</button>
          </div>
        </Card>
      </div>
    </Section>
  );
};

export default PatientSummary;




