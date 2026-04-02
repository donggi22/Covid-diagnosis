const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

// 환경 변수 로드
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const seedUsers = [
  {
    name: '테스트 의사',
    email: 'doctor@test.com',
    password: 'test1234',
    hospital: '서울대학교병원',
    department: '내과',
    licenseNumber: 'TEST001',
    role: 'doctor',
  },
  {
    name: '관리자',
    email: 'admin@test.com',
    password: 'admin1234',
    hospital: '서울대학교병원',
    department: '관리부',
    licenseNumber: 'ADMIN001',
    role: 'admin',
  },
  {
    name: '김의사',
    email: 'kim@test.com',
    password: 'test1234',
    hospital: '세브란스병원',
    department: '외과',
    licenseNumber: 'KIM001',
    role: 'doctor',
  },
];

const seedDatabase = async () => {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB 연결 성공');

    // 기존 사용자 확인
    const existingUsers = await User.find({
      email: { $in: seedUsers.map((u) => u.email) },
    });

    if (existingUsers.length > 0) {
      console.log('⚠️  이미 존재하는 사용자가 있습니다:');
      existingUsers.forEach((user) => {
        console.log(`   - ${user.email}`);
      });
      console.log('\n기존 사용자를 삭제하고 다시 생성하시겠습니까?');
      console.log('스크립트를 수정하여 기존 데이터를 삭제하거나,');
      console.log('다른 이메일로 테스트 계정을 생성하세요.\n');
    }

    // 사용자 생성
    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⏭️  건너뜀: ${userData.email} (이미 존재)`);
        skippedCount++;
        continue;
      }

      const user = await User.create(userData);
      console.log(`✅ 생성됨: ${user.email} (비밀번호: ${userData.password})`);
      createdCount++;
    }

    console.log('\n📊 요약:');
    console.log(`   생성: ${createdCount}개`);
    console.log(`   건너뜀: ${skippedCount}개`);

    console.log('\n📝 테스트 계정 정보:');
    seedUsers.forEach((user) => {
      console.log(`   이메일: ${user.email}`);
      console.log(`   비밀번호: ${user.password}`);
      console.log(`   역할: ${user.role}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ 시드 데이터 생성 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 스크립트 실행
seedDatabase();

