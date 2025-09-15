/* eslint-disable @typescript-eslint/no-unused-vars */
import { GameState, EventExecutor } from "../../../utils/types";
const makeStub = (id: string): EventExecutor => (state: GameState) => {
  const s: any = { ...state };
  s.__meta = s.__meta || {};
  s.__meta.eventsRan = s.__meta.eventsRan || [];
  if (!s.__meta.eventsRan.includes(id)) s.__meta.eventsRan.push(id);
  return s as GameState;
};

// Implementations for selected Act 2 executors
const fn_act2_first_challenge: EventExecutor = (state) => {
  const s: any = { ...state, player: { ...state.player, stats: { ...state.player.stats }, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
  // Passing the outer sect trial increases reputation with the sect and grants a small buff
  s.player.factionStanding['outer_sect'] = (s.player.factionStanding['outer_sect'] || 0) + 15;
  s.player.buffs = s.player.buffs || {};
  s.player.buffs['trial_focus'] = { turns: 3, atk: 2 };
  (s.__meta ||= {}).eventsRan = s.__meta.eventsRan || [];
  if (!s.__meta.eventsRan.includes('fn_act2_first_challenge')) s.__meta.eventsRan.push('fn_act2_first_challenge');
  return s as GameState;
};
const fn_act2_training_session = makeStub('fn_act2_training_session');
const fn_act2_first_mission = makeStub('fn_act2_first_mission');
const fn_act2_rival_appearance = makeStub('fn_act2_rival_appearance');
const fn_act2_herbal_discovery = makeStub('fn_act2_herbal_discovery');
const fn_act2_spirit_beast_encounter = makeStub('fn_act2_spirit_beast_encounter');
const fn_act2_martial_competition = makeStub('fn_act2_martial_competition');
const fn_act2_mentor_guidance: EventExecutor = (state, args) => {
  const s: any = { ...state, player: { ...state.player, manuals: Array.isArray(state.player.manuals) ? [...state.player.manuals] : [], skillPoints: state.player.skillPoints || 0, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
  // Mentor offers teaching: give a basic manual and a skill point
  const manuals = s.player.manuals as any[];
  if (!manuals.find(m => m && m.id === 'mentor_basics')) manuals.push({ id: 'mentor_basics', name: 'Mentor Basics', type: 'movement', rarity: 'common' });
  s.player.skillPoints = (s.player.skillPoints || 0) + 1;
  s.world.flags.mentor_taught = true;
  (s.__meta ||= {}).eventsRan = s.__meta.eventsRan || [];
  if (!s.__meta.eventsRan.includes('fn_act2_mentor_guidance')) s.__meta.eventsRan.push('fn_act2_mentor_guidance');
  return s as GameState;
};
const fn_act2_first_alchemy = makeStub('fn_act2_first_alchemy');
const fn_act2_night_cultivation = makeStub('fn_act2_night_cultivation');
const fn_act2_dao_insight = makeStub('fn_act2_dao_insight');
const fn_act2_sect_crisis = makeStub('fn_act2_sect_crisis');
const fn_act2_final_test = makeStub('fn_act2_final_test');
const fn_act2_spirit_stone_mine: EventExecutor = (state) => {
  const s: any = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [], stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
  // Acquire a spirit stone from a mine and gain qi
  const existing = s.player.inventory.find((i: any) => i && i.id === 'spirit_stone');
  if (existing) existing.qty = (existing.qty || 0) + 1;
  else s.player.inventory.push({ id: 'spirit_stone', name: 'Spirit Stone', qty: 1 });
  s.player.qi = (s.player.qi || 0) + 8;
  s.player.stats.qi = (s.player.stats.qi || 0) + 8;
  s.world.flags.spirit_stone_mined = true;
  (s.__meta ||= {}).eventsRan = s.__meta.eventsRan || [];
  if (!s.__meta.eventsRan.includes('fn_act2_spirit_stone_mine')) s.__meta.eventsRan.push('fn_act2_spirit_stone_mine');
  return s as GameState;
};
const fn_act2_herbal_garden = makeStub('fn_act2_herbal_garden');
const fn_act2_martial_technique = makeStub('fn_act2_martial_technique');
const fn_act2_sect_alliance = makeStub('fn_act2_sect_alliance');
const fn_act2_demon_invasion = makeStub('fn_act2_demon_invasion');
const fn_act2_celestial_visitor = makeStub('fn_act2_celestial_visitor');
const fn_act2_void_rift = makeStub('fn_act2_void_rift');
const fn_act2_phoenix_rebirth = makeStub('fn_act2_phoenix_rebirth');
const fn_act2_dragon_awakening = makeStub('fn_act2_dragon_awakening');
const fn_act2_fox_illusion = makeStub('fn_act2_fox_illusion');
const fn_act2_monkey_agility = makeStub('fn_act2_monkey_agility');
const fn_act2_spirit_connection = makeStub('fn_act2_spirit_connection');
// keep other stubs as-is
const fn_act2_asura_rage = makeStub('fn_act2_asura_rage');
const fn_act2_celestial_blessing = makeStub('fn_act2_celestial_blessing');
const fn_act2_void_energy = makeStub('fn_act2_void_energy');
const fn_act2_human_potential = makeStub('fn_act2_human_potential');
const fn_act2_demon_corruption = makeStub('fn_act2_demon_corruption');
const fn_act2_spirit_guardian = makeStub('fn_act2_spirit_guardian');
const fn_act2_dragon_roar = makeStub('fn_act2_dragon_roar');
const fn_act2_phoenix_flame = makeStub('fn_act2_phoenix_flame');
const fn_act2_celestial_light = makeStub('fn_act2_celestial_light');
const fn_act2_asura_strength = makeStub('fn_act2_asura_strength');
const fn_act2_void_portal = makeStub('fn_act2_void_portal');
const fn_act2_fox_charm = makeStub('fn_act2_fox_charm');
const fn_act2_monkey_trickery = makeStub('fn_act2_monkey_trickery');
const fn_act2_final_breakthrough = makeStub('fn_act2_final_breakthrough');

export const act2EventExecutors: Record<string, EventExecutor> = {
  "fn_act2_first_challenge": fn_act2_first_challenge,
  "fn_act2_training_session": fn_act2_training_session,
  "fn_act2_first_mission": fn_act2_first_mission,
  "fn_act2_rival_appearance": fn_act2_rival_appearance,
  "fn_act2_herbal_discovery": fn_act2_herbal_discovery,
  "fn_act2_spirit_beast_encounter": fn_act2_spirit_beast_encounter,
  "fn_act2_martial_competition": fn_act2_martial_competition,
  "fn_act2_mentor_guidance": fn_act2_mentor_guidance,
  "fn_act2_first_alchemy": fn_act2_first_alchemy,
  "fn_act2_night_cultivation": fn_act2_night_cultivation,
  "fn_act2_dao_insight": fn_act2_dao_insight,
  "fn_act2_sect_crisis": fn_act2_sect_crisis,
  "fn_act2_final_test": fn_act2_final_test,
  "fn_act2_spirit_stone_mine": fn_act2_spirit_stone_mine,
  "fn_act2_herbal_garden": fn_act2_herbal_garden,
  "fn_act2_martial_technique": fn_act2_martial_technique,
  "fn_act2_sect_alliance": fn_act2_sect_alliance,
  "fn_act2_demon_invasion": fn_act2_demon_invasion,
  "fn_act2_celestial_visitor": fn_act2_celestial_visitor,
  "fn_act2_void_rift": fn_act2_void_rift,
  "fn_act2_phoenix_rebirth": fn_act2_phoenix_rebirth,
  "fn_act2_dragon_awakening": fn_act2_dragon_awakening,
  "fn_act2_fox_illusion": fn_act2_fox_illusion,
  "fn_act2_monkey_agility": fn_act2_monkey_agility,
  "fn_act2_spirit_connection": fn_act2_spirit_connection,
  "fn_act2_asura_rage": fn_act2_asura_rage,
  "fn_act2_celestial_blessing": fn_act2_celestial_blessing,
  "fn_act2_void_energy": fn_act2_void_energy,
  "fn_act2_human_potential": fn_act2_human_potential,
  "fn_act2_demon_corruption": fn_act2_demon_corruption,
  "fn_act2_spirit_guardian": fn_act2_spirit_guardian,
  "fn_act2_dragon_roar": fn_act2_dragon_roar,
  "fn_act2_phoenix_flame": fn_act2_phoenix_flame,
  "fn_act2_celestial_light": fn_act2_celestial_light,
  "fn_act2_asura_strength": fn_act2_asura_strength,
  "fn_act2_void_portal": fn_act2_void_portal,
  "fn_act2_fox_charm": fn_act2_fox_charm,
  "fn_act2_monkey_trickery": fn_act2_monkey_trickery,
  "fn_act2_final_breakthrough": fn_act2_final_breakthrough,
};
