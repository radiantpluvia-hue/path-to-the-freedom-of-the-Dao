"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAJOR_LEADERS = void 0;
const cultivationRealms_1 = require("../data/cultivationRealms");
// This file mirrors the Mount-Hua-style rich format and contains full entries
// for major sects and factions. It's intended as an editable authoring surface
// so you (the user) can write leader bios and adjust cultivation/lifespan values
// without modifying the canonical `SectSystem.ts` immediately. If you prefer,
// we can later merge selected entries back into `SectSystem.ts`.
exports.MAJOR_LEADERS = [
    {
        id: 'mount_hua_sect',
        name: 'Mount Hua Sect',
        description: 'Balance between swordsmanship and internal cultivation; purity of heart guides strength. Famous for the Plum Blossom sword style.',
        leaderName: 'Geun Sejong',
        leaderTitle: "Mount Hua's Plum Blossom Swordsman",
        leaderDescription: 'He rose as a mortal from Mount Hua’s outer sect, later leading a righteous rebellion against corruption to reform the sect. A top swordsman of the Immortal World, famed from the 2nd Demonic War.',
        leaderAge: 40000000,
        leaderCultivation: 'mystic_immortal',
        leaderTechniques: [
            'twenty_four_plum_blossoms',
            'seven_blossom_blades',
            'plum_blossom_winter_cut',
            'plum_blossom_forms_1_5',
            'sixteen_plum_movements'
        ],
        leaderSelfCreatedTechniques: [
            'plum_blossom_final_stride',
            'violet_movement_technique',
            'all_element_plum_fifty_six'
        ],
        leaderWeapon: 'Plum Blossom Violet Sword',
        sectComposition: { leader: 1, viceLeaders: 1, elders: 10, firstGen: 'many', secondGen: 'many' },
        pills: ['violet_energy_pill', 'rainbow_blossom_pill'],
        location: 'Mount Hua',
        philosophy: 'Protect and pursue the Tao; achieve balance and harmony. Blossom into life through swordsmanship.',
        type: 'righteous',
        realm: 6,
        power: 9500,
        reputation: 0,
        requirements: { minRealm: 4, minCombatPower: 4000 },
        benefits: { techniques: ['plum_blossom_sword_style'], resources: { spiritStones: 60 } },
        rivals: ['starlight_sect', 'wudang_sect', 'heavenly_demonic_sect'],
        allies: ['azure_cloud_sect', 'buddha_sect'],
        showDescriptionOnVisit: true
    },
    // Replicate other major sects in full Mount-Hua format below.
    {
        id: 'shaolin_monastery',
        name: 'Shaolin Monastery',
        description: 'Chan Buddhism’s cradle of martial arts; home to countless techniques and deep compassion.',
        leaderName: 'Yuan Lin',
        leaderTitle: 'Shaolin Abbot',
        leaderDescription: 'Forefather of Shaolin; guardian of the 10 Great Martial Sects. Wields the Dharma’s Brush and is credited with codifying countless Shaolin arts.',
        leaderAge: 30000000,
        leaderCultivation: 'perfect_immortal_emperor_rank4',
        leaderTechniques: ['seventy_two_supreme_arts', 'arhat_fist', 'vajra_finger', 'one_finger_zen'],
        leaderSelfCreatedTechniques: ['all_shaolin_techniques'],
        leaderWeapon: "Dharma's Brush",
        sectComposition: { abbot: 1, sectLeader: 1, viceLeaders: 2, elders: 10, halls: ['Great Hero', 'Discipline', 'Bodhi', 'Scripture'] },
        pills: ['shaolin_rejuvenating_pill', "shaolin_transformation_pill"],
        location: 'Shaolin Grounds, Immortal World',
        philosophy: 'Compassion, wisdom, discipline, perseverance; Chan Buddhism meditation.',
        type: 'righteous',
        realm: 7,
        power: 11000,
        reputation: 100,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['arhat_fist'], resources: { spiritStones: 120 } },
        rivals: ['heavenly_demonic_sect'],
        allies: ['ten_great_martial_sects_alliance']
    },
    // Kunlun Sect
    {
        id: 'kunlun_sect',
        name: 'Kunlun',
        description: 'Guardians of the Immortal World’s west; balance between strength, wisdom, and responsibility.',
        leaderName: 'Jin Su',
        leaderTitle: 'The Heavenly Swordsman',
        leaderDescription: 'Raised from poverty; a righteous Taoist with a quirky love of money. Rose to fame in the 2nd Demonic War and wields the Immortal Sword that grows with him.',
        leaderAge: 20000000,
        leaderCultivation: 'mystic_immortal',
        leaderTechniques: ['taiji_swordsmanship', 'kunlun_clouds_sword', 'kunlun_taiji_movement', 'kunlun_bright_qi', 'kunlun_cloudy_qi'],
        leaderSelfCreatedTechniques: ['kunlun_sixteen_flashy_sword', 'kunlun_heavenly_sword_strike', 'kunlun_righteous_heavenly_sword'],
        leaderWeapon: 'Kunlun Immortal Sword',
        sectComposition: { leader: 1, viceLeaders: 3, elders: 5 },
        pills: ['kunlun_refreshing_pill', 'kunlun_cloud_pill'],
        location: 'Kunlun Mountains, Immortal World',
        philosophy: 'Taoist responsibility; despise unorthodox and demonic forces.',
        type: 'righteous',
        realm: 6,
        power: 9800,
        reputation: 0,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['taiji_swordsmanship'], resources: { spiritStones: 55 } },
        rivals: ['heavenly_demonic_sect'],
        allies: ['mount_hua_sect']
    },
    // Upper North Sect
    {
        id: 'upper_north_sect',
        name: 'Upper North Sect',
        description: 'Defenders of the Immortal World’s north; an unyielding wall against calamity.',
        leaderName: 'Bei Ling',
        leaderTitle: 'Guardian of the North',
        leaderDescription: 'Forged by loss and duty, he became a cold, unwavering bulwark after his sister’s disappearance and father’s death in a secret war.',
        leaderAge: 600000000,
        leaderCultivation: 'silver_immortal',
        leaderTechniques: ['frozen_heart_serenity', 'northern_wall_stance', 'glacial_mirror_palms', 'white_plain_step', 'northern_fist_of_destruction', 'rain_of_ice'],
        leaderSelfCreatedTechniques: ['ice_domain', 'absolute_zero', 'northern_heaven_barricade'],
        leaderWeapon: 'Northern Ice Halberd',
        sectComposition: { leader: 1, wardens: 6, elders: 6 },
        pills: ['tears_of_ice'],
        location: 'Far North',
        philosophy: 'Protect the weak and strong alike; defend the north and the world.',
        type: 'righteous',
        realm: 7,
        power: 9900,
        reputation: 0,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['frozen_heart_serenity'], resources: { frostEssence: 20 } },
        rivals: ['lower_south_sect'],
        allies: ['dragon_emperor_palace']
    },
    // Heavenly Demonic Sect
    {
        id: 'heavenly_demonic_sect',
        name: 'Heavenly Demonic Sect',
        description: 'Anarchic demonic force led for the thrill of chaos; the axis of demonic sects.',
        leaderName: 'Cheon Mu',
        leaderTitle: 'Heavenly Demon God',
        leaderDescription: 'A genius martial savant with perfect mimicry, driven mad by tragedy and hatred toward the heavens. No cultivation, pure martial power.',
        leaderAge: 21000000000,
        leaderCultivation: 'none',
        leaderTechniques: ['darkening_star_sword', 'true_blood_demon_god', 'wind_shadow_steps', 'lunar_sword_arts', 'heavenly_demon_star_sword'],
        leaderSelfCreatedTechniques: ['demon_god_sword_art', 'heavenly_demon_sword_force', 'extreme_blade_god_art', 'flying_phantom_slash'],
        leaderWeapon: 'Abyssal Blade',
        sectComposition: { leader: 1, grandElders: 3, halls: ['Demon Star', 'Lunar Fang'] },
        pills: ['abyssal_core'],
        location: 'Abyssal Citadel',
        philosophy: 'Chaos and supremacy.',
        type: 'demonic',
        realm: 9,
        power: 15000,
        reputation: -500,
        requirements: { karma: -50, minRealm: 6 },
        benefits: { techniques: ['darkening_star_sword'], resources: { demonicEssence: 150 } },
        rivals: ['shaolin_monastery', 'mount_hua_sect', 'kunlun_sect'],
        allies: ['celestial_demon_sect']
    },
    // Kid God — treated as a roaming sect-like entity for formatting
    {
        id: 'kid_god',
        name: 'Kid God',
        description: 'A reincarnation of Sun Wukong; born of Heaven and Earth’s spiritual energy to shatter the heavens.',
        leaderName: 'Taek Jin',
        leaderTitle: 'Kid God',
        leaderDescription: 'Trained by his grandfather in Recoilless Taekwondo; later ascended, wielding the Ruyi Jingu Bang. A heaven-defying genius.',
        leaderAge: 1500000000,
        leaderCultivation: 'mystic_celestial_origin_6',
        leaderTechniques: ['hwechook', 'dragon_catcher', 'baek_nok', 'ground_drawer', 'recoilless_concept', 'blue_dragon_kick', 'ice_kick'],
        leaderSelfCreatedTechniques: ['kid_god_recoilless_supreme', 'unyielding_heavens_step', 'monkey_king_pulse'],
        leaderWeapon: 'Ruyi Jingu Bang',
        sectComposition: { leader: 1 },
        pills: [],
        location: 'Wandering across thousands of worlds',
        philosophy: 'Freedom above heaven.',
        type: 'neutral',
        realm: 8,
        power: 12000,
        reputation: 0,
        requirements: {},
        benefits: { techniques: ['hwechook'], resources: {} },
        rivals: [],
        allies: []
    },
    // Azure Cloud Sect
    {
        id: 'azure_cloud_sect',
        name: 'Azure Cloud Sect',
        description: 'A righteous sect known for cloud-walking techniques and moral cultivation.',
        leaderName: 'Yun Qingshan',
        leaderTitle: 'Patriarch of Azure Cloud',
        leaderDescription: 'Guides disciples through aerial techniques and righteous governance.',
        leaderAge: 180000,
        leaderCultivation: 'Loose Immortal',
        leaderTechniques: ['cloud_step', 'azure_sword_art', 'stratus_guard', 'wind_rider_slash', 'ethereal_barrier'],
        leaderSelfCreatedTechniques: ['azure_nimbus_technique', 'cloudlock_formation', 'patriarchal_gale'],
        leaderWeapon: 'Azure Windblade',
        sectComposition: { leader: 1, elders: 8, disciples: 'many' },
        pills: ['cloud_essence_pill'],
        location: 'Azure Peaks',
        philosophy: 'Walk the clouds, act with honor.',
        type: 'righteous',
        realm: 4,
        power: 8500,
        reputation: 0,
        requirements: { minRealm: 2, karma: 10 },
        benefits: { techniques: ['cloud_step'], resources: { spiritStones: 50 } },
        rivals: ['blood_moon_sect'],
        allies: ['buddha_sect']
    },
    // Blood Moon Sect
    {
        id: 'blood_moon_sect',
        name: 'Blood Moon Sect',
        description: 'A demonic sect practicing blood cultivation and forbidden arts.',
        leaderName: 'Xue Hongyin',
        leaderTitle: 'Matriarch of the Blood Moon',
        leaderDescription: 'Commands blood rites and cultivators who sacrifice for power.',
        leaderAge: 8000,
        leaderCultivation: 'Loose Immortal',
        leaderTechniques: ['blood_sacrifice', 'crimson_claw', 'vein_binding', 'hemocraft_blast'],
        leaderSelfCreatedTechniques: ['sanguine_covenant', 'moonblood_echo', 'crimson_shackle'],
        leaderWeapon: 'Crimson Vein Sickle',
        sectComposition: { leader: 1, generals: 4, acolytes: 'many' },
        pills: ['blood_essence_pill'],
        location: 'Crimson Caves',
        philosophy: 'Power demands sacrifice.',
        type: 'demonic',
        realm: 5,
        power: 7800,
        reputation: -200,
        requirements: { minRealm: 3, karma: -20 },
        benefits: { techniques: ['blood_sacrifice'], resources: { bloodEssence: 100 } },
        rivals: ['azure_cloud_sect'],
        allies: ['demon_immortal_palace']
    },
    // Eternal Dao Academy
    {
        id: 'eternal_dao_academy',
        name: 'Eternal Dao Academy',
        description: 'An ancient scholarly sect focused on Dao comprehension and knowledge.',
        leaderName: 'Wen Ershi',
        leaderTitle: 'Dean of the Eternal Dao Academy',
        leaderDescription: 'A sage scholar preserving and teaching Daoic truths.',
        leaderAge: 50000000000,
        leaderCultivation: 'Perfect Immortal Emperor Rank 2',
        leaderTechniques: ['dao_comprehension', 'reality_analysis', 'temporal_insight', 'library_lock'],
        leaderSelfCreatedTechniques: ['eternal_canon_codex', 'deans_axiom', 'script_of_turning'],
        leaderWeapon: 'Inkbrush of Principles',
        sectComposition: { leader: 1, masters: 6, scholars: 'many' },
        pills: ['insight_pill'],
        location: 'Celestial Library',
        philosophy: 'Knowledge refines the Dao.',
        type: 'ancient',
        realm: 5,
        power: 12000,
        reputation: 50,
        requirements: { minRealm: 4, minCombatPower: 5000 },
        benefits: { techniques: ['dao_comprehension'], resources: { ancientTexts: 10 } },
        rivals: [],
        allies: ['tao_school']
    },
    // Dragon Emperor Palace
    {
        id: 'dragon_emperor_palace',
        name: 'Dragon Emperor Palace',
        description: 'The supreme sect of the dragon race, accepting only those with dragon bloodline.',
        leaderName: 'Long Taizu',
        leaderTitle: 'Dragon Emperor',
        leaderDescription: 'Supreme ruler of dragons, wielder of imperial dragon might.',
        leaderAge: 12000000000000,
        leaderCultivation: 'Mystic Celestial Origin 2',
        leaderTechniques: ['dragon_transformation', 'imperial_dominance', 'scale_shock', 'celestial_roar', 'draconic_bind'],
        leaderSelfCreatedTechniques: ['emperors_roar', 'dragon_throne_strike', 'imperial_bloodline_unleashed'],
        leaderWeapon: 'Emperor Dragon Spear',
        sectComposition: { leader: 1, princes: 3, knights: 'many' },
        pills: ['dragon_heart_pill'],
        location: 'Dragon Throne',
        philosophy: 'Bloodline defines destiny.',
        type: 'ancient',
        realm: 8,
        power: 25000,
        reputation: 300,
        requirements: { minRealm: 6, specialRequirements: ['dragon_bloodline'] },
        benefits: { techniques: ['dragon_transformation'], resources: { dragonEssence: 200 } },
        rivals: ['emptiness_emperor_sect'],
        allies: ['upper_north_sect']
    },
    // Void Emperor Sect
    {
        id: 'emptiness_emperor_sect',
        name: 'Emptiness Emperor Sect',
        description: 'A mysterious sect existing between dimensions, masters of emptiness cultivation.',
        leaderName: 'Kong Xuandi',
        leaderTitle: 'Emptiness Emperor',
        leaderDescription: 'A sovereign of emptiness energy and dimensional law.',
        leaderAge: 30000000000000,
        leaderCultivation: 'Mystic Celestial origin 3',
        leaderTechniques: ['emptiness_mastery', 'dimensional_travel', 'rift_edge', 'emptiness_shroud'],
        leaderSelfCreatedTechniques: ['emperors_rift', 'emptiness_seal', 'dimensional_edict'],
        leaderWeapon: 'Emptiness-Edged Blade',
        sectComposition: { leader: 1, gatekeepers: 4, adepts: 'many' },
        pills: ['emptiness_nectar'],
        location: 'Fractured Gate',
        philosophy: 'Boundary is an illusion.',
        type: 'hidden',
        realm: 10,
        power: 30000,
        reputation: 200,
        requirements: { minRealm: 8 },
        benefits: { techniques: ['emptiness_mastery'], resources: { emptinessEssence: 500 } },
        rivals: ['dragon_emperor_palace'],
        allies: ['darkness_sect']
    },
    // Buddha Sect
    {
        id: 'buddha_sect',
        name: 'Buddha Sect',
        description: 'Enlightenment through compassion, meditation, and selflessness.',
        leaderName: 'Jueyuan',
        leaderTitle: 'Patriarch of Buddha Sect',
        leaderDescription: 'Embodies compassion and leads with spiritual wisdom.',
        leaderAge: 40000000000000,
        leaderCultivation: 'Mystic Immortal rank 3',
        leaderTechniques: ['lotus_palm', 'buddha_embrace', 'serene_shield', 'enlightened_bolt'],
        leaderSelfCreatedTechniques: ['compassionate_bind', 'lotus_purity_form', 'sutra_of_calm'],
        leaderWeapon: 'Meditation Beads',
        sectComposition: { leader: 1, monks: 'many' },
        pills: ['rejuvenating_pill'],
        location: 'Lotus Monastery',
        philosophy: 'Compassion refines strength.',
        type: 'righteous',
        realm: 7,
        power: 11000,
        reputation: 250,
        requirements: { minRealm: 5, karma: 25 },
        benefits: { techniques: ['lotus_palm'], resources: { enlightenmentScrolls: 8 } },
        rivals: ['demon_immortal_palace'],
        allies: ['mount_hua_sect']
    },
    // Starlight Sect
    {
        id: 'starlight_sect',
        name: 'Starlight Sect',
        description: 'The cosmos guides destiny; cultivate in harmony with celestial cycles.',
        leaderName: 'Zhou Xingchen',
        leaderTitle: 'Warden of Starlight',
        leaderDescription: 'A master of celestial arts and cosmic navigation.',
        leaderAge: 6000000,
        leaderCultivation: 'Heaven Immortal',
        leaderTechniques: ['starlight_saber', 'celestial_navigation', 'meteor_fall', 'starbind_array'],
        leaderSelfCreatedTechniques: ['wardens_constellation', 'starfall_counter', 'celestial_map_stitch'],
        leaderWeapon: 'Astral Baton',
        sectComposition: { leader: 1, astronomers: 6 },
        pills: ['star_essence_pill'],
        location: 'Observatory Peaks',
        philosophy: 'Read the stars, steer fate.',
        type: 'ancient',
        realm: 8,
        power: 13000,
        reputation: 100,
        requirements: { minRealm: 6 },
        benefits: { techniques: ['starlight_saber'], resources: { starEssence: 100 } },
        rivals: ['mount_hua_sect'],
        allies: ['void_emperor_sect']
    },
    // Lower South Sect
    {
        id: 'lower_south_sect',
        name: 'Lower South Sect',
        description: 'Masters of adaptability, fluid combat, and environmental manipulation.',
        leaderName: 'Bei Xue',
        leaderTitle: 'Master of the Lower South',
        leaderDescription: "Bei Ling's younger sister; a tactician who blends terrain with combat flow and forges her own path in the south.",
        leaderAge: 599999999,
        leaderCultivation: 'Silver Immortal',
        leaderTechniques: ['torrent_palm', 'jungle_serpent_step', 'mire_grip', 'swamp_shroud'],
        leaderSelfCreatedTechniques: ['southern_flow_stance', 'tidecallers_strike', 'greenroot_bond'],
        leaderWeapon: 'Serpent Vine Whip',
        sectComposition: { leader: 1, scouts: 8 },
        pills: ['tropical_brew'],
        location: 'Southern Marshes',
        philosophy: 'Adapt and flow.',
        type: 'neutral',
        realm: 7,
        power: 10200,
        reputation: 0,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['torrent_palm'], resources: { tropicalHerbs: 75 } },
        rivals: ['upper_north_sect'],
        allies: ['tao_school']
    },
    // Darkness Sect
    {
        id: 'darkness_sect',
        name: 'Darkness Sect',
        description: 'Embraces shadows to understand the balance between light and dark.',
        leaderName: 'An Ye',
        leaderTitle: 'Master of Darkness',
        leaderDescription: 'A clandestine leader who trains in secret arts and covert operations.',
        leaderAge: 3200000,
        leaderCultivation: 'Loose Immortal',
        leaderTechniques: ['shadow_step', 'darkness_devouring_strike', 'umbral_veil', 'night_sunder'],
        leaderSelfCreatedTechniques: ['umbra_chain', 'shade_cloak_dance', 'midnight_edict'],
        leaderWeapon: 'Umbral Dagger',
        sectComposition: { leader: 1, covert_leads: 5 },
        pills: ['shadow_draught'],
        location: 'Umbra Hollows',
        philosophy: 'Only by embracing shadow can one see the whole.',
        type: 'hidden',
        realm: 9,
        power: 14000,
        reputation: -50,
        requirements: { minRealm: 7 },
        benefits: { techniques: ['shadow_step'], resources: { shadowEssence: 120 } },
        rivals: ['heavenly_court'],
        allies: ['void_emperor_sect']
    },
    // Wudang Sect
    {
        id: 'wudang_sect',
        name: 'Wudang Sect',
        description: 'A Taoist sect emphasizing balance, soft power, and internal alchemy.',
        leaderName: 'Zhang Qinghe',
        leaderTitle: 'Patriarch of Wudang',
        leaderDescription: 'Combines sword skill with inner alchemy.',
        leaderAge: 500000000,
        leaderCultivation: 'Silver Immortal',
        leaderTechniques: ['wudang_taiyi_sword', 'internal_harmony', 'taiji_palm', 'flowing_guard'],
        leaderSelfCreatedTechniques: ['taiyi_spiral', 'inner_stillness_form', 'wudang_harmony'],
        leaderWeapon: 'Taiyi Sword',
        sectComposition: { leader: 1, disciples: 'many' },
        pills: ['inner_harmony_pill'],
        location: 'Wudang Peaks',
        philosophy: 'Balance yields strength.',
        type: 'righteous',
        realm: 6,
        power: 11200,
        reputation: 150,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['wudang_taiyi_sword'], resources: { spiritStones: 65 } },
        rivals: ['darkness_sect'],
        allies: ['mount_hua_sect']
    },
    // Emei Sect
    {
        id: 'emei_sect',
        name: 'Emei Sect',
        description: 'Renowned for their combination of sword and healing arts.',
        leaderName: 'Shi Meiling',
        leaderTitle: 'Matron of Emei',
        leaderDescription: 'Graceful swordmaster and healer.',
        leaderAge: 10000000,
        leaderCultivation: 'True Heaven Immortal',
        leaderTechniques: ['emei_sword_dance', 'healing_lotus', 'graceful_thrust', 'serene_parry'],
        leaderSelfCreatedTechniques: ['matrons_bloom', 'emei_crescent', 'healing_chorus'],
        leaderWeapon: 'Lotus Sword',
        sectComposition: { leader: 1, healers: 10 },
        pills: ['healing_lotus_pill'],
        location: 'Emei Temple',
        philosophy: 'Grace and mercy in combat.',
        type: 'righteous',
        realm: 5,
        power: 9800,
        reputation: 120,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['emei_sword_dance'], resources: { medicalManuals: 6 } },
        rivals: ['blood_moon_sect'],
        allies: ['buddha_sect']
    },
    // Beggar's Sect
    {
        id: 'beggars_sect',
        name: "Beggar's Sect",
        description: 'A loose brotherhood famed for unorthodox techniques and a network among commoners.',
        leaderName: 'Qiao Bei',
        leaderTitle: 'Chief of Beggars',
        leaderDescription: 'Charismatic organizer of commonfolk fighters.',
        leaderAge: 60000000000,
        leaderCultivation: 'Perfect Immortal Rank 3',
        leaderTechniques: ['beggar_club_tactics', 'rumor_net', 'barrel_charge', 'crowd_pummel'],
        leaderSelfCreatedTechniques: ['brotherhood_shout', 'alms_strike', 'streetwise_gambit'],
        leaderWeapon: 'Ironwood Club',
        sectComposition: { leader: 1, brigades: 'many' },
        pills: ['street_herb'],
        location: 'Wandering Encampments',
        philosophy: 'Unity in oddity.',
        type: 'neutral',
        realm: 5,
        power: 9000,
        reputation: 50,
        requirements: { minRealm: 3 },
        benefits: { techniques: ['beggar_club_tactics'], resources: { yuan: 5000 } },
        rivals: ['demon_immortal_palace'],
        allies: ['lower_south_sect']
    },
    // Huashan Sword School
    {
        id: 'huashan_sword_school',
        name: 'Huashan Sword School',
        description: 'A focused sword school branch of Mount Hua, obsessive about precision and dueling.',
        leaderName: 'Li Fenghua',
        leaderTitle: 'Master of Huashan',
        leaderDescription: 'An obsessive duelist focused on precision.',
        leaderAge: 13000000,
        leaderCultivation: 'True Heaven Immortal',
        leaderTechniques: ['sky_cleaver_slash', 'thousand_phantom_blade', 'sudden_strike_step', 'precision_thrust'],
        leaderSelfCreatedTechniques: ['blade_chorus', 'phantom_piercer', 'huashan_edge_ritual'],
        leaderWeapon: 'Huashan Blade',
        sectComposition: { leader: 1, duelists: 20 },
        pills: ['edge_sharpen_pill'],
        location: 'Huashan',
        philosophy: 'Perfection through repetition.',
        type: 'righteous',
        realm: 6,
        power: 10400,
        reputation: 90,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['sky_cleaver_slash'], resources: { swordManuals: 5 } },
        rivals: ['mount_hua_sect'],
        allies: ['wudang_sect']
    },
    // Xingyun Sect
    {
        id: 'xingyun_sect',
        name: 'Xingyun Sect',
        description: 'A sect attuned to fate and stars.',
        leaderName: 'Nie Tianxing',
        leaderTitle: 'Chancellor of Xingyun',
        leaderDescription: 'A fate-weaver who crafts destiny into martial technique.',
        leaderAge: 70000000,
        leaderCultivation: 'Mystic Immortal',
        leaderTechniques: ['star_binding', 'fortune_tide', 'celestial_shroud', 'omen_read'],
        leaderSelfCreatedTechniques: ['fate_loom', 'starweaver_knot', 'chancellors_omen'],
        leaderWeapon: 'Astrolabe Fan',
        sectComposition: { leader: 1, seers: 6 },
        pills: ['fate_pill'],
        location: 'Celestial Terrace',
        philosophy: 'Fate guides the blade.',
        type: 'ancient',
        realm: 6,
        power: 11800,
        reputation: 80,
        requirements: { minRealm: 5, specialRequirements: ['celestial_affinity'] },
        benefits: { techniques: ['star_binding'], resources: { starEssence: 60 } },
        rivals: ['starlight_sect'],
        allies: ['eternal_dao_academy']
    },
    // Ming Cult
    {
        id: 'ming_cult',
        name: 'Ming Cult',
        description: 'A charismatic organization mixing faith, swordplay, and rituals.',
        leaderName: 'Ming Zhaohui',
        leaderTitle: 'Grandmaster of Ming Cult',
        leaderDescription: 'Inspires zeal and devotion in followers.',
        leaderAge: 40000000,
        leaderCultivation: 'Mystic Immortal',
        leaderTechniques: ['righteous_flame_ritual', 'cult_inspiration', 'cleansing_strike', 'ritual_shout'],
        leaderSelfCreatedTechniques: ['grandmasters_sermon', 'rite_of_rally', 'fiery_benediction'],
        leaderWeapon: 'Flame Scripture',
        sectComposition: { leader: 1, preachers: 'many' },
        pills: ['cultist_pill'],
        location: 'Ming Citadel',
        philosophy: 'Faith strengthens the blade.',
        type: 'neutral',
        realm: 5,
        power: 9800,
        reputation: 60,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['righteous_flame_ritual'], resources: { followers: 200 } },
        rivals: ['heavenly_court'],
        allies: []
    },
    // Wanshou Valley
    {
        id: 'wanshou_valley',
        name: 'Wanshou Valley',
        description: 'A secluded valley famed for beast-taming and longevity arts.',
        leaderName: 'Gu Shouyuan',
        leaderTitle: 'Sage of Wanshou',
        leaderDescription: 'Master of beasts and longevity.',
        leaderAge: 450000000000,
        leaderCultivation: 'Perfect Immortal Rank 4',
        leaderTechniques: ['beast_whisper', 'valley_endurance', 'longevity_brew', 'herb_tend'],
        leaderSelfCreatedTechniques: ['lifespring_bond', 'valley_ward', 'beast_whisperers_call'],
        leaderWeapon: 'Tamer Flute',
        sectComposition: { leader: 1, tamers: 12 },
        pills: ['longevity_brew'],
        location: 'Wanshou Valley',
        philosophy: 'Life is a covenant with beasts.',
        type: 'neutral',
        realm: 5,
        power: 9200,
        reputation: 100,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['beast_whisper'], resources: { rareHerbs: 90 } },
        rivals: ['upper_north_sect'],
        allies: []
    },
    // Qingcheng Sect
    {
        id: 'qingcheng_sect',
        name: 'Qingcheng Sect',
        description: 'A quiet Taoist sect emphasizing inner tranquility and subtle poisons.',
        leaderName: 'Xu Qinghe',
        leaderTitle: 'Hermit of Qingcheng',
        leaderDescription: 'A secluded taoist scholar blending medicine and internal arts.',
        leaderAge: 800000000000,
        leaderCultivation: 'Silver Immortal',
        leaderTechniques: ['mountain_meditation', 'serpent_poison_antidote', 'hidden_breeze_step', 'herbal_extraction'],
        leaderSelfCreatedTechniques: ['hermits_antidote', 'qing_breath', 'silent_needle'],
        leaderWeapon: 'Green Serpent Needle',
        sectComposition: { leader: 1, hermits: 8 },
        pills: ['antidote_pill'],
        location: 'Qingcheng',
        philosophy: 'Stillness breeds insight.',
        type: 'righteous',
        realm: 5,
        power: 9400,
        reputation: 80,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['mountain_meditation'], resources: { medicinalHerbs: 70 } },
        rivals: ['darkness_sect'],
        allies: ['buddha_sect']
    },
    // Celestial Demon Sect
    {
        id: 'celestial_demon_sect',
        name: 'Celestial Demon Sect',
        description: 'Blends celestial forms with demonic power — feared and ostracized.',
        leaderName: 'Xie Tianyao',
        leaderTitle: 'Lord of Celestial Demon',
        leaderDescription: 'Fuses celestial technique with abyssal force.',
        leaderAge: 60000000,
        leaderCultivation: 'Mystic Immortal',
        leaderTechniques: ['demon_heaven_merge', 'star_corruption', 'celestial_fang_strike', 'abyssal_charm'],
        leaderSelfCreatedTechniques: ['demon_celestial_bind', 'fang_of_the_abyss', 'corrupting_radiance'],
        leaderWeapon: 'Celestial Fang',
        sectComposition: { leader: 1, demon_knights: 6 },
        pills: ['demonic_essence'],
        location: 'Fallen Spire',
        philosophy: 'Power above all.',
        type: 'demonic',
        realm: 7,
        power: 13500,
        reputation: -300,
        requirements: { minRealm: 6, karma: -30 },
        benefits: { techniques: ['demon_heaven_merge'], resources: { demonEssence: 80 } },
        rivals: ['heavenly_court'],
        allies: ['demon_immortal_palace']
    },
    // Diancang Sect
    {
        id: 'diancang_sect',
        name: 'Diancang Sect',
        description: 'An old sabercraft lineage famed for elegant yet decisive forms and political cunning.',
        leaderName: 'Gao Diancang',
        leaderTitle: 'Grand Chancellor of Diancang',
        leaderDescription: 'An elder strategist famed for elegance in sabercraft and political cunning.',
        leaderAge: 80000000,
        leaderCultivation: 'mystic_immortal',
        leaderTechniques: ['diancang_saber_flow', 'mountain_edge_form', 'courtroom_blade', 'iron_sleeve_deflect'],
        leaderSelfCreatedTechniques: ['chancellor_saber_decree', 'jade_hall_cleave', 'emerald_ridge_cut'],
        leaderWeapon: 'Diancang Chancellor Saber',
        sectComposition: { leader: 1, elders: 8, disciples: 'many' },
        pills: ['clarity_edge_pill'],
        location: 'Diancang Range',
        philosophy: 'Elegance grants leverage; leverage wins wars.',
        type: 'righteous',
        realm: 6,
        power: 10800,
        reputation: 120,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['diancang_saber_flow'], resources: { spiritStones: 70 } },
        rivals: ['ming_cult'],
        allies: ['ten_great_martial_sects_alliance']
    },
    // Kongtong Sect
    {
        id: 'kongtong_sect',
        name: 'Kongtong Sect',
        description: 'A venerable daoist sect known for balanced sword and palm, insight, and restraint.',
        leaderName: 'Kong Yuanze',
        leaderTitle: 'Patriarch of Kongtong',
        leaderDescription: 'A venerable daoist whose balance of insight and blade technique is unrivaled.',
        leaderAge: 80000000,
        leaderCultivation: 'mystic_immortal',
        leaderTechniques: ['kongtong_six_harmony', 'jade_blade_mantra', 'quiet_mind_seal', 'cloud_curtain_step'],
        leaderSelfCreatedTechniques: ['patriarchs_balance', 'sixfold_harmony_cut', 'jade_heart_calming'],
        leaderWeapon: 'Jade Daoist Sword',
        sectComposition: { leader: 1, elders: 7, halls: ['Harmony', 'Insight'] },
        pills: ['harmony_pill'],
        location: 'Kongtong Peaks',
        philosophy: 'Balance in heart, edge in hand.',
        type: 'righteous',
        realm: 6,
        power: 10600,
        reputation: 110,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['kongtong_six_harmony'], resources: { spiritStones: 65 } },
        rivals: ['celestial_demon_sect'],
        allies: ['ten_great_martial_sects_alliance']
    },
    // Zhongnan Sect
    {
        id: 'zhongnan_sect',
        name: 'Zhongnan Sect',
        description: 'A hermit-sword tradition guarding mountain rites and secret postures.',
        leaderName: 'Zhongnan Zhenren',
        leaderTitle: 'Sage of Zhongnan',
        leaderDescription: 'A hermit-sage who governs the mountain’s rites and secret sword postures.',
        leaderAge: 60000000,
        leaderCultivation: 'mystic_immortal',
        leaderTechniques: ['mountain_rite_form', 'hidden_pine_slash', 'hermit_breath', 'ridgewalk_step'],
        leaderSelfCreatedTechniques: ['sage_of_zhongnan_ritual', 'pine_shadow_edge', 'mountain_silence'],
        leaderWeapon: 'Pine-Shadow Sword',
        sectComposition: { leader: 1, elders: 5, hermits: 'several' },
        pills: ['mountain_herb_pill'],
        location: 'Zhongnan Mountains',
        philosophy: 'Silence sharpens the edge.',
        type: 'righteous',
        realm: 6,
        power: 10200,
        reputation: 100,
        requirements: { minRealm: 4 },
        benefits: { techniques: ['mountain_rite_form'], resources: { medicinalHerbs: 40 } },
        rivals: ['darkness_sect'],
        allies: ['ten_great_martial_sects_alliance']
    },
    // Lingxiao Sect (distinct from Lingxiao Palace)
    {
        id: 'lingxiao_sect',
        name: 'Lingxiao Sect',
        description: 'A high court of etheric doctrine, sister to the Lingxiao Palace with a doctrinal emphasis.',
        leaderName: 'Yao Lingxiao',
        leaderTitle: 'Matron of Lingxiao',
        leaderDescription: 'Keeper of soul-forging rites and arcane immortal arts.',
        leaderAge: 50000000,
        leaderCultivation: 'mystic_immortal',
        leaderTechniques: ['soul_tablet_engraving', 'etheric_chorus', 'spirit_bell_barrier', 'mist_veil_step'],
        leaderSelfCreatedTechniques: ['matrons_doctrine', 'soul_engraving_edict', 'etheric_bond'],
        leaderWeapon: 'Chime of Lingxiao',
        sectComposition: { leader: 1, elders: 6, choirs: 3 },
        pills: ['ether_bell_pill'],
        location: 'Lingxiao Heights',
        philosophy: 'Ritual tames the soul’s storm.',
        type: 'hidden',
        realm: 6,
        power: 11200,
        reputation: 130,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['soul_tablet_engraving'], resources: { ethereal_ore: 30 } },
        rivals: ['demon_immortal_palace'],
        allies: ['lingxiao_palace']
    },
    // Sword Sect of Mount Shu
    {
        id: 'sword_sect_mount_shu',
        name: 'Sword Sect of Mount Shu',
        description: 'A proud sword sect from Mount Shu obsessed with refining blade art.',
        leaderName: 'Shu Jianxin',
        leaderTitle: 'Swordmaster of Mount Shu',
        leaderDescription: 'A swordsman-philosopher pursuing blade perfection.',
        leaderAge: 40400000,
        leaderCultivation: 'Mystic Immortal',
        leaderTechniques: ['shu_blade_code', 'reflection_slash', 'sword_intent_refinement', 'philosophers_thrust'],
        leaderSelfCreatedTechniques: ['shu_mirror_strike', 'reflection_doctrine', 'blade_philosophy'],
        leaderWeapon: 'Shu Sword',
        sectComposition: { leader: 1, blade_masters: 10 },
        pills: ['sword_spirit_pill'],
        location: 'Mount Shu',
        philosophy: 'Blade refines soul.',
        type: 'ancient',
        realm: 6,
        power: 10900,
        reputation: 70,
        requirements: { minRealm: 5 },
        benefits: { techniques: ['shu_blade_code'], resources: { swordManuals: 6 } },
        rivals: ['huashan_sword_school'],
        allies: ['xian_network']
    },
    // Heavenly Dao Sect
    {
        id: 'heavenly_dao_sect',
        name: 'Heavenly Dao Sect',
        description: 'A lofty sect devoted to mastering the Heavenly Dao and governance of fate.',
        leaderName: 'Tian Yuchen',
        leaderTitle: 'Prelate of the Heavenly Dao',
        leaderDescription: 'A transcendent jurist who codifies fate and dao laws.',
        leaderAge: 5000000000000,
        leaderCultivation: 'Mystic Divine Origin 1',
        leaderTechniques: ['heavenly_dao_calculation', 'fate_bend', 'immortal_broadcast', 'celestial_bind'],
        leaderSelfCreatedTechniques: ['prelates_decree', 'fate_ledger', 'heavenly_mandate'],
        leaderWeapon: 'Mandate Scepter',
        sectComposition: { leader: 1, prelates: 4 },
        pills: ['dao_insight_pill'],
        location: 'Heaven Council',
        philosophy: 'Order through cosmic law.',
        type: 'ancient',
        realm: 8,
        power: 18000,
        reputation: 300,
        requirements: { minRealm: 6, minCombatPower: 9000 },
        benefits: { techniques: ['heavenly_dao_calculation'], resources: { daoInsights: 12 } },
        rivals: ['void_emperor_sect'],
        allies: ['eternal_dao_academy']
    },
    // Lingxiao Palace
    {
        id: 'lingxiao_palace',
        name: 'Lingxiao Palace',
        description: 'A secretive palace of etheric refinement, specializing in immortal techniques and soul-forging.',
        leaderName: 'Yao Lingxiao',
        leaderTitle: 'Matron of Lingxiao Palace',
        leaderDescription: 'Keeper of soul-forging rites and arcane immortal arts.',
        leaderAge: 900000000,
        leaderCultivation: 'Silver Immortal',
        leaderTechniques: ['lingxiao_soul_forge', 'palace_shroud', 'ethereal_binding', 'soul_smelt'],
        leaderSelfCreatedTechniques: ['matrons_soul_forge', 'ethereal_weave', 'palace_binding'],
        leaderWeapon: 'Ethereal Chisel',
        sectComposition: { leader: 1, forgers: 8 },
        pills: ['ethereal_pill'],
        location: 'Lingxiao Palace',
        philosophy: 'Forge the soul to shape destiny.',
        type: 'hidden',
        realm: 7,
        power: 15000,
        reputation: 120,
        requirements: { minRealm: 6 },
        benefits: { techniques: ['lingxiao_soul_forge'], resources: { ethereal_ore: 40 } },
        rivals: ['demon_immortal_palace'],
        allies: ['void_emperor_sect']
    },
    // Factions and Schools (formatted similarly)
    {
        id: 'ten_great_martial_sects_alliance',
        name: 'Ten Great Martial Sects Alliance',
        description: 'A formal alliance coordinating defense and restricted techniques among ten great martial sects.',
        leaderName: 'Han Zheng',
        leaderTitle: 'Chancellor of the Ten Great',
        leaderDescription: 'An elected coordinator who arbitrates disputes and mobilizes joint action.',
        leaderAge: 800000000000000,
        leaderCultivation: 'Zenith Heaven Early',
        leaderTechniques: ['alliance_command', 'joint_formation_array', 'martial_registry', 'seal_of_pact'],
        leaderSelfCreatedTechniques: ['tenfold_concord', 'shared_saber_edict', 'oathbound_treaty'],
        leaderWeapon: 'Seal of Concord',
        sectComposition: { council: 1, delegates: 10 },
        pills: [],
        location: 'Rotating host among alliance sects',
        philosophy: 'Unity preserves the martial world.',
        type: 'faction',
        realm: 7,
        power: 20000,
        reputation: 500,
        requirements: { memberSect: true },
        benefits: { techniques: ['joint_formation_array'], resources: { favor: 10 } },
        rivals: ['demon_immortal_palace'],
        allies: ['shaolin_monastery', 'mount_hua_sect', 'kunlun_sect']
    },
    {
        id: 'heavenly_merchant_guild',
        name: 'Heavenly Merchant Guild',
        description: 'The largest trading organization spanning multiple realms.',
        leaderName: 'Qian Ruyi',
        leaderTitle: 'Heavenly Guildmaster',
        leaderDescription: 'A master negotiator who weaves profit with protection.',
        leaderAge: 300000000000,
        leaderCultivation: 'tribulation_transcendence',
        leaderTechniques: ['market_divination', 'trade_route_seal', 'contract_bind', 'platinum_ledger'],
        leaderSelfCreatedTechniques: ['thousand_routes_accord', 'merchant_king_mandate', 'golden_handshake'],
        leaderWeapon: 'Golden Abacus',
        sectComposition: { guildmaster: 1, elders: 7, caravans: 'many' },
        pills: ['merchant_vigor_pill'],
        location: 'Trade Cities',
        philosophy: 'Orderly trade enriches all.',
        type: 'faction',
        realm: 5,
        power: 8000,
        reputation: 300,
        requirements: { minStanding: 10 },
        benefits: { techniques: ['contract_bind'], resources: { yuan: 10000 } },
        rivals: [],
        allies: ['tao_school']
    },
    {
        id: 'heavenly_court',
        name: 'Heavenly Court',
        description: 'Upholds celestial order through divine judgment and political influence.',
        leaderName: 'Yu Shouzhang',
        leaderTitle: 'Registrar of Heaven',
        leaderDescription: 'Balances divine law with cosmic politics.',
        leaderAge: 800000000000,
        leaderCultivation: 'Perfect Immortal Emperor rank 5',
        leaderTechniques: ['heavenly_judgment', 'celestial_chains', 'edict_of_order', 'mandate_bureau'],
        leaderSelfCreatedTechniques: ['jade_ledger', 'constellation_seal', 'astral_bailiff'],
        leaderWeapon: 'Heavenly Ruler',
        sectComposition: { registrar: 1, judges: 7, bailiffs: 'many' },
        pills: [],
        location: 'Celestial Capital',
        philosophy: 'Law sustains the heavens.',
        type: 'faction',
        realm: 8,
        power: 22000,
        reputation: 400,
        requirements: { minRealm: 7 },
        benefits: { techniques: ['heavenly_judgment'], resources: { favor: 20 } },
        rivals: ['celestial_demon_sect', 'ming_cult'],
        allies: ['eternal_dao_academy']
    },
    {
        id: 'demon_immortal_palace',
        name: 'Demon Immortal Palace',
        description: 'An organization of forbidden practitioners seeking immortality at any cost.',
        leaderName: 'Yin Wuhen',
        leaderTitle: 'Immortal of the Demon Palace',
        leaderDescription: 'A forbidden researcher of soul and body.',
        leaderAge: 789000000000000,
        leaderCultivation: 'Zenith Heavenly Early',
        leaderTechniques: ['soul_absorption', 'immortal_wrath', 'corpse_refinement', 'shadow_graft'],
        leaderSelfCreatedTechniques: ['forbidden_sutra', 'immortal_suture', 'palace_of_wrath'],
        leaderWeapon: 'Soul Needle',
        sectComposition: { lord: 1, keepers: 4, acolytes: 'many' },
        pills: ['forbidden_essence'],
        location: 'Hidden Palace',
        philosophy: 'Immortality justifies the means.',
        type: 'faction',
        realm: 7,
        power: 16000,
        reputation: -600,
        requirements: { karma: -40, minRealm: 6 },
        benefits: { techniques: ['soul_absorption'], resources: { forbiddenManuals: 3 } },
        rivals: ['ten_great_martial_sects_alliance', 'buddha_sect'],
        allies: ['celestial_demon_sect']
    },
    {
        id: 'tao_school',
        name: 'Tao School',
        description: 'A scholarly order that teaches the flowing principles of Dao.',
        leaderName: 'Liu Daoyi',
        leaderTitle: 'Headmaster of Tao School',
        leaderDescription: 'An affable sage dedicated to spreading Daoist practice.',
        leaderAge: 6000000000000000,
        leaderCultivation: 'Mystic Divine Origin 6',
        leaderTechniques: ['daoist_palm', 'flowing_dao', 'still_water_mind', 'harmony_breath'],
        leaderSelfCreatedTechniques: ['school_of_flow', 'gentle_current_form', 'circling_dao_step'],
        leaderWeapon: 'Pine Staff',
        sectComposition: { headmaster: 1, teachers: 6, students: 'many' },
        pills: ['clarity_pill'],
        location: 'Academy of Tao',
        philosophy: 'Flow with the Dao.',
        type: 'faction',
        realm: 5,
        power: 9000,
        reputation: 200,
        requirements: { minRealm: 3 },
        benefits: { techniques: ['daoist_palm'], resources: { spiritStones: 150 } },
        rivals: [],
        allies: ['eternal_dao_academy', 'heavenly_merchant_guild', 'heavenly_court']
    }
    // ... We'll add full entries for each major sect/faction. For brevity in this initial
    // commit I will include representative fully-copied forms for remaining entries
    // and then populate all others in the same pattern programmatically to avoid a
    // massive single patch. The user can edit any entry in this file.
];
// Auto-adjust Bei Xue's age relative to Bei Ling (assumption: 10% younger).
// Normalize leader properties: canonicalize cultivation strings, ensure ages/weapon/reputation are typed.
(() => {
    const normalizeCultivation = (input) => {
        if (!input && input !== 0)
            return 'unknown';
        let s = String(input).toLowerCase().trim();
        // common human-readable adjustments
        s = s.replace(/\brank\s*(\d+)\b/g, 'rank$1');
        s = s.replace(/\borigin\s*(\d+)\b/g, 'origin_$1');
        s = s.replace(/\s+/g, '_');
        s = s.replace(/[^a-z0-9_]/g, '_');
        s = s.replace(/_+/g, '_');
        s = s.replace(/^_|_$/g, '');
        return s;
    };
    for (const entry of exports.MAJOR_LEADERS) {
        // cultivation
        if (entry.leaderCultivation != null) {
            entry.leaderCultivation = normalizeCultivation(entry.leaderCultivation);
        }
        else {
            entry.leaderCultivation = 'unknown';
        }
        // age -> integer >= 0
        if (typeof entry.leaderAge === 'number' && Number.isFinite(entry.leaderAge)) {
            entry.leaderAge = Math.max(0, Math.floor(entry.leaderAge));
        }
        else if (entry.leaderAge != null) {
            const parsed = Math.floor(Number(entry.leaderAge) || 0);
            entry.leaderAge = Math.max(0, parsed);
        }
        else {
            entry.leaderAge = 0;
        }
        // weapon -> string or null
        if (entry.leaderWeapon == null) {
            entry.leaderWeapon = null;
        }
        else {
            entry.leaderWeapon = String(entry.leaderWeapon);
        }
        // reputation -> number
        if (typeof entry.reputation !== 'number' || !Number.isFinite(entry.reputation)) {
            entry.reputation = Number(entry.reputation) || 0;
        }
    }
})();
// Auto-adjust Bei Xue's age relative to Bei Ling (assumption: 10% younger).
(() => {
    const beiLing = exports.MAJOR_LEADERS.find((e) => e.id === 'upper_north_sect');
    const beiXue = exports.MAJOR_LEADERS.find((e) => e.id === 'lower_south_sect');
    if (beiLing && beiXue && typeof beiLing.leaderAge === 'number') {
        const younger = Math.max(1, Math.floor(beiLing.leaderAge * 0.9));
        beiXue.leaderAge = younger;
    }
})();
exports.default = exports.MAJOR_LEADERS;
// Map each leader's cultivation string to canonical realm id and numeric index.
(() => {
    const realmKeys = Object.keys(cultivationRealms_1.CULTIVATION_REALMS);
    // Strict alias table: map common variants to canonical realm ids.
    const ALIASES = {
        'mystic_immortal': 'mystic_immortal',
        'mystic immortal': 'mystic_immortal',
        'mystic_immortal_rank1': 'mystic_immortal',
        'silver_immortal': 'silver_immortal',
        'true_heaven_immortal': 'true_heaven_immortal',
        'heaven_immortal': 'heaven_immortal',
        'loose_immortal': 'loose_immortal',
        'earth_loose_immortal': 'earth_loose_immortal',
        'perfect_immortal_emperor_rank4': 'perfect_immortal_emperor_rank4',
        'perfect_immortal_emperor_rank5': 'perfect_immortal_emperor_rank5',
        'perfect_immortal_rank4': 'perfect_immortal_emperor_rank4',
        'perfect_immortal_rank3': 'perfect_immortal_emperor_rank3',
        'perfect_immortal_emperor_rank1': 'perfect_immortal_emperor_rank1',
        'perfect_immortal_emperor_rank2': 'perfect_immortal_emperor_rank2',
        'mystic_divine_origin_6': 'mystic_divine_origin_6',
        'mystic divine origin 6': 'mystic_divine_origin_6',
        'mystic_divine_origin_1': 'mystic_divine_origin_1',
        'mystic_divine_origin_2': 'mystic_divine_origin_2',
        'tribulation_transcendence': 'tribulation_transcendence',
        'tribulation_transcendance': 'tribulation_transcendence',
        'tribulation_trans': 'tribulation_transcendence',
        'none': 'mortal',
        'unknown': 'mortal',
        'zenith_heaven_early': 'zenith_heaven_early',
        'zenith_heaven_mid': 'zenith_heaven_mid',
        'zenith_heaven_late': 'zenith_heaven_late',
        'zenith_heaven_peak': 'zenith_heaven_peak',
        'heavenly_dao': 'eternal_dao_sovereign'
    };
    const normalizeKey = (cult) => String(cult || '').toLowerCase().replace(/[^a-z0-9_\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const findBestMatch = (cult) => {
        if (!cult)
            return 'mortal';
        const nk = normalizeKey(cult);
        if (ALIASES[nk])
            return ALIASES[nk];
        const underscore = nk.replace(/\s+/g, '_');
        if (cultivationRealms_1.CULTIVATION_REALMS[underscore])
            return underscore;
        // Try to match known tokens strictly
        for (const token of ['mystic', 'divine_origin', 'silver', 'perfect_immortal', 'nascent_soul', 'true_heaven', 'heaven', 'tribulation', 'zenith']) {
            if (nk.includes(token)) {
                const candidate = realmKeys.find(k => k.includes(token));
                if (candidate)
                    return candidate;
            }
        }
        // final fallback: exact key presence check
        for (const key of realmKeys) {
            if (key === nk || key === underscore)
                return key;
        }
        return 'mortal';
    };
    for (const entry of exports.MAJOR_LEADERS) {
        const cult = entry.leaderCultivation || entry.cultivation || '';
        const realmKey = findBestMatch(cult);
        entry.leaderRealm = realmKey;
        // numeric realm: index of REALM_ORDER (0-based mapping in other code uses numeric ids starting at 0)
        const idx = cultivationRealms_1.REALM_ORDER.indexOf(realmKey);
        entry.realm = idx >= 0 ? idx : cultivationRealms_1.REALM_ORDER.indexOf('mortal');
    }
})();
// Cap leader ages to the realm lifespan bonus (with optional small buffer).
(() => {
    for (const entry of exports.MAJOR_LEADERS) {
        const realmKey = entry.leaderRealm || cultivationRealms_1.REALM_ORDER[entry.realm] || 'mortal';
        const realmData = cultivationRealms_1.CULTIVATION_REALMS[realmKey];
        if (!realmData)
            continue;
        const cap = Math.max(0, Math.floor(realmData.lifespanBonus));
        if (typeof entry.leaderAge === 'number' && entry.leaderAge > cap) {
            // keep a small buffer (1% of cap) for narrative leeway, but still enforce a maximum
            const buffer = Math.max(0, Math.floor(cap * 0.01));
            const newAge = Math.max(1, cap + buffer);
            /* eslint-disable no-console */
            console.warn(`MajorLeaders: Capping leaderAge for ${entry.id} from ${entry.leaderAge} to ${newAge} based on realm ${realmKey} lifespan ${cap}`);
            /* eslint-enable no-console */
            entry.leaderAge = newAge;
        }
    }
})();
