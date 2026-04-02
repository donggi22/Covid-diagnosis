const Schedule = require('../models/Schedule');
const Patient = require('../models/Patient');
const Diagnosis = require('../models/Diagnosis');
const jwt = require('jsonwebtoken');

// 토큰에서 사용자 ID 추출 헬퍼 함수
const getUserIdFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || decoded.userId || decoded._id;
  } catch (error) {
    return null;
  }
};

// 날짜별 일정 조회
exports.getSchedules = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const doctorId = req.user?.id || getUserIdFromToken(req);

    if (!doctorId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    let query = {
      doctorId,
      isDeleted: { $ne: true }
    };

    // 날짜 필터링
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.startDateTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.startDateTime = {
        $gte: start,
        $lte: end
      };
    }

    const schedules = await Schedule.find(query)
      .populate('patientId', 'name age gender patientId medicalRecordNumber')
      .populate('linkedCaseId', 'aiAnalysis imageUrl')
      .sort({ startDateTime: 1 });

    // 프론트엔드 형식에 맞게 변환
    const formattedSchedules = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      return {
        id: scheduleObj._id.toString(),
        type: scheduleObj.type,
        patient: scheduleObj.patientId ? {
          id: scheduleObj.patientId._id.toString(),
          patientId: scheduleObj.patientId.medicalRecordNumber || scheduleObj.patientId.patientId,
          name: scheduleObj.patientId.name,
          age: scheduleObj.patientId.age,
          gender: scheduleObj.patientId.gender
        } : null,
        startDateTime: scheduleObj.startDateTime,
        endDateTime: scheduleObj.endDateTime,
        location: scheduleObj.location || '',
        status: scheduleObj.status,
        statusText: scheduleObj.statusText || getStatusText(scheduleObj.status),
        priority: scheduleObj.priority,
        linkedCase: scheduleObj.linkedCaseId ? {
          id: scheduleObj.linkedCaseId._id.toString(),
          scanType: '흉부 X-Ray',
          aiResult: scheduleObj.linkedCaseId.aiAnalysis?.findings?.[0]?.condition || '정상',
          aiConfidence: Math.round((scheduleObj.linkedCaseId.aiAnalysis?.confidence || 0) * 100),
          reviewed: scheduleObj.linkedCaseId.review?.status === 'approved'
        } : null,
        notes: scheduleObj.notes || '',
        createdAt: scheduleObj.createdAt
      };
    });

    return res.json(formattedSchedules);
  } catch (error) {
    console.error('일정 조회 오류:', error);
    return res.status(500).json({ error: '일정을 불러올 수 없습니다.' });
  }
};

// 다가오는 일정 조회
exports.getUpcomingSchedules = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const doctorId = req.user?.id || getUserIdFromToken(req);

    if (!doctorId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);

    const schedules = await Schedule.find({
      doctorId,
      startDateTime: {
        $gte: now,
        $lte: futureDate
      },
      isDeleted: { $ne: true },
      status: { $in: ['scheduled', 'in-progress'] }
    })
      .populate('patientId', 'name age gender patientId medicalRecordNumber')
      .sort({ startDateTime: 1 })
      .limit(20);

    const formattedSchedules = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      return {
        id: scheduleObj._id.toString(),
        type: scheduleObj.type,
        patient: scheduleObj.patientId ? {
          id: scheduleObj.patientId._id.toString(),
          patientId: scheduleObj.patientId.medicalRecordNumber || scheduleObj.patientId.patientId,
          name: scheduleObj.patientId.name,
          age: scheduleObj.patientId.age,
          gender: scheduleObj.patientId.gender
        } : null,
        startDateTime: scheduleObj.startDateTime,
        endDateTime: scheduleObj.endDateTime,
        status: scheduleObj.status,
        statusText: scheduleObj.statusText || getStatusText(scheduleObj.status),
        priority: scheduleObj.priority
      };
    });

    return res.json(formattedSchedules);
  } catch (error) {
    console.error('다가오는 일정 조회 오류:', error);
    return res.status(500).json({ error: '다가오는 일정을 불러올 수 없습니다.' });
  }
};

