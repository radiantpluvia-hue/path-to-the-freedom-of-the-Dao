import { NarrativeEngine, HeavenlyDaoInsight, PlayerState } from '../types';
import { Registry } from '../data/registry';
import { roll, getRng } from '../utils/rng';

export type TechniqueResult = {
  ok: boolean;
  message?: string;
  healed?: number;
  backlash?: number;
  cost?: number;
};

export class HeavenlyDaoSystem {
  private engine: NarrativeEngine;

  constructor(engine: NarrativeEngine) {
    this.engine = engine;
  }

  /**
   * Apply a named Dao technique to a player. This is intentionally conservative and
   * data-driven: techniques are looked up from the `daos` registry when available
   * and fallback to safe defaults when not present.
   */
  public applyTechnique(player: PlayerState, techniqueId: string, opts?: Record<string, any>): TechniqueResult {
    const daos = Registry.get('daos') || {};
    const daoReversal = daos['dao_reversal'] || {};

    switch ((techniqueId || '').toString()) {
      case 'reverse_pulse_sutra': {
        // heal a fraction of maxHp, with a backlash chance
        const healBase = Math.max(1, Math.floor((player.maxHp || 100) * 0.3));
        const successChance = 0.8; // base
        const r = roll(this.engine);
        if (r <= successChance) {
          const healed = Math.min(player.maxHp - (player.hp || 0), healBase);
          player.hp = Math.min(player.maxHp, (player.hp || 0) + healed);
          return { ok: true, message: 'Reverse Pulse Sutra succeeded', healed };
        } else {
          const backlash = Math.max(1, Math.floor((player.maxHp || 100) * 0.2));
          player.hp = Math.max(0, (player.hp || 0) - backlash);
          return { ok: false, message: 'Reverse Pulse backfired', backlash };
        }
      }

      case 'temporal_echo': {
        // temporal echo is expensive: consume a portion of daoHeart if present
        const cost = Math.max(1, Math.floor((player.daoHeart || 0) * 0.5));
        if ((player.daoHeart || 0) < 1) return { ok: false, message: 'Insufficient Dao Heart', cost: 0 };
        // consume cost
        player.daoHeart = Math.max(0, (player.daoHeart || 0) - cost);

        // Attempt a best-effort rewind of the most recent karma event
        const history = Array.isArray(this.engine.karmaHistory) ? this.engine.karmaHistory : [];
        // find most recent non-rewound moral event
        let targetIdx = -1;
        for (let i = history.length - 1; i >= 0; i--) {
          const ev = history[i] as any;
          if (!ev) continue;
          if (ev.rewound) continue;
          // prefer events that look like moral choices (good/evil/neutral) or have consequences
          if (ev.type === 'good' || ev.type === 'evil' || ev.type === 'neutral' || Array.isArray(ev.consequences)) { targetIdx = i; break; }
        }

        if (targetIdx === -1) {
          // fallback: grant a small comprehension bump if nothing to rewind
          player.daoComprehension = (player.daoComprehension || 0) + 1;
          return { ok: true, message: 'Temporal Echo: no recent moral event to rewind, granted insight instead', cost };
        }

        const target = history[targetIdx] as any;
        // mark as rewound so it cannot be used again
        target.rewound = true;

        // Reverse simple consequences where possible
        if (Array.isArray(target.consequences)) {
          for (const c of target.consequences) {
            try {
              switch (c.type) {
                case 'buff':
                  if (c.effect && c.effect.stats) {
                    player.stats = { ...(player.stats || {}) };
                    for (const [stat, val] of Object.entries(c.effect.stats)) {
                      if (typeof val === 'number') {
                        (player.stats as any)[stat] = ((player.stats as any)[stat] || 0) - (val as number);
                      }
                    }
                  }
                  break;

                case 'debuff':
                  if (c.effect && c.effect.stats) {
                    player.stats = { ...(player.stats || {}) };
                    for (const [stat, val] of Object.entries(c.effect.stats)) {
                      if (typeof val === 'number') {
                        (player.stats as any)[stat] = ((player.stats as any)[stat] || 0) + (val as number);
                      }
                    }
                  }
                  break;

                case 'event':
                case 'opportunity':
                case 'threat':
                default:
                  // best-effort: record a compensating insight instead of attempting to fully undo complex effects
                  this.engine.heavenlyDaoInsights = this.engine.heavenlyDaoInsights || [];
                  this.engine.heavenlyDaoInsights.push({
                    id: `temporal_echo_comp_${Date.now()}`,
                    description: `Temporal Echo compensated for event ${target.id || '[unknown]'}`,
                    comprehension: 0,
                    createdAt: Date.now()
                  } as any);
                  break;
              }
            } catch (e) {
              // ignore individual reversal errors
            }
          }
        }

        // Record an insight from the act of rewinding
        this.engine.heavenlyDaoInsights = this.engine.heavenlyDaoInsights || [];
        this.engine.heavenlyDaoInsights.push({
          id: `temporal_echo_${Date.now()}`,
          description: `Temporal Echo rewound event ${target.id || '[unknown]'}`,
          comprehension: 1,
          createdAt: Date.now()
        } as any);

        return { ok: true, message: `Temporal Echo rewound ${target.id || 'an event'}`, cost };
      }

      case 'still_flow_meditation': {
        // Apply a temporary buff to daoComprehension and reduce emotion recovery rate via a buff record
        player.daoComprehension = (player.daoComprehension || 0) + 5;
        // record a simple buff entry so other systems can read it
        const buff = {
          id: 'still_flow_meditation',
          name: 'Still Flow Meditation',
          description: 'Temporarily increases Dao Comprehension',
          duration: 10,
          durationType: 'ticks',
          effects: { daoComprehension: 5, emotionRecoveryMultiplier: 0.7 },
          source: 'dao',
          sourceId: 'still_flow_meditation',
          stackable: false,
          appliedAt: Date.now(),
          appliedTick: 0
        } as any;
        player.activeBuffs = player.activeBuffs || [];
        player.activeBuffs.push(buff);
        return { ok: true, message: 'Still Flow Meditation applied', cost: 0 };
      }

      default: {
        return { ok: false, message: `Unknown technique ${techniqueId}` };
      }
    }
  }

  public isTechniqueAvailable(techniqueId: string): boolean {
    const daos = Registry.get('daos') || {};
    // quick heuristic: check if any dao defines the technique key
    for (const k of Object.keys(daos)) {
      const dao = (daos as any)[k] || {};
      if (dao.techniques && Object.prototype.hasOwnProperty.call(dao.techniques, techniqueId)) return true;
      if (dao.techniques && Array.isArray(dao.techniques) && dao.techniques.find((t: any) => t.id === techniqueId)) return true;
    }
    return false;
  }

  public addInsight(insight: HeavenlyDaoInsight) {
    this.engine.heavenlyDaoInsights.push(insight);
  }

  public evaluateTribulationRisk(player: PlayerState): number {
    // Simple risk calc using karma and dao insights
    const base = Math.max(0, (player.karma || 0) * -0.001);
  const insightFactor = this.engine.heavenlyDaoInsights.reduce((s: number, i: any) => s + (i.comprehension || 0), 0) / Math.max(1, this.engine.heavenlyDaoInsights.length || 1);
    return Math.min(2, Math.max(0, base + (100 - insightFactor) * 0.01));
  }

  public triggerHeavenlyIntervention(player: PlayerState): string | null {
    const risk = this.evaluateTribulationRisk(player);
    if (risk > 1.2) {
      // simple intervention narrative
      return 'The Heavens tremble — a minor tribulation descends.';
    }
    return null;
  }
}

export default HeavenlyDaoSystem;
