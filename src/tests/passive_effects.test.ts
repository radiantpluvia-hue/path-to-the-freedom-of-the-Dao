import * as PassiveRegistry from '@/systems/passiveRegistry';

describe('passive registry apply/remove and hooks', () => {
  test('register, apply, invoke hooks, and remove passive', () => {
    // Create a test passive with apply/remove and a hook
    const id = 'test_passive_hook_1';
    const def = {
      id,
      name: 'Test Passive Hook',
      description: 'Adds +10 atk and registers an onHit hook that reduces damage by 1',
      apply: (player: any) => {
        const p = { ...player };
        p.stats = { ...(p.stats || {}), atk: (p.stats?.atk || 0) + 10 };
        return p;
      },
      remove: (player: any) => {
        const p = { ...player };
        p.stats = { ...(p.stats || {}), atk: (p.stats?.atk || 0) - 10 };
        return p;
      },
      onHit: (ctx: any) => {
        // slight damage mitigation
        return Math.max(0, (ctx.damage || 0) - 1);
      }
    } as any;

    // Register passive
    PassiveRegistry.registerPassive(def);
    expect(PassiveRegistry._registryContains(id)).toBeTruthy();

    // Apply to a simple player object
    const base = { stats: { atk: 5 }, _passiveHooks: {} } as any;
    const applied = PassiveRegistry.applyPassiveToPlayer(base, id);
    expect(applied.stats.atk).toBe(15);
    // Ensure hook attached
    expect(applied._passiveHooks && Array.isArray(applied._passiveHooks.onHit)).toBeTruthy();

    // Simulate invoking onHit hooks
    const hookList = applied._passiveHooks.onHit;
    let reduced = 999;
    if (Array.isArray(hookList) && hookList.length > 0) {
      reduced = hookList[0].fn({ attacker: {}, target: applied, damage: 5 });
    }
    expect(reduced).toBe(4);

    // Remove passive
    const removed = PassiveRegistry.removePassiveFromPlayer(applied, id);
    expect(removed.stats.atk).toBe(5);
    // hooks removed
    expect(!removed._passiveHooks || !removed._passiveHooks.onHit).toBeTruthy();

    // Cleanup registry
    PassiveRegistry.unregisterPassive(id);
    expect(PassiveRegistry._registryContains(id)).toBeFalsy();
  });
});
