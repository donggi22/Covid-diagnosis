import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { authAPI } from '../utils/api';
import useLang from '../hooks/useLang';
import logo from '../logo/logo_0.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospital: '',
    department: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const lang = useLang();

  const texts = useMemo(
    () => ({
      ko: {
        title: 'COVISION',
        subtitle: 'AI 폐질환 예측 시스템 - 회원가입',
        name: '이름',
        email: '이메일',
        password: '비밀번호',
        confirmPassword: '비밀번호 확인',
        hospital: '소속 병원',
        department: '진료과',
        licenseNumber: '의사면허번호',
        selectDepartment: '진료과 선택',
        placeholders: {
          name: '실명을 입력하세요',
          email: 'hospital@example.com',
          password: '6자 이상',
          confirmPassword: '비밀번호 재입력',
          hospital: '예: 서울대학교병원',
          licenseNumber: '예: 12345'
        },
        errors: {
          passwordMismatch: '비밀번호가 일치하지 않습니다.',
          passwordLength: '비밀번호는 6자 이상이어야 합니다.',
          invalidEmail: '올바른 이메일 형식을 입력해주세요.',
          signupFailed: '회원가입에 실패했습니다. 다시 시도해주세요.'
        },
        submitting: '회원가입 중...',
        submit: '회원가입',
        successTitle: '회원가입이 완료되었습니다!',
        successMessage: '로그인 페이지로 이동합니다...',
        footer: '이미 계정이 있으신가요?',
        footerAction: '로그인하기'
      },
      en: {
        title: 'COVISION',
        subtitle: 'AI Lung Disease Prediction System - Sign Up',
        name: 'Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        hospital: 'Hospital',
        department: 'Department',
        licenseNumber: 'Medical License Number',
        selectDepartment: 'Select Department',
        placeholders: {
          name: 'Enter full name',
          email: 'hospital@example.com',
          password: 'At least 6 characters',
          confirmPassword: 'Re-enter password',
          hospital: 'e.g., Seoul National University Hospital',
          licenseNumber: 'e.g., 12345'
        },
        errors: {
          passwordMismatch: 'Passwords do not match.',
          passwordLength: 'Password must be at least 6 characters long.',
          invalidEmail: 'Please enter a valid email address.',
          signupFailed: 'Sign up failed. Please try again.'
        },
        submitting: 'Creating account...',
        submit: 'Sign Up',
        successTitle: 'Sign-up complete!',
        successMessage: 'Redirecting to login page...',
        footer: 'Already have an account?',
        footerAction: 'Go to Login'
      }
    }),
    []
  );

  const departmentOptions = useMemo(
    () =>
      lang === 'en'
        ? [
            { value: '내과', label: 'Internal Medicine' },
            { value: '외과', label: 'Surgery' },
            { value: '소아과', label: 'Pediatrics' },
            { value: '산부인과', label: 'Obstetrics/Gynecology' },
            { value: '정형외과', label: 'Orthopedics' },
            { value: '신경과', label: 'Neurology' },
            { value: '정신과', label: 'Psychiatry' },
            { value: '피부과', label: 'Dermatology' },
            { value: '안과', label: 'Ophthalmology' },
            { value: '이비인후과', label: 'Otolaryngology' },
            { value: '비뇨기과', label: 'Urology' },
            { value: '흉부외과', label: 'Thoracic Surgery' },
            { value: '신경외과', label: 'Neurosurgery' },
            { value: '마취과', label: 'Anesthesiology' },
            { value: '영상의학과', label: 'Radiology' },
            { value: '병리과', label: 'Pathology' },
            { value: '기타', label: 'Other' }
          ]
        : [
            { value: '내과', label: '내과' },
            { value: '외과', label: '외과' },
            { value: '소아과', label: '소아과' },
            { value: '산부인과', label: '산부인과' },
            { value: '정형외과', label: '정형외과' },
            { value: '신경과', label: '신경과' },
            { value: '정신과', label: '정신과' },
            { value: '피부과', label: '피부과' },
            { value: '안과', label: '안과' },
            { value: '이비인후과', label: '이비인후과' },
            { value: '비뇨기과', label: '비뇨기과' },
            { value: '흉부외과', label: '흉부외과' },
            { value: '신경외과', label: '신경외과' },
            { value: '마취과', label: '마취과' },
            { value: '영상의학과', label: '영상의학과' },
            { value: '병리과', label: '병리과' },
            { value: '기타', label: '기타' }
          ],
    [lang]
  );

  const t = texts[lang] || texts.ko;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      setError(t.errors.passwordMismatch);
      return;
    }

    if (formData.password.length < 6) {
      setError(t.errors.passwordLength);
      return;
    }

    if (!formData.email.includes('@')) {
      setError(t.errors.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      // 회원가입 API 호출
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || t.errors.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>{t.successTitle}</h2>
            <p>{t.successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="signup-logo">
            <div className="logo-icon">
              <img src={logo} alt="COVISION Logo" />
            </div>
            <h1 className="logo-text">{t.title}</h1>
          </div>
          <p>{t.subtitle}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">{t.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              aria-label={t.name}
              aria-required="true"
              required
              placeholder={t.placeholders.name}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              aria-label={t.email}
              aria-required="true"
              required
              placeholder={t.placeholders.email}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">{t.password}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                aria-label={t.password}
                aria-required="true"
                aria-describedby="password-hint"
                required
                placeholder={t.placeholders.password}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">{t.confirmPassword}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                aria-label={t.confirmPassword}
                aria-required="true"
                required
                placeholder={t.placeholders.confirmPassword}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hospital" className="form-label">{t.hospital}</label>
            <input
              type="text"
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="form-input"
              aria-label={t.hospital}
              aria-required="true"
              required
              placeholder={t.placeholders.hospital}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department" className="form-label">{t.department}</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                aria-label={t.department}
                aria-required="true"
                required
              >
                <option value="">{t.selectDepartment}</option>
                {departmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber" className="form-label">{t.licenseNumber}</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="form-input"
                aria-label={t.licenseNumber}
                aria-required="true"
                required
                placeholder={t.placeholders.licenseNumber}
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary signup-btn"
            disabled={loading}
            aria-label={loading ? t.submitting : t.submit}
          >
            {loading ? t.submitting : t.submit}
          </button>
        </form>
        
        <div className="signup-footer">
          <p>{t.footer}{' '}
            <button 
              onClick={() => navigate('/')}
              className="login-link"
            >
              {t.footerAction}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
















