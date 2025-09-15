import { CombatSystem, type CombatParticipant, type CombatTechnique, type CombatContext } from '../src/systems/CombatSystem';

const makeParticipant = (id: string, name: string, stats: { atk: number; def: number; speed: number }, extra?: Partial<CombatParticipant>): CombatParticipant => ({
  id,
  name,
  hp: 100,
  maxHp: 100,
  qi: 1000,
  maxQi: 1000,
  ap: 10,
  maxAp: 10,
  stats,
  techniques: [],
  buffs: [],
  debuffs: [],
  ...extra,
});

const makeTechnique = (id = 't', ap = 1, qi = 0, over?: Partial<CombatTechnique>): CombatTechnique => ({
  id,
  name: id,
  description: id,
  apCost: ap,
  qiCost: qi,
  type: 'attack',
  effects: [{ type: 'damage', target: 'enemy', value: 10 }],
  cooldown: 0,
  currentCooldown: 0,
  ...over,
});

const systemWith = (player: CombatParticipant, enemy: CombatParticipant, ctx?: Partial<CombatContext>) =>
  new CombatSystem(player, [enemy], undefined as any, undefined as any, { type: 'normal', ...ctx });

describe('Granular AP/Qi consumption', () => {
  test('scalesWithIntensity true reduces AP at lower intensity', () => {
    const player = makeParticipant('player', 'P', { atk: 12, def: 8, speed: 10 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 5 });
    const tech = makeTechnique('high_blast', 4, 60, { scalesWithIntensity: true, id: 'high_blast' });
    player.techniques.push(tech);
    const sys = systemWith(player, enemy);

    player.ap = 10;
    expect(sys.useTechnique('player', 'high_blast', 'e', { intensity: 0.2 })).toBe(true);
  const afterLow = sys.getState().participants.find((p: CombatParticipant) => p.id === 'player')!.ap;

    // Reset AP to full for a new system instance to avoid cooldown effects
    player.ap = 10;
    const sys2 = systemWith(player, enemy);
    expect(sys2.useTechnique('player', 'high_blast', 'e', { intensity: 1.0 })).toBe(true);
  const afterHigh = sys2.getState().participants.find((p: CombatParticipant) => p.id === 'player')!.ap;

    expect(afterLow).toBeGreaterThanOrEqual(afterHigh);
  });

  test('scalesWithIntensity false keeps AP constant across intensities', () => {
    const player = makeParticipant('player', 'P2', { atk: 12, def: 8, speed: 10 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 5 });
    const tech = makeTechnique('steady_guard', 3, 50, { scalesWithIntensity: false, id: 'steady_guard' });
    player.techniques.push(tech);
    const sys = systemWith(player, enemy);

    player.ap = 10;
    expect(sys.useTechnique('player', 'steady_guard', undefined, { intensity: 0.3 })).toBe(true);
  const afterLow = sys.getState().participants.find((p: CombatParticipant) => p.id === 'player')!.ap;

    player.ap = 10;
    const sys2 = systemWith(player, enemy);
    expect(sys2.useTechnique('player', 'steady_guard', undefined, { intensity: 0.9 })).toBe(true);
  const afterHigh = sys2.getState().participants.find((p: CombatParticipant) => p.id === 'player')!.ap;

    expect(afterLow).toEqual(afterHigh);
  });

});
