/* eslint-disable no-restricted-imports -- imports core systems intentionally for minigame UI */
import React, { useEffect, useState } from 'react';
import { getSkillById, getUITierLabel, getUITierRealms } from './skills';
import { getPassiveById, getFormationById, getFormations as _getFormations } from '../../data/registry';
import { ITEM_CATALOG, getItemById } from './items';
import { setPowerScalePercent, getPowerScale } from '../../config/balance';
import { useGameStore } from '../../store/useGameStore';
import Tooltip from '../ui/Tooltip';
import { Action, Combatant, EquipmentSlots, defaultCombatant, applyCombatBuffs, resolveRound, calculateDamage } from '../../systems/combatConfig';
import { getRng } from '../../utils/rng';

/* This file exports both a React component and helper functions intentionally. */

interface CombatSimulationProps {
  difficulty?: 'easy' | 'medium' | 'hard';
  player?: Partial<Combatant>;
  rival?: Partial<Combatant>;
  onComplete?: (result: { winner: 'player' | 'rival' | 'draw' }) => void;
}

const CombatSimulation: React.FC<CombatSimulationProps> = ({ difficulty = 'medium', player, rival, onComplete }) => {
  const [p, setP] = useState<Combatant>(() => ({ ...defaultCombatant('player', 'Player', difficulty), ...player }));
  const [r, setR] = useState<Combatant>(() => ({ ...defaultCombatant('rival', 'Rival', difficulty), ...rival }));
  const [inventory, setInventory] = useState<string[]>(() => ITEM_CATALOG.slice(0, 8).map(i => i.id));
  const [_logs, setLogs] = useState<string[]>([]);
  const store = useGameStore();
  const initialFromStore = (store.player && (store.player as any).settings && (store.player as any).settings.powerScalePercent) as number | undefined;
  const [powerPercent, setPowerPercent] = useState<number>(typeof initialFromStore === 'number' ? Math.round(initialFromStore) : Math.round(getPowerScale() * 100));
  const [round, setRound] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!finished && (p.hp <= 0 || r.hp <= 0)) {
      setFinished(true);
      const winner = p.hp > 0 && r.hp <= 0 ? 'player' : r.hp > 0 && p.hp <= 0 ? 'rival' : 'draw';
      onComplete && onComplete({ winner });
    }
  }, [p.hp, r.hp, finished, onComplete]);

  const chooseRivalAction = (playerState: Combatant, rivalState: Combatant): Action => {
    if (rivalState.hp <= Math.floor(rivalState.maxHp * 0.25)) return 'defend';
    const equipped = rivalState.equippedSkills || [];
    for (const sid of equipped) {
      const s = getSkillById(sid);
      const cd = (rivalState.skillCooldowns && rivalState.skillCooldowns[sid]) || 0;
      if (s && cd === 0 && (rivalState.ap || 0) >= (s.cost.ap || 0) && (rivalState.qi || 0) >= (s.cost.qi || 0)) {
        return 'special';
      }
    }
    try {
      const rfn = (store && (store as any).rng) ? (store as any).rng : getRng(store);
      const _sam = typeof rfn === 'function' ? rfn() : Math.random();
      if ((rivalState.specialCooldown || 0) === 0 && _sam < 0.15) return 'special';
    } catch (e) { if ((rivalState.specialCooldown || 0) === 0 && Math.random() < 0.15) return 'special'; }
    return 'attack';
  };

  const applyBuffs = applyCombatBuffs;

  const takeAction = (playerAction: Action) => {
    if (finished) return;
    const rivalAction = chooseRivalAction(p, r);
    const pBuffed = applyBuffs(p);
    const rBuffed = applyBuffs(r);
    const result: ReturnType<typeof resolveRound> = resolveRound(pBuffed, rBuffed, playerAction, rivalAction);
    const decCooldowns = (cds?: Record<string, number>) => {
      const next: Record<string, number> = {};
      if (!cds) return next;
      Object.keys(cds).forEach(k => { next[k] = Math.max(0, (cds[k] || 0) - 1); });
      return next;
    };

    setP(prev => ({ ...prev, hp: result.player.hp, ap: (prev.ap || 0), qi: (prev.qi || 0), specialCooldown: result.player.specialCooldown, skillCooldowns: decCooldowns(prev.skillCooldowns) }));
    setR(prev => ({ ...prev, hp: result.rival.hp, specialCooldown: result.rival.specialCooldown, skillCooldowns: decCooldowns(prev.skillCooldowns) }));
    setLogs(prev => [...result.logs, `--- End of round ${round} ---`, ...prev].slice(0, 100));
    setRound(prev => prev + 1);
  };

  const performSkill = (skillId: string) => {
    if (finished) return;
    const skill = getSkillById(skillId);
    if (!skill) return setLogs(prev => [`Unknown skill ${skillId}`, ...prev]);
    const cd = (p.skillCooldowns && p.skillCooldowns[skillId]) || 0;
    if (cd > 0) return setLogs(prev => [`Skill ${skill.name} is on cooldown (${cd})`, ...prev]);
    if ((p.ap || 0) < (skill.cost.ap || 0) || (p.qi || 0) < (skill.cost.qi || 0)) return setLogs(prev => [`Not enough resources for ${skill.name}`, ...prev]);

    const rivalAction = chooseRivalAction(p, r);
    const pBuffed = applyBuffs(p);
    const rBuffed = applyBuffs(r);
    const performHit = (attacker: Combatant, defender: Combatant, label: string) => {
      const dmg = calculateDamage(attacker, defender, 'special');
      const newDef = { ...defender, hp: Math.max(0, defender.hp - dmg) } as Combatant;
      return { dmg, defender: newDef, log: `${attacker.name} ${label} ${defender.name} for ${dmg} damage.` };
    };

    const logsOut: string[] = [];
    const actor = { ...pBuffed, attack: Math.floor((pBuffed.attack || 0) + skill.power) } as Combatant;
    let target = { ...rBuffed } as Combatant;

    const firstIsPlayer = actor.speed >= target.speed;
    if (!firstIsPlayer) {
      if (rivalAction !== 'defend') {
        const rivalDmg = calculateDamage(target, actor, rivalAction as Action);
        actor.hp = Math.max(0, actor.hp - rivalDmg);
        logsOut.push(`${target.name} ${rivalAction} ${actor.name} for ${rivalDmg} damage.`);
      } else {
        logsOut.push(`${target.name} defends before ${actor.name}'s technique.`);
      }
    }

    const mechanics = skill.mechanics || [];
    const multi = mechanics.find(m => (m as any).type === 'multiHit');
    const chain = mechanics.find(m => (m as any).type === 'chain');
    const conditional = mechanics.find(m => (m as any).type === 'conditional');

    if (multi && ((multi as any).hits || 0) > 1) {
      const hits = (multi as any).hits || 2;
      for (let hi = 0; hi < hits; hi++) {
        const decay = 1 - Math.min(0.6, hi * 0.15);
        const tempActor = { ...actor, attack: Math.max(1, Math.floor((actor.attack || 1) * decay)) } as Combatant;
        const res = performHit(tempActor, target, `(multi-hit ${hi + 1}/${hits})`);
        target = res.defender;
        logsOut.push(res.log);
        if (target.hp <= 0) break;
      }
    } else {
      const res = performHit(actor, target, 'strikes');
      target = res.defender;
      logsOut.push(res.log);
    }

    if (conditional && (conditional as any).condition) {
      const m = (conditional as any).condition.match(/target_below_(\d+)_?hp?/);
      if (m) {
        const pct = Number(m[1]);
        if (target.hp <= Math.floor((target.maxHp || 1) * (pct / 100))) {
          const extra = Math.max(1, Math.floor(skill.power * 0.5));
          target.hp = Math.max(0, target.hp - extra);
          logsOut.push(`${actor.name} triggers conditional effect (${(conditional as any).condition}) dealing ${extra} bonus damage.`);
        }
      }
    }

    if (chain && ((chain as any).chainLength || 0) > 0 && target.hp > 0) {
      const chainLen = (chain as any).chainLength || 1;
      for (let ci = 0; ci < chainLen; ci++) {
        const mult = 0.6;
        const tempActor = { ...actor, attack: Math.max(1, Math.floor((actor.attack || 1) * mult)) } as Combatant;
        const res = performHit(tempActor, target, `(chain ${ci + 1}/${chainLen})`);
        target = res.defender;
        logsOut.push(res.log);
        if (target.hp <= 0) break;
      }
    }

    if (firstIsPlayer) {
      if (target.hp > 0) {
        if (rivalAction === 'defend') {
          logsOut.push(`${target.name} defends in response.`);
        } else {
          const dmg = calculateDamage(target, actor, rivalAction as Action);
          actor.hp = Math.max(0, actor.hp - dmg);
          logsOut.push(`${target.name} ${rivalAction} ${actor.name} for ${dmg} damage.`);
        }
      }
    }

    const nextPcds: Record<string, number> = { ...(p.skillCooldowns || {}) };
    nextPcds[skillId] = (skill as any).cooldown;
    Object.keys(nextPcds).forEach(k => { nextPcds[k] = Math.max(0, (nextPcds[k] || 0) - 1); });
    const nextRcds: Record<string, number> = { ...(r.skillCooldowns || {}) };
    Object.keys(nextRcds).forEach(k => { nextRcds[k] = Math.max(0, (nextRcds[k] || 0) - 1); });

    setP(prev => ({ ...prev, hp: actor.hp, ap: Math.max(0, (prev.ap || 0) - ((skill as any).cost?.ap || 0)), qi: Math.max(0, (prev.qi || 0) - ((skill as any).cost?.qi || 0)), skillCooldowns: nextPcds }));
    setR(prev => ({ ...prev, hp: target.hp, skillCooldowns: nextRcds }));
    setLogs(prev => [...logsOut, `Used skill: ${(skill as any).name}`, `--- End of round ${round} ---`, ...prev].slice(0, 200));
    setRound(prev => prev + 1);
  };

  const _conjureFormation = (formationId: string) => {
    if (finished) return;
    const f = getFormationById(formationId as string);
    if (!f) return;
    setP(prev => ({ ...prev, activeFormationId: formationId }));
    setLogs(prev => [`Conjured formation: ${f.name}`, ...prev]);
  };

  const equipItem = (itemId: string) => {
    const it = getItemById(itemId);
    if (!it) return setLogs(prev => [`Cannot equip unknown item ${itemId}`, ...prev]);
    setP(prev => ({ ...prev, equipment: { ...prev.equipment, [it.slot]: itemId } }));
    setInventory(prev => prev.filter(id => id !== itemId));
    setLogs(prev => [`Equipped ${it.name}`, ...prev]);
  };

  const unequipItem = (slot: keyof EquipmentSlots) => {
    setP(prev => {
      const itemId = prev.equipment ? (prev.equipment as any)[slot] : undefined;
      if (!itemId) return prev;
      setInventory(inv => [itemId, ...inv]);
      const nextEquip = { ...(prev.equipment || {}) } as EquipmentSlots;
      delete (nextEquip as any)[slot];
      setLogs(prevLogs => [`Unequipped ${itemId}`, ...prevLogs]);
      return { ...prev, equipment: nextEquip } as Combatant;
    });
  };
  const _attemptEscape = () => {
    if (finished) return;
    const chance = Math.min(0.75, 0.15 + (p.speed - r.speed) * 0.02);
    try {
      const rfn = (store && (store as any).rng) ? (store as any).rng : getRng(store);
      const _sam = typeof rfn === 'function' ? rfn() : Math.random();
      if (_sam < chance) {
        setFinished(true);
        onComplete && onComplete({ winner: 'player' });
        setLogs(prev => ['Escape successful!', ...prev]);
      } else {
        setLogs(prev => ['Escape attempt failed.', ...prev]);
        takeAction('defend');
      }
    } catch (e) {
      if (Math.random() < chance) { setFinished(true); onComplete && onComplete({ winner: 'player' }); setLogs(prev => ['Escape successful!', ...prev]); }
      else { setLogs(prev => ['Escape attempt failed.', ...prev]); takeAction('defend'); }
    }
  };

  const _openInventory = () => {
    setLogs(prev => ['Opened inventory (placeholder).', ...prev]);
  };

  // Use intentionally-unused helpers to keep imports/definitions from being flagged
  // This has no runtime effect; it simply references them so ESLint treats them as used.
  void _getFormations;
  void _conjureFormation;
  void _attemptEscape;
  void _openInventory;
  void _logs;

  return (
    <div className="mini-game combat-simulation">
      <h3>Martial Clash — Cultivation Simulation</h3>
      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <h4>{p.name}</h4>
          <p>HP: {p.hp} / {p.maxHp}</p>
          <p>ATK: {p.attack} DEF: {p.defense} SPD: {p.speed}</p>
        </div>
        <div>
          <h4>{r.name}</h4>
          <p>HP: {r.hp} / {r.maxHp}</p>
          <p>ATK: {r.attack} DEF: {r.defense} SPD: {r.speed}</p>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', fontSize: 12 }}>Global Power Scale: {powerPercent}%</label>
          <input
            type="range"
            min={1}
            max={100}
            value={powerPercent}
            onChange={(e) => { const v = Number(e.target.value); setPowerPercent(v); setPowerScalePercent(v); setLogs(prev => [`Power scale set to ${v}%`, ...prev]); }}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Equipped Skills (up to 8):</strong>
          <div>
            {(p.equippedSkills || []).slice(0, 8).map((id, i) => {
              const s = getSkillById(id);
              const cd = (p.skillCooldowns && p.skillCooldowns[id]) || 0;
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <button onClick={() => performSkill(id)} disabled={Boolean(finished || cd > 0 || (((p.ap || 0) === 0) && (s && (s.cost.ap || 0) > 0)))}>{s ? s.name : id}</button>{' '}
                  <small>{s ? (
                    <>
                      <span style={{marginRight:6}}>{`(${getUITierLabel(s.tier as any)}) AP ${s.cost.ap || 0} QI ${s.cost.qi || 0} CD ${s.cooldown}`}</span>
                      <Tooltip content={getUITierRealms(s.tier as any).map(r=>r.name).join(' / ')}>
                        <small style={{textDecoration: 'underline', cursor: 'help'}}>?</small>
                      </Tooltip>
                    </>
                  ) : ''}</small>
                  <div><small>Cooldown: {cd}</small></div>
                </div>
              );
            })}
          </div>
          <small>Learn up to 8 techniques; invoke a technique to expend AP/QI and trigger its cooldown.</small>

          <div style={{ marginTop: 8 }}>
            <strong>Imprints (Bloodlines / Physique / Manuals):</strong>
            <ul>
              {(p.passiveIds || []).slice(0, 10).map((pid, i) => {
                const pass = getPassiveById(pid);
                return <li key={i}>{pass ? `${pass.name} (${getUITierLabel(pass.tier as any)})` : pid}</li>;
              })}
            </ul>
            <small>Imprints are lingering cultivation echoes: bloodline legacies, physique traits, and manual inscriptions.</small>
          </div>

          <div style={{ marginTop: 8 }}>
            <strong>Active Array:</strong>
            <div>{p.activeFormationId ? (getFormationById(p.activeFormationId as string)?.name || p.activeFormationId) : 'None'}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Artifacts & Garb:</strong>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.keys((p.equipment || {}) as EquipmentSlots).map((slot) => {
                const sid = (p.equipment || {})[slot as keyof EquipmentSlots] as string | undefined;
                const it = sid ? getItemById(sid) : undefined;
                return (
                  <div key={slot} style={{ border: '1px solid #ccc', padding: 6 }}>
                    <div><strong>{slot}</strong></div>
                    <div>{it ? it.name : 'empty'}</div>
                    {it && <button onClick={() => unequipItem(slot as keyof EquipmentSlots)}>Unequip</button>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Satchel:</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {inventory.map(id => {
                const it = getItemById(id);
                return (
                  <div key={id} style={{ border: '1px solid #ddd', padding: 6 }}>
                    <div>{it ? it.name : id}</div>
                    <div><small>{it?.description}</small></div>
                    <div><button onClick={() => equipItem(id)}>Wield / Wear</button></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {finished && (
          <div style={{ marginTop: 12 }}>
            <strong>Result:</strong> {p.hp > 0 && r.hp <= 0 ? 'Player wins' : r.hp > 0 && p.hp <= 0 ? 'Rival wins' : 'Draw'}
          </div>
        )}
      </div>
    </div>
  );
};

export { calculateDamage, resolveRound, applyCombatBuffs, defaultCombatant } from '../../systems/combatConfig';
export type { Combatant, Action, EquipmentSlots } from '../../systems/combatConfig';

export default CombatSimulation;
