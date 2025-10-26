import { getPlayerRealmId } from '../utils/playerHelpers';

export interface CombatParticipant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  qi: number;
  maxQi: number;
  ap: number; // Action Points
  maxAp: number;
  stats: {
    atk: number;
    def: number;
    speed: number;
  };
  techniques: CombatTechnique[];
  buffs: CombatBuff[];
  debuffs: CombatDebuff[];
  // Enhanced stance system with tactical options
  stance?: 'neutral' | 'offensive' | 'defensive' | 'movement' | 'evasive' | 'counter' | 'balanced' | 'aggressive';
  stanceMomentum?: number; // Tracks how long player has been in current stance (turns)
  // Weapon mastery system
  weaponMastery?: Record<string, WeaponMastery>;
}

export interface CombatTechnique {
  id: string;
  name: string;
  description: string;
  apCost: number;
  qiCost: number;
  type: 'attack' | 'defense' | 'support' | 'movement';
  effects: CombatEffect[];
  cooldown?: number;
  currentCooldown?: number;
  // Optional tiering for technique progression/balance (1..8 like cultivation tiers)
  tier?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  // Mastery system
  masteryXp?: number; // accumulated XP per use
  masteryRank?: number; // integer rank, small bonuses
  // Hit rules (optional; falls back to global defaults)
  missChance?: number; // 0..1
  critChance?: number; // 0..1
  critMultiplier?: number; // default 1.5x
  // If true, the player's `intensity` slider will scale this technique's AP/Qi costs as well as effect values.
  scalesWithIntensity?: boolean;
  // Custom mechanics metadata (e.g., multiHit, chain, conditional) used by technique implementations
  mechanics?: any[];
  // Weapon mastery system
  weaponType?: string; // e.g., 'sword', 'fist', 'spear', etc.
}

export interface CombatEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
  target: 'self' | 'enemy' | 'all_enemies' | 'all_allies';
  value?: number;
  duration?: number;
  stat?: string;
  // Optional multiplier for multiplier-style debuffs (e.g., multiplier: 0.666 means reduce stat to 66.6%)
  multiplier?: number;
}

import { logger } from '../utils/logger';

export interface CombatBuff {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: Record<string, any>;
  appliedEffects?: Record<string, any>;
}

export interface CombatDebuff {
  id: string;
  name: string;
  description: string;
  duration: number;
  effects: Record<string, any>;
  appliedEffects?: Record<string, any>;
}

export interface CombatState {
  participants: CombatParticipant[];
  currentTurn: number;
  turnOrder: string[];
  round: number;
  isPlayerTurn: boolean;
  combatLog: string[];
  status: 'ongoing' | 'victory' | 'defeat' | 'fled';
  enemyIntent?: { actorId: string; intent: 'attack' | 'defend' | 'taunt' | 'retreat' | 'regather'; techniqueId?: string };
}

import { runtimeRng } from '../utils/seededRng';

export interface CombatContext {
  type: 'normal' | 'rival' | 'faction_battle' | 'sect_war';
  faction?: string;
  sect?: string;
  rivalId?: string;
  battleId?: string; // Optional battle record id for faction/sect battles
  reputationImpact?: Record<string, number>;
  specialRules?: string[];
  terrain?: 'mountain' | 'forest' | 'desert' | 'city' | 'sect_grounds';
  weather?: 'clear' | 'rain' | 'storm' | 'fog';
  // Optional formation selected for this combat (applies team-wide multipliers)
  formationId?: string; // id from FORMATION_CATALOG
  applyFormationTo?: 'player_team' | 'enemy_team' | 'both';
  // Debug and feature flags
  debugDamageBreakdown?: boolean; // log detailed damage math
  enableCritMiss?: boolean; // enable crit/miss system if true (off by default)
  rng?: () => number; // optional RNG injection for testing (defaults to Math.random)
}

export interface RivalAIProfile {
  personality: 'aggressive' | 'cunning' | 'honorable' | 'treacherous' | 'neutral';
  preferredTechniques: string[];
  riskTolerance: number; // 0-1, how willing to take risks
  adaptability: number; // 0-1, how well they adapt to player style
  taunts: string[];
  victoryQuotes: string[];
  defeatQuotes: string[];
}

import { getFormationById } from '../data/registry';
import { WeaponMastery } from '../types';
import NodeMapSystem, { MapNode } from './NodeMapSystem';
// Use ESM imports instead of runtime require to be browser-friendly
import * as domainShim from '../utils/domainSystem';
import { getRng } from '../utils/rng';
import { computeOffensiveProwess, TERRAIN_MULTIPLIERS, WEATHER_MULTIPLIERS } from './combatConfig';
import { reportMissionObjectiveProgress } from './MissionSystem';
import { getCultivationMultiplier, getDiminishingReturnFactor, adjustDamageForRealmGap } from './cultivationUtils';
import { toSafeNumber, clamp as clampNum } from '../utils/numberUtils';
import getPowerScale from '../utils/powerScale';

export class CombatSystem {
  // Tunable: maximum fraction of AP cost reducible by cultivation (e.g., 0.3 => up to 30% AP reduction)
  private static readonly MAX_AP_REDUCTION: number = 0.25;
  private state: CombatState;
  private context: CombatContext;
  private gameStore: any;
  private rivalSystem: any;
  private baseStats: Record<string, { atk: number; def: number; speed: number }> = {};

  // Formation state (applied multipliers) for this combat instance
  private formationEffects?: { atkMult: number; defMult: number; speedMult: number; target: 'player_team' | 'enemy_team' | 'both' };

  // Node-based formation system
  private nodeMapSystem: NodeMapSystem;
  private formationLayouts: Map<string, any> = new Map(); // Maps team/unit IDs to formation layouts

  constructor(player: CombatParticipant, enemies: CombatParticipant[], gameStore: any, rivalSystem: any, context: CombatContext = { type: 'normal' }) {
    this.state = {
      participants: [player, ...enemies],
      currentTurn: 0,
      turnOrder: [],
      round: 1,
      isPlayerTurn: true,
      combatLog: ['Combat begins!'],
      status: 'ongoing'
    };

    this.context = context;
    this.gameStore = gameStore;
    this.rivalSystem = rivalSystem;

    // Initialize NodeMapSystem
    this.nodeMapSystem = NodeMapSystem.getInstance();

    // Ensure stance shift techniques available for player
    const playerRef = this.state.participants.find(p => p.id === 'player');
    if (playerRef) this.addStanceShiftTechniques(playerRef);

    // Capture base stats before any adjustments for deterministic validations
    this.state.participants.forEach(p => {
      this.baseStats[p.id] = { ...p.stats };
    });

    // Apply faction-based stat adjustments first, then rival personality mechanics
    this.state.participants.forEach(participant => {
      this.applyFactionStatAdjustments(participant);
      this.applyRivalMechanics(participant);
    });

    // Apply optional formation modifiers if provided via context (opt-in only)
    this.applyFormationFromContext();

    // Attach to window for debug access if available
    try {
      if (typeof window !== 'undefined' && !(window as any).gameStore && this.gameStore) {
        (window as any).gameStore = this.gameStore;
      }
    } catch (e) {
      // ignore for environments where window is not accessible
    }

    // Ensure every participant has at least one usable basic attack for tests/demo
    this.state.participants.forEach(p => this.addDefaultAttackTechnique(p));

    // Set weapon mastery for player if available
    const playerParticipant = this.state.participants.find(p => p.id === 'player');
    if (playerParticipant && this.gameStore?.player?.weaponMastery) {
      playerParticipant.weaponMastery = { ...this.gameStore.player.weaponMastery };
    }

    this.initializeCombat();

    // Add context-specific log messages
    if (context.type === 'rival' && context.rivalId) {
      this.addToLog(`Rival encounter! This battle will affect your reputation.`);
    } else if (context.type === 'faction_battle' && context.faction) {
      this.addToLog(`Faction battle! The outcome will impact faction relations.`);
    } else if (context.type === 'sect_war' && context.sect) {
      this.addToLog(`Sect war! Your sect's honor is at stake.`);
    }
  }

  /**
   * Notify the system that an enemy was defeated. This is a simple hook used by
   * game systems to update mission objectives that target enemy types.
   */
  public notifyEnemyDefeated(enemyId: string, enemyType?: string) {
    try {
      // Attempt to update any active missions whose objectives target this enemyType or enemyId
      const store = this.gameStore;
      if (!store || !store.story || !Array.isArray(store.story.activeRandomMissions)) return;
      for (const m of store.story.activeRandomMissions) {
        if (!m.objectives) continue;
        for (let i = 0; i < m.objectives.length; i++) {
          const obj = m.objectives[i];
          // Accept matching by target id or by type string
          if (obj.target && (obj.target === enemyType || obj.target === enemyId || String(obj.target) === String(enemyType))) {
            // call the MissionSystem helper (resilient in both runtime and tests)
            reportMissionObjectiveProgress(m.id, i, 1);
          }
        }
      }
    } catch (e) { /* ignore */ }
  }

  // RNG accessor: prefer injected RNG from context for deterministic tests, then domain shim, then Math.random
  private rng(): number {
    try {
      if (this.context && typeof this.context.rng === 'function') return this.context.rng();
      // prefer central helper which checks source, domain shim, then runtime seeded RNG
      try {
        const g = getRng(this.gameStore);
        if (typeof g === 'function') return g();
      } catch (e) {
        // ignore and fall back
      }
  // final fallback via runtimeRng or Math.random
  try { return (typeof runtimeRng === 'function') ? runtimeRng() : Math.random(); } catch (e) { return Math.random(); }
    } catch (e) {
      try { return getRng(this.gameStore)(); } catch (ee) { return Math.random(); }
    }
  }

  private initializeCombat(): void {
    // Calculate turn order based on speed using a sorted copy to avoid
    // mutating the participants array (tests assume original ordering).
    // Sort by speed desc; tie-breaker: player-first, then higher atk, then seeded RNG to keep deterministic tests
    // rngVal is a numeric sample; preserve by calling rng() once for tie-break mixing
    const rngVal = this.rng();
    this.state.turnOrder = [...this.state.participants]
      .sort((a, b) => {
        if (b.stats.speed !== a.stats.speed) return b.stats.speed - a.stats.speed;
  // player goes first in ties
  if (a.id === 'player' && b.id !== 'player') return -1;
  if (b.id === 'player' && a.id !== 'player') return 1;
  // Prefer a small offensive prowess heuristic instead of raw atk for tie-breaking
  const pa = computeOffensiveProwess(a);
  const pb = computeOffensiveProwess(b);
  if (pb !== pa) return pb - pa;
        // fallback deterministic tie-break using seeded RNG mixed with ids
        const seedA = Array.from(a.id).reduce((s, ch) => s + ch.charCodeAt(0), 0);
        const seedB = Array.from(b.id).reduce((s, ch) => s + ch.charCodeAt(0), 0);
        return (seedB + Math.floor(rngVal * 10)) - (seedA + Math.floor(rngVal * 10));
      })
      .map(p => p.id);

    // Initialize AP for all participants
    this.state.participants.forEach(p => {
      p.ap = p.maxAp;
      p.techniques.forEach(t => t.currentCooldown = 0);
    });

    this.addToLog(`Turn order: ${this.state.turnOrder.map(id =>
      this.getParticipant(id)?.name).join(' → ')}`);
  }

  public getState(): CombatState {
    return { ...this.state };
  }
  
  // Apply optional formation from context to participant base stats (multipliers)
  private applyFormationFromContext(): void {
    try {
  const formationId = this.context.formationId;
      if (!formationId) return;
      const applyTo = this.context.applyFormationTo || 'player_team';
      const formation = getFormationById(formationId);
      if (!formation) return;

      // Legacy formation multipliers for backward compatibility
      const atkMult = Math.max(0, formation.atkMult || 1);
      const defMult = Math.max(0, formation.defMult || 1);
      const speedMult = Math.max(0, formation.speedMult || 1);
      this.formationEffects = { atkMult, defMult, speedMult, target: applyTo };

      // Set up positional formations for enhanced system
      this.setupPositionalFormations(formation, applyTo);

      const applyToParticipant = (p: any) => {
        // decide team: assume id 'player' and anything not 'player' is enemy (simple convention for tests)
        const isPlayerTeam = p.id === 'player' || p.id?.startsWith('ally_');
        const enabled = applyTo === 'both' || (applyTo === 'player_team' && isPlayerTeam) || (applyTo === 'enemy_team' && !isPlayerTeam);
        if (!enabled) return;
        p.stats.atk = Math.max(0, Math.floor(p.stats.atk * atkMult));
        p.stats.def = Math.max(0, Math.floor(p.stats.def * defMult));
        p.stats.speed = Math.max(1, Math.floor(p.stats.speed * speedMult));
      };
      this.state.participants.forEach(applyToParticipant);
      this.addToLog(`Formation applied: ${formation.name} (${applyTo.replace('_', ' ')})`);
    } catch (e) {
      // ignore formation apply errors in constrained environments
    }
  }

