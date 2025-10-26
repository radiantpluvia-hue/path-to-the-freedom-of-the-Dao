import { setEntityProvider, runSeason, heavenlyState, onEntityDefeated } from '../src/managers/HeavenlyRankingManager';

const sampleEntities = [
  { id: 'npc1', name: 'Ancient One', type: 'npc', realm: 'immortal_early', combatPowerRaw: 1e9, providence: 1000, karmicMerit: 500 },
  { id: 'npc2', name: 'Void Emperor', type: 'npc', realm: 'immortal_late', combatPowerRaw: 5e9, providence: 5000, karmicMerit: 1000 },
  { id: 'player1', name: 'PlayerX', type: 'player', realm: 'immortal_early', combatPowerRaw: 1e8, providence: 300, karmicMerit: 200, bloodlineMultiplier: 1.1 }
];

describe('HeavenlyRankingManager replacement', () => {
  beforeAll(() => {
    setEntityProvider(() => sampleEntities as any);
    runSeason(100000); // create season
  });

  test('season created and contains ranked entries', () => {
    expect(heavenlyState.currentSeason).toBeDefined();
    expect(heavenlyState.currentSeason!.entries.length).toBeGreaterThan(0);
  });

  test('onEntityDefeated replaces a ranked entity when attacker is immortal', () => {
    // assume npc1 is ranked; attacker is player1
    const defeatedId = 'npc1';
    const attacker = sampleEntities.find(e => e.id === 'player1');
    const before = heavenlyState.currentSeason!.entries.find(e => e.id === defeatedId);
    const replaced = onEntityDefeated(defeatedId, attacker);
    expect(replaced).toBeTruthy();
    const now = heavenlyState.currentSeason!.entries.some(e => e.id === 'player1');
    expect(now).toBeTruthy();
  });
});
