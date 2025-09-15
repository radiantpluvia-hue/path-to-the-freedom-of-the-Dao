import React from 'react';
import { useGameStore, Buff } from '@/store/useGameStore';

const getBuffEffectText = (buff: Buff): string => {
  // Handle stat buffs
  if (buff.appliedEffects?.stats) {
    const effectStrings = Object.entries(buff.appliedEffects.stats).map(([stat, value]) => {
      if (value === 0) return '';
      const numericValue = typeof value === 'number' ? value : (value as any).base || 0;
      const sign = numericValue > 0 ? '+' : '';
      const originalEffect = buff.effects?.stats?.[stat];
      if (typeof originalEffect === 'object' && (originalEffect as any).percent) {
        return `${sign}${(((originalEffect as any).percent) * 100).toFixed(0)}% ${stat.toUpperCase()}`;
      }
      return `${sign}${numericValue} ${stat.toUpperCase()}`;
    });
    return effectStrings.filter(s => s).join(', ');
  }

  // Handle triggered effects
  const reflectEffect = buff.effects?.triggered?.on_take_damage;
  if (reflectEffect?.type === 'reflect_damage' && reflectEffect.percent) {
    return `Reflects ${reflectEffect.percent * 100}% of damage taken.`;
  }

  return buff.description;
};

export const ActiveBuffsDisplay = () => {
  const { player } = useGameStore();

  if (!player.activeBuffs || player.activeBuffs.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 1000
    }}>
      {player.activeBuffs.map(buff => (
        <div 
          key={buff.id} 
          title={`${buff.name}: ${buff.description}`}
          style={{
            padding: '8px 12px',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid var(--success)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'help'
          }}
        >
          <strong>{buff.name}</strong>
          <div style={{ color: 'var(--success-dark)', fontWeight: 'bold' }}>
            {getBuffEffectText(buff)}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            {buff.durationType === 'ticks' ? `Time Left: ${buff.duration}` : `Uses Left: ${buff.duration}`}
          </div>
        </div>
      ))}
    </div>
  );
};