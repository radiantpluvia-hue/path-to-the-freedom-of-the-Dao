// File: src/types/heavenly.ts

export type EntityType = 'player' | 'npc' | 'sect' | 'beast' | 'artifact';

export interface HeavenlyRankEntry {
  id: string; // unique id: entityId or "sect:<id>"
  name: string;
  type: EntityType;
  realm: string;
  powerScore: number;
  providenceScore: number;
  karmaScore: number;
  compositeScore: number;
  lastUpdated: number; // epoch ms
  notableAction?: string | null;
}

export interface HeavenlyRankingSeason {
  seasonId: string;
  seasonStartYear: number; // absolute game year
  seasonEndYear: number;
  entries: HeavenlyRankEntry[];
  publishedAt?: number;
}

export interface HeavenlyDaoState {
  currentSeason?: HeavenlyRankingSeason | null;
  archive: HeavenlyRankingSeason[];
}

export default HeavenlyDaoState;
