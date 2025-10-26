import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';
import { GameState } from '../src/types';

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('SaveLoadSystem', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should save and load game state correctly', () => {
    // Create a test game state
    const testGameState: any = {
      player: {
        name: 'Test Player',
        gender: 'Male',
        race: 'Human',
        background: null,
        age: 18,
        realm: 'mortal',
  realmId: 1,
        minorStage: 1,
        level: 1,
        baseStats: { hp: 100, qi: 100, atk: 10, def: 10, speed: 10 },
        stats: { hp: 100, qi: 100, atk: 10, def: 10, speed: 10 },
        insight: 85,
        combatPower: 100,
        karma: 0,
        cunning: 0,
        resolve: 50,
        resourcefulness: 50,
        currentQi: 0,
        qiRequired: 100,
        lifespan: 150,
        spiritStones: { low: 0, mid: 0, high: 0 },
        yuan: 0,
        inventory: [],
        skills: {
          weaponMastery: { level: 0, exp: 0, expToNext: 100 },
          alchemy: { level: 0, exp: 0, expToNext: 100 },
          comprehension: { level: 0, exp: 0, expToNext: 100 },
          qiControl: { level: 0, exp: 0, expToNext: 100 },
          bodyTempering: { level: 0, exp: 0, expToNext: 100 },
          daoInsight: { level: 0, exp: 0, expToNext: 100 },
          combatSkills: { level: 0, exp: 0, expToNext: 100 },
          socialSkills: { level: 0, exp: 0, expToNext: 100 },
          mentalFortitude: { level: 0, exp: 0, expToNext: 100 },
          spiritBeastTaming: { level: 0, exp: 0, expToNext: 100 },
          meditation: { level: 0, exp: 0, expToNext: 100 },
          forging: { level: 0, exp: 0, expToNext: 100 }
        },
        mentorAffinity: {},
        manuals: [],
        bloodline: null,
        physique: null,
        sect: null,
        techniques: [],
        cultivationPower: 0,
        discipline: 50,
        patience: 50,
        daoHeart: 50,
        reputation: { world: 0 },
        factionStandings: {},
        sectReputations: {},
        teachingProgress: {},
        mentorProgress: {},
        rivalRelationships: {},
        lastRivalEncounters: {},
        factionBattles: [],
        factionReputations: {}
        ,
        cooldowns: { training: {} },
        trainingQueue: null
      },
      world: {
        year: 1,
        day: 1,
        flags: {},
        factions: {},
        heavensList: [],
        lastEpochTournamentYear: 0
      },
      story: {
        currentAct: 'act1',
        mainQuestId: 'first_cultivation',
        questProgress: {},
        activeSectQuests: [],
        activeRandomMissions: [],
        activeBetrayalMissions: []
      },
      ui: {
        currentScreen: 'game',
        selectedMentor: null,
        showMentorModal: false,
        showLore: false,
        currentLoreIndex: 0,
        showCodex: false,
        showDebugMenu: false
      }
    };

    // Save the game
    const saveResult = SaveLoadSystem.saveGame(testGameState);
    expect(saveResult).toBe(true);

    // Load the game
    const loadedData = SaveLoadSystem.loadGame();
    expect(loadedData).not.toBeNull();
    expect(loadedData?.gameState).toEqual(testGameState);
    expect(loadedData?.gameVersion).toBe('1.0.0');
    expect(loadedData?.timestamp).toBeGreaterThan(0);
  });

  test('should return null when no save exists', () => {
    const loadedData = SaveLoadSystem.loadGame();
    expect(loadedData).toBeNull();
  });

  test('should delete save correctly', () => {
    // Create and save a test game
    const testGameState: any = {
      player: {
        name: 'Test Player',
        gender: 'Male',
        race: 'Human',
        background: null,
        age: 18,
        realm: 'mortal',
  realmId: 1,
        minorStage: 1,
        level: 1,
        baseStats: { hp: 100, qi: 100, atk: 10, def: 10, speed: 10 },
        stats: { hp: 100, qi: 100, atk: 10, def: 10, speed: 10 },
        insight: 85,
        combatPower: 100,
        karma: 0,
        cunning: 0,
        resolve: 50,
        resourcefulness: 50,
        currentQi: 0,
        qiRequired: 100,
        lifespan: 150,
        spiritStones: { low: 0, mid: 0, high: 0 },
        yuan: 0,
        inventory: [],
        skills: {},
        mentorAffinity: {},
        manuals: [],
        bloodline: null,
        physique: null,
        sect: null,
        techniques: [],
        cultivationPower: 0,
        discipline: 50,
        patience: 50,
        daoHeart: 50,
        reputation: { world: 0 },
        factionStandings: {},
        sectReputations: {},
        teachingProgress: {},
        mentorProgress: {},
        rivalRelationships: {},
        lastRivalEncounters: {},
        factionBattles: [],
        factionReputations: {}
        ,
        cooldowns: { training: {} },
        trainingQueue: null
      },
      world: {
        year: 1,
        day: 1,
        flags: {},
        factions: {},
        heavensList: [],
        lastEpochTournamentYear: 0
      },
      story: {
        currentAct: 'act1',
        mainQuestId: 'first_cultivation',
        questProgress: {},
        activeSectQuests: [],
        activeRandomMissions: [],
        activeBetrayalMissions: []
      },
      ui: {
        currentScreen: 'game',
        selectedMentor: null,
        showMentorModal: false,
        showLore: false,
        currentLoreIndex: 0,
        showCodex: false,
        showDebugMenu: false
      }
    };

    SaveLoadSystem.saveGame(testGameState);
    
    // Verify save exists
    expect(SaveLoadSystem.loadGame()).not.toBeNull();
    
    // Delete save
    const deleteResult = SaveLoadSystem.deleteSave();
    expect(deleteResult).toBe(true);
    
    // Verify save is gone
    expect(SaveLoadSystem.loadGame()).toBeNull();
  });
});
