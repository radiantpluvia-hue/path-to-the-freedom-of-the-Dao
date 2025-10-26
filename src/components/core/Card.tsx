import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
}

export function Card({ title, children, compact = false, style }: CardProps) {
  return (
    <div style={{
      background: 'rgba(212, 175, 55, 0.05)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '12px',
  padding: compact ? '12px' : '20px',
      ...(style || {})
    }}>
      {title && (
        <h3 style={{
          color: 'var(--primary)',
          marginBottom: compact ? '10px' : '15px',
          fontSize: compact ? '1rem' : '1.2rem',
          fontWeight: '600'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}