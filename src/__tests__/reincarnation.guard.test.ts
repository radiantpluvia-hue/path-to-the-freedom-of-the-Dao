import { eraManager } from '@/era/eraManager';

describe('reincarnation guard', () => {
  test('cannot reincarnate to earlier era via manager', () => {
    const world: any = { currentEraIndex: 3 };
    const gs: any = { player: { name: 'p' }, world, story: {} };
    // sameEra is allowed and should not throw
    expect(() => eraManager.attemptReincarnation(gs, { sameEra: true, seed: 'x' })).not.toThrow();
    // direct to earlier index should throw
    (gs.world as any).currentEraIndex = 5;
    expect(() => eraManager.reincarnateToIndex(gs, 4, 'x')).toThrow('Cannot reincarnate into an earlier era');
  });
});
