import { MarketSystem } from '@/systems/MarketSystem';
import { createSeededRng } from './testUtils/seededRng';

describe('MarketSystem deterministic relic insertion', () => {
  test('refreshMarket inserts a relic into treasure listings when seeded rng triggers relic path', () => {
    const rng = createSeededRng(424242);

    const market = new MarketSystem({ rng });

    const playerState: any = { realm: 10, combatPower: 100000, yuan: 100000, spiritStones: { low: 0, mid: 0, high: 0 }, karma: 0 };

    // Force refresh
    market.forceRefresh('mortal_bazaar');

    const items = market.getMarketItems('mortal_bazaar', playerState);

  const found = items.find(i => i.id && String(i.id).startsWith('relic_relic_'));
  expect(found).toBeDefined();
  // Strict id check: registry first relic is 'relic_mountain_oath_tablet'
  expect(found?.id).toBe('relic_relic_mountain_oath_tablet');
    if (found) {
      expect(found.type).toBe('treasure');
      expect(found.stock).toBeGreaterThanOrEqual(1);
    }
  });
});
