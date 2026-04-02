const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const diagnosisController = require('../controllers/diagnosisController');
// const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

router.get('/', diagnosisController.getDiagnoses);
router.get('/:id', diagnosisController.getDiagnosisById);
router.post('/analyze', upload.single('image'), diagnosisController.analyzeOnly); // 분석만 수행 (저장 안함)
router.post('/save', diagnosisController.saveDiagnosis); // 이미 분석된 결과 저장 (이미지 파일 없이)
router.post('/', upload.single('image'), diagnosisController.createDiagnosis); // 이미지 업로드 + 분석 + 저장
router.put('/:id/review', diagnosisController.reviewDiagnosis);

module.exports = router;
