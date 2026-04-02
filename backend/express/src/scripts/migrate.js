const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 환경 변수 로드
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// 로컬 MongoDB 연결
const localMongoUri = 'mongodb://localhost:27017/medical-ai';
// Atlas MongoDB 연결 (환경 변수에서 가져오기)
const atlasMongoUri = process.env.MONGODB_URI;

if (!atlasMongoUri) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const migrateData = async () => {
  let localConnection, atlasConnection;

  try {
    console.log('🔄 로컬 MongoDB 연결 중...');
    localConnection = await mongoose.createConnection(localMongoUri);
    console.log('✅ 로컬 MongoDB 연결 성공');

    console.log('🔄 MongoDB Atlas 연결 중...');
    atlasConnection = await mongoose.createConnection(atlasMongoUri);
    console.log('✅ MongoDB Atlas 연결 성공\n');

    // 모델 정의
    const userSchema = new mongoose.Schema({}, { strict: false });
    const patientSchema = new mongoose.Schema({}, { strict: false });
    const diagnosisSchema = new mongoose.Schema({}, { strict: false });

    const LocalUser = localConnection.model('User', userSchema, 'users');
    const LocalPatient = localConnection.model('Patient', patientSchema, 'patients');
    const LocalDiagnosis = localConnection.model('Diagnosis', diagnosisSchema, 'diagnoses');

    const AtlasUser = atlasConnection.model('User', userSchema, 'users');
    const AtlasPatient = atlasConnection.model('Patient', patientSchema, 'patients');
    const AtlasDiagnosis = atlasConnection.model('Diagnosis', diagnosisSchema, 'diagnoses');

    // Users 마이그레이션
    console.log('📦 Users 데이터 마이그레이션 중...');
    const users = await LocalUser.find({});
    if (users.length > 0) {
      // 기존 데이터 삭제 (선택사항 - 주석 처리하면 중복 방지)
      // await AtlasUser.deleteMany({});
      
      // 중복 체크 후 삽입
      let inserted = 0;
      let skipped = 0;
      for (const user of users) {
        const exists = await AtlasUser.findOne({ email: user.email });
        if (!exists) {
          await AtlasUser.create(user.toObject());
          inserted++;
        } else {
          skipped++;
        }
      }
      console.log(`   ✅ Users: ${inserted}개 추가, ${skipped}개 건너뜀 (중복)`);
    } else {
      console.log('   ℹ️  Users: 데이터 없음');
    }

    // Patients 마이그레이션
    console.log('📦 Patients 데이터 마이그레이션 중...');
    const patients = await LocalPatient.find({});
    if (patients.length > 0) {
      await AtlasPatient.deleteMany({}); // Patients는 전체 교체
      await AtlasPatient.insertMany(patients.map(p => p.toObject()));
      console.log(`   ✅ Patients: ${patients.length}개 추가`);
    } else {
      console.log('   ℹ️  Patients: 데이터 없음');
    }

    // Diagnoses 마이그레이션
    console.log('📦 Diagnoses 데이터 마이그레이션 중...');
    const diagnoses = await LocalDiagnosis.find({});
    if (diagnoses.length > 0) {
      await AtlasDiagnosis.deleteMany({}); // Diagnoses는 전체 교체
      await AtlasDiagnosis.insertMany(diagnoses.map(d => d.toObject()));
      console.log(`   ✅ Diagnoses: ${diagnoses.length}개 추가`);
    } else {
      console.log('   ℹ️  Diagnoses: 데이터 없음');
    }

    // 최종 확인
    console.log('\n📊 Atlas 데이터베이스 최종 상태:');
    const atlasUserCount = await AtlasUser.countDocuments();
    const atlasPatientCount = await AtlasPatient.countDocuments();
    const atlasDiagnosisCount = await AtlasDiagnosis.countDocuments();
    console.log(`   Users: ${atlasUserCount}개`);
    console.log(`   Patients: ${atlasPatientCount}개`);
    console.log(`   Diagnoses: ${atlasDiagnosisCount}개`);

    console.log('\n✅ 마이그레이션 완료!');
    
    await localConnection.close();
    await atlasConnection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    if (localConnection) await localConnection.close();
    if (atlasConnection) await atlasConnection.close();
    process.exit(1);
  }
};

migrateData();





