export interface Prerequisites {
  // Basic cultivation checks
  minAffinity?: number;
  minLevel?: number;
  realm?: number;
  maxRealm?: number;
  daoComprehension?: number;
  tribulationStage?: number;
  maxTribulationStage?: number;
  
  // Character attributes
  discipline?: number;
  cunning?: number;
  patience?: number;
  karma?: number;
  minKarma?: number;
  maxKarma?: number;
  rebelliousness?: number;

  // Mentor-related
  mentorAffinity?: Record<string, number>;
  mentorRivalry?: Record<string, number>;

  // Skills & points
  requiredSkills?: Record<string, number>;
  freeSkillPoints?: number;
  forbiddenSkills?: string[];

  // Items & artifacts
  requiredItems?: string[];
  forbiddenItems?: string[];
  requiredBloodlines?: string[];
  requiredPhysiques?: string[];
  consumedItems?: string[];
  phoenixBlood?: boolean;

  // Teaching dependencies
  requiredTeachings?: string[];

  // Relationships & social
  relationshipAffinity?: Record<string, number>;
  sectRank?: Record<string, number>;
  sectStanding?: Record<string, number>;

  // Event & quest flags
  eventFlags?: Record<string, boolean>;
  questProgress?: Record<string, number>;
  
  // Time & location constraints
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night' | 'midnight';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  location?: string[];
  
  // Logical operators for complex prerequisites
  or?: Prerequisites[];
  and?: Prerequisites[];
  not?: Prerequisites;
}

export interface MentorTeaching {
  id: string;
  title: string;
  description: string;
  challenge: TeachingChallenge;
  reward: Record<string, any>;
  failureConsequence: Record<string, any>;
  prerequisites?: Prerequisites;
}

export type TeachingDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary' | 'mythical' | 'transcendent' | 'impossible';

export interface TeachingChallenge {
  type: TeachingChallengeType;
  difficulty: TeachingDifficulty;
  requirements: string;
  restriction: string;
  failureReset?: boolean;
  stages?: number;
  timeLimit?: number; // seconds
  successThreshold?: number; // percentage or score
  minScore?: number; // minimum score to pass
  maxScore?: number; // maximum possible score
}

export interface TeachingProgress {
  currentStage: number;
  completed: boolean;
  attempts: number;
  lastAttempt?: number;
  bestScore?: number;
  completionTime?: number;
  masteryLevel?: number; // 0-100 mastery percentage
}

export type TeachingChallengeType = 
  | 'meditation_challenge'
  | 'qi_control_test'
  | 'combat_simulation'
  | 'puzzle_solving'
  | 'memory_test'
  | 'reaction_test'
  | 'pattern_recognition'
  | 'resource_management'
  | 'timing_challenge'
  | 'rebellion_mastery'
  | 'transformation_trial'
  | 'custom';

export interface ChallengeResult {
  success: boolean;
  score: number;
  timeTaken: number;
  accuracy?: number;
  efficiency?: number;
  bonusRewards?: Record<string, any>;
  penaltyConsequences?: Record<string, any>;
}

export interface TeachingTree {
  id: string;
  mentorId: string;
  teachings: TeachingNode[];
  prerequisites: Prerequisites;
}

export interface TeachingNode {
  teachingId: string;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected teachings
  unlockRequirements: Prerequisites;
}

export interface MentorTeachingProgress {
  mentorId: string;
  affinity: number;
  teachingsCompleted: string[];
  teachingsInProgress: string[];
  lastInteraction: number;
  cooldowns: Record<string, number>; // teachingId -> cooldown end time
  favoriteTeachings: string[];
  masteryLevels: Record<string, number>; // teachingId -> mastery 0-100
}