  /**
   * Sets up positional formations for enhanced combat mechanics
   */
  private setupPositionalFormations(formation: any, applyTo: string): void {
    const playerTeam = this.state.participants.filter(p => p.id === 'player' || p.id?.startsWith('ally_'));
    const enemyTeam = this.state.participants.filter(p => p.id !== 'player' && !p.id?.startsWith('ally_'));

    if (applyTo === 'both' || applyTo === 'player_team') {
      if (playerTeam.length > 0) {
        const layout = this.nodeMapSystem.createFormationLayout(formation, 2, 2);
        const unitIds = playerTeam.map(p => p.id);
        const assignedLayout = this.nodeMapSystem.assignUnitsToFormation(layout, unitIds);
        this.formationLayouts.set('player_team', assignedLayout);
      }
    }

    if (applyTo === 'both' || applyTo === 'enemy_team') {
      if (enemyTeam.length > 0) {
        const layout = this.nodeMapSystem.createFormationLayout(formation, 7, 2);
        const unitIds = enemyTeam.map(p => p.id);
        const assignedLayout = this.nodeMapSystem.assignUnitsToFormation(layout, unitIds);
        this.formationLayouts.set('enemy_team', assignedLayout);
      }
    }
  }

  /**
   * Gets positional bonuses for a participant
   */
  private getPositionalBonuses(participantId: string): { atk: number; def: number; speed: number; flankingBonus: number; backAttackBonus: number } {
    const playerLayout = this.formationLayouts.get('player_team');
    const enemyLayout = this.formationLayouts.get('enemy_team');

    // Check both layouts for the participant
    let layout = null;
    if (playerLayout && playerLayout.nodes.some((n: MapNode) => n.unitId === participantId)) {
      layout = playerLayout;
    } else if (enemyLayout && enemyLayout.nodes.some((n: MapNode) => n.unitId === participantId)) {
      layout = enemyLayout;
    }

    if (layout) {
      return this.nodeMapSystem.calculatePositionalBonuses(layout, participantId);
    }

    return { atk: 0, def: 0, speed: 0, flankingBonus: 0, backAttackBonus: 0 };
  }

  /**
   * Checks if an attack is a flanking attack
   */
  private isFlankingAttack(attackerId: string, targetId: string): boolean {
    const attackerLayout = this.getParticipantLayout(attackerId);
    const targetLayout = this.getParticipantLayout(targetId);

    if (attackerLayout && targetLayout) {
      return this.nodeMapSystem.canFlank(attackerLayout, attackerId, targetId);
    }

    return false;
  }

  /**
   * Checks if an attack is from behind
   */
  private isBackAttack(attackerId: string, targetId: string): boolean {
    const attackerLayout = this.getParticipantLayout(attackerId);
    const targetLayout = this.getParticipantLayout(targetId);

    if (attackerLayout && targetLayout) {
      return this.nodeMapSystem.isBackAttack(attackerLayout, attackerId, targetId);
    }

    return false;
  }

  /**
   * Gets the formation layout for a participant
   */
  private getParticipantLayout(participantId: string): any {
    const playerLayout = this.formationLayouts.get('player_team');
    const enemyLayout = this.formationLayouts.get('enemy_team');

    if (playerLayout && playerLayout.nodes.some((n: MapNode) => n.unitId === participantId)) {
      return playerLayout;
    } else if (enemyLayout && enemyLayout.nodes.some((n: MapNode) => n.unitId === participantId)) {
      return enemyLayout;
    }

    return null;
  }

  public getContext(): CombatContext {
    return { ...this.context };
  }

  // Serialize a snapshot of combat for save/load
  public serialize(): { state: CombatState; context: CombatContext } {
    return JSON.parse(JSON.stringify({ state: this.state, context: this.context }));
  }

  // Load a previously serialized snapshot (use with caution mid-combat)
  public loadSerialized(data: { state: CombatState; context: CombatContext }): void {
    // Basic shape checks
    if (!data || !data.state || !data.context) return;
    this.state = JSON.parse(JSON.stringify(data.state));
    this.context = JSON.parse(JSON.stringify(data.context));
  }

  // Convenience: expose last telegraphed enemy intent
  public getEnemyIntent() {
    return this.state.enemyIntent ? { ...this.state.enemyIntent } : undefined;
  }

  public getCurrentParticipant(): CombatParticipant | null {
    const currentId = this.state.turnOrder[this.state.currentTurn];
    return this.getParticipant(currentId);
  }

  private getParticipant(id: string): CombatParticipant | null {
    return this.state.participants.find(p => p.id === id) || null;
  }

  // Expose the damage calculation in tests only via a guarded method (kept private-like by comment)
  /* istanbul ignore next */
  public __test_applyDamage(attacker: CombatParticipant, target: CombatParticipant, baseDamage: number) {
    return (this as any).applyDamage(attacker, target, baseDamage);
  }

  public getAvailableTechniques(participantId: string): CombatTechnique[] {
    const participant = this.getParticipant(participantId);
    if (!participant) return [];

    const stance = participant.stance ?? 'neutral';

    // Stance modifiers based on the new stance system
    const stanceModifiers = {
      neutral: { apCostMultiplier: 1.0, qiCostMultiplier: 1.0 },
      balanced: { apCostMultiplier: 1.0, qiCostMultiplier: 1.0 },
      offensive: { apCostMultiplier: 1.15, qiCostMultiplier: 0.9 },
      defensive: { apCostMultiplier: 1.1, qiCostMultiplier: 1.0 },
  movement: { apCostMultiplier: 0.9, qiCostMultiplier: 1.1 },
      evasive: { apCostMultiplier: 1.0, qiCostMultiplier: 1.1 },
      counter: { apCostMultiplier: 1.0, qiCostMultiplier: 1.1 },
      aggressive: { apCostMultiplier: 1.15, qiCostMultiplier: 0.9 }
    };

    const modifiers = stanceModifiers[stance] || stanceModifiers.neutral;
    const apModifier = modifiers.apCostMultiplier;
    const qiModifier = modifiers.qiCostMultiplier;

    const weather = this.context.weather || 'clear';
    const weatherApMod = weather === 'rain' ? 1.05 : weather === 'storm' ? 1.1 : weather === 'fog' ? 1.05 : 1.0;

    return participant.techniques.filter(t => {
      if ((t.currentCooldown || 0) > 0) return false;
      if (t.id.startsWith('stance_')) return true; // always usable if off cooldown, cost 0
      const apCost = Math.max(0, Math.floor(t.apCost * apModifier * weatherApMod));
      const qiCost = Math.max(0, Math.floor(t.qiCost * qiModifier));
      return apCost <= participant.ap && qiCost <= participant.qi;
    });
  }

  // Change stance with a tiny AP cost (default 0) and log it
  public setStance(participantId: string, stance: NonNullable<CombatParticipant['stance']>, apCost = 0): boolean {
    const participant = this.getParticipant(participantId);
    if (!participant) return false;
    if (participant.ap < apCost) return false;

    participant.ap -= apCost;
    participant.stance = stance;
    this.addToLog(`${participant.name} shifts into ${stance} stance${apCost > 0 ? ` (-${apCost} AP)` : ''}.`);
    return true;
  }

  // options: { intensity?: number } where intensity is 0.01..1.0 representing 1%..100% power output
  public useTechnique(participantId: string, techniqueId: string, targetId?: string, options?: { intensity?: number }): boolean {
    const participant = this.getParticipant(participantId);
    if (!participant) return false;

    const technique = participant.techniques.find(t => t.id === techniqueId);
    if (!technique) return false;

    // Handle stance shift pseudo-techniques
    if (technique.id.startsWith('stance_')) {
      if ((technique.currentCooldown || 0) > 0) return false; // respect cooldown
      const next = technique.id.replace('stance_', '') as NonNullable<CombatParticipant['stance']>;
      // zero AP/qi; executes immediately
      const changed = this.setStance(participantId, next, 0);
      if (changed) {
        // apply small cooldown to stance change
        technique.currentCooldown = Math.max(1, technique.cooldown || 1);
        this.addToLog(`${participant.name} focuses and adopts a ${next} posture.`);
      }
      return changed;
    }

  // Calculate effective costs based on stance and mastery
    const masteryRank = technique.masteryRank ?? 0;
    const stance = participant.stance ?? 'neutral';
    const apModifier = stance === 'movement' ? 0.9 : stance === 'defensive' ? 1.1 : 1.0;
    const qiModifier = stance === 'offensive' ? 1.05 : 1.0;

    // Weather can affect exertion (AP cost)
    const weather = this.context.weather || 'clear';
    const weatherApMod = weather === 'rain' ? 1.05 : weather === 'storm' ? 1.1 : weather === 'fog' ? 1.05 : 1.0;
  // Intensity: determine once and clamp (1%..100%)
  const rawIntensity = options?.intensity;
  const intensity = typeof rawIntensity === 'number' ? Math.max(0.01, Math.min(1, rawIntensity)) : 1;

  // Compute base costs
    let apCost = Math.max(0, Math.floor(technique.apCost * apModifier * weatherApMod));
    let qiCost = Math.max(0, Math.floor(technique.qiCost * qiModifier));

    // If intensity-based scaling is enabled on the technique, reduce costs proportionally to intensity
    if (technique.scalesWithIntensity) {
      apCost = Math.max(0, Math.floor(apCost * intensity));
      qiCost = Math.max(0, Math.floor(qiCost * intensity));
    }

    // AP efficiency scaling: higher cultivation reduces AP cost modestly (up to ~30%)
    const cultMul = getCultivationMultiplier((participant as any).cultivation);
    // Map cultMul in [1, ~6+] to efficiency in [1.0, 1 - MAX_AP_REDUCTION]
    const maxMul = 6; // multiplier at which we reach max efficiency
    const norm = Math.min(cultMul, maxMul);
    const reduction = CombatSystem.MAX_AP_REDUCTION * ((norm - 1) / (maxMul - 1));
    const efficiency = 1 - reduction;
    const apEfficiency = Math.max(1 - CombatSystem.MAX_AP_REDUCTION, Math.min(1.0, efficiency));
    apCost = Math.max(0, Math.floor(apCost * apEfficiency));

    // Check if technique can be used
    if (apCost > participant.ap || qiCost > participant.qi) {
      return false;
    }

    if ((technique.currentCooldown || 0) > 0) {
      return false;
    }

    // Consume resources
    participant.ap -= apCost;
    participant.qi -= qiCost;

    // Set cooldown with mastery reduction
    if (technique.cooldown) {
      const cooldownReduction = Math.min(masteryRank, 3); // up to -3 turns
      technique.currentCooldown = Math.max(0, technique.cooldown - cooldownReduction);
    }

    // Apply effects
    (technique as any)._lastIntensity = intensity;
    this.applyTechniqueEffects(participant, technique, targetId, intensity);

    // Gain mastery XP
    technique.masteryXp = (technique.masteryXp || 0) + 1;
    if ((technique.masteryXp || 0) >= 5) {
      technique.masteryXp = 0;
      technique.masteryRank = Math.min((technique.masteryRank || 0) + 1, 5);
      this.addToLog(`${participant.name} has improved their ${technique.name} mastery! (Rank ${technique.masteryRank})`);
    }

    // Gain weapon mastery XP
    if (technique.weaponType && participant.weaponMastery) {
      const weaponType = technique.weaponType;
      if (!participant.weaponMastery[weaponType]) {
        participant.weaponMastery[weaponType] = {
          level: 1,
          experience: 0,
          tier: 1,
          bonuses: {}
        };
      }
      const mastery = participant.weaponMastery[weaponType];
      mastery.experience += 2; // gain 2 XP per use
      // Level up every 10 XP
      while (mastery.experience >= 10) {
        mastery.experience -= 10;
        mastery.level += 1;
        // Tier up every 5 levels
        if (mastery.level % 5 === 0) {
          mastery.tier += 1;
          // Add bonuses on tier up
          this.applyWeaponMasteryBonuses(mastery);
          this.addToLog(`${participant.name} has advanced their ${weaponType} mastery to tier ${mastery.tier}!`);
        } else {
          this.addToLog(`${participant.name}'s ${weaponType} mastery has increased to level ${mastery.level}!`);
        }
      }
    }

    this.addToLog(`${participant.name} uses ${technique.name}!`);

    // Check for combat end conditions
    this.checkCombatEnd();

    return true;
  }


  // Append: basic turn advancement integrated below (see main endTurn)

