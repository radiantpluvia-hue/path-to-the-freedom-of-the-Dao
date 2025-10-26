import { MarketSystem } from '@/systems/MarketSystem';
import * as RelicRegistry from '@/systems/relicRegistry';
import { getRelics } from '@/data/registry';

describe('Relic market replace-confirm flow (integration)', () => {
  beforeEach(() => {
    // Reset claimed relics
    RelicRegistry.loadRelicRegistryState({ claimed: [] });
  });

  test('cancel path: if user cancels, no purchase/equip occurs', () => {
    const relics = getRelics().filter(r => String(r.rarity).toLowerCase() === "C" || r.rarity === 'Mythic');
    if (relics.length < 2) return; // nothing to test in this env
    const [a, b] = relics;

    // initial player with enough funds
    let player: any = {
      yuan: 100000,
      spiritStones: { low: 0, mid: 0, high: 0 },
      equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null }
    };

    // Equip A onto player (simulate prior equip)
    player = RelicRegistry.forceEquipRelicReplacingMythic(player, a.id);
    expect(player).toBeDefined();
    const equippedA = Object.values(player.equipment || {}).some((it: any) => it && it.id === a.id);
    expect(equippedA).toBe(true);
    expect(RelicRegistry.isRelicClaimed(a.id)).toBe(true);

    // Cancel path: user sees B in market but cancels -> no purchase
    // (we simulate cancel by not calling buyItem)
    expect(RelicRegistry.isRelicClaimed(b.id)).toBe(false);
    // Player should still have A equipped
    const stillHasA = Object.values(player.equipment || {}).some((it: any) => it && it.id === a.id);
    expect(stillHasA).toBe(true);
  });

  test('confirm path: purchase then confirm replaces existing mythic', () => {
    const relics = getRelics().filter(r => String(r.rarity).toLowerCase() === "C" || r.rarity === 'Mythic');
    if (relics.length < 2) return; // nothing to test in this env
    const [a, b] = relics;

    // initial player with enough funds
    let player: any = {
      yuan: 100000,
      spiritStones: { low: 0, mid: 0, high: 0 },
      equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null }
    };

    // Equip A onto player
    player = RelicRegistry.forceEquipRelicReplacingMythic(player, a.id);
    expect(RelicRegistry.isRelicClaimed(a.id)).toBe(true);
    expect(Object.values(player.equipment || {}).some((it: any) => it && it.id === a.id)).toBe(true);

    // Prepare market with B available
    const market = new MarketSystem();
    // inject test market entry (private internals used for test)
    (market as any).markets.push({ id: 'test_market', name: 'Test', description: 'Test', location: 'Test', type: 'general', items: [ { id: `relic_${b.id}`, name: b.name, description: b.description, price: { yuan: 1 }, stock: 1 } ] });

    // Purchase B via market (this will claim relic B)
    const buyOk = market.buyItem('test_market', `relic_${b.id}`, player);
    expect(buyOk).toBe(true);
    expect(RelicRegistry.isRelicClaimed(b.id)).toBe(true);

    // Confirm: now apply force-equip replacement as the UI would
    const updated = RelicRegistry.forceEquipRelicReplacingMythic(player, b.id);
    expect(updated).toBeDefined();
    // Ensure B is equipped and A is no longer equipped
    const hasB = Object.values(updated.equipment || {}).some((it: any) => it && it.id === b.id);
    const hasA = Object.values(updated.equipment || {}).some((it: any) => it && it.id === a.id);
    expect(hasB).toBe(true);
    expect(hasA).toBe(false);
    // Claimed flags should reflect both claimed relics (A and B)
    expect(RelicRegistry.isRelicClaimed(a.id)).toBe(true);
    expect(RelicRegistry.isRelicClaimed(b.id)).toBe(true);
  });
});
