import type { TerritoryState } from './world';
import type { FactionState } from './faction';

export interface AnyGameState {
  player?: any;
  world?: {
    territories?: Record<string, TerritoryState>;
    factions?: Record<string, FactionState>;
    [key: string]: any;
  };
  [K: string]: any;
}

export type GameState = AnyGameState
