import { StorySystem } from '../systems/StorySystem';
import { GameState } from '../types';

function makeGS(): GameState {
  return {
    player: {
      name: 'P', gender: 'Male', race: 'human', background: null, age: 18,
      realmId: 0, realm: 'mortal', combatPower: 0, talentId: 't', minorStage: 0, level: 1,
      baseStats: {}, stats: {}, insight: 0, karma: 0, cunning: 0, resolve: 0, resourcefulness: 0,
      currentQi: 0, qiRequired: 0, lifespan: 100, spiritStones: { low:0, mid:0, high:0 }, yuan:0,
      inventory: [], skills: {}, mentorAffinity: {}, manuals: [], bloodline: null, physique: null,
      sect: null, techniques: [], cultivationPower: 0, discipline: 0, patience: 0, daoHeart: 0,
      reputation: {}, factionStandings: {}, sectReputations: {}, rivalRelationships: {}, lastRivalEncounters: {},
      factionBattles: [], factionReputations: {}, discoveredRecipes: [], currentLocationId: null,
      activeBuffs: [], hp: 100, qi: 50, maxHp: 100, maxQi: 50, teachingProgress: {}, mentorProgress: {}
    },
    world: {
      year: 1, day: 1, tick: 0, flags: {}, factions: {}, activeEvents: [], marketRefreshTimers: {},
      currentWorldType: 'mortal', currentEraId: 'era_1', currentEraIndex: 1, currentEraSeed: 's',
      eraNormalized: { qiDensityNorm: 1, artifactDensityNorm: 1}, eventBias: { dark: 1, neutral: 1, light: 3 }
    },
    story: { currentAct: 'act_test', mainQuestId: 'q', questProgress: {}, activeSectQuests: [], activeRandomMissions: [], completedQuests: [], storyFlags: {} },
    ui: { currentScreen: 'game', selectedMentor: null, showMentorModal: false, showLore: false, currentLoreIndex: 0, showCodex: false, showDebugMenu: false },
    systems: {
      rivals: {}, rivalEncounters: [], rivalCooldowns: {},
      combatHistory: [], teachingProgress: {}, mentorProgress: {}, availableTeachings: {},
      sectReputations: {}, factionStandings: {}, currentSectMissions: [],
      marketInventory: {}, activeAuctions: [], marketRefreshTimes: {},
      questObjectives: {}, questRewards: {}
    }
  } as unknown as GameState;
}

describe('StorySystem era bias prefers tone tags', () => {
  it('orders events with light tone tags ahead when light bias is strongest', () => {
    const ss = new StorySystem();
    // Manually inject an act
    const anySS: any = ss;
    anySS.acts = new Map([
      ['act_test', {
        id: 'act_test', title: 'Test', description: '', mainQuests: [], sideQuests: [],
        events: [
          { id: 'evA', title: 'A', description: 'Dark event', choices: [], tags: ['tone:dark'] },
          { id: 'evB', title: 'B', description: 'Neutral event', choices: [], tags: ['tone:neutral'] },
          { id: 'evC', title: 'C', description: 'Light event', choices: [], tags: ['tone:light'] },
        ]
      }]
    ]);

    const gs = makeGS();
    const events = ss.getAvailableEvents(gs);
    const ids = events.map(e => e.id);
    // Expect light (evC) first due to highest light bias
    expect(ids.indexOf('evC')).toBeLessThan(ids.indexOf('evA'));
    expect(ids.indexOf('evC')).toBeLessThan(ids.indexOf('evB'));
  });

  it('falls back to heuristic when tags missing', () => {
    const ss = new StorySystem();
    const anySS: any = ss;
    anySS.acts = new Map([
      ['act_test', {
        id: 'act_test', title: 'Test', description: '', mainQuests: [], sideQuests: [],
        events: [
          { id: 'evD', title: 'Demon Ambush', description: 'Shadows gather', choices: [] },
          { id: 'evE', title: 'Blessed Spring', description: 'Holy waters', choices: [] },
        ]
      }]
    ]);

    const gs = makeGS();
    const events = ss.getAvailableEvents(gs);
    const ids = events.map(e => e.id);
    expect(ids.indexOf('evE')).toBeLessThan(ids.indexOf('evD'));
  });
});
