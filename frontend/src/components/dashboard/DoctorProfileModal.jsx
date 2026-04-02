import React from 'react';
import { X, Mail, Phone, Calendar, Award, BookOpen, Briefcase, MapPin, Clock, User } from 'react-feather';

/**
 * 의사 프로필 모달 컴포넌트 (읽기 전용)
 */
const DoctorProfileModal = ({ isOpen, onClose, doctor }) => {
  if (!isOpen || !doctor) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={doctor.avatar || `https://i.pravatar.cc/100?img=${doctor.id || 1}`}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-white/50"
              />
              {doctor.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{doctor.name}</h2>
              <p className="text-blue-100 text-sm">{doctor.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              기본 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">이메일</div>
                  <div className="text-sm font-medium text-slate-800">{doctor.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">연락처</div>
                  <div className="text-sm font-medium text-slate-800">{doctor.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">소속</div>
                  <div className="text-sm font-medium text-slate-800">{doctor.department}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock size={16} className="text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">근무 기간</div>
                  <div className="text-sm font-medium text-slate-800">{doctor.workPeriod}</div>
                </div>
              </div>
            </div>
          </section>

          {/* 학력 */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              학력
            </h3>
            <div className="space-y-3">
              {doctor.education?.map((edu, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="font-medium text-slate-800">{edu.degree}</div>
                  <div className="text-sm text-slate-600">{edu.school}</div>
                  <div className="text-xs text-slate-500 mt-1">{edu.period}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 경력 */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" />
              경력
            </h3>
            <div className="space-y-3">
              {doctor.experience?.map((exp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{exp.position}</div>
                      <div className="text-sm text-slate-600">{exp.institution}</div>
                      <div className="text-xs text-slate-500 mt-1">{exp.period}</div>
                    </div>
                    {exp.isCurrent && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        현재
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 자격증 및 수상 */}
          {doctor.certifications && doctor.certifications.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                자격증 및 수상
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.certifications.map((cert, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-sm rounded-full font-medium border border-blue-200"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 전문 분야 */}
          {doctor.specialties && doctor.specialties.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                전문 분야
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.specialties.map((specialty, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm rounded-full font-medium border border-purple-200"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 통계 */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              활동 통계
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-700">{doctor.stats?.totalPatients || 0}</div>
                <div className="text-xs text-blue-600 mt-1">담당 환자</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-700">{doctor.stats?.totalSurgeries || 0}</div>
                <div className="text-xs text-green-600 mt-1">수술 건수</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-700">{doctor.stats?.yearsExperience || 0}</div>
                <div className="text-xs text-purple-600 mt-1">경력 (년)</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileModal;

