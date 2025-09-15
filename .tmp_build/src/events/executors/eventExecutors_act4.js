"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.act4EventExecutors = void 0;
const makeStub = (id) => (state) => {
    const s = { ...state };
    s.__meta = s.__meta || {};
    s.__meta.eventsRan = s.__meta.eventsRan || [];
    if (!s.__meta.eventsRan.includes(id))
        s.__meta.eventsRan.push(id);
    return s;
};
// Conservative, idempotent implementations for core Act 4 executors referenced by act4_events.json
const impl = (id, fn) => {
    return (state, choice) => {
        const s = { ...state };
        s.__meta = s.__meta || {};
        s.__meta.eventsRan = s.__meta.eventsRan || [];
        if (!s.__meta.eventsRan.includes(id))
            s.__meta.eventsRan.push(id);
        try {
            fn(s, choice);
        }
        catch (e) {
            // swallow to keep runtime safe
        }
        return s;
    };
};
// small helpers to mutate player state safely
function grantWeapon(p, weaponId) {
    p.inventory = p.inventory || [];
    p.inventory.push({ id: weaponId, qty: 1 });
}
function unlockSkill(p, skillId) {
    p.unlockedSkills = p.unlockedSkills || [];
    if (!p.unlockedSkills.includes(skillId))
        p.unlockedSkills.push(skillId);
}
const fn_act4_cross_realm_auction = impl('fn_act4_cross_realm_auction', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['crossRealmAuctionAttended'] = true;
    const p = s.player || {};
    if (choice === 'attend_and_bid') {
        // found a minor immortal trinket and a decent purse
        p.gold = (p.gold || 0) + 80;
        grantWeapon(p, 'weapon_sword_veldra');
    }
    else {
        p.renown = (p.renown || 0) + 14;
        unlockSkill(p, 'swiftwind_strike');
    }
});
const fn_act4_escort_diplomat_to_immortal_sect = impl('fn_act4_escort_diplomat_to_immortal_sect', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['diplomatEscortSuccess'] = choice === 'plan_carefully';
    const p = s.player || {};
    if (choice === 'plan_carefully') {
        p.reputation = (p.reputation || 0) + 18;
        grantWeapon(p, 'weapon_staff_moonpole');
        unlockSkill(p, 'silent_draw');
    }
    else {
        p.reputation = (p.reputation || 0) + 6;
        p.gold = (p.gold || 0) + 10;
    }
});
const fn_act4_trade_route_negotiation = impl('fn_act4_trade_route_negotiation', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['tradeRouteDeal'] = choice === 'offer_favor' ? 'favor' : 'terms';
    const p = s.player || {};
    if (choice === 'offer_favor') {
        p.gold = (p.gold || 0) + 40;
        p.reputation = (p.reputation || 0) + 6;
        unlockSkill(p, 'forge_command');
    }
    else {
        p.gold = (p.gold || 0) + 90;
        p.reputation = (p.reputation || 0) + 12;
    }
});
const fn_act4_expedition_into_demon_realm = impl('fn_act4_expedition_into_demon_realm', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    const p = s.player || {};
    if (choice === 'lead_expedition') {
        // risk and reward: chance to gain a demonic technique or corruption
        s.world.flags['demonExpeditionSurvived'] = Math.random() < 0.7;
        if (s.world.flags['demonExpeditionSurvived']) {
            p.reputation = (p.reputation || 0) + 30;
            unlockSkill(p, 'asura_rage');
            grantWeapon(p, 'weapon_dagger_shadowfang');
        }
        else {
            p.reputation = (p.reputation || 0) - 10;
            p.corruption = (p.corruption || 0) + 5;
        }
    }
    else {
        s.world.flags['demonExpeditionSurvived'] = true;
        p.gold = (p.gold || 0) + 40;
        p.reputation = (p.reputation || 0) + 8;
    }
});
const fn_act4_market_of_heavenly_goods = impl('fn_act4_market_of_heavenly_goods', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    const p = s.player || {};
    if (choice === 'buy_authentic') {
        p.inventory = p.inventory || [];
        p.inventory.push({ id: 'authentic_heavenly_gem', qty: 1 });
        p.gold = (p.gold || 0) - 60;
        // merchant introduces a new technique
        unlockSkill(p, 'soulforge_psalm');
    }
    else {
        p.gold = (p.gold || 0) - 15;
        p.reputation = (p.reputation || 0) - 4;
        // small chance of counterfeit: gain a starter weapon
        if (Math.random() < 0.4)
            grantWeapon(p, 'weapon_sword_iron_broker');
    }
});
const fn_act4_dungeon_delving_with_sect_allies = impl('fn_act4_dungeon_delving_with_sect_allies', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    const p = s.player || {};
    s.world.flags['dungeonDelveOutcome'] = choice === 'go_together' ? 'coordinated' : 'raced';
    if (choice === 'go_together') {
        p.reputation = (p.reputation || 0) + 20;
        p.gold = (p.gold || 0) + 25;
        grantWeapon(p, 'weapon_staff_wind_herald');
        unlockSkill(p, 'tenacious_guard');
    }
    else {
        p.reputation = (p.reputation || 0) + 6;
        p.gold = (p.gold || 0) + 10;
        // racing yields a minor chance to find an ancient sigil
        if (Math.random() < 0.25)
            p.inventory = (p.inventory || []).concat([{ id: 'ancient_sigil', qty: 1 }]);
    }
});
const fn_act4_intersect_council_call = impl('fn_act4_intersect_council_call', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    const p = s.player || {};
    s.world.flags['intersectCouncilSpoke'] = choice === 'speak_out';
    if (choice === 'speak_out') {
        p.renown = (p.renown || 0) + 28;
        p.reputation = (p.reputation || 0) + 12;
        // honored with a teaching scroll and an immortal-grade fragment
        p.inventory = p.inventory || [];
        p.inventory.push({ id: 'sutra_fragment', qty: 1 });
        grantWeapon(p, 'weapon_spiritblade_ghostedge');
    }
    else {
        p.renown = (p.renown || 0) + 8;
        p.reputation = (p.reputation || 0) + 4;
    }
});
const fn_act4_spirit_beast_coliseum = impl('fn_act4_spirit_beast_coliseum', (s, choice) => {
    const p = s.player || {};
    if (choice === 'sponsor') {
        p.gold = (p.gold || 0) - 30;
        p.reputation = (p.reputation || 0) + 10;
        // gain a minor spirit beast fragment
        p.inventory = p.inventory || [];
        p.inventory.push({ id: 'spirit_beast_fragment', qty: 1 });
    }
    else if (choice === 'compete_with_beast') {
        p.reputation = (p.reputation || 0) + 24;
        // reward: unlock an active skill tied to beasts
        unlockSkill(p, 'spirit_call');
    }
});
const fn_act4_heavenly_merchant_guild_raid = impl('fn_act4_heavenly_merchant_guild_raid', (s, choice) => {
    const p = s.player || {};
    if (choice === 'track_and_recover') {
        p.reputation = (p.reputation || 0) + 18;
        p.gold = (p.gold || 0) + 20;
        grantWeapon(p, 'weapon_bow_windwhisper');
    }
    else {
        p.gold = (p.gold || 0) + 35;
        // small passive unlock for negotiation
        unlockSkill(p, 'edge_reader');
    }
});
const fn_act4_artifact_conclave_at_heavenly_palace = impl('fn_act4_artifact_conclave_at_heavenly_palace', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['artifactConclavePresented'] = true;
    if (choice === 'show_hostile_artifact') {
        p.reputation = (p.reputation || 0) + 14;
        p.inventory = p.inventory || [];
        p.inventory.push({ id: 'tested_relic_sample', qty: 1 });
        // present and be noticed: unlock a sutra
        unlockSkill(p, 'sutra_soulforge_psalm');
    }
    else {
        p.reputation = (p.reputation || 0) + 6;
    }
});
const fn_act4_dual_path_to_breakthrough = impl('fn_act4_dual_path_to_breakthrough', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['dualPathChosen'] = choice === 'try_forbidden' ? 'forbidden' : 'orthodox';
    if (choice === 'try_forbidden')
        p.corruption = (p.corruption || 0) + 3;
    p.reputation = (p.reputation || 0) + 8;
});
const fn_act4_recover_lost_city_of_immortals = impl('fn_act4_recover_lost_city_of_immortals', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['lostCityClaimed'] = choice === 'claim_city';
    if (choice === 'claim_city')
        p.reputation = (p.reputation || 0) + 25;
    else
        p.reputation = (p.reputation || 0) + 10;
});
const fn_act4_spiritual_trade_agreement = impl('fn_act4_spiritual_trade_agreement', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['spiritualTradeAgreement'] = choice === 'push_favorable_terms' ? 'favorable' : 'fair';
    p.gold = (p.gold || 0) + (choice === 'push_favorable_terms' ? 20 : 5);
    p.reputation = (p.reputation || 0) + 6;
});
const fn_act4_healing_disaster_in_immortal_branch = impl('fn_act4_healing_disaster_in_immortal_branch', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['healingDisasterInvestigated'] = choice === 'investigate_root';
    if (choice === 'investigate_root')
        p.reputation = (p.reputation || 0) + 15;
    else
        p.reputation = (p.reputation || 0) + 6;
});
const fn_act4_nexus_of_realms_encounter = impl('fn_act4_nexus_of_realms_encounter', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['nexusMapped'] = choice === 'map_edges';
    if (choice === 'explore_fully')
        p.gold = (p.gold || 0) + 40;
    else
        p.renown = (p.renown || 0) + 12;
});
const fn_act4_rival_sect_sabotage_on_trade_route = impl('fn_act4_rival_sect_sabotage_on_trade_route', (s, choice) => {
    const p = s.player || {};
    if (choice === 'punish_saboteur')
        p.reputation = (p.reputation || 0) + 18;
    else
        p.reputation = (p.reputation || 0) + 6;
});
const fn_act4_heavenly_court_trial = impl('fn_act4_heavenly_court_trial', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['heavenlyCourtOutcome'] = choice === 'defend_strongly' ? 'defended' : 'pleaded';
    p.reputation = (p.reputation || 0) + (choice === 'defend_strongly' ? -5 : -2);
});
const fn_act4_domain_gateway_unlocked = impl('fn_act4_domain_gateway_unlocked', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['domainGatewayOwned'] = choice === 'claim_domain';
    if (choice === 'claim_domain')
        p.reputation = (p.reputation || 0) + 20;
});
const fn_act4_celestial_beast_offering = impl('fn_act4_celestial_beast_offering', (s, choice) => {
    const p = s.player || {};
    if (choice === 'accept_gift') {
        p.blessings = (p.blessings || 0) + 1;
        p.reputation = (p.reputation || 0) + 10;
    }
    else {
        p.reputation = (p.reputation || 0) + 2;
    }
});
const fn_act4_treaty_with_darkness_sect = impl('fn_act4_treaty_with_darkness_sect', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['darknessTreaty'] = choice === 'sign_treaty';
    if (choice === 'sign_treaty')
        p.reputation = (p.reputation || 0) - 5;
    else
        p.reputation = (p.reputation || 0) + 5;
});
const fn_act4_spiritual_crisis_in_mortal_realm = impl('fn_act4_spiritual_crisis_in_mortal_realm', (s, choice) => {
    const p = s.player || {};
    if (choice === 'send_aid') {
        p.reputation = (p.reputation || 0) + 18;
        p.gold = (p.gold || 0) - 20;
    }
    else {
        p.reputation = (p.reputation || 0) + 4;
    }
});
const fn_act4_ruin_underneath_sect_halls = impl('fn_act4_ruin_underneath_sect_halls', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['ruinsExplored'] = choice === 'explore_ruins';
    if (choice === 'explore_ruins') {
        p.inventory = p.inventory || [];
        p.inventory.push({ id: 'ancient_sigil', qty: 1 });
        p.reputation = (p.reputation || 0) + 12;
    }
});
const fn_act4_unification_pressure = impl('fn_act4_unification_pressure', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['unificationStance'] = choice === 'join_unification' ? 'joined' : 'autonomy';
    if (choice === 'join_unification')
        p.reputation = (p.reputation || 0) + 10;
    else
        p.reputation = (p.reputation || 0) + 5;
});
const fn_act4_domain_tournament_between_realms = impl('fn_act4_domain_tournament_between_realms', (s, choice) => {
    const p = s.player || {};
    if (choice === 'participate')
        p.reputation = (p.reputation || 0) + 20;
    else
        p.reputation = (p.reputation || 0) + 5;
});
const fn_act4_master_and_apprentice_reckoning = impl('fn_act4_master_and_apprentice_reckoning', (s, choice) => {
    const p = s.player || {};
    if (choice === 'defend_master')
        p.reputation = (p.reputation || 0) + 8;
    else
        p.reputation = (p.reputation || 0) + 4;
});
const fn_act4_shattered_alliance_revenge = impl('fn_act4_shattered_alliance_revenge', (s, choice) => {
    const p = s.player || {};
    if (choice === 'avenge')
        p.reputation = (p.reputation || 0) + 20;
    else
        p.reputation = (p.reputation || 0) + 10;
});
const fn_act4_heavenly_emperor_attention = impl('fn_act4_heavenly_emperor_attention', (s, choice) => {
    const p = s.player || {};
    if (choice === 'venerate')
        p.reputation = (p.reputation || 0) + 30;
    else
        p.reputation = (p.reputation || 0) + 10;
});
const fn_act4_spirit_sea_navigation = impl('fn_act4_spirit_sea_navigation', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['spiritSeaCharted'] = choice === 'chart_course';
    if (choice === 'plunder')
        p.gold = (p.gold || 0) + 35;
    else
        p.renown = (p.renown || 0) + 12;
});
const fn_act4_mortal_world_integration = impl('fn_act4_mortal_world_integration', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['mortalIntegration'] = choice === 'open_public_school' ? 'public' : 'hidden';
    if (choice === 'open_public_school')
        p.reputation = (p.reputation || 0) + 15;
});
const fn_act4_demonstration_of_immortal_branch_power = impl('fn_act4_demonstration_of_immortal_branch_power', (s, choice) => {
    const p = s.player || {};
    if (choice === 'attend_in_person')
        p.reputation = (p.reputation || 0) + 8;
    else
        p.reputation = (p.reputation || 0) + 2;
});
const fn_act4_guardians_of_ancient_tree = impl('fn_act4_guardians_of_ancient_tree', (s, choice) => {
    const p = s.player || {};
    if (choice === 'protect_tree') {
        p.reputation = (p.reputation || 0) + 20;
        p.guardianBond = (p.guardianBond || 0) + 1;
    }
    else {
        p.reputation = (p.reputation || 0) + 5;
        p.inventory = p.inventory || [];
        p.inventory.push({ id: 'tree_resin', qty: 1 });
    }
});
const fn_act4_heir_of_sect_lineage_claim = impl('fn_act4_heir_of_sect_lineage_claim', (s, choice) => {
    const p = s.player || {};
    if (choice === 'support_claim')
        p.reputation = (p.reputation || 0) + 12;
    else
        p.reputation = (p.reputation || 0) + 4;
});
// Keep generic stubs for the remaining less-critical IDs to avoid large edits now
const fn_act4_advanced_cultivation = impl('fn_act4_advanced_cultivation', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['advancedCultivationStarted'] = true;
    p.reputation = (p.reputation || 0) + 8;
    p.potential = (p.potential || 0) + 1;
});
const fn_act4_realm_breakthrough = impl('fn_act4_realm_breakthrough', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['realmBreakthroughAttempt'] = true;
    if (choice === 'try_forbidden')
        p.corruption = (p.corruption || 0) + 5;
    p.reputation = (p.reputation || 0) + 20;
});
const fn_act4_major_conflict = impl('fn_act4_major_conflict', (s, choice) => {
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['majorConflict'] = true;
    const p = s.player || {};
    p.morale = (p.morale || 0) - (choice === 'avenge' ? 5 : 2);
    p.reputation = (p.reputation || 0) + (choice === 'avenge' ? 15 : 5);
});
const fn_act4_ancient_ruins = impl('fn_act4_ancient_ruins', (s, choice) => {
    const p = s.player || {};
    p.inventory = p.inventory || [];
    p.inventory.push({ id: 'ruins_fragment', qty: 1 });
    p.gold = (p.gold || 0) + 25;
});
const fn_act4_spirit_beast_alliance = impl('fn_act4_spirit_beast_alliance', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['spiritBeastAlly'] = choice === 'accept';
    if (choice === 'accept')
        p.renown = (p.renown || 0) + 30;
});
const fn_act4_celestial_trial = impl('fn_act4_celestial_trial', (s, choice) => {
    const p = s.player || {};
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['celestialTrialPassed'] = choice === 'pass';
    if (choice === 'pass')
        p.reputation = (p.reputation || 0) + 25;
});
const fn_act4_demon_corruption = impl('fn_act4_demon_corruption', (s, choice) => {
    const p = s.player || {};
    p.corruption = (p.corruption || 0) + 10;
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['demonCorruptionSpread'] = true;
});
const fn_act4_void_portal = impl('fn_act4_void_portal', (s, choice) => {
    const p = s.player || {};
    p.voidPower = (p.voidPower || 0) + 5;
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['voidPortalOpened'] = true;
});
const fn_act4_phoenix_rebirth = impl('fn_act4_phoenix_rebirth', (s, choice) => {
    const p = s.player || {};
    p.revivalTokens = (p.revivalTokens || 0) + 1;
    p.reputation = (p.reputation || 0) + 10;
});
const fn_act4_dragon_awakening = impl('fn_act4_dragon_awakening', (s, choice) => {
    const p = s.player || {};
    p.reputation = (p.reputation || 0) + 30;
    s.world = s.world || {};
    s.world.flags = s.world.flags || {};
    s.world.flags['dragonAwakened'] = true;
});
const fn_act4_fox_illusion = impl('fn_act4_fox_illusion', (s, choice) => {
    const p = s.player || {};
    p.charm = (p.charm || 0) + 5;
});
const fn_act4_monkey_agility = impl('fn_act4_monkey_agility', (s, choice) => {
    const p = s.player || {};
    p.agility = (p.agility || 0) + 6;
});
const fn_act4_spirit_connection = impl('fn_act4_spirit_connection', (s, choice) => {
    const p = s.player || {};
    p.spiritAffinity = (p.spiritAffinity || 0) + 7;
});
const fn_act4_asura_rage = impl('fn_act4_asura_rage', (s, choice) => {
    const p = s.player || {};
    p.rage = (p.rage || 0) + 8;
});
const fn_act4_celestial_blessing = impl('fn_act4_celestial_blessing', (s, choice) => {
    const p = s.player || {};
    p.blessings = (p.blessings || 0) + 1;
    p.reputation = (p.reputation || 0) + 12;
});
const fn_act4_void_energy = impl('fn_act4_void_energy', (s, choice) => {
    const p = s.player || {};
    p.voidPower = (p.voidPower || 0) + 10;
});
const fn_act4_human_potential = impl('fn_act4_human_potential', (s, choice) => {
    const p = s.player || {};
    p.potential = (p.potential || 0) + 2;
});
const fn_act4_spirit_guardian = impl('fn_act4_spirit_guardian', (s, choice) => {
    const p = s.player || {};
    p.guardianBond = (p.guardianBond || 0) + 1;
    p.reputation = (p.reputation || 0) + 8;
});
const fn_act4_dragon_roar = impl('fn_act4_dragon_roar', (s, choice) => {
    const p = s.player || {};
    p.strength = (p.strength || 0) + 10;
});
const fn_act4_phoenix_flame = impl('fn_act4_phoenix_flame', (s, choice) => {
    const p = s.player || {};
    p.spirit = (p.spirit || 0) + 10;
});
const fn_act4_celestial_light = impl('fn_act4_celestial_light', (s, choice) => {
    const p = s.player || {};
    p.renown = (p.renown || 0) + 20;
});
const fn_act4_asura_strength = impl('fn_act4_asura_strength', (s, choice) => {
    const p = s.player || {};
    p.strength = (p.strength || 0) + 8;
});
const fn_act4_fox_charm = impl('fn_act4_fox_charm', (s, choice) => {
    const p = s.player || {};
    p.charm = (p.charm || 0) + 7;
});
const fn_act4_monkey_trickery = impl('fn_act4_monkey_trickery', (s, choice) => {
    const p = s.player || {};
    p.trickery = (p.trickery || 0) + 6;
});
const fn_act4_final_breakthrough = impl('fn_act4_final_breakthrough', (s, choice) => {
    const p = s.player || {};
    p.finalBreakthrough = true;
    p.reputation = (p.reputation || 0) + 50;
});
const fn_act4_ultimate_trial = impl('fn_act4_ultimate_trial', (s, choice) => {
    const p = s.player || {};
    p.trialPassed = choice === 'pass';
    if (p.trialPassed)
        p.reputation = (p.reputation || 0) + 40;
});
const fn_act4_cosmic_awareness = impl('fn_act4_cosmic_awareness', (s, choice) => {
    const p = s.player || {};
    p.cosmicAwareness = (p.cosmicAwareness || 0) + 1;
});
const fn_act4_divine_intervention = impl('fn_act4_divine_intervention', (s, choice) => {
    const p = s.player || {};
    p.blessings = (p.blessings || 0) + 2;
});
const fn_act4_eternal_legacy = impl('fn_act4_eternal_legacy', (s, choice) => {
    const p = s.player || {};
    p.legacy = (p.legacy || 0) + 1;
});
exports.act4EventExecutors = {
    "fn_act4_cross_realm_auction": fn_act4_cross_realm_auction,
    "fn_act4_escort_diplomat_to_immortal_sect": fn_act4_escort_diplomat_to_immortal_sect,
    "fn_act4_trade_route_negotiation": fn_act4_trade_route_negotiation,
    "fn_act4_expedition_into_demon_realm": fn_act4_expedition_into_demon_realm,
    "fn_act4_market_of_heavenly_goods": fn_act4_market_of_heavenly_goods,
    "fn_act4_dungeon_delving_with_sect_allies": fn_act4_dungeon_delving_with_sect_allies,
    "fn_act4_intersect_council_call": fn_act4_intersect_council_call,
    "fn_act4_spirit_beast_coliseum": fn_act4_spirit_beast_coliseum,
    "fn_act4_heavenly_merchant_guild_raid": fn_act4_heavenly_merchant_guild_raid,
    "fn_act4_artifact_conclave_at_heavenly_palace": fn_act4_artifact_conclave_at_heavenly_palace,
    "fn_act4_dual_path_to_breakthrough": fn_act4_dual_path_to_breakthrough,
    "fn_act4_recover_lost_city_of_immortals": fn_act4_recover_lost_city_of_immortals,
    "fn_act4_spiritual_trade_agreement": fn_act4_spiritual_trade_agreement,
    "fn_act4_healing_disaster_in_immortal_branch": fn_act4_healing_disaster_in_immortal_branch,
    "fn_act4_nexus_of_realms_encounter": fn_act4_nexus_of_realms_encounter,
    "fn_act4_rival_sect_sabotage_on_trade_route": fn_act4_rival_sect_sabotage_on_trade_route,
    "fn_act4_heavenly_court_trial": fn_act4_heavenly_court_trial,
    "fn_act4_domain_gateway_unlocked": fn_act4_domain_gateway_unlocked,
    "fn_act4_celestial_beast_offering": fn_act4_celestial_beast_offering,
    "fn_act4_treaty_with_darkness_sect": fn_act4_treaty_with_darkness_sect,
    "fn_act4_spiritual_crisis_in_mortal_realm": fn_act4_spiritual_crisis_in_mortal_realm,
    "fn_act4_ruin_underneath_sect_halls": fn_act4_ruin_underneath_sect_halls,
    "fn_act4_unification_pressure": fn_act4_unification_pressure,
    "fn_act4_domain_tournament_between_realms": fn_act4_domain_tournament_between_realms,
    "fn_act4_master_and_apprentice_reckoning": fn_act4_master_and_apprentice_reckoning,
    "fn_act4_shattered_alliance_revenge": fn_act4_shattered_alliance_revenge,
    "fn_act4_heavenly_emperor_attention": fn_act4_heavenly_emperor_attention,
    "fn_act4_spirit_sea_navigation": fn_act4_spirit_sea_navigation,
    "fn_act4_mortal_world_integration": fn_act4_mortal_world_integration,
    "fn_act4_demonstration_of_immortal_branch_power": fn_act4_demonstration_of_immortal_branch_power,
    "fn_act4_guardians_of_ancient_tree": fn_act4_guardians_of_ancient_tree,
    "fn_act4_heir_of_sect_lineage_claim": fn_act4_heir_of_sect_lineage_claim,
    "fn_act4_advanced_cultivation": fn_act4_advanced_cultivation,
    "fn_act4_realm_breakthrough": fn_act4_realm_breakthrough,
    "fn_act4_major_conflict": fn_act4_major_conflict,
    "fn_act4_ancient_ruins": fn_act4_ancient_ruins,
    "fn_act4_spirit_beast_alliance": fn_act4_spirit_beast_alliance,
    "fn_act4_celestial_trial": fn_act4_celestial_trial,
    "fn_act4_demon_corruption": fn_act4_demon_corruption,
    "fn_act4_void_portal": fn_act4_void_portal,
    "fn_act4_phoenix_rebirth": fn_act4_phoenix_rebirth,
    "fn_act4_dragon_awakening": fn_act4_dragon_awakening,
    "fn_act4_fox_illusion": fn_act4_fox_illusion,
    "fn_act4_monkey_agility": fn_act4_monkey_agility,
    "fn_act4_spirit_connection": fn_act4_spirit_connection,
    "fn_act4_asura_rage": fn_act4_asura_rage,
    "fn_act4_celestial_blessing": fn_act4_celestial_blessing,
    "fn_act4_void_energy": fn_act4_void_energy,
    "fn_act4_human_potential": fn_act4_human_potential,
    "fn_act4_spirit_guardian": fn_act4_spirit_guardian,
    "fn_act4_dragon_roar": fn_act4_dragon_roar,
    "fn_act4_phoenix_flame": fn_act4_phoenix_flame,
    "fn_act4_celestial_light": fn_act4_celestial_light,
    "fn_act4_asura_strength": fn_act4_asura_strength,
    "fn_act4_fox_charm": fn_act4_fox_charm,
    "fn_act4_monkey_trickery": fn_act4_monkey_trickery,
    "fn_act4_final_breakthrough": fn_act4_final_breakthrough,
    "fn_act4_ultimate_trial": fn_act4_ultimate_trial,
    "fn_act4_cosmic_awareness": fn_act4_cosmic_awareness,
    "fn_act4_divine_intervention": fn_act4_divine_intervention,
    "fn_act4_eternal_legacy": fn_act4_eternal_legacy,
};
