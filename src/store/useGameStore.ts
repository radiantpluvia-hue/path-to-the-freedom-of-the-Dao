/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { GameState, Background, GameEvent, Quest, Rival, Manual } from '../types';
import { MiniGameSystem, MiniGameDifficulty, MiniGameId } from '@/systems';
import { CULTIVATION_REALMS, REALM_QI_REQUIREMENTS, REALM_ORDER } from '../data/cultivationRealms';
import { RACE_BACKGROUNDS } from '../data/raceBackgrounds';
import { ALL_BLOODLINES } from '@/data';
import { PHYSIQUES } from '../data/physiques';
import { TAI_YUNG_OPENING_LORE } from '../data/taiYungLore';
import { SectFactionSystem, MarketSystem, CombatSystem, RivalSystem, SaveLoadSystem } from '@/systems';
import { runtimeRng } from '../utils/seededRng';
import { DailyLoopSystem, MentorTeachingSystem, MissionSystem, StorySystem, BreakthroughSystem, EnhancedQuestSystem, CraftingSystem, BuffSystem } from '@/systems';
import type { Buff } from '../types';
export type { Buff };
import { mentorTeachingsLoader } from '../data/mentorTeachingsLoader';
import { ALL_MANUALS } from '../data/manuals';
import { PlaytestScaling } from '../utils/playtestScaling';
import { generateSectMission } from '@/systems';
import type { MentorTeaching } from '../types/MentorTeaching';
import {
  adjustRivalRelationshipEnhanced,
  resolveFactionBattleEnhanced,
  canEncounterRivalEnhanced,
  validateRivalSystemIntegrity
} from './rivalSystemEnhancements';
import { allRecipes as allCraftingRecipes } from '../data/craftingRecipes';
import { generateCultivationSession } from '../../cultivationMechanics';
import { tierLabelFor } from '../data/statTiers';
// import { checkForEvolutions } from '../../utils/evolutionUtils';

// Shared singletons for cross-system coherence
const sharedRivalSystem = new RivalSystem();
const sharedSectFactionSystem = new SectFactionSystem(sharedRivalSystem);
const sharedMarketSystem = new MarketSystem();
const sharedMentorTeachingSystem = new MentorTeachingSystem();
const sharedMiniGameSystem = new MiniGameSystem();
const sharedMissionSystem = new MissionSystem();
const sharedStorySystem = new StorySystem();
const sharedBreakthroughSystem = new BreakthroughSystem();
const sharedEnhancedQuestSystem = new EnhancedQuestSystem();
const sharedCraftingSystem = new CraftingSystem(allCraftingRecipes);
const sharedBuffSystem = new BuffSystem();
import { SeclusionPath, DEFAULT_SECLUSION_STATE } from '@/systems';
import type { SeclusionPath as SeclusionPathType } from '@/systems';
const sharedSeclusionPath = new SeclusionPath();
// Load mentor teachings data into the system
['fang_yuan','fu_yao','han_jue','han_li','lan_wangji','meng_hao','su_ming','xiao_yan'].forEach(mentorId => {
  const teachings = mentorTeachingsLoader.getTeachingsForMentor(mentorId);
  if (teachings && teachings.length) {
    sharedMentorTeachingSystem.loadMentorTeachings(mentorId, teachings);
  }
});

// Helper to normalize rival ids coming from UI/combat (may include 'rival_' prefix)
const normalizeRivalId = (id: string) => id?.replace(/^rival_/, '') || id;

const ACT1_EVENTS: GameEvent[] = [
  {
    id: 'mysterious_manual',
    title: 'Mysterious Manual',
    description: 'You find an ancient cultivation manual hidden in the library.',
    choices: [
      { text: 'Study it carefully', effects: { insight: 1, daoInsight: 1 } },
      { text: 'Ignore it', effects: { patience: 1 } }
    ]
  },
  {
    id: 'sect_recruitment',
    title: 'Sect Recruitment',
    description: 'A sect elder approaches you for recruitment.',
    choices: [
      { text: 'Join eagerly', effects: { reputation: 1 } },
      { text: 'Decline politely', effects: { independence: 1 } }
    ]
  },
  {
    id: 'spirit_beast',
    title: 'Wild Spirit Beast',
    description: 'You encounter a wounded spirit beast in the forest.',
    choices: [
      { text: 'Help heal it', effects: { karma: 1, spiritBeastTaming: 1 } },
      { text: 'Capture it', effects: { combatSkills: 1, karma: -1 } },
      { text: 'Leave it alone', effects: { patience: 1 } }
    ]
  }
];

const QUESTS: Quest[] = [
  {
    id: 'first_cultivation',
    title: 'First Steps in Cultivation',
    description: 'Reach 100 cultivation power',
    requirements: { cultivationPower: 100 },
    rewards: { spiritStones: { low: 1 }, insight: 1 },
    completed: false
  },
  {
    id: 'skill_mastery',
    title: 'Skill Development',
    description: 'Raise any skill to level 3',
    requirements: { skillLevel: 3 },
    rewards: { yuan: 1, insight: 1 },
    completed: false
  }
];

const initialGameState: GameState = {
  player: {
    name: '',
    gender: 'Male',
    race: 'Human',
    background: null,
    age: 18,
    realmId: 1,
    realm: 'mortal', // Starting realm
    talentId: 'mortal',
    minorStage: 1,
    level: 1,
    baseStats: { hp: 100, qi: 100, atk: 10, def: 10, speed: 10 },
    stats: { hp: 100, qi: 100, atk: 10, def: 10, speed: 10 },
    // Player settings (persisted preferences)
    settings: {
      powerScalePercent: 100
    },
    insight: 85,
    combatPower: 100,
    karma: 0,
    cunning: 0,
    resolve: 50,
    resourcefulness: 50,
    currentQi: 0,
    qiRequired: REALM_QI_REQUIREMENTS[REALM_ORDER[0]],
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
      forging: { level: 0, exp: 0, expToNext: 100 },
      // Weapon-specific skills for more granular progression
      swordsmanship: { level: 0, exp: 0, expToNext: 100 },
      spearArts: { level: 0, exp: 0, expToNext: 100 },
      archery: { level: 0, exp: 0, expToNext: 100 },
      daggerArts: { level: 0, exp: 0, expToNext: 100 },
      staffArts: { level: 0, exp: 0, expToNext: 100 }
    },
    mentorAffinity: {
      fang_yuan: 0,
      fu_yao: 0,
      lan_wangji: 0,
      su_ming: 0,
      han_li: 0,
      xiao_yan: 0,
      meng_hao: 0,
      han_jue: 0
    },
    manuals: [],
    bloodline: null,
    physique: null,
  sect: null,
  techniques: [],
  // Optional properties from PlayerState interface
  daoPrinciple: undefined,
  severedAspect: undefined,
  defeatedRivals: [],
  shadowLedger: 0,
  providenceVeil: 0,
  flameAffinity: 0,
  daoComprehension: 0,
  skillPoints: 0,
  // legacy per-system buff mapping (unused here)
  buffs: {},
  experience: 0,
  // Additional properties
  cultivationPower: 0,
  discipline: 50,
  patience: 50,
  daoHeart: 50,
  reputation: { world: 0 },
  factionStandings: {},
  sectReputations: {},
  // Mentor Teaching System Integration
  teachingProgress: {},
  mentorProgress: {},
  // Rival System Integration
  rivalRelationships: {},
  lastRivalEncounters: {},
  factionBattles: [],
  factionReputations: {},
  discoveredRecipes: [],
  activeBuffs: [],
    currentLocationId: null,
    // Added missing properties
    hp: 100,
    qi: 0,
    maxQi: 100,
    maxHp: 100,
    dailyCultivationCount: 0,
    lastDailyReset: Date.now(),
  },
  world: {
    year: 1,
    day: 1,
    tick: 0,
    flags: {},
    factions: {},
    heavensList: [],
    lastEpochTournamentYear: 0,
    activeEvents: [],
    marketRefreshTimers: {}
  },
  story: {
    currentAct: 'act1',
    mainQuestId: 'first_cultivation',
    questProgress: {},
    activeSectQuests: [],
    activeRandomMissions: [],
    activeBetrayalMissions: [],
    completedQuests: [],
    storyFlags: {}
  },
  ui: {
    currentScreen: 'lore',
    selectedMentor: null,
    showMentorModal: false,
    showLore: true,
    currentLoreIndex: 0,
    showCodex: false,
    showDebugMenu: false,
    selectedRival: null
    ,
    // New UI flags for compact layout and quick notes window
    compactLayout: false,
    showNotes: false
  },
  systems: {
    rivals: {},
    rivalEncounters: [],
    rivalCooldowns: {},
    activeCombat: undefined,
    combatHistory: [],
    teachingProgress: {},
    mentorProgress: {},
    availableTeachings: {},
    sectReputations: {},
    factionStandings: {},
    currentSectMissions: [],
    marketInventory: {},
    activeAuctions: [],
    marketRefreshTimes: {},
    questObjectives: {},
    questRewards: {}
  }
};

interface GameStore extends GameState {
  playerState: GameState['player'];
  updatePlayerState: (updates: Partial<GameState['player']>) => void;
  // Actions
  setPlayerProperty: (key: keyof GameState['player'], value: any) => void;
  setUIProperty: (key: keyof GameState['ui'], value: any) => void;
  gainSkillExp: (skillId: string, exp: number) => void;
  evolveSkill: (baseSkillId: string, evolutionPath: string) => void;
  checkRealmBreakthrough: () => void;
  checkMinorStageBreakthrough: () => void;
  addToInventory: (item: any) => void;
  // Market helpers
  purchaseFromMarket: (marketId: string, itemId: string) => boolean;
  listMarkets: () => any[];
  listMarketItems: (marketId: string) => any[];
  listActiveAuctions: () => any[];
  listPlayerMarketInventory: () => Record<string, number>;
  placeBidOnAuction: (auctionId: string, amount: number) => boolean;
  buyoutAuctionItem: (auctionId: string) => boolean;
  // Player selling/listing
  sellToMarket: (marketId: string, itemId: string, quantity: number) => boolean;
  listItemForAuction: (itemId: string, startingBid: number, buyoutPrice?: number) => boolean;
  triggerRandomEvent: () => boolean;
  cultivate: () => void;
  explore: () => void;
  saveGame: () => boolean;
  loadGame: () => boolean;
  // Finalize character creation and transition to game
  finalizeCharacterCreation: (payload: { name: string; gender: 'Male' | 'Female'; race: string; background: Background | null }) => boolean;
  startGame: (payload: { name: string; gender: 'Male' | 'Female'; race: string; background: Background | null }) => boolean;
  addEventLog: (message: string) => void;
  eventLog: string[];
  
  // Seclusion controls
  setSeclusionYears: (years: number) => void;
  // New Seclusion APIs (preferred)
  enterSeclusion: (years?: number, safeMode?: boolean) => void;
  exitSeclusion: () => void;
  seclusionTick: () => void;
  performSeclusionStudy: (intensity?: number) => void;
  seclusionPath?: any;
  
  // Playtest/Demo Features
  enableDemoMode: () => void;
  resetToDemoState: () => void;
  maxAllSkills: () => void;
  gainResources: (amount: number) => void;
  advanceRealm: () => void;
  showDebugMenu: boolean;
  toggleDebugMenu: () => void;
  
  // New Systems
  sectFactionSystem: SectFactionSystem;
  marketSystem: MarketSystem;
  rivalSystem: RivalSystem;
  combatSystem: CombatSystem | null;
  mentorTeachingSystem: MentorTeachingSystem;
  missionSystem: MissionSystem;
  storySystem: StorySystem;
  breakthroughSystem: BreakthroughSystem;
  _initAIOnce?: () => void;
  craftingSystem: CraftingSystem;
  buffSystem: BuffSystem;

  // Mentor teaching
  getAvailableTeachingsForMentor: (mentorId: string) => MentorTeaching[];
  attemptMentorTeaching: (mentorId: string, teachingId: string) => boolean;
  isMentorOnCooldown: (mentorId: string) => boolean;
  getMentorCooldownRemaining: (mentorId: string) => number;
  // Expose visible stat representation: HP numeric, other stats as tier labels
  getVisibleStats: () => { hp: number; qi: string; atk: string; def: string; speed: string };
  
  // Mission system
  generateRandomMission: () => boolean;
  attemptMission: (missionId: string) => boolean;
  completeMission: (missionId: string) => void;
  
  // Story system
  getCurrentAct: () => any;
  getActiveQuests: () => any[];
  getAvailableEvents: () => any[];
  triggerStoryEvent: (eventId: string) => boolean;
  makeStoryChoice: (eventId: string, choiceId: string) => boolean;
  checkQuestCompletion: () => string[];
  getQuestsByType: (type: 'main' | 'side' | 'sect' | 'daily' | 'achievement') => any[];
  clearQuestCompletionNotification: () => void;

  // Enhanced Quest helpers
  getEnhancedQuests: () => any[];
  getActiveEnhancedQuests: () => any[];
  getAvailableEnhancedQuests: () => any[];
  activateEnhancedQuest: (questId: string) => boolean;
  getQuestProgress: (questId: string) => any;
  getObjectiveProgress: (questId: string, objectiveId: string) => any;
  updateObjectiveProgress: (questId: string, objectiveId: string, progress: number) => boolean;

  // Crafting helpers
  getAvailableCraftingRecipes: () => any[];
  experimentWithIngredients: (ingredientItemIds: string[]) => void;
  craftItem: (recipeId: string) => void;
  checkEnhancedQuestCompletion: () => { completed: any[]; updated: any[] };

  // Item/Buff helpers
  useItem: (inventoryIndex: number) => void;
  processBuffs: () => void;
  removeBuff: (buffId: string) => void;
  resetDailyQuests: () => void;
  checkDailyReset: () => void;

  // Sect mission helpers
  requestSectMission: () => void;
  seekRefuge: () => void;
  
  // Rival helpers
  getRivals: () => Rival[];
  getRivalById: (id: string) => Rival | null;
  startRivalEncounter: (rivalId: string) => boolean;
  startCombatWithRival: (rivalId: string) => boolean;
  
  // Lore System
  nextLore: () => void;
  skipLore: () => void;
  
  // Race/Background System
  getRaceBackgrounds: (race: string) => Background[];
  
  // Bloodline/Physique & Manuals System
  assignRandomBloodline: () => void;
  assignRandomPhysique: () => void;
  learnManualById: (manualId: string) => boolean;
  // Attempt to study/learn a manual by id; performs cost checks and deducts resources
  attemptStudy: (manualId: string) => boolean;
  awakenBloodlineIfPossible: () => boolean;
  canEvolveManual: (manualId: string) => { can: boolean; unmet: string[] };
  evolveManual: (manualId: string) => boolean;

