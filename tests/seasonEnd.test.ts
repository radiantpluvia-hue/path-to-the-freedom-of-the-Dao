import { heavenlyState, onSeasonEnd, setEntityProvider, runSeason } from '../src/managers/HeavenlyRankingManager';

describe('Season end flow', () => {
  test('onSeasonEnd archives and clears current season', () => {
    setEntityProvider(() => [
      { id: 'p1', name: 'P1', type: 'player', realm: 'immortal_early', combatPowerRaw: 1e8 },
      // ... more to fill top10
    ] as any);
    runSeason(200000);
    expect(heavenlyState.currentSeason).toBeTruthy();
    onSeasonEnd();
    expect(heavenlyState.currentSeason).toBeNull();
    expect(heavenlyState.archive.length).toBeGreaterThan(0);
  });
});
