# CNN 기반 흉부 X-ray 폐질환 진단 보조 서비스
입력된 흉부 X-ray 분석을 통해 폐질환을 자동 분류하고,
Grad-CAM을 활용하여 모델이 판단에 활용한 병변 영역을 시각화함으로써
영상의학과 의료진이 AI 예측 결과를 기반으로 보다 정확하고 신뢰도 높은 판단을 내릴 수 있도록 지원하는 진단 보조 서비스

## 주요 기능
1. 대시보드
2. 환자관리
3. AI 진단
4. 진단이력
5. 일정관리

## 기술스택
- Frontend : React 19
- Backend : Node.js(Express.js) + FastAPI
- AI/ML : PyTorch
- Database : MongoDB Atlas(Managed NoSQL)
- Infra : Docker, Kubernetes

## 서비스 아키텍처
초기 Kubernetes 기반 온프레미스 환경 아키텍처
![서비스 아키텍처](architecture.png)

### 아키텍처 다이어그램 (Mermaid)
현재 클라우드 환경 아키텍처
```mermaid
graph TB
    A[React Frontend<br/>Port 3000] <--> B[Express API<br/>Port 5001]
    B <--> C[MongoDB<br/>Database]
    B <--> D[FastAPI AI<br/>Port 8000]
    D --> E[PyTorch Models<br/>Classification + Segmentation]
    D <--> F[Cloudinary<br/>Image Storage]
    
    A --> G[사용자 인터페이스<br/>환자관리, 진단 UI]
    B --> H[비즈니스 로직<br/>인증, CRUD, 검증]
    D --> I[AI 분석<br/>X-ray 분석, Grad-CAM]
```

## 프로젝트 구조

```
구조:
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/       # UI 컴포넌트 (ThemeLangToggle 등)
│   │   ├── pages/            # 라우팅 페이지들
│   │   └── utils/            # 유틸리티 함수
│   └── public/               # 정적 파일
│
├── backend/               # 백엔드 서버
│   ├── express/              # Node.js API 서버
│   └── fastapi/              # Python AI 추론 서버
│
├── 모델 파일/
│   ├── clf_best_model.pth    # 분류 모델 (295MB)
│   └── seg_best_model.pth    # 세그멘테이션 모델 (372MB)
│
├── 데이터 분석/
│   ├── EDA.ipynb             # 데이터 탐색
│   └── 모델학습.ipynb         # 모델 학습 코드
│
└── 문서/
    ├── README.md
    ├── 데이터베이스_요구사항분석서.md
    └── 테이블명세서.md
```


<br>

# 흉부 X-ray 폐질환 진단 보조 서비스 실행 가이드

### 환경 변수 파일(.env) 설정

**⚠️ 중요: MongoDB Atlas 연결 정보가 필요합니다!**

DB관리자에게 MongoDB Atlas 연결 문자열을 받아서 설정하세요.

#### Express 백엔드 설정
```bash
cd backend/express

# .env.example 파일을 복사해서 .env 파일 생성
cp .env.example .env

# .env 파일을 열어서 실제 연결 문자열로 수정
# 텍스트 에디터로 .env 파일 열기
```

`.env` 파일 내용 예시:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medical-ai?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5001
```

#### FastAPI 백엔드 설정
```bash
cd backend/fastapi

# .env.example 파일을 복사해서 .env 파일 생성
cp .env.example .env

# .env 파일을 열어서 실제 연결 문자열로 수정
```

`.env` 파일 내용 예시:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medical-ai?retryWrites=true&w=majority
MONGODB_DB=medical-ai

CLOUDINARY_CLOUD_NAME="CLOUD_NAME"
CLOUDINARY_API_KEY="API_KEY="
CLOUDINARY_API_SECRET="API_SECRET"
```

---

### 의존성 설치

#### Express 백엔드
```bash
cd backend/express
npm install
```

#### React 프론트엔드
```bash
cd frontend
npm install
```

#### FastAPI 백엔드
```bash
cd backend/fastapi

# 가상환경 생성 (처음 한 번만)
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate  # Mac/Linux
# 또는
venv\Scripts\activate  # Windows

# 패키지 설치
pip install -r requirements.txt
```

---

### 초기 데이터 설정 (테스트 계정 생성)

```bash
cd backend/express
npm run seed
```

이 명령어로 테스트 계정이 자동 생성됩니다:
- 이메일: `doctor@test.com` / 비밀번호: `test1234`

---

### 서버 실행

**터미널 3개를 열어서 각각 실행:**

**터미널 1 - Express 백엔드:**
```bash
cd backend/express
npm run dev
```

**터미널 2 - FastAPI 백엔드:**
```bash
cd backend/fastapi
source venv/bin/activate  # Mac/Linux
# 또는
venv\Scripts\activate  # Windows
uvicorn app.main:app --reload --port 8000
```

**터미널 3 - React 프론트엔드:**
```bash
cd frontend
npm start
```

---

### 브라우저에서 확인

- 프론트엔드: http://localhost:3000
- Express 백엔드: http://localhost:5001
- FastAPI 백엔드: http://localhost:8000
