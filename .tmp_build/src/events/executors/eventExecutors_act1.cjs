"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.act1EventExecutors = exports.defaultExecutor = void 0;
// Idempotent executor helper: mark event run in state.flags and return state unchanged otherwise
const makeStub = (id) => {
    return (state) => {
        // use dynamic meta container to avoid typing the GameState
        const s = { ...state };
        s.__meta = s.__meta || {};
        s.__meta.eventsRan = s.__meta.eventsRan || [];
        if (!s.__meta.eventsRan.includes(id))
            s.__meta.eventsRan.push(id);
        return s;
    };
};
// Default no-op
const defaultExecutor = (state) => state;
exports.defaultExecutor = defaultExecutor;
// Concrete implementations for Act 1 tutorial events (small, safe state updates)
const fn_act1_tutorial_welcome = (state) => {
    const s = {
        ...state,
        player: {
            ...state.player,
            manuals: Array.isArray(state.player.manuals) ? [...state.player.manuals] : [],
            inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [],
        },
        world: { ...state.world, flags: { ...(state.world.flags || {}) } },
    };
    // Mark that the tutorial was seen and grant a tiny manual
    s.world.flags.tutorial_welcome_seen = true;
    const existingManuals = s.player.manuals;
    if (!existingManuals.find((m) => m && m.id === 'intro_meditation')) {
        existingManuals.push({
            id: 'intro_meditation',
            name: 'Intro to Meditation',
            type: 'dao',
            rarity: "H",
            description: 'Basic meditation techniques to calm the mind and sense spiritual qi.',
            effects: { cultivationSpeed: 1.05, qiGathering: 5 }
        });
    }
    // record event run
    (s.__meta || (s.__meta = {})).eventsRan = (s.__meta.eventsRan || []);
    if (!s.__meta.eventsRan.includes('fn_act1_tutorial_welcome'))
        s.__meta.eventsRan.push('fn_act1_tutorial_welcome');
    return s;
};
const fn_act1_first_meditation = (state) => {
    const s = {
        ...state,
        player: { ...state.player, stats: { ...state.player.stats } },
        world: { ...state.world, flags: { ...(state.world.flags || {}) } },
    };
    // First meditation provides a small qi increase and insight
    s.player.qi = (s.player.qi || 0) + 5;
    s.player.stats.qi = (s.player.stats.qi || 0) + 5;
    s.player.stats.insight = (s.player.stats.insight || 0) + 1;
    s.world.flags.first_meditation_done = true;
    (s.__meta || (s.__meta = {})).eventsRan = (s.__meta.eventsRan || []);
    if (!s.__meta.eventsRan.includes('fn_act1_first_meditation'))
        s.__meta.eventsRan.push('fn_act1_first_meditation');
    return s;
};
const fn_act1_combat_intro = (state) => {
    const s = {
        ...state,
        player: { ...state.player, stats: { ...state.player.stats }, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [] },
        world: { ...state.world, flags: { ...(state.world.flags || {}) } },
    };
    // Small combat intro: raise attack and give a training dummy item
    s.player.stats.atk = (s.player.stats.atk || 0) + 1;
    const existing = s.player.inventory.find((i) => i && i.id === 'training_dummy');
    if (!existing)
        s.player.inventory.push({ id: 'training_dummy', name: 'Training Dummy', qty: 1 });
    (s.__meta || (s.__meta = {})).eventsRan = (s.__meta.eventsRan || []);
    if (!s.__meta.eventsRan.includes('fn_act1_combat_intro'))
        s.__meta.eventsRan.push('fn_act1_combat_intro');
    return s;
};
const fn_act1_cultivation_awakening = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    // Grant a small level-up-like benefit: increase level or daoComprehension
    if (typeof s.player.level === 'number')
        s.player.level = Math.max(s.player.level, 1);
    s.player.daoComprehension = (s.player.daoComprehension || 0) + 1;
    s.world.flags.cultivation_awakening = true;
    (s.__meta || (s.__meta = {})).eventsRan = (s.__meta.eventsRan || []);
    if (!s.__meta.eventsRan.includes('fn_act1_cultivation_awakening'))
        s.__meta.eventsRan.push('fn_act1_cultivation_awakening');
    return s;
};
const fn_act1_sect_entrance = (state) => {
    const s = {
        ...state,
        player: { ...state.player, factionStanding: { ...(state.player.factionStanding || {}) } },
        world: { ...state.world, flags: { ...(state.world.flags || {}) } },
    };
    s.world.flags.joined_sect = true;
    s.player.factionStanding = s.player.factionStanding || {};
    s.player.factionStanding['starting_sect'] = (s.player.factionStanding['starting_sect'] || 0) + 10;
    s.player.title = s.player.title || 'Sect Aspirant';
    (s.__meta || (s.__meta = {})).eventsRan = (s.__meta.eventsRan || []);
    if (!s.__meta.eventsRan.includes('fn_act1_sect_entrance'))
        s.__meta.eventsRan.push('fn_act1_sect_entrance');
    return s;
};
const fn_act1_spirit_stone = (state) => {
    const s = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [] }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    // Add a spirit stone to inventory and give a small qi bump
    const existing = s.player.inventory.find((i) => i && i.id === 'spirit_stone');
    if (existing)
        existing.qty = (existing.qty || 0) + 1;
    else
        s.player.inventory.push({ id: 'spirit_stone', name: 'Spirit Stone', qty: 1 });
    s.player.qi = (s.player.qi || 0) + 10;
    s.player.stats.qi = (s.player.stats.qi || 0) + 10;
    s.world.flags.spirit_stone_acquired = true;
    (s.__meta || (s.__meta = {})).eventsRan = (s.__meta.eventsRan || []);
    if (!s.__meta.eventsRan.includes('fn_act1_spirit_stone'))
        s.__meta.eventsRan.push('fn_act1_spirit_stone');
    return s;
};
const fn_act1_martial_test = makeStub('fn_act1_martial_test');
const fn_act1_elder_attention = makeStub('fn_act1_elder_attention');
const fn_act1_rival_appears = makeStub('fn_act1_rival_appears');
const fn_act1_first_mission = makeStub('fn_act1_first_mission');
const fn_act1_herbal_discovery = makeStub('fn_act1_herbal_discovery');
const fn_act1_breakthrough_attempt = makeStub('fn_act1_breakthrough_attempt');
const fn_act1_sect_tournament = makeStub('fn_act1_sect_tournament');
const fn_act1_ancient_manual = makeStub('fn_act1_ancient_manual');
const fn_act1_spirit_beast = makeStub('fn_act1_spirit_beast');
const fn_act1_qi_control = makeStub('fn_act1_qi_control');
const fn_act1_sect_politics = makeStub('fn_act1_sect_politics');
const fn_act1_first_alchemy = makeStub('fn_act1_first_alchemy');
const fn_act1_night_cultivation = makeStub('fn_act1_night_cultivation');
const fn_act1_mentor_choice = makeStub('fn_act1_mentor_choice');
const fn_act1_sect_favor = makeStub('fn_act1_sect_favor');
const fn_act1_dream_revelation = makeStub('fn_act1_dream_revelation');
const fn_act1_body_tempering = makeStub('fn_act1_body_tempering');
const fn_act1_spiritual_sense = makeStub('fn_act1_spiritual_sense');
const fn_act1_sect_library = makeStub('fn_act1_sect_library');
const fn_act1_first_artifact = makeStub('fn_act1_first_artifact');
const fn_act1_weather_phenomenon = makeStub('fn_act1_weather_phenomenon');
const fn_act1_sect_elixir = makeStub('fn_act1_sect_elixir');
const fn_act1_mountain_training = makeStub('fn_act1_mountain_training');
const fn_act1_spirit_spring = makeStub('fn_act1_spirit_spring');
const fn_act1_dao_insight = makeStub('fn_act1_dao_insight');
const fn_act1_sect_crisis = makeStub('fn_act1_sect_crisis');
const fn_act1_final_test = makeStub('fn_act1_final_test');
exports.act1EventExecutors = {
    "fn_act1_tutorial_welcome": fn_act1_tutorial_welcome,
    "fn_act1_first_meditation": fn_act1_first_meditation,
    "fn_act1_combat_intro": fn_act1_combat_intro,
    "fn_act1_cultivation_awakening": fn_act1_cultivation_awakening,
    "fn_act1_sect_entrance": fn_act1_sect_entrance,
    "fn_act1_spirit_stone": fn_act1_spirit_stone,
    "fn_act1_martial_test": fn_act1_martial_test,
    "fn_act1_elder_attention": fn_act1_elder_attention,
    "fn_act1_rival_appears": fn_act1_rival_appears,
    "fn_act1_first_mission": fn_act1_first_mission,
    "fn_act1_herbal_discovery": fn_act1_herbal_discovery,
    "fn_act1_breakthrough_attempt": fn_act1_breakthrough_attempt,
    "fn_act1_sect_tournament": fn_act1_sect_tournament,
    "fn_act1_ancient_manual": fn_act1_ancient_manual,
    "fn_act1_spirit_beast": fn_act1_spirit_beast,
    "fn_act1_qi_control": fn_act1_qi_control,
    "fn_act1_sect_politics": fn_act1_sect_politics,
    "fn_act1_first_alchemy": fn_act1_first_alchemy,
    "fn_act1_night_cultivation": fn_act1_night_cultivation,
    "fn_act1_mentor_choice": fn_act1_mentor_choice,
    "fn_act1_sect_favor": fn_act1_sect_favor,
    "fn_act1_dream_revelation": fn_act1_dream_revelation,
    "fn_act1_body_tempering": fn_act1_body_tempering,
    "fn_act1_spiritual_sense": fn_act1_spiritual_sense,
    "fn_act1_sect_library": fn_act1_sect_library,
    "fn_act1_first_artifact": fn_act1_first_artifact,
    "fn_act1_weather_phenomenon": fn_act1_weather_phenomenon,
    "fn_act1_sect_elixir": fn_act1_sect_elixir,
    "fn_act1_mountain_training": fn_act1_mountain_training,
    "fn_act1_spirit_spring": fn_act1_spirit_spring,
    "fn_act1_dao_insight": fn_act1_dao_insight,
    "fn_act1_sect_crisis": fn_act1_sect_crisis,
    "fn_act1_final_test": fn_act1_final_test,
};
