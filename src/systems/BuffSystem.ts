import { PlayerState, Buff } from '../types';

export class BuffSystem {
  public createBuff(
    sourceItem: any,
    name: string,
    effects: Record<string, any>,
    duration: number,
    durationType: 'ticks' | 'actions' = 'ticks'
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
    newPlayer.activeBuffs = [...newPlayer.activeBuffs, newBuff];

    // Immediately apply stat changes
    if (newBuff.effects.stats) {
      newPlayer.stats = { ...newPlayer.stats };
      newBuff.appliedEffects = { ...newBuff.appliedEffects, stats: {} };

      for (const [stat, value] of Object.entries(newBuff.effects.stats as Record<string, any>)) {
        let bonus = 0;
        if (typeof value === 'number') { // Flat bonus
          bonus = value;
        } else if (typeof value === 'object' && value.percent) { // Percent bonus
          const baseStat = (newPlayer.baseStats as any)[stat] || 0;
          bonus = Math.floor(baseStat * value.percent);
        }

        if (bonus !== 0) {
          (newPlayer.stats as any)[stat] = ((newPlayer.stats as any)[stat] || 0) + bonus;
          (newBuff.appliedEffects.stats as any)[stat] = bonus; // Store the exact amount applied
        }
      }
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
}