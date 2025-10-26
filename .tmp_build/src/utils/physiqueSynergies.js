"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHYSIQUE_SYNERGIES = void 0;
exports.getActiveSynergies = getActiveSynergies;
exports.calculateSynergyBonuses = calculateSynergyBonuses;
exports.getSynergyDescriptions = getSynergyDescriptions;
exports.checkSynergyUnlock = checkSynergyUnlock;
// Define physique synergy combinations
exports.PHYSIQUE_SYNERGIES = [
    // Celestial + Dragon = Celestial Dragon Emperor
    {
        id: 'celestial_dragon_synthesis',
        name: 'Celestial Dragon Emperor',
        description: 'Celestial and Dragon physiques merge to create an emperor-level constitution that commands both heavenly authority and draconic might.',
        requiredPhysiques: ['celestial_physique', 'dragon_physique'],
        bonuses: {
            cultivation_speed: 2.5,
            qi_regeneration: 1.8,
            dao_comprehension: 2.0,
            tribulation_resistance: 1.5,
            celestial_aura: 1.0
        }
    },
    // Phoenix + Thunder = Storm Phoenix Rebirth
    {
        id: 'phoenix_thunder_rebirth',
        name: 'Storm Phoenix Rebirth',
        description: 'Phoenix rebirth combined with thunder\'s destructive power creates a physique that rises stronger from every tribulation.',
        requiredPhysiques: ['phoenix_physique', 'thunder_physique'],
        bonuses: {
            hp_regeneration: 3.0,
            lightning_damage: 2.2,
            fire_damage: 2.2,
            tribulation_survival: 2.5,
            rebirth_power: 1.8
        }
    },
    // Emptiness + Shadow = Abyssal Emptiness Monarch
    {
        id: 'emptiness_shadow_abyss',
        name: 'Abyssal Emptiness Monarch',
        description: 'Emptiness and Shadow physiques combine to create a being that rules over darkness and the void-like emptiness itself.',
        requiredPhysiques: ['emptiness_physique', 'shadow_physique'],
        bonuses: {
            stealth: 3.0,
            emptiness_damage: 2.5,
            darkness_resistance: 2.0,
            spatial_manipulation: 1.8,
            fear_aura: 2.2
        }
    },
    // Elemental Trinity (Fire + Water + Earth)
    {
        id: 'elemental_trinity',
        name: 'Elemental Trinity',
        description: 'Mastery of fire, water, and earth creates perfect elemental harmony and devastating combined attacks.',
        requiredPhysiques: ['fire_physique', 'water_physique', 'earth_physique'],
        bonuses: {
            elemental_damage: 2.0,
            elemental_resistance: 2.5,
            elemental_mastery: 3.0,
            nature_harmony: 2.2,
            elemental_fusion: 1.5
        }
    },
    // Time + Space = Reality Weaver
    {
        id: 'time_space_reality',
        name: 'Reality Weaver',
        description: 'Control over time and space allows manipulation of reality itself, bending the laws of the universe.',
        requiredPhysiques: ['time_physique', 'space_physique'],
        bonuses: {
            time_manipulation: 2.5,
            space_manipulation: 2.5,
            reality_bending: 2.0,
            causality_understanding: 1.8,
            dimensional_stability: 2.2
        }
    },
    // Soul + Blood = Eternal Blood Soul
    {
        id: 'soul_blood_eternal',
        name: 'Eternal Blood Soul',
        description: 'Soul and blood merge to create an immortal being whose very essence defies death and decay.',
        requiredPhysiques: ['soul_physique', 'blood_physique'],
        bonuses: {
            immortality: 2.0,
            soul_damage: 2.5,
            blood_manipulation: 2.2,
            death_resistance: 3.0,
            life_drain: 2.0
        }
    },
    // Thunder + Lightning = Heavenly Thunder Sovereign
    {
        id: 'thunder_lightning_sovereign',
        name: 'Heavenly Thunder Sovereign',
        description: 'Thunder and lightning combine to create a sovereign who commands the wrath of the heavens.',
        requiredPhysiques: ['thunder_physique', 'lightning_physique'],
        bonuses: {
            thunder_damage: 3.0,
            lightning_damage: 3.0,
            heavenly_authority: 2.5,
            storm_mastery: 2.2,
            tribulation_command: 1.8
        }
    },
    // Beast + Dragon = Celestial Beast Emperor
    {
        id: 'beast_dragon_emperor',
        name: 'Celestial Beast Emperor',
        description: 'Beast instincts combined with draconic power create an emperor among celestial beasts.',
        requiredPhysiques: ['beast_physique', 'dragon_physique'],
        bonuses: {
            beast_transformation: 2.5,
            draconic_power: 2.2,
            predator_senses: 3.0,
            celestial_beast_aura: 2.0,
            transformation_mastery: 1.8
        }
    },
    // Celestial + Phoenix = Immortal Celestial Phoenix
    {
        id: 'celestial_phoenix_immortal',
        name: 'Immortal Celestial Phoenix',
        description: 'Celestial authority and phoenix rebirth create an immortal being blessed by the heavens.',
        requiredPhysiques: ['celestial_physique', 'phoenix_physique'],
        bonuses: {
            celestial_blessing: 2.5,
            phoenix_rebirth: 3.0,
            immortal_aura: 2.2,
            heavenly_fire: 2.0,
            celestial_immortality: 1.5
        }
    },
    // Emptiness + Time = Eternal Emptiness Walker
    {
        id: 'emptiness_time_eternal',
        name: 'Eternal Emptiness Walker',
        description: 'Emptiness and time merge to create a being that walks through eternity, untouched by the flow of time.',
        requiredPhysiques: ['emptiness_physique', 'time_physique'],
        bonuses: {
            time_immunity: 2.0,
            emptiness_mastery: 2.5,
            eternal_existence: 2.2,
            temporal_emptiness: 1.8,
            causality_immunity: 2.0
        }
    },
    // Five Elements Supreme (Fire + Water + Earth + Wind + Thunder)
    {
        id: 'five_elements_supreme',
        name: 'Five Elements Supreme',
        description: 'Mastery of all five elements creates a supreme being who commands the fundamental forces of nature.',
        requiredPhysiques: ['fire_physique', 'water_physique', 'earth_physique', 'wind_physique', 'thunder_physique'],
        bonuses: {
            elemental_supremacy: 3.0,
            natural_law: 2.5,
            elemental_fusion: 2.2,
            world_resonance: 2.0,
            elemental_emperor: 1.5
        }
    },
    // Yin Yang Harmony (Moon + Sun)
    {
        id: 'yin_yang_harmony',
        name: 'Yin Yang Harmony',
        description: 'Perfect balance of lunar and solar energies creates harmony between opposing forces.',
        requiredPhysiques: ['moon_physique', 'sun_physique'],
        bonuses: {
            yin_yang_balance: 2.5,
            dual_energy: 2.2,
            harmony_mastery: 2.0,
            balance_restoration: 1.8,
            cosmic_harmony: 2.0
        }
    },
    // Chaos + Order = Primordial Chaos Order
    {
        id: 'chaos_order_primordial',
        name: 'Primordial Chaos Order',
        description: 'Chaos and order merge to create the primordial force that shaped the universe itself.',
        requiredPhysiques: ['chaos_physique', 'order_physique'],
        bonuses: {
            chaos_order: 2.5,
            primordial_power: 2.2,
            universe_understanding: 2.0,
            creation_destruction: 1.8,
            primordial_essence: 2.0
        }
    },
    // Dream + Reality = Dream Reality Weaver
    {
        id: 'dream_reality_weaver',
        name: 'Dream Reality Weaver',
        description: 'Dream and reality intertwine to create a being who can weave illusions that become reality.',
        requiredPhysiques: ['dream_physique', 'reality_physique'],
        bonuses: {
            dream_reality: 2.5,
            illusion_mastery: 2.2,
            reality_weaving: 2.0,
            dream_manifestation: 1.8,
            subconscious_power: 2.0
        }
    },
    // Light + Darkness = Twilight Sovereign
    {
        id: 'light_darkness_twilight',
        name: 'Twilight Sovereign',
        description: 'Light and darkness combine to create a sovereign who rules over the boundary between day and night.',
        requiredPhysiques: ['light_physique', 'darkness_physique'],
        bonuses: {
            twilight_power: 2.5,
            light_dark_balance: 2.2,
            boundary_mastery: 2.0,
            shadow_light: 1.8,
            twilight_aura: 2.0
        }
    },
    // Fate + Karma = Destiny Weaver
    {
        id: 'fate_karma_destiny',
        name: 'Destiny Weaver',
        description: 'Fate and karma intertwine to create a being who can weave the threads of destiny itself.',
        requiredPhysiques: ['fate_physique', 'karma_physique'],
        bonuses: {
            destiny_manipulation: 2.5,
            karma_mastery: 2.2,
            fate_weaving: 2.0,
            destiny_foresight: 1.8,
            karmic_balance: 2.0
        }
    }
];
// Function to check if a set of physiques has any synergies
function getActiveSynergies(activePhysiques) {
    const activePhysiqueIds = new Set(activePhysiques.map((p) => p.id));
    const activeSynergies = [];
    for (const synergy of exports.PHYSIQUE_SYNERGIES) {
        const hasAllRequired = synergy.requiredPhysiques.every((physiqueId) => activePhysiqueIds.has(physiqueId));
        if (hasAllRequired) {
            activeSynergies.push(synergy);
        }
    }
    return activeSynergies;
}
// Function to calculate total synergy bonuses from active physiques
function calculateSynergyBonuses(activePhysiques) {
    const activeSynergies = getActiveSynergies(activePhysiques);
    const totalBonuses = {};
    for (const synergy of activeSynergies) {
        for (const [bonusType, bonusValue] of Object.entries(synergy.bonuses)) {
            totalBonuses[bonusType] = (totalBonuses[bonusType] || 0) + Number(bonusValue || 0);
        }
    }
    return totalBonuses;
}
// Function to get synergy descriptions for display
function getSynergyDescriptions(activePhysiques) {
    const activeSynergies = getActiveSynergies(activePhysiques);
    return activeSynergies.map(synergy => `${synergy.name}: ${synergy.description}`);
}
// Function to check if a physique combination unlocks a synergy
function checkSynergyUnlock(physiqueIds) {
    for (const synergy of exports.PHYSIQUE_SYNERGIES) {
        const hasAllRequired = synergy.requiredPhysiques.every((physiqueId) => physiqueIds.includes(physiqueId));
        if (hasAllRequired) {
            return synergy;
        }
    }
    return null;
}
