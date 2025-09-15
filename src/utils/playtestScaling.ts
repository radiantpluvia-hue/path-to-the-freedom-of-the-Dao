// Playtest scaling helper: apply minimal, toggleable scaling to dynamic effects

export type PlaytestSource = 'event' | 'quest' | 'minigame' | 'faction_battle';

class PlaytestScalingHelper {
  private enabled = true;

  // Per-source minimal scale factors (50%)
  private FACTORS: Record<PlaytestSource, number> = {
    event: 0.5,
    quest: 0.5,
    minigame: 0.5,
    faction_battle: 0.5,
  };

  // Optional global combat power multiplier used for playtesting
  private combatPowerMultiplier: number = 1;

  setCombatPowerMultiplier(n: number) {
    if (isFinite(n) && n > 0) this.combatPowerMultiplier = n;
  }

  getCombatPowerMultiplier() {
    return this.combatPowerMultiplier;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value: boolean) {
    this.enabled = value;
  }

  setFactor(source: PlaytestSource, factor: number) {
    if (factor > 0 && isFinite(factor)) {
      this.FACTORS[source] = factor;
    }
  }

  private scaleInt(n: number, factor: number): number {
    if (!isFinite(n) || n === 0) return 0;
    const scaled = Math.round(n * factor);
    if (scaled === 0) return n > 0 ? 1 : -1; // ensure non-zero if original non-zero
    return scaled;
  }

  private clone<T>(obj: T): T {
    // Shallow clone primitives/arrays/objects; avoid JSON to keep methods out of scope
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(v => this.clone(v)) as unknown as T;
    const out: any = {};
    for (const [k, v] of Object.entries(obj as any)) {
      out[k] = this.clone(v as any);
    }
    return out as T;
  }

  // Apply conservative scaling to known effect shapes
  applyScaledEffects<T extends Record<string, any>>(effects: T, opts: { source: PlaytestSource }): T {
    if (!this.enabled || !effects) return effects;
    const factor = this.FACTORS[opts.source] ?? 1;
    if (factor === 1) return effects;

    const scaled = this.clone(effects);

    const scaleNumericProp = (obj: Record<string, any>, key: string) => {
      const val = obj[key];
      if (typeof val === 'number') {
        obj[key] = this.scaleInt(val, factor);
      }
    };

    const scaleNumberMap = (map?: Record<string, any>) => {
      if (!map || typeof map !== 'object') return;
      Object.keys(map).forEach(k => {
        if (typeof map[k] === 'number') {
          map[k] = this.scaleInt(map[k], factor);
        }
      });
    };

    // Common top-level fields in dynamic effects
    // - stats: Record<string, number>
    // - skills: Record<string, number>
    // - karma: number
    // - sectReputation: number
    // - reputation: number
    // - change: number (used by faction_standing/sect_reputation/rival_relationship effects)
    // - spiritStones: { low, mid, high }
    if (scaled.stats) scaleNumberMap(scaled.stats);
    if (scaled.skills) scaleNumberMap(scaled.skills);
    if (scaled.spiritStones && typeof scaled.spiritStones === 'object') {
      ['low', 'mid', 'high'].forEach(tier => {
        if (typeof scaled.spiritStones[tier] === 'number') {
          scaled.spiritStones[tier] = this.scaleInt(scaled.spiritStones[tier], factor);
        }
      });
    }

    ['karma', 'sectReputation', 'reputation', 'change'].forEach(k => scaleNumericProp(scaled, k));

    // Avoid scaling quantities/levels/exp-related counters
    // If the caller passed an arbitrary map, only scale known beneficial/penalty fields.

    return scaled;
  }
}

export const PlaytestScaling = new PlaytestScalingHelper();