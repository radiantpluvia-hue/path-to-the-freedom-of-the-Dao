import performBreakthroughAttempt from '@/utils/attemptHelpers';

describe('performBreakthroughAttempt', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('calls store.attemptRealmBreakthroughWithConsolidation when present', () => {
    const mockFn = jest.fn();
    const mockStore = { attemptRealmBreakthroughWithConsolidation: mockFn, player: { skills: {}, daoHeart: 5 } };
    const { performBreakthroughAttempt } = require('@/utils/attemptHelpers');
    performBreakthroughAttempt('challenge_1', mockStore);
    expect(mockFn).toHaveBeenCalledWith('challenge_1');
  });

  test('falls back to BreakthroughSystem when store method absent', () => {
    const bsModule = require('@/systems/BreakthroughSystem');
    const attemptSpy = jest.spyOn(bsModule.BreakthroughSystem.prototype, 'attemptRealmBreakthrough').mockImplementation(() => true);
    const mockStore = { player: { skills: {}, daoHeart: 5, realm: 'mortal' } };
    const { performBreakthroughAttempt } = require('@/utils/attemptHelpers');
    performBreakthroughAttempt('fallback_challenge', mockStore);
    expect(attemptSpy).toHaveBeenCalled();
    attemptSpy.mockRestore();
  });
});
