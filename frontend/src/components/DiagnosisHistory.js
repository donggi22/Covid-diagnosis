import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DiagnosisHistory.css';
import { diagnosisAPI } from '../utils/api';
import MainLayout from './layout/MainLayout';
import DiagnosisModal from './DiagnosisModal';

const DiagnosisHistory = () => {
  const [diagnoses, setDiagnoses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 페이지당 항목 수
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const navigate = useNavigate();

  // 진단 기록 불러오기
  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await diagnosisAPI.getDiagnoses();
      setDiagnoses(data);
    } catch (err) {
      console.error('진단 기록 조회 오류:', err);
      setError(err.response?.data?.error || '진단 기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // 실제 API에서 진단 기록 불러오기
    fetchDiagnoses();
  }, [navigate]);

  // 백엔드 상태 값을 프론트엔드 필터 값으로 변환
  const getStatusForFilter = (backendStatus) => {
    switch (backendStatus) {
      case 'approved': return '진단 확정';
      case 'rejected': return '검토 필요';
      case 'pending':
      default: return '대기';
    }
  };

  const filteredDiagnoses = diagnoses.filter(diagnosis => {
    const patientName = diagnosis.patientId?.name || '';
    const diagnosisResult = diagnosis.aiAnalysis?.findings?.[0]?.condition || '';
    const backendStatus = diagnosis.review?.status || 'pending';
    const frontendStatus = getStatusForFilter(backendStatus);

    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosisResult.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || frontendStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredDiagnoses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiagnoses = filteredDiagnoses.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터나 검색어 변경시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case '진단 확정': return '#10b981';
      case '검토 필요': return '#f59e0b';
      case '대기': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#10b981';
    if (confidence >= 80) return '#f59e0b';
    return '#ef4444';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 진단 이력 삭제 함수
  const handleDeleteDiagnosis = async (id) => {
    if (!window.confirm('정말 이 진단 기록을 삭제하시겠습니까? 관련 이미지 파일도 모두 삭제됩니다.')) {
      return;
    }

    try {
      setLoading(true);
      await diagnosisAPI.deleteDiagnosis(id);
      // 목록 업데이트
      setDiagnoses(prev => prev.filter(d => d._id !== id));
      alert('진단 기록이 삭제되었습니다.');
    } catch (err) {
      console.error('진단 삭제 오류:', err);
      alert('진단 기록 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="diagnosis-history-content">
        <div className="container">
          {error && <div className="error-message" style={{ marginBottom: '16px', padding: '12px', background: '#fee', color: '#c33', borderRadius: '8px' }}>{error}</div>}

          {/* 필터 및 검색 */}
          <div className="filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="환자명 또는 진단명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                전체
              </button>
              <button
                className={`filter-btn ${filterStatus === '진단 확정' ? 'active' : ''}`}
                onClick={() => setFilterStatus('진단 확정')}
              >
                진단 확정
              </button>
              <button
                className={`filter-btn ${filterStatus === '검토 필요' ? 'active' : ''}`}
                onClick={() => setFilterStatus('검토 필요')}
              >
                검토 필요
              </button>
              <button
                className={`filter-btn ${filterStatus === '대기' ? 'active' : ''}`}
                onClick={() => setFilterStatus('대기')}
              >
                대기
              </button>
            </div>
          </div>

          {/* 진단 기록 테이블 */}
          {(loading && diagnoses.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
          ) : (
            <table className="diagnoses-table">
              <thead>
                <tr className="table-header-row">
                  <th>이름</th>
                  <th>나이</th>
                  <th>성별</th>
                  <th>병실</th>
                  <th>차트번호</th>
                  <th>진단일</th>
                  <th>진단결과</th>
                  <th>증상</th>
                  <th>영상타입</th>
                  <th>AI신뢰도</th>
                  <th>진단상태</th>
                  <th>담당의</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiagnoses.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="empty-message">
                      {searchTerm ? '검색 결과가 없습니다.' : '진단 기록이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  currentDiagnoses.map(diagnosis => {
                    const patient = diagnosis.patientId || {};
                    const patientName = patient.name || '알 수 없음';
                    const patientAge = patient.age || (patient.birth ? (new Date().getFullYear() - new Date(patient.birth).getFullYear()) : '-');
                    const patientGender = patient.gender === 'M' || patient.gender === '남성' ? '남' :
                      patient.gender === 'F' || patient.gender === '여성' ? '여' :
                        patient.gender === '기타' ? '기타' : '-';
                    const patientRoom = patient.roomNumber || patient.room || '-';
                    const chartNumber = patient.medicalRecordNumber || patient.chartNumber || patient.patientId || '-';
                    const aiConfidence = Math.round((diagnosis.aiAnalysis?.confidence || 0) * 100);
                    const diagnosisResult = diagnosis.aiAnalysis?.findings?.[0]?.condition || '-';
                    const doctorName = diagnosis.doctorId?.name || patient.doctorId?.name || '-';

                    return (
                      <tr key={diagnosis._id} className="table-data-row">
                        <td className="cell-name">
                          <strong>{patientName}</strong>
                        </td>
                        <td className="cell-age">{patientAge}</td>
                        <td className="cell-gender">{patientGender}</td>
                        <td className="cell-room">{patientRoom}</td>
                        <td className="cell-chart">{chartNumber}</td>
                        <td className="cell-date">{formatDate(diagnosis.createdAt)}</td>
                        <td className="cell-result">
                          <span className="diagnosis-result">{diagnosisResult}</span>
                        </td>
                        <td className="cell-symptoms">{diagnosis.symptoms || '-'}</td>
                        <td className="cell-image">{diagnosis.imageUrl ? 'X-ray' : '-'}</td>
                        <td className="cell-confidence">
                          <span
                            className="confidence-badge"
                            style={{ color: getConfidenceColor(aiConfidence) }}
                          >
                            {aiConfidence}%
                          </span>
                        </td>
                        <td className="cell-status">
                          <span
                            className="status-badge"
                            style={{
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: `${getStatusColor(getStatusForFilter(diagnosis.review?.status))}15`,
                              color: getStatusColor(getStatusForFilter(diagnosis.review?.status)),
                              border: `1px solid ${getStatusColor(getStatusForFilter(diagnosis.review?.status))}30`,
                              display: 'inline-block',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {getStatusForFilter(diagnosis.review?.status)}
                          </span>
                        </td>
                        <td className="cell-doctor">{doctorName}</td>
                        <td className="cell-actions">
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-primary"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '12px',
                                minWidth: '60px'
                              }}
                              onClick={() => {
                                const findings = (diagnosis.aiAnalysis?.findings || []).map(finding => ({
                                  condition: finding.condition || '',
                                  probability: typeof finding.probability === 'number'
                                    ? (finding.probability <= 1 ? finding.probability * 100 : finding.probability)
                                    : 0,
                                  description: finding.description || ''
                                }));

                                const getImageUrl = (path, fallback) => {
                                  if (!path) return fallback || '';
                                  if (path.startsWith('http')) return path;
                                  if (path.startsWith('/')) {
                                    return `${process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000'}${path}`;
                                  }
                                  if (path.startsWith('uploads/') || !path.includes('/')) {
                                    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/${path}`;
                                  }
                                  return path;
                                };

                                const baseImageUrl = diagnosis.imageUrl
                                  ? (diagnosis.imageUrl.startsWith('http')
                                    ? diagnosis.imageUrl
                                    : `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}${diagnosis.imageUrl.startsWith('/') ? '' : '/'}${diagnosis.imageUrl}`)
                                  : '';

                                const modalData = {
                                  originalImage: baseImageUrl,
                                  gradcam: getImageUrl(diagnosis.aiAnalysis?.gradcamPath, baseImageUrl),
                                  gradcamPP: getImageUrl(diagnosis.aiAnalysis?.gradcamPlusPath, baseImageUrl),
                                  layercam: getImageUrl(
                                    diagnosis.aiAnalysis?.layercamPath || diagnosis.aiAnalysis?.layerCamPath,
                                    baseImageUrl
                                  ),
                                  findings: findings,
                                  confidence: Math.round((diagnosis.aiAnalysis?.confidence || 0) * 100),
                                  recommendation: Array.isArray(diagnosis.aiAnalysis?.recommendations)
                                    ? (diagnosis.aiAnalysis.recommendations[0] || diagnosis.aiAnalysis.recommendations.join(', ') || '추가 검진을 권장합니다.')
                                    : (diagnosis.aiAnalysis?.recommendations || '추가 검진을 권장합니다.'),
                                  aiNotes: diagnosis.aiAnalysis?.aiNotes || 'UNet 기반 폐 분할 + ResNet50 기반 흉부 엑스레이 질환 분류 추론 결과입니다.',
                                  symptoms: diagnosis.symptoms || '',
                                  diagnosisId: diagnosis._id,
                                  patientId: diagnosis.patientId?._id || diagnosis.patientId
                                };
                                setSelectedDiagnosis(modalData);
                                setIsModalOpen(true);
                              }}
                            >
                              상세보기
                            </button>
                            <button
                              className="btn btn-danger btn-delete"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '12px',
                                minWidth: '40px'
                              }}
                              onClick={() => handleDeleteDiagnosis(diagnosis._id)}
                              disabled={loading}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* 페이지네이션 */}
          {filteredDiagnoses.length > 0 && totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 진단 상세 모달 */}
      <DiagnosisModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDiagnosis(null);
        }}
        data={selectedDiagnosis}
        onSave={selectedDiagnosis ? async (status) => {
          try {
            await diagnosisAPI.reviewDiagnosis(selectedDiagnosis.diagnosisId, {
              status: status || 'approved',
              summary: status === 'approved' ? '진단 결과 확정' : '추가 검토 필요',
              notes: status === 'approved' ? '전문의가 진단 결과를 최종 확정했습니다.' : '진단 결과에 의문이 있어 추가 검토가 필요합니다.'
            });
            alert(status === 'approved' ? '진단 결과가 확정되었습니다.' : '검토 필요 상태로 변경되었습니다.');
            setIsModalOpen(false);
            setSelectedDiagnosis(null);
            fetchDiagnoses();
          } catch (err) {
            console.error('리뷰 상태 업데이트 오류:', err);
            alert(err.response?.data?.error || '진단 결과 업데이트 중 오류가 발생했습니다.');
          }
        } : undefined}
        onNewDiagnosis={() => {
          setIsModalOpen(false);
          setSelectedDiagnosis(null);
          navigate('/diagnosis');
        }}
      />
    </MainLayout>
  );
};

export default DiagnosisHistory;
