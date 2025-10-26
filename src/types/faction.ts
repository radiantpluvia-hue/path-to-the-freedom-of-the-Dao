import type { ResourceKey } from './world';

export interface FactionState {
  id: string;
  name?: string;
  relationToPlayer?: 'ally'|'neutral'|'hostile';
  contribution?: number;
  techTree?: Record<string, boolean>;
  influenceGlobal?: number;
  treasury: Record<ResourceKey, number>;
}
