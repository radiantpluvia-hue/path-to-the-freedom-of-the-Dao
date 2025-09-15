import { Talent, TALENT_DATA } from '../../../gameData';

interface TalentInfoPanelProps {
  talentId: string;
}

export function TalentInfoPanel({ talentId }: TalentInfoPanelProps) {
  // Find the talent by ID
  const talent = TALENT_DATA.find((t: Talent) => t.id === talentId);

  if (!talent) {
    return (
      <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
        Unknown Talent
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
        Rarity: {talent.rarity}
      </div>
    </div>
  );
}
