import React from 'react';
import { X, AlertCircle, FileText, Activity, Heart, Droplet, Info } from 'react-feather';

/**
 * 환자 특이사항 모달 컴포넌트
 */
const PatientDetailsModal = ({ patient, surgery, onClose }) => {
  if (!patient) return null;

  // 샘플 특이사항 데이터 (실제로는 API에서 가져와야 함)
  const patientDetails = {
    allergies: patient.allergies || ['없음'],
    medicalHistory: patient.medicalHistory || ['고혈압 (2020년 진단)', '당뇨병 (2018년 진단)'],
    currentMedications: patient.currentMedications || ['아스피린 100mg (1일 1회)', '메트포민 500mg (1일 2회)'],
    specialNotes: patient.specialNotes || patient.symptoms || '특이사항 없음',
    surgeryNotes: surgery?.notes || '수술 전 특별한 주의사항 없음'
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'urgent': 'bg-red-100 text-red-700 border-red-300',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'normal': 'bg-green-100 text-green-700 border-green-300'
    };
    return statusMap[status] || statusMap['normal'];
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'urgent': '긴급',
      'pending': '주의',
      'normal': '정상'
    };
    return statusMap[status] || '정상';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white w-[90%] max-w-[600px] rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {patient.name?.[0] || '환'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {patient.name || '환자 정보 없음'}
              </h3>
              <p className="text-xs text-slate-500">
                {patient.age && `${patient.age}세`} {patient.gender && `· ${patient.gender}`}
                {patient.medicalRecordNumber && ` · 차트번호: ${patient.medicalRecordNumber}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* 수술 정보 (있는 경우) */}
        {surgery && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">예정된 수술</span>
            </div>
            <div className="text-sm text-blue-700">
              <div className="font-medium">{surgery.surgeryType}</div>
              <div className="text-xs text-blue-600 mt-0.5">
                예정 시간: {surgery.scheduledTime} · {surgery.location || '수술실'}
              </div>
            </div>
          </div>
        )}

        {/* 본문 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 환자 상태 */}
          {patient.status && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">상태:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                {getStatusLabel(patient.status)}
              </span>
            </div>
          )}

          {/* 알레르기 정보 */}
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-red-600" />
              <span className="text-sm font-semibold text-red-800">알레르기 정보</span>
            </div>
            <div className="text-sm text-red-700">
              {Array.isArray(patientDetails.allergies) ? (
                <ul className="list-disc list-inside space-y-1">
                  {patientDetails.allergies.map((allergy, idx) => (
                    <li key={idx}>{allergy}</li>
                  ))}
                </ul>
              ) : (
                <p>{patientDetails.allergies}</p>
              )}
            </div>
          </div>

          {/* 과거력 */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">과거력</span>
            </div>
            <div className="text-sm text-slate-700">
              {Array.isArray(patientDetails.medicalHistory) ? (
                <ul className="list-disc list-inside space-y-1">
                  {patientDetails.medicalHistory.map((history, idx) => (
                    <li key={idx}>{history}</li>
                  ))}
                </ul>
              ) : (
                <p>{patientDetails.medicalHistory}</p>
              )}
            </div>
          </div>

          {/* 복용 중인 약물 */}
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Droplet size={14} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">복용 중인 약물</span>
            </div>
            <div className="text-sm text-purple-700">
              {Array.isArray(patientDetails.currentMedications) ? (
                <ul className="list-disc list-inside space-y-1">
                  {patientDetails.currentMedications.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              ) : (
                <p>{patientDetails.currentMedications}</p>
              )}
            </div>
          </div>

          {/* 특이사항 */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <Info size={14} className="text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">특이사항</span>
            </div>
            <div className="text-sm text-yellow-700 whitespace-pre-wrap">
              {patientDetails.specialNotes}
            </div>
          </div>

          {/* 수술 관련 특이사항 */}
          {surgery && (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={14} className="text-orange-600" />
                <span className="text-sm font-semibold text-orange-800">수술 관련 주의사항</span>
              </div>
              <div className="text-sm text-orange-700 whitespace-pre-wrap">
                {patientDetails.surgeryNotes}
              </div>
            </div>
          )}

          {/* 병실 정보 */}
          {patient.roomNumber && (
            <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-200">
              병실: {patient.roomNumber}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;

