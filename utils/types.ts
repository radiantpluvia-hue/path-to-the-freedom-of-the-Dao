
import type {
  PlayerState as CanonPlayerState,
  GameState as CanonGameState,
  WorldState as CanonWorldState,
  InventoryItem as CanonInventoryItem,
  Manual as CanonManual,
  HeavensListEntry as CanonHeavensListEntry,
} from '@/types';

export type RNG = (min: number, max: number) => number;

// Provide backward-compatible augmented types that extend the canonical types
// with legacy/optional properties used across the codebase. This keeps a
// single source of truth while preserving compatibility.

export type PlayerState = CanonPlayerState & {
  // legacy or alternate names used in older executors
  legacyTokens?: number;
  fame?: number;
  title?: string;
  factionStanding?: Record<string, number>;
  relationships?: Record<string, number>;
};

export type InventoryItem = CanonInventoryItem & {
  // some executors used `qty` instead of `quantity`
  qty?: number;
};

export type Manual = CanonManual;

export type WorldState = CanonWorldState;

export type HeavensListEntry = CanonHeavensListEntry & {
  // optional title was used in some code paths
  title?: string;
};

export type GameState = CanonGameState & {
  // optional RNG hook used by some global executors
  rng?: RNG;
};

export type EventExecutor<TArgs = any> = (state: GameState, args?: TArgs) => GameState;

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  act: number;
  type?: string;
  customExecutor?: keyof EventExecutorRegistry;
}

export interface EventExecutorRegistry {
  [key: string]: EventExecutor<any>;
}

export interface TournamentResult {
  championId: string;
  runnerUpId: string;
  bracket: string[][];
}
