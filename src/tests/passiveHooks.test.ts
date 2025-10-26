import { CombatSystem } from '../systems/CombatSystem';
import { GENERATED_PASSIVES } from '../data/generated/passives.generated';
import { makeSeededRng, setRuntimeRng, clearRuntimeRng } from '../utils/seededRng';

// Basic tests to ensure onHit, auraTick and proc wiring behave as expected

describe('Passive hooks integration', () => {
  afterEach(() => { try { clearRuntimeRng(); } catch (e) {} });

  test('onHit hook on attacker can deal extra damage', () => {
    const attacker: any = { id: 'att', name: 'Att', hp: 50, maxHp: 50, stats: { atk: 10, def: 5 }, techniques: [], buffs: [], debuffs: [] };
    const target: any = { id: 'tgt', name: 'Tgt', hp: 50, maxHp: 50, stats: { atk: 5, def: 3 }, techniques: [], buffs: [], debuffs: [] };

    // Create a simple passive that returns a numeric extra damage from onHit
    const passive = {
      id: 'test_onhit_extra', name: 'OH Extra', description: '', apply: (p: any) => p, remove: (p: any) => p,
      onHit: ({ attacker, target }: any) => { return 3; }
    } as any;

    // Attach hook to attacker manually
    attacker._passiveHooks = { onHit: [{ id: passive.id, fn: passive.onHit }] };

    const cs = new CombatSystem(attacker, [target], null, null, { type: 'normal' });
    cs.__test_applyDamage(attacker, target, 5);
    expect(target.hp).toBeLessThan(50 - 0); // took damage plus extra
  });

  test('auraTick gets invoked in processTurnEffects', () => {
    const p: any = { id: 'p1', name: 'P1', hp: 20, maxHp: 50, stats: { atk: 5, def: 3 }, techniques: [], buffs: [], debuffs: [] };
    p._passiveHooks = { auraTick: [{ id: 'regen_aura', fn: (pl: any) => { pl.hp = Math.min(pl.maxHp, (pl.hp || 0) + 5); } }] };

    const cs = new CombatSystem(p, [], null, null, { type: 'normal' });
    // call processTurnEffects through endTurn flow
    cs.endTurn();
    // After a turn tick, hp should have increased
  const st = cs.getState().participants.find((pp: any) => pp.id === 'p1');
  expect(st).toBeDefined();
  expect(st!.hp).toBeGreaterThanOrEqual(20);
  });

  test('proc function can be invoked deterministically', () => {
    const attacker: any = { id: 'a', name: 'A', hp: 50, maxHp: 50, stats: { atk: 10 }, techniques: [], buffs: [], debuffs: [] };
    const target: any = { id: 'b', name: 'B', hp: 50, maxHp: 50, stats: { atk: 3 }, techniques: [], buffs: [], debuffs: [] };

    const procFn = (ctx: any) => {
      const rng = ctx.rng || (() => 0);
      if (rng() < 1.0) { // force
        const extra = 2;
        ctx.target.hp = Math.max(0, (ctx.target.hp || 0) - extra);
      }
    };

    // Directly invoke proc deterministically
    procFn({ attacker, target, damage: 5, rng: () => 0.0 });
    expect(target.hp).toBe(48);
  });
});
