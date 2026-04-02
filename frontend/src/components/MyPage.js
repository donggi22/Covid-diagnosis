import React, { useEffect, useMemo, useState } from 'react';
import './MyPage.css';
import { useNavigate } from 'react-router-dom';
import ReadingDashboard from './mypage/ReadingDashboard';
import PatientSummary from './mypage/PatientSummary';
import AiCollabStats from './mypage/AiCollabStats';
import QuickAccess from './mypage/QuickAccess';
import SettingsAdvanced from './mypage/SettingsAdvanced';
import { authAPI } from '../utils/api';
import useLang from '../hooks/useLang';
import MainLayout from './layout/MainLayout';

const MyPage = () => {
  const navigate = useNavigate();
  const lang = useLang();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    hospital: '',
    department: '',
    licenseNumber: '',
    profileImage: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    hospital: '',
    department: '',
    licenseNumber: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const texts = useMemo(
    () => ({
      ko: {
        title: '마이페이지',
        backToDashboard: '← 대시보드로 돌아가기',
        personalInfo: '개인정보',
        edit: '수정',
        save: '저장',
        cancel: '취소',
        saving: '저장 중...',
        name: '이름',
        email: '이메일',
        hospital: '병원',
        department: '진료과',
        licenseNumber: '면허번호',
        passwordChange: '비밀번호 변경',
        change: '변경',
        changing: '변경 중...',
        currentPassword: '현재 비밀번호',
        newPassword: '새 비밀번호',
        confirmPassword: '새 비밀번호 확인',
        uploading: '업로드 중...',
        alerts: {
          profileUpdated: '프로필이 성공적으로 업데이트되었습니다.',
          profileUpdateFailed: '프로필 업데이트에 실패했습니다.',
          passwordMismatch: '새 비밀번호가 일치하지 않습니다.',
          passwordLength: '새 비밀번호는 6자 이상이어야 합니다.',
          passwordChanged: '비밀번호가 성공적으로 변경되었습니다.',
          passwordChangeFailed: '비밀번호 변경에 실패했습니다.',
          imageOnly: '이미지 파일만 업로드 가능합니다.',
          fileSizeLimit: '파일 크기는 5MB 이하여야 합니다.',
          imageUpdated: '프로필 사진이 성공적으로 업데이트되었습니다.',
          imageUploadFailed: '프로필 사진 업로드에 실패했습니다.'
        }
      },
      en: {
        title: 'My Page',
        backToDashboard: '← Back to Dashboard',
        personalInfo: 'Personal Information',
        edit: 'Edit',
        save: 'Save',
        cancel: 'Cancel',
        saving: 'Saving...',
        name: 'Name',
        email: 'Email',
        hospital: 'Hospital',
        department: 'Department',
        licenseNumber: 'License Number',
        passwordChange: 'Change Password',
        change: 'Change',
        changing: 'Changing...',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm New Password',
        uploading: 'Uploading...',
        alerts: {
          profileUpdated: 'Profile updated successfully.',
          profileUpdateFailed: 'Failed to update profile.',
          passwordMismatch: 'New passwords do not match.',
          passwordLength: 'New password must be at least 6 characters long.',
          passwordChanged: 'Password changed successfully.',
          passwordChangeFailed: 'Failed to change password.',
          imageOnly: 'Only image files are allowed.',
          fileSizeLimit: 'File size must be 5MB or less.',
          imageUpdated: 'Profile image updated successfully.',
          imageUploadFailed: 'Failed to upload profile image.'
        }
      }
    }),
    []
  );

  const t = texts[lang] || texts.ko;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    } else {
      fetchUserInfo();
    }
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await authAPI.getMe();
      setUserInfo(response.user);
      setEditForm({
        name: response.user.name || '',
        hospital: response.user.hospital || '',
        department: response.user.department || '',
        licenseNumber: response.user.licenseNumber || '',
      });
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      // localStorage에서 fallback
      setUserInfo({
        name: localStorage.getItem('userName') || '사용자',
        email: localStorage.getItem('userEmail') || 'email@example.com',
        hospital: '',
        department: '',
        licenseNumber: '',
      });
    }
  };

  // dummy data
  const [loading, setLoading] = useState(true);
  const reading = useMemo(() => ({ todayDone: 12, pending: 5 }), []);
  const wards = useMemo(() => ({ icu: 6, ward: 24 }), []);
  const favorites = useMemo(() => ([
    { id: 1, name: '김OO', room: '501호', lastImaging: '1일 전', state: 'pending', starred: true },
    { id: 2, name: '이OO', room: '302호', lastImaging: '3시간 전', state: 'normal', starred: true },
    { id: 3, name: '박OO', room: '405호', lastImaging: '2일 전', state: 'urgent', starred: false },
  ]), []);
  const trend = useMemo(() => ([
    { d: '11/1', acc: 88 }, { d: '11/2', acc: 90 }, { d: '11/3', acc: 87 }, { d: '11/4', acc: 92 }, { d: '11/5', acc: 94 }
  ]), []);
  const pendingList = useMemo(() => ([{ id: 'P-1' }, { id: 'P-2' }, { id: 'P-3' }]), []);
  const recentCases = useMemo(() => ([
    { id: 'C-101', title: 'Chest X-ray - 김OO', date: '11/02' },
    { id: 'C-102', title: 'CT Abdomen - 이OO', date: '11/02' },
    { id: 'C-103', title: 'MRI Brain - 박OO', date: '11/01' },
  ]), []);
  const templates = useMemo(() => ([{ id: 1, name: '흉부X-ray 기본' }, { id: 2, name: '복부CT 소견' }]), []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditForm({
      name: userInfo.name || '',
      hospital: userInfo.hospital || '',
      department: userInfo.department || '',
      licenseNumber: userInfo.licenseNumber || '',
    });
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setEditForm({
      name: userInfo.name || '',
      hospital: userInfo.hospital || '',
      department: userInfo.department || '',
      licenseNumber: userInfo.licenseNumber || '',
    });
  };

  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await authAPI.updateProfile(editForm);
      setUserInfo(response.user);
      localStorage.setItem('userName', response.user.name);
      setIsEditingProfile(false);
      alert(t.alerts.profileUpdated);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert(error.response?.data?.error || t.alerts.profileUpdateFailed);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleCancelEditPassword = () => {
    setIsEditingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert(t.alerts.passwordMismatch);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert(t.alerts.passwordLength);
      return;
    }

    setLoadingPassword(true);
    try {
      await authAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setIsEditingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert(t.alerts.passwordChanged);
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      alert(error.response?.data?.error || t.alerts.passwordChangeFailed);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      alert(t.alerts.imageOnly);
      return;
    }

    // 파일 크기 확인 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t.alerts.fileSizeLimit);
      return;
    }

    setUploadingImage(true);
    try {
      const response = await authAPI.updateProfileImage(file);
      setUserInfo(response.user);
      setPreviewImage(null);
      alert(t.alerts.imageUpdated);
    } catch (error) {
      console.error('프로필 사진 업로드 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      const errorMessage = error.response?.data?.error || error.message || t.alerts.imageUploadFailed;
      alert(errorMessage + '\n\n' + (lang === 'ko' ? '백엔드 서버가 실행 중인지 확인해주세요.' : 'Please check if the backend server is running.'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      handleImageUpload(e);
    }
  };

  return (
    <MainLayout>
      <div className="mypage-content">
        <div className="mypage-container">
        <ReadingDashboard
          data={reading}
          loading={loading}
          onClickDone={() => { console.log('오늘 판독 완료 목록 이동'); navigate('/history'); }}
          onClickPending={() => { console.log('판독 대기 목록 이동'); navigate('/patients'); }}
        />

        <PatientSummary
          wards={wards}
          favorites={favorites}
          onViewAll={() => navigate('/patients')}
          onSelectPatient={(p) => console.log('환자 상세 이동', p)}
        />

        <QuickAccess
          onGoPending={() => navigate('/patients')}
          onOpenRecent={() => navigate('/history')}
          pendingCount={reading.pending}
        />

        <SettingsAdvanced />

        {/* 프로필 및 설정 섹션 */}
        <div style={{ marginTop: '32px' }}>
          <div className="profile-card">
            <div className="avatar-container">
              <div className="avatar">
                {previewImage || userInfo.profileImage ? (
                  <img
                    src={previewImage || `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}${userInfo.profileImage}`}
                    alt="프로필"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-icon">👩‍⚕️</span>
                )}
              </div>
              <label htmlFor="profile-image-upload" className="avatar-upload-btn">
                {uploadingImage ? t.uploading : '📷'}
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImagePreview}
                style={{ display: 'none' }}
                disabled={uploadingImage}
              />
            </div>
            <div className="info">
              <p className="name">{userInfo.name}</p>
              <p className="email">{userInfo.email}</p>
            </div>
          </div>

          {/* 개인정보 섹션 */}
          <section className="section profile-section">
            <div className="section-header">
              <h2>{t.personalInfo}</h2>
              {!isEditingProfile && (
                <button className="btn-edit" onClick={handleEditProfile}>
                  {t.edit}
                </button>
              )}
            </div>
            {isEditingProfile ? (
              <div className="profile-edit-form">
                <div className="form-group">
                  <label>{t.name}</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.hospital}</label>
                  <input
                    type="text"
                    value={editForm.hospital}
                    onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.department}</label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.licenseNumber}</label>
                  <input
                    type="text"
                    value={editForm.licenseNumber}
                    onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={loadingProfile}
                  >
                    {loadingProfile ? t.saving : t.save}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEditProfile}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="label">{t.name}:</span>
                  <span className="value">{userInfo.name || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">{t.email}:</span>
                  <span className="value">{userInfo.email || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">{t.hospital}:</span>
                  <span className="value">{userInfo.hospital || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">{t.department}:</span>
                  <span className="value">{userInfo.department || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">{t.licenseNumber}:</span>
                  <span className="value">{userInfo.licenseNumber || '-'}</span>
                </div>
              </div>
            )}
          </section>

          {/* 비밀번호 변경 섹션 */}
          <section className="section password-section">
            <div className="section-header">
              <h2>{t.passwordChange}</h2>
              {!isEditingPassword && (
                <button className="btn-edit" onClick={handleEditPassword}>
                  {t.change}
                </button>
              )}
            </div>
            {isEditingPassword && (
              <div className="password-edit-form">
                <div className="form-group">
                  <label>{t.currentPassword}</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.newPassword}</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t.confirmPassword}</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSavePassword}
                    disabled={loadingPassword}
                  >
                    {loadingPassword ? t.changing : t.change}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelEditPassword}>
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPage;