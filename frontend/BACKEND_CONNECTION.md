# 백엔드 서버 연동 가이드

## 📋 연동 상태

✅ **프론트엔드 설정 완료**
- API URL: `http://localhost:5001`
- API 함수: `authAPI`, `patientAPI`, `diagnosisAPI` 준비됨
- 자동 폴백: 백엔드 서버가 실행되지 않으면 테스트 계정으로 폴백

## 🚀 백엔드 서버 실행 방법

### 1. Express 서버 실행

```bash
# 터미널 1: Express 서버 실행
cd Final_Back/express
npm install  # 처음 실행 시
npm run dev  # 개발 모드 (자동 재시작)
# 또는
npm start    # 프로덕션 모드
```

**서버가 정상 실행되면:**
```
🚀 서버가 http://localhost:5001 에서 실행 중입니다.
```

### 2. FastAPI 서버 실행 (AI 진단용)

```bash
# 터미널 2: FastAPI 서버 실행
cd Final_Back/fastapi
source venv/bin/activate  # 가상환경 활성화
uvicorn app.main:app --reload --port 8000
```

## 🔍 연동 확인 방법

### 1. 백엔드 서버 상태 확인

브라우저에서 접속:
- Express: http://localhost:5001
- FastAPI: http://localhost:8000/docs

### 2. 프론트엔드에서 로그인 테스트

1. **백엔드 서버 실행 중:**
   - 실제 백엔드 API로 로그인
   - 데이터베이스의 실제 계정 사용

2. **백엔드 서버 미실행:**
   - 테스트 계정 (`doctor@hospital.com` / `password`)으로 자동 폴백
   - 또는 "테스트 계정으로 보기" 버튼 사용

## 📝 API 엔드포인트

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 환자 API
- `GET /api/patients` - 환자 목록 조회
- `POST /api/patients` - 환자 등록
- `GET /api/patients/:id` - 환자 상세 조회
- `PUT /api/patients/:id` - 환자 정보 수정
- `DELETE /api/patients/:id` - 환자 삭제

### 진단 API
- `GET /api/diagnosis` - 진단 기록 목록
- `POST /api/diagnosis` - 진단 요청 (이미지 업로드)
- `GET /api/diagnosis/:id` - 진단 기록 상세
- `PUT /api/diagnosis/:id/review` - 의사 검토

## ⚙️ 환경 변수 설정

### Express 서버 (.env 파일)
```
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### 프론트엔드 (선택사항)
현재는 하드코딩된 `http://localhost:5001` 사용 중
환경 변수로 변경하려면 `src/utils/api.js` 수정 필요

## 🐛 문제 해결

### 백엔드 서버에 연결할 수 없습니다
1. Express 서버가 실행 중인지 확인
2. 포트 5001이 사용 중인지 확인: `lsof -i :5001`
3. CORS 설정 확인

### 로그인은 되지만 데이터가 안 보입니다
1. MongoDB 연결 확인
2. 데이터베이스에 데이터가 있는지 확인
3. 브라우저 콘솔에서 API 에러 확인

## 📌 참고사항

- 백엔드 서버가 실행되지 않아도 프론트엔드 테스트 가능 (테스트 계정 사용)
- 실제 데이터를 사용하려면 백엔드 서버와 MongoDB 연결 필요
- 개발 환경에서는 두 서버를 동시에 실행하는 것을 권장



