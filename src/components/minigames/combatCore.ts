import { getPowerScale } from '../../config/balance';
import { getItemById } from './items';
import { getPassiveById, getFormationById } from '../../data/registry';

export type Action = 'attack' | 'defend' | 'special';

export type EquipmentSlots = {
  head?: string;
  chest?: string;
  hands?: string;
  weapon?: string;
  boots?: string;
  accessory1?: string;
  accessory2?: string;
  accessory3?: string;
};

export type Combatant = {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialCooldown?: number;
  isDefending?: boolean;
  equippedSkills?: string[];
  equipment?: EquipmentSlots;
  passiveIds?: string[];
  activeFormationId?: string | null;
  skillCooldowns?: Record<string, number>;
  ap?: number;
  qi?: number;
  appliedPassiveEffects?: string[];
};

// Pure combat helpers
export function calculateDamage(attacker: Combatant, defender: Combatant, action: Action): number {
  const defendBonus = defender.isDefending ? Math.floor(defender.defense * 0.5) : 0;
  const base = Math.max(1, attacker.attack - (defender.defense + defendBonus));
  const scale = getPowerScale();
  let dmg = base;
  if (action === 'special') {
    dmg = base + Math.max(1, Math.floor(attacker.attack * 0.5));
  }
  return Math.max(1, Math.floor(dmg * scale));
}

export function resolveRound(
  player: Combatant,
  rival: Combatant,
  playerAction: Action,
  rivalAction: Action
): { player: Combatant; rival: Combatant; logs: string[] } {
  const p = { ...player } as Combatant;
  const r = { ...rival } as Combatant;
  p.isDefending = playerAction === 'defend';
  r.isDefending = rivalAction === 'defend';

  const logs: string[] = [];
  const firstIsPlayer = p.speed >= r.speed;
  const applyAction = (actor: Combatant, target: Combatant, action: Action, actorName: string, targetName: string) => {
    if (actor.hp <= 0) return;
    if (action === 'defend') {
      logs.push(`${actorName} defends, reducing incoming damage this round.`);
      return;
    }
    const dmg = calculateDamage(actor, target, action);
    target.hp = Math.max(0, target.hp - dmg);
    logs.push(`${actorName} uses ${action} on ${targetName} for ${dmg} damage.`);
  };

  if (firstIsPlayer) {
    applyAction(p, r, playerAction, p.name, r.name);
    applyAction(r, p, rivalAction, r.name, p.name);
  } else {
    applyAction(r, p, rivalAction, r.name, p.name);
    applyAction(p, r, playerAction, p.name, r.name);
  }

  if (p.specialCooldown && p.specialCooldown > 0) p.specialCooldown = Math.max(0, p.specialCooldown - 1);
  if (r.specialCooldown && r.specialCooldown > 0) r.specialCooldown = Math.max(0, r.specialCooldown - 1);

  return { player: p, rival: r, logs };
}

