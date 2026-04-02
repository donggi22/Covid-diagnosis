import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'react-feather';

/**
 * 토스트 알림 컴포넌트
 * @param {Object} props
 * @param {string} props.message - 표시할 메시지
 * @param {string} props.type - 'error' | 'success' | 'info'
 * @param {number} props.duration - 표시 시간 (ms, 기본 3000)
 * @param {Function} props.onClose - 닫기 콜백
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    error: {
      bgColor: 'bg-red-500',
      borderColor: 'border-red-600',
      icon: AlertCircle,
      iconColor: 'text-white'
    },
    success: {
      bgColor: 'bg-green-500',
      borderColor: 'border-green-600',
      icon: CheckCircle,
      iconColor: 'text-white'
    },
    info: {
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-600',
      icon: Info,
      iconColor: 'text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bgColor} 
        rounded-lg
        shadow-lg
        p-4
        mb-3
        flex
        items-center
        gap-3
        text-white
        min-w-[300px]
        max-w-[500px]
        animate-slide-in-right
      `}
      role="alert"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <Icon size={20} className={`${config.iconColor} flex-shrink-0`} />
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-80 transition-opacity ml-2"
        aria-label="닫기"
      >
        <X size={18} className="text-white" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Toast;

