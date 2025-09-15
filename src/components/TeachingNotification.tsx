import React, { useEffect, useState } from 'react';

interface TeachingNotificationProps {
  message: string;
  type: 'success' | 'failure' | 'unlock';
  onClose: () => void;
}

export const TeachingNotification: React.FC<TeachingNotificationProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 'bold',
      zIndex: 1000,
      transition: 'opacity 0.3s ease',
      opacity: visible ? 1 : 0,
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    };

    const typeStyles = {
      success: { backgroundColor: '#28a745' },
      failure: { backgroundColor: '#dc3545' },
      unlock: { backgroundColor: '#17a2b8' }
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  return (
    <div style={getStyles()}>
      {message}
    </div>
  );
};