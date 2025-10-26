export type Position = { x: number; y: number; role?: string; bonuses?: Record<string, number> };

export type FormationBonuses = {
  backAttackEfficiency?: number;
  flankingEfficiency?: number;
  coordinationBonus?: number;
  [key: string]: any;
};

export type EnhancedFormation = {
  id: string;
  name: string;
  tier?: string;
  description?: string;
  atkMult?: number;
  defMult?: number;
  speedMult?: number;
  disablesPassives?: boolean;
  positions?: Position[];
  globalBonuses?: FormationBonuses;
  tags?: string[];
  faction?: string;
  bonus?: Record<string, number>;
  [key: string]: any;
};

import { migrateTier } from '@/migrations/tierMigration';

export const FORMATIONS: EnhancedFormation[] = [
  // Mortal-world clan leader formations adapted for teaching
  { id: 'formation_shield_vanguard', name: 'Shield Vanguard', tier: 'mortal', description: 'A front-focused defensive formation.', atkMult: 0.9, defMult: 1.2, speedMult: 0.95, disablesPassives: false,
    positions: [
      { x: 0, y: 0, role: 'front', bonuses: { def: 15, atk: -5 } },
      { x: 1, y: 0, role: 'front', bonuses: { def: 10, atk: -3 } },
      { x: -1, y: 0, role: 'front', bonuses: { def: 10, atk: -3 } },
      { x: 0, y: 1, role: 'back', bonuses: { def: 5, speed: 5 } },
      { x: 1, y: 1, role: 'back', bonuses: { def: 3, speed: 3 } },
      { x: -1, y: 1, role: 'back', bonuses: { def: 3, speed: 3 } }
    ],
    globalBonuses: { backAttackEfficiency: 0.8 }
  },
  { id: 'formation_wedge_breaker', name: 'Wedge Breaker', tier: 'mortal', description: 'A narrow formation designed to punch through enemy lines.', atkMult: 1.15, defMult: 0.9, speedMult: 1.05, disablesPassives: false,
    positions: [
      { x: 0, y: 0, role: 'front', bonuses: { atk: 20, def: -10 } },
      { x: 1, y: 0, role: 'flank', bonuses: { atk: 15, flankingBonus: 10 } },
      { x: -1, y: 0, role: 'flank', bonuses: { atk: 15, flankingBonus: 10 } },
      { x: 0, y: 1, role: 'back', bonuses: { atk: 10, speed: 5 } },
      { x: 1, y: 1, role: 'back', bonuses: { atk: 5, speed: 3 } },
      { x: -1, y: 1, role: 'back', bonuses: { atk: 5, speed: 3 } }
    ],
    globalBonuses: { flankingEfficiency: 1.0 }
  },
  { id: 'formation_longbow_screen', name: 'Longbow Screen', tier: 'mortal', description: 'Spread formation maximizing ranged damage.', atkMult: 1.1, defMult: 0.85, speedMult: 1.0, disablesPassives: false },
  { id: 'formation_flanking_ring', name: 'Flanking Ring', tier: 'mortal', description: 'A ring formation that increases back attack chances.', atkMult: 1.08, defMult: 0.95, speedMult: 1.02, disablesPassives: false },
  { id: 'formation_harassment_swarm', name: 'Harassment Swarm', tier: 'mortal', description: 'Fast moving skirmish formation.', atkMult: 0.95, defMult: 0.85, speedMult: 1.15, disablesPassives: false },
  { id: 'formation_barrier_line', name: 'Barrier Line', tier: 'mortal', description: 'A deeply defensive formation to wear down attackers.', atkMult: 0.85, defMult: 1.25, speedMult: 0.9, disablesPassives: false },
  { id: 'formation_trap_grid', name: 'Trap Grid', tier: 'mortal', description: 'A formation focused on luring enemies into traps.', atkMult: 0.95, defMult: 0.9, speedMult: 0.98, disablesPassives: false },
  { id: 'formation_skirmisher_wave', name: 'Skirmisher Wave', tier: 'mortal', description: 'Wave-based assaults hitting in succession.', atkMult: 1.05, defMult: 0.9, speedMult: 1.08, disablesPassives: false },
  { id: 'formation_anchor_guard', name: 'Anchor Guard', tier: 'mortal', description: 'A heavy anchor unit formation to hold objectives.', atkMult: 0.9, defMult: 1.3, speedMult: 0.85, disablesPassives: false },
  { id: 'formation_closed_circle', name: 'Closed Circle', tier: 'mortal', description: 'Protective circle that reduces damage to central units.', atkMult: 0.88, defMult: 1.18, speedMult: 0.96, disablesPassives: false },
  { id: 'formation_phalanx', name: 'Phalanx', description: 'Tight spear formation. Grants increased defense and pierce resistance to front-line units.', tags: ['defense','spear'], faction: 'universal', bonus: { defense: 6, pierceResist: 4 }, rarityCode: migrateTier('H') },
  { id: 'formation_wedge', name: 'Wedge', description: 'Concentrated attack formation. Grants increased crit chance and breakthrough power to front-line.', tags: ['offense','breakthrough'], faction: 'universal', bonus: { critChance: 4, atkPower: 5 } },
  { id: 'formation_crescent', name: 'Crescent', description: 'Encircling formation that improves flanking. Grants mobility and flanking damage.', tags: ['mobility','flank'], faction: 'mortal', bonus: { mobility: 5, flankDamage: 5 } },
  { id: 'formation_shieldwall', name: 'Shieldwall', description: 'Hold the line formation. Greatly increases guard and reduces incoming damage for allies behind shields.', tags: ['defense','shield'], faction: 'mortal', bonus: { guard: 8, incomingDamageReduction: 4 } },
  { id: 'formation_stormline', name: 'Stormline', description: 'Ranged bombardment formation. Ranged units gain increased range and accuracy.', tags: ['ranged','support'], faction: 'mortal', bonus: { range: 1, accuracy: 6 } },
  { id: 'formation_snake', name: 'Snake', description: 'Flexible formation for hit-and-run tactics. Improves evasion and ambush bonuses.', tags: ['mobility','ambush'], faction: 'universal', bonus: { evasion: 5, ambushDamage: 6 } },
  { id: 'formation_box', name: 'Box', description: 'Defensive formation that maximizes protection for all units. Grants increased defense and damage reduction.', tags: ['defense','protection'], faction: 'universal', bonus: { defense: 5, damageReduction: 3 } },
  { id: 'formation_flank', name: 'Flank', description: 'Formation designed for flanking maneuvers. Grants increased attack power and mobility to flanking units.', tags: ['offense','mobility'], faction: 'mortal', bonus: { atkPower: 5, mobility: 5 } },
  { id: 'formation_circle', name: 'Circle', description: 'Formation that surrounds the enemy. Grants increased evasion and area control.', tags: ['mobility','control'], faction: 'immortal', bonus: { evasion: 5, areaControl: 5 } },
  { id: 'formation_line', name: 'Line', description: 'Standard formation for ranged units. Grants increased range and accuracy.', tags: ['ranged','support'], faction: 'universal', bonus: { range: 2, accuracy: 4 } },
  { id: 'formation_pincer', name: 'Pincer', description: 'Aggressive formation that aims to encircle the enemy. Grants increased crit chance and attack power.', tags: ['offense','encircle'], faction: 'immortal', bonus: { critChance: 6, atkPower: 6 } },
  { id: 'formation_spearhead', name: 'Spearhead', description: 'Formation focused on a strong offensive push. Grants increased attack power and speed.', tags: ['offense','speed'], faction: 'universal', bonus: { atkPower: 6, speed: 4 } }
];
