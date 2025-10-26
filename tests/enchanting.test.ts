import { MarketSystem } from '../src/systems/MarketSystem';
import { GameState } from '../src/types';

describe('EnchantingSystem integration', () => {
  test('socketing a runic fragment into a rune-infused blade succeeds and consumes the fragment', async () => {
    const ms = new MarketSystem();

    const gs: Partial<GameState> = {
      player: {
        name: 'Tester',
        gender: 'Male',
        race: 'Human',
        background: null,
        age: 20,
        realmId: 1,
        realm: 'Mortal',
        combatPower: 100,
        talentId: '',
        minorStage: 0,
        level: 1,
        baseStats: {},
        stats: {},
        insight: 0,
        karma: 0,
        cunning: 0,
        resolve: 0,
        resourcefulness: 0,
        currentQi: 0,
        qiRequired: 0,
        lifespan: 100,
        spiritStones: { low: 0, mid: 0, high: 0 },
        yuan: 10000,
        inventory: [ { id: 'rune_infused_blade', quantity: 1 }, { id: 'runic_fragment', quantity: 1 } ],
        skills: {},
        abilities: {},
        mentorAffinity: {},
        manuals: [],
        bloodline: null,
        physique: null,
        sect: null,
        techniques: [],
        daoPrinciple: undefined,
        cultivationPower: 0,
        discipline: 0,
        patience: 0,
        daoHeart: 0,
        reputation: {},
        rivalRelationships: {},
        lastRivalEncounters: {},
        factionBattles: [],
        dailyCultivationCount: 0,
        lastDailyReset: 0,
        shadowLedger: 0,
        providenceVeil: 0,
        flameAffinity: 0,
        daoComprehension: 0,
        skillPoints: 0,
        buffs: {},
        experience: 0,
        discoveredRecipes: [],
        currentLocationId: null,
        activeBuffs: [],
        hp: 100,
        qi: 50,
        maxHp: 100,
        maxQi: 50,
        weaponMastery: {},
        tribulationPatterns: [],
        deathSnapshots: [],
        physiqueSynergies: [],
        combatStances: {},
        actionPoints: 0,
        maxActionPoints: 0,
        formations: [],
        domains: [],
        karmicSeeds: [],
        itemAffixes: {},
        refinementLevels: {},
        itemSockets: { 'rune_infused_blade': [ { id: 's1', type: 'runic', bonus: {}, occupiedBy: undefined } ] },
        marketHistory: [],
        economicStanding: 0,
        playSessionData: { sessionId: 's1', startTime: Date.now(), events: [], analytics: {} },
        mapNodes: [],
        currentMapNode: '',
        unlockedMapNodes: [],
        luckModifier: 0,
        stressModifier: 0
      } as any
    } as any;

  const beforeInv = (gs as any).player.inventory.find((i: any) => i.id === 'runic_fragment');
    expect(beforeInv).toBeTruthy();

  const success = await ms.enchantItemForPlayer('rune_infused_blade', 'runic_fragment', gs.player);
  expect(success).toBe(true);

  const afterInv = (gs as any).player.inventory.find((i: any) => i.id === 'runic_fragment');
    expect(afterInv).toBeUndefined();

    // ensure an affix was created
    const affixes = (gs as any).player.itemAffixes;
    expect(Object.keys(affixes).length).toBeGreaterThan(0);

    // ensure socket marked occupied
    const sockets = (gs as any).player.itemSockets['rune_infused_blade'];
    expect(sockets[0].occupiedBy).toBe('runic_fragment');
  });
});
