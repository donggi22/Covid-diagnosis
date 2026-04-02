# 📦 프로젝트 설정 가이드

## 1. Node.js 설치

### 확인
```bash
node --version
npm --version
```

### 설치 방법
- **Mac**: https://nodejs.org/ 에서 다운로드 또는 `brew install node`
- **Windows**: https://nodejs.org/ 에서 LTS 버전 다운로드
- **Linux**: `sudo apt-get install nodejs npm`

## 2. 프로젝트 설정

```bash
# Final_Front 폴더로 이동
cd Final_Front

# 의존성 설치
npm install

# 서버 실행
npm start
```

## 3. 브라우저에서 열기

- 자동으로 열리면: 그대로 사용
- 안 열리면: `http://localhost:3000` 접속

## 4. 개발 시작

### 마이페이지 만들기
1. `src/components/MyPage.js` 파일 생성
2. `src/components/MyPage.css` 파일 생성
3. `src/App.js`에 라우팅 추가

### 참고 파일들
- `src/components/Login.js` - 로그인 페이지
- `src/components/Dashboard.js` - 대시보드
- 같은 스타일로 만들면 됩니다!

## 5. 문제 해결

### 포트 충돌
```bash
# 다른 포트로 실행
PORT=3001 npm start
```

### node_modules 문제
```bash
# 캐시 정리 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 필요한 것들

✅ Node.js (v18 이상)
✅ npm (Node.js와 함께 설치됨)
✅ 인터넷 연결 (npm install 시 필요)

## 문의
문제가 생기면 팀원에게 문의하세요!













