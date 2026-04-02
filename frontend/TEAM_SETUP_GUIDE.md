# 팀원 작업 환경 설정 가이드

## 📋 사전 준비사항

### 1. 필수 프로그램 설치 확인

#### Git 설치 확인
```bash
git --version
```
- 설치되어 있지 않다면: https://git-scm.com/downloads 에서 다운로드

#### Node.js 설치 확인
```bash
node --version
npm --version
```
- 설치되어 있지 않다면: https://nodejs.org/ 에서 LTS 버전 다운로드 (v18 이상 권장)

---

## 🚀 처음 받는 경우 (Clone)

### 1단계: 저장소 클론하기

터미널(또는 VS Code 터미널)을 열고 원하는 폴더로 이동한 후:

```bash
# 예시: Desktop 폴더로 이동
cd ~/Desktop

# 저장소 클론
git clone https://github.com/KimJoohyung4232/final-project.git

# 프로젝트 폴더로 이동
cd final-project
```

### 2단계: 메인 브랜치로 이동

```bash
# 메인 브랜치로 전환 (기본적으로 메인 브랜치가 클론됨)
git checkout main

# 최신 상태 확인
git status
```

### 3단계: Final_Front4 폴더로 이동 및 패키지 설치

```bash
# Final_Front4 폴더로 이동
cd Final_Front4

# 필요한 패키지 설치 (node_modules 다운로드)
npm install
```

**⚠️ 주의:** `npm install`은 처음에만 실행하면 되며, 5-10분 정도 소요될 수 있습니다.

### 4단계: 개발 서버 실행

```bash
# 개발 서버 시작
npm start
```

브라우저가 자동으로 열리며 `http://localhost:3000`에서 확인할 수 있습니다.

---

## 🔄 이미 받았던 경우 (Pull)

### 1단계: 기존 프로젝트 폴더로 이동

```bash
# 예시: 기존에 받았던 폴더로 이동
cd ~/Desktop/final-project
```

### 2단계: 현재 변경사항 확인 및 저장

```bash
# 현재 상태 확인
git status

# 만약 수정한 파일이 있다면:
# 옵션 1: 변경사항 저장 (스태시)
git stash

# 옵션 2: 변경사항 커밋
git add .
git commit -m "작업 중인 내용 저장"
```

### 3단계: 메인 브랜치로 전환 및 최신 코드 받기

```bash
# 메인 브랜치로 전환
git checkout main

# 원격 저장소에서 최신 코드 받기
git pull origin main
```

### 4단계: Final_Front4 폴더로 이동 및 패키지 업데이트

```bash
# Final_Front4 폴더로 이동
cd Final_Front4

# 새로운 패키지가 추가되었다면 설치
npm install
```

### 5단계: 개발 서버 실행

```bash
npm start
```

---

## 🛠️ 문제 해결

### 포트 3000이 이미 사용 중인 경우

```bash
# 포트를 사용하는 프로세스 확인 (Mac/Linux)
lsof -ti:3000

# 프로세스 종료
kill -9 $(lsof -ti:3000)

# 또는 다른 포트로 실행
PORT=3001 npm start
```

### npm install 오류가 발생하는 경우

```bash
# node_modules와 package-lock.json 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Git 충돌이 발생한 경우

```bash
# 충돌 파일 확인
git status

# 충돌 해결 후
git add .
git commit -m "충돌 해결"
```

---

## 📁 프로젝트 구조

```
final-project/
├── Final_Front4/          ← 여기서 작업합니다!
│   ├── src/
│   │   ├── components/    # 컴포넌트들
│   │   ├── pages/         # 페이지들
│   │   └── utils/         # 유틸리티 함수들
│   ├── public/
│   ├── package.json       # 패키지 의존성
│   └── ...
├── Final_Back/            # 백엔드 (필요시)
└── ...
```

---

## ✅ 확인 체크리스트

- [ ] Git 설치 확인 (`git --version`)
- [ ] Node.js 설치 확인 (`node --version`)
- [ ] 저장소 클론 또는 Pull 완료
- [ ] `npm install` 완료 (에러 없음)
- [ ] `npm start` 실행 성공
- [ ] 브라우저에서 `http://localhost:3000` 접속 가능
- [ ] 로그인 페이지가 정상적으로 표시됨

---

## 🔐 테스트 계정

프론트엔드 미리보기용 테스트 계정:
- **이메일:** `doctor@hospital.com`
- **비밀번호:** `password`

---

## 📞 문제 발생 시

1. 에러 메시지를 복사해서 팀장에게 공유
2. `git status` 결과 확인
3. `npm install` 로그 확인
4. Node.js 버전 확인 (v18 이상 권장)

---

## 💡 유용한 명령어 모음

```bash
# 현재 브랜치 확인
git branch

# 최신 상태 확인
git status

# 최신 코드 받기
git pull origin main

# 변경사항 확인
git diff

# 로그 확인
git log --oneline -10
```

---

**마지막 업데이트:** 2024년 (메인 브랜치 병합 후)



