import React from 'react';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  style?: React.CSSProperties;
  showText?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
  style = {},
  showText = false,
  color = 'var(--primary)',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  height = '8px'
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height,
        backgroundColor,
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease',
          borderRadius: '4px'
        }}
      />
      {showText && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'var(--text)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none'
          }}
        >
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export default Progress;