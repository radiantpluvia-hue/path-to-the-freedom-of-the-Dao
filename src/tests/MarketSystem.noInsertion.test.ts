import { MarketSystem } from '@/systems/MarketSystem';

describe('MarketSystem negative insertion cases', () => {
  test('forceRefresh does not insert sampled weapon or relic when rng returns high values', () => {
  // RNG always returns > chance thresholds so no insertion should happen
  // Use 0.999 to avoid Math.floor(this.rng()*array.length) producing out-of-bounds
  const rng = () => 0.999;

    const sampler = () => ({ id: 'deterministic_weapon', name: 'Deterministic Weapon', rarity: "F", stats: { atk: 100 } } as any);

    const market = new MarketSystem({ rng, sampleWeapon: sampler });

    const playerState: any = { realm: 10, combatPower: 100000, yuan: 100000, spiritStones: { low: 0, mid: 0, high: 0 }, karma: 0 };

    market.forceRefresh('mortal_bazaar');

    const items = market.getMarketItems('mortal_bazaar', playerState);

    const foundWeapon = items.find(i => i.id === 'weapon_deterministic_weapon');
    const foundRelic = items.find(i => String(i.id).startsWith('relic_relic_'));

    expect(foundWeapon).toBeUndefined();
    expect(foundRelic).toBeUndefined();
  });
});
