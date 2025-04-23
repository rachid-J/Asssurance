import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

const Notification = ({ status, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!isVisible) return null;

  const notificationStyle = {
    success: {
      backgroundColor: '#48BB78',
      icon: <CheckCircleIcon className="w-5 h-5" />,
    },
    error: {
      backgroundColor: '#F56565',
      icon: <ExclamationTriangleIcon  className="w-5 h-5" />,
    },
  }[status];

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: notificationStyle.backgroundColor }}
      role="alert"
      aria-live="assertive"
    >
      {notificationStyle.icon}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Notification;