  // Rival System Integration
  adjustRivalRelationship: (rivalId: string, change: number) => void;
  markRivalDefeated: (rivalId: string) => void;
  getRivalRelationship: (rivalId: string) => number;
  canEncounterRival: (rivalId: string) => boolean;
  recordRivalEncounter: (rivalId: string) => void;
  getRivalEncounters: (rivalId?: string) => any[];
  getRivalEncounterStatus: (rivalId: string) => { canEncounter: boolean; cooldownDays: number; reason?: string };
  getNextRivalEncounterInDays: (rivalId: string) => number;
  resolveFactionBattle: (battleId: string, outcome: 'victory' | 'defeat') => void;

  // Sect/Faction System Integration
  joinSect: (sectId: string) => boolean;
  leaveSect: () => void;
  getAvailableSects: () => any[];
  getSectReputation: (sectId: string) => number;
  adjustSectReputation: (sectId: string, amount: number) => void;
  adjustFactionStanding: (factionId: string, amount: number) => void;
  getFactionStanding: (factionId: string) => number;
  getAvailableFactionServices: (factionId: string) => any[];
  canAccessFactionService: (factionId: string, serviceId: string) => { canAccess: boolean; reason: string };
  purchaseFactionService: (factionId: string, serviceId: string) => boolean;
  triggerFactionBattleEvent: (playerFaction: string, enemyFaction: string) => { success: boolean; outcome: 'victory' | 'defeat'; standingChange: number; enemyStandingChange: number };

  // Cross-System Validation & Integration
  validateSystemIntegrity: () => { isValid: boolean; errors: string[]; warnings: string[] };
  syncSystemData: () => { success: boolean; syncedSystems: string[]; errors: string[] };
  repairSystemInconsistencies: () => { repaired: boolean; fixes: string[]; remainingIssues: string[] };
  

  // Mini-games
  startMiniGame: (id: MiniGameId, difficulty?: MiniGameDifficulty) => string; // returns sessionId
  completeMiniGame: (result: { moves: number; timeLeft: number; timeLimit: number }) => { score: number } | null;

  // World interaction
  travelTo: (locationId: string | null) => void;

  // Debug
  attachToWindow: () => void;
  
  // Data
  realms: Record<string, any>;
  backgrounds: Background[];
  events: GameEvent[];
  quests: Quest[];
  taiYungLore: string[];
  bloodlines: typeof ALL_BLOODLINES;
  physiques: typeof PHYSIQUES;
}

// Use canonical Buff type from `types.ts`


