const express = require('express');
const scheduleController = require('../controllers/scheduleController');
// const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// 일정 조회
router.get('/', scheduleController.getSchedules);

// 다가오는 일정 조회
router.get('/upcoming', scheduleController.getUpcomingSchedules);

// 시간 충돌 확인
router.get('/conflicts', scheduleController.checkConflicts);

// 일정 생성
router.post('/', scheduleController.createSchedule);

// 일정 수정
router.put('/:id', scheduleController.updateSchedule);

// 일정 삭제
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;








