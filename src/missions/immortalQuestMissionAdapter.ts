import { attemptSecretQuest } from '@/quests/immortalSecretQuest';

export interface MissionResultContext {
  playerReputation: number;
  foundSecretClue?: boolean;
  stealthSuccessful?: boolean;
  worldState?: { eraIndex?: number; allowsSacredFindings?: boolean };
}

// Called when a mission completes; may trigger the immortal secret quest
export function onMissionComplete(ctx: MissionResultContext, rng?: any) {
  if (!ctx.foundSecretClue) return { triggered: false, message: 'No secret clue.' };
  const q = attemptSecretQuest({ playerReputation: ctx.playerReputation, foundSecretClue: ctx.foundSecretClue, stealthSuccessful: ctx.stealthSuccessful, worldState: ctx.worldState }, rng);
  return { triggered: q.success, reward: q.reward, message: q.message };
}
