const Patient = require('../models/Patient');

exports.getPatients = async (req, res) => {
  try {
    const { gender, status, minAge, maxAge, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // 필터 조건 구성
    const query = { isDeleted: { $ne: true } }; // 삭제되지 않은 환자만 조회 (필드 없으면 포함)

    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (minAge !== undefined || maxAge !== undefined) {
      query.age = {};
      if (minAge !== undefined) {
        query.age.$gte = parseInt(minAge);
      }
      if (maxAge !== undefined) {
        query.age.$lte = parseInt(maxAge);
      }
    }

    // 검색 기능 (이름, 차트번호, 환자ID로 검색)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { medicalRecordNumber: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const patients = await Patient.find(query).sort(sortOptions).limit(50); // 검색 결과 제한
    return res.json(patients);
  } catch (error) {
    console.error('환자 목록 조회 오류:', error);
    return res.status(500).json({ error: '환자 목록을 불러올 수 없습니다.' });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
    }

    return res.json(patient);
  } catch (error) {
    console.error('환자 조회 오류:', error);
    return res.status(500).json({ error: '환자 정보를 가져올 수 없습니다.' });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { name, age, gender, roomNumber, medicalRecordNumber, status, symptoms } = req.body;

    if (!name) {
      return res.status(400).json({ error: '환자 이름은 필수입니다.' });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      roomNumber,
      medicalRecordNumber,
      status,
      symptoms,
      doctorId: req.user?.id,
    });

    return res.status(201).json(patient);
  } catch (error) {
    console.error('환자 생성 오류:', error);
    return res.status(500).json({ error: '환자를 생성할 수 없습니다.' });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const updates = req.body;
    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!patient) {
      return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
    }

    return res.json(patient);
  } catch (error) {
    console.error('환자 업데이트 오류:', error);
    return res.status(500).json({ error: '환자 정보를 수정할 수 없습니다.' });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    // 소프트 삭제: isDeleted를 true로 설정
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
    }

    return res.json({ message: '환자 정보가 삭제되었습니다. (30일 후 자동 삭제)' });
  } catch (error) {
    console.error('환자 삭제 오류:', error);
    return res.status(500).json({ error: '환자 정보를 삭제할 수 없습니다.' });
  }
};
