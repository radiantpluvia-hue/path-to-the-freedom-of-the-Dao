/* eslint-disable no-restricted-imports -- component needs to reference CombatSystem for runtime behavior */
import React, { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button } from './core/Button';
import { Progress } from './core/Progress';
// Use centralized combat power helper when available to keep metrics consistent
 
let computeCombatPower: ((e: any, opts?: any) => number) | null = null;
try {
  // require used to avoid static circular deps in some build setups
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  computeCombatPower = require('../systems/combatConfig').computeCombatPower;
} catch (e) {
  computeCombatPower = null;
}
import { CombatState } from '../systems/CombatSystem';

const CombatUI: React.FC = () => {
  const { combatSystem, setUIProperty, addEventLog, gainSkillExp, adjustRivalRelationship, markRivalDefeated, getFactionStanding, getSectReputation, adjustFactionStanding, adjustSectReputation, getVisibleStats } = useGameStore();
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [combatOutcomeProcessed, setCombatOutcomeProcessed] = useState(false);
  const [reputationDelta, setReputationDelta] = useState<{ faction?: number | null; sect?: number | null }>({});

  const handleCombatOutcome = useCallback((outcome: string) => {
    if (!combatSystem) return;

    const enemy = combatSystem.getState().participants.find((p: any) => p.id !== 'player');
    if (!enemy) return;

    const applyReputationOutcome = (outcomeType: 'victory' | 'defeat' | 'flee', enemyParam: any) => {
      const ctx = (combatSystem as any).getContext ? (combatSystem as any).getContext() : null;
      if (!ctx) { setReputationDelta({}); return; }

      const computePower = (p: any) => {
        if (!p) return 1;
        if (computeCombatPower) return computeCombatPower(p);
        const atk = p.stats?.atk ?? 0;
        const def = p.stats?.def ?? 0;
        const speed = p.stats?.speed ?? 0;
        const hp = p.maxHp ?? p.hp ?? 0;
        const qi = p.maxQi ?? p.qi ?? 0;
        return atk * 1.5 + def * 1.2 + speed + hp * 0.05 + qi * 0.05;
      };

      const playerPower = computePower(combatSystem.getState().participants.find((p: any) => p.id === 'player'));
      const enemyPower = computePower(enemyParam);
      const ratio = playerPower > 0 ? enemyPower / playerPower : 1;
      const scale = Math.max(0.5, Math.min(1.5, ratio));

      const baseByOutcome = (type: typeof ctx.type) => {
        if (type === 'faction_battle') return outcomeType === 'victory' ? 15 : outcomeType === 'defeat' ? -10 : -5;
        if (type === 'sect_war') return outcomeType === 'victory' ? 12 : outcomeType === 'defeat' ? -8 : -4;
        if (type === 'rival') return outcomeType === 'victory' ? 15 : outcomeType === 'defeat' ? -10 : -5;
        return 0;
      };

      const sideFaction: string | null = ctx.faction || null;
      const sideSect: string | null = ctx.sect || null;
      const enemyFaction: string | null = (enemyParam && (enemyParam as any).faction) || (ctx as any).enemyFaction || null;
      const enemySect: string | null = (enemyParam && (enemyParam as any).sect) || (ctx as any).enemySect || null;

      let factionDelta: number | null = null;
      let sectDelta: number | null = null;

      const base = baseByOutcome(ctx.type);
      const scaledValue = Math.round(base * scale);

      if (ctx.type === 'faction_battle') {
        if (sideFaction) {
          adjustFactionStanding(sideFaction, scaledValue);
          factionDelta = (factionDelta ?? 0) + scaledValue;
        }
        if (enemyFaction) adjustFactionStanding(enemyFaction, -scaledValue);
      } else if (ctx.type === 'sect_war') {
        if (sideSect) {
          adjustSectReputation(sideSect, scaledValue);
          sectDelta = (sectDelta ?? 0) + scaledValue;
        }
        if (enemySect) adjustSectReputation(enemySect, -scaledValue);
      } else if (ctx.type === 'rival') {
        if (outcomeType === 'victory') {
          if (enemyFaction) adjustFactionStanding(enemyFaction, -Math.round(15 * scale));
          if (enemySect) adjustSectReputation(enemySect, -Math.round(15 * scale));
        } else if (outcomeType === 'defeat') {
          if (enemyFaction) adjustFactionStanding(enemyFaction, Math.round(10 * scale));
          if (enemySect) adjustSectReputation(enemySect, Math.round(8 * scale));
        } else if (outcomeType === 'flee') {
          if (enemyFaction) adjustFactionStanding(enemyFaction, Math.round(5 * scale));
          if (enemySect) adjustSectReputation(enemySect, Math.round(4 * scale));
        }
      }

      setReputationDelta({ faction: factionDelta, sect: sectDelta });
    };

    const handleVictory = (enemyParam: any) => {
      gainSkillExp('combatSkills', 25);
      gainSkillExp('weaponMastery', 15);

      const ctx = (combatSystem as any).getContext ? (combatSystem as any).getContext() : null;
      if (ctx?.type === 'rival' && enemyParam.id.startsWith('rival_')) {
        const rivalId = enemyParam.id;
        adjustRivalRelationship(rivalId, 15);
        markRivalDefeated(rivalId);
        addEventLog(`Defeated rival ${enemyParam.name}! Gained combat experience and improved reputation.`);
        try { (useGameStore.getState().rivalSystem as any)?.recordCombatOutcome?.(rivalId, 'victory', combatSystem.getState().round || 0); } catch (e) { /* ignore */ }
      } else {
        addEventLog(`Victory! Defeated ${enemyParam.name} and gained combat experience.`);
      }

      applyReputationOutcome('victory', enemyParam);

      if (Math.random() < 0.3) {
        gainSkillExp('resourcefulness', 10);
        addEventLog('Found some resources while searching the defeated opponent.');
      }
    };

    const handleDefeat = () => {
      addEventLog('You were defeated in combat. Your cultivation has been set back.');
      gainSkillExp('mentalFortitude', 10);
      const enemyParam = combatSystem.getState().participants.find((p: any) => p.id !== 'player');
      applyReputationOutcome('defeat', enemyParam);
      try {
        if (enemyParam?.id?.startsWith('rival_')) {
          (useGameStore.getState().rivalSystem as any)?.recordCombatOutcome?.(enemyParam.id, 'defeat', combatSystem.getState().round || 0);
        }
      } catch (e) { /* ignore */ }
    };

    const handleFleeOutcome = () => {
      addEventLog('You successfully fled from combat, but lost some dignity.');
      gainSkillExp('socialSkills', -5);
      const enemyParam = combatSystem.getState().participants.find((p: any) => p.id !== 'player');
      applyReputationOutcome('flee', enemyParam);
    };

    switch (outcome) {
      case 'victory':
        handleVictory(enemy);
        break;
      case 'defeat':
        handleDefeat();
        break;
      case 'fled':
        handleFleeOutcome();
        break;
    }
  }, [combatSystem, gainSkillExp, adjustRivalRelationship, markRivalDefeated, addEventLog, adjustFactionStanding, adjustSectReputation, setReputationDelta]);

  useEffect(() => {
    if (!combatSystem) {
      setUIProperty('currentScreen', 'game'); // Return to game if no combat
      return;
    }

    // Reset state for new combat
    setCombatState(combatSystem.getState());
    setCombatOutcomeProcessed(false);
    setReputationDelta({});

    // Listen for combat state changes
    // Interval reads combatSystem and updates local state.
    const interval = setInterval(() => {
      if (combatSystem) {
        const currentState = combatSystem.getState();
        setCombatState(currentState);

        // Handle combat outcome when combat ends
        if (currentState.status !== 'ongoing' && !combatOutcomeProcessed) {
          handleCombatOutcome(currentState.status);
          setCombatOutcomeProcessed(true);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [combatSystem, combatOutcomeProcessed, handleCombatOutcome, setUIProperty]);



  if (!combatSystem || !combatState) return null;

  const player = combatState.participants.find(p => p.id === 'player');
  const enemy = combatState.participants.find(p => p.id !== 'player');

  if (!player || !enemy) return null;

  // Derive combat context info (faction/sect/rival) for header badges
  const context = (combatSystem as any).getContext ? (combatSystem as any).getContext() : null;
  const contextType = context?.type || 'normal';
  const contextFaction = context?.faction || null;
  const contextSect = context?.sect || null;
  const contextRivalId = context?.rivalId || null;

  const factionStanding = contextFaction ? getFactionStanding(contextFaction) : null;
  const sectReputation = contextSect ? getSectReputation(contextSect) : null;

  // Enemy intent display helpers
  const enemyIntent = combatState.enemyIntent;
  const enemyIntentTechniqueName = enemyIntent?.techniqueId
    ? (enemy.techniques.find(t => t.id === enemyIntent.techniqueId)?.name || null)
    : null;

  const formatStanding = (v: number | null) => v === null ? '-' : `${v > 0 ? '+' : ''}${v}`;
  const standingColor = (v: number | null) => v === null ? '#aaa' : v >= 50 ? '#16a34a' : v >= 0 ? '#ca8a04' : v >= -50 ? '#ea580c' : '#dc2626';

  const getRelationshipDescription = (relationship: number): string => {
    if (relationship >= 80) return 'Devoted Ally';
    if (relationship >= 60) return 'Close Friend';
    if (relationship >= 40) return 'Good Friend';
    if (relationship >= 20) return 'Friendly';
    if (relationship >= 0) return 'Neutral';
    if (relationship >= -20) return 'Unfriendly';
    if (relationship >= -40) return 'Hostile';
    if (relationship >= -60) return 'Enemy';
    if (relationship >= -80) return 'Bitter Enemy';
    return 'Mortal Enemy';
  };

  const HeaderContextBadges = () => {
    const rival = contextType === 'rival' && contextRivalId ? useGameStore.getState().getRivalById(contextRivalId) : null;
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
        {rival && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444', padding: '4px 8px', borderRadius: 6, border: '1px solid #ef4444', position: 'relative' }}>
              Rival: {rival.name}
            </span>
            <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '8px', textAlign: 'center' }}>
              <span>Relationship: {getRelationshipDescription(useGameStore.getState().getRivalRelationship(rival.id))}</span>
              <span>•</span>
              <span>{rival.personality.charAt(0).toUpperCase() + rival.personality.slice(1)}</span>
            </div>
          </div>
        )}
        {contextFaction && (
          <span style={{ background: 'rgba(59,130,246,0.15)', color: standingColor(factionStanding), padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.6)', position: 'relative' }}>
            Faction: {contextFaction.replace('_',' ').toUpperCase()} ({formatStanding(factionStanding)})
            {typeof reputationDelta.faction === 'number' && reputationDelta.faction !== 0 && (
              <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 12, fontWeight: 700, color: reputationDelta.faction > 0 ? '#16a34a' : '#dc2626' }}>
                {reputationDelta.faction > 0 ? '+' : ''}{reputationDelta.faction}
              </span>
            )}
          </span>
        )}
        {contextSect && (
          <span style={{ background: 'rgba(34,197,94,0.15)', color: standingColor(sectReputation), padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.6)', position: 'relative' }}>
            Sect: {contextSect.replace('_',' ').toUpperCase()} ({formatStanding(sectReputation)})
            {typeof reputationDelta.sect === 'number' && reputationDelta.sect !== 0 && (
              <span style={{ position: 'absolute', top: -10, right: -10, fontSize: 12, fontWeight: 700, color: reputationDelta.sect > 0 ? '#16a34a' : '#dc2626' }}>
                {reputationDelta.sect > 0 ? '+' : ''}{reputationDelta.sect}
              </span>
            )}
          </span>
        )}
      </div>
    );
  };

  const handleAction = (actionId: string) => {
    combatSystem.useTechnique('player', actionId, enemy.id);
    combatSystem.endTurn();
    setCombatState(combatSystem.getState());
  };

  const handleFlee = () => {
    combatSystem.flee();
    setCombatState(combatSystem.getState());
  };

  const availableTechniques = combatSystem.getAvailableTechniques('player');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '6px' }}>
        ⚔️ Combat - Round {combatState.round}
      </h2>
      <HeaderContextBadges />

      {(contextFaction || contextSect) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          background: 'var(--dark)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 12,
          marginTop: 10,
          marginBottom: 12
        }}>
          {contextFaction && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#93c5fd', fontWeight: 600 }}>Faction Standing</span>
                <span style={{ color: standingColor(factionStanding) }}>{formatStanding(factionStanding)}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(59,130,246,0.2)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((factionStanding ?? 0) + 100) / 2}%`, background: '#3b82f6' }} />
              </div>
              <div style={{ marginTop: 4, color: '#9ca3af', fontSize: 12 }}>{contextFaction.replace('_',' ').toUpperCase()}</div>
            </div>
          )}
          {contextSect && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#86efac', fontWeight: 600 }}>Sect Reputation</span>
                <span style={{ color: standingColor(sectReputation) }}>{formatStanding(sectReputation)}</span>
              </div>
              <div style={{ height: 8, background: 'rgba(34,197,94,0.2)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((sectReputation ?? 0) + 100) / 2}%`, background: '#22c55e' }} />
              </div>
              <div style={{ marginTop: 4, color: '#9ca3af', fontSize: 12 }}>{contextSect.replace('_',' ').toUpperCase()}</div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '12px', marginBottom: '20px' }}>
        {/* Player Stats */}
        <div style={{ 
          backgroundColor: 'var(--dark)', 
          padding: '15px', 
          borderRadius: '8px',
          border: '2px solid var(--primary)'
        }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>👤 {player.name}</h3>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>HP:</span>
              <span>{player.hp}/{player.maxHp}</span>
            </div>
            <Progress value={(player.hp / player.maxHp) * 100} max={100} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Qi:</span>
              <span>
                {player.qi}/{player.maxQi}
                {' '}
                <small style={{ color: '#9ca3af', marginLeft: 8 }}>
                  ({getVisibleStats().qi})
                </small>
              </span>
            </div>
            <Progress value={(player.qi / player.maxQi) * 100} max={100} />
          </div>
          <div style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>AP:</span>
              <span>{player.ap}/{player.maxAp}</span>
            </div>
          </div>
          {/* Player Buffs/Debuffs */}
          {(player.buffs?.length || player.debuffs?.length) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {player.buffs?.map((b, idx) => (
                <span key={`pb-${idx}`} title={b.description}
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.5)', fontSize: 12 }}>
                  🟢 {b.name} ({b.duration})
                </span>
              ))}
              {player.debuffs?.map((d, idx) => (
                <span key={`pd-${idx}`} title={d.description}
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.5)', fontSize: 12 }}>
                  🔴 {d.name} ({d.duration})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Enemy Stats */}
        <div style={{ 
          backgroundColor: 'var(--dark)', 
          padding: '15px', 
          borderRadius: '8px',
          border: '2px solid var(--danger)'
        }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '10px' }}>👹 {enemy.name}</h3>
          {enemyIntent && (
            <div style={{ marginBottom: '8px' }}>
              <span style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.5)' }}>
                Intent: {enemyIntent.intent.toUpperCase()} {enemyIntentTechniqueName ? `(${enemyIntentTechniqueName})` : ''}
              </span>
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>HP:</span>
              <span>{enemy.hp}/{enemy.maxHp}</span>
            </div>
            <Progress value={(enemy.hp / enemy.maxHp) * 100} max={100} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Qi:</span>
              <span>{enemy.qi}/{enemy.maxQi}</span>
            </div>
            <Progress value={(enemy.qi / enemy.maxQi) * 100} max={100} />
          </div>
          <div style={{ marginBottom: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>AP:</span>
              <span>{enemy.ap}/{enemy.maxAp}</span>
            </div>
          </div>
        </div>
        {/* Enemy Buffs/Debuffs */}
        {(enemy.buffs?.length || enemy.debuffs?.length) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {enemy.buffs?.map((b, idx) => (
              <span key={`eb-${idx}`} title={b.description}
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.5)', fontSize: 12 }}>
                🟢 {b.name} ({b.duration})
              </span>
            ))}
            {enemy.debuffs?.map((d, idx) => (
              <span key={`ed-${idx}`} title={d.description}
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', padding: '2px 6px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.5)', fontSize: 12 }}>
                🔴 {d.name} ({d.duration})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {combatState.isPlayerTurn && combatState.status === 'ongoing' && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '10px' }}>Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableTechniques.map(technique => (
              <div key={technique.id} style={{ minWidth: '120px' }}>
                <Button 
                  onClick={() => handleAction(technique.id)}
                  disabled={technique.apCost > player.ap || technique.qiCost > player.qi}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{technique.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      AP: {technique.apCost} | Qi: {technique.qiCost}
                    </div>
                  </div>
                </Button>
              </div>
            ))}
            <div>
              <Button onClick={handleFlee} variant="secondary">
                🏃 Flee
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Combat Log */}
      <div style={{ 
        backgroundColor: 'var(--dark)', 
        padding: '15px', 
        borderRadius: '8px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <h3 style={{ color: 'var(--muted)', marginBottom: '10px' }}>Combat Log</h3>
        <div style={{ fontSize: '0.9rem' }}>
          {combatState.combatLog.slice(-10).map((log, index) => (
            <div key={index} style={{ marginBottom: '5px', padding: '5px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Combat Status */}
      {combatState.status !== 'ongoing' && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: combatState.status === 'victory' ? 'var(--success)' : 'var(--danger)',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>
            {combatState.status === 'victory' ? '🎉 Victory!' : 
             combatState.status === 'defeat' ? '💀 Defeat!' : 
             '🏃 Fled!'}
          </h3>
          <p style={{ marginBottom: '15px' }}>
            {combatState.status === 'victory' ? 'You emerged victorious from the battle!' :
             combatState.status === 'defeat' ? 'You were defeated but gained valuable experience.' :
             'You successfully escaped the battle.'}
          </p>
          <Button onClick={() => {
            setUIProperty('currentScreen', 'game');
            setCombatOutcomeProcessed(false);
          }}>
            Return to Game
          </Button>
        </div>
      )}
    </div>
  );
};

export default CombatUI;