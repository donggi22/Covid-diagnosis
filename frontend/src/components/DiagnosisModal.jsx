import React, { useEffect } from "react";
import "./DiagnosisModal.css";

export default function DiagnosisModal({ isOpen, onClose, data, onSave, onNewDiagnosis }) {
  if (!isOpen || !data) return null;

  const {
    originalImage,
    gradcam,
    gradcamPP,
    layercam,
    findings = [],
    confidence,
    recommendation,
    aiNotes
  } = data;

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal Box */}
      <div className="bg-white dark:bg-gray-900 w-[90%] max-w-[1400px] rounded-2xl p-8 overflow-y-auto max-h-[90vh] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI 진단 결과</h2>
          <button
            className="text-gray-600 dark:text-gray-300 text-xl hover:text-black dark:hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 4 CAM Images - grid-cols-4 */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <ImageCard title="원본 이미지" subtitle="업로드된 원본 X-Ray 이미지" src={originalImage} />
          <ImageCard title="Grad-CAM" subtitle="기본 Grad-CAM 시각화" src={gradcam} />
          <ImageCard title="Grad-CAM++" subtitle="개선된 Grad-CAM++ 시각화" src={gradcamPP} />
          <ImageCard title="Layer-CAM" subtitle="Layer-CAM 시각화" src={layercam} />
        </div>

        {/* Diagnosis Info Section - 2열 Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* 진단 결과 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 m-0 mb-3">진단 결과</h3>
            {findings && findings.length > 0 ? (
              <div className="space-y-3">
                {findings.map((finding, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-3.5 bg-gray-50 dark:bg-gray-900 rounded-[10px] border border-gray-200 dark:border-gray-700 transition-all hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    <div className="flex-1">
                      <div className="text-base font-medium text-gray-700 dark:text-gray-100 mb-1">{finding.condition}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {finding.condition} 확률: {typeof finding.probability === 'number' 
                          ? `${finding.probability.toFixed(2)}%` 
                          : finding.probability}
                      </div>
                    </div>
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold min-w-[50px] text-center">
                      {typeof finding.probability === 'number' 
                        ? `${Math.round(finding.probability)}%` 
                        : finding.probability}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-lg text-gray-500 dark:text-gray-400">진단 결과가 없습니다.</p>
            )}
          </div>

          {/* 병명 추정값 카드 (권장사항 포함) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 m-0">병명 추정값</h4>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-lg text-base font-bold">
                  {confidence}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">AI 신뢰도</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">모델이 예측한 전체 신뢰도입니다.</div>
              </div>
            </div>
            {/* 권장 사항 */}
            <div className="mt-4">
              <div className="px-4 py-3.5 bg-gray-50 dark:bg-gray-900 rounded-[10px] border border-gray-200 dark:border-gray-700">
                <div className="text-base font-medium text-gray-700 dark:text-gray-100 mb-1">권장 사항</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {recommendation || '추가 검진을 권장합니다.'}
                </div>
              </div>
            </div>
            {/* AI 분석 노트 */}
            <div className="mt-3">
              <div className="px-4 py-3.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-[10px] border border-yellow-200 dark:border-yellow-600">
                <div className="text-base font-medium text-gray-800 dark:text-yellow-100 mb-1">AI 분석 노트</div>
                <div className="text-sm text-yellow-900 dark:text-yellow-100 leading-relaxed">
                  {aiNotes || 'UNet 기반 폐 분할 + ResNet50 기반 COVID-19 분류 모델 추론 결과입니다.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons (optional) */}
        {(onSave || onNewDiagnosis) && (
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {onSave && (
              <button
                onClick={onSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                진단 결과 저장
              </button>
            )}
            {onNewDiagnosis && (
              <button
                onClick={onNewDiagnosis}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                새 진단
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Image Card Component */
function ImageCard({ title, subtitle, src }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col">
      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100 m-0 mb-1.5">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 m-0 mb-3">{subtitle}</p>
      <div className="w-full h-[260px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {src ? (
          <img
            src={src}
            alt={title}
            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
          />
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-sm">이미지 없음</p>
        )}
      </div>
    </div>
  );
}
