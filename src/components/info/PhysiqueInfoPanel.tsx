import { Physique } from '../../types';

interface PhysiqueInfoPanelProps {
  physique: Physique;
}

export function PhysiqueInfoPanel({ physique }: PhysiqueInfoPanelProps) {
  return (
    <div style={{ fontSize: '0.9rem' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: 'var(--primary)' }}>{physique.name}</strong>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {physique.description}
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Effects:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          {physique.effects.special?.map((effect: string, index: number) => (
            <li key={index} style={{ fontSize: '0.85rem' }}>
              {effect}
            </li>
          ))}
        </ul>
      </div>
      
      {physique.evolutionTargetId && (
        <div>
          <strong>Potential Evolutions:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
            {physique.evolutionRequirements && (
              <li style={{ fontSize: '0.85rem' }}>
                {physique.evolutionTargetId}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
