// Re-export canonical Rarity from the central rarity config so there's one source of truth
export type { Rarity } from './config/rarity';
// Bring Rarity into file scope for local references
import type { Rarity as _RarityLocal } from './config/rarity';
type Rarity = _RarityLocal;

// Optional RNG hook used by some executors
export type RNG = (min: number, max: number) => number;

export interface TeachingProgress {
  attempts: number;
  completed: boolean;
  bestScore: number;
  currentStage: number;
  lastAttempt?: number;
  completionTime?: number;
  // Mastery progression (used by MentorTeachingSystem)
  masteryLevel?: number;
  masteryPoints?: number;
}

export interface MentorTeachingProgress {
  // Tracks the number of times a player has been taught by a mentor
  teachingsReceived: number;
  // Timestamp of the last teaching to manage cooldowns (legacy, may store tick)
  lastTaughtTimestamp: number;
  // Explicit tick of last teaching to manage cooldowns precisely
  lastTaughtTick?: number;
  // Tracks specific teachings learned to prevent re-learning
  learnedTeachings: string[];
}
// Buff System Types
export interface Buff {
  id: string;
  name: string;
  description: string;
  duration: number; // Duration in ticks, -1 for permanent
  durationType: 'ticks' | 'actions' | 'combat'; // How duration is consumed
  effects: Record<string, any>; // Stat modifiers, special effects, etc.
  source: string; // Source of the buff (item, technique, etc.)
  sourceId: string; // ID of the source (itemId, techniqueId, etc.)
  stackable: boolean; // Whether multiple instances can stack
  maxStacks?: number; // Maximum number of stacks if stackable
  currentStacks?: number; // Current number of stacks
  appliedAt: number; // Timestamp when buff was applied
  appliedTick: number; // World tick when buff was applied
  specialEffectId?: string; // ID for special effects/triggers
  appliedEffects?: Record<string, any>; // Calculated stat modifiers for reversion
  isPermanent?: boolean; // Explicit permanent flag
  hidden?: boolean; // Whether buff is visible to player
  category?: 'stat' | 'special' | 'combat' | 'cultivation'; // Buff category
    initialDuration?: number; // Optional initial duration for the buff
    expiring?: boolean; // UI flag to indicate buff is in expiration animation
}

// Unified GameState Interface for all systems
export interface GameState {
  player: PlayerState;
  world: WorldState;
  story: StoryState;
  ui: UIState;
  systems: SystemState; // New unified systems state
}

// Player State - Core player data
export interface PlayerState {
  name: string;
  gender: 'Male' | 'Female';
  race: string;
  background: Background | null;
  age: number;
  realmId: number;
  realm: string;
  combatPower: number;
  talentId: string;
  minorStage: number;
  level: number;
  baseStats: Record<string, number>;
  stats: Record<string, number>;
  insight: number;
  karma: number;
  cunning: number;
  resolve: number;
  resourcefulness: number;
  currentQi: number;
  qiRequired: number;
  lifespan: number;
  spiritStones: { low: number; mid: number; high: number };
  yuan: number;
  inventory: InventoryItem[];
  skills: Record<string, Skill>;
  mentorAffinity: Record<string, number>;
  manuals: Manual[];
  bloodline: Bloodline | null;
  physique: Physique | null;
  sect: string | null;
  techniques: string[];
  daoPrinciple?: string;
  severedAspect?: 'system' | 'identity' | 'empathy';
  defeatedRivals?: string[];
  cultivationPower: number;
  discipline: number;
  patience: number;
  daoHeart: number;
  reputation: Record<string, number>;
  factionStandings: Record<string, number>;
  sectReputations: Record<string, number>;
  rivalRelationships: Record<string, number>;
  lastRivalEncounters: Record<string, number>;
  factionBattles: FactionBattle[];
  factionReputations: Record<string, number>;
  // Daily tracking for Enhanced Quest System
  dailyCultivationCount?: number;
  lastDailyReset?: number;
  // Timestamps of last training actions (ms since epoch) for cooldown management
  trainingTimestamps?: Record<string, number>;
  // New single-progress cultivation model
  isCultivating?: boolean;
  cultivationProgressPercent?: number; // 0..100 percent towards next realm
  // Tick when current cultivation run started (world.tick). Used to compute consolidation time.
  cultivationStartTick?: number;
  // When true (or when providenceVeil is set), player is hidden from Heavenly Dao detection for ascension
  hiddenFromHeaven?: boolean;
  // Mentor-specific properties
  shadowLedger?: number;
  providenceVeil?: number;
  flameAffinity?: number;
  daoComprehension?: number;
  skillPoints?: number;
  // Mentor Teaching System Integration
  teachingProgress: Record<string, TeachingProgress>;
  mentorProgress: Record<string, MentorTeachingProgress>;
  buffs?: Record<string, any>;
  // Optional XP tracking for quests
  experience?: number;
  // Crafting system integration
  discoveredRecipes: string[];
  // Location system integration
  currentLocationId: string | null;
  // Buff system integration
  activeBuffs: Buff[];
  // Direct stat properties for convenience
  hp: number;
  qi: number;
  maxHp: number;
  maxQi: number;
  // Backwards-compatible legacy/alternate fields used across executors
  fame?: number;
  title?: string;
  relationships?: Record<string, number>;
  // Some older code used singular 'factionStanding' vs canonical 'factionStandings'
  factionStanding?: Record<string, number>;
  // Legacy token field used by ritual/legacy mentors
  legacyTokens?: number;
  // Meta-progression across lives
  legendPoints?: number;
  metaUnlocks?: Record<string, any>;
  previousLives?: Array<{ lifeNum: number; eraId?: string; eraIndex?: number; fateSummary?: string; seed?: string; carriedArtifactIds?: string[] }>;
  // Player-specific persisted settings/preferences
  settings?: {
    powerScalePercent?: number;
    [key: string]: any;
  };
}

