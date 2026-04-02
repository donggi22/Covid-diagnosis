const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
const http = require('http');
const Diagnosis = require('../models/Diagnosis');
const Patient = require('../models/Patient');

// localhost 대신 127.0.0.1 사용 (Windows IPv6 DNS 지연 문제 해결)
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

// HTTP Agent 설정: keepAlive 비활성화로 즉시 연결 종료
const httpAgent = new http.Agent({
  keepAlive: false,       // 연결 즉시 종료 (응답 후 대기 시간 제거)
  maxSockets: 10,         // 동시 연결 수
  timeout: 60000          // 요청 타임아웃
});

// Socket 연결 시 TCP_NODELAY 설정 (Nagle 알고리즘 비활성화)
httpAgent.on('socket', (socket) => {
  socket.setNoDelay(true);  // 작은 패킷도 즉시 전송
});

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
    // 토큰이 없거나 유효하지 않으면 null 반환
    return null;
  }
};

exports.getDiagnoses = async (req, res) => {
  try {
    const { status, dateFrom, dateTo, minConfidence, maxConfidence, patientName } = req.query;

    // 필터 조건 구성
    const query = {};

    // 상태 필터
    if (status && status !== 'all') {
      query['review.status'] = status;
    }

    // 날짜 범위 필터
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // dateTo는 해당 날짜의 끝까지 포함
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // 신뢰도 범위 필터
    if (minConfidence !== undefined || maxConfidence !== undefined) {
      query['aiAnalysis.confidence'] = {};
      if (minConfidence !== undefined) {
        query['aiAnalysis.confidence'].$gte = parseFloat(minConfidence) / 100;
      }
      if (maxConfidence !== undefined) {
        query['aiAnalysis.confidence'].$lte = parseFloat(maxConfidence) / 100;
      }
    }

    let diagnoses = await Diagnosis.find(query)
      .populate('patientId')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    // 환자 이름 필터 (populate 후 필터링)
    if (patientName) {
      diagnoses = diagnoses.filter(d =>
        d.patientId && d.patientId.name &&
        d.patientId.name.toLowerCase().includes(patientName.toLowerCase())
      );
    }

    return res.json(diagnoses);
  } catch (error) {
    console.error('진단 목록 조회 오류:', error);
    return res.status(500).json({ error: '진단 목록을 불러올 수 없습니다.' });
  }
};

exports.getDiagnosisById = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId', 'name email');

    if (!diagnosis) {
      return res.status(404).json({ error: '진단 정보를 찾을 수 없습니다.' });
    }

    return res.json(diagnosis);
  } catch (error) {
    console.error('진단 조회 오류:', error);
    return res.status(500).json({ error: '진단 정보를 가져올 수 없습니다.' });
  }
};