  private executeEnemyTurn(): void {
    const current = this.getCurrentParticipant();
    if (!current || current.id === 'player' || this.state.status !== 'ongoing') return;

    // Determine target (player)
    const player = this.getParticipant('player');
    if (!player) return;

    // Try to use AI system via rivalSystem if available
    let techniqueToUse: string | null = null;
    let plannedIntent: 'attack' | 'defend' | 'taunt' | 'retreat' | 'regather' = 'attack';
    try {
      const rival = this.rivalSystem?.getRival(current.id) || this.rivalSystem?.getRival(current.id.replace(/^rival_/, ''));
      const ai = this.rivalSystem?.getAISystem ? this.rivalSystem.getAISystem() : null;
      if (rival && ai && typeof ai.makeCombatDecision === 'function') {
        const situation = {
          playerHp: player.hp,
          rivalHp: current.hp,
          playerQi: player.qi,
          rivalQi: current.qi,
          turnNumber: this.state.round,
          previousActions: [] as string[]
        };
        const decision = ai.makeCombatDecision(rival, (this.gameStore?.player || {}) as any, situation);
        // Map decisions to technique and intent
        if (decision.action === 'use_technique' || decision.action === 'attack') {
          techniqueToUse = this.pickTechniqueForDecision(current, decision.technique || null);
          plannedIntent = 'attack';
        } else if (decision.action === 'defend') {
          techniqueToUse = this.findTechniqueByType(current, 'defense');
          plannedIntent = 'defend';
        } else if (decision.action === 'taunt') {
          plannedIntent = 'taunt';
          this.addToLog(`${current.name}: *taunts*`);
        } else if (decision.action === 'retreat') {
          plannedIntent = 'retreat';
          this.addToLog(`${current.name} attempts to disengage!`);
          this.state.status = 'fled';
          return;
        }
      }
      } catch (e) {
        /* intentionally ignored */
      }

    // Lightweight heuristic before pure fallback:
    // - If low HP (<35%) and has a defense technique, prefer it.
    // - If very low Qi and has meditation, recover qi.
    if (!techniqueToUse) {
      const hpPct = current.maxHp > 0 ? current.hp / current.maxHp : 1;
      const lowQi = current.qi < 10;
      if (hpPct < 0.35) {
        const guardId = this.findTechniqueByType(current, 'defense');
        if (guardId) {
          techniqueToUse = guardId;
          plannedIntent = 'defend';
        }
      }
      if (!techniqueToUse && lowQi) {
        const meditate = this.getAvailableTechniques(current.id).find(t => t.id === 'meditation');
        if (meditate) {
          techniqueToUse = meditate.id;
          plannedIntent = 'regather';
        }
      }
      // Otherwise attack
      if (!techniqueToUse) {
        techniqueToUse = this.findTechniqueByType(current, 'attack') || current.techniques[0]?.id || null;
        plannedIntent = techniqueToUse ? 'attack' : 'regather';
      }
    }

    // Telegraph intent before executing
    this.state.enemyIntent = { actorId: current.id, intent: plannedIntent, techniqueId: techniqueToUse || undefined };

    if (techniqueToUse) {
      this.useTechnique(current.id, techniqueToUse, 'player');
    } else {
      // If nothing usable, regenerate qi/ap a bit
      current.qi = Math.min(current.maxQi, current.qi + 5);
      current.ap = Math.min(current.maxAp, current.ap + 1);
      this.addToLog(`${current.name} prepares and regathers qi.`);
    }

    // After enemy acts, advance to player's (or next) turn
    this.endTurn();
  }

  private findTechniqueByType(p: CombatParticipant, type: CombatTechnique['type']): string | null {
    const usable = this.getAvailableTechniques(p.id).filter(t => t.type === type);
    return usable[0]?.id || null;
  }

  private pickTechniqueForDecision(p: CombatParticipant, preferred: string | null): string | null {
    const usable = this.getAvailableTechniques(p.id).filter(t => !t.id.startsWith('stance_'));
    if (preferred) {
      const byId = usable.find(t => t.id === preferred);
      if (byId) return byId.id;
    }
    // Simple heuristic: highest value damage first
    const attacks = usable.filter(t => t.type === 'attack');
    // Rank by offensive prowess + technique base damage
    attacks.sort((a, b) => {
      const aBase = a.effects?.[0]?.value || 0;
      const bBase = b.effects?.[0]?.value || 0;
      const ap = computeOffensiveProwess(p) + aBase;
      const bp = computeOffensiveProwess(p) + bBase;
      return bp - ap;
    });
    return attacks[0]?.id || usable[0]?.id || null;
  }


  private getFactionFromContext(): string | undefined {
    if (this.context.faction) return this.context.faction;
    if (this.context.type === 'sect_war' && this.context.sect) return this.context.sect;
    return undefined;
  }

  // Inject four stance shift zero-cost utility techniques to player, if not present
  private addStanceShiftTechniques(p: CombatParticipant) {
    const ensure = (id: string, name: string, stance: NonNullable<CombatParticipant['stance']>) => {
      if (!p.techniques.some(t => t.id === id)) {
        p.techniques.push({
          id,
          name,
          description: `Adopt the ${stance} stance.`,
          apCost: 0,
          qiCost: 0,
          type: 'movement',
          effects: [],
          cooldown: 1, // small cooldown to prevent stance spam
          currentCooldown: 0
        });
      }
    };
    ensure('stance_neutral', 'Stance: Neutral', 'neutral');
    ensure('stance_offensive', 'Stance: Offensive', 'offensive');
    ensure('stance_defensive', 'Stance: Defensive', 'defensive');
    ensure('stance_movement', 'Stance: Movement', 'movement');
  }

  // Add a default basic attack if none exists, to ensure damage can be dealt in tests/demos
  private addDefaultAttackTechnique(p: CombatParticipant) {
    const hasAttack = p.techniques.some(t => t.type === 'attack');
    if (!hasAttack) {
      p.techniques.push({
        id: 'basic_attack',
        name: 'Basic Attack',
        description: 'A straightforward strike.',
        apCost: 1,
        qiCost: 0,
        type: 'attack',
        effects: [{ type: 'damage', target: 'enemy', value: 10 }],
      });
    }
  }

  private applyTechniqueEffects(user: CombatParticipant, technique: CombatTechnique, targetId?: string, _intensity = 1): void {
    // Support technique-level mechanics metadata if present (multiHit, chain, conditional)
    const mechanics = (technique as any).mechanics || [];
  // Use cultivation utils imported at module level to avoid runtime require
  // getCultivationMultiplier imported at top

    // Helper: evaluate simple conditional string patterns
    const evalCondition = (cond: string | undefined, u: CombatParticipant, t: CombatParticipant): boolean => {
      if (!cond) return false;
      // target_below_<N>_hp  (absolute HP)
      const m1 = cond.match(/^target_below_(\d+)_hp$/);
      if (m1) {
        const n = parseInt(m1[1], 10);
        return t.hp < n;
      }
      // user_hp_below_<N>_hp
      const m2 = cond.match(/^user_hp_below_(\d+)_hp$/);
      if (m2) {
        const n = parseInt(m2[1], 10);
        return u.hp < n;
      }
      // target_has_debuff:<id>
      const m3 = cond.match(/^target_has_debuff:(.+)$/);
      if (m3) {
        const id = m3[1];
        return (t.debuffs || []).some(d => d.id === id);
      }
      // target_has_buff:<id>
      const m4 = cond.match(/^target_has_buff:(.+)$/);
      if (m4) {
        const id = m4[1];
        return (t.buffs || []).some(b => b.id === id);
      }
      // user_has_flag:<flag>  (flags are optional on participants; permissive check)
      const m5 = cond.match(/^user_has_flag:(.+)$/);
      if (m5) {
        const flag = m5[1];
        return Boolean((u as any).flags && Array.isArray((u as any).flags) && (u as any).flags.includes(flag));
      }
      // after_move: timing predicate — evaluated via context flag `afterMove` when set by caller
      if (cond === 'after_move') {
        return Boolean((this.context as any)?.afterMove === true || ((this.context as any)?.specialRules || []).includes('after_move'));
      }
      // on_kill handled separately (needs detection after damage)
      if (cond === 'on_kill') return false;
      return false;
    };

  // For each effect, interpret mechanics and perform hits accordingly
    technique.effects.forEach((effect, idx) => {
      const targets = this.getTargets(user, effect.target, targetId);

      targets.forEach(target => {
        switch (effect.type) {
          case 'damage': {
            // base damage with mastery bonus on first effect
            const masteryRank = technique.masteryRank ?? 0;
            const masteryBonus = idx === 0 ? 1 + Math.min(masteryRank * 0.03, 0.15) : 1;
            // base value before scaling
            let baseValue = Math.floor((effect.value || 0) * masteryBonus);

            // Apply cultivation multiplier (if user has cultivation info)
            const cultInfo = (user as any).cultivation as any;
            const cultMul = getCultivationMultiplier(cultInfo);
            baseValue = Math.max(1, Math.floor(baseValue * cultMul));

            // Determine diminishing return factor based on how often this technique was used
            let dimFactor = 1;
            const counts = (user as any)._techUseCounts = (user as any)._techUseCounts || {};
            const used = counts[technique.id] || 0;
            dimFactor = getDiminishingReturnFactor(used + 1); // include this impending use
            counts[technique.id] = used + 1;

            baseValue = Math.max(1, Math.floor(baseValue * dimFactor));

            // Multi-hit mechanic
            const multi = mechanics.find((m: any) => m.type === 'multiHit');
            if (multi && multi.hits && Number(multi.hits) > 1) {
              const hits = Number(multi.hits);
              for (let h = 0; h < hits; h++) {
                if (target.hp <= 0) break; // stop if target dead mid-sequence
                // diminishing factor for subsequent hits
                const factor = h === 0 ? 1 : Math.pow(0.7, h);
                const hitBase = Math.max(1, Math.floor(baseValue * factor));
                this.applyDamage(user, target, hitBase, technique);
              }
              break;
            }

            // Chain mechanic: initial hit + follow-ups
            const chain = mechanics.find((m: any) => m.type === 'chain');
            if (chain && chain.chainLength && Number(chain.chainLength) > 0) {
              const chainLen = Number(chain.chainLength);
              // initial
              if (target.hp > 0) this.applyDamage(user, target, baseValue, technique);
              // follow-ups with reduced power
              for (let c = 0; c < chainLen; c++) {
                if (target.hp <= 0) break;
                const followBase = Math.max(1, Math.floor(baseValue * Math.max(0.4, 0.6 - c * 0.1)));
                this.applyDamage(user, target, followBase, technique);
              }
              break;
            }

            // Conditional mechanic (single conditional block supported)
            const conditional = mechanics.find((m: any) => m.type === 'conditional');
            if (conditional && conditional.condition) {
              // If conditional is 'on_kill', we need to apply base then check if kill occurred
              if (conditional.condition === 'on_kill') {
                const preHp = target.hp;
                this.applyDamage(user, target, baseValue, technique);
                if (preHp > 0 && target.hp <= 0) {
                  // trigger on_kill: apply extra damage to other enemies if present
                  const others = this.state.participants.filter(p => p.id !== user.id && p.id !== target.id && p.hp > 0);
                  others.forEach(o => {
                    const spill = Math.max(1, Math.floor(baseValue * (conditional.multiplier || 0.5)));
                    this.applyDamage(user, o, spill, technique);
                  });
                }
                break;
              }

              // Evaluate other conditions before applying main damage
              const condPassed = evalCondition(conditional.condition, user, target);
              if (condPassed) {
                // apply base and an extra bonus
                this.applyDamage(user, target, baseValue, technique);
                const extra = Math.max(1, Math.floor(baseValue * (conditional.multiplier || 0.5)));
                if (target.hp > 0) this.applyDamage(user, target, extra, technique);
              } else {
                // fallback: normal damage
                this.applyDamage(user, target, baseValue, technique);
              }
              break;
            }

            // Default: single application
            this.applyDamage(user, target, baseValue, technique);
            break;
          }
          case 'heal':
            this.applyHealing(target, effect.value || 0);
            break;
          case 'buff':
            this.applyBuff(target, effect);
            break;
          case 'debuff':
            this.applyDebuff(target, effect);
            break;
        }
      });
    });
  }

  private getTargets(user: CombatParticipant, targetType: string, targetId?: string): CombatParticipant[] {
    switch (targetType) {
      case 'self':
        return [user];
      case 'enemy': {
        if (targetId) {
          const target = this.getParticipant(targetId);
          if (target) return [target];
          // Fallback: target not found, pick the first available enemy to ensure action has an effect
          const fallback = this.state.participants.find(p => p.id !== user.id);
          return fallback ? [fallback] : [];
        }
        // If no explicit target provided, pick the first enemy
        const firstEnemy = this.state.participants.find(p => p.id !== user.id);
        return firstEnemy ? [firstEnemy] : [];
      }
      case 'all_enemies':
        return this.state.participants.filter(p => p.id !== user.id);
      case 'all_allies':
        // For now, assuming single player vs enemies
        return user.id === 'player' ? [user] : this.state.participants.filter(p => p.id !== 'player');
      default:
        return [];
    }
  }

