import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AIDiagnosis.css';
import { patientAPI, diagnosisAPI } from '../utils/api';
import MainLayout from './layout/MainLayout';
import DiagnosisModal from './DiagnosisModal';

const AIDiagnosis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: '',
    roomNumber: '',
    medicalRecordNumber: '',
    symptoms: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 환자 목록 불러오기
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientAPI.getPatients();
        setPatients(data || []);
      } catch (err) {
        console.error('환자 목록 조회 오류:', err);
      }
    };

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
      fetchPatients();
    } else {
      navigate('/');
    }
  }, [navigate]);

  // 전달받은 환자 정보가 있다면 자동 선택
  useEffect(() => {
    // 1. 전달받은 전체 데이터가 있는 경우 - 즉시 셋팅
    if (location.state?.patient) {
      const p = location.state.patient;
      setSelectedPatientId(p._id);
      setPatientInfo({
        name: p.name,
        age: p.age || '',
        gender: p.gender || '',
        symptoms: ''
      });
      // 처리 후 state 초기화
      window.history.replaceState({}, document.title);
    } 
    // 2. ID만 있는 경우 - 목록이 로드될 때까지 대기 후 셋팅
    else if (patients.length > 0 && location.state?.patientId) {
      const pId = location.state.patientId;
      const patient = patients.find(p => p._id === pId);
      
      if (patient) {
        setSelectedPatientId(pId);
        setPatientInfo({
          name: patient.name,
          age: patient.age || '',
          gender: patient.gender || '',
          roomNumber: patient.roomNumber || '',
          medicalRecordNumber: patient.medicalRecordNumber || '',
          symptoms: ''
        });
        window.history.replaceState({}, document.title);
      }
    }
  }, [patients, location.state]);

  // 파일 검증 함수
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.dcm')) {
      setError('지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP, DICOM만 지원)');
      return false;
    }

    return true;
  };

  const processFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    setError('');
    setSelectedFile(file);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      }
    };

    reader.onload = (e) => {
      setPreview(e.target.result);
      setUploadProgress(100);
    };

    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('이미지를 업로드해주세요.');
      return;
    }

    if (!selectedPatientId && !patientInfo.name) {
      alert('환자를 선택하거나 환자 정보를 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setDiagnosisResult(null);

    try {
      // 환자 ID가 없으면 먼저 환자 등록
      let patientId = selectedPatientId;

      if (!patientId && patientInfo.name) {
        // 새 환자 등록
        const newPatient = await patientAPI.createPatient({
          name: patientInfo.name,
          age: patientInfo.age ? parseInt(patientInfo.age) : undefined,
          gender: patientInfo.gender || undefined,
          roomNumber: patientInfo.roomNumber || undefined,
          medicalRecordNumber: patientInfo.medicalRecordNumber || undefined
        });
        patientId = newPatient._id;
      }

      // AI 분석만 수행 (저장 안함)
      const result = await diagnosisAPI.analyzeOnly(patientId, selectedFile);

      // AI 분석 결과 포맷팅
      if (result) {
        // confidence를 퍼센트로 변환
        const confidence = Math.round((result.confidence || 0) * 100);

        // findings 포맷팅
        const findings = (result.findings || []).map(finding => ({
          condition: finding.condition || '알 수 없음',
          probability: Math.round((finding.probability || 0) * 100),
          description: finding.description || ''
        }));

        // predicted_class가 있으면 첫 번째 finding으로 설정
        const primaryFinding = result.predictedClass
          ? findings.find(f => f.condition === result.predictedClass) || findings[0]
          : findings[0];

        setDiagnosisResult({
          confidence,
          predictedClass: result.predictedClass || primaryFinding?.condition || '알 수 없음',
          findings: findings.length > 0 ? findings : [{
            condition: '정상',
            probability: 100 - confidence,
            description: '특별한 이상 소견이 발견되지 않았습니다.'
          }],
          recommendations: result.recommendations || [],
          aiNotes: result.aiNotes || result.ai_notes || 'UNet 기반 폐 분할 + ResNet50 기반 흉부 엑스레이 질환 분류 추론 결과입니다.',
          gradcamUrl: result.gradcamPath || result.gradcamUrl || null,
          gradcamPlusUrl: result.gradcamPlusPath || result.gradcamPlusUrl || null,
          layerCamUrl: result.layerCamPath || result.layerCamUrl || null,
          patientId: patientId,
          imageUrl: result.imageUrl || null
        });

        // 모달 열기
        setIsModalOpen(true);
      } else {
        throw new Error('AI 분석 결과를 받을 수 없습니다.');
      }
    } catch (err) {
      console.error('진단 오류:', err);
      setError(err.response?.data?.error || '진단 중 오류가 발생했습니다.');
      alert(err.response?.data?.error || '진단 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!diagnosisResult) {
      alert('저장할 진단 결과가 없습니다.');
      return;
    }

    try {
      const saveData = {
        patientId: diagnosisResult.patientId,
        aiAnalysis: {
          confidence: diagnosisResult.confidence / 100,
          findings: diagnosisResult.findings.map(f => ({
            condition: f.condition,
            probability: f.probability / 100,
            description: f.description
          })),
          recommendations: diagnosisResult.recommendations,
          aiNotes: diagnosisResult.aiNotes,
          predictedClass: diagnosisResult.predictedClass,
          gradcamPath: diagnosisResult.gradcamUrl,
          gradcamPlusPath: diagnosisResult.gradcamPlusUrl,
          layercamPath: diagnosisResult.layerCamUrl || diagnosisResult.layercamUrl
        },
        imageUrl: diagnosisResult.imageUrl,
        symptoms: patientInfo.symptoms,
        review: {
          status: 'pending',
          summary: '진단 결과 저장됨',
          notes: 'AI 진단 결과가 저장되었습니다.',
          updatedAt: new Date()
        }
      };

      const result = await diagnosisAPI.saveDiagnosis(saveData);

      if (result && result.diagnosis) {
        alert('진단 결과가 저장되었습니다.');
        setIsModalOpen(false);
        navigate('/history');
      } else {
        throw new Error('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('저장 오류:', err);
      alert(err.response?.data?.error || '진단 결과 저장 중 오류가 발생했습니다.');
    }
  };


  return (
    <MainLayout>
      <div className="ai-diagnosis-content">
        <div className="container">
          <div className="diagnosis-grid">
            {/* 환자 정보 입력 */}
            <div className="card">
              <h2>환자 정보</h2>
              <div className="form-group">
                <label className="form-label">기존 환자 선택</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setSelectedPatientId(pId);
                    if (pId) {
                      const patient = patients.find(p => p._id === pId);
                      if (patient) {
                        setPatientInfo({
                          name: patient.name,
                          age: patient.age || '',
                          gender: patient.gender || '',
                          roomNumber: patient.roomNumber || '',
                          medicalRecordNumber: patient.medicalRecordNumber || '',
                          symptoms: ''
                        });
                      }
                    } else {
                      // 선택 해제 시 필드 초기화
                      setPatientInfo({
                        name: '',
                        age: '',
                        gender: '',
                        roomNumber: '',
                        medicalRecordNumber: '',
                        symptoms: ''
                      });
                    }
                  }}
                  className="form-input"
                >
                  <option value="">환자를 선택하세요</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.age}세, {patient.gender})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>
                또는
              </div>
              <div className="form-group">
                <label className="form-label">
                  새 환자 정보 입력 {selectedPatientId && <span style={{fontSize: '11px', color: '#6366f1', fontWeight: '500', marginLeft: '6px'}}>(기존 환자 선택됨)</span>}
                </label>
                <input
                  type="text"
                  value={patientInfo.name}
                  readOnly={!!selectedPatientId}
                  onChange={(e) => {
                    setPatientInfo({ ...patientInfo, name: e.target.value });
                    setSelectedPatientId(''); // 새 환자 입력 시 선택 해제
                  }}
                  className={`form-input ${selectedPatientId ? 'input-locked' : ''}`}
                  placeholder="환자 이름을 입력하세요"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">나이</label>
                  <input
                    type="number"
                    value={patientInfo.age}
                    readOnly={!!selectedPatientId}
                    onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                    className={`form-input ${selectedPatientId ? 'input-locked' : ''}`}
                    placeholder="나이"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">성별</label>
                  <select
                    value={patientInfo.gender}
                    disabled={!!selectedPatientId}
                    onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                    className={`form-input ${selectedPatientId ? 'input-locked' : ''}`}
                  >
                    <option value="">선택</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">차트번호</label>
                  <input
                    type="text"
                    value={patientInfo.medicalRecordNumber}
                    readOnly={!!selectedPatientId}
                    onChange={(e) => setPatientInfo({ ...patientInfo, medicalRecordNumber: e.target.value })}
                    className={`form-input ${selectedPatientId ? 'input-locked' : ''}`}
                    placeholder="차트번호"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">병실번호</label>
                  <input
                    type="text"
                    value={patientInfo.roomNumber}
                    readOnly={!!selectedPatientId}
                    onChange={(e) => setPatientInfo({ ...patientInfo, roomNumber: e.target.value })}
                    className={`form-input ${selectedPatientId ? 'input-locked' : ''}`}
                    placeholder="예: 501호"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">증상 (선택사항)</label>
                <textarea
                  value={patientInfo.symptoms}
                  onChange={(e) => setPatientInfo({ ...patientInfo, symptoms: e.target.value })}
                  className="form-textarea"
                  placeholder="환자의 증상을 입력하세요"
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="card upload-card">
              <h2>의료 영상 업로드</h2>
              <div className="upload-section">
                {preview ? (
                  <div className="image-preview">
                    <div className="image-preview-content">
                      <img src={preview} alt="업로드된 이미지" />
                      {selectedFile && (
                        <div className="file-info">
                          <p><strong>파일명:</strong> {selectedFile.name}</p>
                          <p><strong>크기:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`upload-area ${isDragging ? 'dragging' : ''}`}
                    onClick={() => fileInputRef.current.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="upload-icon">📁</div>
                    <p>이미지를 클릭하거나 드래그하여 업로드</p>
                    <p className="upload-hint">JPG, PNG, GIF, WEBP, DICOM 파일 지원</p>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="upload-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="progress-text">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.dcm"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  aria-label="의료 영상 파일 선택"
                />
              </div>
              <div className="upload-card-actions">
                {preview && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setUploadProgress(0);
                      fileInputRef.current.value = '';
                    }}
                    className="btn btn-danger btn-large"
                  >
                    이미지 제거
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || (!selectedPatientId && !patientInfo.name) || isAnalyzing}
                  className="btn btn-primary btn-large"
                >
                  {isAnalyzing ? 'AI 분석 중...' : 'AI 진단 시작'}
                </button>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="card" style={{ backgroundColor: '#fee', border: '1px solid #fcc' }}>
              <p style={{ color: '#c00', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* 진단 결과 모달 */}
      {diagnosisResult && (
        <DiagnosisModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={{
            originalImage: preview || null,
            gradcam: diagnosisResult.gradcamUrl
              ? (diagnosisResult.gradcamUrl.startsWith('http') ? diagnosisResult.gradcamUrl : `${process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000'}${diagnosisResult.gradcamUrl}`)
              : null,
            gradcamPP: diagnosisResult.gradcamPlusUrl
              ? (diagnosisResult.gradcamPlusUrl.startsWith('http') ? diagnosisResult.gradcamPlusUrl : `${process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000'}${diagnosisResult.gradcamPlusUrl}`)
              : null,
            layercam: diagnosisResult.layerCamUrl
              ? (diagnosisResult.layerCamUrl.startsWith('http') ? diagnosisResult.layerCamUrl : `${process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000'}${diagnosisResult.layerCamUrl}`)
              : null,
            findings: diagnosisResult.findings || [],
            confidence: diagnosisResult.confidence || 0,
            recommendation: diagnosisResult.recommendations && diagnosisResult.recommendations.length > 0
              ? diagnosisResult.recommendations.join(' ')
              : '추가 검진을 권장합니다.',
            aiNotes: diagnosisResult.aiNotes || 'UNet 기반 폐 분할 + ResNet50 기반 흉부 엑스레이 질환 분류 추론 결과입니다.'
          }}
          onSave={() => handleSaveDiagnosis()}
          mode="save"
          onNewDiagnosis={() => {
            setIsModalOpen(false);
            setDiagnosisResult(null);
            setSelectedFile(null);
            setPreview(null);
            fileInputRef.current.value = '';
          }}
        />
      )}
    </MainLayout>
  );
};

export default AIDiagnosis;


















