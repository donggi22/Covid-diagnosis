import React, { useState, useEffect } from 'react';
import { generateTimeOptions, addMinutes, formatDateKorean } from '../../utils/timeCalculations';
import api from '../../utils/api';
import scalpelIcon from '../../logo/scalpel.svg';
import stethoscopeIcon from '../../logo/stethoscope.svg';
import lungIcon from '../../logo/lung.svg';

/**
 * 일정 추가 모달 컴포넌트
 */
const AddScheduleModal = ({ isOpen, onClose, onSuccess, selectedDate, selectedTime }) => {
  // 초기 날짜 정규화 함수
  const getNormalizedDate = (date) => {
    if (!date) {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    }
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    );
  };

  const [formData, setFormData] = useState({
    type: '',
    patientId: '',
    patient: null,
    date: getNormalizedDate(selectedDate),
    startTime: selectedTime || '09:00',
    endTime: '',
    location: '',
    linkedCaseId: '',
    notes: '',
    priority: 'medium'
  });

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [conflictWarning, setConflictWarning] = useState(null);

  const timeOptions = generateTimeOptions(8, 18);
  const locationSuggestions = ['수술실 1', '수술실 2', '진료실 A', '진료실 B', '진료실 C'];

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 환자 검색
  useEffect(() => {
    if (searchQuery.length > 0) {
      const searchPatients = async () => {
        try {
          const response = await api.get(`/api/patients?search=${searchQuery}`);
          setPatients(response.data || []);
          setShowPatientDropdown(true);
        } catch (error) {
          console.error('환자 검색 실패:', error);
          setPatients([]);
        }
      };

      const timeoutId = setTimeout(searchPatients, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setPatients([]);
      setShowPatientDropdown(false);
    }
  }, [searchQuery]);

  // 타입별 기본 지속 시간 설정
  useEffect(() => {
    if (formData.type && formData.startTime) {
      let duration = 60; // 기본 1시간
      if (formData.type === 'surgery') duration = 120; // 2시간
      else if (formData.type === 'xray') duration = 30; // 30분

      const endTime = addMinutes(formData.startTime, duration);
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [formData.type, formData.startTime]);

  // 초기값 설정
  useEffect(() => {
    if (isOpen) {
      // selectedDate가 있으면 로컬 시간대 기준으로 정규화
      let normalizedDate;
      if (selectedDate) {
        normalizedDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0, 0, 0, 0
        );
      } else {
        const today = new Date();
        normalizedDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0, 0, 0, 0
        );
      }
      
      setFormData({
        type: '',
        patientId: '',
        patient: null,
        date: normalizedDate,
        startTime: selectedTime || '09:00',
        endTime: '',
        location: '',
        linkedCaseId: '',
        notes: '',
        priority: 'medium'
      });
      setSearchQuery('');
      setErrors({});
      setConflictWarning(null);
    }
  }, [isOpen, selectedDate, selectedTime]);

  // 시간 충돌 확인
  const checkConflicts = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) return;

    try {
      const startDateTime = new Date(formData.date);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(formData.date);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const response = await api.get('/api/schedules/conflicts', {
        params: {
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString()
        }
      });

      if (response.data && response.data.length > 0) {
        setConflictWarning(response.data);
      } else {
        setConflictWarning(null);
      }
    } catch (error) {
      console.error('충돌 확인 실패:', error);
    }
  };

  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.date) {
      checkConflicts();
    }
    // eslint-disable-next-line
  }, [formData.startTime, formData.endTime, formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // 유효성 검사
    const newErrors = {};
    if (!formData.type) newErrors.type = '일정 유형을 선택해주세요.';
    if (formData.type !== 'xray' && !formData.patientId) {
      newErrors.patientId = '환자를 선택해주세요.';
    }
    if (!formData.startTime || !formData.endTime) {
      newErrors.time = '시작 시간과 종료 시간을 선택해주세요.';
    }
    if (formData.startTime >= formData.endTime) {
      newErrors.time = '종료 시간은 시작 시간보다 늦어야 합니다.';
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = '과거 날짜는 선택할 수 없습니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 충돌 확인
    if (conflictWarning && conflictWarning.length > 0) {
      const proceed = window.confirm(
        `시간이 겹치는 일정이 있습니다. 계속하시겠습니까?\n\n겹치는 일정:\n${conflictWarning.map(s => `- ${s.patient?.name || ''} (${s.startDateTime})`).join('\n')}`
      );
      if (!proceed) return;
    }

    setLoading(true);

    try {
      const startDateTime = new Date(formData.date);
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(formData.date);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const payload = {
        type: formData.type,
        patientId: formData.patientId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        location: formData.location,
        linkedCaseId: formData.linkedCaseId || null,
        notes: formData.notes,
        priority: formData.priority
      };

      await api.post('/api/schedules', payload);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('일정 추가 실패:', error);
      setErrors({ submit: error.response?.data?.message || '일정 추가에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">새 일정 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              일정 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'surgery', icon: scalpelIcon, label: '수술' },
                { value: 'appointment', icon: stethoscopeIcon, label: '진료' },
                { value: 'xray', icon: lungIcon, label: 'X-Ray 검토' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="mb-2 flex justify-center">
                    <img src={type.icon} alt={type.label} className="w-12 h-12" />
                  </div>
                  <div className="font-semibold">{type.label}</div>
                </button>
              ))}
            </div>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          {/* 환자 선택 */}
          {formData.type && formData.type !== 'xray' && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                환자 선택 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value) {
                    setFormData(prev => ({ ...prev, patientId: '', patient: null }));
                  }
                }}
                placeholder="환자 이름 또는 ID로 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showPatientDropdown && patients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {patients.map((patient) => {
                    const patientId = patient._id || patient.id;
                    const displayId = patient.medicalRecordNumber || patient.chartNumber || patient.patientId || patientId;
                    return (
                      <button
                        key={patientId}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            patientId: patientId,
                            patient: patient
                          }));
                          setSearchQuery(`${patient.name} (${displayId})`);
                          setShowPatientDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {displayId} · {patient.age}세 {patient.gender}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
            </div>
          )}

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={(() => {
                  // 로컬 시간대를 유지하면서 날짜 문자열 생성
                  const year = formData.date.getFullYear();
                  const month = String(formData.date.getMonth() + 1).padStart(2, '0');
                  const day = String(formData.date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                onChange={(e) => {
                  // 날짜 문자열을 로컬 시간대 기준으로 파싱
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
                  setFormData(prev => ({ ...prev, date }));
                }}
                min={(() => {
                  // 오늘 날짜를 로컬 시간대 기준으로 생성
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer text-gray-700"
                style={{ 
                  height: '42px',
                  fontSize: '14px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 시간 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer text-gray-700"
                style={{ 
                  height: '42px',
                  fontSize: '14px'
                }}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 시간 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer text-gray-700"
                style={{ 
                  height: '42px',
                  fontSize: '14px'
                }}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}

          {/* 충돌 경고 */}
          {conflictWarning && conflictWarning.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium mb-2">⚠️ 시간 충돌 경고</p>
              <ul className="text-sm text-amber-700 space-y-1">
                {conflictWarning.map((schedule, idx) => (
                  <li key={idx}>
                    - {schedule.patient?.name || '환자 정보 없음'} ({schedule.startDateTime})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 장소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">장소 (선택사항)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="장소를 입력하세요..."
              list="location-suggestions"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <datalist id="location-suggestions">
              {locationSuggestions.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          {/* 케이스 연결 */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData.linkedCaseId}
                onChange={(e) => {
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, linkedCaseId: '' }));
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">기존 케이스와 연결</span>
            </label>
            {formData.linkedCaseId && (
              <input
                type="text"
                value={formData.linkedCaseId}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedCaseId: e.target.value }))}
                placeholder="케이스 ID 입력..."
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">메모 (선택사항)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="추가 메모 입력..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 우선순위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
            <div className="flex gap-4">
              {['low', 'medium', 'high'].map((priority) => (
                <label key={priority} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    {priority === 'low' ? '낮음' : priority === 'medium' ? '보통' : '높음'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '추가 중...' : '일정 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;

