export class DailyLoopSystem {
  static ONE_DAY_MS = 24 * 60 * 60 * 1000;

  /**
   * Return true if more than (or equal to) one day has passed since the timestamp.
   * If no timestamp is provided, treat it as a day having passed.
   */
  static hasDayPassed(lastTimestamp?: number | null): boolean {
    if (!lastTimestamp) return true;
    return Date.now() - lastTimestamp >= DailyLoopSystem.ONE_DAY_MS;
  }

  /**
   * Reset per-day counters on a player object. Mutates the object and returns it.
   * Be conservative: only touch fields that are commonly used for daily resets.
   */
  static resetDailyForPlayer(player: any): any {
    if (!player) return player;
    try {
      // Reset common daily counters
      if (typeof player.dailyCultivationCount === 'number') player.dailyCultivationCount = 0;
      // Mark last reset time
      player.lastDailyReset = Date.now();

      // Reset simple cooldown maps if present
      if (player.cooldowns && typeof player.cooldowns === 'object') {
        Object.keys(player.cooldowns).forEach(k => {
          // conservative: set to 0
          player.cooldowns[k] = 0;
        });
      }

      return player;
    } catch (e) {
      // swallow — daily reset is best-effort
      return player;
    }
  }
}
