import { useGameStore } from '@/store/useGameStore';
import { MAJOR_FACTIONS } from '@/systems/SectSystem';

export function FactionPanel() {
  const { player } = useGameStore();
  
  const factionStandings = player.factionStandings || {};

  return (
    <div style={{ fontSize: '0.9rem' }}>
      <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>🏛️ Faction Relations</h3>
      
      {MAJOR_FACTIONS.map(faction => {
        const standing = factionStandings[faction.id] || 0;
        const standingColor = standing >= 50 ? 'var(--success)' : 
                             standing >= 0 ? 'var(--accent)' : 
                             standing >= -50 ? 'var(--warning)' : 'var(--danger)';
        
        return (
          <div key={faction.id} style={{ 
            marginBottom: '8px', 
            padding: '8px', 
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--primary)' }}>{faction.name}</strong>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  {faction.type} • {faction.description}
                </div>
              </div>
              <div style={{ 
                color: standingColor, 
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {standing > 0 ? '+' : ''}{standing}
              </div>
            </div>
            
            {faction.conflicts.length > 0 && (
              <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Conflicts: {faction.conflicts.join(', ')}
              </div>
            )}
          </div>
        );
      })}
      
      {Object.keys(factionStandings).length === 0 && (
        <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
          No faction relationships yet. Explore the world to encounter factions!
        </div>
      )}
    </div>
  );
}
