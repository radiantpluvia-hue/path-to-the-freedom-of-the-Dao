import { PlayerState, Buff } from '../types';
import getPowerScale from '../utils/powerScale';

export class BuffSystem {
  public createBuff(
    sourceItem: any,
    name: string,
    effects: Record<string, any>,
    duration: number,
    durationType: 'ticks' | 'actions' | 'combat' = 'ticks'
  ): Buff {
    return {
      id: `${sourceItem.itemId}_${Date.now()}`,
      source: sourceItem.source || 'item',
      sourceId: sourceItem.itemId,
      name: sourceItem.name || name,
      description: sourceItem.description || `Provides a temporary effect.`,
      duration,
      initialDuration: duration,
      durationType,
      effects,
      appliedEffects: {}, // Initialize appliedEffects
      specialEffectId: sourceItem.uniqueProperties?.specialEffectId,
      appliedAt: 0, // This would be set by the game store
      appliedTick: 0,
      stackable: !!sourceItem.stackable,
      currentStacks: 1,
      isPermanent: duration < 0,
      category: 'stat',
    } as Buff;
  }

  public applyBuff(player: PlayerState, buff: Buff): PlayerState {
    const newPlayer = { ...player };
    const newBuff = { ...buff }; // Create a mutable copy of the buff

    const computePerStackDelta = (p: PlayerState, b: Buff): Record<string, number> => {
      const deltas: Record<string, number> = {};
      if (!b.effects?.stats) return deltas;
      let scale = 1;
      try { scale = getPowerScale(p as any, (p as any)?.world || undefined).buffScale || 1; } catch { scale = 1; }
      for (const [stat, value] of Object.entries(b.effects.stats as Record<string, any>)) {
        let bonus = 0;
        if (typeof value === 'number') {
          bonus = value * scale;
        } else if (typeof value === 'object' && value.percent) {
          const baseStat = (p.baseStats as any)[stat] || 0;
          bonus = Math.floor(baseStat * value.percent * scale);
        }
        if (bonus !== 0) deltas[stat] = bonus;
      }
      return deltas;
    };

    // If this buff is stackable and there is an existing instance from the same source, merge as a stack
    const existingIndex = (newPlayer.activeBuffs || []).findIndex(b => b.sourceId === newBuff.sourceId && b.name === (newBuff.name || b.name));
    if (newBuff.stackable && existingIndex >= 0) {
      const existing = { ...newPlayer.activeBuffs[existingIndex] } as Buff;
      const maxStacks = existing.maxStacks ?? newBuff.maxStacks ?? 99;
      if ((existing.currentStacks ?? 1) < maxStacks) {
        // Increment stack and apply an additional delta
        const perStack = computePerStackDelta(newPlayer, existing);
        newPlayer.stats = { ...newPlayer.stats };
        for (const [stat, delta] of Object.entries(perStack)) {
          (newPlayer.stats as any)[stat] = ((newPlayer.stats as any)[stat] || 0) + delta;
        }
        existing.currentStacks = (existing.currentStacks ?? 1) + 1;
        existing.appliedEffects = existing.appliedEffects || {};
        (existing.appliedEffects as any).stats = {
          ...((existing.appliedEffects as any).stats || {}),
        };
        for (const [stat, delta] of Object.entries(perStack)) {
          (existing.appliedEffects as any).stats[stat] = (((existing.appliedEffects as any).stats[stat] || 0) + delta);
        }
        const updatedBuffs = [...(newPlayer.activeBuffs || [])];
        updatedBuffs[existingIndex] = existing;
        newPlayer.activeBuffs = updatedBuffs as any;
      }
      return newPlayer;
    }

    // Otherwise, apply as a new buff instance
    newPlayer.activeBuffs = [...(newPlayer.activeBuffs || []), newBuff];
    if (newBuff.effects?.stats) {
      newPlayer.stats = { ...newPlayer.stats };
      const ae = { ...(newBuff.appliedEffects || {}) } as any;
      ae.stats = ae.stats || {};
      const perStack = computePerStackDelta(newPlayer, newBuff);
      for (const [stat, delta] of Object.entries(perStack)) {
        (newPlayer.stats as any)[stat] = ((newPlayer.stats as any)[stat] || 0) + delta;
        ae.stats[stat] = delta; // record per-stack delta
      }
      newBuff.appliedEffects = ae;
    }
    return newPlayer;
  }

  public revertBuffs(player: PlayerState, buffsToRevert: Buff[]): PlayerState {
    if (buffsToRevert.length === 0) {
      return player;
    }

    const newPlayer = { ...player };
    newPlayer.stats = { ...newPlayer.stats };

    for (const buff of buffsToRevert) {
      console.log(`Reverting buff: ${buff.name}`);
      // Revert stat changes
      if (buff.appliedEffects?.stats) {
        for (const [stat, value] of Object.entries(buff.appliedEffects.stats as Record<string, number>)) {
          (newPlayer.stats as any)[stat] = Math.max(1, ((newPlayer.stats as any)[stat] || 0) - value);
        }
      }
    }

    return newPlayer;
  }

