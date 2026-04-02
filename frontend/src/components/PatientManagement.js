import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientManagement.css';
import { patientAPI } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import MainLayout from './layout/MainLayout';

const PatientManagement = ({ isEmbed = false }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 페이지당 항목 수
  const [filters, setFilters] = useState({
    gender: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: '',
    roomNumber: '',
    medicalRecordNumber: ''
  });
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  // 환자 목록 불러오기
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatients();
      setPatients(data);
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '환자 목록을 불러오는데 실패했습니다.';
      setError(errorMsg);
      showError(errorMsg);
      console.error('환자 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // embed 모드가 아닐 때만 로그인 체크 및 네비게이션
    if (!isEmbed) {
      // 로그인 상태 확인
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        navigate('/');
        return;
      }
    }

    // 환자 목록 불러오기
    fetchPatients();
  }, [navigate, isEmbed]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.gender) {
      const errorMsg = '이름, 나이, 성별을 모두 입력해주세요.';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await patientAPI.createPatient({
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        roomNumber: newPatient.roomNumber,
        medicalRecordNumber: newPatient.medicalRecordNumber
      });
      
      // 환자 목록 새로고침
      await fetchPatients();
      setNewPatient({ name: '', age: '', gender: '', roomNumber: '', medicalRecordNumber: '' });
      setShowAddModal(false);
      showSuccess('환자가 성공적으로 등록되었습니다.');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '환자 등록에 실패했습니다.';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('정말 이 환자 정보를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      await patientAPI.deletePatient(id);
      await fetchPatients();
      showSuccess('환자 정보가 성공적으로 삭제되었습니다.');
    } catch (err) {
      const errorMsg = err.response?.data?.error || '환자 정보 삭제에 실패했습니다.';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.roomNumber && patient.roomNumber.includes(searchTerm)) ||
    (patient.medicalRecordNumber && patient.medicalRecordNumber.includes(searchTerm))
  );

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  // 페이지 변경 함수
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 검색어 변경시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 상태 표시
  const getStatusBadge = (status) => {
    const statusMap = {
      normal: { label: '안정', class: 'completed' },
      pending: { label: '관찰 필요', class: 'pending' },
      urgent: { label: '주의', class: 'urgent' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'new' };
    return statusInfo;
  };

  // embed 모드가 아닐 때는 MainLayout 사용
  if (!isEmbed) {
    return (
      <MainLayout>
        <div className="patient-management-content">
          <div className="container">
            {error && <div className="error-message" style={{ marginBottom: '16px', padding: '12px', background: '#fee', color: '#c33', borderRadius: '8px' }}>{error}</div>}
            
            <div className="filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="환자 이름, 병실번호, 차트번호로 검색..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="form-input"
                />
              </div>
              <div className="filter-buttons">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  + 새 환자 추가
                </button>
              </div>
            </div>

            {loading && patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
            ) : (
              <table className="patients-table">
                <thead>
                  <tr className="table-header-row">
                    <th>이름</th>
                    <th>차트번호</th>
                    <th>나이</th>
                    <th>성별</th>
                    <th>병실</th>
                    <th>등록일</th>
                    <th>상태</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-message">
                        {searchTerm ? '검색 결과가 없습니다.' : '등록된 환자가 없습니다.'}
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map(patient => {
                      const statusInfo = getStatusBadge(patient.status);
                      return (
                        <tr key={patient._id} className="table-data-row">
                          <td className="cell-name">
                            <strong>{patient.name}</strong>
                          </td>
                          <td className="cell-chart">{patient.medicalRecordNumber || '-'}</td>
                          <td className="cell-age">{patient.age}세</td>
                          <td className="cell-gender">{patient.gender}</td>
                          <td className="cell-room">{patient.roomNumber || '-'}</td>
                          <td className="cell-date">{formatDate(patient.createdAt)}</td>
                          <td className="cell-status">
                            <span className={`status-badge status-${statusInfo.class}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="cell-actions">
                            <button
                              onClick={() => navigate('/diagnosis', { state: { patientId: patient._id, patientName: patient.name } })}
                              className="btn-diagnose"
                            >
                              진단하기
                            </button>
                            <button
                              onClick={() => handleDeletePatient(patient._id)}
                              className="btn-delete"
                              disabled={loading}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* 페이지네이션 */}
            {filteredPatients.length > 0 && totalPages > 1 && (
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

          {/* 환자 추가 모달 - container 밖, patient-management-content 안에 위치 */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>새 환자 추가</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="patient-name" className="form-label">이름</label>
                    <input
                      type="text"
                      id="patient-name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                      className="form-input"
                      placeholder="환자 이름"
                      aria-label="환자 이름"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-age" className="form-label">나이</label>
                    <input
                      type="number"
                      id="patient-age"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                      className="form-input"
                      placeholder="나이"
                      aria-label="환자 나이"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-gender" className="form-label">성별</label>
                    <select
                      id="patient-gender"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="form-input"
                      aria-label="환자 성별"
                      aria-required="true"
                    >
                      <option value="">성별 선택</option>
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-room" className="form-label">병실번호</label>
                    <input
                      type="text"
                      id="patient-room"
                      value={newPatient.roomNumber}
                      onChange={(e) => setNewPatient({...newPatient, roomNumber: e.target.value})}
                      className="form-input"
                      placeholder="예: 501호"
                      aria-label="병실번호"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-mrn" className="form-label">차트번호 (선택사항)</label>
                    <input
                      type="text"
                      id="patient-mrn"
                      value={newPatient.medicalRecordNumber}
                      onChange={(e) => setNewPatient({...newPatient, medicalRecordNumber: e.target.value})}
                      className="form-input"
                      placeholder="차트번호"
                      aria-label="차트번호"
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleAddPatient}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '추가 중...' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  // embed 모드일 때는 대시보드 카드 내부에 렌더링
  return (
    <div className={`patient-management embedded`}>
      <main className="page-main embedded-main">
        <div className="container embedded-container">
          {error && <div className="error-message" style={{ marginBottom: '16px', padding: '12px', background: '#fee', color: '#c33', borderRadius: '8px' }}>{error}</div>}
          
          <div className="filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="환자 이름, 병실번호, 차트번호로 검색..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-input"
              />
            </div>
            <div className="filter-buttons">
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
                disabled={loading}
              >
                + 새 환자 추가
              </button>
            </div>
          </div>

          {loading && patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
          ) : (
            <table className="patients-table">
              <thead>
                <tr className="table-header-row">
                  <th>이름</th>
                  <th>차트번호</th>
                  <th>나이</th>
                  <th>성별</th>
                  <th>병실</th>
                  <th>등록일</th>
                  <th>상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-message">
                      {searchTerm ? '검색 결과가 없습니다.' : '등록된 환자가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  currentPatients.map(patient => {
                    const statusInfo = getStatusBadge(patient.status);
                    return (
                      <tr key={patient._id} className="table-data-row">
                        <td className="cell-name">
                          <strong>{patient.name}</strong>
                        </td>
                        <td className="cell-chart">{patient.medicalRecordNumber || '-'}</td>
                        <td className="cell-age">{patient.age}세</td>
                        <td className="cell-gender">{patient.gender}</td>
                        <td className="cell-room">{patient.roomNumber || '-'}</td>
                        <td className="cell-date">{formatDate(patient.createdAt)}</td>
                        <td className="cell-status">
                          <span className={`status-badge status-${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="cell-actions">
                          <button
                            onClick={() => navigate('/diagnosis', { state: { patientId: patient._id, patientName: patient.name } })}
                            className="btn-diagnose"
                          >
                            진단하기
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient._id)}
                            className="btn-delete"
                            disabled={loading}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* 페이지네이션 */}
          {filteredPatients.length > 0 && totalPages > 1 && (
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

          {/* 환자 추가 모달 */}
          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>새 환자 추가</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="patient-name-embed" className="form-label">이름</label>
                    <input
                      type="text"
                      id="patient-name-embed"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                      className="form-input"
                      placeholder="환자 이름"
                      aria-label="환자 이름"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-age-embed" className="form-label">나이</label>
                    <input
                      type="number"
                      id="patient-age-embed"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                      className="form-input"
                      placeholder="나이"
                      aria-label="환자 나이"
                      aria-required="true"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-gender-embed" className="form-label">성별</label>
                    <select
                      id="patient-gender-embed"
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                      className="form-input"
                      aria-label="환자 성별"
                      aria-required="true"
                    >
                      <option value="">성별 선택</option>
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-room-embed" className="form-label">병실번호</label>
                    <input
                      type="text"
                      id="patient-room-embed"
                      value={newPatient.roomNumber}
                      onChange={(e) => setNewPatient({...newPatient, roomNumber: e.target.value})}
                      className="form-input"
                      placeholder="예: 501호"
                      aria-label="병실번호"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="patient-mrn-embed" className="form-label">차트번호 (선택사항)</label>
                    <input
                      type="text"
                      id="patient-mrn-embed"
                      value={newPatient.medicalRecordNumber}
                      onChange={(e) => setNewPatient({...newPatient, medicalRecordNumber: e.target.value})}
                      className="form-input"
                      placeholder="차트번호"
                      aria-label="차트번호"
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-secondary"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleAddPatient}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '추가 중...' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientManagement;
