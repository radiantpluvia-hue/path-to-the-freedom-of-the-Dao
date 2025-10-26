import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Card } from '../core/Card';
import SmallChip from '../ui/SmallChip';
import { Button } from '../core/Button';
import ToastContainer from '../ToastContainer';
import RandomizedCharacters from '../../components/RandomizedCharacters';

const SectPanel: React.FC = () => {
  const store = useGameStore();
  const { player, leaveSect, requestSectMission, setUIProperty, addEventLog, acceptSectMission, declineSectMission, toggleMissionDetails, attemptMission, completeMission } = store;

  const handleLeave = () => {
    try {
      leaveSect?.();
      addEventLog?.('You left your sect.');
      setUIProperty('currentScreen', 'game');
    } catch (e) { /* ignore */ }
  };

  const handleRequestMission = () => {
    try {
      requestSectMission?.();
      addEventLog?.('Requested a sect mission.');
    } catch (e) { /* ignore */ }
  };

  const inventory = Array.isArray(player.inventory) ? player.inventory : [];

  const activeMissions = (store.story && Array.isArray(store.story.activeRandomMissions)) ? store.story.activeRandomMissions : [];
  const toggleMissionOpen = (id: string) => { try { toggleMissionDetails?.(id); } catch (e) { /* ignore */ } };

  // Helper to render objective progress for a mission
  const renderObjectives = (m: any) => {
    if (!m.objectives || !Array.isArray(m.objectives) || m.objectives.length === 0) return <div style={{ color: 'var(--muted)' }}>No objectives.</div>;
    return (
      <ul style={{ marginTop: 8 }}>
        {m.objectives.map((o: any, idx: number) => {
          const progress = o.progress || 0;
          const target = o.target || 1;
          const done = progress >= target;
          return (
            <li key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{o.description || o.type || 'Objective'}</strong>
                <SmallChip style={{ fontSize: 12 }}>{`${progress}/${target}${done ? ' ✓' : ''}`}</SmallChip>
              </div>
              <div style={{ fontSize: '0.85rem', color: done ? 'var(--success)' : 'var(--muted)' }}>
                {done ? 'Complete' : ''}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  // Note: per-mission Accept/Decline handlers are applied inline in the list render

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16, color: 'var(--primary)' }}>Sect Hub</h2>

      <div style={{ display: 'grid', gap: 16 }}>
        <Card title="Your Sect">
          {player.sect ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div>Member of: <strong>{player.sect}</strong></div>
              <div>Reputation: {store.getSectReputation?.(player.sect) ?? 0}</div>
              <div>
                <h5 style={{ margin: '6px 0' }}>Notable Disciples</h5>
                <RandomizedCharacters strength={store.getSectReputation?.(player.sect) ?? 0} size={5} seed={player.sect || 'sect'} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button onClick={handleRequestMission} variant="secondary"><SmallChip>Request Sect Mission</SmallChip></Button>
                <Button onClick={handleLeave} variant="danger"><SmallChip>Leave Sect</SmallChip></Button>
                <Button onClick={() => setUIProperty('currentScreen', 'game')} variant="secondary"><SmallChip>Back to Game</SmallChip></Button>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)' }}>
              You are not a member of any sect. Visit Join a Sect to browse available sects.
              <div style={{ marginTop: 8 }}>
                <Button onClick={() => setUIProperty('currentScreen', 'sects')} variant="secondary"><SmallChip>Browse Sects</SmallChip></Button>
                <Button onClick={() => setUIProperty('currentScreen', 'game')} variant="secondary"><SmallChip>Back to Game</SmallChip></Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Inventory Preview">
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Quick view of your inventory (first 10 items)</div>
          <ul style={{ marginTop: 8 }}>
            {inventory.slice(0, 10).map((it: any, idx: number) => (
              <li key={idx} style={{ padding: '6px 0' }}>{typeof it === 'string' ? it : it.name || it.id}</li>
            ))}
            {inventory.length === 0 && <li style={{ color: 'var(--muted)' }}>No items</li>}
          </ul>
        </Card>

        <Card title="Active Sect Missions">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <Button onClick={() => { try { const removed = store.checkMissionExpirations?.(); addEventLog?.(`Checked missions: removed ${removed}`); store.showToast?.(`Checked missions: removed ${removed}`); } catch (e) { /* ignore */ } }} variant="secondary">Refresh Missions</Button>
          </div>
          {activeMissions.length ? (
            activeMissions.map((m: any) => (
              <div key={m.id} style={{ borderBottom: '1px dashed var(--border)', padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{m.title}</div>
                    <div style={{ color: 'var(--muted)' }}>{m.description}</div>
                  </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                    <Button onClick={() => {
                      try {
                        if (typeof acceptSectMission === 'function') {
                          acceptSectMission(m.id);
                        } else if (typeof attemptMission === 'function') {
                          attemptMission(m.id);
                        } else if (typeof completeMission === 'function') {
                          completeMission(m.id);
                        }
                      } catch (e) { /* ignore */ }
                    }}><SmallChip>Accept</SmallChip></Button>
                    { /* Claim rewards button when mission is eligible */ }
                    {((m.isCompleted === true) || (Array.isArray(m.objectives) && m.objectives.every((o: any) => (o.progress || 0) >= (o.target || o.value || 1)))) && (
                      <Button onClick={() => { try { const ok = store.claimMissionRewards?.(m.id); if (ok) { addEventLog?.(`Claimed rewards for ${m.title}`); store.showToast?.(`Claimed rewards for ${m.title}`); } else { store.showToast?.('Failed to claim rewards'); } } catch (e) { /* ignore */ } }} variant="primary"><SmallChip>Claim Rewards</SmallChip></Button>
                    )}
                    <Button onClick={() => { try { declineSectMission?.(m.id); } catch (e) { /* ignore */ } }} variant="secondary"><SmallChip>Decline</SmallChip></Button>
                      <Button onClick={() => toggleMissionOpen(m.id)} variant="secondary"><SmallChip>{m._uiExpanded ? 'Hide' : 'Details'}</SmallChip></Button>
                  </div>
                </div>

                {m._uiExpanded && (
                  <>
                    <div style={{ marginTop: 8 }}>{renderObjectives(m)}</div>

                    {m.reward && (
                      <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--muted)' }}>
                        <div><strong>Rewards:</strong></div>
                        <div>Yuan: {m.reward.yuan || 0}</div>
                        <div>Spirit Stones: {m.reward.spiritStones ? `${m.reward.spiritStones.low||0}/${m.reward.spiritStones.mid||0}/${m.reward.spiritStones.high||0}` : '0/0/0'}</div>
                        {Array.isArray(m.reward.items) && m.reward.items.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            Items:
                            <ul>
                              {m.reward.items.map((it: any, i: number) => <li key={i}>{it.name || it.id || JSON.stringify(it)}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--muted)' }}>No active sect missions.</div>
          )}
        </Card>

        <Card title="Developer Notes">
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            This is a lightweight scaffold for the Sect/Inventory hub. Use this screen to build sect-specific features
            (missions, reputation, sect stores, relics) and to surface inventory interactions tied to sect progression.
          </div>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SectPanel;
