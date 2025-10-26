import { MarketSystem } from '@/systems/MarketSystem';
import { createSeededRng } from './testUtils/seededRng';

// Deterministic integration test: inject rng and sampler so refreshMarket will insert a weapon

describe('MarketSystem deterministic weapon insertion', () => {
  test('refreshMarket inserts sampled weapon into treasure listings when rng and sampler deterministic', () => {
    // rng that advances but returns 0.01 for chance checks (so 0.01 < 0.04) and small values elsewhere
    const calls = 0;
    const rng = createSeededRng(12345);
    const sampler = () => ({ id: 'deterministic_weapon', name: 'Deterministic Weapon', rarity: "F", stats: { atk: 100 } } as any);

    const market = new MarketSystem({ rng, sampleWeapon: sampler });

    const playerState: any = { realm: 10, combatPower: 100000, yuan: 100000, spiritStones: { low: 0, mid: 0, high: 0 }, karma: 0 };

  // Force refresh using the public helper
  market.forceRefresh('mortal_bazaar');

  // Trigger getMarketItems which will return refreshed items
  const items = market.getMarketItems('mortal_bazaar', playerState);

    // Find any weapon_* item with our id
    const found = items.find(i => i.id === 'weapon_deterministic_weapon' || i.name === 'Deterministic Weapon');
    expect(found).toBeDefined();
    // Strict identity check for deterministic insertion under this seed
    expect(found?.id).toBe('weapon_deterministic_weapon');
    expect(found?.type).toBe('weapon');
    expect(found?.stock).toBeGreaterThanOrEqual(1);
  });
});