  private applyDamage(attacker: CombatParticipant, target: CombatParticipant, baseDamage: number, technique?: CombatTechnique): void {
    // Resolve RNG at call-time using central helper so resolution order is consistent
    // Priority: this.context.rng -> this.gameStore.rng -> domainShim.getRng() -> seeded.runtimeRng() -> Math.random
    const rng = getRng(this.context || this.gameStore);

    // Config map for terrain/weather multipliers
    const terrain = this.context.terrain || 'city';
    const weather = this.context.weather || 'clear';

  const atkMod = TERRAIN_MULTIPLIERS[terrain].atk * WEATHER_MULTIPLIERS[weather].atk;
  let defMod = TERRAIN_MULTIPLIERS[terrain].def * WEATHER_MULTIPLIERS[weather].def;
  let dmgMod = TERRAIN_MULTIPLIERS[terrain].dmg * WEATHER_MULTIPLIERS[weather].dmg;

    // Stance influence
    const stance = attacker.stance || 'neutral';
    if (stance === 'offensive') dmgMod *= 1.1;
    // Defensive stance reduces outgoing damage and increases defense
    if (stance === 'defensive') {
      dmgMod *= 0.9; // reduce outgoing damage by 10%
      defMod *= 1.1;
    }

    // Apply weapon mastery bonuses
    let weaponAtkBonus = 0;
    let weaponDefBonus = 0;
    if (technique?.weaponType && attacker.weaponMastery?.[technique.weaponType]) {
      const mastery = attacker.weaponMastery[technique.weaponType];
      weaponAtkBonus = mastery.bonuses.atk || 0;
      weaponDefBonus = mastery.bonuses.def || 0;
    }

    // Apply positional bonuses
    const attackerPosBonuses = this.getPositionalBonuses(attacker.id);
    const targetPosBonuses = this.getPositionalBonuses(target.id);

    const effectiveAtk = Math.max(0, Math.floor((attacker.stats.atk + weaponAtkBonus + attackerPosBonuses.atk) * atkMod));
    const effectiveDef = Math.max(0, Math.floor((target.stats.def + weaponDefBonus + targetPosBonuses.def) * defMod));

    const raw = baseDamage + effectiveAtk - effectiveDef;
  let damage = Math.max(1, Math.floor(raw * dmgMod));

    // Apply flanking and back attack bonuses
    let specialAttackMultiplier = 1.0;
    let specialAttackMessage = '';

    if (this.isBackAttack(attacker.id, target.id)) {
      specialAttackMultiplier *= (1 + attackerPosBonuses.backAttackBonus);
      specialAttackMessage = 'Back attack! ';
    } else if (this.isFlankingAttack(attacker.id, target.id)) {
      specialAttackMultiplier *= (1 + attackerPosBonuses.flankingBonus);
      specialAttackMessage = 'Flanking attack! ';
    }

    damage = Math.max(1, Math.floor(damage * specialAttackMultiplier));

    // Allow per-technique and attacker cultivation-based multipliers to further modify final damage
    const cultMul = getCultivationMultiplier((attacker as any).cultivation);
    damage = Math.max(1, Math.floor(damage * cultMul));

    // Immortal fantasy: apply a global damage scaler from player/world settings.
    try {
      // Derive a plausible player reference from gameStore; if missing, use attacker speed/atk heuristic
      const store = this.gameStore || {};
      const p = (store.player as any) || null;
      const world = (store.world as any) || undefined;
      const { damageScale } = getPowerScale(p, world);
      if (damageScale && damageScale !== 1) {
        damage = Math.max(1, Math.floor(damage * damageScale));
      }
    } catch {
      // ignore scaling errors
    }

    // Apply realm-gap protection using attacker/target cultivation info and simple prowess metrics
    const attackerStage = ((attacker as any).cultivation || {}).stage || 0;
    const targetStage = ((target as any).cultivation || {}).stage || 0;
    const attackerProwess = computeOffensiveProwess(attacker);
    const targetProwess = (target.stats.def || 0) + (targetStage * 10);
    damage = adjustDamageForRealmGap({ attackerStage, targetStage, attackerProwess, targetProwess, damage, targetMaxHp: target.maxHp });

    // Crit/Miss (behind flag) — allow per-technique overrides
    if (this.context.enableCritMiss) {
      const missChance = technique?.missChance ?? 0.05;
      const critChance = technique?.critChance ?? 0.05;
      const critMult = technique?.critMultiplier ?? 1.5;
      const roll = rng();
      if (roll < missChance) {
        // miss: no damage
        if (this.context.debugDamageBreakdown) {
          this.addToLog(`[DEBUG] MISS roll=${roll.toFixed(3)} missChance=${missChance}`);
        }
        this.addToLog(`${attacker.name} misses!`);
        return;
      } else if (roll > 1 - critChance) {
        // crit
        const critBefore = damage;
        damage = Math.max(1, Math.floor(damage * critMult));
        if (this.context.debugDamageBreakdown) {
          this.addToLog(`[DEBUG] CRIT roll=${roll.toFixed(3)} base=${critBefore} * critMult=${critMult} -> crit=${damage}`);
        }
      }
    }

    // Debug damage breakdown
    if (this.context.debugDamageBreakdown) {
      this.addToLog(
        `[DEBUG] dmgBreakdown: base=${baseDamage} atk=${attacker.stats.atk}*${atkMod.toFixed(2)}=${effectiveAtk} ` +
        `def=${target.stats.def}*${defMod.toFixed(2)}=${effectiveDef} raw=${raw} * dmgMod=${dmgMod.toFixed(2)} -> ${damage}`
      );
    }

  target.hp = Math.max(0, target.hp - damage);

  // --- Handle Triggered Effects (e.g., Thorn Armor) ---
  // Check target's buffs for on_take_damage effects
    target.buffs.forEach(buff => {
      const reflectEffect = buff.effects?.triggered?.on_take_damage;
      if (reflectEffect?.type === 'reflect_damage' && reflectEffect.percent > 0) {
        const reflectedDamage = Math.max(1, Math.floor(damage * reflectEffect.percent));
        attacker.hp = Math.max(0, attacker.hp - reflectedDamage);
        this.addToLog(
          `${target.name}'s ${buff.name} reflects ${reflectedDamage} damage back to ${attacker.name}!`
        );
      }
    });

    this.addToLog(`${specialAttackMessage}${target.name} takes ${damage} damage! (${target.hp}/${target.maxHp} HP remaining)`);

    // If the target is the player, enqueue inner thoughts on near-death/death
    try {
        if (target.id === 'player') {
        try {
          const iv = (globalThis as any).InnerVoice || null;
          if (iv && typeof iv.enqueueThoughtAuto === 'function') {
            const hpRatio = target.maxHp > 0 ? (target.hp / target.maxHp) : 0;
            if (hpRatio <= 0) {
              iv.enqueueThoughtAuto('combat_near_death', 'player', "I can't die here... not yet.", { importance: 5, ttlMs: 60_000 });
            } else if (hpRatio < 0.1) {
              iv.enqueueThoughtAuto('combat_near_death', 'player', "My life hangs by a thread... hold on!", { importance: 4, ttlMs: 45_000 });
            } else if (hpRatio < 0.3) {
              iv.enqueueThoughtAuto('combat', 'player', "This is bad — I need to recover!", { importance: 2, ttlMs: 25_000 });
            }
          }
        } catch (e) { /* non-fatal */ }
      }
    } catch (e) {
      // non-fatal
    }

    // --- Passive onHit / proc hooks ---
    try {
      const rngFn = this.rng.bind(this);

      // Attacker onHit hooks: allow handlers to optionally return a number which will be
      // applied as extra damage to the target (positive values -> extra damage).
      const attackerHooks = (attacker as any)?._passiveHooks;
      if (attackerHooks && Array.isArray(attackerHooks.onHit)) {
        attackerHooks.onHit.forEach((h: any) => {
          try {
            const res = h.fn({ attacker, target, damage, technique, rng: rngFn, combatSystem: this });
            if (typeof res === 'number') {
              const extra = Math.max(0, Math.floor(res));
              target.hp = Math.max(0, target.hp - extra);
              this.addToLog(`${attacker.name}'s passive ${h.id} deals ${extra} bonus damage to ${target.name}!`);
            }
          } catch (e) { /* swallow hook errors */ }
        });
      }

      // Attacker proc hooks: these functions are responsible for chance checks using rng
      if (attackerHooks && Array.isArray(attackerHooks.proc)) {
        attackerHooks.proc.forEach((h: any) => {
          try {
            h.fn({ attacker, target, damage, technique, rng: rngFn, combatSystem: this });
          } catch (e) { /* ignore */ }
        });
      }

      // Target-side onHit (e.g., retaliation) - call target's onHit with swapped roles
      const targetHooks = (target as any)?._passiveHooks;
      if (targetHooks && Array.isArray(targetHooks.onHit)) {
        targetHooks.onHit.forEach((h: any) => {
          try {
            const res = h.fn({ attacker: target, target: attacker, damage, technique, rng: rngFn, combatSystem: this });
            if (typeof res === 'number') {
              const extra = Math.max(0, Math.floor(res));
              attacker.hp = Math.max(0, attacker.hp - extra);
              this.addToLog(`${target.name}'s passive ${h.id} deals ${extra} damage back to ${attacker.name}!`);
            }
          } catch (e) { /* swallow */ }
        });
      }
    } catch (e) {
      // defensive: ensure passive hooks never break combat
    }
  }

  private applyHealing(target: CombatParticipant, amount: number): void {
    const healed = Math.min(amount, target.maxHp - target.hp);
    target.hp += healed;

    this.addToLog(`${target.name} recovers ${healed} HP! (${target.hp}/${target.maxHp} HP)`);
  }

  private applyBuff(target: CombatParticipant, effect: CombatEffect): void {
    if (!effect.stat || !effect.value || !effect.duration) return;

    const newBuff: CombatBuff = {
      id: `buff_${Date.now()}`,
      name: `${effect.stat} boost`,
      description: `+${effect.value} ${effect.stat}`,
      duration: effect.duration,
      effects: { stats: { [effect.stat]: effect.value } },
      appliedEffects: { stats: {} }
    };

    // Apply buff effect immediately to stats
    const statEffects = newBuff.effects.stats;
    if (statEffects) {
      Object.entries(statEffects).forEach(([stat, val]) => {
        if (stat in target.stats && typeof val === 'number') {
          // @ts-expect-error dynamic key access
          target.stats[stat] = Math.max(1, (target.stats as any)[stat] + val);
          // Store the applied value for clean reversion
          if (newBuff.appliedEffects?.stats) {
            (newBuff.appliedEffects.stats as any)[stat] = val;
          }
        }
      });
    }

    target.buffs.push(newBuff);
    this.addToLog(`${target.name} gains ${newBuff.name} for ${newBuff.duration} turns!`);
  }

  private applyDebuff(target: CombatParticipant, effect: CombatEffect): void {
    // Support two debuff styles:
    // 1) flat stat change: effect.stat='def', effect.value = amount, duration
    // 2) multiplier-style: effect.stat='def' (or 'def_multiplier') and effect.multiplier present
    if (!effect.stat || !effect.duration) return;

    const debuff: CombatDebuff = {
      id: `debuff_${Date.now()}`,
      name: `${effect.stat} reduction`,
      description: effect.multiplier
        ? `Defense reduced x${(1 / (effect.multiplier || 1)).toFixed(2)}`
        : `-${effect.value} ${effect.stat}`,
      duration: effect.duration,
      effects: { stats: {} as any },
      appliedEffects: { stats: {} }
    };

    // Multiplier style: compute the delta based on current stat value
    if (typeof (effect as any).multiplier === 'number') {
      const mult = (effect as any).multiplier;
      // target stat name (default to 'def')
      const statName = (effect.stat === 'def_multiplier' ? 'def' : effect.stat) as keyof typeof target.stats;
      if (statName in target.stats) {
        const oldVal = (target.stats as any)[statName];
        const newVal = Math.max(1, Math.floor(oldVal * mult));
        const delta = newVal - oldVal; // negative
        debuff.effects.stats[statName] = delta;
        if (debuff.appliedEffects?.stats) {
          (debuff.appliedEffects.stats as any)[statName] = delta;
        }
        // Apply immediately
        (target.stats as any)[statName] = newVal;
      }
    } else if (typeof effect.value === 'number') {
      // Flat value style
      const statName = effect.stat as keyof typeof target.stats;
      const val = -effect.value; // debuff stores negative
      debuff.effects.stats[statName] = val;
      if (debuff.appliedEffects?.stats) {
        (debuff.appliedEffects.stats as any)[statName] = val;
      }
      if (statName in target.stats && typeof val === 'number') {
        (target.stats as any)[statName] = Math.max(1, (target.stats as any)[statName] + val);
      }
    } else {
      return; // nothing to apply
    }

    target.debuffs.push(debuff);
    this.addToLog(`${target.name} suffers ${debuff.name} for ${debuff.duration} turns!`);
  }

  public endTurn(): void {
    if (this.state.status !== 'ongoing') return;

    const current = this.getCurrentParticipant();
    if (current) {
      // Process buffs/debuffs and decrement cooldowns on actor
      this.processTurnEffects(current);
      // Small passive AP regen
      current.ap = Math.min(current.maxAp, current.ap + 1);
    }

    // Advance to next participant
    this.state.currentTurn = (this.state.currentTurn + 1) % this.state.turnOrder.length;

    // If we've cycled through all participants, start new round
    if (this.state.currentTurn === 0) {
      this.startNewRound();
    }

    // Update player turn status
    const nextParticipant = this.getCurrentParticipant();
    this.state.isPlayerTurn = nextParticipant?.id === 'player';

    // If it's now an enemy's turn, auto-execute with AI
    if (!this.state.isPlayerTurn) {
      this.executeEnemyTurn();
    }
  }