// World State - Global game world data
export interface WorldState {
  year: number;
  day: number;
  tick: number; // explicit world tick for precise cooldowns and timing
  flags: Record<string, any>;
  factions: Record<string, any>;
  heavensList?: HeavensListEntry[];
  lastEpochTournamentYear?: number;
  activeEvents: string[]; // Currently active world events
  marketRefreshTimers: Record<string, number>; // Market refresh timers
  // Optional evolution fields set during ascension/world transitions
  ascended?: boolean;
  currentWorldType?: 'mortal' | 'immortal' | 'divine' | string;
  worldTier?: number;
  // Era tracking
  currentEraId?: string;
  currentEraIndex?: number;
  currentEraSeed?: string;
  eraNormalized?: { qiDensityNorm: number; artifactDensityNorm: number };
  eventBias?: { dark: number; neutral: number; light: number };
  modifiers?: {
    qiDensity?: number;
    demonicQi?: number;
    holyQi?: number;
    sectCorruptionRate?: number;
    artifactDensity?: number;
  } & Record<string, any>;
}

// Story State - Narrative and quest progression
export interface StoryState {
  currentAct: string;
  mainQuestId: string;
  questProgress: Record<string, { completed: boolean; objectives: Record<string, boolean> }>;
  activeSectQuests: string[];
  activeRandomMissions: RandomMission[];
  activeBetrayalMissions?: BetrayalMission[];
  quests?: any[];
  completedQuests: string[]; // Track completed quests
  storyFlags: Record<string, any>; // Story-specific flags
}

// UI State - Interface and display state
export interface UIState {
  currentScreen: 'creation' | 'game' | 'social' | 'lore' | 'rebellion' | 'sects' | 'combat' | 'market' | 'mentors' | 'domain' | 'inventory' | 'relationships' | 'tutorial' | 'death';
  selectedMentor: string | null;
  showMentorModal: boolean;
  showLore: boolean;
  currentLoreIndex: number;
  showCodex: boolean;
  showDebugMenu: boolean;
  showTechniqueMastery?: boolean;
  activeStoryChoice?: {
    questId: string;
    eventId: string;
    title: string;
    description: string;
    choices: EventChoice[];
    context?: Record<string, any>;
  };
  selectedMarket?: string; // Currently viewed market
  selectedRival: string | null; // Currently viewed rival
  combatState?: CombatUIState; // Combat UI state
  // Mini-game overlay/session info (optional)
  activeMiniGame?: {
    id: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary' | "D";
    startTick: number;
    sessionId: string;
  } | null;
  // UI display flags
  compactLayout?: boolean; // when true, show a reduced/cleaner interface
  showNotes?: boolean; // toggles small quick-notes window
  // dialogue panel customizations used by UI components and tests
  dialoguePanelPosition?: string;
  dialoguePanelOpacity?: number;
  lastPracticeMessage?: string;
  showNarrative?: boolean;
  // Save/load UI helpers
  saveInProgress?: boolean;
  lastSavedAt?: number;
}