// AI 분석만 수행 (저장 안함)
exports.analyzeOnly = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId는 필수입니다.' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
    }

    const imagePath = req.file ? path.join(__dirname, '..', 'uploads', req.file.filename) : null;

    if (!imagePath) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    let aiAnalysis;

    try {
      const formDataStartTime = Date.now();
      console.log('[1/4] FormData 생성 시작...');

      // FormData를 사용하여 파일을 Stream으로 전송 (최적화)
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath), {
        filename: req.file.originalname || path.basename(imagePath),
        contentType: req.file.mimetype || 'image/png'
      });
      formData.append('patient_id', patientId || '');
      if (req.body.notes) {
        formData.append('notes', req.body.notes);
      }

      console.log(`✓ FormData 생성 완료: ${(Date.now() - formDataStartTime) / 1000}초\n`);

      console.log('[2/4] FastAPI 요청 준비...');
      console.log('   - URL:', `${FASTAPI_URL}/api/ai/diagnose`);
      console.log('   - patient_id:', patientId);
      console.log('   - image_file:', imagePath);
      console.log('   - filename:', req.file.originalname);

      const requestStartTime = Date.now();
      console.log('[3/4] FastAPI 요청 전송 시작...\n');

      let uploadEndTime = null;
      const fastApiResponse = await axios.post(
        `${FASTAPI_URL}/api/ai/diagnose`,
        formData,
        {
          timeout: 60000,               // 60초 타임아웃
          headers: {
            ...formData.getHeaders(),
            'Connection': 'close'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          // httpAgent 제거 - axios 기본값 사용
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (percentCompleted % 25 === 0) {
                console.log(`   업로드 진행: ${percentCompleted}%`);
              }
              if (percentCompleted === 100 && !uploadEndTime) {
                uploadEndTime = Date.now();
                console.log(`   ⏱️ 업로드 완료 시간: ${(uploadEndTime - requestStartTime) / 1000}초`);
                console.log(`   ⏳ FastAPI 처리 대기 중...`);
              }
            }
          }
        }
      );
      const requestEndTime = Date.now();
      console.log(`\n✓ FastAPI 응답 수신 완료: ${(requestEndTime - requestStartTime) / 1000}초`);
      if (uploadEndTime) {
        console.log(`   📊 상세 타이밍:`);
        console.log(`      - 업로드: ${(uploadEndTime - requestStartTime) / 1000}초`);
        console.log(`      - FastAPI 처리 + 응답: ${(requestEndTime - uploadEndTime) / 1000}초`);
      }

      // 응답 크기 및 헤더 정보 출력
      const responseSize = JSON.stringify(fastApiResponse.data).length;
      const responseSizeKB = (responseSize / 1024).toFixed(2);
      console.log(`   📦 응답 크기: ${responseSize} bytes (${responseSizeKB} KB)`);
      console.log(`   📋 Content-Length: ${fastApiResponse.headers['content-length'] || 'N/A'}`);
      console.log(`   🔧 Transfer-Encoding: ${fastApiResponse.headers['transfer-encoding'] || 'N/A'}`);

      console.log('[4/4] 응답 데이터 처리 시작...\n');

      const data = fastApiResponse.data;

      aiAnalysis = {
        confidence: data.confidence ?? 0,
        findings: Array.isArray(data.findings)
          ? data.findings.map((finding) => ({
              condition: finding.condition || '알 수 없음',
              probability: finding.probability ?? 0,
              description: finding.description || '',
            }))
          : [],
        recommendations: data.recommendations || [],
        aiNotes: data.ai_notes || data.aiNotes || 'UNet 기반 폐 분할 + ResNet50 기반 COVID-19 분류 모델 추론 결과입니다.',
        predictedClass: data.predicted_class || null,
        gradcamPath: data.gradcam_path || null,
        gradcamPlusPath: data.gradcam_plus_path || null,
        layercamPath: data.layercam_path || null,
      };
    } catch (fastApiError) {
      console.error('FastAPI 호출 실패:');
      console.error('에러 메시지:', fastApiError.message);
      console.error('에러 응답:', fastApiError.response?.data);
      console.error('요청 URL:', `${FASTAPI_URL}/api/ai/diagnose`);
      console.error('이미지 경로:', imagePath);
      console.error('전체 에러:', fastApiError);
      return res.status(503).json({ 
        error: 'AI 진단 서비스를 사용할 수 없습니다. FastAPI 서버를 확인해주세요.',
        details: fastApiError.message 
      });
    }

    // 분석 결과만 반환 (저장 안함) - 프론트엔드가 기대하는 형식으로 직접 반환
    return res.status(200).json({
      confidence: aiAnalysis.confidence,
      findings: aiAnalysis.findings,
      recommendations: aiAnalysis.recommendations,
      aiNotes: aiAnalysis.aiNotes,
      predictedClass: aiAnalysis.predictedClass,
      gradcamPath: aiAnalysis.gradcamPath,
      gradcamPlusPath: aiAnalysis.gradcamPlusPath,
      layerCamPath: aiAnalysis.layercamPath, // 진단 시 사용 (하위 호환성)
      layercamPath: aiAnalysis.layercamPath, // 진단 이력에서 사용
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
  } catch (error) {
    console.error('AI 분석 오류:', error);
    return res.status(500).json({ error: 'AI 분석을 수행할 수 없습니다.' });
  }
};

