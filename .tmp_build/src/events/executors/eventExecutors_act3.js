"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.act3EventExecutors = void 0;
const playerHelpers_1 = require("@/utils/playerHelpers");
const playerSetters_1 = require("../../utils/playerSetters");
const cultivationRealms_1 = require("../../data/cultivationRealms");
const makeStub = (id) => (state) => {
    const s = { ...state };
    s.__meta = s.__meta || {};
    s.__meta.eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes(id))
        s.__meta.eventsRan.push(id);
    return s;
};
// Selected Act 3 executors implemented with conservative state updates
const fn_act3_intermediate_cultivation = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    // Intermediate cultivation increases insight and qi a bit
    s.player.stats.qi = (s.player.stats.qi || 0) + 12;
    s.player.stats.insight = (s.player.stats.insight || 0) + 2;
    s.world.flags.intermediate_cultivation = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_intermediate_cultivation'))
        s.__meta.eventsRan.push('fn_act3_intermediate_cultivation');
    return s;
};
const fn_act3_sect_politics = (state) => {
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } }, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } } };
    // Political maneuvering: adjust reputation with a random small swing (deterministic here)
    s.player.reputation = s.player.reputation || {};
    s.player.reputation['sect_elder'] = (s.player.reputation['sect_elder'] || 0) + 5;
    s.world.flags.sect_politics_handled = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_politics'))
        s.__meta.eventsRan.push('fn_act3_sect_politics');
    return s;
};
const fn_act3_exploration_mission = (state) => {
    const s = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [] }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    // Exploration gives a chance at a minor artifact: deterministic small artifact
    const existing = s.player.inventory.find((i) => i && i.id === 'minor_artifact');
    if (!existing)
        s.player.inventory.push({ id: 'minor_artifact', name: 'Minor Artifact', qty: 1 });
    s.world.flags.exploration_success = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_exploration_mission'))
        s.__meta.eventsRan.push('fn_act3_exploration_mission');
    return s;
};
const fn_act3_rivalry = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats }, relationships: { ...(state.player.relationships || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    // Rival encounter: minor stat increase and relationship change
    s.player.stats.atk = (s.player.stats.atk || 0) + 1;
    s.player.relationships = s.player.relationships || {};
    s.player.relationships['main_rival'] = (s.player.relationships['main_rival'] || 0) - 5;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_rivalry'))
        s.__meta.eventsRan.push('fn_act3_rivalry');
    return s;
};
// Rival turns coat revelation: penalize relationship and flag, small reputation loss
const fn_act3_rival_turncoat_revelation = (state) => {
    const s = { ...state, player: { ...state.player, relationships: { ...(state.player.relationships || {}) }, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.relationships['main_rival'] = (s.player.relationships['main_rival'] || 0) - 15;
    s.player.reputation = s.player.reputation || {};
    s.player.reputation['local_sect'] = (s.player.reputation['local_sect'] || 0) - 5;
    s.world.flags.rival_turncoat_revealed = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_rival_turncoat_revelation'))
        s.__meta.eventsRan.push('fn_act3_rival_turncoat_revelation');
    return s;
};
// Regional threat rises: mark a regional threat and give a defensive buff
const fn_act3_regional_threat_rises = (state) => {
    const s = { ...state, player: { ...state.player, buffs: { ...(state.player.buffs || {}) }, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.regional_threat = true;
    s.player.buffs = s.player.buffs || {};
    s.player.buffs['regional_defense'] = { turns: 5, def: 3 };
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_regional_threat_rises'))
        s.__meta.eventsRan.push('fn_act3_regional_threat_rises');
    return s;
};
// Sect qualifier tournament: award fame and small stat rewards
const fn_act3_sect_qualifier_tournament = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats }, fame: state.player.fame || 0 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.stats.atk = (s.player.stats.atk || 0) + 2;
    s.player.fame = (s.player.fame || 0) + 3;
    s.world.flags.sect_qualifier_completed = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_qualifier_tournament'))
        s.__meta.eventsRan.push('fn_act3_sect_qualifier_tournament');
    return s;
};
// Political marriage offer: set a diplomatic flag and adjust faction standing
const fn_act3_political_marriage_offer = (state) => {
    const s = { ...state, player: { ...state.player, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.political_marriage_offered = true;
    s.player.factionStanding['noble_house'] = (s.player.factionStanding['noble_house'] || 0) + 10;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_political_marriage_offer'))
        s.__meta.eventsRan.push('fn_act3_political_marriage_offer');
    return s;
};
// Ambush on rival route: reduce rival relationship and give a small reward
const fn_act3_ambush_on_rival_route = (state) => {
    const s = { ...state, player: { ...state.player, relationships: { ...(state.player.relationships || {}) }, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [] }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.relationships['main_rival'] = (s.player.relationships['main_rival'] || 0) - 10;
    const existing = s.player.inventory.find((i) => i && i.id === 'stolen_token');
    if (!existing)
        s.player.inventory.push({ id: 'stolen_token', name: 'Stolen Token', qty: 1 });
    s.world.flags.ambush_on_rival = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_ambush_on_rival_route'))
        s.__meta.eventsRan.push('fn_act3_ambush_on_rival_route');
    return s;
};
// Intra-sect faction conflict: choosing a side affects factionStanding and reputation
const fn_act3_intra_sect_faction_conflict = (state, args) => {
    const choice = (args && (args.choice || args)) || 'side_conservatives';
    const s = { ...state, player: { ...state.player, factionStanding: { ...(state.player.factionStanding || {}) }, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (choice === 'side_progressives') {
        s.player.factionStanding['progressive_faction'] = (s.player.factionStanding['progressive_faction'] || 0) + 10;
        s.player.reputation['progressive'] = (s.player.reputation['progressive'] || 0) + 3;
    }
    else {
        s.player.factionStanding['conservative_faction'] = (s.player.factionStanding['conservative_faction'] || 0) + 10;
        s.player.reputation['conservative'] = (s.player.reputation['conservative'] || 0) + 3;
    }
    s.world.flags.intra_sect_faction_conflict = choice;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_intra_sect_faction_conflict'))
        s.__meta.eventsRan.push('fn_act3_intra_sect_faction_conflict');
    return s;
};
// Secret society infiltration: risk/reward - set a flag and optionally grant a secret token
const fn_act3_secret_society_infiltration = (state, args) => {
    const takeRisk = args && args.choice === 'join_infiltration';
    const s = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [], reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.secret_society_contact = takeRisk;
    if (takeRisk) {
        s.player.inventory.push({ id: 'secret_token', name: 'Secret Token', qty: 1 });
        s.player.reputation['sect_elder'] = (s.player.reputation['sect_elder'] || 0) - 5;
    }
    else {
        s.player.reputation['sect_elder'] = (s.player.reputation['sect_elder'] || 0) + 2;
    }
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_secret_society_infiltration'))
        s.__meta.eventsRan.push('fn_act3_secret_society_infiltration');
    return s;
};
// Grand auction: spend (simulate) or gain reputation; here we grant a minor relic if bidding
const fn_act3_grand_auction_of_rare_items = (state, args) => {
    const bid = args && args.choice === 'bid_big';
    const s = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [], fame: state.player.fame || 0 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (bid) {
        s.player.inventory.push({ id: 'minor_relic', name: 'Minor Relic', qty: 1 });
        s.player.fame = (s.player.fame || 0) + 2;
    }
    else {
        s.player.fame = (s.player.fame || 0) + 1;
    }
    s.world.flags.grand_auction = bid ? 'bought' : 'observed';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_grand_auction_of_rare_items'))
        s.__meta.eventsRan.push('fn_act3_grand_auction_of_rare_items');
    return s;
};
// Tournament between sects: choose fair or dirty; award fame or a risky reward
const fn_act3_tournament_between_sects = (state, args) => {
    const dirty = args && args.choice === 'win_by_any_means';
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats }, fame: state.player.fame || 0, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (dirty) {
        s.player.reputation['honor'] = (s.player.reputation['honor'] || 0) - 5;
        s.player.stats.atk = (s.player.stats.atk || 0) + 3;
    }
    else {
        s.player.fame = (s.player.fame || 0) + 4;
        s.player.stats.atk = (s.player.stats.atk || 0) + 2;
    }
    s.world.flags.tournament_between_sects = dirty ? 'dirty_win' : 'honorable';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_tournament_between_sects'))
        s.__meta.eventsRan.push('fn_act3_tournament_between_sects');
    return s;
};
// Sect reform bill proposal: adjust reputation depending on choice
const fn_act3_sect_reform_bill_proposal = (state, args) => {
    const support = args && args.choice === 'support_reform';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) }, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (support) {
        s.player.reputation['progressive'] = (s.player.reputation['progressive'] || 0) + 4;
        s.player.factionStanding['commoners'] = (s.player.factionStanding['commoners'] || 0) + 5;
    }
    else {
        s.player.reputation['nobles'] = (s.player.reputation['nobles'] || 0) + 4;
        s.player.factionStanding['nobles'] = (s.player.factionStanding['nobles'] || 0) + 5;
    }
    s.world.flags.sect_reform_bill = support ? 'supported' : 'opposed';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_reform_bill_proposal'))
        s.__meta.eventsRan.push('fn_act3_sect_reform_bill_proposal');
    return s;
};
// Relic dispute: choose fight or negotiate -> small reputation/fame changes
const fn_act3_relic_dispute_between_sects = (state, args) => {
    const fight = args && args.choice === 'fight_for_claim';
    const s = { ...state, player: { ...state.player, fame: state.player.fame || 0, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (fight) {
        s.player.fame = (s.player.fame || 0) + 2;
        s.player.reputation['aggression'] = (s.player.reputation['aggression'] || 0) + 3;
    }
    else {
        s.player.reputation['diplomacy'] = (s.player.reputation['diplomacy'] || 0) + 3;
    }
    s.world.flags.relic_dispute = fight ? 'battled' : 'negotiated';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_relic_dispute_between_sects'))
        s.__meta.eventsRan.push('fn_act3_relic_dispute_between_sects');
    return s;
};
// Heart trial request: attempt gives insight but risks qi loss
const fn_act3_heart_trial_request = (state, args) => {
    const enter = args && args.choice === 'enter';
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (enter) {
        s.player.stats.insight = (s.player.stats.insight || 0) + 5;
        s.player.qi = Math.max(0, (s.player.qi || 0) - 8);
        s.world.flags.heart_trial = 'completed';
    }
    else {
        s.world.flags.heart_trial = 'postponed';
    }
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_heart_trial_request'))
        s.__meta.eventsRan.push('fn_act3_heart_trial_request');
    return s;
};
// Mentor crisis: either heal or replace -> resource usage or political gain
const fn_act3_mentor_crisis = (state, args) => {
    const heal = args && args.choice === 'heal_mentor';
    const s = { ...state, player: { ...state.player, resources: { ...((state.player && state.player.resources) || {}) }, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (heal) {
        // spend a resource token if present
        s.player.resources['healing_potion'] = Math.max(0, (s.player.resources['healing_potion'] || 0) - 1);
        s.player.reputation['compassion'] = (s.player.reputation['compassion'] || 0) + 5;
    }
    else {
        s.player.reputation['political'] = (s.player.reputation['political'] || 0) + 5;
    }
    s.world.flags.mentor_crisis = heal ? 'healed' : 'replaced';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_mentor_crisis'))
        s.__meta.eventsRan.push('fn_act3_mentor_crisis');
    return s;
};
// Corrupted site discovery: cleansing sets a flag and may cost resources
const fn_act3_corrupted_site_discovery = (state, args) => {
    const lead = args && args.choice === 'lead_cleansing';
    const s = { ...state, player: { ...state.player, resources: { ...((state.player && state.player.resources) || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (lead) {
        s.player.resources['purification_herb'] = Math.max(0, (s.player.resources['purification_herb'] || 0) - 1);
        s.world.flags.corrupted_site_cleansed = true;
    }
    else {
        s.world.flags.corrupted_site_cleansed = false;
    }
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_corrupted_site_discovery'))
        s.__meta.eventsRan.push('fn_act3_corrupted_site_discovery');
    return s;
};
// Sect diplomatic envoy: push sect interest or seek compromise
const fn_act3_sect_diplomatic_envoy = (state, args) => {
    const bold = args && args.choice === 'push_sect_interest';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) }, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (bold) {
        s.player.factionStanding['foreign_sect'] = (s.player.factionStanding['foreign_sect'] || 0) - 5;
        s.player.reputation['boldness'] = (s.player.reputation['boldness'] || 0) + 3;
    }
    else {
        s.player.reputation['diplomacy'] = (s.player.reputation['diplomacy'] || 0) + 3;
    }
    s.world.flags.sect_diplomatic_envoy = bold ? 'assertive' : 'compromised';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_diplomatic_envoy'))
        s.__meta.eventsRan.push('fn_act3_sect_diplomatic_envoy');
    return s;
};
// Inner circle offer: accept or decline -> title and political risk
const fn_act3_inner_circle_offer = (state, args) => {
    const accept = args && args.choice === 'accept_inner';
    const s = { ...state, player: { ...state.player, title: state.player.title || '', reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (accept) {
        s.player.title = 'Inner Circle Member';
        s.player.reputation['power'] = (s.player.reputation['power'] || 0) + 5;
    }
    else {
        s.player.reputation['safety'] = (s.player.reputation['safety'] || 0) + 2;
    }
    s.world.flags.inner_circle_offer = accept ? 'accepted' : 'declined';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_inner_circle_offer'))
        s.__meta.eventsRan.push('fn_act3_inner_circle_offer');
    return s;
};
// Duel of ideologies: duel or debate -> small fame or insight
const fn_act3_duel_of_ideologies = (state, args) => {
    const fight = args && args.choice === 'fight';
    const s = { ...state, player: { ...state.player, fame: state.player.fame || 0, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (fight) {
        s.player.stats.atk = (s.player.stats.atk || 0) + 1;
        s.player.fame = (s.player.fame || 0) + 1;
    }
    else {
        s.player.stats.insight = (s.player.stats.insight || 0) + 1;
    }
    s.world.flags.duel_of_ideologies = fight ? 'fought' : 'argued';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_duel_of_ideologies'))
        s.__meta.eventsRan.push('fn_act3_duel_of_ideologies');
    return s;
};
// Spellbinders gathering: attend to learn or criticize to gain reputation
const fn_act3_spellbinders_gathering = (state, args) => {
    const attend = args && args.choice === 'attend_and_learn';
    const s = { ...state, player: { ...state.player, manuals: Array.isArray(state.player.manuals) ? [...state.player.manuals] : [], reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (attend) {
        s.player.manuals.push({ id: 'spellbinders_note', name: 'Spellbinder Note', type: 'movement', rarity: "G", description: 'Notes from a spellbinder covering refined movement and flow techniques.', effects: { speed: 2, martialMastery: 2 } });
        s.player.reputation['scholar'] = (s.player.reputation['scholar'] || 0) + 2;
    }
    else {
        s.player.reputation['critic'] = (s.player.reputation['critic'] || 0) + 1;
    }
    s.world.flags.spellbinders_gathering = attend ? 'learned' : 'criticized';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_spellbinders_gathering'))
        s.__meta.eventsRan.push('fn_act3_spellbinders_gathering');
    return s;
};
// Divine tribulation omen: prepare or ignore; preparing reduces chance of setback (flagged)
const fn_act3_divine_tribulation_omen = (state, args) => {
    const prepare = args && args.choice === 'prepare';
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } }, player: { ...state.player, resources: { ...((state.player && state.player.resources) || {}) } } };
    s.world.flags.divine_tribulation = prepare ? 'prepared' : 'ignored';
    if (prepare)
        s.player.resources['purity_essence'] = Math.max(0, (s.player.resources['purity_essence'] || 0) - 1);
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_divine_tribulation_omen'))
        s.__meta.eventsRan.push('fn_act3_divine_tribulation_omen');
    return s;
};
// Training camp with competitors: train (stats) or social strategy (reputation)
const fn_act3_training_camp_with_competitors = (state, args) => {
    const focus = args && args.choice === 'focus_on_skill';
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats }, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (focus)
        s.player.stats.atk = (s.player.stats.atk || 0) + 2;
    else
        s.player.reputation['alliances'] = (s.player.reputation['alliances'] || 0) + 2;
    s.world.flags.training_camp = focus ? 'trained' : 'networked';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_training_camp_with_competitors'))
        s.__meta.eventsRan.push('fn_act3_training_camp_with_competitors');
    return s;
};
// Rebuild old sect faction: invest resources to gain influence
const fn_act3_rebuild_old_sect_faction = (state, args) => {
    const invest = args && args.choice === 'revive_branch';
    const s = { ...state, player: { ...state.player, resources: { ...((state.player && state.player.resources) || {}) }, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (invest) {
        s.player.resources['gold'] = Math.max(0, (s.player.resources['gold'] || 0) - 10);
        s.player.factionStanding['revived_branch'] = (s.player.factionStanding['revived_branch'] || 0) + 10;
    }
    s.world.flags.rebuild_old_sect_faction = invest ? 'revived' : 'ignored';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_rebuild_old_sect_faction'))
        s.__meta.eventsRan.push('fn_act3_rebuild_old_sect_faction');
    return s;
};
// Sect border dispute: claim forcefully or mediate
const fn_act3_sect_border_dispute = (state, args) => {
    const force = args && args.choice === 'claim_forcefully';
    const s = { ...state, player: { ...state.player, factionStanding: { ...(state.player.factionStanding || {}) }, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (force) {
        s.player.factionStanding['border_claim'] = (s.player.factionStanding['border_claim'] || 0) + 8;
        s.player.reputation['aggression'] = (s.player.reputation['aggression'] || 0) + 2;
    }
    else {
        s.player.reputation['mediation'] = (s.player.reputation['mediation'] || 0) + 3;
    }
    s.world.flags.sect_border_dispute = force ? 'forceful' : 'mediated';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_border_dispute'))
        s.__meta.eventsRan.push('fn_act3_sect_border_dispute');
    return s;
};
// Forbidden library leak: capture leaker or cover
const fn_act3_forbidden_library_leak = (state, args) => {
    const capture = args && args.choice === 'capture_leaker';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (capture)
        s.player.reputation['honor'] = (s.player.reputation['honor'] || 0) + 3;
    else
        s.player.reputation['coverup'] = (s.player.reputation['coverup'] || 0) + 1;
    s.world.flags.forbidden_library_leak = capture ? 'captured' : 'covered';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_forbidden_library_leak'))
        s.__meta.eventsRan.push('fn_act3_forbidden_library_leak');
    return s;
};
// Strange ally from other sect: accept alliance or probe motives
const fn_act3_strange_ally_from_other_sect = (state, args) => {
    const trust = args && args.choice === 'trust';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) }, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (trust) {
        s.player.factionStanding['other_sect'] = (s.player.factionStanding['other_sect'] || 0) + 5;
    }
    else {
        s.player.reputation['caution'] = (s.player.reputation['caution'] || 0) + 2;
    }
    s.world.flags.strange_ally = trust ? 'trusted' : 'tested';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_strange_ally_from_other_sect'))
        s.__meta.eventsRan.push('fn_act3_strange_ally_from_other_sect');
    return s;
};
// Seed of corruption among elder: expose or bargain
const fn_act3_seed_of_corruption_among_elder = (state, args) => {
    const expose = args && args.choice === 'expose_elder';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (expose)
        s.player.reputation['integrity'] = (s.player.reputation['integrity'] || 0) + 5;
    else
        s.player.reputation['pragmatism'] = (s.player.reputation['pragmatism'] || 0) + 3;
    s.world.flags.seed_of_corruption = expose ? 'exposed' : 'leveraged';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_seed_of_corruption_among_elder'))
        s.__meta.eventsRan.push('fn_act3_seed_of_corruption_among_elder');
    return s;
};
// Duel for sect leadership: run or support
const fn_act3_duel_for_sect_leadership = (state, args) => {
    const run = args && args.choice === 'run_for_leadership';
    const s = { ...state, player: { ...state.player, fame: state.player.fame || 0, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (run) {
        s.player.fame = (s.player.fame || 0) + 5;
        s.player.factionStanding['leadership'] = (s.player.factionStanding['leadership'] || 0) + 10;
    }
    else {
        s.player.reputation['loyalty'] = (s.player.reputation['loyalty'] || 0) + 3;
    }
    s.world.flags.duel_for_sect_leadership = run ? 'ran' : 'supported';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_duel_for_sect_leadership'))
        s.__meta.eventsRan.push('fn_act3_duel_for_sect_leadership');
    return s;
};
// Retribution for old grudge: avenge or forgive
const fn_act3_retribution_for_old_grudge = (state, args) => {
    const avenge = args && args.choice === 'avenge';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) }, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (avenge) {
        s.player.stats.atk = (s.player.stats.atk || 0) + 2;
        s.player.reputation['ferocity'] = (s.player.reputation['ferocity'] || 0) + 2;
    }
    else {
        s.player.reputation['mercy'] = (s.player.reputation['mercy'] || 0) + 2;
    }
    s.world.flags.retribution = avenge ? 'avenged' : 'forgiven';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_retribution_for_old_grudge'))
        s.__meta.eventsRan.push('fn_act3_retribution_for_old_grudge');
    return s;
};
// Blade-stealing sabotage: find thief or frame someone
const fn_act3_blade_stealing_sabotage = (state, args) => {
    const find = args && args.choice === 'find_thief';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (find)
        s.player.reputation['detective'] = (s.player.reputation['detective'] || 0) + 2;
    else
        s.player.reputation['schemer'] = (s.player.reputation['schemer'] || 0) + 1;
    s.world.flags.blade_sabotage = find ? 'found' : 'framed';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_blade_stealing_sabotage'))
        s.__meta.eventsRan.push('fn_act3_blade_stealing_sabotage');
    return s;
};
// Alliance breakdown: retaliate or seek remedy
const fn_act3_alliance_breakdown = (state, args) => {
    const retaliate = args && args.choice === 'retaliate';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) }, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (retaliate)
        s.player.factionStanding['hostile_sect'] = (s.player.factionStanding['hostile_sect'] || 0) - 5;
    else
        s.player.reputation['peacemaker'] = (s.player.reputation['peacemaker'] || 0) + 2;
    s.world.flags.alliance_breakdown = retaliate ? 'retaliated' : 'sought_remedy';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_alliance_breakdown'))
        s.__meta.eventsRan.push('fn_act3_alliance_breakdown');
    return s;
};
// Heavenly court notice: comply or resist; affect flags and reputation
const fn_act3_heavenly_court_notice = (state, args) => {
    const comply = args && args.choice === 'comply';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.heavenly_court = comply ? 'complied' : 'resisted';
    if (comply)
        s.player.reputation['obedience'] = (s.player.reputation['obedience'] || 0) + 2;
    else
        s.player.reputation['defiance'] = (s.player.reputation['defiance'] || 0) + 2;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_heavenly_court_notice'))
        s.__meta.eventsRan.push('fn_act3_heavenly_court_notice');
    return s;
};
// Corrupted river spread: cleanse or investigate
const fn_act3_corrupted_river_spread = (state, args) => {
    const cleanse = args && args.choice === 'cleanse';
    const s = { ...state, player: { ...state.player, resources: { ...((state.player && state.player.resources) || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (cleanse) {
        s.player.resources['purity_essence'] = Math.max(0, (s.player.resources['purity_essence'] || 0) - 1);
        s.world.flags.corrupted_river = 'cleansed';
    }
    else {
        s.world.flags.corrupted_river = 'investigating';
    }
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_corrupted_river_spread'))
        s.__meta.eventsRan.push('fn_act3_corrupted_river_spread');
    return s;
};
// Rival assassination attempt: defend or distance
const fn_act3_rival_assassination_attempt = (state, args) => {
    const defend = args && args.choice === 'defend_rival';
    const s = { ...state, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    if (defend)
        s.player.reputation['nobility'] = (s.player.reputation['nobility'] || 0) + 3;
    else
        s.player.reputation['caution'] = (s.player.reputation['caution'] || 0) + 1;
    s.world.flags.rival_assassination = defend ? 'defended' : 'distanced';
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_rival_assassination_attempt'))
        s.__meta.eventsRan.push('fn_act3_rival_assassination_attempt');
    return s;
};
// Final breakthrough: small permanent power increase if achieved
const fn_act3_final_breakthrough = (state, args) => {
    const breakthrough = args && args.choice === 'breakthrough';
    // Preserve legacy 'realm' but ensure realmId is present in the derived state copy
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    // Use the helper to derive/ensure a numeric realmId and base arithmetic on that.
    const currentRealmId = (0, playerHelpers_1.ensureRealmId)(s.player);
    if (breakthrough) {
        s.player.stats.qi = (s.player.stats.qi || 0) + 25;
        try {
            // Prefer the numeric realmId for progression arithmetic
            (0, playerSetters_1.applyRealmToPlayer)(s.player, currentRealmId + 1);
        }
        catch (e) {
            // Conservative fallback: set realmId via helper and best-effort realm key
            const newRealmId = currentRealmId + 1;
            try {
                s.player.realmId = newRealmId;
            }
            catch (e2) { /* ignore if immutable */ }
            const realmKey = cultivationRealms_1.REALM_ORDER[newRealmId - 1];
            try {
                if (realmKey)
                    s.player.realm = (0, playerHelpers_1.getPlayerRealmKey)({ ...s.player, realmId: newRealmId }) || realmKey;
            }
            catch (e3) { /* ignore */ }
        }
        s.world.flags.final_breakthrough = 'succeeded';
    }
    else {
        s.world.flags.final_breakthrough = 'deferred';
    }
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_final_breakthrough'))
        s.__meta.eventsRan.push('fn_act3_final_breakthrough');
    return s;
};
const fn_act3_first_breakthrough = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.stats.qi = (s.player.stats.qi || 0) + 8;
    s.world.flags.first_breakthrough = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_first_breakthrough'))
        s.__meta.eventsRan.push('fn_act3_first_breakthrough');
    return s;
};
const fn_act3_ancient_artifact = (state) => {
    const s = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [] }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.inventory.push({ id: 'ancient_artifact', name: 'Ancient Artifact', qty: 1 });
    s.world.flags.ancient_artifact_found = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_ancient_artifact'))
        s.__meta.eventsRan.push('fn_act3_ancient_artifact');
    return s;
};
const fn_act3_spirit_beast_encounter = (state) => {
    const s = { ...state, player: { ...state.player, bonds: { ...((state.player && state.player.bonds) || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.bonds['spirit_beast'] = (s.player.bonds['spirit_beast'] || 0) + 1;
    s.world.flags.spirit_beast_encountered = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_spirit_beast_encounter'))
        s.__meta.eventsRan.push('fn_act3_spirit_beast_encounter');
    return s;
};
const fn_act3_martial_competition = (state) => {
    const s = { ...state, player: { ...state.player, fame: state.player.fame || 0, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.fame = (s.player.fame || 0) + 2;
    s.player.stats.atk = (s.player.stats.atk || 0) + 1;
    s.world.flags.martial_competition = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_martial_competition'))
        s.__meta.eventsRan.push('fn_act3_martial_competition');
    return s;
};
const fn_act3_mentor_guidance = (state) => {
    const s = { ...state, player: { ...state.player, skillPoints: (state.player.skillPoints || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.mentor_guidance_received = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_mentor_guidance'))
        s.__meta.eventsRan.push('fn_act3_mentor_guidance');
    return s;
};
const fn_act3_first_alchemy = (state) => {
    const s = { ...state, player: { ...state.player, materials: { ...((state.player && state.player.materials) || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.materials['herb_fragment'] = (s.player.materials['herb_fragment'] || 0) + 3;
    s.world.flags.first_alchemy = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_first_alchemy'))
        s.__meta.eventsRan.push('fn_act3_first_alchemy');
    return s;
};
const fn_act3_night_cultivation = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.stats.qi = (s.player.stats.qi || 0) + 6;
    s.world.flags.night_cultivation = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_night_cultivation'))
        s.__meta.eventsRan.push('fn_act3_night_cultivation');
    return s;
};
const fn_act3_dao_insight = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.stats.insight = (s.player.stats.insight || 0) + 3;
    s.world.flags.dao_insight = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_dao_insight'))
        s.__meta.eventsRan.push('fn_act3_dao_insight');
    return s;
};
const fn_act3_sect_crisis = (state) => {
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } }, player: { ...state.player, reputation: { ...(state.player.reputation || {}) } } };
    s.player.reputation['sect_crisis_handler'] = (s.player.reputation['sect_crisis_handler'] || 0) + 2;
    s.world.flags.sect_crisis = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_crisis'))
        s.__meta.eventsRan.push('fn_act3_sect_crisis');
    return s;
};
const fn_act3_final_test = (state) => {
    const s = { ...state, player: { ...state.player, stats: { ...state.player.stats } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.stats.qi = (s.player.stats.qi || 0) + 10;
    s.world.flags.final_test_passed = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_final_test'))
        s.__meta.eventsRan.push('fn_act3_final_test');
    return s;
};
const fn_act3_spirit_stone_mine = (state) => {
    const s = { ...state, player: { ...state.player, inventory: Array.isArray(state.player.inventory) ? [...state.player.inventory] : [] }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.inventory.push({ id: 'spirit_stone', name: 'Spirit Stone', qty: 1 });
    s.world.flags.spirit_stone_mined = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_spirit_stone_mine'))
        s.__meta.eventsRan.push('fn_act3_spirit_stone_mine');
    return s;
};
const fn_act3_herbal_garden = (state) => {
    const s = { ...state, player: { ...state.player, materials: { ...((state.player && state.player.materials) || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.materials['herb'] = (s.player.materials['herb'] || 0) + 5;
    s.world.flags.herbal_garden_harvest = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_herbal_garden'))
        s.__meta.eventsRan.push('fn_act3_herbal_garden');
    return s;
};
const fn_act3_martial_technique = (state) => {
    var _a;
    const s = { ...state, player: { ...state.player, techniques: Array.isArray(state.player.techniques) ? [...(state.player.techniques || [])] : [] }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    ((_a = s.player).techniques || (_a.techniques = [])).push('basic_martial_technique');
    s.world.flags.martial_technique_learned = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_martial_technique'))
        s.__meta.eventsRan.push('fn_act3_martial_technique');
    return s;
};
const fn_act3_sect_alliance = (state) => {
    const s = { ...state, player: { ...state.player, factionStanding: { ...(state.player.factionStanding || {}) } }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.player.factionStanding['ally_sect'] = (s.player.factionStanding['ally_sect'] || 0) + 5;
    s.world.flags.sect_alliance_formed = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_sect_alliance'))
        s.__meta.eventsRan.push('fn_act3_sect_alliance');
    return s;
};
const fn_act3_demon_invasion = (state) => {
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.demon_invasion = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_demon_invasion'))
        s.__meta.eventsRan.push('fn_act3_demon_invasion');
    return s;
};
const fn_act3_celestial_visitor = (state) => {
    const s = { ...state, player: { ...state.player, blessings: ((state.player && state.player.blessings) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.celestial_visitor = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_celestial_visitor'))
        s.__meta.eventsRan.push('fn_act3_celestial_visitor');
    return s;
};
const fn_act3_void_rift = (state) => {
    const s = { ...state, world: { ...state.world, dangers: { ...((state.world && state.world.dangers) || {}) }, flags: { ...(state.world.flags || {}) } } };
    s.world.dangers['void_rift'] = true;
    s.world.flags.void_rift_open = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_void_rift'))
        s.__meta.eventsRan.push('fn_act3_void_rift');
    return s;
};
const fn_act3_phoenix_rebirth = (state) => {
    const s = { ...state, player: { ...state.player, revivalTokens: ((state.player && state.player.revivalTokens) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.phoenix_rebirth = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_phoenix_rebirth'))
        s.__meta.eventsRan.push('fn_act3_phoenix_rebirth');
    return s;
};
const fn_act3_dragon_awakening = (state) => {
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } }, player: { ...state.player, strength: ((state.player && state.player.strength) || 0) + 2 } };
    s.world.flags.dragon_awakening = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_dragon_awakening'))
        s.__meta.eventsRan.push('fn_act3_dragon_awakening');
    return s;
};
const fn_act3_fox_illusion = (state) => {
    const s = { ...state, player: { ...state.player, cunning: ((state.player && state.player.cunning) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.fox_illusion = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_fox_illusion'))
        s.__meta.eventsRan.push('fn_act3_fox_illusion');
    return s;
};
const fn_act3_monkey_agility = (state) => {
    const s = { ...state, player: { ...state.player, agility: ((state.player && state.player.agility) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.monkey_agility = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_monkey_agility'))
        s.__meta.eventsRan.push('fn_act3_monkey_agility');
    return s;
};
const fn_act3_spirit_connection = (state) => {
    const s = { ...state, player: { ...state.player, spiritAffinity: ((state.player && state.player.spiritAffinity) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.spirit_connection = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_spirit_connection'))
        s.__meta.eventsRan.push('fn_act3_spirit_connection');
    return s;
};
const fn_act3_asura_rage = (state) => {
    const s = { ...state, player: { ...state.player, rage: ((state.player && state.player.rage) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.asura_rage = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_asura_rage'))
        s.__meta.eventsRan.push('fn_act3_asura_rage');
    return s;
};
const fn_act3_celestial_blessing = (state) => {
    const s = { ...state, player: { ...state.player, blessings: ((state.player && state.player.blessings) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.celestial_blessing = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_celestial_blessing'))
        s.__meta.eventsRan.push('fn_act3_celestial_blessing');
    return s;
};
const fn_act3_void_energy = (state) => {
    const s = { ...state, player: { ...state.player, voidPower: ((state.player && state.player.voidPower) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.void_energy = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_void_energy'))
        s.__meta.eventsRan.push('fn_act3_void_energy');
    return s;
};
const fn_act3_human_potential = (state) => {
    const s = { ...state, player: { ...state.player, potential: ((state.player && state.player.potential) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.human_potential = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_human_potential'))
        s.__meta.eventsRan.push('fn_act3_human_potential');
    return s;
};
const fn_act3_demon_corruption = (state) => {
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } }, player: { ...state.player, corruption: ((state.player && state.player.corruption) || 0) + 1 } };
    s.world.flags.demon_corruption = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_demon_corruption'))
        s.__meta.eventsRan.push('fn_act3_demon_corruption');
    return s;
};
const fn_act3_spirit_guardian = (state) => {
    const s = { ...state, world: { ...state.world, guardians: { ...((state.world && state.world.guardians) || {}) }, flags: { ...(state.world.flags || {}) } } };
    s.world.guardians['spirit_guardian'] = true;
    s.world.flags.spirit_guardian_awakened = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_spirit_guardian'))
        s.__meta.eventsRan.push('fn_act3_spirit_guardian');
    return s;
};
const fn_act3_dragon_roar = (state) => {
    const s = { ...state, player: { ...state.player, morale: ((state.player && state.player.morale) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.dragon_roar = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_dragon_roar'))
        s.__meta.eventsRan.push('fn_act3_dragon_roar');
    return s;
};
const fn_act3_phoenix_flame = (state) => {
    const s = { ...state, player: { ...state.player, revivalTokens: ((state.player && state.player.revivalTokens) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.phoenix_flame = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_phoenix_flame'))
        s.__meta.eventsRan.push('fn_act3_phoenix_flame');
    return s;
};
const fn_act3_celestial_light = (state) => {
    const s = { ...state, player: { ...state.player, aura: ((state.player && state.player.aura) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.celestial_light = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_celestial_light'))
        s.__meta.eventsRan.push('fn_act3_celestial_light');
    return s;
};
const fn_act3_asura_strength = (state) => {
    const s = { ...state, player: { ...state.player, strength: ((state.player && state.player.strength) || 0) + 2 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.asura_strength = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_asura_strength'))
        s.__meta.eventsRan.push('fn_act3_asura_strength');
    return s;
};
const fn_act3_void_portal = (state) => {
    const s = { ...state, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.void_portal = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_void_portal'))
        s.__meta.eventsRan.push('fn_act3_void_portal');
    return s;
};
const fn_act3_fox_charm = (state) => {
    const s = { ...state, player: { ...state.player, charm: ((state.player && state.player.charm) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.fox_charm = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_fox_charm'))
        s.__meta.eventsRan.push('fn_act3_fox_charm');
    return s;
};
const fn_act3_monkey_trickery = (state) => {
    const s = { ...state, player: { ...state.player, trickery: ((state.player && state.player.trickery) || 0) + 1 }, world: { ...state.world, flags: { ...(state.world.flags || {}) } } };
    s.world.flags.monkey_trickery = true;
    (s.__meta || (s.__meta = {})).eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes('fn_act3_monkey_trickery'))
        s.__meta.eventsRan.push('fn_act3_monkey_trickery');
    return s;
};
// fn_act3_final_breakthrough implemented above; no stub needed
exports.act3EventExecutors = {
    "fn_act3_intermediate_cultivation": fn_act3_intermediate_cultivation,
    "fn_act3_sect_politics": fn_act3_sect_politics,
    "fn_act3_exploration_mission": fn_act3_exploration_mission,
    "fn_act3_rivalry": fn_act3_rivalry,
    "fn_act3_first_breakthrough": fn_act3_first_breakthrough,
    "fn_act3_ancient_artifact": fn_act3_ancient_artifact,
    "fn_act3_spellbinders_gathering": fn_act3_spellbinders_gathering,
    "fn_act3_spirit_beast_encounter": fn_act3_spirit_beast_encounter,
    "fn_act3_martial_competition": fn_act3_martial_competition,
    "fn_act3_mentor_guidance": fn_act3_mentor_guidance,
    "fn_act3_first_alchemy": fn_act3_first_alchemy,
    "fn_act3_night_cultivation": fn_act3_night_cultivation,
    "fn_act3_dao_insight": fn_act3_dao_insight,
    "fn_act3_sect_crisis": fn_act3_sect_crisis,
    "fn_act3_final_test": fn_act3_final_test,
    "fn_act3_spirit_stone_mine": fn_act3_spirit_stone_mine,
    "fn_act3_herbal_garden": fn_act3_herbal_garden,
    "fn_act3_martial_technique": fn_act3_martial_technique,
    "fn_act3_sect_alliance": fn_act3_sect_alliance,
    "fn_act3_demon_invasion": fn_act3_demon_invasion,
    "fn_act3_celestial_visitor": fn_act3_celestial_visitor,
    "fn_act3_void_rift": fn_act3_void_rift,
    "fn_act3_phoenix_rebirth": fn_act3_phoenix_rebirth,
    "fn_act3_dragon_awakening": fn_act3_dragon_awakening,
    "fn_act3_fox_illusion": fn_act3_fox_illusion,
    "fn_act3_monkey_agility": fn_act3_monkey_agility,
    "fn_act3_spirit_connection": fn_act3_spirit_connection,
    "fn_act3_asura_rage": fn_act3_asura_rage,
    "fn_act3_celestial_blessing": fn_act3_celestial_blessing,
    "fn_act3_void_energy": fn_act3_void_energy,
    "fn_act3_human_potential": fn_act3_human_potential,
    "fn_act3_demon_corruption": fn_act3_demon_corruption,
    "fn_act3_spirit_guardian": fn_act3_spirit_guardian,
    "fn_act3_dragon_roar": fn_act3_dragon_roar,
    "fn_act3_phoenix_flame": fn_act3_phoenix_flame,
    "fn_act3_celestial_light": fn_act3_celestial_light,
    "fn_act3_asura_strength": fn_act3_asura_strength,
    "fn_act3_void_portal": fn_act3_void_portal,
    "fn_act3_fox_charm": fn_act3_fox_charm,
    "fn_act3_monkey_trickery": fn_act3_monkey_trickery,
    "fn_act3_final_breakthrough": fn_act3_final_breakthrough,
};
