import React from 'react';

type SmallChipProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'neutral' | 'success' | 'danger' | 'accent';
  title?: string;
};

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  neutral: { background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.06)' },
  success: { background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.5)' },
  danger: { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)' },
  accent: { background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }
};

export default function SmallChip({ children, className = '', style, variant = 'neutral', title }: SmallChipProps) {
  const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;
  return (
    <span
      className={className}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 6px',
        borderRadius: 6,
        fontSize: 12,
        whiteSpace: 'nowrap',
        ...vs,
        ...style
      }}
    >
      {children}
    </span>
  );
}

export { VARIANT_STYLES };