// 시간 충돌 확인
exports.checkConflicts = async (req, res) => {
  try {
    const { start, end } = req.query;
    const doctorId = req.user?.id || getUserIdFromToken(req);

    if (!doctorId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!start || !end) {
      return res.status(400).json({ error: '시작 시간과 종료 시간이 필요합니다.' });
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    // 시간이 겹치는 일정 찾기
    const conflicts = await Schedule.find({
      doctorId,
      isDeleted: { $ne: true },
      status: { $in: ['scheduled', 'in-progress'] },
      $or: [
        {
          startDateTime: { $lt: endTime },
          endDateTime: { $gt: startTime }
        }
      ]
    })
      .populate('patientId', 'name')
      .select('startDateTime endDateTime patientId type');

    return res.json(conflicts);
  } catch (error) {
    console.error('충돌 확인 오류:', error);
    return res.status(500).json({ error: '충돌 확인 중 오류가 발생했습니다.' });
  }
};

// 일정 생성
exports.createSchedule = async (req, res) => {
  try {
    const { type, patientId, startDateTime, endDateTime, location, linkedCaseId, notes, priority } = req.body;
    const doctorId = req.user?.id || getUserIdFromToken(req);

    if (!doctorId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!type || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: '일정 유형, 시작 시간, 종료 시간은 필수입니다.' });
    }

    // 환자 확인 (환자 관련 일정인 경우)
    if (patientId && type !== 'xray' && type !== 'meeting' && type !== 'other') {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
      }
    }

    // 진단 케이스 확인 (linkedCaseId가 있는 경우)
    if (linkedCaseId) {
      const diagnosis = await Diagnosis.findById(linkedCaseId);
      if (!diagnosis) {
        return res.status(404).json({ error: '해당 진단 기록을 찾을 수 없습니다.' });
      }
    }

    const schedule = await Schedule.create({
      type,
      patientId: patientId || null,
      doctorId,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      location: location || '',
      linkedCaseId: linkedCaseId || null,
      notes: notes || '',
      priority: priority || 'medium',
      status: 'scheduled',
      statusText: '예정'
    });

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('patientId', 'name age gender patientId medicalRecordNumber')
      .populate('linkedCaseId', 'aiAnalysis imageUrl');

    return res.status(201).json({
      message: '일정이 생성되었습니다.',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error('일정 생성 오류:', error);
    return res.status(500).json({ error: '일정을 생성할 수 없습니다.' });
  }
};

// 일정 수정
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const doctorId = req.user?.id || getUserIdFromToken(req);

    if (!doctorId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }

    // 본인의 일정만 수정 가능
    if (schedule.doctorId.toString() !== doctorId) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 날짜/시간 필드 변환
    if (updateData.startDateTime) {
      updateData.startDateTime = new Date(updateData.startDateTime);
    }
    if (updateData.endDateTime) {
      updateData.endDateTime = new Date(updateData.endDateTime);
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name age gender patientId medicalRecordNumber')
      .populate('linkedCaseId', 'aiAnalysis imageUrl');

    return res.json({
      message: '일정이 수정되었습니다.',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('일정 수정 오류:', error);
    return res.status(500).json({ error: '일정을 수정할 수 없습니다.' });
  }
};

// 일정 삭제
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user?.id || getUserIdFromToken(req);

    if (!doctorId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' });
    }

    // 본인의 일정만 삭제 가능
    if (schedule.doctorId.toString() !== doctorId) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 소프트 삭제
    await Schedule.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date()
    });

    return res.json({ message: '일정이 삭제되었습니다.' });
  } catch (error) {
    console.error('일정 삭제 오류:', error);
    return res.status(500).json({ error: '일정을 삭제할 수 없습니다.' });
  }
};

// 상태 텍스트 헬퍼 함수
function getStatusText(status) {
  const statusMap = {
    'scheduled': '예정',
    'completed': '완료',
    'cancelled': '취소',
    'in-progress': '진행중'
  };
  return statusMap[status] || '예정';
}








