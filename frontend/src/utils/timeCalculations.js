/**
 * 시간 및 위치 계산 유틸리티 함수
 */

/**
 * 시간을 타임라인 위치(픽셀)로 변환
 * @param {string} time - "HH:MM" 형식의 시간
 * @param {number} hourHeight - 시간당 높이 (기본값: 80px)
 * @returns {number} 픽셀 위치
 */
export function timeToPosition(time, hourHeight = 80) {
  const [hours, minutes] = time.split(':').map(Number);
  const baseHour = 0; // 0am 시작
  const hourOffset = hours - baseHour;
  const minuteOffset = minutes / 60;
  return (hourOffset + minuteOffset) * hourHeight;
}

/**
 * 현재 시간의 타임라인 위치 계산
 * @param {number} hourHeight - 시간당 높이 (기본값: 80px)
 * @returns {number} 픽셀 위치
 */
export function getCurrentTimePosition(hourHeight = 80) {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return timeToPosition(time, hourHeight);
}

/**
 * 날짜를 한국어 형식으로 포맷
 * @param {Date} date - 날짜 객체
 * @returns {string} "2025년 11월 17일 (월요일)" 형식
 */
export function formatDateKorean(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek}요일)`;
}

/**
 * 시간이 업무 시간 내인지 확인 (00:00 - 24:00, 항상 true)
 * @param {string} time - "HH:MM" 형식의 시간
 * @returns {boolean}
 */
export function isBusinessHours(time) {
  const [hours] = time.split(':').map(Number);
  return hours >= 0 && hours < 24;
}

/**
 * 두 시간 사이의 지속 시간 계산
 * @param {string} startTime - 시작 시간 "HH:MM"
 * @param {string} endTime - 종료 시간 "HH:MM"
 * @returns {{hours: number, minutes: number, totalMinutes: number}}
 */
export function calculateDuration(startTime, endTime) {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, totalMinutes };
}

/**
 * Date 객체에서 시간 문자열 추출
 * @param {Date} date - 날짜 객체
 * @returns {string} "HH:MM" 형식
 */
export function getTimeString(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 날짜 문자열에서 시간 추출
 * @param {string} dateTimeString - ISO 날짜 문자열
 * @returns {string} "HH:MM" 형식
 */
export function extractTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return getTimeString(date);
}

/**
 * 두 일정이 시간상 겹치는지 확인
 * @param {Object} schedule1 - 첫 번째 일정
 * @param {Object} schedule2 - 두 번째 일정
 * @returns {boolean}
 */
export function hasTimeConflict(schedule1, schedule2) {
  const start1 = new Date(schedule1.startDateTime);
  const end1 = new Date(schedule1.endDateTime);
  const start2 = new Date(schedule2.startDateTime);
  const end2 = new Date(schedule2.endDateTime);

  return (start1 < end2 && start2 < end1);
}

/**
 * 일정의 높이 계산 (지속 시간 기반)
 * @param {string} startTime - 시작 시간 "HH:MM"
 * @param {string} endTime - 종료 시간 "HH:MM"
 * @param {number} hourHeight - 시간당 높이 (기본값: 80px)
 * @returns {number} 픽셀 높이
 */
export function calculateScheduleHeight(startTime, endTime, hourHeight = 80) {
  const { totalMinutes } = calculateDuration(startTime, endTime);
  return (totalMinutes / 60) * hourHeight;
}

/**
 * 15분 간격의 시간 옵션 생성
 * @param {number} startHour - 시작 시간 (기본값: 0)
 * @param {number} endHour - 종료 시간 (기본값: 24)
 * @returns {Array<string>} ["00:00", "00:15", ...] 형식의 배열
 */
export function generateTimeOptions(startHour = 0, endHour = 24) {
  const options = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
}

/**
 * 시간에 분을 더하기
 * @param {string} time - "HH:MM" 형식
 * @param {number} minutes - 더할 분
 * @returns {string} "HH:MM" 형식
 */
export function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

