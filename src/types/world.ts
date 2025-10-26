export type ResourceKey = 'gold' | 'food' | 'spirit_ore' | 'spirit_stone' | 'influencePoint';

export interface Domain {
  id: string;
  name: string;
  description?: string;
  level: number;
  bonuses: Record<string, number>;
}

export interface BuildingInstance {
  id: string;
  prototypeId: string;
  level: number;
  hp?: number;
  installedAtIso?: string;
  slots?: Record<string, string>;
}

export interface DomainSnapshot {
  id: string;
  tag?: string;
  savedAtIso: string;
  stateHash?: string;
}

export interface TerritoryState {
  id: string;
  nodeType: 'town'|'ruin'|'wild'|'farmland'|'mine'|'sect'|'fort'|'port';
  ownerFactionId?: string;
  contestedSince?: string | null;
  influence: Record<string, number>;
  garrison?: any; // referenced from garrison.ts to avoid circular here
  buildings: Record<string, BuildingInstance>;
  resourcesYieldModifiers?: Partial<Record<ResourceKey, number>>;
  rarity?: "H"|"F"|'ancient';
  lastActionIso?: string;
  neighbors: string[];
  special?: Record<string, any>;
}
