import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginAlt.css';
import { authAPI } from '../utils/api';
import useLang from '../hooks/useLang';
import logo from '../logo/logo_0.png';

const LoginAlt = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [matrixColumns, setMatrixColumns] = useState([]);
  const navigate = useNavigate();
  const lang = useLang();

  // 매트릭스 효과 생성
  useEffect(() => {
    const columns = [];
    const columnCount = 100;

    for (let i = 0; i < columnCount; i++) {
      const chars = [];
      const charCount = Math.floor(Math.random() * 15) + 20;

      for (let j = 0; j < charCount; j++) {
        chars.push(Math.random() > 0.5 ? '1' : '0');
      }

      columns.push({
        id: i,
        text: chars.join('\n'),
        left: `${(i / columnCount) * 100}%`,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 8
      });
    }

    setMatrixColumns(columns);
  }, []);

  const translations = {
    ko: {
      title: 'AI 진단 시스템',
      subtitle: '의료진 로그인',
      email: '이메일',
      password: '비밀번호',
      loginButton: '로그인',
      loading: '로그인 중...',
      testAccount: '테스트 계정: doctor@hospital.com / password',
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
      testAccount: 'Test account: doctor@hospital.com / password',
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
      const response = await authAPI.login(formData.email, formData.password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', response.user.name);
      localStorage.setItem('userEmail', response.user.email);
      localStorage.setItem('userRole', response.user.role);

      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        if (formData.email === 'doctor@hospital.com' && formData.password === 'password') {
          console.warn('백엔드 서버에 연결할 수 없습니다. 테스트 계정으로 로그인합니다.');
          localStorage.setItem('token', 'test-token-12345');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', '테스트 의사');
          localStorage.setItem('userEmail', 'doctor@hospital.com');
          localStorage.setItem('userRole', 'doctor');
          navigate('/dashboard');
          return;
        }
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        const errorMessage = err.response?.data?.error || t.error;
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', '테스트계정');
    localStorage.setItem('userEmail', 'test@example.com');
    localStorage.setItem('userRole', 'tester');
    navigate('/dashboard');
  };

  return (
    <div className="login-alt-container">
      <div className="login-alt-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      {matrixColumns.map((col) => (
        <div
          key={col.id}
          className="matrix-alt-column"
          style={{
            left: col.left,
            animationDuration: `${col.duration}s`,
            animationDelay: `${col.delay}s`
          }}
        >
          {col.text}
        </div>
      ))}

      <div className="login-alt-card">
        <div className="login-alt-header">
          <div className="login-alt-logo">
            <div className="logo-alt-icon">
              <img src={logo} alt="COVISION Logo" />
            </div>
            <h1 className="logo-alt-text">COVISION</h1>
          </div>
          <p className="login-alt-subtitle">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-alt-form">
          {error && <div className="error-alt-message">{error}</div>}

          <div className="form-alt-group">
            <label htmlFor="email" className="form-alt-label">{t.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-alt-input"
              placeholder="example@hospital.com"
              required
            />
          </div>

          <div className="form-alt-group">
            <label htmlFor="password" className="form-alt-label">{t.password}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-alt-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-alt btn-alt-primary login-alt-btn"
            disabled={loading}
          >
            {loading ? t.loading : t.loginButton}
          </button>
        </form>

        <div className="login-alt-footer">
          <p className="test-account-text">{t.testAccount}</p>
          <button
            onClick={handleTestLogin}
            className="btn-alt btn-alt-secondary"
          >
            테스트 계정으로 보기
          </button>
          <p className="signup-alt-link">
            {t.noAccount}{' '}
            <button
              onClick={() => navigate('/signup')}
              className="signup-alt-btn-link"
            >
              {t.signup}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAlt;
