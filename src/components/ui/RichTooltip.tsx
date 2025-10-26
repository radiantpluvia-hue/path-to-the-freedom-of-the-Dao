import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type RichTooltipProps = {
  content: string | React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number | string;
};

export default function RichTooltip({ content, children, maxWidth = 320 }: RichTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const enter = (e: MouseEvent) => {
      setVisible(true);
      setPos({ x: (e as any).clientX, y: (e as any).clientY });
    };
    const move = (e: MouseEvent) => setPos({ x: (e as any).clientX, y: (e as any).clientY });
    const leave = () => setVisible(false);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    };
  }, []);

  // portal container ref
  const portalElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // create container on mount
    const el = document.createElement('div');
    portalElRef.current = el;
    document.body.appendChild(el);
    return () => {
      try { if (portalElRef.current && portalElRef.current.parentNode) portalElRef.current.parentNode.removeChild(portalElRef.current); } catch { /* ignore */ }
      portalElRef.current = null;
    };
  }, []);

  const tooltipNode = visible ? (
    <div
      role="tooltip"
      style={{
        position: 'fixed',
        left: pos.x + 12,
        top: pos.y + 12,
        background: 'rgba(12,12,12,0.95)',
        color: '#fff',
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.06)',
        zIndex: 4000,
        maxWidth,
        boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
        fontSize: 13,
        whiteSpace: 'pre-wrap'
      }}
    >
      {typeof content === 'string' ? <div style={{ lineHeight: '1.3' }}>{content}</div> : content}
    </div>
  ) : null;

  return (
    <div style={{ display: 'inline-block', position: 'relative' }} ref={ref}>
      {children}
      {portalElRef.current && tooltipNode ? createPortal(tooltipNode, portalElRef.current) : null}
    </div>
  );
}
