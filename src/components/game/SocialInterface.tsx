import { useGameStore } from '../../store/useGameStore';
import { Card } from '../core/Card';
import { Progress } from '../core/Progress';
import { ChoiceModal } from '../../../ChoiceModal';
import { CodexModal } from '../Codex';
import { RivalInfoPanel } from '@/components/info/RivalInfoPanel';
import { FactionStandingPanel } from '@/components/info/FactionStandingPanel';
import { FactionPanel } from '../../../FactionPanel';
import { RivalsPanel } from '../../../RivalsPanel';
import { ManualsPanel } from './ManualsPanel';

export function SocialInterface() {
  // Button import removed (unused)
  const { ui, setUIProperty, player } = useGameStore();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Tabs for Core | Social */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 20px',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, var(--dark), var(--darker))',
          zIndex: 5,
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <button
          onClick={() => setUIProperty('currentScreen', 'game')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: ui.currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Core
        </button>
        <button
          onClick={() => setUIProperty('currentScreen', 'social')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: ui.currentScreen === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Social
        </button>
      </div>

      <div style={{ padding: 20 }}>
        {/* Global Rival Info Modal */}
        {(ui as any).selectedRival && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500
          }}>
            <div style={{ backgroundColor: 'var(--dark)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
              <RivalInfoPanel
                rivalId={(ui as any).selectedRival}
                onClose={() => setUIProperty('selectedRival', null)}
                onChallenge={(rid) => {
                  (useGameStore.getState() as any).startRivalEncounter(rid);
                  setUIProperty('selectedRival', null);
                }}
              />
            </div>
          </div>
        )}

  <ChoiceModal />
  <CodexModal open={ui.showCodex} onClose={() => setUIProperty('showCodex', false)} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            alignItems: 'start'
          }}
        >
          <div style={{ display: 'grid', gap: 20 }}>
            <Card title="🏛️ Relations">
              <FactionStandingPanel />
            </Card>
            <FactionPanel />
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <Card title="⚔️ Rivals">
              <RivalsPanel />
            </Card>

            <Card title="📊 Skills">
              <div style={{ display: 'grid', gap: '10px' }}>
                {Object.entries(player.skills).map(([skillId, skill]) => (
                  <div key={skillId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{skillId.replace(/([A-Z])/g, ' $1')}</span>
                      <span style={{ color: 'var(--primary)' }}>Level {skill.level}</span>
                    </div>
                    <Progress value={skill.exp} max={skill.expToNext} />
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Inventory">
              <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                {player.inventory.length === 0 ? (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>Empty</p>
                ) : (
                  player.inventory.map((item, index) => (
                    <div key={index} style={{ padding: '8px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--primary)' }}>{item.name}</strong>
                        {item.quantity && item.quantity > 1 && <span style={{ color: 'var(--accent)'}}>x{item.quantity}</span>}
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>{item.description}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <ManualsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}