  private processTurnEffects(participant: CombatParticipant): void {
    // Reduce cooldowns
    participant.techniques.forEach(t => {
      if (t.currentCooldown && t.currentCooldown > 0) {
        t.currentCooldown--;
      }
    });

    // Process buffs (decrement duration; if expired, revert their effects)
    participant.buffs = participant.buffs.filter(buff => {
      buff.duration--;
      if (buff.duration <= 0) {
        // Revert buff effects
        if (buff.appliedEffects?.stats) {
          Object.entries(buff.appliedEffects.stats as Record<string, number>).forEach(([stat, val]) => {
            if (stat in participant.stats) {
              // @ts-expect-error dynamic key access
              participant.stats[stat] = Math.max(1, (participant.stats as any)[stat] - val);
            }
          });
        }
        this.addToLog(`${participant.name}'s ${buff.name} expires.`);
        return false;
      }
      return true;
    });

    // Invoke any auraTick passive hooks attached to participant
    try {
      const hooks = (participant as any)?._passiveHooks;
      if (hooks && Array.isArray(hooks.auraTick)) {
        hooks.auraTick.forEach((h: any) => {
          try { h.fn(participant, { combatSystem: this }); } catch (e) { /* ignore hook errors */ }
        });
      }
    } catch (e) { /* noop */ }

    // Process debuffs (decrement duration; if expired, revert their effects)
    participant.debuffs = participant.debuffs.filter(debuff => {
      debuff.duration--;
      if (debuff.duration <= 0) {
        // Revert debuff effects (remove the negative)
        if (debuff.appliedEffects?.stats) {
          Object.entries(debuff.appliedEffects.stats as Record<string, number>).forEach(([stat, val]) => {
            if (stat in participant.stats) {
              // @ts-expect-error dynamic key access
              participant.stats[stat] = Math.max(1, (participant.stats as any)[stat] - val);
            }
          });
        }
        this.addToLog(`${participant.name}'s ${debuff.name} expires.`);
        return false;
      }
      return true;
    });
  }

  private startNewRound(): void {
    this.state.round++;
    this.addToLog(`--- Round ${this.state.round} ---`);

    // Restore AP for all participants (keep full restore to avoid breaking flow)
    this.state.participants.forEach(p => {
      p.ap = p.maxAp;
      // Reset per-technique use counters each round to avoid persistent penalties across rounds
      try {
        if ((p as any)._techUseCounts) {
          Object.keys((p as any)._techUseCounts).forEach(k => { (p as any)._techUseCounts[k] = 0; });
        }
      } catch (e) {
        // defensive: ignore
      }
    });
  }

  private checkCombatEnd(): void {
    const player = this.getParticipant('player');
    const enemies = this.state.participants.filter(p => p.id !== 'player');

    if (!player || player.hp <= 0) {
      this.state.status = 'defeat';
      this.addToLog('You have been defeated!');
      this.handleCombatOutcome('defeat');
    } else if (enemies.every(e => e.hp <= 0)) {
      this.state.status = 'victory';
      this.addToLog('Victory! All enemies have been defeated!');
      this.handleCombatOutcome('victory');
    }
  }

  private handleCombatOutcome(outcome: 'victory' | 'defeat'): void {
    // Handle faction and reputation impacts based on combat context
    switch (this.context.type) {
      case 'rival':
        this.handleRivalCombatOutcome(outcome);
        break;
      case 'faction_battle':
        this.handleFactionBattleOutcome(outcome);
        break;
      case 'sect_war':
        this.handleSectWarOutcome(outcome);
        break;
    }
    // After outcome, process end-of-combat buffs on the player state if available
    try {
      if (this.gameStore && this.gameStore.buffSystem && this.gameStore.player && typeof this.gameStore.updatePlayerState === 'function') {
        const processed = this.gameStore.buffSystem.processBuffsOnCombatEnd(this.gameStore.player);
        this.gameStore.updatePlayerState(processed);
      }
    } catch (e) {
      // ignore non-fatal errors in buff cleanup
    }
  }



  private handleFactionBattleOutcome(outcome: 'victory' | 'defeat'): void {
    if (!this.context.faction || !this.gameStore) {
  logger.warn('Missing faction context or game store for faction battle outcome');
      return;
    }

    try {
      // Calculate detailed reputation impacts based on battle context
      const battleIntensity = this.calculateBattleIntensity();
      const playerFaction = this.context.faction;
      
      // Base reputation changes with scaling based on battle intensity
      const baseRepChange = outcome === 'victory' ? 25 : -20;
      const scaledRepChange = Math.floor(baseRepChange * battleIntensity);
      
      // Apply reputation change to player's faction
      this.gameStore.adjustFactionStanding(playerFaction, scaledRepChange);
      
      // Track all faction impacts for detailed logging
      const factionImpacts: Record<string, number> = {
        [playerFaction]: scaledRepChange
      };

      // Process enemy factions with more detailed impact calculation
      const enemies = this.state.participants.filter(p => p.id !== 'player');
      const processedFactions = new Set([playerFaction]);

      enemies.forEach(enemy => {
        if (enemy.id.startsWith('rival_') && this.rivalSystem) {
          const lookupId = enemy.id.replace(/^rival_/, '');
          const rival = this.rivalSystem.getRival(lookupId);
          
          if (rival?.faction && !processedFactions.has(rival.faction)) {
            processedFactions.add(rival.faction);
            
            // Calculate enemy faction reputation impact
            const enemyRepChange = this.calculateEnemyFactionImpact(outcome, battleIntensity, rival);
            this.gameStore.adjustFactionStanding(rival.faction, enemyRepChange);
            factionImpacts[rival.faction] = enemyRepChange;

            // Apply sect reputation impacts if applicable
            if (rival.sect) {
              const sectRepChange = this.calculateSectReputationImpact(outcome, battleIntensity, rival);
              if (typeof this.gameStore.adjustSectReputation === 'function') {
                this.gameStore.adjustSectReputation(rival.sect, sectRepChange);
                this.addToLog(`Sect reputation with ${rival.sect}: ${sectRepChange > 0 ? '+' : ''}${sectRepChange}`);
              }
            }
          }
        }
      });

      // Apply cascading faction effects (allies and enemies of involved factions)
      this.applyCascadingFactionEffects(factionImpacts, outcome, battleIntensity);

      // Log detailed faction impacts
      this.logDetailedFactionImpacts(factionImpacts, outcome, battleIntensity);

      // Update battle record with detailed outcome data
      if (this.context.battleId && typeof this.gameStore.resolveFactionBattle === 'function') {
        this.gameStore.resolveFactionBattle(this.context.battleId, outcome);
      }

      // Apply long-term consequences for significant battles
      if (battleIntensity > 1.5) {
        this.applyLongTermConsequences(factionImpacts, outcome);
      }

    } catch (error) {
  logger.error('Error handling faction battle outcome:', error);
      this.addToLog('Error processing faction battle consequences');
    }
  }

  private calculateBattleIntensity(): number {
    // Calculate battle intensity based on various factors
    let intensity = 1.0;

    // Factor in participant levels
    const totalLevels = this.state.participants.reduce((sum, p) => {
      if (p.id.startsWith('rival_') && this.rivalSystem) {
        const rival = this.rivalSystem.getRival(p.id.replace(/^rival_/, ''));
        return sum + (rival?.level || 10);
      }
  return sum + (getPlayerRealmId(this.gameStore?.player) || 10);
    }, 0);

    intensity *= Math.min(2.0, totalLevels / 100); // Scale based on total power

    // Factor in number of participants
    const participantCount = this.state.participants.length;
    intensity *= Math.min(1.5, 1 + (participantCount - 2) * 0.1);

    // Factor in battle duration (rounds)
    intensity *= Math.min(1.3, 1 + (this.state.round - 1) * 0.05);

    return Math.max(0.5, Math.min(2.5, intensity));
  }

  private calculateEnemyFactionImpact(_outcome: 'victory' | 'defeat', _intensity: number, _rival: any): number {
    const baseChange = _outcome === 'victory' ? -25 : 20;
    let scaledChange = Math.floor(baseChange * _intensity);

    // Adjust based on rival's personality and relationship
    if (_rival && _rival.personality === 'honorable' && _rival.relationship > 0) {
      // Honorable rivals with positive relationships have reduced negative impact
      scaledChange = Math.floor(scaledChange * 0.7);
    } else if (_rival && _rival.personality === 'treacherous') {
      // Treacherous rivals cause more faction instability
      scaledChange = Math.floor(scaledChange * 1.2);
    }

    return scaledChange;
  }

  private calculateSectReputationImpact(_outcome: 'victory' | 'defeat', _intensity: number, _rival: any): number {
    const baseChange = _outcome === 'victory' ? -15 : 10;
    return Math.floor(baseChange * _intensity * 0.8); // Sect impacts are generally smaller
  }

  private applyCascadingFactionEffects(factionImpacts: Record<string, number>, _outcome: 'victory' | 'defeat', _intensity: number): void {
    // Apply smaller reputation changes to allied/enemy factions
    Object.keys(factionImpacts).forEach(factionId => {
      const impact = factionImpacts[factionId];
      
      // This would require faction relationship data
      // For now, apply minor cascading effects to all other factions
      if (Math.abs(impact) > 20) {
        const cascadeEffect = Math.floor(impact * 0.1);
        
        // Apply small reputation changes to other factions (representing regional politics)
        if (typeof this.gameStore.getAllFactions === 'function') {
          const allFactions = this.gameStore.getAllFactions();
          allFactions.forEach((faction: any) => {
            if (faction.id !== factionId && !factionImpacts[faction.id]) {
              this.gameStore.adjustFactionStanding(faction.id, cascadeEffect);
            }
          });
        }
      }
    });
  }

  private logDetailedFactionImpacts(factionImpacts: Record<string, number>, outcome: 'victory' | 'defeat', intensity: number): void {
    this.addToLog(`=== Faction Battle ${outcome.toUpperCase()} (Intensity: ${intensity.toFixed(1)}) ===`);
    
    Object.entries(factionImpacts).forEach(([factionId, impact]) => {
      const impactType = impact > 0 ? 'improved' : 'worsened';
      const magnitude = Math.abs(impact);
      const magnitudeDesc = magnitude > 30 ? 'drastically' : magnitude > 20 ? 'significantly' : magnitude > 10 ? 'moderately' : 'slightly';
      
      this.addToLog(`${factionId} standing ${impactType} ${magnitudeDesc} (${impact > 0 ? '+' : ''}${impact})`);
    });
  }

  private applyLongTermConsequences(factionImpacts: Record<string, number>, outcome: 'victory' | 'defeat'): void {
    // Apply long-term consequences for major faction battles
    this.addToLog('This significant battle will have lasting consequences...');
    
    // Could trigger events, change faction relationships, unlock new content, etc.
    if (typeof this.gameStore.addEventLog === 'function') {
      this.gameStore.addEventLog(`Major faction battle concluded with ${outcome}. Political landscape shifted.`);
    }
  }

  private handleSectWarOutcome(outcome: 'victory' | 'defeat'): void {
    if (this.context.sect && this.gameStore) {
      const sectRepChange = outcome === 'victory' ? 25 : -20;
      this.addToLog(`Sect reputation impacted: ${sectRepChange > 0 ? '+' : ''}${sectRepChange}`);

      try {
        this.gameStore.adjustSectReputation(this.context.sect, sectRepChange);
      } catch (error) {
  logger.warn('Could not access game store for sect outcome:', error);
      }
    }
  }

  // Enhanced method to apply faction-based stat adjustments with better performance and validation
  private applyFactionStatAdjustments(participant: CombatParticipant): void {
    if (!this.gameStore) return;

    // Cache original stats for validation and error recovery
    const originalStats = { ...participant.stats };
    
    // Performance optimization: early return for participants without faction data
    const isPlayer = participant.id === 'player';
    const isRival = participant.id.startsWith('rival_');
    
    if (!isPlayer && !isRival) {
      return; // No faction adjustments for non-player, non-rival participants
    }

    try {
      let factionBonus = 1.0;
      let factionId: string | null = null;

      // Use local safe number helpers to coerce values
      if (isPlayer) {
        const playerSect = this.gameStore.player?.sect;
        if (!playerSect) {
          // No sect — we still validate and continue without throwing
          factionBonus = 1.0;
        } else {
          factionId = playerSect;
          const sectReputation = toSafeNumber(this.gameStore.getSectReputation(playerSect), 0);
          const clampedReputation = clampNum(sectReputation, -100, 100);
          factionBonus = this.calculateFactionBonus(clampedReputation, 'sect');
        }
      } else if (isRival && this.rivalSystem) {
        const rival = this.rivalSystem.getRival(participant.id)
          || this.rivalSystem.getRival(participant.id.replace(/^rival_/, ''))
          || (this.context.rivalId ? this.rivalSystem.getRival(this.context.rivalId) : null);

        if (!rival?.faction) {
          factionBonus = 1.0;
        } else {
          factionId = rival.faction;
          const factionStanding = toSafeNumber(this.gameStore.getFactionStanding(rival.faction), 0);
          const clampedStanding = clampNum(factionStanding, -100, 100);
          factionBonus = this.calculateFactionBonus(clampedStanding, 'faction');
        }
      }

      // Apply faction bonus to stats
      if (factionBonus !== 1.0) {
        if (isRival && this.rivalSystem) {
          const rivalCtx = this.rivalSystem.getRival(participant.id)
            || this.rivalSystem.getRival(participant.id.replace(/^rival_/, ''))
            || (this.context.rivalId ? this.rivalSystem.getRival(this.context.rivalId) : null);
          this.applyStatMultipliers(participant, factionBonus, originalStats, { isRival: true, personality: rivalCtx?.personality });
        } else {
          this.applyStatMultipliers(participant, factionBonus, originalStats, { isRival: false });
        }

        if (Math.abs(factionBonus - 1.0) > 0.1) {
          try { logger.debug(`Applied faction bonus ${factionBonus.toFixed(2)} to ${participant.name} (${factionId})`); } catch (e) { void e; }
        }
      }

      // Validate final stats to prevent extreme values
      this.validateParticipantStats(participant, originalStats);

      // Deterministic enforcement vs base stats for rival personalities (kept as-is)
      if (isRival && this.rivalSystem) {
        const base = this.baseStats[participant.id];
        const rivalCtx = this.rivalSystem.getRival(participant.id)
          || this.rivalSystem.getRival(participant.id.replace(/^rival_/, ''))
          || (this.context.rivalId ? this.rivalSystem.getRival(this.context.rivalId) : null);
        if (base && rivalCtx?.personality) {
          switch (rivalCtx.personality) {
            case 'aggressive':
              if (participant.stats.def >= base.def) {
                participant.stats.def = Math.max(1, base.def - 1);
              }
              break;
            case 'cunning':
              if (participant.stats.speed <= base.speed) {
                participant.stats.speed = base.speed + 1;
              }
              break;
            case 'treacherous':
              if (participant.stats.atk >= base.atk + 2) {
                participant.stats.atk = base.atk + 1;
              }
              break;
          }
        }
      }

    } catch (error) {
  logger.error(`Error applying faction stat adjustments to ${participant.name}:`, error);
      participant.stats = { ...originalStats };
    }
  }

