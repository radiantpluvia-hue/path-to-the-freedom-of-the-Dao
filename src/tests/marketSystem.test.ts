import { MarketSystem } from '../systems/MarketSystem';
import { MARKET_ITEMS } from '../systems/marketData';

describe('MarketSystem', () => {
  let marketSystem: MarketSystem;

  beforeEach(() => {
    marketSystem = new MarketSystem();
  });

  describe('New Armor Items', () => {
    test('should include new uncommon armor artifacts', () => {
      const leatherArmor = MARKET_ITEMS.find(item => item.id === 'leather_armor');
      const spiritClothRobe = MARKET_ITEMS.find(item => item.id === 'spirit_cloth_robe');
      const ironScaleArmor = MARKET_ITEMS.find(item => item.id === 'iron_scale_armor');

      expect(leatherArmor).toBeDefined();
      expect(leatherArmor?.name).toBe('Reinforced Leather Armor');
      expect(leatherArmor?.rarity).toBe("G");
      expect(leatherArmor?.effects?.def).toBe(20);
      expect(leatherArmor?.effects?.hp).toBe(30);

      expect(spiritClothRobe).toBeDefined();
      expect(spiritClothRobe?.name).toBe('Spirit Cloth Robe');
      expect(spiritClothRobe?.rarity).toBe("G");
      expect(spiritClothRobe?.effects?.special).toContain('qi_regeneration');

      expect(ironScaleArmor).toBeDefined();
      expect(ironScaleArmor?.name).toBe('Iron Scale Armor');
      expect(ironScaleArmor?.rarity).toBe("G");
      expect(ironScaleArmor?.effects?.def).toBe(25);
      expect(ironScaleArmor?.effects?.hp).toBe(40);
    });

    test('should include new epic armor artifacts', () => {
      const silkArmor = MARKET_ITEMS.find(item => item.id === 'immortal_silk_armor');
      const forgedPlate = MARKET_ITEMS.find(item => item.id === 'heaven_forged_plate');

      expect(silkArmor).toBeDefined();
      expect(silkArmor?.name).toBe('Immortal-grade Silk Armor');
      expect(silkArmor?.rarity).toBe("E");
      expect(silkArmor?.effects?.def).toBe(120);
      expect(silkArmor?.effects?.hp).toBe(180);
      expect(silkArmor?.effects?.special).toContain('immortal_mobility');

      expect(forgedPlate).toBeDefined();
      expect(forgedPlate?.name).toBe('Heaven-grade Forged Plate');
      expect(forgedPlate?.rarity).toBe("E");
      expect(forgedPlate?.effects?.def).toBe(150);
      expect(forgedPlate?.effects?.hp).toBe(250);
      expect(forgedPlate?.effects?.special).toContain('heavenly_forged');
    });
  });

  describe('Market Filtering', () => {
    test('should filter items by player requirements', () => {
      const lowRealmPlayer = {
        realm: 2,
        combatPower: 1000,
        yuan: 1000,
        spiritStones: { low: 0, mid: 0, high: 0 },
        karma: 0
      };

      const highRealmPlayer = {
        realm: 10,
        combatPower: 60000,
        yuan: 100000,
        spiritStones: { low: 100, mid: 50, high: 10 },
        karma: 200
      };

      const mortalBazaar = marketSystem.getAvailableMarkets(lowRealmPlayer)[0];
      const immortalEmporium = marketSystem.getAvailableMarkets(highRealmPlayer)[1];

      expect(mortalBazaar).toBeDefined();
      expect(immortalEmporium).toBeDefined();

      const lowRealmItems = marketSystem.getMarketItems(mortalBazaar.id, lowRealmPlayer);
      const highRealmItems = marketSystem.getMarketItems(immortalEmporium.id, highRealmPlayer);

      // Low realm player should see common and some uncommon items
      expect(lowRealmItems.some(item => item.rarity === "H")).toBe(true);
      expect(lowRealmItems.some(item => item.rarity === "G")).toBe(true);
      expect(lowRealmItems.some(item => item.rarity === "E")).toBe(false);

      // High realm player should see epic items
      expect(highRealmItems.some(item => item.rarity === "E")).toBe(true);
    });
  });

  describe('Purchase Logic', () => {
    test('should handle item purchases correctly', () => {
      const playerState = {
        realm: 5,
        combatPower: 10000,
        yuan: 2000,
        spiritStones: { low: 0, mid: 0, high: 0 },
        karma: 0
      };

      const mortalBazaar = marketSystem.getAvailableMarkets(playerState)[0];
      const items = marketSystem.getMarketItems(mortalBazaar.id, playerState);

      // Find a common item to purchase
      const commonItem = items.find(item => item.rarity === "H" && item.price.yuan && item.price.yuan <= playerState.yuan);

      if (commonItem) {
        const initialYuan = playerState.yuan;
        const success = marketSystem.buyItem(mortalBazaar.id, commonItem.id, playerState);

        expect(success).toBe(true);
        expect(playerState.yuan).toBeLessThan(initialYuan);
        expect(marketSystem.getPlayerInventory()[commonItem.id]).toBe(1);
      }
    });

    test('should prevent purchase when requirements not met', () => {
      const lowRealmPlayer = {
        realm: 2,
        combatPower: 1000,
        yuan: 100000,
        spiritStones: { low: 0, mid: 0, high: 0 },
        karma: 0
      };

      const immortalEmporium = marketSystem.getAvailableMarkets(lowRealmPlayer).find(m => m.id === 'immortal_emporium');

      // Low realm player shouldn't have access to immortal emporium
      expect(immortalEmporium).toBeUndefined();
    });
  });
});
