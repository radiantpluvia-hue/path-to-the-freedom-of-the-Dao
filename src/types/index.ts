export * from './MentorTeaching';

// Re-export common types
export interface GameState {
  player: PlayerState;
  world: WorldState;
  flags: Record<string, any>;
}

export interface PlayerState {
  name: string;
  level: number;
  qi: number;
  daoHeart: number;
  mentorAffinity: Record<string, number>;
  [key: string]: any;
}

export interface WorldState {
  flags: Record<string, any>;
  [key: string]: any;
}