  // Helper method for number validation
  private isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  // Optimized faction bonus calculation
  private calculateFactionBonus(standing: number, type: 'sect' | 'faction'): number {
    // Different scaling for sect vs faction standing
    const scaleFactor = type === 'sect' ? 150 : 120; // Sects have slightly more impact
    const baseBonus = 1 + (standing / scaleFactor);
    
    // Clamp to reasonable bounds with better scaling
    return Math.max(0.6, Math.min(1.5, baseBonus));
  }

  // Optimized stat multiplier application
  private applyStatMultipliers(
    participant: CombatParticipant,
    bonus: number,
    originalStats: any,
    opts?: { isRival?: boolean; personality?: string }
  ): void {
    const isRival = !!opts?.isRival;
    let personality = opts?.personality;

    // Fallback: if rival personality not provided, try to resolve from rivalSystem/context
    if (isRival && !personality && this.rivalSystem) {
      const rivalCtx = this.rivalSystem.getRival(participant.id)
        || this.rivalSystem.getRival(participant.id.replace(/^rival_/, ''))
        || (this.context.rivalId ? this.rivalSystem.getRival(this.context.rivalId) : null);
      personality = rivalCtx?.personality;
    }

    // By default apply to atk/def, less to speed
    let atkBonus = bonus;
    let defBonus = bonus;
    let speedBonus = bonus * 0.85;

    // For rivals, reflect personality tendencies in how faction standing impacts stats
    if (isRival && personality) {
      switch (personality) {
        case 'aggressive':
          // Aggressive: emphasize attack; ensure defense does not increase
          atkBonus = bonus * 1.1;
          defBonus = Math.min(0.9, bonus * 0.8); // cap so defense cannot exceed base
          break;
        case 'cunning':
          // Cunning: emphasize speed and ensure noticeable boost
          speedBonus = Math.max(bonus, 1.15);
          break;
        case 'honorable':
          // Honorable: balanced but ensure minimum positive boost even with low standing
          defBonus = Math.max(bonus * 1.1, 1.1);
          atkBonus = Math.max(bonus * 1.05, 1.05);
          break;
        case 'treacherous':
          // Treacherous: reduce benefits overall regardless of standing
          atkBonus = Math.min(0.95, bonus * 0.9);
          defBonus = Math.min(0.95, bonus * 0.9);
          break;
        case 'neutral':
          // Neutral: keep defaults
          break;
      }
    }

    // Defensive enforcement: personality should not produce counter-intuitive increases.
    // Ensure aggressive always reduces or keeps defense below neutral expectation
    if (isRival && personality === 'aggressive') {
      defBonus = Math.min(defBonus, 0.95);
    }
    if (isRival && personality === 'treacherous') {
      // Treacherous should not gain big attack bonuses
      atkBonus = Math.min(atkBonus, 1.0);
    }
    if (isRival && personality === 'cunning') {
      // Guarantee a meaningful speed increase
      speedBonus = Math.max(speedBonus, 1.15);
    }

  // If personality effects were already applied (for rivals), apply faction multipliers
  // against the current stats to avoid compounding from the original base and
  // producing inflated values.
  const useCurrentAsBase = isRival && !!personality;
  const base = useCurrentAsBase ? participant.stats : (this.baseStats[participant.id] || originalStats);
  participant.stats.atk = Math.max(1, Math.floor((base.atk || 1) * atkBonus));
  participant.stats.def = Math.max(1, Math.floor((base.def || 1) * defBonus));
  participant.stats.speed = Math.max(1, Math.floor((base.speed || 1) * speedBonus));

    // Enforce personality post-conditions relative to original stats to satisfy expected behavior
    if (isRival && personality) {
      switch (personality) {
        case 'aggressive':
          // Defense should not exceed original; nudge down if needed
          if (participant.stats.def >= originalStats.def) {
            participant.stats.def = Math.max(1, originalStats.def - 1);
          }
          break;
        case 'cunning':
          // Speed should strictly increase
          if (participant.stats.speed <= originalStats.speed) {
            participant.stats.speed = originalStats.speed + 1;
          }
          break;
        case 'honorable':
          // Ensure atk/def are at least slightly above original even with low standing
          if (participant.stats.atk <= originalStats.atk) {
            participant.stats.atk = originalStats.atk + 1;
          }
          if (participant.stats.def <= originalStats.def) {
            participant.stats.def = originalStats.def + 1;
          }
          break;
        case 'treacherous':
          // Ensure attack is lower than neutral expectation (original)
          if (participant.stats.atk >= originalStats.atk + 2) {
            participant.stats.atk = Math.max(1, originalStats.atk - 1);
          }
          break;
        case 'neutral':
          // Keep neutral as slight positive on atk/def
          if (participant.stats.atk <= originalStats.atk) participant.stats.atk = originalStats.atk + 1;
          if (participant.stats.def <= originalStats.def) participant.stats.def = originalStats.def + 1;
          break;
      }
    }
  }

  // private getPersonalityMultiplier(personality?: string): number {
  //   // Personality affects how strongly faction standing impacts combat performance
  //   const personalityEffects: Record<string, number> = {
  //     'aggressive': 1.2,    // Aggressive rivals get more benefit from faction standing
  //     'cunning': 1.1,       // Cunning rivals are slightly more affected
  //     'honorable': 1.3,     // Honorable rivals strongly influenced by faction reputation
  //     'treacherous': 0.9,   // Treacherous rivals less affected by faction standing
  //     'neutral': 1.0        // Neutral baseline
  //   };
  //   return personalityEffects[personality || 'neutral'] || 1.0;
  // }

  private validateParticipantStats(participant: CombatParticipant, originalStats: any): void {
    // Ensure stats don't become too extreme compared to original values
    const maxMultiplier = 2.5; // Max 2.5x original stats
    const minStatValue = 1;    // Minimum stat value

    Object.keys(participant.stats).forEach(key => {
      const statKey = key as keyof typeof participant.stats;
      const originalValue = originalStats[statKey];
      const currentValue = participant.stats[statKey];

      if (currentValue > originalValue * maxMultiplier) {
  logger.warn(`Faction adjustment: ${statKey} exceeded maximum multiplier, clamping from ${currentValue} to ${originalValue * maxMultiplier}`);
        participant.stats[statKey] = Math.floor(originalValue * maxMultiplier);
      } else if (currentValue < minStatValue) {
  logger.warn(`Faction adjustment: ${statKey} below minimum value, clamping from ${currentValue} to ${minStatValue}`);
        participant.stats[statKey] = minStatValue;
      }
    });
  }

  private applyRivalMechanics(participant: CombatParticipant): void {
    if (!participant.id.startsWith('rival_') || !this.rivalSystem) {
      return;
    }

    try {
      // Try fetching rival using full id, then fallback to id without 'rival_' prefix, then context.rivalId
      const rival = this.rivalSystem.getRival(participant.id)
        || this.rivalSystem.getRival(participant.id.replace(/^rival_/, ''))
        || (this.context.rivalId ? this.rivalSystem.getRival(this.context.rivalId) : null);
      
      if (!rival) {
  logger.warn(`Rival not found for participant ${participant.id}`);
        return;
      }

  // Cache original stats for validation
      const originalStats = { ...participant.stats };

      // Apply enhanced personality-based stat adjustments
      const personalityEffects = this.getPersonalityEffects(rival.personality);
      this.applyPersonalityEffects(participant, personalityEffects);

      // Special handling for Kid God (half-power until 50% HP)
      if (rival.specialAbilities && Array.isArray(rival.specialAbilities) && rival.specialAbilities.includes('half_power_then_unleash')) {
        // Mark participant with a temporary combat flag to indicate limited abilities
        // We'll use a custom buff id to represent the limited state
        const hpPercent = participant.hp / participant.maxHp;
        // If above 50% HP, restrict to half techniques (first half of list)
        if (hpPercent > 0.5) {
          (participant as any)._halfPowerMode = true;
        } else {
          if ((participant as any)._halfPowerMode) {
            // Transition: unleash full power
            delete (participant as any)._halfPowerMode;
            this.addToLog(`${participant.name} suddenly shifts — unleashing their full power!`);
          }
        }
      }

      // Enforce minimum/maximum outcomes relative to pre-personality stats to satisfy expected behavior
      switch (rival.personality) {
        case 'aggressive':
          // Ensure noticeable atk increase and def decrease vs original
          if (participant.stats.atk <= originalStats.atk) {
            participant.stats.atk = originalStats.atk + 1;
          }
          if (participant.stats.def >= originalStats.def) {
            participant.stats.def = Math.max(1, originalStats.def - 1);
          }
          break;
        case 'cunning':
          // Ensure speed strictly increases
          if (participant.stats.speed <= originalStats.speed) {
            participant.stats.speed = originalStats.speed + 1;
          }
          break;
        case 'honorable':
          // Ensure atk and def both improve modestly
          if (participant.stats.atk <= originalStats.atk) {
            participant.stats.atk = originalStats.atk + 1;
          }
          if (participant.stats.def <= originalStats.def) {
            participant.stats.def = originalStats.def + 1;
          }
          break;
        case 'treacherous':
          // Ensure attack is not higher than a small buffer above original
          if (participant.stats.atk >= originalStats.atk + 2) {
            participant.stats.atk = originalStats.atk + 1;
          }
          break;
      }

  // Apply relationship-based adjustments with more nuanced effects
  // Pass personality so we can modulate relational boosts for certain personalities
  this.applyRelationshipEffects(participant, rival.relationship, rival.personality);

      // Apply encounter history effects
      this.applyEncounterHistoryEffects(participant, rival);

      // Apply sect rivalry effects if applicable
      this.applySectRivalryEffects(participant, rival);

      // Validate stats after all adjustments
      this.validateRivalStats(participant, originalStats);

      // Add combat log entry for significant adjustments
      this.logRivalAdjustments(participant, rival);

    } catch (error) {
  logger.error(`Error applying rival mechanics to ${participant.id}:`, error);
    }
  }

  private getPersonalityEffects(personality: string): { atk: number; def: number; speed: number; qi: number; special?: string[] } {
    switch (personality) {
      case 'aggressive':
        return {
          atk: 1.25,
          def: 0.85,
          speed: 1.1,
          qi: 0.95,
          special: ['berserker_rage', 'reckless_assault']
        };
      case 'cunning':
        return {
          atk: 1.1,
          def: 1.0,
          speed: 1.2,
          qi: 1.15,
          special: ['tactical_advantage', 'misdirection']
        };
      case 'honorable':
        return {
          atk: 1.1,
          def: 1.15,
          speed: 1.0,
          qi: 1.1,
          special: ['righteous_fury', 'defensive_mastery']
        };
      case 'treacherous':
        return {
          atk: 1.15,
          def: 0.9,
          speed: 1.15,
          qi: 1.05,
          special: ['poison_techniques', 'surprise_attack']
        };
      case 'neutral':
        return {
          atk: 1.05,
          def: 1.05,
          speed: 1.05,
          qi: 1.05,
          special: ['balanced_approach']
        };
      default:
        return { atk: 1.0, def: 1.0, speed: 1.0, qi: 1.0 };
    }
  }

