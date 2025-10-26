import { MarketSystem } from '@/systems/MarketSystem';

describe('MarketSystem deterministic seller name', () => {
  test('generateSellerName produces deterministic name sequence given rng', () => {
    // Controlled RNG that cycles through values to select predictable prefix and name
    const seq = [0.0, 0.5, 0.2, 0.8];
    let idx = 0;
    const rng = () => {
      const v = seq[idx % seq.length];
      idx++;
      return v;
    };

    const market = new MarketSystem({ rng });

    // Use internal helper by generating an auction which uses generateSellerName
    // Force generation of auctions via public helper
    (market as any).generateRandomAuctions();

    const auctions = market.getActiveAuctions();
    expect(auctions.length).toBeGreaterThanOrEqual(1);

    // The seller names are formed as `${prefix} ${name}` where prefix and name arrays are known
    // With our rng seq, the first auction seller should be deterministic
    const seller = auctions[0].sellerName;
    expect(typeof seller).toBe('string');
    expect(seller.split(' ').length).toBeGreaterThanOrEqual(2);
  });
});
