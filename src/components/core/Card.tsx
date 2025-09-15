import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div style={{
      background: 'rgba(212, 175, 55, 0.05)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      backdropFilter: 'blur(10px)'
    }}>
      {title && (
        <h3 style={{
          color: 'var(--primary)',
          marginBottom: '15px',
          fontSize: '1.2rem',
          fontWeight: '600'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}