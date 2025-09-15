import React from 'react';

type Props = {
  children: React.ReactNode;
  content: React.ReactNode;
};

// Minimal accessible tooltip: shows content on hover/focus using CSS.
export default function Tooltip({ children, content }: Props) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span tabIndex={0} style={{ cursor: 'help' }}>{children}</span>
      <span
        role="tooltip"
        aria-hidden={true}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '125%',
          whiteSpace: 'nowrap',
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '6px 8px',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 2000,
          display: 'none'
        }}
        className="copilot-tooltip"
      >
        {content}
      </span>
      <style>{`
        .copilot-tooltip-visible { display: inline-block !important }
        span[tabindex]:hover + .copilot-tooltip, span[tabindex]:focus + .copilot-tooltip { display: inline-block }
      `}</style>
    </span>
  );
}