// System State - Unified state for all game systems
export interface SystemState {
  // Rival System
  rivals: Record<string, Rival>;
  rivalEncounters: RivalEncounter[];
  rivalCooldowns: Record<string, number>;

  // Combat System
  activeCombat?: CombatInstance;
  combatHistory: CombatResult[];

  // Mentor Teaching System
  teachingProgress: Record<string, TeachingProgress>;
  mentorProgress: Record<string, MentorTeachingProgress>;
  availableTeachings: Record<string, string[]>; // mentorId -> teachingIds

  // Sect System
  sectReputations: Record<string, number>;
  factionStandings: Record<string, number>;
  currentSectMissions: string[];

  // Market System
  marketInventory: Record<string, number>;
  activeAuctions: AuctionItem[];
  marketRefreshTimes: Record<string, number>;

  // Quest System
  questObjectives: Record<string, QuestObjective[]>;
  questRewards: Record<string, any>;
  // Optional domain and lifePhase systems used by UI components
  domain?: DomainState;
  lifePhase?: LifePhaseState | any;
}

// Combat UI State
export interface CombatUIState {
  phase: 'setup' | 'combat' | 'resolution';
  selectedTechnique?: string;
  targetRival?: string;
  combatLog: string[];
  turnNumber: number;
}

// Combat Instance for active combat
export interface CombatInstance {
  id: string;
  type: 'rival' | 'sect' | 'faction' | 'training';
  participants: string[];
  currentTurn: number;
  status: 'active' | 'paused' | 'completed';
  startTime: number;
  context: Record<string, any>; // Additional context (location, stakes, etc.)
}

// Combat Result
export interface CombatResult {
  id: string;
  type: string;
  participants: string[];
  winner: string;
  duration: number;
  rewards: Record<string, any>;
  penalties: Record<string, any>;
  timestamp: number;
}

// Auction Item (from MarketSystem)
export interface AuctionItem {
  id: string;
  item: any; // MarketItem
  sellerId: string;
  sellerName: string;
  startingBid: number;
  currentBid: number;
  currentBidder: string | null;
  timeRemaining: number;
  bidHistory: AuctionBid[];
  buyoutPrice?: number;
}

export interface AuctionBid {
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: number;
}

// Quest Objective (from QuestSystem)
export interface QuestObjective {
  id: string;
  type: string;
  description: string;
  target: string;
  value: number | string;
  isCompleted: boolean;
}

export interface RandomMission {
  id: string;
  title: string;
  description: string;
  type: 'gather' | 'defeat' | 'escort' | 'investigate';
  target: string;
  location: string;
  reward: {
    spiritStones?: { low?: number; mid?: number; high?: number };
    sectReputation?: number;
    karma?: number;
  };
  isCompleted: boolean;
}

export interface BetrayalMission {
  id: string;
  title: string;
  description: string;
  offeredBy: string; // rivalId
  offeredByName: string; // rivalName
  targetSect: string; // player's sectId
  objective: string;
  reward: {
    spiritStones?: { low?: number; mid?: number; high?: number };
    item?: InventoryItem;
    rivalRelationship?: number;
  };
  isCompleted: boolean;
}

export type StatEffect = number | {
  base: number;
  scaling: {
    type: 'realm' | 'level';
    multiplier: number;
  };
};

export interface Background {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  effects: Record<string, any>;
  weaponMastery?: {
    swordsmanship?: { tier: string };
    spearArts?: { tier: string };
    archery?: { tier: string };
    daggerArts?: { tier: string };
    staffArts?: { tier: string };
    swordQi?: { tier: string };
  };
}
// Extend Background with commonly-used data fields
export interface Background {
  abilities?: Record<string, any>;
  tags?: string[];
  previewIcon?: string;
  previewEffects?: string[];
  startChance?: number;
}

// Domain and territory structures used by DomainPanel and DomainSystem
export interface TerritoryState {
  id: string;
  nodeType: string;
  rarity: string;
  ownerFactionId?: string | null;
  garrison?: { troops: number; quality?: number } | null;
  influence: Record<string, number>;
  contestedSince?: number | null;
  [key: string]: any;
}

export interface FactionState {
  id: string;
  name: string;
  relationToPlayer?: string;
  contribution?: number;
  influenceGlobal?: number;
  [key: string]: any;
}

export interface DomainState {
  level: number;
  xp: number;
  resources: {
    gold: number;
    food: number;
    spirit_ore: number;
    spirit_stone: number;
    influencePoint: number;
  };
  territories: Record<string, TerritoryState>;
  factions: Record<string, FactionState>;
  [key: string]: any;
}

