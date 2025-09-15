import type { Skill, SkillTier } from '../components/minigames/skills';
import { getActiveAbilities, getActiveAbilityById } from '../data/registry';

// Normalize various active-ability data shapes into the `Skill` shape used by minigame consumers.
function normalizeToSkill(raw: any): Skill {
  // Provide safe defaults and map common fields
  const tier = (typeof raw.tier === 'number') ? raw.tier : Number(raw.tier) || 1;
  const cost = raw.cost || { ap: raw.apCost || 0, qi: raw.qiCost || 0 };
  const effects = raw.effects || (raw.effect ? [raw.effect] : []);
  return {
    id: String(raw.id),
    name: raw.name || String(raw.id),
    description: raw.description || raw.desc || '',
    power: typeof raw.power === 'number' ? raw.power : (raw.damage || 0),
    cost: { ap: cost.ap || 0, qi: cost.qi || 0 },
    tier: tier as SkillTier,
    mechanics: raw.mechanics || [],
    cooldown: raw.cooldown || 0,
    effects,
    tags: raw.tags || [],
  } as Skill;
}
import type { CombatTechnique } from './CombatSystem';

// Adapter: convert a catalog Skill into a CombatTechnique usable by CombatSystem
export function toCombatTechnique(skill: Skill): CombatTechnique {
  // If the skill already contains active-ability metadata (effects, ap/qi costs,
  // or a 'type' field encoded in mechanics/description), prefer those values.
  // Otherwise, fall back to conservative defaults driven by the catalog fields.
  const apCost = (skill as any).apCost ?? skill.cost?.ap ?? 0;
  const qiCost = (skill as any).qiCost ?? skill.cost?.qi ?? 0;
  const type = (skill as any).type ?? 'attack';
  const effects = (skill as any).effects ?? [{ type: 'damage', target: 'enemy', value: skill.power }];

  return {
    id: skill.id,
    name: skill.name,
    description: skill.description || '',
    apCost,
    qiCost,
    type,
    effects,
    cooldown: skill.cooldown,
    currentCooldown: 0,
  tier: (skill.tier as any),
    // modest default hit rules; CombatSystem can override with context
    missChance: 0.05,
    critChance: 0.1,
    critMultiplier: 1.5,
  };
}

export function getSkillById(id: string): Skill | undefined {
  const raw = getActiveAbilityById(id);
  if (!raw) return undefined;
  return normalizeToSkill(raw);
}

export function listSkillsByTier(tier: SkillTier): Skill[] {
  return getActiveAbilities().map(normalizeToSkill).filter(s => s.tier === tier as any);
}

export function listAllSkills(): Skill[] {
  return getActiveAbilities().map(normalizeToSkill);
}