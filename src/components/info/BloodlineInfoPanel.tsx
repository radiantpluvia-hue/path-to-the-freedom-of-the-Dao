import { Bloodline } from '@/types';

interface BloodlineInfoPanelProps {
  bloodline: Bloodline;
}

export function BloodlineInfoPanel({ bloodline }: BloodlineInfoPanelProps) {
  return (
    <div style={{ fontSize: '0.9rem' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: 'var(--primary)' }}>{bloodline.name}</strong>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {bloodline.description}
        </div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Effects:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
          {bloodline.effects.special?.map((effect: string, index: number) => (
            <li key={index} style={{ fontSize: '0.85rem' }}>
              {effect}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