// Minimal permissive stubs for missing system-level types referenced across the
// repository. Using `any` here is a temporary compatibility shim to unblock the
// typecheck; we can replace these with precise definitions in follow-ups.
export type NarrativeEngine = any;
export type DestinyThread = any;
export type DestinyConnection = any;
export type DestinyEffect = any;
export type KarmaEvent = any;
export type KarmaConsequence = any;
export type LegacyRemnant = any;
export type PastLife = any;
export type LifePhase = any;
export type LifeEvent = any;
export type LifePhaseState = any;
export type PhaseType = any;
export type ResourceKey = 'gold' | 'food' | 'spirit_ore' | 'spirit_stone' | 'influencePoint';
export type EnhancedFormation = any;
export type ActiveEncounter = any;

// More permissive compatibility aliases for commonly referenced types
// FactionState is defined above with a precise interface
export type ObjectiveType = string | any;
export type Dialogue = any;
export type PhysiqueSynergy = any;
export type MapNode = any;
export type MapEdge = any;
export type WeaponMastery = any;
export type NarrativeTrigger = any;
export type HeavenlyDaoInsight = any;

// Generic utility types used in several places
export type AnyRecord = Record<string, any>;

// Extend PlayerState with commonly-used optional legacy fields
export interface PlayerState {
  fatigue?: number;
  equipment?: Record<string, any>;
  activeEncounter?: any | null;
  activeTravel?: any | null;
  currentMapNode?: string | null;
  unlockedMapNodes?: string[];
  lastPlannedTravel?: number;
  proficiencies?: Record<string, Record<string, number>>;
  proficienciesByRealm?: Record<string, number>;
  proficiency?: Record<string, any>;
  proficienciesLegacy?: Record<string, any>;
  // allow arbitrary additional legacy fields
  [key: string]: any;
}

export interface Skill {
  level: number;
  exp: number;
  expToNext: number;
  category?: 'combat' | 'cultivation' | 'crafting' | 'social' | 'special';
  description?: string;
  evolution?: string; // Next evolution skill ID
  maxLevel?: number;
}

export const XIANXIA_SKILLS: Record<string, Skill> = {
  weaponMastery: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'combat',
    description: 'Mastery of various weapons, increasing damage and proficiency.',
    evolution: 'swordQi',
    maxLevel: 10,
  },
  alchemy: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'crafting',
    description: 'Ability to create potions and elixirs for various effects.',
    evolution: 'pillRefining',
    maxLevel: 10,
  },
  comprehension: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'cultivation',
    description: 'Understanding of cultivation techniques and principles.',
    evolution: 'cultivationSpeed',
    maxLevel: 10,
  },
  qiControl: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'cultivation',
    description: 'Control over qi, enhancing cultivation and techniques.',
    evolution: 'qiMastery',
    maxLevel: 10,
  },
  bodyTempering: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'cultivation',
    description: 'Strengthening the body to withstand greater challenges.',
    evolution: 'physicalFortitude',
    maxLevel: 10,
  },
  daoInsight: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'cultivation',
    description: 'Understanding the Dao, enhancing overall cultivation.',
    evolution: 'daoMastery',
    maxLevel: 10,
  },
  combatSkills: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'combat',
    description: 'Skills in hand-to-hand combat and martial arts.',
    evolution: 'martialArtsMastery',
    maxLevel: 10,
  },
  socialSkills: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'social',
    description: 'Ability to interact and influence others effectively.',
    evolution: 'charisma',
    maxLevel: 10,
  },
  mentalFortitude: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'special',
    description: 'Strength of mind, resisting mental attacks and distractions.',
    evolution: 'mentalMastery',
    maxLevel: 10,
  },
  spiritBeastTaming: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'special',
    description: 'Ability to tame and communicate with spirit beasts.',
    evolution: 'spiritBeastMastery',
    maxLevel: 10,
  },
  meditation: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'cultivation',
    description: 'Enhances cultivation speed and mental clarity.',
    evolution: 'deepMeditation',
    maxLevel: 10,
  },
  forging: {
    level: 0,
    exp: 0,
    expToNext: 100,
    category: 'crafting',
    description: 'Ability to forge weapons and items with special properties.',
    evolution: 'masterBlacksmith',
    maxLevel: 10,
  },
};

