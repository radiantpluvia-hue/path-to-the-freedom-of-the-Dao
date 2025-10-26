// guCultivation.ts

// Types for Gu cultivation
export type GuRank = 
  | 'ApertureDormant'   // before awakening
  | 'GuMaster_Rank1_Init'
  | 'GuMaster_Rank1_Mid'
  | 'GuMaster_Rank1_Upper'
  | 'GuMaster_Rank1_Peak'
  // ... similarly Ranks 2 through 5 mortal ranks
  | 'GuImmortal_Rank6'
  | 'GuImmortal_Rank7'
  | 'GuImmortal_Rank8'
  | 'Venerable';        // top rank

export interface GuCultivationState {
  unlocked: boolean;
  affinityWithFangYuan: number;    // tracks how much affinity
  currentRank: GuRank;
  apertureProgress: number;        // progress toward next stage (e.g. toward breaking an aperture wall)
  vitalGu?: any;                    // the player’s vital Gu (if any)
  otherGuOwned: any[];              // any other Gu (wild, refined, etc.)
}

export interface Gu {
  id: string;
  rank: number;           // numeric version of rank (e.g. 1 .. 9)
  name: string;
  isVital: boolean;
  willCorruption?: number; // optional, if we implement purity/corruption
  // resources required to maintain/feed, etc.
  upkeepCost: Record<string, number>;
}

export type OtherPathId = 'Body' | 'Qi' | 'Magic' | 'Spiritual' | 'Refining'; 

export interface Player {
  guState: GuCultivationState;
  cultivationPath: any;  
  availablePaths: OtherPathId[];   // what paths the player can still choose/use
}

const AFFINITY_THRESHOLD_TO_UNLOCK_GU = 80; // you can adjust
const LOCKED_OUT_PATHS_ON_GU_UNLOCK: OtherPathId[] = [ 'Qi', 'Magic', 'Spiritual' ];

export function tryUnlockGuCultivation(player: Player) {
  if (player.guState.unlocked) return false;
  if (player.guState.affinityWithFangYuan >= AFFINITY_THRESHOLD_TO_UNLOCK_GU) {
    unlockGuCultivation(player);
    return true;
  }
  return false;
}

function unlockGuCultivation(player: Player) {
  player.guState.unlocked = true;
  // awaken aperture
  player.guState.currentRank = 'ApertureDormant';  
  player.guState.apertureProgress = 0;
  // assign a default vital Gu if you want
  // player.guState.vitalGu = createStarterVitalGu();

  // Lock out other cultivation paths except body + refining Gu
  player.availablePaths = player.availablePaths.filter(path => {
    // keep Body cultivation and Refining Gu (or whatever you call Gu path)
    return path === 'Body' || path === 'Refining';
  });

  // Optionally, set player's current cultivation path to Gu if they weren't on a locked out one
  player.cultivationPath = 'Refining';  // Or 'Gu' if you have that path id

  // Trigger any unlock effects, rewards, UI updates
  onGuUnlocked(player);
}

function onGuUnlocked(player: Player) {
  console.log('Gu Cultivation unlocked!');
  player.guState.vitalGu = {
    id: 'starter_gu',
    rank: 1,
    name: 'Starter Gu',
    isVital: true,
    upkeepCost: { essence: 10, food: 1 },
  } as any;
}

export function increaseAffinityWithFangYuan(player: Player, amount: number) {
  player.guState.affinityWithFangYuan += amount;
  if (player.guState.affinityWithFangYuan > 100) player.guState.affinityWithFangYuan = 100;
  tryUnlockGuCultivation(player);
}

export function progressGuCultivation(player: Player, resources: { essence: number; materials: number }) {
  if (!player.guState.unlocked) {
    throw new Error('Cannot progress Gu cultivation; it’s not unlocked.');
  }

  const needed = computeApertureWallRequirement(player.guState.currentRank);
  player.guState.apertureProgress += resources.essence - resources.materials * 0.5; // adjust formula

  if (player.guState.apertureProgress >= needed) {
    const nextRank = getNextGuRank(player.guState.currentRank);
    if (nextRank) {
      player.guState.currentRank = nextRank;
      player.guState.apertureProgress = 0;
      onGuRankUp(player, nextRank);
    }
  }
}

function computeApertureWallRequirement(currentRank: GuRank): number {
  const base = 100;
  const rankNumber = guRankToNumber(currentRank);
  return base * rankNumber * rankNumber * 2;  // e.g. quadratic scaling
}

function guRankToNumber(rank: GuRank): number {
  switch (rank) {
    case 'ApertureDormant': return 0;
    case 'GuMaster_Rank1_Init': return 1;
    case 'GuMaster_Rank1_Mid': return 2;
    case 'GuMaster_Rank1_Upper': return 3;
    case 'GuMaster_Rank1_Peak': return 4;
    case 'GuImmortal_Rank6': return 6;
    case 'GuImmortal_Rank7': return 7;
    case 'GuImmortal_Rank8': return 8;
    case 'Venerable': return 9;
    default: return 0;
  }
}

function getNextGuRank(current: GuRank): GuRank | null {
  const ordering: GuRank[] = [
    'ApertureDormant',
    'GuMaster_Rank1_Init',
    'GuMaster_Rank1_Mid',
    'GuMaster_Rank1_Upper',
    'GuMaster_Rank1_Peak',
    'GuImmortal_Rank6',
    'GuImmortal_Rank7',
    'GuImmortal_Rank8',
    'Venerable',
  ];
  const idx = ordering.indexOf(current);
  if (idx < 0 || idx + 1 >= ordering.length) return null;
  return ordering[idx + 1];
}

function onGuRankUp(player: Player, newRank: GuRank) {
  console.log(`Player has advanced to ${newRank} in Gu cultivation!`);
}

export function refineGu(player: Player, gu: Gu, materials: number) {
  // placeholder: implement refining logic
}

export default {
  tryUnlockGuCultivation,
  increaseAffinityWithFangYuan,
  progressGuCultivation,
  refineGu,
};