  public addStack(player: PlayerState, buff: Buff): PlayerState {
    if (!buff.stackable) return player;
    const newPlayer = { ...player };
    const idx = (newPlayer.activeBuffs || []).findIndex(b => b === buff || b.id === buff.id);
    if (idx < 0) return player;
    const target = { ...newPlayer.activeBuffs[idx] } as Buff;
    const maxStacks = target.maxStacks ?? 99;
    if ((target.currentStacks ?? 1) >= maxStacks) return player;
    // compute per-stack delta and apply
    const deltas: Record<string, number> = {};
    if (target.effects?.stats) {
      for (const [stat, value] of Object.entries(target.effects.stats as Record<string, any>)) {
        let bonus = 0;
        if (typeof value === 'number') bonus = value;
        else if (typeof value === 'object' && value.percent) {
          const base = (newPlayer.baseStats as any)[stat] || 0;
          bonus = Math.floor(base * value.percent);
        }
        if (bonus !== 0) deltas[stat] = bonus;
      }
    }
    newPlayer.stats = { ...newPlayer.stats };
    for (const [s, d] of Object.entries(deltas)) {
      (newPlayer.stats as any)[s] = ((newPlayer.stats as any)[s] || 0) + d;
    }
    target.currentStacks = (target.currentStacks ?? 1) + 1;
    target.appliedEffects = target.appliedEffects || {};
    (target.appliedEffects as any).stats = { ...((target.appliedEffects as any).stats || {}) };
    for (const [s, d] of Object.entries(deltas)) {
      (target.appliedEffects as any).stats[s] = (((target.appliedEffects as any).stats[s] || 0) + d);
    }
    const arr = [...(newPlayer.activeBuffs || [])];
    arr[idx] = target;
    newPlayer.activeBuffs = arr as any;
    return newPlayer;
  }

  public removeStack(player: PlayerState, buff: Buff): PlayerState {
    if (!buff.stackable) return player;
    const newPlayer = { ...player };
    const idx = (newPlayer.activeBuffs || []).findIndex(b => b === buff || b.id === buff.id);
    if (idx < 0) return player;
    const target = { ...newPlayer.activeBuffs[idx] } as Buff;
    const current = target.currentStacks ?? 1;
    if (current <= 1) {
      // removing last stack => fully revert and remove
      const reverted = this.revertBuffs(newPlayer, [target]);
      const arr = [...(reverted.activeBuffs || [])];
      arr.splice(idx, 1);
      reverted.activeBuffs = arr as any;
      return reverted;
    }
    // revert one stack worth of effects
    const perStack: Record<string, number> = {};
    if (target.effects?.stats) {
      for (const [stat, value] of Object.entries(target.effects.stats as Record<string, any>)) {
        let bonus = 0;
        if (typeof value === 'number') bonus = value;
        else if (typeof value === 'object' && value.percent) {
          const base = (newPlayer.baseStats as any)[stat] || 0;
          bonus = Math.floor(base * value.percent);
        }
        if (bonus !== 0) perStack[stat] = bonus;
      }
    }
    newPlayer.stats = { ...newPlayer.stats };
    for (const [s, d] of Object.entries(perStack)) {
      (newPlayer.stats as any)[s] = Math.max(1, ((newPlayer.stats as any)[s] || 0) - d);
    }
    target.currentStacks = current - 1;
    // reduce recorded appliedEffects total
    target.appliedEffects = target.appliedEffects || {};
    (target.appliedEffects as any).stats = { ...((target.appliedEffects as any).stats || {}) };
    for (const [s, d] of Object.entries(perStack)) {
      (target.appliedEffects as any).stats[s] = Math.max(0, (((target.appliedEffects as any).stats[s] || 0) - d));
    }
    const arr = [...(newPlayer.activeBuffs || [])];
    arr[idx] = target;
    newPlayer.activeBuffs = arr as any;
    return newPlayer;
  }

  public processBuffsOnTick(player: PlayerState): PlayerState {
    const newPlayer = { ...player };
    let updated = { ...newPlayer };
    const remaining: Buff[] = [];
    for (const buff of (newPlayer.activeBuffs || [])) {
      if (buff.isPermanent) {
        remaining.push(buff);
        continue;
      }
      if (buff.durationType === 'ticks') {
        const next = { ...buff, duration: (buff.duration || 0) - 1 } as Buff;
        if ((next.duration || 0) <= 0) {
          // expire and revert
          updated = this.revertBuffs(updated, [next]);
          continue;
        }
        remaining.push(next);
      } else {
        remaining.push(buff);
      }
    }
    (updated as any).activeBuffs = remaining as any;
    return updated;
  }

  public processBuffsOnAction(player: PlayerState): PlayerState {
    const newPlayer = { ...player };
    let updated = { ...newPlayer };
    const remaining: Buff[] = [];
    for (const buff of (newPlayer.activeBuffs || [])) {
      if (buff.isPermanent) {
        remaining.push(buff);
        continue;
      }
      if (buff.durationType === 'actions') {
        const next = { ...buff, duration: (buff.duration || 0) - 1 } as Buff;
        if ((next.duration || 0) <= 0) {
          updated = this.revertBuffs(updated, [next]);
          continue;
        }
        remaining.push(next);
      } else {
        remaining.push(buff);
      }
    }
    (updated as any).activeBuffs = remaining as any;
    return updated;
  }

  public processBuffsOnCombatEnd(player: PlayerState): PlayerState {
    const newPlayer = { ...player };
    let updated = { ...newPlayer };
    const remaining: Buff[] = [];
    for (const buff of (newPlayer.activeBuffs || [])) {
      if (buff.durationType === 'combat') {
        updated = this.revertBuffs(updated, [buff]);
        continue;
      }
      remaining.push(buff);
    }
    (updated as any).activeBuffs = remaining as any;
    return updated;
  }
}