export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,
  playerState: initialGameState.player,
  updatePlayerState: (updates) => set(state => ({
    player: { ...state.player, ...updates }
  })),

  setPlayerProperty: (key, value) => set(state => ({
    player: { ...state.player, [key]: value }
  })),

  setUIProperty: (key, value) => set(state => ({
    ui: { ...state.ui, [key]: value }
  })),

  eventLog: ['Welcome to your cultivation journey...'],
  realms: CULTIVATION_REALMS,
  backgrounds: [],
  events: ACT1_EVENTS,
  quests: QUESTS,
  taiYungLore: TAI_YUNG_OPENING_LORE,
  bloodlines: ALL_BLOODLINES,
  physiques: PHYSIQUES,
  
  // Initialize systems (use shared singletons)
  rivalSystem: sharedRivalSystem,
  sectFactionSystem: sharedSectFactionSystem,
  marketSystem: sharedMarketSystem,
  combatSystem: null,
  mentorTeachingSystem: sharedMentorTeachingSystem,
  missionSystem: sharedMissionSystem,
  storySystem: sharedStorySystem,
  breakthroughSystem: sharedBreakthroughSystem,
  enhancedQuestSystem: sharedEnhancedQuestSystem,
  craftingSystem: sharedCraftingSystem,
  buffSystem: sharedBuffSystem,
  // Hermit/Solo Path system
  // primary seclusion path instance (renamed from hermitPath)
  seclusionPath: sharedSeclusionPath,
  // backwards-compatible alias for existing code/tests (legacy property removed from exports)

  // Initialize AI system and attach to RivalSystem
  _initAIOnce: (() => {
    let initialized = false;
    return () => {
      if (initialized) return;
    try {
      // runtime dynamic import: load RivalAISystem at runtime when initializing AI
      // Use dynamic import to avoid synchronous require() and satisfy ESLint rules
      void import('@/systems/RivalAISystem')
        .then(mod => {
          const RivalAISystem = mod.RivalAISystem;
          try {
            const ai = new RivalAISystem();
            sharedRivalSystem.attachAISystem(ai);
            initialized = true;
          } catch (e) {
            // intentionally ignored - non-fatal AI attach failure
          }
        })
        .catch(() => {
          // intentionally ignored - module failed to load
        });
    } catch (e) {
      /* intentionally ignored */
    }
    };
  })(),

  // Seclusion setter (usable from Golden Immortal+)
  setSeclusionYears: (years: number) => set(state => ({
    world: {
      ...state.world,
      flags: { ...state.world.flags, seclusionYears: Math.max(1, Math.floor(years || 1)) }
    }
  })),

  // Seclusion Path API (preferred)
  enterSeclusion: (years: number = 1, safeMode: boolean = false) => set(state => {
    try {
      (get() as any).seclusionPath.enterSeclusion(years, safeMode);
      get().addEventLog(`You adopt a seclusion for ${years} year(s).`);
      return { player: { ...state.player } } as any;
    } catch (e) {
      console.error('enterSeclusion failed', e);
      return state;
    }
  }),

  exitSeclusion: () => set(state => {
    try {
      (get() as any).seclusionPath.exitSeclusion();
      get().addEventLog('You end your seclusion. The world awaits.');
      return { player: { ...state.player } } as any;
    } catch (e) {
      console.error('exitSeclusion failed', e);
      return state;
    }
  }),

  seclusionTick: () => set(state => {
    try {
      const seclusion = (get() as any).seclusionPath as SeclusionPathType;
      const effects = seclusion.tick({ player: state.player, world: state.world, story: state.story, ui: state.ui, systems: state.systems } as any);
      // Apply simple effects: qi and cp
      const newPlayer = { ...state.player } as any;
      if (effects.qiGain) {
        newPlayer.currentQi = (newPlayer.currentQi || 0) + effects.qiGain;
      }
      if (effects.cpGain) {
        newPlayer.cultivationPower = (newPlayer.cultivationPower || 0) + effects.cpGain;
      }
      // Translate events to logs for now. Accumulate player changes and logs, and perform a single state update at the end
      let combatToSet: any = null;
      const eventLogs: string[] = [];
      if (effects.events && effects.events.length) {
        effects.events.forEach((e: any) => {
            if (e.type === 'rare_source_found') {
            // Grant a simple manual fragment/item. Use canonical data loader if present.
            try {
              const allManuals: any[] = ALL_MANUALS || [];
              const candidate = allManuals.find((m: any) => m.rank === 'common') || allManuals[0];
              if (candidate) {
                const manualItem: any = {
                  id: candidate.id || 'manual_fragment',
                  name: candidate.name || 'Manual Fragment',
                  description: candidate.description || 'A fragment of a manual found in seclusion.',
                  rank: candidate.rank || 'common',
                  effects: candidate.effects || {}
                };
                // mutate the local newPlayer so final return includes manuals
                (newPlayer.manuals as any[]) = [...(newPlayer.manuals || []), manualItem];
                eventLogs.push('You discover a rare manual/source in seclusion! It has been added to your manuals.');
                return;
              }
            } catch (err) {
              // fallback: add a generic manual fragment with required fields
              const frag: any = { id: 'manual_fragment', name: 'Manual Fragment', description: 'A fragment', rank: 'common', effects: {} };
              (newPlayer.manuals as any[]) = [...(newPlayer.manuals || []), frag];
              eventLogs.push('You discover a rare manual/source in seclusion!');
            }
            } else if (e.type === 'tribulation') {
            eventLogs.push('A tribulation descends upon your seclusion!');
            try {
              // Instantiate CombatSystem similar to startCombatWithRival
              // Use imported CombatSystem class
              const store = get();
              const playerPart: any = {
                id: 'player',
                name: store.player.name || 'You',
                hp: store.player.hp || store.player.maxHp || 100,
                maxHp: store.player.maxHp || 100,
                qi: store.player.qi || store.player.maxQi || 0,
                maxQi: store.player.maxQi || 0,
                ap: 5,
                maxAp: 5,
                stats: {
                  atk: store.player.stats?.atk || 10,
                  def: store.player.stats?.def || 10,
                  speed: store.player.stats?.speed || 10
                },
                techniques: [] as any[],
                buffs: [],
                debuffs: []
              };

              const rivalTemplate: any = {
                id: `tribulation_${Date.now()}`,
                name: 'Tribulation Storm',
                hp: Math.max(10, Math.floor((store.player.hp || 100) * 0.5)),
                maxHp: Math.max(10, Math.floor((store.player.hp || 100) * 0.5)),
                qi: 20,
                maxQi: 20,
                ap: 3,
                maxAp: 3,
                stats: { atk: Math.max(5, Math.floor((store.player.stats?.atk || 10) * 0.6)), def: 5, speed: 8 },
                techniques: [],
                buffs: [],
                debuffs: []
              };

              combatToSet = new CombatSystem(playerPart, [rivalTemplate], store, store.rivalSystem, { type: 'normal' });
              eventLogs.push('A tribulation forces you into combat!');
            } catch (err) {
              // fallback: minor HP penalty
              newPlayer.hp = Math.max(1, (newPlayer.hp || 100) - 5);
              eventLogs.push('You survive the tribulation but suffer some harm.');
            }
          } else if (e.type === 'comprehension_breakthrough') {
            // Apply breakthrough rewards: add some daoComprehension and skill XP
            const magnitude = e.magnitude || 1;
            newPlayer.daoComprehension = (newPlayer.daoComprehension || 0) + magnitude;
            newPlayer.skills = { ...newPlayer.skills };
            newPlayer.skills.comprehension = { ...newPlayer.skills.comprehension };
            newPlayer.skills.comprehension.exp = (newPlayer.skills.comprehension.exp || 0) + (10 * magnitude);
            eventLogs.push('A comprehension breakthrough grants you deeper Dao insight.');
          }
        });
      }

      // Build final return state. Merge any event log additions and optional combat/UI changes
      const finalState: any = {
        player: newPlayer,
        world: { ...state.world, tick: state.world.tick + 1 }
      };
      if (combatToSet) {
        finalState.combatSystem = combatToSet;
        finalState.ui = { ...state.ui, currentScreen: 'combat' };
      }
      if (eventLogs.length) {
        finalState.eventLog = [...state.eventLog, ...eventLogs];
      }

      return finalState as any;
    } catch (e) {
      console.error('seclusionTick failed', e);
      return state;
    }
  }),

  // Seclusion study action - preferred API
  performSeclusionStudy: (intensity: number = 1) => set(state => {
    try {
      const seclusion = (get() as any).seclusionPath as SeclusionPathType;
      const res = seclusion.performStudy({ player: state.player, world: state.world, story: state.story, ui: state.ui, systems: state.systems } as any, intensity);
      // Apply xp gains to comprehension skill
      const newPlayer = { ...state.player } as any;
      newPlayer.skills = { ...newPlayer.skills };
      newPlayer.skills.comprehension = { ...newPlayer.skills.comprehension };
      newPlayer.skills.comprehension.exp = (newPlayer.skills.comprehension.exp || 0) + (res.xpGained || 0);
      get().addEventLog(`You study in seclusion and gain ${res.xpGained} comprehension XP.`);
      return { player: newPlayer, world: { ...state.world, tick: state.world.tick + 1 } } as any;
    } catch (e) {
      console.error('performSeclusionStudy failed', e);
      return state;
    }
  }),

  // Backwards-compatible API wrappers (deprecated names) - delegate to new implementations
  enterHermitSeclusion: (years: number = 1, safeMode: boolean = false) => (get() as any).enterSeclusion(years, safeMode),
  exitHermitSeclusion: () => (get() as any).exitSeclusion(),
  hermitTick: () => (get() as any).seclusionTick(),
  performHermitStudy: (intensity: number = 1) => (get() as any).performSeclusionStudy(intensity),

  // Data helpers
  getRaceBackgrounds: (race: string) => RACE_BACKGROUNDS[race] || [],

  // Player settings helpers (centralized access for preferences)
  getSettings: () => {
    const s = get();
    return (s.player as any).settings || {};
  },
  setSettings: (updates: Record<string, any>) => {
    set(state => ({ player: { ...state.player, settings: { ...((state.player as any).settings || {}), ...updates } } }));
  },

  // Mini-game API
  startMiniGame: (id: MiniGameId, difficulty: MiniGameDifficulty = 'easy') => {
    const store = get();
    const session = sharedMiniGameSystem.startSession(id, difficulty, store.world.tick);
    set(state => ({ ui: { ...state.ui, activeMiniGame: session } }));
    // replaceAll is not available in older libs; use split/join for compatibility
    get().addEventLog(`Started ${id.split('_').join(' ')} (difficulty: ${difficulty}).`);
    return session.sessionId;
  },
  completeMiniGame: (result: { moves: number; timeLeft: number; timeLimit: number }) => {
    const active = get().ui.activeMiniGame;
    if (!active) return null;
    const outcome = sharedMiniGameSystem.endSession(active as any, result);
    set(state => ({ ui: { ...state.ui, activeMiniGame: null } }));
    // replaceAll is not available in older libs; use split/join for compatibility
    get().addEventLog(`Completed ${String(active.id).split('_').join(' ')} with score ${outcome.score}.`);
    return outcome;
  },

  // World interaction
  travelTo: (locationId: string | null) => {
    set(state => ({
      player: { ...state.player, currentLocationId: locationId }
    }));
    get().addEventLog(locationId ? `You have arrived at ${locationId.replace(/_/g, ' ')}.` : 'You have left the special location.');
  },
  // Visible stats: HP numeric remains visible, other stats are shown as tier names
  getVisibleStats: () => {
    const store = get();
    const p = store.player;
    return {
      hp: p.hp ?? p.maxHp ?? 0,
      qi: tierLabelFor(p.stats?.qi ?? p.qi ?? 0),
      atk: tierLabelFor(p.stats?.atk ?? 0),
      def: tierLabelFor(p.stats?.def ?? 0),
      speed: tierLabelFor(p.stats?.speed ?? 0)
    };
  },
  // Debug
  attachToWindow: () => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).gameStore = get();
      }
    } catch (e) {
      /* intentionally ignored */
    }
  },

  // Mentor teaching system integration
  getAvailableTeachingsForMentor: (mentorId: string) => {
    const store = get();
    return sharedMentorTeachingSystem.getAvailableTeachings(mentorId, {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as GameState);
  },

  isMentorOnCooldown: (mentorId: string) => {
    const store = get();
    return sharedMentorTeachingSystem.isOnMentorCooldown(mentorId, {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as GameState);
  },

  getMentorCooldownRemaining: (mentorId: string) => {
    const store = get();
    return sharedMentorTeachingSystem.getMentorCooldownRemaining(mentorId, {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as GameState);
  },

  attemptMentorTeaching: (mentorId: string, teachingId: string) => {
    const store = get();
    const res = sharedMentorTeachingSystem.attemptTeaching(teachingId, {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as GameState);

    // Increment global tick for the attempt action
    set(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));

    // Apply updated per-teaching progress
    if (res.updatedProgress) {
      set(state => ({
        player: {
          ...state.player,
          teachingProgress: {
            ...state.player.teachingProgress,
            [teachingId]: res.updatedProgress as any
          }
        }
      }));
    }

    // Apply mentor cooldown progress
    if (res.updatedMentorProgress) {
      const { mentorId: mid, progress } = res.updatedMentorProgress;
      set(state => ({
        player: {
          ...state.player,
          mentorProgress: {
            ...state.player.mentorProgress,
            [mid]: progress
          }
        }
      }));
    }

    // Log cooldown feedback if blocked
    if (!res.result.success && (res.result as any).penaltyConsequences?.cooldownRemaining !== undefined) {
      const remaining = (res.result as any).penaltyConsequences.cooldownRemaining;
      get().addEventLog(`Mentor ${mentorId} is unavailable for ${remaining} more ticks.`);
      return false;
    }

    // On success, log and return true
    if (res.result.success) {
      get().addEventLog(`You completed teaching ${teachingId} with mentor ${mentorId}.`);
      return true;
    }

    // Failure but not cooldown-blocked
    get().addEventLog(`Teaching ${teachingId} attempt with mentor ${mentorId} failed.`);
    return false;
  },

  // Mission system integration
  generateRandomMission: () => {
    const store = get();
    if (!store.player.sect) {
      store.addEventLog('You must join a sect before taking missions.');
      return false;
    }

    if (store.story.activeRandomMissions.length >= 3) {
      store.addEventLog('You already have too many active missions.');
      return false;
    }

    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: (store.systems as any)
    } as any as GameState;

    const mission = sharedMissionSystem.generateRandomMission(gameState);
    if (!mission) {
      store.addEventLog('No suitable missions available at your current level.');
      return false;
    }

    set(state => ({
      story: {
        ...state.story,
        activeRandomMissions: [...state.story.activeRandomMissions, mission]
      }
    }));

    store.addEventLog(`New mission available: ${mission.title}`);
    return true;
  },

  attemptMission: (missionId: string) => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: (store.systems as any)
    } as any as GameState;

    const result = sharedMissionSystem.attemptMission(missionId, gameState);
    
    if (result.success && result.rewards) {
      // Apply minimal playtest scaling to mission rewards
      const scaledRewards = PlaytestScaling.applyScaledEffects(result.rewards as any, { source: 'quest' });

      const updates: any = {};
      
      if (scaledRewards.spiritStones) {
        const currentStones = store.player.spiritStones || { low: 0, mid: 0, high: 0 };
        updates.spiritStones = {
          low: currentStones.low + (scaledRewards.spiritStones.low || 0),
          mid: currentStones.mid + (scaledRewards.spiritStones.mid || 0),
          high: currentStones.high + (scaledRewards.spiritStones.high || 0)
        };
      }
      
      if (scaledRewards.sectReputation) {
        const current = store.player.sectReputations?.[store.player.sect || ''] || 0;
        updates.sectReputations = {
          ...(store.player.sectReputations || {}),
          [store.player.sect || '']: current + scaledRewards.sectReputation
        };
      }
      
      if (scaledRewards.karma) {
        updates.karma = (store.player.karma || 0) + scaledRewards.karma;
      }

      set(state => ({
        player: { ...state.player, ...updates }
      }));

      // Mark mission as completed and remove from active missions
      store.completeMission(missionId);
    } else if (result.consequences?.rivalInterference) {
      // Handle rival interference consequences
      if (result.consequences.reputationLoss && store.player.sect) {
        const sectId = store.player.sect;
        const currentRep = store.player.sectReputations?.[sectId] || 0;
        set(state => ({
          player: { 
            ...state.player, 
            sectReputations: {
              ...(state.player.sectReputations || {}),
              [sectId]: Math.max(0, currentRep - (result.consequences!.reputationLoss!))
            }
          }
        }));
      }
    }

    store.addEventLog(result.message);
    return result.success;
  },

  completeMission: (missionId: string) => {
    set(state => ({
      story: {
        ...state.story,
        activeRandomMissions: state.story.activeRandomMissions.filter(m => m.id !== missionId)
      }
    }));
  },

  // Story system integration
  getCurrentAct: () => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    return sharedStorySystem.getCurrentAct(gameState);
  },

  getActiveQuests: () => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    return sharedStorySystem.getActiveQuests(gameState);
  },

  getAvailableEvents: () => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    return sharedStorySystem.getAvailableEvents(gameState);
  },

  triggerStoryEvent: (eventId: string) => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    const event = sharedStorySystem.triggerEvent(eventId, gameState);
    if (event) {
      store.addEventLog(`Story event triggered: ${event.title}`);
      return true;
    }
    return false;
  },

  makeStoryChoice: (eventId: string, choiceId: string) => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    const success = sharedStorySystem.makeChoice(eventId, choiceId, gameState);
    if (success) {
      // Update the store with the modified game state
      set(state => ({
        player: { ...gameState.player },
        story: { ...gameState.story }
      }));
      
      store.addEventLog(`Made story choice in event ${eventId}`);
      
      // Check for quest completion after choice
      store.checkQuestCompletion();
    }
    return success;
  },

  checkQuestCompletion: () => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    const completedQuestIds = sharedStorySystem.checkQuestCompletion(gameState);
    
    if (completedQuestIds.length > 0) {
      // Update the store with any changes made by quest completion
      set(state => ({
        story: { ...gameState.story }
      }));
      
      completedQuestIds.forEach(questId => {
        store.addEventLog(`Quest completed: ${questId}`);
      });
    }
    
    return completedQuestIds;
  },

  // Enhanced Quest System Methods
  getEnhancedQuests: () => {
    return sharedEnhancedQuestSystem.getAllQuests();
  },

  getActiveEnhancedQuests: () => {
    return sharedEnhancedQuestSystem.getActiveQuests();
  },

  getQuestsByType: (type: 'main' | 'side' | 'sect' | 'daily' | 'achievement') => {
    return sharedEnhancedQuestSystem.getQuestsByType(type);
  },

  getAvailableEnhancedQuests: () => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    return sharedEnhancedQuestSystem.getAvailableQuests(gameState);
  },

  // Sect mission helpers
  requestSectMission: () => {
    const store = get();

    if (!store.player.sect) {
      store.addEventLog('You are not part of a sect. You cannot request a mission.');
      return;
    }

    const hasActiveSectMission = (store.story.quests || []).some(
      (q: any) => q.id?.startsWith('sect_mission_') && q.status === 'active'
    );

    if (hasActiveSectMission) {
      store.addEventLog('You already have an active sect mission. Complete it first.');
      return;
    }

    const newMission = generateSectMission(store.player as any);

    set(state => ({
      story: {
        ...state.story,
        quests: [...(state.story.quests || []), newMission],
      },
    }));

    store.addEventLog(`New Sect Mission: You have been tasked with "${newMission.title}".`);
  },

  seekRefuge: () => {
    const store = get();
    const expelledFromSect = store.world.flags.expelledFrom;
    if (!expelledFromSect) return;

    store.addEventLog(`Cast out from the ${expelledFromSect}, you weigh your options.`);

    const refugeEvent = {
      title: 'A Fork in the Road',
      description: 'You are a wanderer now, a cultivator without a sect. The world is vast and dangerous. What will you do?',
      choices: [
        {
          text: 'Become a rogue cultivator, living by your own rules.',
          narrative: 'You decide to forge your own path, free from the constraints of any sect. The life of a rogue cultivator will be difficult, but your destiny is your own.',
          effects: { setFlag: { path: 'rogue_cultivator' } }
        },
        {
          text: 'Seek out a rival sect, offering your services and secrets.',
          narrative: "Vengeance burns in your heart. You will find your former sect's rivals and offer them your allegiance... for a price.",
          effects: { setFlag: { path: 'sect_betrayer' } }
        }
      ]
    };

    set(state => ({ ui: { ...state.ui, activeStoryChoice: refugeEvent as any } }));
  },

  activateEnhancedQuest: (questId: string) => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    const success = sharedEnhancedQuestSystem.activateQuest(questId, gameState);
    if (success) {
      const quest = sharedEnhancedQuestSystem.getQuest(questId);
      if (quest) {
        store.addEventLog(`New quest started: ${quest.title}`);
      }
    }
    return success;
  },

  checkEnhancedQuestCompletion: () => {
    const store = get();
    const gameState = {
      player: store.player,
      world: store.world,
      story: store.story,
      ui: store.ui,
      systems: store.systems
    } as unknown as GameState;

    const result = sharedEnhancedQuestSystem.checkQuestCompletion(gameState);
    
    if (result.completed.length > 0 || result.updated.length > 0) {
      // Update the store with any changes made by quest completion
      set(state => ({
        player: { ...gameState.player },
        story: { ...gameState.story }
      }));
      
      // Log completed quests
      result.completed.forEach(quest => {
        store.addEventLog(`🎉 Quest completed: ${quest.title}!`);
        
        // Show completion notification
        set(state => ({
          ui: { 
            ...state.ui, 
            completedQuest: quest,
            showQuestCompletion: true 
          }
        }));
      });
    }
    
    return result;
  },

  getQuestProgress: (questId: string) => {
    return sharedEnhancedQuestSystem.getQuestProgress(questId);
  },

  getObjectiveProgress: (questId: string, objectiveId: string) => {
    return sharedEnhancedQuestSystem.getObjectiveProgress(questId, objectiveId);
  },

  updateObjectiveProgress: (questId: string, objectiveId: string, progress: number) => {
    return sharedEnhancedQuestSystem.updateObjectiveProgress(questId, objectiveId, progress);
  },

  // Crafting System Methods
  getAvailableCraftingRecipes: () => {
    const store = get();
    return store.craftingSystem.getAvailableRecipes(store.player);
  },

  experimentWithIngredients: (ingredientItemIds: string[]) => {
    const store = get();
    const ingredients = ingredientItemIds.reduce((acc, id) => {
      const existing = acc.find(i => i.itemId === id);
      if (existing) {
        existing.quantity++;
      } else {
        acc.push({ itemId: id, quantity: 1 });
      }
      return acc;
    }, [] as { itemId: string; quantity: number }[]);

    const result = store.craftingSystem.experiment(ingredients, store.player);
    store.addEventLog(result.message);

    const playerUpdate = { ...store.player };
    // Consume ingredients
    const newInventory = [...playerUpdate.inventory];
    for (const itemId of ingredientItemIds) {
      const indexToRemove = newInventory.findIndex(item => item.itemId === itemId);
      if (indexToRemove > -1) {
        newInventory.splice(indexToRemove, 1);
      }
    }
    playerUpdate.inventory = newInventory;

    if (result.success && result.discoveredRecipeId) {
      playerUpdate.discoveredRecipes = [...(playerUpdate.discoveredRecipes || []), result.discoveredRecipeId];
    }

    set({ player: playerUpdate });

    // Grant skill EXP
    if (result.expGained > 0) store.gainSkillExp('alchemy', result.expGained); // Assuming alchemy for now
  },

  craftItem: (recipeId: string) => {
    const store = get();
    const recipe = store.craftingSystem.getRecipe(recipeId);
    if (!recipe) {
      store.addEventLog(`Recipe ${recipeId} not found.`);
      return;
    }
    const result = store.craftingSystem.craft(recipeId, store.player, store.player.currentLocationId);
    store.addEventLog(result.message);

    // Create a mutable draft of the player state
    const playerUpdate = { ...store.player };

    // 1. Consume ingredients
    const ingredientsToRemove = recipe.ingredients.map(ing => ing.itemId);
    const newInventory = [...playerUpdate.inventory];
    for (const ingredient of recipe.ingredients) {
        for (let i = 0; i < ingredient.quantity; i++) {
            const indexToRemove = newInventory.findIndex(item => item.itemId === ingredient.itemId);
            if (indexToRemove > -1) {
                newInventory.splice(indexToRemove, 1);
            }
        }
    }
    playerUpdate.inventory = newInventory;

    // 2. Add crafted item to inventory if successful
    if (result.success && result.item) {
      playerUpdate.inventory.push(result.item);
    }

    set({ player: playerUpdate });
    // 3. Grant skill EXP
  if (result.expGained > 0) store.gainSkillExp(String(recipe.skill), result.expGained);
  },

  // Item Consumption and Buff System
  useItem: (inventoryIndex: number) => {
    const store = get();
    const item = store.player.inventory[inventoryIndex];

    if (!item) {
      store.addEventLog('Item not found.');
      return;
    }

    // Create a mutable draft of the player state
    let playerUpdate = { ...store.player };

    // 1. Remove item from inventory
    const newInventory = [...playerUpdate.inventory];
    newInventory.splice(inventoryIndex, 1);
    playerUpdate.inventory = newInventory;

    store.addEventLog(`You used ${item.name}.`);

    // 2. Apply effects
    const effects = item.effects || {};
    const uniqueProps = item.uniqueProperties;

    // Immediate effects
    if (effects.qi_recovery) {
      playerUpdate.currentQi = Math.min(playerUpdate.qiRequired, playerUpdate.currentQi + effects.qi_recovery);
    }

    // Permanent stat boosts
    if (effects.permanent_stat_boost) {
      playerUpdate.baseStats = { ...playerUpdate.baseStats };
      playerUpdate.stats = { ...playerUpdate.stats };
      for (const [stat, value] of Object.entries(effects.permanent_stat_boost as Record<string, number>)) {
        if (typeof value === 'number') {
          // Apply to both base (for permanence) and current (for immediate effect)
          (playerUpdate.baseStats as any)[stat] = ((playerUpdate.baseStats as any)[stat] || 0) + value;
          (playerUpdate.stats as any)[stat] = ((playerUpdate.stats as any)[stat] || 0) + value;
          store.addEventLog(`Your foundation strengthens. Base ${stat} has permanently increased by ${value}!`);
        }
      }
    }

    // Temporary stat buffs (flat or percent)
    if (effects.temporary_stat_boost) {
      const buff = sharedBuffSystem.createBuff(item, 'temporary_stat_boost', { stats: effects.temporary_stat_boost }, effects.duration);
      playerUpdate = sharedBuffSystem.applyBuff(playerUpdate, buff);
    }

    // Triggered effects (like thorn armor)
    if (effects.temporary_triggered_effect) {
      const buff = sharedBuffSystem.createBuff(item, 'triggered_effect', { triggered: effects.temporary_triggered_effect }, effects.duration);
      playerUpdate = sharedBuffSystem.applyBuff(playerUpdate, buff);
    }

    // Unique, action-based buffs
    if (uniqueProps?.specialEffectId === 'qi_purification_1') {
      const buff = sharedBuffSystem.createBuff(item, 'qi_purification', { special: 'qi_purification_1' }, 1, 'actions');
      playerUpdate = sharedBuffSystem.applyBuff(playerUpdate, buff);
    }

    set({ player: playerUpdate });
  },

  processBuffs: () => {
    const store = get();
    let playerUpdate = { ...store.player } as any;

    // Animation delay (ms) before removing an expired buff so UI can animate
    const ANIMATION_MS = 700;

    // Iterate buffs and mark as expiring; schedule removal after animation
    for (const buff of playerUpdate.activeBuffs) {
      if (buff.durationType === 'ticks' && !buff.expiring) {
        buff.duration -= 1;
        if (buff.duration <= 0) {
          // mark as expiring and schedule final removal+revert
          buff.expiring = true;
          // update store immediately so UI can animate
          set({ player: playerUpdate });
          // Schedule removal after animation
          const idToRemove = buff.id;
          setTimeout(() => {
            try {
              const s = get();
              let p = { ...s.player } as any;
              const idx = p.activeBuffs.findIndex((b: Buff) => b.id === idToRemove);
              if (idx === -1) return;
              const [removed] = p.activeBuffs.splice(idx, 1);
              p = sharedBuffSystem.revertBuffs(p, [removed]);
              set({ player: p });
            } catch (e) {
              // ignore
            }
          }, ANIMATION_MS);
        }
      }
    }

    // Persist any immediate changes (e.g., duration decrements or newly-marked expiring flags)
    set({ player: playerUpdate });
  },

  removeBuff: (buffId: string) => {
    const store = get();
    let playerUpdate = { ...store.player };
    const idx = playerUpdate.activeBuffs.findIndex(b => b.id === buffId);
    if (idx === -1) return;
    const [removed] = playerUpdate.activeBuffs.splice(idx, 1);
    // Revert effects of the removed buff
    playerUpdate = sharedBuffSystem.revertBuffs(playerUpdate, [removed]);
    set({ player: playerUpdate });
  },

  clearQuestCompletionNotification: () => {
    set(state => ({
      ui: { 
        ...state.ui, 
        completedQuest: null,
        showQuestCompletion: false 
      }
    }));
  },

  resetDailyQuests: () => {
    // Use DailyLoopSystem to conservatively reset player daily counters
    set(state => ({ player: DailyLoopSystem.resetDailyForPlayer({ ...state.player }) } as any));

    // Reset daily quest progress
    const store = get();
    store.updateObjectiveProgress('daily_cultivation', 'cultivate_three_times', 0);
  },

  checkDailyReset: () => {
    const store = get();
    const player = store.player;
    const lastReset = player.lastDailyReset || 0;
    if (DailyLoopSystem.hasDayPassed(lastReset)) {
      // Reset player-level daily counters
      store.resetDailyQuests();

      // Advance rival growth for each rival in the system (use world day if available)
      try {
        const currentDay = store.world?.day || Math.floor(Date.now() / DailyLoopSystem.ONE_DAY_MS);
        const allRivals = store.rivalSystem.getAllRivals ? store.rivalSystem.getAllRivals() : [];
        if (Array.isArray(allRivals)) {
          allRivals.forEach((r: any) => {
            try {
              // RivalSystem expects a rival id and currentDay for growth processing
              if (store.rivalSystem && typeof store.rivalSystem.processRivalGrowth === 'function') {
                store.rivalSystem.processRivalGrowth(r.id, currentDay);
              }
            } catch (e) {
              /* ignore per-rival errors */
            }
          });
        }
      } catch (e) {
        /* swallow - best-effort daily rival progression */
      }
    }
  },

  // New explicit daily tick to run daily systems (resets, rival growth, etc.)
  tickDaily: () => {
    const store = get();
    store.checkDailyReset();
    // Advance world day and tick counter conservatively, then queue rival growth
    set(state => ({ world: { ...state.world, day: (state.world.day || 0) + 1, tick: (state.world.tick || 0) + 1 } }));

    // Queue rival growth for all rivals based on the new day value
    try {
      const newDay = get().world.day || Math.floor(Date.now() / DailyLoopSystem.ONE_DAY_MS);
      const allRivals = get().rivalSystem.getAllRivals ? get().rivalSystem.getAllRivals() : [];
      if (Array.isArray(allRivals)) {
        allRivals.forEach((r: any) => {
          try {
            if (get().rivalSystem && typeof get().rivalSystem.processRivalGrowth === 'function') {
              get().rivalSystem.processRivalGrowth(r.id, newDay);
            }
          } catch (e) {
            // swallow per-rival errors to keep tickDaily robust
          }
        });
      }
    } catch (e) {
      /* intentionally ignored - best-effort rival progression */
    }
  },

  // Learn a manual by id (from data), applying its effects
  learnManualById: (manualId: string) => {
    try {
    // Load manuals from canonical data package (support multiple export shapes)
    // eslint-disable-next-line @typescript-eslint/no-var-requires -- runtime-only data access
    const manualModule = require('@/data/manuals');
      const allManuals: Manual[] = (manualModule?.ALL_MANUALS || manualModule?.MANUALS || manualModule?.manuals) || [];
      const manual = allManuals.find(m => m.id === manualId);
      if (!manual) return false;
      const state = get();
      if (state.player.manuals.some(m => m.id === manualId)) return false;

      const updatedStats = { ...state.player.stats } as Record<string, number>;
      const updatedSkills = { ...state.player.skills } as Record<string, { level: number; exp: number; expToNext: number }>;

      const effects = manual.effects || {};
      if (effects.stats) {
        Object.entries(effects.stats).forEach(([key, val]) => {
          if (typeof val === 'number') {
            updatedStats[key] = (updatedStats[key] || 0) + val;
          } else if (val && typeof val === 'object' && 'base' in val) {
            updatedStats[key] = (updatedStats[key] || 0) + val.base;
          }
        });
      }
      if ((effects as any).skills) {
        Object.entries((effects as any).skills as Record<string, number>).forEach(([skillId, bonus]) => {
          if (updatedSkills[skillId]) {
            updatedSkills[skillId] = { ...updatedSkills[skillId], level: Math.max(updatedSkills[skillId].level, bonus) };
          }
        });
      }

      set({
        player: {
          ...state.player,
          stats: updatedStats,
          skills: updatedSkills,
          manuals: [...state.player.manuals, manual]
        }
      });
      get().addEventLog(`Learned manual: ${manual.name}`);
      return true;
    } catch (e) {
      /* intentionally ignored */
      return false;
    }
  },

  // Centralized study action: checks cost, deducts resources, and learns manual
  attemptStudy: (manualId: string) => {
    try {
  
  // Load manuals from canonical data package (support multiple export shapes)
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- runtime-only data access
  const manualModule = require('@/data/manuals');
    const allManuals: any[] = (manualModule?.ALL_MANUALS || manualModule?.MANUALS || manualModule?.manuals) || [];
      const manual = allManuals.find(m => m.id === manualId);
      if (!manual) return false;

      const store = get();
      const player = store.player;

      // Derive a numeric tier: prefer explicit `tier`, else map `rank` to a tier
      const rankToTier: Record<string, number> = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5,
        mythical: 6,
        transcendent: 7
      };
      const derivedTier = typeof manual.tier === 'number' ? manual.tier : (rankToTier[(manual.rank || '')] || 1);
      // Yuan cost: prefer explicit `.cost?.yuan`, else derive from tier. Ensure a minimum of 1
      // so common manuals don't become free and break affordability checks in tests.
      const costYuan = (manual.cost && typeof manual.cost.yuan === 'number')
        ? manual.cost.yuan
        : Math.max(1, Math.floor(derivedTier / 2));

      // QI cost: prefer explicit `.cost?.qi`, else derive from effects (qiGathering).
      // Use a minimum of 1 when deriving so manuals without explicit costs still require some QI.
      const derivedQiFromEffects = Math.floor((((manual.effects && (manual.effects as any).qiGathering) || 0) / 50));
      const costQi = (manual.cost && typeof manual.cost.qi === 'number')
        ? manual.cost.qi
        : Math.max(1, derivedQiFromEffects);

      if ((player.yuan || 0) < costYuan) {
        get().addEventLog('Insufficient yuan to study this manual.');
        return false;
      }
      if ((player.currentQi || 0) < costQi) {
        get().addEventLog('Insufficient QI to study this manual.');
        return false;
      }

      // Deduct resources and persist
      set(state => ({
        player: {
          ...state.player,
          yuan: Math.max(0, (state.player.yuan || 0) - costYuan),
          currentQi: Math.max(0, (state.player.currentQi || 0) - costQi)
        }
      }));

      // Call underlying learning routine
      const learned = get().learnManualById(manualId);
      if (learned) {
        get().addEventLog(`You studied ${manual.name}.`);
        return true;
      }
      return false;
    } catch (e) {
      /* intentionally ignored */
      return false;
    }
  },

  // Check if a manual can evolve for the player
  canEvolveManual: (manualId: string) => {
    const state = get();
    const owned = state.player.manuals.find(m => m.id === manualId);
    if (!owned) return { can: false, unmet: ['manual_not_owned'] };
    const req = owned.evolutionRequirements || {};
    const unmet: string[] = [];

    // Supported requirement keys (extensible): minRealm, minQi, skills, stats, hasManual, special
    if (req.minRealm && state.player.realmId !== req.minRealm) unmet.push('minRealm');
    if (typeof req.minQi === 'number' && (state.player.currentQi || 0) < req.minQi) unmet.push('minQi');

    if (req.skills && typeof req.skills === 'object') {
      Object.entries(req.skills as Record<string, number>).forEach(([skillId, lvl]) => {
        if (!state.player.skills[skillId] || state.player.skills[skillId].level < lvl) unmet.push(`skill:${skillId}`);
      });
    }

    if (req.stats && typeof req.stats === 'object') {
      Object.entries(req.stats as Record<string, number>).forEach(([statId, val]) => {
        const v = state.player.stats[statId] || 0;
        if (v < val) unmet.push(`stat:${statId}`);
      });
    }

    if (req.hasManual) {
      const has = state.player.manuals.some(m => m.id === req.hasManual);
      if (!has) unmet.push(`hasManual:${req.hasManual}`);
    }

    // Optional custom hook flag
    if (req.special === 'sword_path' && !(state.player.techniques||[]).some(t => t.includes('sword'))) {
      unmet.push('special:sword_path');
    }

    return { can: unmet.length === 0, unmet };
  },

  // Evolve a manual into its evolutionTargetId
  evolveManual: (manualId: string) => {
    try {
    const state = get();
    // Load manuals from canonical data package (support multiple export shapes)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const manualModule = require('@/data/manuals');
      const allManuals: Manual[] = (manualModule?.ALL_MANUALS || manualModule?.MANUALS || manualModule?.manuals) || [];

      const ownedIdx = state.player.manuals.findIndex(m => m.id === manualId);
      if (ownedIdx === -1) return false;
      const owned = state.player.manuals[ownedIdx];
      if (!owned.evolutionTargetId) return false;

      const { can } = get().canEvolveManual(manualId);
      if (!can) return false;

      const target = allManuals.find(m => m.id === owned.evolutionTargetId);
      if (!target) return false;

      // Replace manual and apply delta effects (simple approach: apply full target effects)
      const updatedManuals = [...state.player.manuals];
      updatedManuals[ownedIdx] = target;

      // Apply target effects like in learning
      const updatedStats = { ...state.player.stats } as Record<string, number>;
      const updatedSkills = { ...state.player.skills } as Record<string, { level: number; exp: number; expToNext: number }>;
      const effects = target.effects || {};
      if (effects.stats) {
        Object.entries(effects.stats).forEach(([key, val]) => {
          if (typeof val === 'number') updatedStats[key] = (updatedStats[key] || 0) + val;
          else if (val && typeof val === 'object' && 'base' in val) updatedStats[key] = (updatedStats[key] || 0) + val.base;
        });
      }
      if ((effects as any).skills) {
        Object.entries((effects as any).skills as Record<string, number>).forEach(([skillId, bonus]) => {
          if (updatedSkills[skillId]) {
            updatedSkills[skillId] = { ...updatedSkills[skillId], level: Math.max(updatedSkills[skillId].level, bonus) };
          }
        });
      }

      set({
        player: {
          ...state.player,
          manuals: updatedManuals,
          stats: updatedStats,
          skills: updatedSkills
        }
      });
      get().addEventLog(`Your manual ${owned.name} has evolved into ${target.name}!`);
      return true;
    } catch (e) {
      /* intentionally ignored */
      return false;
    }
  },

  // Attempt awakening current bloodline based on requirements
  awakenBloodlineIfPossible: () => {
    const state = get();
    const bl = state.player.bloodline;
    if (!bl || !bl.awakening_requirements || !bl.awakenedId) return false;

    const req = bl.awakening_requirements;
    const realmOk = !req.realm || state.player.realmId === req.realm;
    const qiOk = !req.qi || state.player.currentQi >= req.qi;
    if (!realmOk || !qiOk) return false;

    // Find awakened bloodline in data
  const awakened = ALL_BLOODLINES.find((b: any) => b.id === bl.awakenedId);
    if (!awakened) return false;

    // Apply awakened effects: merge stats/skills and replace bloodline
    const mergedStats = { ...state.player.stats } as Record<string, number>;
    const applyStats = (effects?: Record<string, any>) => {
      if (!effects?.stats) return;
      const hasBase = (v: unknown): v is { base: number } =>
        typeof v === 'object' && v !== null && typeof (v as any).base === 'number';
      Object.entries(effects.stats).forEach(([key, val]) => {
        if (typeof val === 'number') {
          mergedStats[key] = (mergedStats[key] || 0) + val;
        } else if (hasBase(val)) {
          mergedStats[key] = (mergedStats[key] || 0) + val.base;
        }
      });
    };
    applyStats(awakened.effects);

    const mergedSkills = { ...state.player.skills } as Record<string, { level: number; exp: number; expToNext: number }>;
    if (awakened.effects?.skills) {
      Object.entries(awakened.effects.skills as Record<string, any>).forEach(([skillId, bonus]) => {
        const num = typeof bonus === 'number' ? bonus : Number(bonus) || 0;
        if (mergedSkills[skillId]) mergedSkills[skillId] = { ...mergedSkills[skillId], level: Math.max(mergedSkills[skillId].level, num) };
      });
    }

    set({
      player: {
        ...state.player,
        bloodline: awakened,
        stats: mergedStats,
        skills: mergedSkills
      }
    });
    get().addEventLog(`Your bloodline has awakened into ${awakened.name}!`);
    return true;
  },



  gainSkillExp: (skillId: string, exp: number) => {
    const skillEvolutionPaths = {
      weaponMastery: ['Sword Qi', 'Spear Arts', 'Bow Arts', 'Dagger Arts', 'Staff Arts'],
      swordsmanship: ['Sword Qi', 'Sword Domain'],
      spearArts: ['Spear Intent', 'Dragon Spear Arts'],
      archery: ['Piercing Arrow', 'Rain of Arrows'],
      daggerArts: ['Shadow Dagger Arts', 'Assassin Arts'],
      staffArts: ['Mountain Cracking Staff', 'Flowing River Staff'],
      alchemy: ['Pill Refining', 'Elixir Crafting'],
      comprehension: ['Cultivation Speed', 'Understanding Speed'],
      qiControl: ['Qi Manipulation', 'Spiritual Sense'],
      bodyTempering: ['Iron Body', 'Diamond Body'],
      daoInsight: ['Dao Comprehension', 'Heavenly Insight'],
      combatSkills: ['Martial Arts', 'Battle Tactics'],
      socialSkills: ['Diplomacy', 'Intimidation'],
      mentalFortitude: ['Mind Palace', 'Soul Defense'],
      spiritBeastTaming: ['Beast Communication', 'Spirit Bonding'],
      meditation: ['Deep Meditation', 'Enlightenment'],
      forging: ['Artifact Crafting', 'Rune Inscription']
    };

    return set(state => {
      const skill = state.player.skills[skillId];
      if (!skill) return state;

      const newSkill = { ...skill, exp: skill.exp + exp };
      while (newSkill.exp >= newSkill.expToNext) {
        newSkill.exp -= newSkill.expToNext;
        newSkill.level++;
        newSkill.expToNext = Math.floor(newSkill.expToNext * 1.5);
        get().addEventLog(`${skillId} increased to level ${newSkill.level}!`);
        
        // Check for evolution opportunities at certain levels
        if ([5, 10, 15, 20, 25, 30].includes(newSkill.level)) {
          const evolutionOptions = skillEvolutionPaths[skillId as keyof typeof skillEvolutionPaths];
          if (evolutionOptions && evolutionOptions.length > 0) {
            // For now, just log the evolution opportunity
            get().addEventLog(`Evolution available for ${skillId}! Possible paths: ${evolutionOptions.join(', ')}`);
          }
        }
      }

      return {
        player: {
          ...state.player,
          skills: { ...state.player.skills, [skillId]: newSkill }
        }
      };
    });
  },

  evolveSkill: (baseSkillId: string, evolutionPath: string) => set(state => {
    const skillEvolutionPaths = {
      weaponMastery: ['Sword Qi', 'Spear Arts', 'Bow Arts', 'Dagger Arts', 'Staff Arts'],
      swordsmanship: ['Sword Qi', 'Sword Domain'],
      spearArts: ['Spear Intent', 'Dragon Spear Arts'],
      archery: ['Piercing Arrow', 'Rain of Arrows'],
      daggerArts: ['Shadow Dagger Arts', 'Assassin Arts'],
      staffArts: ['Mountain Cracking Staff', 'Flowing River Staff'],
      alchemy: ['Pill Refining', 'Elixir Crafting'],
      comprehension: ['Cultivation Speed', 'Understanding Speed'],
      qiControl: ['Qi Manipulation', 'Spiritual Sense'],
      bodyTempering: ['Iron Body', 'Diamond Body'],
      daoInsight: ['Dao Comprehension', 'Heavenly Insight'],
      combatSkills: ['Martial Arts', 'Battle Tactics'],
      socialSkills: ['Diplomacy', 'Intimidation'],
      mentalFortitude: ['Mind Palace', 'Soul Defense'],
      spiritBeastTaming: ['Beast Communication', 'Spirit Bonding'],
      meditation: ['Deep Meditation', 'Enlightenment'],
      forging: ['Artifact Crafting', 'Rune Inscription']
    };

    const baseSkill = state.player.skills[baseSkillId];
    if (!baseSkill) return state;

    const evolutionOptions = skillEvolutionPaths[baseSkillId as keyof typeof skillEvolutionPaths];
    if (!evolutionOptions || !evolutionOptions.includes(evolutionPath)) {
      get().addEventLog(`Invalid evolution path for ${baseSkillId}!`);
      return state;
    }

    // Create the evolved skill
    const evolvedSkillId = evolutionPath.toLowerCase().replace(/\s+/g, '_');
    const evolvedSkill = {
      level: 1,
      exp: 0,
      expToNext: Math.floor(baseSkill.expToNext * 1.2)
    };

    get().addEventLog(`Congratulations! Your ${baseSkillId} has evolved into ${evolutionPath}!`);

    return {
      player: {
        ...state.player,
        skills: {
          ...state.player.skills,
          [baseSkillId]: { ...baseSkill, level: 0, exp: 0 }, // Reset base skill
          [evolvedSkillId]: evolvedSkill
        }
      }
    };
  }),

  checkMinorStageBreakthrough: () => set(state => {
    const currentRealm = REALM_ORDER[state.player.realmId - 1];
    let currentStage = state.player.minorStage;
    const maxStages = CULTIVATION_REALMS[currentRealm]?.minorStages || 1;

    let currentQi = state.player.currentQi;
    let qiRequired = state.player.qiRequired;
    let advanced = false;

    // Consume Qi to advance through as many minor stages as possible
    while (currentStage < maxStages && currentQi >= qiRequired) {
      currentQi -= qiRequired;
      currentStage += 1;
      advanced = true;
      get().addEventLog(`Minor breakthrough! You've advanced to ${currentRealm} stage ${currentStage}!`);
      qiRequired = Math.floor(qiRequired * 1.2);
    }

    if (!advanced) return state;

    return {
      player: {
        ...state.player,
        minorStage: currentStage,
        currentQi,
        qiRequired
      }
    };
  }),

  checkRealmBreakthrough: () => set(state => {
    const currentRealm = REALM_ORDER[state.player.realmId - 1];
    const currentStage = state.player.minorStage;
    const maxStages = CULTIVATION_REALMS[currentRealm]?.minorStages || 1;

    if (currentStage === maxStages && state.player.currentQi >= state.player.qiRequired) {
      const nextRealm = CULTIVATION_REALMS[currentRealm]?.nextRealm;
      if (nextRealm) {
        const breakthroughDifficulty = CULTIVATION_REALMS[currentRealm]?.breakthroughDifficulty || 1;
        const lifespanBonus = CULTIVATION_REALMS[nextRealm]?.lifespanBonus || 0;

        get().addEventLog(`Major breakthrough! You've advanced to ${nextRealm}!`);

        return {
          player: {
            ...state.player,
            realm: nextRealm,
            realmId: REALM_ORDER.indexOf(nextRealm) + 1,
            minorStage: 1,
            currentQi: state.player.currentQi - state.player.qiRequired,
            qiRequired: REALM_QI_REQUIREMENTS[nextRealm],
            lifespan: state.player.lifespan + lifespanBonus,
            cultivationPower: state.player.cultivationPower + breakthroughDifficulty * 10
          }
        };
      }
    }
    return state;
  }),

  addToInventory: (item) => set(state => {
    get().addEventLog(`Obtained: ${item.name}`);

    // Grant skill EXP based on weapon type
    const grantWeaponExp = () => {
      if (!item?.type || item.type !== 'weapon') return;
      // Generic weapon mastery (very low gain)
      get().gainSkillExp('weaponMastery', 1);
      const name: string = (item.name || '').toLowerCase();
      if (name.includes('jian') || name.includes('sword')) get().gainSkillExp('swordsmanship', 1);
      else if (name.includes('spear')) get().gainSkillExp('spearArts', 1);
      else if (name.includes('bow')) get().gainSkillExp('archery', 1);
      else if (name.includes('dagger') || name.includes('blade')) get().gainSkillExp('daggerArts', 1);
      else if (name.includes('staff')) get().gainSkillExp('staffArts', 1);

      // Unlock a basic technique when obtaining a Jian/Sword
      if ((name.includes('jian') || name.includes('sword')) && !state.player.techniques.includes('basic_sword_slash')) {
        return {
          techniques: [...state.player.techniques, 'basic_sword_slash']
        };
      }
      return null;
    };

    const techniqueUpdate = grantWeaponExp();

    // Manuals: If the item is a manual by id, learn and apply its effects
    const applyManualFromItem = () => {
      if (!item?.type || item.type !== 'manual' || !item.id) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const allManuals: Manual[] = (require('@/data/manuals')?.manuals) || [];
      const manual = allManuals.find(m => m.id === item.id);
      if (!manual) return null;

      // Prevent duplicates
      const alreadyHas = state.player.manuals.some(m => m.id === manual.id);
      if (alreadyHas) return null;

      // Apply manual effects into player stats/skills/buffs where applicable
      const updatedStats = { ...state.player.stats } as Record<string, number>;
      const updatedSkills = { ...state.player.skills } as Record<string, { level: number; exp: number; expToNext: number }>;

      const effects = manual.effects || {};
      // Stats: numeric addition or structured StatEffect
      if (effects.stats) {
        Object.entries(effects.stats).forEach(([key, val]) => {
          if (typeof val === 'number') {
            updatedStats[key] = (updatedStats[key] || 0) + val;
          } else if (val && typeof val === 'object' && 'base' in val) {
            updatedStats[key] = (updatedStats[key] || 0) + val.base;
          }
        });
      }
      // Skills flat bonuses
      if ((effects as any).skills) {
        Object.entries((effects as any).skills as Record<string, number>).forEach(([skillId, bonus]) => {
          if (updatedSkills[skillId]) {
            updatedSkills[skillId] = { ...updatedSkills[skillId], level: Math.max(updatedSkills[skillId].level, bonus) };
          }
        });
      }

      // Append to player manuals
      const updatedManuals = [...state.player.manuals, manual];
      get().addEventLog(`Learned manual: ${manual.name}`);

      return { stats: updatedStats, skills: updatedSkills, manuals: updatedManuals };
    };

    const manualUpdate = applyManualFromItem();

    return {
      player: {
        ...state.player,
        inventory: [...state.player.inventory, item],
        techniques: techniqueUpdate?.techniques || state.player.techniques,
        stats: manualUpdate?.stats || state.player.stats,
        skills: manualUpdate?.skills || state.player.skills,
        manuals: manualUpdate?.manuals || state.player.manuals
      }
    };
  }),

  // Convenience: purchase item through MarketSystem and auto-apply side effects
  purchaseFromMarket: (marketId: string, itemId: string) => {
    const store = get();
    const playerState = store.player;
    const success = store.marketSystem.buyItem(marketId, itemId, playerState);
    // Advance time regardless of success to reflect time spent at market
    set(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));
    if (!success) return false;

    // Find item details to add to inventory display/log
    const items = store.marketSystem.getMarketItems(marketId, playerState);
    const bought = items.find(i => i.id === itemId);
    if (bought) {
      store.addToInventory({
        itemId: bought.id, // Add itemId for crafting compatibility
        name: bought.name,
        description: bought.description,
        value: (bought.price?.yuan || 0),
        type: bought.type
      });
    }
    return true;
  },

  // Market browsing (no time advance)
  listMarkets: () => {
    const store = get();
    return store.marketSystem.getAvailableMarkets(store.player);
  },
  listMarketItems: (marketId: string) => {
    const store = get();
    return store.marketSystem.getMarketItems(marketId, store.player);
  },
  listActiveAuctions: () => {
    const store = get();
    return store.marketSystem.getActiveAuctions();
  },
  listPlayerMarketInventory: () => {
    const store = get();
    return store.marketSystem.getPlayerInventory();
  },

  // Auction actions (advance time)
  placeBidOnAuction: (auctionId: string, amount: number) => {
    const store = get();
    const success = store.marketSystem.placeBid(auctionId, amount, store.player);
    // Advance time to reflect participation in auction
    set(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));
    return success;
  },
  buyoutAuctionItem: (auctionId: string) => {
    const store = get();
    const success = store.marketSystem.buyoutAuction(auctionId, store.player);
    // Advance time regardless of success
    set(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));
    if (success) {
      store.addEventLog('You buy out an auctioned item.');
    }
    return success;
  },

  // Player selling/listing (advance time)
  sellToMarket: (marketId: string, itemId: string, quantity: number) => {
    const store = get();
    const success = store.marketSystem.sellToMarket(marketId, itemId, quantity, store.player);
    set(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));
    if (success) {
      store.addEventLog(`Sold ${quantity}x ${itemId} to market.`);
    }
    return success;
  },
  listItemForAuction: (itemId: string, startingBid: number, buyoutPrice?: number) => {
    const store = get();
    const success = store.marketSystem.listItemForAuction(itemId, startingBid, buyoutPrice, store.player);
    set(state => ({ world: { ...state.world, tick: state.world.tick + 1 } }));
    if (success) {
      store.addEventLog(`Listed ${itemId} for auction.`);
    }
    return success;
  },

  triggerRandomEvent: () => {
  if (runtimeRng() < 0.3) {
      // const events = get().events; // unused for now; integrate UI modal to consume
      // This would trigger a modal in the UI
      return true;
    }
    return false;
  },

  cultivate: () => set(state => {
    // Process buffs at the start of the action
    get().processBuffs();

    const store = get();

    // Award very low skill EXP (slow progression)
    store.gainSkillExp('qiControl', 1);
    store.gainSkillExp('daoInsight', 1);
    store.triggerRandomEvent();

    // Determine seclusion length: 1 year by default; from Golden Immortal onward,
    // allow configurable years via world.flags.seclusionYears (if present)
    const currentRealmKey = state.player.realmId ? REALM_ORDER[state.player.realmId - 1] : 'mortal';
    const currentRealmIndex = REALM_ORDER.indexOf(currentRealmKey);
    const goldenImmortalIndex = REALM_ORDER.indexOf('golden_immortal');
    const years = currentRealmIndex >= goldenImmortalIndex
      ? Math.max(1, Number((state.world.flags as any)?.seclusionYears) || 1)
      : 1;

    // Convert time to minutes for the mechanics generator. Pre-Golden Immortal use 1 day per click for pacing.
    const minutes = (currentRealmIndex >= goldenImmortalIndex ? years * 365 : 1) * 24 * 60; // 1 day per click before Golden Immortal

    // Use cultivation mechanics to calculate gains
    const session = generateCultivationSession(
      currentRealmKey,
      state.player.talentId || 'average',
      minutes,
      [] // Modifiers (env/state/bloodline/physique/manual) can be integrated later
    );

    // Check for special, action-based buffs like Qi Purification
    const playerState = { ...state.player };
    let cultivationMultiplier = 1;
    const purificationBuffIndex = playerState.activeBuffs.findIndex(b => b.specialEffectId === 'qi_purification_1');

    if (purificationBuffIndex > -1) {
      const buff = playerState.activeBuffs[purificationBuffIndex];
      store.addEventLog(`Your meridians feel pure, enhancing your cultivation!`);
      cultivationMultiplier = 2; // Double the Qi gain
      
      // Consume the buff
      const updatedBuffs = [...playerState.activeBuffs];
      updatedBuffs.splice(purificationBuffIndex, 1);
      playerState.activeBuffs = updatedBuffs;
    }

    // Compute manual multipliers (legacy support) and apply to qi and a small CP gain
    const manualCultivationMultiplier = state.player.manuals.reduce((acc, m) => {
      const eff: any = m.effects || {};
      const v = eff.cultivationSpeed ?? eff.cultivation_speed;
      if (!v) return acc;
      if (typeof v === 'number') return acc * (1 + v);
      if (typeof v === 'object' && 'base' in v) return acc * (1 + v.base);
      return acc;
    }, 1);

    const qiGain = Math.floor(session.qiGained * manualCultivationMultiplier * cultivationMultiplier);

    // Keep CP growth modest relative to massive time scales
    const cpGain = Math.max(1, Math.floor((10 + state.player.skills.qiControl.level * 2) * Math.log10(1 + years)));

    // Age advances with seclusion
    const newAge = state.player.age + years;

    // Build next state with time passing in years
    const newState = {
      player: { // Start with the potentially modified player state (from buff consumption)
        ...playerState,
        age: newAge,
        cultivationPower: state.player.cultivationPower + cpGain,
        currentQi: state.player.currentQi + qiGain,
        // Track daily cultivation for quest progress (use original state for this)
        dailyCultivationCount: (state.player.dailyCultivationCount || 0) + 1
      },
      world: {
        ...state.world,
        year: state.world.year + years,
        tick: state.world.tick + 1
      }
    };

    store.addEventLog(`You enter seclusion for ${years} year(s). Qi +${qiGain.toLocaleString()}.`);

    // After cultivation, attempt breakthroughs and other awakenings
    setTimeout(() => {
      store.checkMinorStageBreakthrough();
      store.checkRealmBreakthrough();
      store.awakenBloodlineIfPossible();
      
      // Check quest completion after cultivation
      store.checkEnhancedQuestCompletion();
    }, 100);

    return newState;
  }),

  explore: () => set(state => {
    // Process buffs at the start of the action
    get().processBuffs();

    const store = get();
    // Very low gains for explore
    store.gainSkillExp('socialSkills', 1);
    store.gainSkillExp('combatSkills', 1);
    
    // Chance to find items
  if (runtimeRng() < 0.3) {
      const items = [ // Note: Added itemIds for crafting system compatibility
        { itemId: 'spirit_herb', name: 'Spirit Herb', description: 'A common medicinal herb', value: 10 },
        { itemId: 'qi_stone', name: 'Qi Stone', description: 'Contains traces of spiritual energy', value: 25 },
        { itemId: 'ancient_coin', name: 'Ancient Coin', description: 'Currency from a bygone era', value: 5 }
      ];
  const foundItem = items[Math.floor(runtimeRng() * items.length)];
      store.addToInventory(foundItem);
    }
    
    store.triggerRandomEvent();
    store.addEventLog('You explore the surrounding area and gain new insights.');
    
    return {
      player: {
        ...state.player,
        insight: state.player.insight + 5
      },
      world: {
        ...state.world,
        day: state.world.day + 1,
        tick: state.world.tick + 1
      }
    };
  }),

  saveGame: () => {
    try {
      const state = get();
      const success = SaveLoadSystem.saveGame({
        player: state.player,
        world: state.world,
        story: state.story,
        ui: state.ui,
        systems: state.systems
      } as GameState);
      if (success) {
        get().addEventLog('Game saved successfully.');
        return true;
      } else {
        get().addEventLog('Failed to save game.');
        return false;
      }
    } catch (error) {
      get().addEventLog('Failed to save game.');
      return false;
    }
  },

  loadGame: () => {
    try {
      const saveData = SaveLoadSystem.loadGame();
      if (saveData && saveData.gameState) {
        set(state => ({
          ...state,
          player: saveData.gameState.player,
          world: saveData.gameState.world,
          story: saveData.gameState.story || state.story,
          ui: { ...state.ui, ...saveData.gameState.ui, currentScreen: 'game' }, // merge UI but ensure we go to game screen
          systems: saveData.gameState.systems || state.systems
        }));
        get().addEventLog('Game loaded successfully.');
        return true;
      }
    } catch (error) {
      get().addEventLog('Failed to load game.');
    }
    return false;
  },

  finalizeCharacterCreation: (payload) => {
    const store = get();
    const safePayload = payload || { name: store.player.name || 'Player', gender: (store.player as any).gender || 'Male', race: (store.player as any).race || 'Human', background: (store.player as any).background || null };
    const { name, gender, race, background } = safePayload as any;

    // Basic validation
    if (!name || !race || !gender) {
      get().addEventLog('Character creation failed: missing required fields.');
      return false;
    }

    // Apply background effects if provided
    const bgEffects = background?.effects || {};
    const next = { ...store.player } as any;

    next.name = name;
    next.gender = gender;
    next.race = race;
    next.background = background;

    // Stats adjustments
    if (bgEffects.stats) {
      next.stats = { ...next.stats };
      Object.entries(bgEffects.stats).forEach(([k, v]) => {
        if (typeof v === 'number') next.stats[k] = (next.stats[k] || 0) + v;
      });
    }

    // Currency/resources
    if (typeof (bgEffects as any).yuan === 'number') {
      next.yuan = (next.yuan || 0) + (bgEffects as any).yuan;
    }
    if ((bgEffects as any).spiritStones) {
      next.spiritStones = { ...(next.spiritStones || { low: 0, mid: 0, high: 0 }), ...(bgEffects as any).spiritStones };
    }

    // Skill level bumps (supports both number and object with level)
    if ((bgEffects as any).skills) {
      next.skills = { ...next.skills };
      Object.entries((bgEffects as any).skills as Record<string, any>).forEach(([skill, val]) => {
        const lvl = typeof val === 'number' ? val : (val?.level || 0);
        if (next.skills[skill]) {
          next.skills[skill] = {
            ...next.skills[skill],
            level: Math.max(next.skills[skill].level, lvl)
          };
        }
      });
    }

    // Top-level skill-like bumps (e.g., socialSkills: { level: 3 })
    Object.entries(bgEffects as Record<string, any>).forEach(([key, val]) => {
      if (val && typeof val === 'object' && 'level' in val && next.skills?.[key]) {
        next.skills[key] = {
          ...next.skills[key],
          level: Math.max(next.skills[key].level, (val as any).level || 0)
        };
      }
    });

    // Reputation
    if ((bgEffects as any).reputation) {
      next.reputation = { ...(next.reputation || {}), ...(bgEffects as any).reputation };
    }

    set(state => ({
      player: next,
      ui: { ...state.ui, currentScreen: 'game' }
    }));

    get().addEventLog(`Welcome, ${name}! Your journey begins.`);
    return true;
  },

  startGame: (payload) => get().finalizeCharacterCreation(payload),

  addEventLog: (message: string) => set(state => ({
    eventLog: [...state.eventLog.slice(-49), message] // Keep last 50 messages
  })),

  // Lore System
  nextLore: () => set(state => {
    const nextIndex = state.ui.currentLoreIndex + 1;
    if (nextIndex >= TAI_YUNG_OPENING_LORE.length) {
      return {
        ui: { ...state.ui, currentScreen: 'creation', showLore: false }
      };
    }
    return {
      ui: { ...state.ui, currentLoreIndex: nextIndex }
    };
  }),

  skipLore: () => set(state => ({
    ui: { ...state.ui, currentScreen: 'creation', showLore: false }
  })),



  // Bloodline/Physique System
  assignRandomBloodline: () => set(state => {
    const availableBloodlines = (ALL_BLOODLINES as any[]).filter((b: any) => 
      b.rarity === 'common' || 
  (b.rarity === 'uncommon' && runtimeRng() < 0.3) ||
  (b.rarity === 'rare' && runtimeRng() < 0.1)
    );
    
  const randomBloodline = availableBloodlines[Math.floor(runtimeRng() * availableBloodlines.length)];
    
    return {
      player: {
        ...state.player,
        bloodline: {
          ...randomBloodline,
          pillarState: 'dormant'
        }
      }
    };
  }),

  assignRandomPhysique: () => set(state => {
    const availablePhysiques = PHYSIQUES.filter(p => 
      p.rarity === 'common' || 
  (p.rarity === 'uncommon' && runtimeRng() < 0.2) ||
  (p.rarity === 'rare' && runtimeRng() < 0.05)
    );
    
  const randomPhysique = availablePhysiques[Math.floor(runtimeRng() * availablePhysiques.length)];
    
    return {
      player: {
        ...state.player,
        physique: randomPhysique
      }
    };
  }),

  // Rival System Integration Methods
  getRivals: () => {
    const store = get();
    return store.rivalSystem.getAllRivals();
  },
  getRivalById: (id: string) => {
    const store = get();
    return store.rivalSystem.getRival(normalizeRivalId(id));
  },

  // Start a combat instance against a rival and show CombatUI
  startCombatWithRival: (rivalId: string) => {
    const store = get();
    const normalizedId = normalizeRivalId(rivalId);
    const rival = store.rivalSystem.getRival(normalizedId);
    if (!rival) {
      store.addEventLog(`Rival ${normalizedId} not found`);
      return false;
    }

    // Build player participant from current player state
    const player: any = {
      id: 'player',
      name: store.player.name || 'You',
      hp: store.player.stats.hp,
      maxHp: store.player.stats.hp,
      qi: store.player.stats.qi,
      maxQi: store.player.stats.qi,
      ap: 5,
      maxAp: 5,
      stats: {
        atk: store.player.stats.atk,
        def: store.player.stats.def,
        speed: store.player.stats.speed
      },
      techniques: [
        { id: 'basic_attack', name: 'Basic Attack', description: 'A simple strike.', apCost: 1, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 10 }] },
        { id: 'guard', name: 'Guard', description: 'Brace to reduce damage.', apCost: 1, qiCost: 0, type: 'defense', effects: [{ type: 'buff', target: 'self', stat: 'def', value: 5, duration: 2 }] }
      ],
      // Map active buffs from the player state to the combat participant
      buffs: store.player.activeBuffs.map(b => ({
        id: b.id,
        name: b.name,
        description: b.description,
        duration: b.durationType === 'ticks' ? Math.ceil(b.duration / 10) : b.duration, // Convert ticks to combat rounds (approx)
        effects: b.effects,
      })),
      debuffs: []
    };

    // Map rival to combat participant
    const enemy = store.rivalSystem.getRivalAsCombatParticipant(rivalId);
    if (!enemy) {
      store.addEventLog(`Could not start combat: invalid rival participant`);
      return false;
    }

    // Lazy import to avoid circular issues if any
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CombatSystem } = require('@/systems/CombatSystem');

    const context = {
      type: 'rival' as const,
      rivalId,
      faction: rival.faction,
      sect: rival.sect
    };

    // Ensure AI initialized once
    if ((store as any)._initAIOnce) { (store as any)._initAIOnce(); }

    const combat = new CombatSystem(player, [enemy], store, store.rivalSystem, context);

    // On combat start, allow AI to generate opening dialogue
    try {
      const ai = (store.rivalSystem as any)?.getAISystem ? (store.rivalSystem as any).getAISystem() : null;
      if (ai && typeof ai.generateAdaptiveDialogue === 'function') {
        const line = ai.generateAdaptiveDialogue(rival, 'combat_start');
        if (line) store.addEventLog(`${rival.name}: ${line}`);
      }
    } catch (e) {
      /* intentionally ignored */
    }

    set(state => ({
      combatSystem: combat,
      ui: { ...state.ui, currentScreen: 'combat' }
    }));

    store.addEventLog(`Entered combat with ${rival.name}.`);
    return true;
  },
  startRivalEncounter: (rivalId: string) => {
    const store = get();
    const status = canEncounterRivalEnhanced(
      store.rivalSystem,
      rivalId,
      store.world.day,
      store.player.realmId || 1
    );
    if (!status.canEncounter) {
      store.addEventLog(`Cannot encounter rival now: ${status.reason || 'cooldown'}${status.cooldownDays ? ` (${status.cooldownDays} day(s) remaining)` : ''}`);
      return false;
    }
    store.recordRivalEncounter(rivalId);
    set(state => ({ ui: { ...state.ui, selectedRival: rivalId } }));
    const name = store.rivalSystem.getRival(rivalId)?.name || rivalId;
    store.addEventLog(`You encountered ${name}.`);
    return true;
  },
  adjustRivalRelationship: (rivalId: string, change: number) => set(state => {
    const store = get();
    const currentDay = state.world.day;
    const gameState = {
      player: state.player,
      world: state.world,
      story: state.story,
      ui: state.ui,
      systems: state.systems
    } as GameState;

    const result = adjustRivalRelationshipEnhanced(
      store.rivalSystem,
      gameState,
      rivalId,
      change,
      currentDay
    );

    if (!result.success) {
      get().addEventLog(`Error: ${result.error}`);
      return state;
    }

    // Log the change
    const oldRelationship = state.player.rivalRelationships[rivalId] || 0;
    const actualChange = result.newRelationship - oldRelationship;
    const changeType = actualChange > 0 ? 'improved' : actualChange < 0 ? 'worsened' : 'unchanged';
    const changeMagnitude = Math.abs(actualChange);
    const magnitudeDesc = changeMagnitude > 20 ? 'significantly' : changeMagnitude > 10 ? 'moderately' : 'slightly';

    if (actualChange !== 0) {
      get().addEventLog(`Relationship with ${rivalId} ${changeType} ${magnitudeDesc}. New relationship: ${result.newRelationship}`);
    }

    // Update local state
    const newState = {
      player: {
        ...state.player,
        rivalRelationships: {
          ...state.player.rivalRelationships,
          [rivalId]: result.newRelationship
        }
      }
    } as Partial<GameState>;

    // Post-update validation
    const validation = store.validateSystemIntegrity();
    if (!validation.isValid) {
      store.addEventLog(`Warning: ${validation.errors.length} issue(s) detected after relationship update`);
    }

    return newState as any;
  }),

  markRivalDefeated: (rivalId: string) => set(state => {
    // Update RivalSystem first (single source of truth)
    const store = get();
    store.rivalSystem.markRivalDefeated(rivalId);

    // Get the updated rival from RivalSystem to sync local state
    const updatedRival = store.rivalSystem.getRival(rivalId);
    const syncedRelationship = updatedRival ? updatedRival.relationship : (state.player.rivalRelationships[rivalId] || 0);

    get().addEventLog(`You have defeated rival ${rivalId}!`);

    return {
      player: {
        ...state.player,
        rivalRelationships: {
          ...state.player.rivalRelationships,
          [rivalId]: syncedRelationship
        }
      }
    };
  }),

  getRivalRelationship: (rivalId: string) => {
    const store = get();
    // Get from RivalSystem first (single source of truth)
    const rival = store.rivalSystem.getRival(rivalId);
    if (rival) {
      return rival.relationship;
    }
    // Fallback to local state if not found in RivalSystem
    return store.player.rivalRelationships[rivalId] || 0;
  },

  canEncounterRival: (rivalId: string) => {
    const store = get();
    try {
      const result = canEncounterRivalEnhanced(
        store.rivalSystem,
        rivalId,
        store.world.day,
        store.player.realmId || 1
      );
      return !!result.canEncounter;
    } catch (error) {
      console.error(`Error checking rival encounter availability for ${rivalId}:`, error);
      return false;
    }
  },

  // UI helper: detailed status for encounter availability
  getRivalEncounterStatus: (rivalId: string) => {
    const store = get();
    try {
      return canEncounterRivalEnhanced(
        store.rivalSystem,
        rivalId,
        store.world.day,
        store.player.realmId || 1
      );
    } catch (error) {
      console.error(`Error getting encounter status for ${rivalId}:`, error);
      return { canEncounter: false, cooldownDays: 0, reason: 'Unexpected error' };
    }
  },

  // UI helper: days until next encounter (0 if available)
  getNextRivalEncounterInDays: (rivalId: string) => {
    const status = get().getRivalEncounterStatus(rivalId);
    return status.canEncounter ? 0 : (status.cooldownDays || 0);
  },

  recordRivalEncounter: (rivalId: string) => set(state => {
    const store = get();
    
    try {
      // Enhanced validation for recording rival encounters
      if (!rivalId || typeof rivalId !== 'string' || rivalId.trim() === '') {
        console.warn(`Invalid rivalId for recordRivalEncounter: ${rivalId}`);
        get().addEventLog(`Error: Invalid rival ID for encounter recording`);
        return state;
      }

      // Check if rival exists
      const rival = store.rivalSystem.getRival(rivalId);
      if (!rival) {
        console.warn(`Rival ${rivalId} not found for encounter recording`);
        get().addEventLog(`Warning: Rival ${rivalId} not found for encounter`);
        return state;
      }

      // Validate world state
      const currentDay = state.world.day;
      const currentYear = state.world.year;
      
      if (typeof currentDay !== 'number' || isNaN(currentDay) || currentDay < 0) {
        console.warn(`Invalid current day for encounter recording: ${currentDay}`);
        get().addEventLog(`Error: Invalid game day for encounter recording`);
        return state;
      }

      if (typeof currentYear !== 'number' || isNaN(currentYear) || currentYear < 1) {
        console.warn(`Invalid current year for encounter recording: ${currentYear}`);
        get().addEventLog(`Error: Invalid game year for encounter recording`);
        return state;
      }

      // Check if encounter is actually allowed (double-check)
      if (!store.canEncounterRival(rivalId)) {
        const status = store.getRivalEncounterStatus(rivalId);
        console.warn(`Attempted to record encounter with ${rivalId} but encounter not allowed: ${status.reason || 'cooldown'} (${status.cooldownDays} days)`);
        get().addEventLog(`Encounter with ${rival.name} not available: ${status.reason || 'cooldown'}${status.cooldownDays ? ` (${status.cooldownDays} day(s) remaining)` : ''}`);
        return state;
      }

      // Record encounter in RivalSystem with enhanced data
      try {
        const encounterId = store.rivalSystem.addRivalEncounter({
          rivalId,
          type: 'chance',
          location: state.player.sect ? `${state.player.sect}_territory` : 'wandering_lands',
          description: `Encountered rival ${rival.name} (${rival.title})`,
          outcome: 'truce',
          lootGained: [],
          reputationChange: {},
          year: currentYear
        });

        // Update encounter timestamp and count in RivalSystem
        store.rivalSystem.updateRivalRelationship(rivalId, 0, currentDay);

        // Log the encounter
        const cooldownDays = store.rivalSystem.getEncounterCooldownById(rivalId);
        get().addEventLog(`Encountered rival ${rival.name}. Next encounter available in ${cooldownDays} days.`);

        // Sync local state with RivalSystem data
        const updatedRival = store.rivalSystem.getRival(rivalId);
        const syncedLastEncounter = updatedRival ? updatedRival.lastEncounter : currentDay;

        return {
          player: {
            ...state.player,
            lastRivalEncounters: {
              ...state.player.lastRivalEncounters,
              [rivalId]: syncedLastEncounter
            }
          }
        };
      } catch (encounterError) {
        console.error(`Failed to record rival encounter for ${rivalId}:`, encounterError);
        get().addEventLog(`Error: Failed to record encounter with ${rivalId}`);
        return state;
      }
    } catch (error) {
      console.error(`Error in recordRivalEncounter for ${rivalId}:`, error);
      get().addEventLog(`Error: Encounter recording failed`);
      return state;
    }
  }),

  getRivalEncounters: (rivalId?: string) => {
    const store = get();
    return store.rivalSystem.getRivalEncounters(rivalId);
  },

  startFactionBattle: (factionId: string, enemyFactionId: string) => {
    const store = get();
    const battleId = store.rivalSystem.startFactionBattle({
      type: 'skirmish',
      factions: [factionId, enemyFactionId],
      participants: [factionId, enemyFactionId],
      rewards: {},
      penalties: {},
      year: store.world.year
    });

    store.addEventLog(`Faction battle started between ${factionId} and ${enemyFactionId}`);
    
    // Mirror to local state for UI/history
    set(state => ({
      player: {
        ...state.player,
        factionBattles: [
          ...state.player.factionBattles,
          {
            id: battleId,
            type: 'skirmish',
            factions: [factionId, enemyFactionId],
            participants: [factionId, enemyFactionId],
            outcome: 'ongoing',
            rewards: {},
            penalties: {},
            year: state.world.year
          }
        ]
      }
    }));

    return battleId;
  },

  resolveFactionBattle: (battleId: string, outcome: 'victory' | 'defeat') => set(state => {
    const store = get();

    try {
      // Use enhanced resolver to compute cascading effects and ensure sync
      const result = resolveFactionBattleEnhanced(
        store.rivalSystem,
        store.sectFactionSystem,
        battleId,
        outcome,
        {
          player: state.player,
          world: state.world,
          story: state.story,
          ui: state.ui,
          systems: state.systems
        } as GameState
      );

      if (!result.success) {
        store.addEventLog(`Error resolving faction battle: ${result.error}`);
        return state;
      }

      // Apply minimal playtest scaling to dynamic faction battle effects
      const scaledEffects = result.effects.map(e => PlaytestScaling.applyScaledEffects(e, { source: 'faction_battle' }));

      // Apply effects to store (standings, sect rep, rival relationships)
      scaledEffects.forEach(effect => {
        try {
          switch (effect.type) {
            case 'faction_standing':
              store.adjustFactionStanding(effect.faction, effect.change);
              break;
            case 'sect_reputation':
              if (effect.sect) store.adjustSectReputation(effect.sect, effect.change);
              break;
            case 'rival_relationship':
              if (effect.rivalId) store.adjustRivalRelationship(effect.rivalId, effect.change);
              break;
            case 'world_event':
              store.addEventLog(`World event triggered: ${effect.event}`);
              break;
          }
        } catch (applyErr) {
          console.warn('Failed to apply battle effect', effect, applyErr);
        }
      });

      // Update local battle record
      const battleIndex = state.player.factionBattles.findIndex(b => b.id === battleId);
      if (battleIndex === -1) return state;

      const battle = state.player.factionBattles[battleIndex];
      const updatedBattles = [...state.player.factionBattles];
      updatedBattles[battleIndex] = {
        ...battle,
        outcome,
        rewards: outcome === 'victory' ? { spiritStones: { low: 1 } } : {},
        penalties: outcome === 'defeat' ? { reputation: -1 } : {}
      };

      // Validation after major update
      const validation = store.validateSystemIntegrity();
      if (!validation.isValid) {
        store.addEventLog(`Warning: ${validation.errors.length} issue(s) detected after battle resolution`);
      }

      store.addEventLog(`Faction battle ${outcome}! Effects applied: ${result.effects.length}`);

      return {
        player: {
          ...state.player,
          factionBattles: updatedBattles
        }
      };
    } catch (err) {
      store.addEventLog('Error: Failed to resolve faction battle');
      console.error('resolveFactionBattle error', err);
      return state;
    }
  }),

  // Sect/Faction System Integration Methods
  joinSect: (sectId: string) => {
    const store = get();
    const success = store.sectFactionSystem.joinSect(sectId, store.player);
    
    if (success) {
      store.addEventLog(`You have joined the ${sectId} sect!`);
      
      set(state => ({
        player: {
          ...state.player,
          sect: sectId
        }
      }));
    }
    
    return success;
  },

  leaveSect: () => set(state => {
    if (!state.player.sect) return state;
    
    const store = get();
    store.sectFactionSystem.leaveSect();
    store.addEventLog(`You have left your sect.`);
    
    return {
      player: {
        ...state.player,
        sect: null
      }
    };
  }),

  getAvailableSects: () => {
    const store = get();
    return store.sectFactionSystem.getAvailableSects(store.player);
  },

  getSectReputation: (sectId: string) => {
    const state = get();
    return state.player.sectReputations[sectId] || 0;
  },

  adjustSectReputation: (sectId: string, amount: number) => set(state => {
    const currentReputation = state.player.sectReputations[sectId] || 0;
    const newReputation = Math.max(-100, Math.min(100, currentReputation + amount));
    
    get().addEventLog(`Reputation with ${sectId} changed by ${amount}. New reputation: ${newReputation}`);
    
    return {
      player: {
        ...state.player,
        sectReputations: {
          ...state.player.sectReputations,
          [sectId]: newReputation
        }
      }
    };
  }),

  adjustFactionStanding: (factionId: string, amount: number) => set(state => {
    const currentStanding = state.player.factionStandings[factionId] || 0;
    const newStanding = Math.max(-100, Math.min(100, currentStanding + amount));
    
    get().addEventLog(`Standing with ${factionId} changed by ${amount}. New standing: ${newStanding}`);
    
    return {
      player: {
        ...state.player,
        factionStandings: {
          ...state.player.factionStandings,
          [factionId]: newStanding
        }
      }
    };
  }),

  getFactionStanding: (factionId: string) => {
    const state = get();
    return state.player.factionStandings[factionId] || 0;
  },

  getAvailableFactionServices: (factionId: string) => {
    const store = get();
    return store.sectFactionSystem.getAvailableFactionServices(factionId, store.player);
  },

  // Enhanced faction service gating
  canAccessFactionService: (factionId: string, serviceId: string) => {
    const store = get();
    const standing = store.getFactionStanding(factionId) || 0;
    const services = store.getAvailableFactionServices(factionId) || [];
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return { canAccess: false, reason: 'Service not found' };
    
    const requiredStanding = service.requiredStanding || 0;
    if (standing < requiredStanding) {
      return { 
        canAccess: false, 
        reason: `Requires ${requiredStanding} standing with ${factionId} (current: ${standing})` 
      };
    }
    
    // Check for rival relationships that might block services
    const rivals = store.getRivals();
    const hostileRivals = rivals.filter((r: Rival) => 
      r.faction === factionId && r.relationship < -40
    );
    
    if (hostileRivals.length > 0 && service.blockedByHostileRivals) {
      return {
        canAccess: false,
        reason: `Blocked by hostile relationship with ${hostileRivals[0].name}`
      };
    }
    
    return { canAccess: true, reason: '' };
  },

  purchaseFactionService: (factionId: string, serviceId: string) => {
    const store = get();
    const accessCheck = store.canAccessFactionService(factionId, serviceId);
    
    if (!accessCheck.canAccess) {
      store.addEventLog(`Cannot access service: ${accessCheck.reason}`);
      return false;
    }
    
    const services = store.getAvailableFactionServices(factionId);
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return false;
    
    // Check if player can afford the service
    const cost = service.cost || { yuan: 0 };
    if (cost.yuan && store.player.yuan < cost.yuan) {
      store.addEventLog(`Insufficient funds: need ${cost.yuan} yuan`);
      return false;
    }
    
    if (cost.spiritStones) {
      const playerStones = store.player.spiritStones;
      if (cost.spiritStones.low && playerStones.low < cost.spiritStones.low) {
        store.addEventLog(`Insufficient spirit stones: need ${cost.spiritStones.low} low-grade stones`);
        return false;
      }
    }
    
    // Deduct costs and apply service effects
    set(state => {
      const newState = { ...state };
      
      if (cost.yuan) {
        newState.player.yuan -= cost.yuan;
      }
      
      if (cost.spiritStones?.low) {
        newState.player.spiritStones.low -= cost.spiritStones.low;
      }
      
      // Apply service effects
      if (service.effects) {
        if (service.effects.qi) {
          newState.player.currentQi = Math.min(
            newState.player.currentQi + service.effects.qi,
            newState.player.qiRequired
          );
        }
        
        if (service.effects.cultivation) {
          newState.player.cultivationPower += service.effects.cultivation;
        }
        
        if (service.effects.insight) {
          newState.player.insight += service.effects.insight;
        }
      }
      
      return newState;
    });
    
    // Small standing boost for using faction services
    store.adjustFactionStanding(factionId, 1);
    store.addEventLog(`Purchased ${service.name} from ${factionId}`);
    
    return true;
  },

  // Battle event faction mechanics
  triggerFactionBattleEvent: (playerFaction: string, enemyFaction: string) => {
    const store = get();
    const playerStanding = store.getFactionStanding(playerFaction);
    const enemyStanding = store.getFactionStanding(enemyFaction);
    
    // Battle outcome influenced by faction standings
    const playerAdvantage = Math.max(0, playerStanding - enemyStanding) / 100;
    const baseSuccessChance = 0.6;
    const finalSuccessChance = Math.min(0.9, baseSuccessChance + playerAdvantage);
    
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const runtimeRng = require('../utils/seededRng').runtimeRng;
  const success = runtimeRng() < finalSuccessChance;
    const outcome = success ? 'victory' : 'defeat';
    
    // Apply faction standing changes
    const standingChange = success ? 15 : -10;
    const enemyStandingChange = success ? -8 : 5;
    
    store.adjustFactionStanding(playerFaction, standingChange);
    store.adjustFactionStanding(enemyFaction, enemyStandingChange);
    
    // Log faction conflict within store (no triggerRivalEvent API)
    store.addEventLog(`Faction war: ${playerFaction} vs ${enemyFaction} (${outcome})`);
    
    store.addEventLog(`Faction battle ${outcome}! Relations with ${playerFaction} and ${enemyFaction} affected.`);
    
    return { success, outcome, standingChange, enemyStandingChange };
  },

  // Breakthrough System Integration
  attemptMinorBreakthrough: () => {
    const store = get();
    if (!store.player.realmId) return false;

    const realmKey = REALM_ORDER[store.player.realmId - 1] || 'mortal';

    const result = store.breakthroughSystem.attemptMinorBreakthrough(
      realmKey,
      store.player.minorStage || 1,
      {
        daoHeart: store.player.daoHeart || 0,
        stability: (store.player as any).stability || 0,
        karma: store.player.karma || 0
      },
      store.player.skills as unknown as Record<string, number>
    );

    store.addEventLog(result.message);

    if (result.success && result.newStage) {
      const stageInfo = store.breakthroughSystem.getMinorStageInfo(realmKey, store.player.minorStage || 1);
      store.updatePlayerState({
        minorStage: result.newStage,
        currentQi: Math.max(0, store.player.currentQi - stageInfo.qiRequired)
      });

      if (result.insights) {
        result.insights.forEach(insight => store.addEventLog(`Gained insight: ${insight}`));
      }
    } else if (result.penalties) {
      const updates: any = {};
      Object.entries(result.penalties).forEach(([stat, penalty]) => {
        if (stat === 'qi') {
          updates.currentQi = Math.max(0, store.player.currentQi + penalty);
        } else {
          updates[stat] = Math.max(0, (store.player[stat as keyof typeof store.player] as number || 0) + penalty);
        }
      });
      store.updatePlayerState(updates);
    }

    return result.success;
  },

  attemptRealmBreakthrough: (challengeId: string) => {
    const store = get();
    if (!store.player.realmId) return false;

    const currentRealmKey = REALM_ORDER[store.player.realmId - 1];
    
    const result = store.breakthroughSystem.attemptRealmBreakthrough(
      currentRealmKey,
      challengeId,
      {
        daoHeart: store.player.daoHeart || 0,
        stability: (store.player as any).stability || 0,
        karma: store.player.karma || 0,
        hp: (store.player as any).hp || 0
      },
      store.player.skills as unknown as Record<string, number>
    );

    store.addEventLog(result.message);

    if (result.success && result.newRealm) {
      const newRealmId = result.newRealm;
      const newRealmIndex = REALM_ORDER.indexOf(newRealmId);
      store.updatePlayerState({
        realm: newRealmId,
        realmId: newRealmIndex >= 0 ? newRealmIndex + 1 : store.player.realmId,
        minorStage: 1,
        currentQi: 0
      });

      if (result.insights) {
        result.insights.forEach(insight => store.addEventLog(`Gained insight: ${insight}`));
      }
    } else if (result.penalties) {
      const updates: any = {};
      Object.entries(result.penalties).forEach(([stat, penalty]) => {
        if (stat === 'qi') {
          updates.currentQi = Math.max(0, store.player.currentQi + penalty);
        } else {
          updates[stat] = Math.max(0, (store.player[stat as keyof typeof store.player] as number || 0) + penalty);
        }
      });
      store.updatePlayerState(updates);
    }

    return result.success;
  },

  getBreakthroughChallenges: (realm: string) => {
    const store = get();
    return store.breakthroughSystem.getAvailableChallenges(realm);
  },

  canAttemptMinorBreakthrough: () => {
    const store = get();
    if (!store.player.realmId) return { canAttempt: false, reason: 'No realm set' };
    const currentRealmKey = REALM_ORDER[store.player.realmId - 1] || 'mortal';
    
    return store.breakthroughSystem.canAttemptMinorBreakthrough(
      currentRealmKey,
      store.player.minorStage || 1,
      store.player.currentQi,
      (store.player as any).stability || 0
    );
  },

  canAttemptRealmBreakthrough: () => {
    const store = get();
    if (!store.player.realmId) return { canAttempt: false, reason: 'No realm set' };
    const currentRealmKey = REALM_ORDER[store.player.realmId - 1] || 'mortal';
    
    return store.breakthroughSystem.canAttemptRealmBreakthrough(
      currentRealmKey,
      store.player.minorStage || 1,
      {
        daoHeart: store.player.daoHeart || 0,
        stability: (store.player as any).stability || 0,
        karma: store.player.karma || 0,
        hp: (store.player as any).hp || 0
      },
      store.player.skills as unknown as Record<string, number>
    );
  },

  // Playtest/Demo Features Implementation
  enableDemoMode: () => set(state => {
    const demoState = {
      player: {
        ...state.player,
        name: 'Demo Cultivator',
        cultivationPower: 500,
        insight: 200,
        currentQi: 500,
        qiRequired: 1000,
        spiritStones: { low: 100, mid: 50, high: 10 },
        yuan: 1000,
        karma: 50,
        skills: Object.fromEntries(
          Object.entries(state.player.skills).map(([key, skill]) => [
            key, 
            { ...skill, level: 3, exp: skill.expToNext - 1 }
          ])
        ),
        inventory: [
          { name: 'Spirit Sword', description: 'A basic spiritual weapon', value: 100, type: 'weapon' },
          { name: 'Healing Herb', description: 'Restores minor injuries', value: 25, type: 'consumable' }
        ]
      }
    };
    
    get().addEventLog('Demo mode activated! Advanced character state loaded.');
    
    return demoState;
  }),

  resetToDemoState: () => {
    const store = get();
    store.enableDemoMode();
    store.addEventLog('Reset to demo state complete.');
  },

  maxAllSkills: () => set(state => {
    const maxedSkills = Object.fromEntries(
      Object.entries(state.player.skills).map(([key, skill]) => [
        key,
        { ...skill, level: 10, exp: 0, expToNext: 1000 }
      ])
    );
    
    get().addEventLog('All skills maxed to level 10!');
    
    return {
      player: {
        ...state.player,
        skills: maxedSkills
      }
    };
  }),

  gainResources: (amount: number) => set(state => {
    const newSpiritStones = {
      low: state.player.spiritStones.low + amount,
      mid: state.player.spiritStones.mid + Math.floor(amount / 2),
      high: state.player.spiritStones.high + Math.floor(amount / 5)
    };
    
    get().addEventLog(`Gained ${amount} spirit stones!`);
    
    return {
      player: {
        ...state.player,
        spiritStones: newSpiritStones,
        yuan: state.player.yuan + amount * 10
      }
    };
  }),

  advanceRealm: () => set(state => {
    const currentIndex = state.player.realmId - 1;
    const currentRealm = REALM_ORDER[currentIndex];
    const nextRealm = currentIndex < REALM_ORDER.length - 1 ? REALM_ORDER[currentIndex + 1] : currentRealm;

    if (nextRealm !== currentRealm) {
      get().addEventLog(`Advanced to ${nextRealm} realm!`);

      return {
        player: {
          ...state.player,
          realm: nextRealm,
          realmId: REALM_ORDER.indexOf(nextRealm) + 1,
          minorStage: 1,
          currentQi: 0,
          qiRequired: REALM_QI_REQUIREMENTS[nextRealm],
          cultivationPower: state.player.cultivationPower + 200
        }
      };
    }

    get().addEventLog('Already at highest realm!');
    return state;
  }),

  showDebugMenu: false,
  toggleDebugMenu: () => set(state => ({
    ui: { ...state.ui, showDebugMenu: !state.ui.showDebugMenu }
  })),

  // Cross-System Validation & Integration Methods
  validateSystemIntegrity: () => {
    const store = get();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate RivalSystem integration
      if (!store.rivalSystem) {
        errors.push('RivalSystem not initialized');
      } else {
        const allRivals = store.rivalSystem.getAllRivals();
        allRivals.forEach(rival => {
          // Check for invalid relationship values
          if (typeof rival.relationship !== 'number' || isNaN(rival.relationship)) {
            errors.push(`Invalid relationship value for rival ${rival.id}: ${rival.relationship}`);
          }
          
          // Check for invalid encounter data
          if (typeof rival.lastEncounter !== 'number' || rival.lastEncounter < 0) {
            warnings.push(`Invalid last encounter data for rival ${rival.id}: ${rival.lastEncounter}`);
          }

          // Validate rival data consistency with local state
          const localRelationship = store.player.rivalRelationships[rival.id];
          if (localRelationship !== undefined && Math.abs(localRelationship - rival.relationship) > 5) {
            warnings.push(`Relationship mismatch for rival ${rival.id}: local=${localRelationship}, system=${rival.relationship}`);
          }
        });
      }

      // Validate SectFactionSystem integration
      if (!store.sectFactionSystem) {
        errors.push('SectFactionSystem not initialized');
      } else {
        const sectValidation = store.sectFactionSystem.validateSystemIntegrity();
        errors.push(...sectValidation.errors);
      }

      // Validate player state consistency
      if (store.player.sect && !store.sectFactionSystem?.getPlayerSect()) {
        warnings.push('Player sect mismatch between player state and sect system');
      }

      // Validate world state
      if (typeof store.world.day !== 'number' || store.world.day < 0) {
        errors.push(`Invalid world day: ${store.world.day}`);
      }

      if (typeof store.world.year !== 'number' || store.world.year < 1) {
        errors.push(`Invalid world year: ${store.world.year}`);
      }

      // Validate player stats
      Object.entries(store.player.stats).forEach(([stat, value]) => {
        if (typeof value !== 'number' || isNaN(value) || value < 0) {
          errors.push(`Invalid player stat ${stat}: ${value}`);
        }
      });

      console.log(`System validation completed: ${errors.length} errors, ${warnings.length} warnings`);

    } catch (error) {
      errors.push(`Validation process error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  syncSystemData: () => {
    const store = get();
    const syncedSystems: string[] = [];
    const errors: string[] = [];

    try {
      // Sync rival relationships between local state and RivalSystem
      if (store.rivalSystem) {
        const allRivals = store.rivalSystem.getAllRivals();
        let rivalSyncCount = 0;

        allRivals.forEach(rival => {
          try {
            const localRelationship = store.player.rivalRelationships[rival.id];
            if (localRelationship !== undefined && localRelationship !== rival.relationship) {
              // Use RivalSystem as source of truth
              store.player.rivalRelationships[rival.id] = rival.relationship;
              rivalSyncCount++;
            }
          } catch (error) {
            errors.push(`Failed to sync rival ${rival.id}: ${error}`);
          }
        });

        if (rivalSyncCount > 0) {
          syncedSystems.push(`RivalSystem (${rivalSyncCount} relationships synced)`);
        }
      }

      // Sync sect/faction data
      if (store.sectFactionSystem) {
        const playerSect = store.sectFactionSystem.getPlayerSect();
        if (playerSect !== store.player.sect) {
          if (playerSect) {
            store.player.sect = playerSect;
            syncedSystems.push('SectSystem (player sect synced)');
          } else if (store.player.sect) {
            // Player has sect in state but not in system - this might be an error
            errors.push('Player sect exists in state but not in sect system');
          }
        }
      }

      // Sync encounter data
      if (store.rivalSystem) {
        const allRivals = store.rivalSystem.getAllRivals();
        let encounterSyncCount = 0;

        allRivals.forEach(rival => {
          const localLastEncounter = store.player.lastRivalEncounters[rival.id];
          if (localLastEncounter !== undefined && localLastEncounter !== rival.lastEncounter) {
            // Use RivalSystem as source of truth
            store.player.lastRivalEncounters[rival.id] = rival.lastEncounter;
            encounterSyncCount++;
          }
        });

        if (encounterSyncCount > 0) {
          syncedSystems.push(`Encounter data (${encounterSyncCount} records synced)`);
        }
      }

      console.log(`System sync completed: ${syncedSystems.length} systems synced, ${errors.length} errors`);

    } catch (error) {
      errors.push(`Sync process error: ${error}`);
    }

    return {
      success: errors.length === 0,
      syncedSystems,
      errors
    };
  },

  repairSystemInconsistencies: () => {
    const store = get();
    const fixes: string[] = [];
    const remainingIssues: string[] = [];

    try {
      // First, validate to identify issues
      const validation = store.validateSystemIntegrity();
      
      if (validation.isValid) {
        return {
          repaired: true,
          fixes: ['No issues found - systems are consistent'],
          remainingIssues: []
        };
      }

      // Attempt to fix identified issues
      validation.errors.forEach(error => {
        try {
          if (error.includes('Invalid relationship value for rival')) {
            const rivalId = error.match(/rival (\w+):/)?.[1];
            if (rivalId && store.rivalSystem) {
              const rival = store.rivalSystem.getRival(rivalId);
              if (rival) {
                // Reset to neutral relationship
                store.rivalSystem.updateRivalRelationship(rivalId, -rival.relationship);
                fixes.push(`Reset invalid relationship for rival ${rivalId}`);
              }
            }
          } else if (error.includes('Invalid world day')) {
            // Reset world day to 1
            store.world.day = 1;
            fixes.push('Reset invalid world day to 1');
          } else if (error.includes('Invalid world year')) {
            // Reset world year to 1
            store.world.year = 1;
            fixes.push('Reset invalid world year to 1');
          } else if (error.includes('Invalid player stat')) {
            const statMatch = error.match(/stat (\w+):/);
            if (statMatch) {
              const statName = statMatch[1];
              if (store.player.stats[statName] !== undefined) {
                store.player.stats[statName] = Math.max(1, store.player.stats[statName] || 10);
                fixes.push(`Fixed invalid player stat ${statName}`);
              }
            }
          } else {
            remainingIssues.push(error);
          }
        } catch (fixError) {
          remainingIssues.push(`Failed to fix: ${error} (${fixError})`);
        }
      });

      // Handle warnings that can be auto-fixed
      validation.warnings.forEach(warning => {
        try {
          if (warning.includes('Relationship mismatch for rival')) {
            const rivalId = warning.match(/rival (\w+):/)?.[1];
            if (rivalId && store.rivalSystem) {
              const rival = store.rivalSystem.getRival(rivalId);
              if (rival) {
                // Use RivalSystem as source of truth
                store.player.rivalRelationships[rivalId] = rival.relationship;
                fixes.push(`Synced relationship mismatch for rival ${rivalId}`);
              }
            }
          } else if (warning.includes('Player sect mismatch')) {
            // Sync sect data
            const syncResult = store.syncSystemData();
            if (syncResult.success) {
              fixes.push('Fixed player sect mismatch');
            } else {
              remainingIssues.push('Could not fix player sect mismatch');
            }
          }
        } catch (fixError) {
          remainingIssues.push(`Failed to fix warning: ${warning} (${fixError})`);
        }
      });

      // Perform final sync after repairs
      const syncResult = store.syncSystemData();
      if (syncResult.success && syncResult.syncedSystems.length > 0) {
        fixes.push(`Post-repair sync: ${syncResult.syncedSystems.join(', ')}`);
      }

      console.log(`System repair completed: ${fixes.length} fixes applied, ${remainingIssues.length} remaining issues`);

    } catch (error) {
      remainingIssues.push(`Repair process error: ${error}`);
    }

    return {
      repaired: remainingIssues.length === 0,
      fixes,
      remainingIssues
    };
  }
}));