export interface InventoryItem {
  id?: string; // Optional unique ID for quest/reward tracking
  itemId?: string; // Additional ID for crafting system compatibility
  name: string;
  description: string;
  value?: number;
  type?: string;
  quantity?: number; // Optional quantity support for stacks
  effects?: Record<string, any>; // Item effects (e.g., stat boosts, buffs)
  uniqueProperties?: Record<string, any>; // Special properties (e.g., specialEffectId)
}

// Weapon / Market item types used by WeaponSpawner and MarketSystem
export interface WeaponItem {
  id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  tier?: number | string;
  atk?: number;
  speed?: number;
  tags?: string[];
  secretArea?: boolean;
  questRequired?: boolean;
  rarity?: string;
  [key: string]: any;
}

export interface MarketItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  rarity?: string;
  [key: string]: any;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  image?: string;
  requirements?: {
    talentId?: string;
    minRealmId?: number;
    karma?: { min?: number; max?: number };
  };
  weight?: number; // Higher weight means more common. Defaults to 1.
}

export interface EventChoice {
  text: string;
  effects: Record<string, any>;
  narrative?: string; // Optional text to show in the event log after choosing.
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  completed: boolean;
}

export interface Manual {
  id: string;
  name: string;
  description: string;
  rank: Rarity;
  effects: {
    stats?: Record<string, StatEffect>;
    special?: string[];
  } & Record<string, any>;
  evolutionTargetId?: string;
  evolutionRequirements?: Record<string, any>;
  requirements?: {
    realm?: string;
    skills?: Record<string, number>;
    bloodline?: string;
    karma?: number;
  };
  risks?: string[];
  // Optional canonical tier code for migration (e.g., 'H','G','F','E','D','B')
  rarityCode?: string;
}

export interface HeavensListEntry {
  id: string;
  name: string;
  rank: number;
  combatPower: number;
  karma: number;
  fame: number;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  description: string;
  requirements: Record<string, any>;
  teachings: Teaching[];
}

export interface Teaching {
  id: string;
  name: string;
  description: string;
  cost: Record<string, any>;
  effects: Record<string, any>;
}

export interface Bloodline {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  pillarState?: 'dormant' | 'awakened' | 'pillar' | "D";
  effects: {
    stats?: Record<string, StatEffect>;
    skills?: Record<string, number>;
    special?: string[];
  };
  awakening_requirements?: Record<string, any>;
  awakenedId?: string;
  // Optional canonical tier code for migration
  rarityCode?: string;
}

export interface Physique {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  effects: {
    stats?: Record<string, StatEffect>;
    skills?: Record<string, number>;
    cultivation_speed?: StatEffect;
    special?: string[];
  };
  evolutionTargetId?: string;
  evolutionRequirements?: Record<string, any>;
  // Optional canonical tier code for migration
  rarityCode?: string;
}

// Rival System Types
export interface Rival {
  id: string;
  name: string;
  title: string;
  description: string;
  faction: string;
  sect: string;
  realm: string;
  level: number;
  stats: {
    hp: number;
    qi: number;
    atk: number;
    def: number;
    speed: number;
  };
  techniques: string[];
  personality: 'aggressive' | 'cunning' | 'honorable' | 'treacherous' | 'neutral';
  relationship: number; // -100 to 100
  lastEncounter: number; // day of last encounter (used for cooldown checks)
  encounterCount: number;
  defeated: boolean;
  specialAbilities: string[];
  loot: InventoryItem[];
  archetype?: string; // Reference to rival archetype
  growthStage?: number; // Current growth stage for progression
  lastGrowth?: number; // Timestamp of last growth event
  evolutionPath?: string; // Current evolution path
  teachingAffinity?: number; // Willingness to teach (0-100)
  storyProgression?: Record<string, any>; // Story-specific progression data
}

export interface FactionBattle {
  id: string;
  type: 'skirmish' | 'raid' | 'war' | 'duel';
  factions: string[];
  participants: string[];
  outcome: 'victory' | 'defeat' | 'draw' | 'ongoing';
  rewards: Record<string, any>;
  penalties: Record<string, any>;
  year: number;
}

export interface RivalEncounter {
  id: string;
  rivalId: string;
  type: 'chance' | 'provoked' | 'defense' | 'competition';
  location: string;
  description?: string; // Optional description for logging purposes
  outcome: 'victory' | 'defeat' | 'fled' | 'truce';
  lootGained: InventoryItem[];
  reputationChange: Record<string, number>;
  year: number;
  timestamp?: number; // Optional timestamp for precise timing
}
