import { GameState, EventChoice } from './src/types';

/**
 * Applies the effects of an event choice to a player state.
 * This is a pure function and does not mutate the original state.
 * @param player The current player state.
 * @param effects The effects object from the chosen event choice.
 * @returns An object containing the new player state and a narrative string.
 */
export function applyEventEffects(
  player: GameState['player'],
  effects: EventChoice['effects']
): { newPlayerState: GameState['player']; narrative: string } {
  const newPlayer = JSON.parse(JSON.stringify(player));
  const narrativeParts: string[] = [];

  for (const key in effects) {
    if (!Object.prototype.hasOwnProperty.call(effects, key)) continue;

    const value = effects[key];

    if (key === 'spiritStones' && typeof value === 'object' && value !== null) {
      const { low = 0, mid = 0, high = 0 } = value;
      newPlayer.spiritStones.low += low;
      newPlayer.spiritStones.mid += mid;
      newPlayer.spiritStones.high += high;
      if (low) narrativeParts.push(`${low > 0 ? 'Gained' : 'Lost'} ${Math.abs(low)} low-grade spirit stones.`);
    } else if (key === 'specialItem' && typeof value === 'string') {
      newPlayer.inventory.push({
        name: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: 'A mysterious item of unknown origin.',
        type: 'special',
      });
      narrativeParts.push(`You obtained a [${value.replace(/_/g, ' ')}].`);
    } else if (typeof (newPlayer as any)[key] === 'number') {
      (newPlayer as any)[key] += value;
      narrativeParts.push(`Your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value > 0 ? 'increased' : 'decreased'} by ${Math.abs(value)}.`);
    } else if (typeof newPlayer.stats[key] === 'number') {
      newPlayer.stats[key] += value;
      narrativeParts.push(`Your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value > 0 ? 'increased' : 'decreased'} by ${Math.abs(value)}.`);
    }
  }

  const narrative = narrativeParts.length > 0 ? narrativeParts.join(' ') : 'You ponder your choice, but nothing seems to happen.';

  return { newPlayerState: newPlayer, narrative };
}