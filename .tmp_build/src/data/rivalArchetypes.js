"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArchetypesByPersonality = exports.getRandomArchetype = exports.getArchetypeById = exports.RIVAL_ARCHETYPES = void 0;
exports.RIVAL_ARCHETYPES = {
    young_prodigy: {
        id: 'young_prodigy',
        name: 'Young Prodigy',
        description: 'A talented young cultivator with exceptional natural talent but limited experience.',
        personality: 'honorable',
        factionBias: ['immortal_court', 'dao_research_institute'],
        sectBias: ['azure_cloud_sect', 'eternal_dao_academy'],
        statTemplate: {
            baseStats: { hp: 180, qi: 220, atk: 25, def: 20, speed: 35 },
            statGrowth: { hp: 12, qi: 15, atk: 8, def: 6, speed: 10 },
            skillFocus: ['comprehension', 'qiControl', 'daoInsight']
        },
        techniques: ['basic_sword_slash', 'qi_blast', 'defensive_stance'],
        specialAbilities: ['talent_boost', 'quick_learning'],
        lootTable: {
            common: [
                { name: 'Basic Spirit Stones', description: 'Low-grade cultivation resource', value: 50 },
                { name: 'Cultivation Notes', description: 'Basic cultivation insights', value: 25 }
            ],
            uncommon: [
                { name: 'Talent Enhancing Pill', description: 'Improves cultivation speed', value: 150 },
                { name: 'Young Prodigy Manual', description: 'Beginner cultivation techniques', value: 200 }
            ],
            rare: [
                { name: 'Heavenly Talent Crystal', description: 'Rare talent enhancement item', value: 500 },
                { name: 'Prodigy Inheritance', description: 'Ancient cultivation secrets', value: 800 }
            ]
        },
        growthPotential: {
            maxLevel: 60,
            breakthroughChance: 0.8,
            evolutionPaths: ['genius_cultivator', 'sect_elder']
        },
        dialogueThemes: ['aspiration', 'rivalry', 'growth'],
        motivations: ['Prove superiority', 'Master cultivation', 'Gain recognition']
    },
    battle_hardened_warrior: {
        id: 'battle_hardened_warrior',
        name: 'Battle-Hardened Warrior',
        description: 'A seasoned fighter who has survived countless battles and tribulations.',
        personality: 'aggressive',
        factionBias: ['shadow_thieves_guild', 'mercenary_guild'],
        sectBias: ['blood_moon_sect', 'iron_fist_sect'],
        statTemplate: {
            baseStats: { hp: 300, qi: 180, atk: 45, def: 40, speed: 25 },
            statGrowth: { hp: 18, qi: 8, atk: 12, def: 10, speed: 6 },
            skillFocus: ['combatSkills', 'bodyTempering', 'mentalFortitude']
        },
        techniques: ['fierce_strike', 'iron_body', 'battle_aura'],
        specialAbilities: ['combat_instinct', 'wound_resistance', 'battle_hardening'],
        lootTable: {
            common: [
                { name: 'Battle Scars', description: 'Marks of combat experience', value: 30 },
                { name: 'Weapon Fragments', description: 'Remnants of powerful weapons', value: 75 }
            ],
            uncommon: [
                { name: 'Combat Manual', description: 'Battle techniques and strategies', value: 250 },
                { name: 'Tempered Body Pill', description: 'Enhances physical resilience', value: 180 }
            ],
            rare: [
                { name: 'War God Essence', description: 'Ancient battle inheritance', value: 600 },
                { name: 'Legendary Weapon Shard', description: 'Piece of a mythical weapon', value: 1000 }
            ]
        },
        growthPotential: {
            maxLevel: 80,
            breakthroughChance: 0.6,
            evolutionPaths: ['war_lord', 'battle_sage']
        },
        dialogueThemes: ['combat', 'survival', 'honor'],
        motivations: ['Test strength', 'Seek worthy opponents', 'Protect the weak']
    },
    cunning_manipulator: {
        id: 'cunning_manipulator',
        name: 'Cunning Manipulator',
        description: 'A shrewd individual who uses wit and deception to achieve their goals.',
        personality: 'cunning',
        factionBias: ['shadow_thieves_guild', 'merchant_alliance'],
        sectBias: ['hidden_shadow_sect', 'scheming_spider_sect'],
        statTemplate: {
            baseStats: { hp: 200, qi: 160, atk: 20, def: 25, speed: 40 },
            statGrowth: { hp: 10, qi: 12, atk: 6, def: 8, speed: 14 },
            skillFocus: ['socialSkills', 'mentalFortitude', 'cunning']
        },
        techniques: ['shadow_step', 'illusion_technique', 'mind_confusion'],
        specialAbilities: ['deception_mastery', 'information_network', 'trap_setting'],
        lootTable: {
            common: [
                { name: 'Information Scroll', description: 'Gossip and secrets', value: 40 },
                { name: 'Disguise Kit', description: 'Tools for deception', value: 60 }
            ],
            uncommon: [
                { name: 'Scheming Manual', description: 'Strategies and manipulation techniques', value: 220 },
                { name: 'Truth Serum', description: 'Forces honesty from targets', value: 160 }
            ],
            rare: [
                { name: 'Shadow Emperor Inheritance', description: 'Master of deception and intrigue', value: 700 },
                { name: 'Reality Warping Mirror', description: 'Creates powerful illusions', value: 900 }
            ]
        },
        growthPotential: {
            maxLevel: 70,
            breakthroughChance: 0.7,
            evolutionPaths: ['shadow_emperor', 'master_manipulator']
        },
        dialogueThemes: ['deception', 'ambition', 'manipulation'],
        motivations: ['Gain power through influence', 'Uncover hidden truths', 'Control the narrative']
    },
    righteous_judge: {
        id: 'righteous_judge',
        name: 'Righteous Judge',
        description: 'A stern enforcer of justice who upholds moral and ethical standards.',
        personality: 'honorable',
        factionBias: ['immortal_court', 'justice_league'],
        sectBias: ['righteous_sword_sect', 'heavenly_justice_sect'],
        statTemplate: {
            baseStats: { hp: 250, qi: 280, atk: 35, def: 35, speed: 30 },
            statGrowth: { hp: 15, qi: 16, atk: 10, def: 10, speed: 8 },
            skillFocus: ['daoInsight', 'mentalFortitude', 'socialSkills']
        },
        techniques: ['justice_strike', 'divine_judgment', 'righteous_aura'],
        specialAbilities: ['moral_compass', 'justice_sense', 'karma_manipulation'],
        lootTable: {
            common: [
                { name: 'Justice Token', description: 'Symbol of righteous authority', value: 45 },
                { name: 'Karma Beads', description: 'Measures moral alignment', value: 55 }
            ],
            uncommon: [
                { name: 'Judgment Manual', description: 'Techniques of righteous combat', value: 240 },
                { name: 'Purification Pill', description: 'Cleanses negative karma', value: 170 }
            ],
            rare: [
                { name: 'Heavenly Justice Seal', description: 'Summons divine judgment', value: 650 },
                { name: 'Karma Emperor Inheritance', description: 'Master of moral law', value: 850 }
            ]
        },
        growthPotential: {
            maxLevel: 75,
            breakthroughChance: 0.75,
            evolutionPaths: ['karma_emperor', 'divine_judge']
        },
        dialogueThemes: ['justice', 'morality', 'duty'],
        motivations: ['Enforce justice', 'Punish the wicked', 'Protect the innocent']
    },
    demonic_cultivator: {
        id: 'demonic_cultivator',
        name: 'Demonic Cultivator',
        description: 'A practitioner of forbidden demonic arts, seeking power through dark means.',
        personality: 'treacherous',
        factionBias: ['demonic_alliance', 'shadow_thieves_guild'],
        sectBias: ['blood_moon_sect', 'demonic_path_sect'],
        statTemplate: {
            baseStats: { hp: 280, qi: 200, atk: 40, def: 30, speed: 28 },
            statGrowth: { hp: 16, qi: 14, atk: 11, def: 9, speed: 7 },
            skillFocus: ['qiControl', 'mentalFortitude', 'demonicArts']
        },
        techniques: ['blood_sacrifice', 'demonic_flames', 'soul_devouring'],
        specialAbilities: ['dark_empowerment', 'pain_resistance', 'fear_aura'],
        lootTable: {
            common: [
                { name: 'Demonic Essence', description: 'Dark cultivation resource', value: 35 },
                { name: 'Cursed Artifact', description: 'Item tainted by dark energy', value: 65 }
            ],
            uncommon: [
                { name: 'Demonic Manual', description: 'Forbidden cultivation techniques', value: 260 },
                { name: 'Blood Crystal', description: 'Concentrated life force', value: 190 }
            ],
            rare: [
                { name: 'Devil Emperor Inheritance', description: 'Master of demonic arts', value: 750 },
                { name: 'Soul Devouring Cauldron', description: 'Ancient demonic treasure', value: 950 }
            ]
        },
        growthPotential: {
            maxLevel: 85,
            breakthroughChance: 0.65,
            evolutionPaths: ['devil_emperor', 'dark_sovereign']
        },
        dialogueThemes: ['power', 'forbidden_knowledge', 'domination'],
        motivations: ['Attain ultimate power', 'Break free from restrictions', 'Rule through fear']
    },
    scholarly_recluse: {
        id: 'scholarly_recluse',
        name: 'Scholarly Recluse',
        description: 'A reclusive scholar who has dedicated their life to the pursuit of knowledge.',
        personality: 'neutral',
        factionBias: ['dao_research_institute', 'hermit_alliance'],
        sectBias: ['eternal_dao_academy', 'scholarly_retreat'],
        statTemplate: {
            baseStats: { hp: 160, qi: 320, atk: 15, def: 20, speed: 20 },
            statGrowth: { hp: 8, qi: 18, atk: 4, def: 6, speed: 5 },
            skillFocus: ['comprehension', 'daoInsight', 'meditation']
        },
        techniques: ['knowledge_projection', 'reality_analysis', 'scholarly_defense'],
        specialAbilities: ['vast_knowledge', 'analytical_mind', 'wisdom_aura'],
        lootTable: {
            common: [
                { name: 'Ancient Scroll', description: 'Fragment of ancient knowledge', value: 50 },
                { name: 'Research Notes', description: 'Scholarly observations', value: 40 }
            ],
            uncommon: [
                { name: 'Dao Comprehension Manual', description: 'Advanced philosophical texts', value: 230 },
                { name: 'Wisdom Pill', description: 'Enhances mental faculties', value: 175 }
            ],
            rare: [
                { name: 'Sage Emperor Inheritance', description: 'Master of wisdom and knowledge', value: 680 },
                { name: 'Reality Comprehending Mirror', description: 'Reveals hidden truths', value: 880 }
            ]
        },
        growthPotential: {
            maxLevel: 90,
            breakthroughChance: 0.85,
            evolutionPaths: ['sage_emperor', 'enlightened_one']
        },
        dialogueThemes: ['knowledge', 'enlightenment', 'philosophy'],
        motivations: ['Uncover universal truths', 'Share wisdom with worthy disciples', 'Achieve enlightenment']
    }
};
const getArchetypeById = (id) => {
    return exports.RIVAL_ARCHETYPES[id] || null;
};
exports.getArchetypeById = getArchetypeById;
const getRandomArchetype = (factionBias, sectBias) => {
    const archetypes = Object.values(exports.RIVAL_ARCHETYPES);
    // Validate that archetypes exist
    if (archetypes.length === 0) {
        console.error('No archetypes available in RIVAL_ARCHETYPES');
        return null;
    }
    // Filter by faction/sect bias if provided
    let filteredArchetypes = archetypes;
    if (factionBias?.length) {
        filteredArchetypes = archetypes.filter(archetype => archetype.factionBias.some(faction => factionBias.includes(faction)));
    }
    if (sectBias?.length) {
        filteredArchetypes = filteredArchetypes.filter(archetype => archetype.sectBias.some(sect => sectBias.includes(sect)));
    }
    // Fallback to all archetypes if no matches
    if (filteredArchetypes.length === 0) {
        console.warn('No archetypes match the provided filters, using all archetypes as fallback');
        filteredArchetypes = archetypes;
    }
    // Ensure we have at least one archetype
    if (filteredArchetypes.length === 0) {
        console.error('No archetypes available after filtering');
        return null;
    }
    return filteredArchetypes[Math.floor(Math.random() * filteredArchetypes.length)];
};
exports.getRandomArchetype = getRandomArchetype;
const getArchetypesByPersonality = (personality) => {
    return Object.values(exports.RIVAL_ARCHETYPES).filter(archetype => archetype.personality === personality);
};
exports.getArchetypesByPersonality = getArchetypesByPersonality;
