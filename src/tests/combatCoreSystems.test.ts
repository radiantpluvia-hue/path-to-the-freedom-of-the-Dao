/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { CombatSystem, type CombatParticipant, type CombatTechnique, type CombatContext } from '@/systems/CombatSystem';

const makeParticipant = (id: string, name: string, stats: { atk: number; def: number; speed: number }, extra?: Partial<CombatParticipant>): CombatParticipant => ({
  id,
  name,
  hp: 100,
  maxHp: 100,
  qi: 100,
  maxQi: 100,
  ap: 5,
  maxAp: 5,
  stats,
  techniques: [],
  buffs: [],
  debuffs: [],
  ...extra,
});

const makeAttack = (id = 'hit', value = 0, over?: Partial<CombatTechnique>): CombatTechnique => ({
  id,
  name: id,
  description: 'test strike',
  apCost: 0,
  qiCost: 0,
  type: 'attack',
  effects: [{ type: 'damage', target: 'enemy', value }],
  cooldown: 0,
  currentCooldown: 0,
  ...over,
});

const makeBuff = (id = 'atk_buff', stat = 'atk', value = 2, duration = 1): CombatTechnique => ({
  id,
  name: id,
  description: 'buff',
  apCost: 0,
  qiCost: 0,
  type: 'support',
  effects: [{ type: 'buff', target: 'self', stat, value, duration }],
  cooldown: 0,
  currentCooldown: 0,
});

const systemWith = (player: CombatParticipant, enemy: CombatParticipant, ctx?: Partial<CombatContext>) =>
  new CombatSystem(player, [enemy], undefined as any, undefined as any, { type: 'normal', ...ctx });

describe('Combat core systems', () => {
  test('environment multipliers adjust damage (storm > clear)', () => {
    const basePlayer = makeParticipant('player', 'Hero', { atk: 10, def: 5, speed: 20 });
    const baseEnemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    const strike = makeAttack('strike', 0);

    // Clear
    const p1 = { ...basePlayer, techniques: [strike] } as CombatParticipant;
    const e1 = { ...baseEnemy } as CombatParticipant;
    const sysClear = systemWith(p1, e1, { weather: 'clear' });
    expect(sysClear.useTechnique('player', 'strike', 'e')).toBe(true);
    const dmgClear = 100 - sysClear.getState().participants.find(p => p.id === 'e')!.hp; // should be 10

    // Storm
    const p2 = makeParticipant('player', 'Hero', { atk: 10, def: 5, speed: 20 });
    const e2 = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    p2.techniques.push(makeAttack('strike', 0));
    const sysStorm = systemWith(p2, e2, { weather: 'storm' });
    expect(sysStorm.useTechnique('player', 'strike', 'e')).toBe(true);
    const dmgStorm = 100 - sysStorm.getState().participants.find(p => p.id === 'e')!.hp; // should be 11

    expect(dmgStorm).toBeGreaterThan(dmgClear);
  });

  test('attacker defensive stance reduces outgoing damage', () => {
    const player = makeParticipant('player', 'Hero', { atk: 10, def: 5, speed: 20 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    player.techniques.push(makeAttack('strike', 0));
    const sys = systemWith(player, enemy, { weather: 'clear' });

    // Neutral baseline
    expect(sys.useTechnique('player', 'strike', 'e')).toBe(true);
    const dmgNeutral = 100 - sys.getState().participants.find(p => p.id === 'e')!.hp; // 10

    // Reset with defensive stance (stance technique injected in ctor)
    const player2 = makeParticipant('player', 'Hero', { atk: 10, def: 5, speed: 20 });
    const enemy2 = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    player2.techniques.push(makeAttack('strike', 0));
    const sys2 = systemWith(player2, enemy2, {});
    expect(sys2.useTechnique('player', 'stance_defensive')).toBe(true);
    expect(sys2.useTechnique('player', 'strike', 'e')).toBe(true);
    const dmgDef = 100 - sys2.getState().participants.find(p => p.id === 'e')!.hp;

    expect(dmgDef).toBeLessThan(dmgNeutral);
  });

  test('cooldown set with mastery reduction and decrements on endTurn', () => {
    const player = makeParticipant('player', 'Hero', { atk: 8, def: 5, speed: 20 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    const heavy = makeAttack('heavy', 1, { cooldown: 3, masteryRank: 2 }); // expect set to 1
    player.techniques.push(heavy);
    const sys = systemWith(player, enemy);

    expect(sys.useTechnique('player', 'heavy', 'e')).toBe(true);
    const t = sys.getState().participants.find(p => p.id === 'player')!.techniques.find(x => x.id === 'heavy')!;
    expect(t.currentCooldown).toBe(1);

    sys.endTurn(); // process player cooldown -> 0
    const t2 = sys.getState().participants.find(p => p.id === 'player')!.techniques.find(x => x.id === 'heavy')!;
    expect(t2.currentCooldown || 0).toBe(0);
  });

  test('buff duration decreases and expires', () => {
    const player = makeParticipant('player', 'Hero', { atk: 8, def: 5, speed: 20 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    const b = makeBuff('atk_buff_1', 'atk', 2, 1);
    player.techniques.push(b);
    const sys = systemWith(player, enemy);

    expect(sys.useTechnique('player', 'atk_buff_1')).toBe(true);
    let p = sys.getState().participants.find(x => x.id === 'player')!;
    expect(p.buffs.length).toBe(1);

    sys.endTurn(); // process buff timer
    p = sys.getState().participants.find(x => x.id === 'player')!;
    expect(p.buffs.length).toBe(0);
  });

  test('getAvailableTechniques respects movement stance AP discount', () => {
    const player = makeParticipant('player', 'Hero', { atk: 8, def: 5, speed: 20 }, { ap: 1, maxAp: 1 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 });
    const costly: CombatTechnique = { id: 'dash_slash', name: 'Dash Slash', description: '', apCost: 2, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 1 }], cooldown: 0, currentCooldown: 0 };
    player.techniques.push(costly);

    const sys = systemWith(player, enemy, {});
    // Shift to movement stance -> ap modifier 0.9 -> floor(2*0.9)=1
    expect(sys.useTechnique('player', 'stance_movement')).toBe(true);
    const avail = sys.getAvailableTechniques('player').map(t => t.id);
    expect(avail).toContain('dash_slash');
  });

  test('AP fully restores at start of new round', () => {
    const player = makeParticipant('player', 'Hero', { atk: 8, def: 5, speed: 20 }, { ap: 0, maxAp: 3 });
    const enemy = makeParticipant('e', 'Dummy', { atk: 0, def: 0, speed: 10 }, { ap: 0, maxAp: 3 });
    const sys = systemWith(player, enemy, {});

    // Advance two turns to cycle back and trigger startNewRound (turnOrder length == 2)
    sys.endTurn(); // to enemy
    sys.endTurn(); // back to player, startNewRound triggers -> AP restored

    const p = sys.getState().participants.find(x => x.id === 'player')!;
    const e = sys.getState().participants.find(x => x.id === 'e')!;
    expect(p.ap).toBe(p.maxAp);
    expect(e.ap).toBe(e.maxAp);
  });
});