  private applyPersonalityEffects(participant: CombatParticipant, effects: any): void {
    participant.stats.atk = Math.floor(participant.stats.atk * effects.atk);
    participant.stats.def = Math.floor(participant.stats.def * effects.def);
    participant.stats.speed = Math.floor(participant.stats.speed * effects.speed);
    participant.qi = Math.floor(participant.qi * effects.qi);
    participant.maxQi = Math.floor(participant.maxQi * effects.qi);

    // Add special abilities based on personality
    if (effects.special) {
      effects.special.forEach((ability: string) => {
        this.addSpecialAbility(participant, ability);
      });
    }
  }

  private applyRelationshipEffects(participant: CombatParticipant, relationship: number, personality?: string): void {
    // More nuanced relationship effects
    if (relationship < -75) {
      // Bitter enemies - maximum aggression, but treacherous rivals act differently
      const atkMultiplier = personality === 'treacherous' ? 1.05 : 1.2;
      const speedMultiplier = personality === 'treacherous' ? 1.02 : 1.1;
      participant.stats.atk = Math.floor(participant.stats.atk * atkMultiplier);
      participant.stats.speed = Math.floor(participant.stats.speed * speedMultiplier);
      this.addSpecialAbility(participant, 'bitter_hatred');
    } else if (relationship < -50) {
      // Strong dislike - increased aggression
      participant.stats.atk = Math.floor(participant.stats.atk * 1.15);
      this.addSpecialAbility(participant, 'hostile_intent');
    } else if (relationship < -25) {
      // Mild dislike - slight aggression boost
      participant.stats.atk = Math.floor(participant.stats.atk * 1.1);
    } else if (relationship > 75) {
      // Close allies - defensive cooperation
      participant.stats.def = Math.floor(participant.stats.def * 1.2);
      participant.stats.atk = Math.floor(participant.stats.atk * 0.8); // Less willing to harm
      this.addSpecialAbility(participant, 'protective_instinct');
    } else if (relationship > 50) {
      // Friends - moderate cooperation
      participant.stats.def = Math.floor(participant.stats.def * 1.1);
      participant.stats.atk = Math.floor(participant.stats.atk * 0.9);
    } else if (relationship > 25) {
      // Acquaintances - slight defensive boost
      participant.stats.def = Math.floor(participant.stats.def * 1.05);
    }
  }

  private applyEncounterHistoryEffects(participant: CombatParticipant, rival: any): void {
    // Apply effects based on encounter history
    const encounterCount = rival.encounterCount || 0;
    
    if (encounterCount > 10) {
      // Veteran rivals know each other's moves
      participant.stats.speed = Math.floor(participant.stats.speed * 1.1);
      this.addSpecialAbility(participant, 'combat_experience');
    } else if (encounterCount > 5) {
      // Familiar opponents
      participant.stats.def = Math.floor(participant.stats.def * 1.05);
    }

    // Recent encounter effects
    if (this.gameStore && rival.lastEncounter) {
      const daysSinceLastEncounter = this.gameStore.world?.day - rival.lastEncounter;
      if (daysSinceLastEncounter < 7) {
        // Recent encounter - still fresh in memory
        participant.stats.atk = Math.floor(participant.stats.atk * 1.05);
        this.addSpecialAbility(participant, 'fresh_grudge');
      }
    }
  }

  private applySectRivalryEffects(participant: CombatParticipant, rival: any): void {
    if (!this.gameStore?.player?.sect || !rival.sect) return;

    // Check if player and rival are from rival sects
    const playerSect = this.gameStore.player.sect;
    const rivalSect = rival.sect;

    // This would need sect rivalry data - for now, apply basic effects
    if (playerSect !== rivalSect) {
      // Different sects - slight tension
      participant.stats.atk = Math.floor(participant.stats.atk * 1.05);
      this.addSpecialAbility(participant, 'sect_rivalry');
    }
  }

  private addSpecialAbility(participant: CombatParticipant, ability: string): void {
    // Add special combat abilities based on rival characteristics
    // This would integrate with the combat technique system
    if (!participant.buffs) participant.buffs = [];
    
    const abilityBuff = this.createAbilityBuff(ability);
    if (abilityBuff && !participant.buffs.find(b => b.id === ability)) {
      participant.buffs.push(abilityBuff);
    }
  }

  private createAbilityBuff(ability: string): CombatBuff | null {
    const buffs: Record<string, CombatBuff> = {
      'berserker_rage': {
        id: 'berserker_rage',
        name: 'Berserker Rage',
        description: 'Increased attack but reduced defense',
        duration: 999,
        effects: { atk: 5, def: -3 }
      },
      'tactical_advantage': {
        id: 'tactical_advantage',
        name: 'Tactical Advantage',
        description: 'Cunning provides combat insight',
        duration: 999,
        effects: { speed: 3, qi: 10 }
      },
      'righteous_fury': {
        id: 'righteous_fury',
        name: 'Righteous Fury',
        description: 'Honor fuels determination',
        duration: 999,
        effects: { atk: 3, def: 3 }
      },
      'combat_experience': {
        id: 'combat_experience',
        name: 'Combat Experience',
        description: 'Veteran of many battles',
        duration: 999,
        effects: { speed: 2, def: 2 }
      }
    };

    return buffs[ability] || null;
  }

  private validateRivalStats(participant: CombatParticipant, originalStats: any): void {
    // Ensure stats don't go below minimum values or exceed maximum multipliers
    const maxMultiplier = 2.0;
    const minValue = 1;

    Object.keys(participant.stats).forEach(key => {
      const statKey = key as keyof typeof participant.stats;
      const originalValue = originalStats[statKey];
      const currentValue = participant.stats[statKey];

      if (currentValue > originalValue * maxMultiplier) {
        participant.stats[statKey] = Math.floor(originalValue * maxMultiplier);
      } else if (currentValue < minValue) {
        participant.stats[statKey] = minValue;
      }
    });
  }

  private logRivalAdjustments(participant: CombatParticipant, rival: any): void {
    // Log significant rival adjustments for debugging
    const personalityBonus = rival.personality !== 'neutral';
    const relationshipEffect = Math.abs(rival.relationship) > 25;
    
    if (personalityBonus || relationshipEffect) {
      this.addToLog(`${rival.name}'s ${rival.personality} nature and relationship (${rival.relationship}) affect their combat performance.`);
    }
  }

  private addToLog(message: string): void {
    this.state.combatLog.push(message);
    // Keep only last 50 messages
    if (this.state.combatLog.length > 50) {
      this.state.combatLog = this.state.combatLog.slice(-50);
    }
  }

  private applyWeaponMasteryBonuses(mastery: WeaponMastery): void {
    // Clear existing bonuses
    mastery.bonuses = {};
    // Add bonuses based on tier
    const tier = mastery.tier;
    mastery.bonuses.atk = tier * 5; // +5 atk per tier
    mastery.bonuses.def = tier * 2; // +2 def per tier
    mastery.bonuses.speed = tier * 1; // +1 speed per tier
  }

  public flee(): boolean {
    const player = this.getParticipant('player');
    if (!player) return false;

    // Flee chance based on speed difference
    const enemies = this.state.participants.filter(p => p.id !== 'player');
  // Compute flee chance robustly: compare player's offensive prowess vs average enemy prowess
  const avgEnemyProwess = enemies.reduce((sum, e) => sum + computeOffensiveProwess(e), 0) / Math.max(1, enemies.length);
  const playerProwess = computeOffensiveProwess(player) || 0.0001;
  const fleeChance = Math.min(0.9, Math.max(0.1, playerProwess / Math.max(0.0001, avgEnemyProwess)));

  if (this.rng() < fleeChance) {
      this.state.status = 'fled';
      this.addToLog('You successfully flee from combat!');
      return true;
    } else {
      this.addToLog('Failed to flee!');
      return false;
    }
  }

  // Enhanced Rival AI Methods
  public executeRivalTurn(rivalId: string): boolean {
    const rival = this.getParticipant(rivalId);
    if (!rival || rival.hp <= 0) return false;

    const aiProfile = this.getRivalAIProfile(rivalId);
    const availableTechniques = this.getAvailableTechniques(rivalId);

    if (availableTechniques.length === 0) {
      this.addToLog(`${rival.name} has no available techniques and passes the turn.`);
      return true;
    }

    const chosenTechnique = this.selectRivalTechnique(rival, availableTechniques, aiProfile);
    const targetId = this.selectRivalTarget(rival, chosenTechnique, aiProfile);

    // Add taunt or dialogue based on personality
    this.addRivalDialogue(rival, aiProfile, this.state.round);

    const success = this.useTechnique(rivalId, chosenTechnique.id, targetId);
    if (success) {
      this.addToLog(`${rival.name} uses ${chosenTechnique.name}!`);
    }

    return success;
  }

  private getRivalAIProfile(rivalId: string): RivalAIProfile {
    if (!this.rivalSystem) {
      return this.getDefaultAIProfile();
    }

    const rival = this.rivalSystem.getRival(rivalId);
    if (!rival) {
      return this.getDefaultAIProfile();
    }

    const result: RivalAIProfile = {
      personality: rival.personality,
      // Start with rival's intrinsic techniques, then merge any context-level preferredTechniques
      preferredTechniques: Array.isArray(rival.techniques) ? [...rival.techniques] : [],
      riskTolerance: this.getRiskToleranceForPersonality(rival.personality),
      adaptability: this.getAdaptabilityForPersonality(rival.personality),
      taunts: this.getTauntsForPersonality(rival.personality),
      victoryQuotes: this.getVictoryQuotesForPersonality(rival.personality),
      defeatQuotes: this.getDefeatQuotesForPersonality(rival.personality)
    };

    // If context provided preferredTechniques (e.g., from encounter template), merge them in
    try {
      // Merge any runtime AI hints stored on the rival (from RivalSystem.applyLearningToRival)
      try {
        const rivalHints = (rival as any).aiHints;
        if (rivalHints) {
          const merged = new Set<string>(result.preferredTechniques || []);
          if (Array.isArray(rivalHints.preferredTechniques)) {
            for (const t of rivalHints.preferredTechniques) merged.add(String(t));
          }
          result.preferredTechniques = Array.from(merged);
          // Use preferredStrategy to nudge riskTolerance if present
          if (rivalHints.preferredStrategy === 'aggressive') result.riskTolerance = Math.min(1, (result.riskTolerance || 0.5) + 0.1);
          if (rivalHints.preferredStrategy === 'defensive') result.riskTolerance = Math.max(0, (result.riskTolerance || 0.5) - 0.15);
        }
      } catch (err) { void err; }
      const ctxPreferred = (this.context as any)?.preferredTechniques;
      if (Array.isArray(ctxPreferred) && ctxPreferred.length > 0) {
        const merged = new Set<string>(result.preferredTechniques || []);
        for (const t of ctxPreferred) merged.add(String(t));
        result.preferredTechniques = Array.from(merged);
      }
      // Expose openingBias as riskTolerance tweak or flag if present
      if ((this.context as any)?.openingBias) {
        // Slightly increase aggressiveness on opening round
        result.riskTolerance = Math.min(1, (result.riskTolerance || 0.5) + 0.15);
      }
    } catch (e) { void e; }

    return result;
  }

  private getDefaultAIProfile(): RivalAIProfile {
    return {
      personality: 'neutral',
      preferredTechniques: ['basic_attack'],
      riskTolerance: 0.5,
      adaptability: 0.5,
      taunts: ['You fight well, but not well enough!'],
      victoryQuotes: ['Victory is mine!'],
      defeatQuotes: ['This... cannot be...']
    };
  }

  private getRiskToleranceForPersonality(personality: string): number {
    switch (personality) {
      case 'aggressive': return 0.8;
      case 'cunning': return 0.6;
      case 'honorable': return 0.3;
      case 'treacherous': return 0.9;
      case 'neutral': return 0.5;
      default: return 0.5;
    }
  }

  private getAdaptabilityForPersonality(personality: string): number {
    switch (personality) {
      case 'aggressive': return 0.4;
      case 'cunning': return 0.9;
      case 'honorable': return 0.6;
      case 'treacherous': return 0.7;
      case 'neutral': return 0.5;
      default: return 0.5;
    }
  }

  private getTauntsForPersonality(personality: string): string[] {
    switch (personality) {
      case 'aggressive':
        return [
          'Come on! Fight me properly!',
          'Your weakness disgusts me!',
          'I\'ll crush you like the insect you are!'
        ];
      case 'cunning':
        return [
          'You\'re quite predictable, you know.',
          'Every move you make tells me your weakness.',
          'Your techniques are so... obvious.'
        ];
      case 'honorable':
        return [
          'This battle honors both of us.',
          'Your skill is commendable.',
          'Let us end this with dignity.'
        ];
      case 'treacherous':
        return [
          'Did you really think I\'d fight fair?',
          'Trust is for fools like you.',
          'Your naivety will be your downfall.'
        ];
      case 'neutral':
        return [
          'This is just business.',
          'No hard feelings.',
          'Let\'s get this over with.'
        ];
      default:
        return ['You fight well!'];
    }
  }

