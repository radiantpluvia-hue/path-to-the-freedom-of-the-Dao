import { useGameStore } from '../../store/useGameStore';
import { Card } from '../core/Card';
import { Button } from '../core/Button';

export function ManualsPanel() {
  const { player, canEvolveManual, evolveManual } = useGameStore();

  if (!player.manuals || player.manuals.length === 0) {
    return (
      <Card title="📚 Manuals">
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
          You have not learned any cultivation manuals yet.
        </p>
      </Card>
    );
  }

  return (
    <Card title="📚 Manuals">
      <div style={{ display: 'grid', gap: '10px' }}>
        {player.manuals.map((m, idx) => {
          const status = canEvolveManual ? canEvolveManual(m.id) : { can: false, unmet: [] };
          return (
            <div key={m.id || idx} style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--primary)' }}>{m.name}</strong>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{m.rank}</div>
                </div>
                {m.evolutionTargetId && (
                  <Button
                    onClick={() => evolveManual && evolveManual(m.id)}
                    disabled={!status.can}
                    size="small"
                  >
                    {status.can ? 'Evolve' : 'Cannot Evolve'}
                  </Button>
                )}
              </div>
              {!status.can && status.unmet?.length > 0 && (
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Unmet: {status.unmet.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
