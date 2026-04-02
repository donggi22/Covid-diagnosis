const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });
const mongoose = require('mongoose');
const User = require('../models/User');

const checkUser = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB 연결 성공\n');

    const email = 'wngud4232@gmail.com';
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`🔍 사용자 검색: ${normalizedEmail}\n`);

    // 정확한 이메일로 검색
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      console.log('✅ 사용자를 찾았습니다!');
      console.log(`   ID: ${user._id}`);
      console.log(`   이름: ${user.name}`);
      console.log(`   이메일: ${user.email}`);
      console.log(`   역할: ${user.role}`);
      console.log(`   병원: ${user.hospital || 'N/A'}`);
      console.log(`   비밀번호 해시: ${user.password.substring(0, 20)}...`);
    } else {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      
      // 비슷한 이메일 찾기
      const similarUsers = await User.find({
        email: { $regex: email.split('@')[0], $options: 'i' }
      });
      
      if (similarUsers.length > 0) {
        console.log('\n📋 비슷한 이메일의 사용자:');
        similarUsers.forEach(u => {
          console.log(`   - ${u.email} (${u.name})`);
        });
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

checkUser();

