import axios from 'axios';

// 백엔드 API 기본 URL (환경 변수 사용, 없으면 로컬 기본값)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120초 (모델 예측 시간 고려)
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  // 회원가입
  register: async (userData) => {
    const response = await api.post('/api/auth/register', {
      email: userData.email,
      password: userData.password,
      name: userData.name,
    });
    return response.data;
  },

  // 로그인
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // 현재 사용자 정보 조회
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // 프로필 업데이트
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  // 비밀번호 변경
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/auth/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // 프로필 이미지 업로드
  updateProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/api/auth/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// 환자 API
export const patientAPI = {
  // 환자 목록 조회
  getPatients: async () => {
    const response = await api.get('/api/patients');
    return response.data;
  },

  // 환자 상세 조회
  getPatient: async (id) => {
    const response = await api.get(`/api/patients/${id}`);
    return response.data;
  },

  // 환자 등록
  createPatient: async (patientData) => {
    const response = await api.post('/api/patients', patientData);
    return response.data;
  },

  // 환자 정보 수정
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/api/patients/${id}`, patientData);
    return response.data;
  },

  // 환자 삭제
  deletePatient: async (id) => {
    const response = await api.delete(`/api/patients/${id}`);
    return response.data;
  },
};

// 진단 API
export const diagnosisAPI = {
  // 진단 기록 목록 조회
  getDiagnoses: async () => {
    const response = await api.get('/api/diagnosis');
    return response.data;
  },

  // 진단 기록 상세 조회
  getDiagnosis: async (id) => {
    const response = await api.get(`/api/diagnosis/${id}`);
    return response.data;
  },

  // AI 분석만 수행 (저장 안함)
  analyzeOnly: async (patientId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('patientId', patientId);

    const response = await api.post('/api/diagnosis/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120초 (모델 예측 시간 고려)
    });
    return response.data;
  },

  // 진단 결과 저장 (이미 분석된 결과)
  saveDiagnosis: async (diagnosisData) => {
    const response = await api.post('/api/diagnosis/save', diagnosisData, {
      timeout: 30000,
    });
    return response.data;
  },

  // 진단 요청 (이미지 업로드)
  createDiagnosis: async (patientId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('patientId', patientId);

    const response = await api.post('/api/diagnosis', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120초 (모델 예측 시간 고려)
    });
    return response.data;
  },

  // 의사 검토 및 수정
  reviewDiagnosis: async (id, reviewData) => {
    const response = await api.put(`/api/diagnosis/${id}/review`, reviewData);
    return response.data;
  },
};

// 예약 API
export const appointmentAPI = {
  // 예약 목록 조회
  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/appointments?${queryString}`);
    return response.data;
  },

  // 예약 상세 조회
  getAppointment: async (id) => {
    const response = await api.get(`/api/appointments/${id}`);
    return response.data;
  },

  // 예약 생성
  createAppointment: async (appointmentData) => {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  },

  // 예약 수정
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/api/appointments/${id}`, appointmentData);
    return response.data;
  },

  // 예약 삭제
  deleteAppointment: async (id) => {
    const response = await api.delete(`/api/appointments/${id}`);
    return response.data;
  },
};

export default api;




