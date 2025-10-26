/* eslint-disable no-restricted-imports -- UI panel needs access to some system internals for playtest */
/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { MAJOR_SECTS } from '../../systems/SectSystem';
import { Card } from '../core/Card';
import { Button } from '../core/Button';
import SmallChip from '../ui/SmallChip';
import SectDescriptionModal from './SectDescriptionModal';
import BracketView from './BracketView';
import MiniMap from './MiniMap';
import DomainCaptureModal from './DomainCaptureModal';
import { rollFromTableName, DEFAULT_TOURNAMENT_DROP, TOURNAMENT_DROP_OPTIONS } from '../../utils/dropTable';
import { makeSeededRng as _makeSeededRng, seededFromString, setRuntimeRng, clearRuntimeRng } from '../../utils/seededRng';
void _makeSeededRng;
import * as DomainUtils from '../../utils/domainSystem';
import { getPlayerRealmId } from '../../utils/playerHelpers';

const SectJoiningPanel: React.FC = () => {
  const store = useGameStore();
  const { player, joinSect } = store;
  const [modalOpen, setModalOpen] = useState(false);
  const [visitedSect, setVisitedSect] = useState<any | null>(null);
  const [bracketOpen, setBracketOpen] = useState(false);
  const [bracketResult, setBracketResult] = useState<any | null>(null);
  const [seedText, setSeedText] = useState<string>('');
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [dropTableName, setDropTableName] = useState<string>(DEFAULT_TOURNAMENT_DROP);
  const [autoCommit, setAutoCommit] = useState<boolean>(false);
  const [pendingCapture, setPendingCapture] = useState<{ id: string; territory: any; preview?: any } | null>(null);

  const availableSects = MAJOR_SECTS.filter(sect => {
    // Use safe access for permissive data shapes coming from MAJOR_SECTS
    const req = sect.requirements || {};
  if (req.minRealm && (getPlayerRealmId(player) ?? 0) < req.minRealm) return false;
    if (req.minCombatPower && (player.cultivationPower ?? 0) < req.minCombatPower) return false;
    if (req.karma !== undefined && (player.karma ?? 0) < req.karma) return false;
    return true;
  });

  const handleJoinSect = (sectId: string) => {
    const success = joinSect(sectId);
    if (success) {
      alert(`Successfully joined the sect!`);
    } else {
      alert(`Failed to join the sect. Check requirements.`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}>Join a Sect</h2>
      
      {player.sect && (
        <Card title="Current Sect">
          <p>You are currently a member of: <strong>{MAJOR_SECTS.find(s => s.id === player.sect)?.name || player.sect}</strong></p>
        </Card>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {availableSects.map(sect => (
          <Card key={sect.id} title={sect.name}>
            <div style={{ marginBottom: '10px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{sect.description}</p>
              <p><strong>Type:</strong> {sect.type}</p>
              <p><strong>Realm:</strong> {sect.realm}</p>
              <p><strong>Power:</strong> {sect.power}</p>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Requirements:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {sect.requirements?.minRealm && <li>Min Realm: {sect.requirements.minRealm}</li>}
                {sect.requirements?.minCombatPower && <li>Min Combat Power: {sect.requirements.minCombatPower}</li>}
                {sect.requirements?.karma !== undefined && <li>Karma: {sect.requirements.karma}</li>}
              </ul>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Benefits:</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {Array.isArray(sect.benefits?.techniques) && sect.benefits!.techniques.length > 0 && (
                  <li>Techniques: {sect.benefits!.techniques.join(', ')}</li>
                )}
                {sect.benefits?.resources && Object.keys(sect.benefits!.resources).length > 0 && (
                  <li>Resources: {Object.entries(sect.benefits!.resources).map(([k, v]) => `${k}: ${v}`).join(', ')}</li>
                )}
                {sect.benefits?.protection && <li>Protection: {sect.benefits!.protection}</li>}
              </ul>
            </div>

              <div style={{ display: 'flex', gap: 8 }}>
              {sect.showDescriptionOnVisit && (
                <Button onClick={() => { setVisitedSect(sect); setModalOpen(true); }} size="large" variant="secondary">
                  Visit
                </Button>
              )}

              <Button onClick={() => handleJoinSect(sect.id)} size="large">
                Join {sect.name}
              </Button>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input placeholder="seed (optional)" value={seedText} onChange={e => setSeedText(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' }} />
                <Button onClick={() => {
                  // apply seed into runtime RNG for deterministic results
                  try {
                    if (seedText && seedText.length > 0) {
                      const seeded = seededFromString(seedText);
                      setRuntimeRng(seeded);
                    } else {
                      clearRuntimeRng();
                    }
                  } catch (e) {
                    // ignore
                  }
                }} size="small" variant="secondary"><SmallChip style={{ padding: '2px 6px' }}>Apply Seed</SmallChip></Button>

                <div style={{ marginLeft: 8 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Target Territory</label>
                  <MiniMap territories={(store.world as any)?.territories} positions={(store.world as any)?.territoryPositions} width={260} height={160} selected={selectedTerritory} onSelect={(id) => setSelectedTerritory(id)} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 6 }}>{selectedTerritory ? `Selected: ${selectedTerritory}` : '(Auto select)'}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 8 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Drop Table</label>
                  <select value={dropTableName} onChange={e => setDropTableName(e.target.value)} style={{ padding: '6px 8px', borderRadius: 4 }}>
                    {TOURNAMENT_DROP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                  <input type="checkbox" checked={autoCommit} onChange={e => setAutoCommit(e.target.checked)} id={`autoCommit-${sect.id}`} />
                  <label htmlFor={`autoCommit-${sect.id}`} style={{ fontSize: '0.9rem' }}>Auto-commit capture</label>
                </div>

                <Button onClick={() => {
                try {
                  const store = useGameStore.getState();
                  // invoke sect tournament via shared system on the store
                  const res = (store as any).sectFactionSystem?.runTournamentForSect?.(sect.id, 32, store.player.level || 10);
                  if (res && res.result) {
                    setBracketResult(res.result);
                    setBracketOpen(true);

                    // Consequence: if player's sect hosted and one of its disciples won, reward player
                    try {
                      const winnerId = res.result.winnerIndex;
                      // heuristic: winnerId string will start with `${sect.id}_r_` for generated rivals
                      const playerIsMember = store.player.sect === sect.id;
                        if (playerIsMember && String(winnerId).startsWith(sect.id)) {
                          // reward via drop table (seeded RNG from store if available)
                          try {
                            const rng = (store as any).runtimeRng || undefined;
                            const loot = rollFromTableName(dropTableName || DEFAULT_TOURNAMENT_DROP, rng);
                            if (loot) store.addToInventory?.(loot);
                          } catch (e) {
                            // fallback deterministic grant
                            store.addToInventory?.({ id: 'spirit_stone_common', qty: 10 });
                          }
                          store.setPlayerProperty?.('yuan', (store.player.yuan || 0) + 200);
                          try { (store as any).addEventLog?.(`Your sect's disciple triumphed in the tournament. You receive rewards.`); } catch (e) { void e; }

                          // Territory consequences: grant influence, mark contested, and transfer if threshold reached
                          try {
                            const territories = (store.world && (store.world as any).territories) ? (store.world as any).territories : {};
                            const territoryIds = Object.keys(territories);
                            if (territoryIds.length > 0) {
                              // choose a target: use selectedTerritory if provided, else prefer neutral
                              const targetId = selectedTerritory || territoryIds.find((t: string) => !territories[t].ownerFactionId) || territoryIds[0];
                              if (targetId) {
                                // apply influence via domain utils (handles contestedSince)
                                const inc = Math.max(5, Math.floor((res.result.bracketSize || 16) / 8));
                                DomainUtils.applyTerritoryInfluence?.((store as any) as any, targetId, sect.id, inc);
                                // decay influence slightly to simulate time passing
                                DomainUtils.decayInfluence?.((store as any) as any, targetId, 0.98);
                                // check capture preview (non-committal); auto-commit if requested
                                try {
                                  const capturePreview = DomainUtils.attemptTerritoryCapture?.((store as any) as any, targetId, 0.6, false);
                                  if (capturePreview && capturePreview.newOwner) {
                                    if (autoCommit) {
                                      // commit directly
                                      const captureRes = DomainUtils.attemptTerritoryCapture?.((store as any) as any, targetId, 0.6, true);
                                      if (captureRes && captureRes.newOwner) {
                                        if (typeof (store as any).setWorld === 'function') {
                                          (store as any).setWorld({ ...(store.world || {}), territories: (store.world as any).territories });
                                        } else {
                                          useGameStore.setState((s: any) => ({ world: { ...(s.world || {}), territories: (s.world as any).territories } }));
                                        }
                                      }
                                    } else {
                                      // prompt user with preview
                                      setPendingCapture({ id: targetId, territory: (store.world as any).territories[targetId], preview: capturePreview });
                                    }
                                  } else {
                                    // no capture yet; just write back influence changes
                                    if (typeof (store as any).setWorld === 'function') {
                                      (store as any).setWorld({ ...(store.world || {}), territories });
                                    } else {
                                      useGameStore.setState((s: any) => ({ world: { ...(s.world || {}), territories } }));
                                    }
                                  }
                                } catch (e) {
                                  // fallback: write world changes
                                  if (typeof (store as any).setWorld === 'function') {
                                    (store as any).setWorld({ ...(store.world || {}), territories });
                                  } else {
                                    useGameStore.setState((s: any) => ({ world: { ...(s.world || {}), territories } }));
                                  }
                                }
                              }
                            }
                          } catch (e) {
                            // ignore territory update failures
                          }
                        }
                    } catch (e) { /* ignore non-fatal reward logic errors */ }

                  } else {
                    alert('Tournament could not be run.');
                  }
                } catch (e) {
                  // non-fatal UI error
                }
              }} size="large" variant="secondary"><SmallChip style={{ padding: '6px 10px' }}>Hold Great Sect Tournament</SmallChip></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

  <DomainCaptureModal open={!!pendingCapture} territoryId={pendingCapture?.id} territory={pendingCapture?.territory} capturePreview={pendingCapture?.preview} onCancel={() => setPendingCapture(null)} onConfirm={(opts) => {
          try {
            const store = useGameStore.getState();
            if (pendingCapture) {
              const funding = opts?.funding || 'normal';
              const _forceConfirm = opts?.forceConfirm || false;
              void _forceConfirm;
              const forceParams = funding === 'force_capture' ? { attritionMultiplier: 1.5, influencePenalty: 10, reputationPenalty: 5 } : null;
              // commit capture with funding/force params via domain utils shim
              const res = DomainUtils.attemptTerritoryCapture?.((store as any) as any, pendingCapture.id, 0.6, true, funding, forceParams);
              if (res && res.newOwner) {
                try { (store as any).addEventLog?.(`${res.newOwner} captured ${pendingCapture.id}`); } catch (e) { void e; }
              }
              // write back world
              if (typeof (store as any).setWorld === 'function') {
                (store as any).setWorld({ ...(store.world || {}), territories: (store.world as any).territories });
              } else {
                useGameStore.setState((s: any) => ({ world: { ...(s.world || {}), territories: (s.world as any).territories } }));
              }
            }
          } catch (e) { /* ignore */ }
          setPendingCapture(null);
        }} />

      {availableSects.length === 0 && (
        <Card title="No Available Sects">
          <p>You don't meet the requirements for any sects yet. Continue cultivating to unlock more options.</p>
        </Card>
      )}
      <SectDescriptionModal open={modalOpen} sect={visitedSect} onClose={() => { setModalOpen(false); setVisitedSect(null); }} />
      {bracketOpen && bracketResult && (
        <div style={{ position: 'fixed', left: '50%', top: '10%', transform: 'translateX(-50%)', zIndex: 9999 }}>
          <BracketView result={bracketResult} onClose={() => { setBracketOpen(false); setBracketResult(null); }} />
        </div>
      )}
    </div>
  );
};

export default SectJoiningPanel;
