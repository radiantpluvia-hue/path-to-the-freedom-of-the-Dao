import { GameState, EventExecutor } from "../../../utils/types";
const makeStub = (id: string): EventExecutor => (state: GameState) => {
  const s: any = { ...state };
  s.__meta = s.__meta || {};
  s.__meta.eventsRan = s.__meta.eventsRan || [];
  if (!s.__meta.eventsRan.includes(id)) s.__meta.eventsRan.push(id);
  return s as GameState;
};

const ids = [
  'fn_act7_final_showdown','fn_act7_legacy_fulfillment','fn_act7_final_ascension','fn_act7_ancient_revelation','fn_act7_spirit_alliance','fn_act7_celestial_trial','fn_act7_demon_invasion','fn_act7_celestial_blessing','fn_act7_void_energy','fn_act7_human_potential','fn_act7_demon_corruption','fn_act7_spirit_guardian','fn_act7_dragon_roar','fn_act7_phoenix_flame','fn_act7_celestial_light','fn_act7_asura_strength','fn_act7_void_portal','fn_act7_fox_charm','fn_act7_monkey_trickery','fn_act7_final_breakthrough','fn_act7_ultimate_trial','fn_act7_cosmic_awareness','fn_act7_divine_intervention','fn_act7_eternal_legacy'
];

const registry: Record<string, EventExecutor> = {};
for (const id of ids) registry[id] = makeStub(id);

export const act7EventExecutors: Record<string, EventExecutor> = registry;
