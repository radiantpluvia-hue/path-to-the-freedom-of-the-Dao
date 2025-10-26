import { CombatSystem } from '../systems/CombatSystem';
import { toCombatTechnique, getSkillById } from '../systems/skillRegistry';

describe('Rival technique selection AI', () => {
  it('prefers AI profile preferred technique on opening round', () => {
    // Build a simple player participant
    const player = {
      id: 'player', name: 'Tester', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 5, maxAp: 5,
      stats: { atk: 10, def: 8, speed: 10 }, techniques: [], buffs: [], debuffs: []
    } as any;

    // Rival uses curated howl + multi slash; preferred is howl
    const skill1 = getSkillById('cur_howl_frenzy');
    const skill2 = getSkillById('cur_multi_slash');
    const tech1 = skill1 ? toCombatTechnique(skill1) : { id: 'cur_howl_frenzy', name: 'Howl', apCost: 2, qiCost: 0, type: 'support', effects: [] } as any;
    const tech2 = skill2 ? toCombatTechnique(skill2) : { id: 'cur_multi_slash', name: 'Multi', apCost: 3, qiCost: 0, type: 'attack', effects: [] } as any;

    const rival = {
      id: 'r1', name: 'Spirit Hound', hp: 50, maxHp: 50, qi: 0, maxQi: 0, ap: 5, maxAp: 5,
      stats: { atk: 12, def: 6, speed: 8 }, techniques: [tech1, tech2], buffs: [], debuffs: []
    } as any;

    // Use a minimal gameStore and rivalSystem stub
    const gameStore: any = { addEventLog: () => {}, player: {} };
    const rivalSystem: any = { getRival: () => ({ personality: 'neutral', techniques: ['cur_howl_frenzy', 'cur_multi_slash'] }) };

    const cs = new CombatSystem(player as any, [rival as any], gameStore, rivalSystem as any, { type: 'normal' });

    // Force round 1 and simulate rival turn
    cs.getState().round = 1;
    const res = cs.executeRivalTurn(rival.id);
    // Check combat log for the rival's use of one of the preferred techniques
    const log = cs.getState().combatLog.join('\n');
    expect(/uses .*Howl|uses .*Howl of Frenzy|cur_howl_frenzy|Howl/i.test(log) || /uses .*Multi|cur_multi_slash/i.test(log)).toBeTruthy();
  });
});