exports.createDiagnosis = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId는 필수입니다.' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
    }

    const imagePath = req.file ? path.join(__dirname, '..', 'uploads', req.file.filename) : null;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imagePath) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    let aiAnalysis;

    try {
      const formDataStartTime = Date.now();
      console.log('[1/4] FormData 생성 시작...');

      // FormData를 사용하여 파일을 Stream으로 전송 (최적화)
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath), {
        filename: req.file.originalname || path.basename(imagePath),
        contentType: req.file.mimetype || 'image/png'
      });
      formData.append('patient_id', patientId || '');
      if (req.body.notes) {
        formData.append('notes', req.body.notes);
      }

      console.log(`✓ FormData 생성 완료: ${(Date.now() - formDataStartTime) / 1000}초\n`);

      console.log('[2/4] FastAPI 요청 준비...');
      console.log('   - URL:', `${FASTAPI_URL}/api/ai/diagnose`);
      console.log('   - patient_id:', patientId);
      console.log('   - image_file:', imagePath);
      console.log('   - filename:', req.file.originalname);

      // FastAPI에 진단 요청
      const requestStartTime = Date.now();
      console.log('[3/4] FastAPI 요청 전송 시작...\n');

      let uploadEndTime = null;
      const fastApiResponse = await axios.post(
        `${FASTAPI_URL}/api/ai/diagnose`,
        formData,
        {
          timeout: 60000,               // 60초 타임아웃
          headers: {
            ...formData.getHeaders(),
            'Connection': 'close'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          // httpAgent 제거 - axios 기본값 사용
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (percentCompleted % 25 === 0) {
                console.log(`   업로드 진행: ${percentCompleted}%`);
              }
              if (percentCompleted === 100 && !uploadEndTime) {
                uploadEndTime = Date.now();
                console.log(`   ⏱️ 업로드 완료 시간: ${(uploadEndTime - requestStartTime) / 1000}초`);
                console.log(`   ⏳ FastAPI 처리 대기 중...`);
              }
            }
          }
        }
      );
      const requestEndTime = Date.now();
      console.log(`\n✓ FastAPI 응답 수신 완료: ${(requestEndTime - requestStartTime) / 1000}초`);
      if (uploadEndTime) {
        console.log(`   📊 상세 타이밍:`);
        console.log(`      - 업로드: ${(uploadEndTime - requestStartTime) / 1000}초`);
        console.log(`      - FastAPI 처리 + 응답: ${(requestEndTime - uploadEndTime) / 1000}초`);
      }

      // 응답 크기 및 헤더 정보 출력
      const responseSize = JSON.stringify(fastApiResponse.data).length;
      const responseSizeKB = (responseSize / 1024).toFixed(2);
      console.log(`   📦 응답 크기: ${responseSize} bytes (${responseSizeKB} KB)`);
      console.log(`   📋 Content-Length: ${fastApiResponse.headers['content-length'] || 'N/A'}`);
      console.log(`   🔧 Transfer-Encoding: ${fastApiResponse.headers['transfer-encoding'] || 'N/A'}`);

      console.log('[4/4] 응답 데이터 처리 시작...\n');

      const data = fastApiResponse.data;

      // AI 분석 결과 포맷팅
      aiAnalysis = {
        confidence: data.confidence ?? 0,
        findings: Array.isArray(data.findings)
          ? data.findings.map((finding) => ({
              condition: finding.condition || '알 수 없음',
              probability: finding.probability ?? 0,
              description: finding.description || '',
            }))
          : [],
        recommendations: data.recommendations || [],
        aiNotes: data.ai_notes || data.aiNotes || 'UNet 기반 폐 분할 + ResNet50 기반 COVID-19 분류 모델 추론 결과입니다.',
        predictedClass: data.predicted_class || null,
        gradcamPath: data.gradcam_path || null,
        gradcamPlusPath: data.gradcam_plus_path || null,
        layercamPath: data.layercam_path || null,
      };
    } catch (fastApiError) {
      console.error('FastAPI 호출 실패:');
      console.error('에러 메시지:', fastApiError.message);
      console.error('에러 응답:', fastApiError.response?.data);
      return res.status(503).json({ 
        error: 'AI 진단 서비스를 사용할 수 없습니다. FastAPI 서버를 확인해주세요.',
        details: fastApiError.message 
      });
    }

    // doctorId 추출: req.user (인증 미들웨어) 또는 토큰에서 직접 추출
    const doctorId = req.user?.id || getUserIdFromToken(req);
    
    // 분석 결과를 MongoDB에 저장
    const diagnosis = await Diagnosis.create({
      patientId,
      doctorId: doctorId || null,
      imageUrl: imageUrl || null,
      aiAnalysis,
    });
    
    if (!doctorId) {
      console.log('⚠️ 경고: doctorId가 저장되지 않았습니다. 토큰이 없거나 유효하지 않습니다.');
    } else {
      console.log(`✅ doctorId 저장됨: ${doctorId}`);
    }

    return res.status(201).json({
      message: '진단이 저장되었습니다.',
      diagnosis,
    });
  } catch (error) {
    console.error('진단 저장 오류:', error);
    return res.status(500).json({ error: '진단을 저장할 수 없습니다.' });
  }
};

// 이미 분석된 결과를 저장 (이미지 파일 없이)
exports.saveDiagnosis = async (req, res) => {
  try {
    const { patientId, aiAnalysis, imageUrl } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId는 필수입니다.' });
    }

    if (!aiAnalysis) {
      return res.status(400).json({ error: 'AI 분석 결과가 필요합니다.' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: '해당 환자를 찾을 수 없습니다.' });
    }

    // doctorId 추출: req.user (인증 미들웨어) 또는 토큰에서 직접 추출
    const doctorId = req.user?.id || getUserIdFromToken(req);

    // 분석 결과를 MongoDB에 저장
    const diagnosis = await Diagnosis.create({
      patientId,
      doctorId: doctorId || null,
      imageUrl: imageUrl || null,
      aiAnalysis,
    });

    if (!doctorId) {
      console.log('⚠️ 경고: doctorId가 저장되지 않았습니다. 토큰이 없거나 유효하지 않습니다.');
    } else {
      console.log(`✅ doctorId 저장됨: ${doctorId}`);
    }

    return res.status(201).json({
      message: '진단이 저장되었습니다.',
      diagnosis,
    });
  } catch (error) {
    console.error('진단 저장 오류:', error);
    return res.status(500).json({ error: '진단을 저장할 수 없습니다.' });
  }
};

exports.reviewDiagnosis = async (req, res) => {
  try {
    const { summary, notes, status } = req.body;

    const diagnosis = await Diagnosis.findByIdAndUpdate(
      req.params.id,
      {
        review: {
          summary,
          notes,
          status,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).populate('patientId');

    if (!diagnosis) {
      return res.status(404).json({ error: '진단 정보를 찾을 수 없습니다.' });
    }

    return res.json({
      message: '진단 검토가 업데이트되었습니다.',
      diagnosis,
    });
  } catch (error) {
    console.error('진단 검토 오류:', error);
    return res.status(500).json({ error: '진단 검토를 업데이트할 수 없습니다.' });
  }
};
