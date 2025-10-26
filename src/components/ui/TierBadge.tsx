import React from 'react';
import { tierFriendlyName, tierFullLabel } from '@/game/tierHelpers';
import { displayRarity } from '@/utils/rarityNames';
import './TierBadge.css';

type Props = {
  tier?: string | null;
  className?: string;
  small?: boolean;
};

export default function TierBadge({ tier, className = '', small = false }: Props) {
  const code = String(tier || '');
  const base = code.replace(/[+-]$/, '') || 'F';
  const modifier = code.endsWith('+') ? 'plus' : code.endsWith('-') ? 'minus' : '';
  const cssClass = `tier-badge tier-${base}${modifier ? `-${modifier}` : ''} ${className}`.trim();
  const title = tierFullLabel(code || 'F');
  return (
    <span className={cssClass} title={title} aria-label={title} style={{ fontSize: small ? '0.75rem' : '0.9rem', padding: small ? '2px 6px' : '4px 8px', borderRadius: 6, display: 'inline-block' }}>
      {displayRarity(code) || (code || 'F')} {small ? '' : `• ${tierFriendlyName(code)}`}
    </span>
  );
}
