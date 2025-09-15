import { DailyLoopSystem } from '../src/systems/DailyLoopSystem';

describe('DailyLoopSystem basic behavior', () => {
	test('hasDayPassed returns true for undefined timestamp and false for recent timestamp', () => {
		expect(DailyLoopSystem.hasDayPassed(undefined)).toBe(true);
		const now = Date.now();
		expect(DailyLoopSystem.hasDayPassed(now)).toBe(false);
	});

	test('resetDailyForPlayer resets counters conservatively', () => {
		const player: any = { dailyCultivationCount: 5, cooldowns: { a: 10, b: 2 } };
		const res = DailyLoopSystem.resetDailyForPlayer(player);
		expect(res.dailyCultivationCount).toBe(0);
		expect(typeof res.lastDailyReset).toBe('number');
		expect(res.cooldowns.a).toBe(0);
	});
});
