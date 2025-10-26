// eventExecutors_act6.ts
import { GameState, EventExecutor } from "./types";

// --- Custom Executors for Act 6 ---

const fn_act6_founders_seeding: EventExecutor = (gs: GameState) => {
  // Simplified implementation without domain system
  gs.world.flags = gs.world.flags || {};
  gs.world.flags['domain_founded'] = true;
  return { ...gs };
};

const fn_act6_pillar_workshop: EventExecutor = (gs: GameState) => {
  // Simplified pillar workshop implementation
  gs.world.flags = gs.world.flags || {};
  gs.world.flags['pillar_stone'] = true;
  return { ...gs };
};

const fn_act6_heritage_library: EventExecutor = (gs: GameState) => {
  // Simplified heritage library implementation
  gs.world.flags = gs.world.flags || {};
  gs.world.flags['heir_named'] = true;
  return { ...gs };
};

const fn_act6_domain_rationing: EventExecutor = (gs: GameState) => {
  // Simplified domain rationing implementation
  gs.player.qi = Math.max(0, (gs.player.qi || 0) - 50);
  return { ...gs };
};

const fn_act6_tutelage_circle: EventExecutor = (gs: GameState) => {
  // Simplified tutelage circle implementation
  gs.player.manuals = gs.player.manuals || [];
  gs.player.manuals.push({ id: 'manual_fragment', name: 'Manual Fragment', type: 'dao', rarity: 'common', qty: 1, description: 'A torn fragment of a larger manual; useful for study or combining into a whole.', effects: { cultivationSpeed: 1.02 } });
  return { ...gs };
};

const fn_act6_great_tribulation24_prep: EventExecutor = (gs: GameState) => {
  // Simplified tribulation 24 prep implementation
  gs.world.flags = gs.world.flags || {};
  gs.world.flags['tribulation24_boost'] = true;
  return { ...gs };
};

// Default no-op executor that returns state unchanged
const defaultExecutor: EventExecutor = (state: GameState) => state;

// --- Executor Registry ---

export const act6EventExecutors: Record<string, EventExecutor> = {
  "fn_act6_founders_seeding": fn_act6_founders_seeding,
  "fn_act6_pillar_workshop": fn_act6_pillar_workshop,
  "fn_act6_heritage_library": fn_act6_heritage_library,
  "fn_act6_domain_rationing": fn_act6_domain_rationing,
  "fn_act6_tutelage_circle": fn_act6_tutelage_circle,
  "fn_act6_ancestral_recall": defaultExecutor,
  "fn_act6_domain_defense": defaultExecutor,
  "fn_act6_coalition_skirmish": defaultExecutor,
  "fn_act6_arena_proving": defaultExecutor,
  "fn_act6_shard_guardian": defaultExecutor,
  "fn_act6_assassins_ring": defaultExecutor,
  "fn_act6_bastion_siege": defaultExecutor,
  "fn_act6_crown_assembly": defaultExecutor,
  "fn_act6_heir_accusation": defaultExecutor,
  "fn_act6_coalition_diplomacy": defaultExecutor,
  "fn_act6_charter_reform": defaultExecutor,
  "fn_act6_royal_betrayal": defaultExecutor,
  "fn_act6_grant_royal_banner": defaultExecutor,
  "fn_act6_heir_training": defaultExecutor,
  "fn_act6_festival_domains": defaultExecutor,
  "fn_act6_merchant_treaty": defaultExecutor,
  "fn_act6_court_poet": defaultExecutor,
  "fn_act6_refugee_flow": defaultExecutor,
  "fn_act6_secret_chamber": defaultExecutor,
  "fn_act6_relic_convergence": defaultExecutor,
  "fn_act6_legend_awakening": defaultExecutor,
  "fn_act6_echo_of_emperors": defaultExecutor,
  "fn_act6_ritual_binding": defaultExecutor,
  "fn_act6_worldtree_seed": defaultExecutor,
  "fn_act6_great_tribulation24_prep": fn_act6_great_tribulation24_prep,
};
