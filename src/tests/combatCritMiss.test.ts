import { CombatSystem, type CombatParticipant, type CombatTechnique, type CombatContext } from '@/systems/CombatSystem';

describe('CombatSystem crit/miss with seeded RNG', () => {
  const makeP = (id: string, name: string, extra?: Partial<CombatParticipant>): CombatParticipant => ({
    id,
    name,
    hp: 100,
    maxHp: 100,
    qi: 100,
    maxQi: 100,
    ap: 5,
    maxAp: 5,
    stats: { atk: 10, def: 5, speed: 20 },
    techniques: [],
    buffs: [],
    debuffs: [],
    ...extra,
  });

  const basicStrike = (over?: Partial<CombatTechnique>): CombatTechnique => ({
    id: 'strike', name: 'Strike', description: 'A firm blow', apCost: 0, qiCost: 0, type: 'attack',
    effects: [{ type: 'damage', target: 'enemy', value: 10 }], cooldown: 0, currentCooldown: 0, ...over,
  });

  test('forced miss with rng -> 0.0', () => {
    const player = makeP('player', 'Hero');
    const enemy = makeP('e1', 'Dummy');
    player.techniques.push(basicStrike({ missChance: 1.0, critChance: 0, critMultiplier: 2.0 }));

    const ctx: CombatContext = { type: 'normal', enableCritMiss: true, rng: () => 0.0, debugDamageBreakdown: true };
    const sys = new CombatSystem(player, [enemy], undefined as any, undefined as any, ctx);

    const ok = sys.useTechnique('player', 'strike', 'e1');
    expect(ok).toBe(true);
    const st = sys.getState();
    const e = st.participants.find(p => p.id === 'e1')!;
    expect(e.hp).toBe(100); // no damage on miss
  });

  test('forced crit with rng -> 0.99', () => {
    const player = makeP('player', 'Hero');
    const enemy = makeP('e1', 'Dummy');
    player.techniques.push(basicStrike({ missChance: 0, critChance: 1.0, critMultiplier: 2.0 }));

    const ctx: CombatContext = { type: 'normal', enableCritMiss: true, rng: () => 0.99, debugDamageBreakdown: true };
    const sys = new CombatSystem(player, [enemy], undefined as any, undefined as any, ctx);

    const ok = sys.useTechnique('player', 'strike', 'e1');
    expect(ok).toBe(true);
    const st = sys.getState();
    const e = st.participants.find(p => p.id === 'e1')!;
    expect(e.hp).toBeLessThan(100); // took damage; exact amount depends on atk/def/env
  });
});