const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });
const mongoose = require('mongoose');
const User = require('../models/User');

const fixEmail = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB 연결 성공\n');

    const wrongEmail = 'wngud4232@gamil.com';
    const correctEmail = 'wngud4232@gmail.com';

    console.log(`🔍 잘못된 이메일 검색: ${wrongEmail}`);

    const user = await User.findOne({ email: wrongEmail });

    if (!user) {
      console.log('❌ 해당 이메일의 사용자를 찾을 수 없습니다.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`✅ 사용자 찾음: ${user.name} (${user.email})`);
    console.log(`\n📝 이메일 수정: ${wrongEmail} → ${correctEmail}`);

    user.email = correctEmail;
    await user.save();

    console.log('✅ 이메일 수정 완료!');
    console.log(`   새로운 이메일: ${user.email}\n`);

    await mongoose.connection.close();
    console.log('✅ 작업 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

fixEmail();







