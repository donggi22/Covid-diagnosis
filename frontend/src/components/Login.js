import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { authAPI } from '../utils/api';
import useLang from '../hooks/useLang';
import { useToast } from '../contexts/ToastContext';
import logo from '../logo/logo_0.png';
import ThemeLangToggle from './ThemeLangToggle';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const lang = useLang();
  const { showSuccess, showError: showToastError } = useToast();

  const translations = {
    ko: {
      title: 'AI 진단 시스템',
      subtitle: 'AI 폐질환 보조 시스템',
      email: '이메일',
      password: '비밀번호',
      loginButton: '로그인',
      loading: '로그인 중...',
      noAccount: '계정이 없으신가요?',
      signup: '회원가입',
      error: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
    },
    en: {
      title: 'AI Diagnosis System',
      subtitle: 'Medical Staff Login',
      email: 'Email',
      password: 'Password',
      loginButton: 'Login',
      loading: 'Signing in...',
      noAccount: "Don't have an account?",
      signup: 'Sign Up',
      error: 'Login failed. Please check your email and password.'
    }
  };

  const t = translations[lang] || translations.ko;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 백엔드 API 호출 시도
      const response = await authAPI.login(formData.email, formData.password);
      
      // 토큰 및 사용자 정보 저장
      localStorage.setItem('token', response.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', response.user.name);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userRole', response.user.role);
      
      // 로그인 성공 토스트 표시
      const userName = response.user.name || '고강태';
      showSuccess(`안녕하세요 ${userName}님`);
      
      navigate('/dashboard');
    } catch (err) {
      // 백엔드 연결 실패 시 (네트워크 오류 등)
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        // 백엔드 서버가 실행되지 않은 경우
        // 테스트 계정으로 폴백 (개발 환경에서만)
        if (formData.email === 'doctor@hospital.com' && formData.password === 'password') {
          console.warn('백엔드 서버에 연결할 수 없습니다. 테스트 계정으로 로그인합니다.');
          localStorage.setItem('token', 'test-token-12345');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', '테스트 의사');
          localStorage.setItem('userEmail', 'doctor@hospital.com');
          localStorage.setItem('userRole', 'doctor');
          showSuccess('안녕하세요 테스트 의사님');
          navigate('/dashboard');
          return;
        }
        const errorMsg = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
        setError(errorMsg);
        showToastError(errorMsg);
      } else {
        // 인증 실패 등 기타 오류
        const errorMessage = err.response?.data?.error || t.error;
        setError(errorMessage);
        showToastError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-theme-toggle">
        <ThemeLangToggle />
      </div>

      <div className="login-card login-card-wide">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <img src={logo} alt="COVISION Logo" />
            </div>
            <h1 className="logo-text">COVISION</h1>
          </div>
          <p>{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {error && <div className="error-message">{error}</div>}
          
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
              autoComplete="new-password"
              required
            />
          </div>

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
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
            aria-label={loading ? t.loading : t.loginButton}
          >
            {loading ? t.loading : t.loginButton}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="signup-link">
            {t.noAccount}{' '}
            <button 
              onClick={() => navigate('/signup')}
              className="signup-btn-link"
            >
              {t.signup}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
