import React from 'react';
import Toast from './Toast';

/**
 * 토스트 컨테이너 - 여러 토스트를 관리하고 표시
 */
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col items-end"
      style={{ pointerEvents: 'none' }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{ pointerEvents: 'auto' }}
          className="animate-slide-in-right"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

