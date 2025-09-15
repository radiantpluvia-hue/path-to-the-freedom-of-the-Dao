import { GameState, EventExecutor } from "../../../utils/types";
const makeStub = (id: string): EventExecutor => (state: GameState) => {
  const s: any = { ...state };
  s.__meta = s.__meta || {};
  s.__meta.eventsRan = s.__meta.eventsRan || [];
  if (!s.__meta.eventsRan.includes(id)) s.__meta.eventsRan.push(id);
  return s as GameState;
};

const ids = [
  'fn_act5_mastery_test','fn_act5_legacy_building','fn_act5_final_confrontation','fn_act5_ancient_secrets','fn_act5_spirit_alliance','fn_act5_celestial_trial','fn_act5_demon_invasion','fn_act5_celestial_blessing','fn_act5_void_energy','fn_act5_human_potential','fn_act5_demon_corruption','fn_act5_spirit_guardian','fn_act5_dragon_roar','fn_act5_phoenix_flame','fn_act5_celestial_light','fn_act5_asura_strength','fn_act5_void_portal','fn_act5_fox_charm','fn_act5_monkey_trickery','fn_act5_final_breakthrough','fn_act5_ultimate_trial','fn_act5_cosmic_awareness','fn_act5_divine_intervention','fn_act5_eternal_legacy'
];

const registry: Record<string, EventExecutor> = {};
for (const id of ids) registry[id] = makeStub(id);

export const act5EventExecutors: Record<string, EventExecutor> = registry;

