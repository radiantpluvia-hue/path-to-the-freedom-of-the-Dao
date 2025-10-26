// File: src/hooks/combatHook.ts
import { onEntityDefeated } from '../managers/HeavenlyRankingManager';

/**
 * Call this function when a combat finishes and the defeated entity id and attacker object are available.
 * Example usage from your combat resolution:
 *
 *   import { handleCombatEnd } from 'src/hooks/combatHook';
 *   handleCombatEnd(defeatedId, attacker);
 *
 */
export function handleCombatEnd(defeatedId: string, attackerEntity: any) {
  try {
    const replaced = onEntityDefeated(defeatedId, attackerEntity);
    if (replaced) {
      // optionally add local notifications or event entries
      // e.g., EventPool.push({ type: 'HEAVENLY_REPLACEMENT', data: {...} });
    }
  } catch (err) {
    console.error('Heavenly ranking combat hook error', err);
  }
}
