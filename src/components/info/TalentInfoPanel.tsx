import { Talent, TALENT_DATA, getTalentById } from '../../../gameData';
import TierBadge from '@/components/ui/TierBadge';

interface TalentInfoPanelProps {
  talentId: string;
}

export function TalentInfoPanel({ talentId }: TalentInfoPanelProps) {
  // Normalize common legacy aliases (e.g., 'average' -> 'mortal') before lookup
  const aliasMap: Record<string, string> = {
    average: 'mortal',
    common: 'mortal'
  };

  const lookupId = (talentId && String(talentId)) ? (aliasMap[String(talentId)] || String(talentId)) : String(talentId);

  // Use centralized lookup helper when available
  const talent = typeof getTalentById === 'function' ? getTalentById(lookupId) : TALENT_DATA.find((t: Talent) => t.id === lookupId);

  if (!talent) {
    // Avoid spamming console during hot renders: warn once per missing id in dev
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      const warned = (globalThis as any).__WARNED_MISSING_TALENTS__ = (globalThis as any).__WARNED_MISSING_TALENTS__ || new Set<string>();
      if (!warned.has(lookupId)) {
        // eslint-disable-next-line no-console
        console.warn('TalentInfoPanel: missing talent data for id', lookupId);
        warned.add(lookupId);
      }
    }

    return (
      <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
        <div><strong>Unknown Talent</strong></div>
        <div style={{ fontSize: '0.85rem', marginTop: 6 }}>ID: <code style={{ color: 'var(--text)' }}>{String(lookupId)}</code></div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 6 }}>Talent data not found — check your game data or save migration.</div>
      </div>
    );
  }

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: 'var(--primary)' }}>{talent.name}</strong>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {talent.description}
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Effects:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li style={{ fontSize: '0.85rem' }}>
            Cultivation Speed: {talent.cultivationMultiplier}x
          </li>
          <li style={{ fontSize: '0.85rem' }}>
            Breakthrough Bonus: +{talent.breakthroughBonus * 100}%
          </li>
        </ul>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>
        Rarity: <span style={{ verticalAlign: 'middle' }}><TierBadge tier={talent.rarity} small={true} /></span>
      </div>
    </div>
  );
}
