import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style
}: ButtonProps) {
  const baseStyles = {
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
      color: 'var(--dark)',
      border: '2px solid var(--primary)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--primary)',
      border: '2px solid var(--primary)'
    },
    danger: {
      background: 'var(--danger)',
      color: 'white',
      border: '2px solid var(--danger)'
    }
  };

  const sizes = {
    small: { padding: '8px 16px', fontSize: '0.9rem' },
    medium: { padding: '12px 24px', fontSize: '1rem' },
    large: { padding: '16px 32px', fontSize: '1.1rem' }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...style
      }}
    >
      {children}
    </button>
  );
}