/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { EnhancedQuestSystem } from '@/systems/EnhancedQuestSystem';
import { GameState } from '@/types';
import { getRelics } from '@/data/registry';
import * as RelicRegistry from '@/systems/relicRegistry';

describe('EnhancedQuestSystem relic reward auto-equip & claim', () => {
  test('quest reward grants relic, auto-equips if slot free and marks relic claimed', () => {
    // prepare
    RelicRegistry.loadRelicRegistryState({ claimed: [] });
    const eqSys = new EnhancedQuestSystem();
    const relic = getRelics().find(r => r.id === 'relic_mountain_oath_tablet');
    expect(relic).toBeDefined();

    const quest = {
      id: 'test_reward_relic_auto_equip',
      title: 'Test Relic Reward',
      description: 'Gives relic',
      type: 'side' as any,
      difficulty: 'easy' as any,
      objectives: [ { id: 'obj1', type: 'REACH_REALM' as any, description: '', target: 'realm', value: 'Qi Gathering', isCompleted: true } ],
      status: 'active' as any,
      rewards: [ { type: 'relic' as any, target: relic!.id, amount: 1, description: 'Test relic' } ],
      experience: 0
    };

    // set up minimal game state
    const gameState: any = {
      player: { inventory: [], equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null }, skills: {}, yuan: 10000 },
      world: {}, story: { completedQuests: [] }, ui: {}, systems: {}
    };

    eqSys.addQuest(quest as any);

    // Simulate objective completion by directly marking as completed and calling checkQuestCompletion
    const q = eqSys.getQuest('test_reward_relic_auto_equip')!;
    q.objectives.forEach(o => o.isCompleted = true);

    const res = (eqSys as any).checkQuestCompletion(gameState);
    // After completion, relic should be claimed
    expect(RelicRegistry.isRelicClaimed(relic!.id)).toBe(true);
    // Player equipment mainHand or accessory should have the relic converted
    const hasEquipped = Object.values(gameState.player.equipment || {}).some((v: any) => v && (v.id === relic!.id));
    expect(hasEquipped).toBe(true);
  });
});