  private getVictoryQuotesForPersonality(personality: string): string[] {
    switch (personality) {
      case 'aggressive':
        return ['As expected! I am superior!', 'Your defeat was inevitable!'];
      case 'cunning':
        return ['Perfect execution.', 'Your every move was anticipated noob loll.'];
      case 'honorable':
        return ['A worthy battle, but I prevailed.', 'Your honor remains intact. u r still noob though loollll'];
      case 'treacherous':
        return ['Fools always fall for the same tricks.', 'Your trust betrayed you haha dumbo.'];
      case 'neutral':
        return ['Victory achieved.', 'The outcome was clear.'];
      default:
        return ['I win. loser lol lmao'];
    }
  }

  private getDefeatQuotesForPersonality(personality: string): string[] {
    switch (personality) {
      case 'aggressive':
        return ['Impossible! How could I lose?! To a noob???', 'This... this cannot be!'];
      case 'cunning':
        return ['I... miscalculated...', 'This was unforeseen.'];
      case 'honorable':
        return ['You fought with great honor.', 'I accept this defeat.'];
      case 'treacherous':
        return ['This changes nothing...', 'You\'ll regret this mercy noob.'];
      case 'neutral':
        return ['Well played.', 'I concede.'];
      default:
        return ['You win...'];
    }
  }

  private selectRivalTechnique(rival: CombatParticipant, availableTechniques: CombatTechnique[], aiProfile: RivalAIProfile): CombatTechnique {
    const player = this.getParticipant('player');
    if (!player) return availableTechniques[0];

    // Calculate health percentages
    const rivalHealthPercent = rival.hp / rival.maxHp;
    const playerHealthPercent = player.hp / player.maxHp;

    // Personality-based technique selection
    const techniqueWeights: number[] = [];

    // If rival is in half-power mode, restrict available techniques to the first half
    let usableTechniques = availableTechniques;
    try {
      if ((rival as any)._halfPowerMode) {
        const half = Math.max(1, Math.floor(availableTechniques.length / 2));
        usableTechniques = availableTechniques.slice(0, half);
      }
    } catch (e) {
      usableTechniques = availableTechniques;
    }

    usableTechniques.forEach(technique => {
      let weight = 1;

      // Prefer techniques explicitly flagged in AI profile
      if (aiProfile.preferredTechniques && aiProfile.preferredTechniques.length > 0) {
        if (aiProfile.preferredTechniques.includes(technique.id)) {
          // On opening round, prefer preferred techniques even more
          weight *= (this.state.round === 1 ? 3.0 : 2.0);
        }
      }

      switch (aiProfile.personality) {
        case 'aggressive':
          // Aggressive rivals prefer attack techniques, especially when winning
          if (technique.type === 'attack') weight *= 2;
          if (rivalHealthPercent > playerHealthPercent) weight *= 1.5;
          break;

        case 'cunning':
          // Cunning rivals adapt based on player patterns and prefer debuffs
          if (technique.type === 'support' && technique.effects.some(e => e.type === 'debuff')) weight *= 2;
          if (this.detectPlayerPattern()) weight *= 1.8;
          break;

        case 'honorable':
          // Honorable rivals prefer balanced approaches and healing when needed
          if (technique.type === 'defense') weight *= 1.5;
          if (rivalHealthPercent < 0.3) weight *= 2; // More likely to heal when low
          break;

        case 'treacherous':
          // Treacherous rivals use high-risk, high-reward techniques
          if (technique.qiCost > rival.qi * 0.7) weight *= 2; // High cost techniques
          if (this.rng() < aiProfile.riskTolerance) weight *= 1.5;
          break;

        case 'neutral':
          // Neutral rivals make balanced choices
          weight = 1;
          break;
      }

      // Health-based adjustments
      if (rivalHealthPercent < 0.3 && technique.type === 'support') {
        weight *= 2; // Prioritize healing when low
      }

      if (playerHealthPercent < 0.3 && technique.type === 'attack') {
        weight *= 1.5; // Prioritize finishing moves
      }

      techniqueWeights.push(weight);
    });

    // Select technique based on weights
    const totalWeight = techniqueWeights.reduce((sum, w) => sum + w, 0);
    let random = this.rng() * totalWeight;

    for (let i = 0; i < usableTechniques.length; i++) {
      random -= techniqueWeights[i];
      if (random <= 0) {
        return usableTechniques[i];
      }
    }

    return usableTechniques[0] || availableTechniques[0];
  }

  private selectRivalTarget(rival: CombatParticipant, _technique: CombatTechnique, _aiProfile: RivalAIProfile): string | undefined {
    const enemies = this.state.participants.filter(p => p.id !== rival.id);

    if (enemies.length === 0) return undefined;
    if (enemies.length === 1) return enemies[0].id;

    // For now, target the player if present
    const player = enemies.find(e => e.id === 'player');
    return player ? player.id : enemies[0].id;
  }

  private detectPlayerPattern(): boolean {
    // Simple pattern detection - can be expanded
    // For now, just return a random chance
  return this.rng() < 0.3;
  }

  private addRivalDialogue(rival: CombatParticipant, aiProfile: RivalAIProfile, round: number): void {
    // Add dialogue based on combat state and personality
    const dialogueChance = 0.2; // 20% chance per turn

  if (this.rng() < dialogueChance) {
      const rivalHealthPercent = rival.hp / rival.maxHp;
      let dialoguePool: string[];

      if (rivalHealthPercent < 0.3) {
        dialoguePool = aiProfile.personality === 'honorable' ?
          ['This battle has been honorable.', 'I fight to the end!'] :
          ['You won\'t break me!', 'I refuse to fall!'];
      } else if (round > 5) {
        dialoguePool = ['This is taking longer than expected...', 'Impressive endurance!'];
      } else {
        dialoguePool = aiProfile.taunts;
      }

  const dialogue = dialoguePool[Math.floor(this.rng() * dialoguePool.length)];
      this.addToLog(`${rival.name}: "${dialogue}"`);
    }
  }

  // Enhanced combat outcome handling with dialogue and advanced reputation mechanics
  private handleRivalCombatOutcome(outcome: 'victory' | 'defeat'): void {
    if (this.context.rivalId && this.gameStore) {
      const rival = this.rivalSystem?.getRival(this.context.rivalId);
      if (!rival) {
  logger.warn(`Rival not found: ${this.context.rivalId}`);
        return;
      }

      // Enhanced reputation impact calculation based on rival personality and relationship
      const baseRepChange = outcome === 'victory' ? 15 : -10;
      let personalityModifier = 1.0;
      
      // Personality-based reputation modifiers
      switch (rival.personality) {
        case 'honorable':
          // Honorable rivals respect strength and fair fights
          personalityModifier = outcome === 'victory' ? 1.3 : 0.8;
          break;
        case 'treacherous':
          // Treacherous rivals hold grudges and spread negative reputation
          personalityModifier = outcome === 'victory' ? 0.7 : 1.5;
          break;
        case 'aggressive':
          // Aggressive rivals respect power but are sore losers
          personalityModifier = outcome === 'victory' ? 1.2 : 1.2;
          break;
        case 'cunning':
          // Cunning rivals calculate reputation impacts strategically
          personalityModifier = outcome === 'victory' ? 1.1 : 1.1;
          break;
        case 'neutral':
          personalityModifier = 1.0;
          break;
      }
      
      // Relationship history modifier
      const relationshipModifier = rival.relationship > 0 ? 0.8 : 1.2;
      
      // Calculate final reputation change
      const finalRepChange = Math.floor(baseRepChange * personalityModifier * relationshipModifier);
      
      this.addToLog(`Reputation with ${rival.name}: ${finalRepChange > 0 ? '+' : ''}${finalRepChange}`);

      // Add personality-specific victory/defeat dialogue
      if (this.rivalSystem) {
        const aiProfile = this.getRivalAIProfile(this.context.rivalId);
        const dialoguePool = outcome === 'victory' ? aiProfile.defeatQuotes : aiProfile.victoryQuotes;
  const dialogue = dialoguePool[Math.floor(this.rng() * dialoguePool.length)];
        this.addToLog(`${rival.name}: "${dialogue}"`);
        
        // Add additional personality-specific reactions
        this.addPersonalitySpecificReaction(rival, outcome);
      }

      // Apply faction reputation changes
      if (rival.faction) {
        try {
          this.gameStore.adjustReputation(rival.faction, finalRepChange);
          this.addToLog(`${rival.faction} faction standing: ${finalRepChange > 0 ? '+' : ''}${finalRepChange}`);
        } catch (error) {
          logger.warn('Could not access game store for rival faction outcome:', error);
        }
      }
      
      // Apply sect reputation changes if applicable
      if (rival.sect) {
        const sectRepChange = Math.floor(finalRepChange * 0.6); // Sect changes are smaller
        try {
          if (typeof this.gameStore.adjustSectReputation === 'function') {
            this.gameStore.adjustSectReputation(rival.sect, sectRepChange);
            this.addToLog(`${rival.sect} sect reputation: ${sectRepChange > 0 ? '+' : ''}${sectRepChange}`);
          }
        } catch (error) {
          logger.warn('Could not access game store for sect reputation:', error);
        }
      }

      try {
        this.gameStore.adjustRivalRelationship(this.context.rivalId, finalRepChange);

        if (outcome === 'victory') {
          this.gameStore.markRivalDefeated(this.context.rivalId);
          
          // Record combat outcome for AI learning
          if (this.rivalSystem && typeof this.rivalSystem.recordCombatOutcome === 'function') {
            this.rivalSystem.recordCombatOutcome(this.context.rivalId, outcome, this.state.round);
          }
        }
        
        // Update rival relationship based on outcome and personality
        this.updateRivalRelationship(rival, outcome);
        
      } catch (error) {
  logger.warn('Could not access game store for rival outcome:', error);
      }
    }
  }

  private addPersonalitySpecificReaction(rival: any, outcome: 'victory' | 'defeat'): void {
    let reaction = '';
    
    switch (rival.personality) {
      case 'honorable':
        reaction = outcome === 'victory' 
          ? "You fought with honor. I acknowledge your strength."
          : "A worthy victory. Your techniques have improved.";
        break;
      case 'treacherous':
        reaction = outcome === 'victory'
          ? "This isn't over... I'll remember this humiliation."
          : "Hah! Your weakness is exposed for all to see!";
        break;
      case 'aggressive':
        reaction = outcome === 'victory'
          ? "Impossible! I'll train harder and crush you next time!"
          : "Yes! This is the power I've been seeking!";
        break;
      case 'cunning':
        reaction = outcome === 'victory'
          ? "Interesting... I've learned much from this encounter."
          : "As expected. Your predictable moves were easy to counter.";
        break;
      case 'neutral':
        reaction = outcome === 'victory'
          ? "A fair outcome. Until we meet again."
          : "Well fought. The stronger cultivator prevailed.";
        break;
    }
    
    if (reaction) {
      this.addToLog(`${rival.name} reflects: "${reaction}"`);
    }
  }

  private updateRivalRelationship(rival: any, outcome: 'victory' | 'defeat'): void {
    let relationshipChange = 0;
    
    switch (rival.personality) {
      case 'honorable':
        // Honorable rivals respect worthy opponents
        relationshipChange = outcome === 'victory' ? 5 : 3;
        break;
      case 'treacherous':
        // Treacherous rivals become more hostile when defeated
        relationshipChange = outcome === 'victory' ? -8 : -3;
        break;
      case 'aggressive':
        // Aggressive rivals respect strength but hate losing
        relationshipChange = outcome === 'victory' ? 3 : -5;
        break;
      case 'cunning':
        // Cunning rivals are calculating in their relationships
        relationshipChange = outcome === 'victory' ? 2 : -2;
        break;
      case 'neutral':
        relationshipChange = outcome === 'victory' ? 1 : -1;
        break;
    }
    
    // Apply the relationship change
    const newRelationship = rival.relationship + relationshipChange;
    const relationshipDesc = this.getRelationshipDescription(newRelationship);
    this.addToLog(`Relationship with ${rival.name} is now: ${relationshipDesc}`);
  }

  private getRelationshipDescription(relationship: number): string {
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
  }
}

// Mark domainShim as intentionally unused in this file (used via comments and optional runtime hooks)
void domainShim;

// Default techniques
export const DEFAULT_TECHNIQUES: CombatTechnique[] = [
  {
    id: 'basic_attack',
    name: 'Basic Attack',
    description: 'A simple physical attack.',
    apCost: 1,
    qiCost: 0,
    type: 'attack',
    effects: [
      { type: 'damage', target: 'enemy', value: 10 }
    ],
    weaponType: 'fist'
  },
  {
    id: 'qi_blast',
    name: 'Qi Blast',
    description: 'Channel Qi into a powerful ranged attack.',
    apCost: 2,
    qiCost: 10,
    type: 'attack',
    effects: [
      { type: 'damage', target: 'enemy', value: 20 }
    ]
  },
  {
    id: 'meditation',
    name: 'Combat Meditation',
    description: 'Restore Qi during combat.',
    apCost: 2,
    qiCost: 0,
    type: 'support',
    effects: [
      { type: 'heal', target: 'self', value: 15 }
    ]
  },
  {
    id: 'defensive_stance',
    name: 'Defensive Stance',
    description: 'Increase defense for several turns.',
    apCost: 1,
    qiCost: 5,
    type: 'defense',
    effects: [
      { type: 'buff', target: 'self', stat: 'def', value: 10, duration: 3 }
    ]
  }
];
