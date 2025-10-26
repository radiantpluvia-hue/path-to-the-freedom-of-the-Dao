import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  className,
  type = 'button',
  ariaLabel
}: ButtonProps, ref) {
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
      color: 'white',
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 6px 18px rgba(2,6,23,0.12)'
    },
    secondary: {
      background: 'transparent',
      color: 'white',
      border: '1px solid rgba(255,255,255,0.06)',
      // removed backdropFilter to avoid blurry rendering on some displays
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
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={className}
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
});

export default Button;