const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// 환경 변수 로드
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 5001;

// 데이터베이스 연결
connectDB();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우트
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/diagnosis', require('./routes/diagnosisRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Express 서버가 실행 중입니다.' });
});

app.use((req, res) => {
  res.status(404).json({ error: '존재하지 않는 경로입니다.' });
});

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  res.status(err.status || 500).json({ error: err.message || '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
