// Rich typings for the domain system helpers used by the TS server and shim
// Keep these non-ambient so the editor/tsserver can resolve imports from
// `src/utils/domainSystem.ts` without relying on a relative ambient module.
import type { TerritoryState, BuildingInstance } from './world';
import type { GarrisonState } from './garrison';
import type { FactionState } from './faction';
import type { GameState as GameStateType, AnyGameState as AnyGameStateType } from './game';

// A slightly-looser GameState used by domain helpers (allows partial world shape)
// Reuse a lightweight AnyGameState defined in game.ts for domain helpers
export type AnyGameState = AnyGameStateType;
export type GameState = GameStateType;

// A compact view of a territory used by some callers (lite view)
export type TerritoryStateLite = Pick<
  TerritoryState,
  'id' | 'ownerFactionId' | 'influence' | 'garrison' | 'buildings' | 'neighbors' | 'nodeType'
> & { name?: string };

// The structure returned by the capture preview helper
export interface CapturePreview {
  territoryId: string;
  previousOwner?: string | null;
  newOwner?: string | null;
  share: number; // winning share / influence share when capture occurs (0..1)
  defense: number; // computed defense metric from garrison/buildings
  requiredUpkeep: number; // upkeep required by the new owner after capture
  upkeepPaid?: boolean; // whether upkeep was successfully deducted on commit
  garrisonAfter?: GarrisonState | null; // garrison state after attrition if commit
  notes?: string[]; // optional advisory notes for the UI
}

export interface LedgerPreview {
  factionId?: string | null;
  factionBefore?: number;
  factionAfter?: number;
  playerBefore?: number;
  playerAfter?: number;
  garrisonBefore?: number | null;
  garrisonAfter?: number | null;
}

export interface CaptureResult {
  success: boolean;
  previousOwner?: string | null;
  newOwner?: string | null;
  share?: number;
  defense?: number;
  requiredUpkeep?: number;
  upkeepPaid?: boolean;
  garrisonAfter?: GarrisonState | null;
  snapshot?: any; // rollback snapshot for tests
  reason?: string;
}

// Function type signatures exported for convenience and better IDE hints
export type AttemptTerritoryCaptureFn = (
  gs: AnyGameState,
  territoryId: string,
  threshold?: number,
  commit?: boolean,
) => CapturePreview | null;

export type ApplyTerritoryInfluenceFn = (
  gs: AnyGameState,
  territoryId: string,
  factionId: string,
  amount: number,
) => boolean;

export type DecayInfluenceFn = (gs: AnyGameState, territoryId: string, decayFactor?: number) => boolean;

export type CreateDomainFn = (gs: AnyGameState, opts?: any) => TerritoryState | null;

export type GetDomainByIdFn = (gs: AnyGameState, id: string) => TerritoryStateLite | null;

export type TransferDomainOwnershipFn = (gs: AnyGameState, domainId: string, newOwnerFaction?: string) => boolean;

export type { TerritoryState, GarrisonState, FactionState, BuildingInstance };

export type CaptureFundingOption = 'normal' | 'drain_player' | 'force_capture';

export interface CaptureTransaction {
  territoryId: string;
  attackerFactionId: string | null;
  share: number;
  defense: number;
  requiredUpkeep: number;
  prevOwner: string | null;
  funding: CaptureFundingOption;
  forceParams?: {
    attritionMultiplier?: number;
    influencePenalty?: number;
    reputationPenalty?: number;
  } | null;
  ledger?: LedgerPreview;
}

// RNG/runtime hooks (for deterministic replay tooling)
// A simple zero-argument RNG function that returns a number in [0,1)
export type RandFn = () => number;

// Setter for injecting a runtime RNG (null to clear and fall back to Math.random)
export type SetRngFn = (rng: RandFn | null) => void;

// Getter for retrieving the currently active runtime RNG (may be null)
export type GetRngFn = () => RandFn | null;

// Convenience: uniform random integer in [min, max)
export type RandInRangeFn = (min: number, max: number) => number;

