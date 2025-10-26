import React from 'react';
/**
 * AlignmentPassivesPanel
 * Displays currently active alignment-derived passives (alignmentPassiveApplied) with their
 * dynamically scaled bonus values. Scaling logic lives in PassiveRegistry; values are stored
 * per-passive under player._alignmentPassiveAppliedValues[passiveId] so we can show and remove
 * exact amounts even as axes shift. Hidden when no alignment passives are active.
 */
import * as PassiveRegistry from '../../systems/passiveRegistry';

interface Props {
  player: any;
}

// Small helper to pretty-print a passive id (tag_honor_bound -> Honor Bound)
function formatPassiveId(id: string) {
  return id
    .replace(/^tag_/, '')
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export const AlignmentPassivesPanel: React.FC<Props> = ({ player }) => {
  const applied: string[] = player.alignmentPassiveApplied || [];
  if (!applied.length) return null;

  const valueMap = player._alignmentPassiveAppliedValues || {};

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: 0.5, color: 'var(--primary)', marginBottom: 4 }}>Alignment Passives</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 120, overflowY: 'auto' }}>
        {applied.map((pid) => {
          const passiveDef: any = PassiveRegistry.getPassive(pid) || { id: pid };
          const bonus = valueMap[pid];
          return (
            <li key={pid} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', borderRadius: 4, background: 'var(--surface-alt)', marginBottom: 2 }}>
              <span style={{ fontSize: '0.75rem' }}>{formatPassiveId(passiveDef.id)}</span>
              {bonus ? <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>+{bonus}</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AlignmentPassivesPanel;