export function applyCombatBuffsWithMeta(c: Combatant): { combatant: Combatant; passiveContributions: Record<string, { atk?: number; def?: number; hp?: number; atkPct?: number; defPct?: number; speedPct?: number; effects?: string[] }> } {
  const base = { ...c } as Combatant;
  const contributions: Record<string, any> = {};

  (base.passiveIds || []).forEach(pid => {
    const pass = getPassiveById(pid) as any;
    if (!pass) return;
    contributions[pid] = {
      atk: pass.atk || 0,
      def: pass.def || 0,
      hp: pass.hp || 0,
      atkPct: pass.atkPct || 0,
      defPct: pass.defPct || 0,
      speedPct: pass.speedPct || 0,
      effects: pass.specialEffects || []
    };
  });

  const passiveDelta: { attack?: number; defense?: number; maxHp?: number; atkPct?: number; defPct?: number; speedPct?: number; effects?: string[] } = { effects: [] };
  Object.keys(contributions).forEach(pid => {
    const p = contributions[pid];
    passiveDelta.attack = (passiveDelta.attack || 0) + (p.atk || 0);
    passiveDelta.defense = (passiveDelta.defense || 0) + (p.def || 0);
    passiveDelta.maxHp = (passiveDelta.maxHp || 0) + (p.hp || 0);
    if (p.atkPct) passiveDelta.atkPct = (passiveDelta.atkPct || 0) + p.atkPct;
    if (p.defPct) passiveDelta.defPct = (passiveDelta.defPct || 0) + p.defPct;
    if (p.speedPct) passiveDelta.speedPct = (passiveDelta.speedPct || 0) + p.speedPct;
    if (p.effects && p.effects.length) passiveDelta.effects = (passiveDelta.effects || []).concat(p.effects || []);
  });

  const temp = { ...base } as Combatant;
  if (temp.equipment) {
    Object.values(temp.equipment).forEach(itemId => {
      if (!itemId) return;
      const it = getItemById(itemId);
      if (!it) return;
      temp.attack = temp.attack + (it.atk || 0);
      temp.defense = temp.defense + (it.def || 0);
      temp.maxHp = temp.maxHp + (it.hp || 0);
      temp.hp = Math.min(temp.hp + (it.hp || 0), temp.maxHp);
      temp.qi = Math.max(0, (temp.qi || 0) + (it.qiMax || 0));
      temp.ap = Math.max(0, (temp.ap || 0) + (it.apBonus || 0));
      (it.passiveIds || []).forEach(itPid => { if (!temp.passiveIds) temp.passiveIds = []; if (!temp.passiveIds.includes(itPid)) temp.passiveIds.push(itPid); });
    });
  }

  if (temp.activeFormationId) {
    const form = getFormationById(temp.activeFormationId);
    if (form) {
      if (!form.disablesPassives) {
        temp.attack = temp.attack + (passiveDelta.attack || 0);
        temp.defense = temp.defense + (passiveDelta.defense || 0);
        if (passiveDelta.maxHp) {
          temp.maxHp = temp.maxHp + (passiveDelta.maxHp || 0);
          temp.hp = Math.min(temp.hp + (passiveDelta.maxHp || 0), temp.maxHp);
        }
        if (passiveDelta.atkPct) temp.attack = Math.floor(temp.attack * (1 + passiveDelta.atkPct / 100));
        if (passiveDelta.defPct) temp.defense = Math.floor(temp.defense * (1 + passiveDelta.defPct / 100));
        if (passiveDelta.speedPct) temp.speed = Math.floor((temp.speed || 0) * (1 + passiveDelta.speedPct / 100));
        if (passiveDelta.effects && passiveDelta.effects.length) temp.appliedPassiveEffects = (temp.appliedPassiveEffects || []).concat(passiveDelta.effects);
      }
      temp.attack = Math.floor((temp.attack || 0) * (form.atkMult || 1));
      temp.defense = Math.floor((temp.defense || 0) * (form.defMult || 1));
      temp.speed = Math.floor((temp.speed || 0) * (form.speedMult || 1));
    }
  } else {
    temp.attack = temp.attack + (passiveDelta.attack || 0);
    temp.defense = temp.defense + (passiveDelta.defense || 0);
    if (passiveDelta.maxHp) {
      temp.maxHp = temp.maxHp + (passiveDelta.maxHp || 0);
      temp.hp = Math.min(temp.hp + (passiveDelta.maxHp || 0), temp.maxHp);
    }
    if (passiveDelta.atkPct) temp.attack = Math.floor(temp.attack * (1 + passiveDelta.atkPct / 100));
    if (passiveDelta.defPct) temp.defense = Math.floor(temp.defense * (1 + passiveDelta.defPct / 100));
    if (passiveDelta.speedPct) temp.speed = Math.floor((temp.speed || 0) * (1 + passiveDelta.speedPct / 100));
    if (passiveDelta.effects && passiveDelta.effects.length) temp.appliedPassiveEffects = (temp.appliedPassiveEffects || []).concat(passiveDelta.effects);
  }

  return { combatant: temp, passiveContributions: contributions };
}

export function applyCombatBuffs(c: Combatant): Combatant {
  return applyCombatBuffsWithMeta(c).combatant;
}

export function defaultCombatant(id: string, name: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Combatant {
  switch (difficulty) {
    case 'easy':
      return { id, name, maxHp: 300, hp: 300, attack: 60, defense: 20, speed: 25, specialCooldown: 0 } as Combatant;
    case 'hard':
      return { id, name, maxHp: 500, hp: 500, attack: 120, defense: 40, speed: 40, specialCooldown: 0 } as Combatant;
    case 'medium':
    default:
      return { id, name, maxHp: 400, hp: 400, attack: 90, defense: 30, speed: 35, specialCooldown: 0, equippedSkills: [], ap: 4, qi: 40, equipment: {}, passiveIds: [], activeFormationId: null, skillCooldowns: {} } as Combatant;
  }
}
