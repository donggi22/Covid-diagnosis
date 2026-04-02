const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 환경 변수 로드
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// MongoDB 연결
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const fixNormalRange = async () => {
  let connection;

  try {
    console.log('🔄 MongoDB 연결 중...');
    connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB 연결 성공\n');

    // Diagnosis 모델 정의
    const diagnosisSchema = new mongoose.Schema({}, { strict: false });
    const Diagnosis = connection.connection.model('Diagnosis', diagnosisSchema, 'diagnoses');

    // "Normal Range" 또는 "정상 범위"를 가진 진단 기록 찾기
    console.log('🔍 "Normal Range" 및 "정상 범위" 진단 기록 검색 중...');
    const diagnoses = await Diagnosis.find({
      'aiAnalysis.findings.condition': { 
        $in: ['Normal Range', '정상 범위'] 
      }
    });

    console.log(`   발견된 진단 기록: ${diagnoses.length}건\n`);

    if (diagnoses.length === 0) {
      console.log('✅ 변경할 데이터가 없습니다.');
      await connection.connection.close();
      process.exit(0);
    }

    // 변경할 데이터 미리보기
    console.log('📋 변경 예정 데이터:');
    diagnoses.forEach((diagnosis, index) => {
      const condition = diagnosis.aiAnalysis?.findings?.[0]?.condition;
      console.log(`   ${index + 1}. ID: ${diagnosis._id}, 현재: "${condition}"`);
    });
    console.log('');

    // 실제 업데이트 수행
    console.log('🔄 데이터 업데이트 중...');
    let updatedCount = 0;

    for (const diagnosis of diagnoses) {
      const findings = diagnosis.aiAnalysis?.findings || [];
      
      // findings 배열에서 "Normal Range" 또는 "정상 범위"를 "Normal" 또는 "정상"으로 변경
      const updatedFindings = findings.map(finding => {
        if (finding.condition === 'Normal Range') {
          return { ...finding, condition: 'Normal' };
        } else if (finding.condition === '정상 범위') {
          return { ...finding, condition: '정상' };
        }
        return finding;
      });

      // 업데이트
      await Diagnosis.updateOne(
        { _id: diagnosis._id },
        { 
          $set: { 
            'aiAnalysis.findings': updatedFindings 
          } 
        }
      );
      updatedCount++;
    }

    console.log(`✅ ${updatedCount}건의 진단 기록이 업데이트되었습니다.\n`);

    // 최종 확인
    console.log('📊 최종 확인:');
    const remainingNormalRange = await Diagnosis.countDocuments({
      'aiAnalysis.findings.condition': { 
        $in: ['Normal Range', '정상 범위'] 
      }
    });
    const normalCount = await Diagnosis.countDocuments({
      'aiAnalysis.findings.condition': { 
        $in: ['Normal', '정상'] 
      }
    });
    
    console.log(`   "Normal Range" 또는 "정상 범위": ${remainingNormalRange}건`);
    console.log(`   "Normal" 또는 "정상": ${normalCount}건`);

    if (remainingNormalRange === 0) {
      console.log('\n✅ 모든 "Normal Range" 및 "정상 범위"가 성공적으로 변경되었습니다!');
    } else {
      console.log(`\n⚠️  아직 ${remainingNormalRange}건이 남아있습니다.`);
    }

    await connection.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error.stack);
    if (connection) await connection.connection.close();
    process.exit(1);
  }
};

// 실행
fixNormalRange();

