"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectFactionSystem = exports.MAJOR_ALLIANCES = exports.MAJOR_FACTIONS = exports.MAJOR_SECTS = void 0;
const rng_1 = require("../utils/rng");
const MiniGameSystem_1 = require("./MiniGameSystem");
const logger_1 = require("../utils/logger");
// NOTE: This file intentionally uses permissive shapes for Sect/Faction to avoid large type churn
// while porting rich runtime-built data into the canonical TS source. Types can be tightened later.
exports.MAJOR_SECTS = [
    {
        id: 'mount_hua_sect',
        name: 'Mount Hua Sect',
        description: 'Balance between swordsmanship and internal cultivation; purity of heart guides strength. Famous for the Plum Blossom sword style.',
        leaderName: 'Geun Sejong',
        leaderTitle: "Mount Hua's Plum Blossom Swordsman",
        leaderDescription: 'He rose as a mortal from Mount Hua’s outer sect, later leading a righteous rebellion against corruption to reform the sect. A top swordsman of the Immortal World, famed from the 2nd Demonic War.',
        leaderAge: 40000000,
        leaderCultivation: 'Mystic Immortal)',
        leaderTechniques: [
            'Twenty-Four Plum Blossoms Sword Technique',
            'Seven Blossom Blades',
            'Plum Blossom: Cutting through the winter',
            'Plum Blossom Sword Style – Forms 1-5',
            'Six-Teen Movements of the Plum Blossom Style',
            'Plum Blossom Breathing Technique',
            'Violet Blossom Breathing Technique',
            'Internal Violet Qi Technique',
            'Spring Qi technique',
            'Winter Qi technique'
        ],
        leaderSelfCreatedTechniques: [
            "Plum Blossom's Final Stride",
            "Plum Blossom's Violet Movement Technique",
            'All Element Plum Blossom Fifty-six Sword Technique'
        ],
        leaderWeapon: 'Plum Blossom Violet Sword',
        sectComposition: { leader: 1, viceLeaders: 1, elders: 10, firstGen: 'many', secondGen: 'many' },
        pills: ['Violet Energy pill', 'Rainbow Blossom pill'],
        location: 'Mount Hua in Immortal World',
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
    // Shaolin (Yuan Lin)
    {
        id: 'shaolin_monastery',
        name: 'Shaolin',
        description: 'Chan Buddhism’s cradle of martial arts; home to countless techniques and deep compassion.',
        leaderName: 'Yuan Lin',
        leaderTitle: "Shaolin's Abbot",
        leaderDescription: 'Forefather of Shaolin; guardian of the 10 Great Martial Sects. Wields the Dharma’s Brush and is credited with codifying countless Shaolin arts.',
        leaderAge: 300000000000,
        leaderCultivation: 'Perfect Immortal Emperor Rank 4',
        leaderTechniques: [
            '72 Supreme Arts', 'Arhat Fist', 'Vajra Finger', 'One Finger Zen', '32 All encompassing Fist', '5 Lightning Movements', 'Golden Qi Cultivation', 'Abbot\'s Ink Qi Cultivation'
        ],
        leaderSelfCreatedTechniques: ['All Shaolin techniques'],
        sectComposition: { abbot: 1, sectLeader: 1, viceLeaders: 2, elders: 10, halls: ['Great Hero', 'Discipline', 'Bodhi', 'Scripture', 'Dharma', 'Arhat'] },
        pills: ["Shaolin's Rejuvenating Pill", "Shaolin's Transformation Pill"],
        location: 'Immortal World',
        philosophy: 'Compassion, wisdom, discipline, perseverance; Chan Buddhism meditation.',
        type: 'righteous',
        power: 11000,
        allies: ['ten_great_martial_sects_alliance'],
        rivals: ['heavenly_demonic_sect']
    },
    // Kunlun (Jin Su)
    {
        id: 'kunlun_sect',
        name: 'Kunlun',
        description: 'Guardians of the Immortal World’s west; balance between strength, wisdom, and responsibility.',
        leaderName: 'Jin Su',
        leaderTitle: 'The Heavenly Swordsman',
        leaderDescription: 'Raised from poverty; a righteous Taoist with a quirky love of money. Rose to fame in the 2nd Demonic War and wields the Immortal Sword that grows with him.',
        leaderAge: 20000000,
        leaderCultivation: 'Mystic Immortal',
        leaderTechniques: ['Taiji swordsmanship', 'Kunlun\'s Clouds Swordsmanship', 'Kunlun\'s Taiji movement', 'Kunlun Bright Qi', 'Kunlun Cloudy Qi'],
        leaderSelfCreatedTechniques: ['Kunlun 16-Movement Flashy Sword', 'Kunlun Heavenly Sword Strike', 'Kunlun Righteous Heavenly Sword'],
        pills: ["Kunlun's Refreshing Pill", "Kunlun's Cloud Pill"],
        sectComposition: { leader: 1, viceLeaders: 3, elders: 5 },
        location: 'Kunlun Mountains, Immortal World',
        philosophy: 'Taoist responsibility; despise unorthodox and demonic forces.',
        type: 'righteous',
        power: 9800
    },
    // Upper North (Bei Ling)
    {
        id: 'upper_north_sect',
        name: 'Upper North Sect',
        description: 'Defenders of the Immortal World’s north; an unyielding wall against calamity.',
        leaderName: 'Bei Ling',
        leaderTitle: 'Guardian of the North',
        leaderDescription: 'Forged by loss and duty, he became a cold, unwavering bulwark after his sister’s disappearance and father’s death in a secret war.',
        leaderAge: 600000000,
        leaderCultivation: 'Silver Immortal',
        leaderTechniques: ['Frozen Heart Serenity Art', 'Northern Wall Stance', 'Glacial Mirror Palms', 'Thousand-Mile White Plain Step', 'Northern Fist of Destruction', 'Rain of Ice'],
        leaderSelfCreatedTechniques: ['Ice Domain', 'Absolute Zero', 'Northern Heaven Barricade'],
        pills: ['Tears of the Ice'],
        philosophy: 'Protect the weak and strong alike; defend the north and the world.',
        type: 'righteous',
        power: 9900
    },
    // Heavenly Demonic Sect (Cheon Mu)
    {
        id: 'heavenly_demonic_sect',
        name: 'Heavenly Demonic Sect',
        description: 'Anarchic demonic force led for the thrill of chaos; the axis of demonic sects.',
        leaderName: 'Cheon Mu',
        leaderTitle: 'Heavenly Demon God',
        leaderDescription: 'A genius martial savant with perfect mimicry, driven mad by tragedy and hatred toward the heavens. No cultivation, pure martial power.',
        leaderAge: 21000000000,
        leaderCultivation: 'None',
        leaderTechniques: ['Darkening Star Sword', 'True Blood of the Demon God', 'Wind Shadow Steps', 'Lunar Sword Arts', 'Heavenly Demon Star Sword'],
        leaderSelfCreatedTechniques: ['Sword Art of the Demon God', 'Sword Force of the Heavenly Demon', 'Extreme Art of the Blade God', 'Flying Phantom Slash', 'Luminous Star Sword', 'Three Heavenly Demon Sword Strokes'],
        type: 'demonic',
        power: 15000,
        rivals: ['shaolin_monastery', 'mount_hua_sect', 'kunlun_sect']
    },
    // Kid God (Taek Jin)
    {
        id: 'kid_god',
        name: 'Kid God',
        description: 'A reincarnation of Sun Wukong; born of Heaven and Earth’s spiritual energy to shatter the heavens.',
        leaderName: 'Taek Jin',
        leaderTitle: 'Kid God',
        leaderDescription: 'Trained by his grandfather in Recoilless Taekwondo; later ascended, wielding the Ruyi Jingu Bang. A heaven-defying genius.',
        leaderAge: 1500000000,
        leaderCultivation: 'Mystic Celestial Origin 6',
        leaderTechniques: [
            'Hwechook', '3rd Stance Hwechook', 'Dragon Catcher', 'Baek Nok', 'Ground Drawer', 'Recoilless Concept', 'Jin Hoechook', 'Blue Dragon\'s Kick', 'Ice Kick'
        ],
        type: 'neutral',
        power: 12000,
        location: 'Wandering across thousands of worlds'
    }
];
// Append additional major sects (rich format similar to Mount Hua) so UI and systems
// can display full leader and sect metadata. These entries are additive.
exports.MAJOR_SECTS.push({
    id: 'azure_cloud_sect',
    name: 'Azure Cloud Sect',
    description: 'A righteous sect known for cloud-walking techniques and moral cultivation.',
    leaderName: 'Patriarch Yun',
    leaderTitle: 'Patriarch of Azure Cloud',
    leaderDescription: 'Guides disciples through aerial techniques and righteous governance.',
    leaderAge: 45000000,
    leaderCultivation: 'Loose Immortal',
    leaderTechniques: ['cloud_step', 'azure_sword_art', 'righteous_qi_cultivation'],
    sectComposition: { leader: 1, elders: 8, disciples: 'many' },
    pills: ['Cloud Essence Pill'],
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
}, {
    id: 'blood_moon_sect',
    name: 'Blood Moon Sect',
    description: 'A demonic sect practicing blood cultivation and forbidden arts.',
    leaderName: 'Crimson Matriarch',
    leaderTitle: 'Matriarch of the Blood Moon',
    leaderDescription: 'Commands blood rites and cultivators who sacrifice for power.',
    leaderAge: 120000000,
    leaderCultivation: 'Loose Immortal',
    leaderTechniques: ['blood_sacrifice', 'crimson_claw', 'soul_devouring_art'],
    sectComposition: { leader: 1, generals: 4, acolytes: 'many' },
    pills: ['Blood Essence Pill'],
    location: 'Crimson Caves',
    philosophy: 'Power demands sacrifice.',
    type: 'demonic',
    realm: 5,
    power: 7800,
    reputation: 0,
    requirements: { minRealm: 3, karma: -20 },
    benefits: { techniques: ['blood_sacrifice'], resources: { bloodEssence: 100 } },
    rivals: ['azure_cloud_sect'],
    allies: ['demon_immortal_palace']
}, {
    id: 'eternal_dao_academy',
    name: 'Eternal Dao Academy',
    description: 'An ancient scholarly sect focused on Dao comprehension and knowledge.',
    leaderName: 'Academy Dean',
    leaderTitle: 'Dean of the Eternal Dao Academy',
    leaderDescription: 'A sage scholar preserving and teaching Daoic truths.',
    leaderAge: 90000000,
    leaderCultivation: 'Perfect Immortal rank 1',
    leaderTechniques: ['dao_comprehension', 'reality_analysis'],
    sectComposition: { leader: 1, masters: 6, scholars: 'many' },
    pills: ['Insight Pill'],
    location: 'Celestial Library',
    philosophy: 'Knowledge refines the Dao.',
    type: 'ancient',
    realm: 5,
    power: 12000,
    reputation: 0,
    requirements: { minRealm: 4, minCombatPower: 5000 },
    benefits: { techniques: ['dao_comprehension'], resources: { ancientTexts: 10 } },
    rivals: [],
    allies: ['tao_school']
}, {
    id: 'dragon_emperor_palace',
    name: 'Dragon Emperor Palace',
    description: 'The supreme sect of the dragon race, accepting only those with dragon bloodline.',
    leaderName: 'Dragon Sovereign',
    leaderTitle: 'Dragon Emperor',
    leaderDescription: 'Supreme ruler of dragons, wielder of imperial dragon might.',
    leaderAge: 500000000,
    leaderCultivation: 'Perfect Immortal Emperor Rank 5',
    leaderTechniques: ['dragon_transformation', 'imperial_dominance'],
    sectComposition: { leader: 1, princes: 3, knights: 'many' },
    pills: ['Dragon Heart Pill'],
    location: 'Dragon Throne',
    philosophy: 'Bloodline defines destiny.',
    type: 'ancient',
    realm: 8,
    power: 25000,
    reputation: 0,
    requirements: { minRealm: 6, specialRequirements: ['dragon_bloodline'] },
    benefits: { techniques: ['dragon_transformation'], resources: { dragonEssence: 200 } },
    rivals: ['emptiness_emperor_sect'],
    allies: ['upper_north_sect']
}, {
    id: 'emptiness_emperor_sect',
    name: 'Emptiness Emperor Sect',
    description: 'A mysterious sect existing between dimensions, masters of emptiness cultivation.',
    leaderName: 'Emperor of Emptiness',
    leaderTitle: 'Emptiness Emperor',
    leaderDescription: 'A sovereign of emptiness energy and dimensional law.',
    leaderAge: 800000000,
    leaderCultivation: 'Perfect Immortal Rank 5',
    leaderTechniques: ['emptiness_mastery', 'dimensional_travel'],
    sectComposition: { leader: 1, gatekeepers: 4, adepts: 'many' },
    pills: ['Emptiness Nectar'],
    location: 'Fractured Gate',
    philosophy: 'Boundary is an illusion.',
    type: 'hidden',
    realm: 10,
    power: 30000,
    reputation: 0,
    requirements: { minRealm: 8 },
    benefits: { techniques: ['emptiness_mastery'], resources: { emptinessEssence: 500 } },
    rivals: ['dragon_emperor_palace'],
    allies: ['darkness_sect']
}, {
    id: 'buddha_sect',
    name: 'Buddha Sect',
    description: 'Enlightenment through compassion, meditation, and selflessness.',
    leaderName: 'Bodhi Master',
    leaderTitle: 'Patriarch of Buddha Sect',
    leaderDescription: 'Embodies compassion and leads with spiritual wisdom.',
    leaderAge: 110000000,
    leaderCultivation: 'Silver Immortal',
    leaderTechniques: ['lotus_palm', 'buddha_embrace'],
    sectComposition: { leader: 1, monks: 'many' },
    pills: ['Rejuvenating Pill'],
    location: 'Lotus Monastery',
    philosophy: 'Compassion refines strength.',
    type: 'righteous',
    realm: 7,
    power: 11000,
    reputation: 0,
    requirements: { minRealm: 5, karma: 25 },
    benefits: { techniques: ['lotus_palm'], resources: { enlightenmentScrolls: 8 } },
    rivals: ['demon_immortal_palace'],
    allies: ['mount_hua_sect']
}, {
    id: 'starlight_sect',
    name: 'Starlight Sect',
    description: 'The cosmos guides destiny; cultivate in harmony with celestial cycles.',
    leaderName: 'Starwarden',
    leaderTitle: 'Mystic Immortal',
    leaderDescription: 'A master of celestial arts and cosmic navigation.',
    leaderAge: 140000000,
    leaderCultivation: 'Taiyi Golden Immortal',
    leaderTechniques: ['starlight_saber', 'celestial_navigation'],
    sectComposition: { leader: 1, astronomers: 6 },
    pills: ['Star Essence Pill'],
    location: 'Observatory Peaks',
    philosophy: 'Read the stars, steer fate.',
    type: 'ancient',
    realm: 8,
    power: 13000,
    reputation: 0,
    requirements: { minRealm: 6 },
    benefits: { techniques: ['starlight_saber'], resources: { starEssence: 100 } },
    rivals: ['mount_hua_sect'],
    allies: ['void_emperor_sect']
}, {
    id: 'lower_south_sect',
    name: 'Lower South Sect',
    description: 'Masters of adaptability, fluid combat, and environmental manipulation.',
    leaderName: 'Southern Strategist',
    leaderTitle: 'Master of the Lower South',
    leaderDescription: 'A tactician blending terrain with combat flow.',
    leaderAge: 60000000,
    leaderCultivation: 'Silver Immortal',
    leaderTechniques: ['torrent_palm', 'jungle_serpent_step'],
    sectComposition: { leader: 1, scouts: 8 },
    pills: ['Tropical Brew'],
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
}, {
    id: 'darkness_sect',
    name: 'Darkness Sect',
    description: 'Embraces shadows to understand the balance between light and dark.',
    leaderName: 'Shadowmaster',
    leaderTitle: 'Master of Darkness',
    leaderDescription: 'A clandestine leader who trains in secret arts and covert operations.',
    leaderAge: 210000000,
    leaderCultivation: 'Heaven Immortal',
    leaderTechniques: ['shadow_step', 'umbral_veil'],
    sectComposition: { leader: 1, covert_leads: 5 },
    pills: ['Shadow Draught'],
    location: 'Umbra Hollows',
    philosophy: 'Only by embracing shadow can one see the whole.',
    type: 'hidden',
    realm: 9,
    power: 14000,
    reputation: 0,
    requirements: { minRealm: 7 },
    benefits: { techniques: ['shadow_step'], resources: { shadowEssence: 120 } },
    rivals: ['heavenly_court'],
    allies: ['void_emperor_sect']
}, {
    id: 'wudang_sect',
    name: 'Wudang Sect',
    description: 'A Taoist sect emphasizing balance, soft power, and internal alchemy.',
    leaderName: 'Wudang Patriarch',
    leaderTitle: 'Patriarch of Wudang',
    leaderDescription: 'Combines sword skill with inner alchemy.',
    leaderAge: 75000000,
    leaderCultivation: 'Silver Immortal',
    leaderTechniques: ['wudang_taiyi_sword', 'internal_harmony'],
    sectComposition: { leader: 1, disciples: 'many' },
    pills: ['Inner Harmony Pill'],
    location: 'Wudang Peaks',
    philosophy: 'Balance yields strength.',
    type: 'righteous',
    realm: 6,
    power: 11200,
    reputation: 0,
    requirements: { minRealm: 4 },
    benefits: { techniques: ['wudang_taiyi_sword'], resources: { spiritStones: 65 } },
    rivals: ['darkness_sect'],
    allies: ['mount_hua_sect']
}, {
    id: 'emei_sect',
    name: 'Emei Sect',
    description: 'Renowned for their combination of sword and healing arts.',
    leaderName: 'Emei Matron',
    leaderTitle: 'Matron of Emei',
    leaderDescription: 'Graceful swordmaster and healer.',
    leaderAge: 50000000,
    leaderCultivation: 'True Heaven Immortal',
    leaderTechniques: ['emei_sword_dance', 'healing_lotus'],
    sectComposition: { leader: 1, healers: 10 },
    pills: ['Healing Lotus Pill'],
    location: 'Emei Temple',
    philosophy: 'Grace and mercy in combat.',
    type: 'righteous',
    realm: 5,
    power: 9800,
    reputation: 0,
    requirements: { minRealm: 4 },
    benefits: { techniques: ['emei_sword_dance'], resources: { medicalManuals: 6 } },
    rivals: ['blood_moon_sect'],
    allies: ['buddha_sect']
}, {
    id: 'beggars_sect',
    name: "Beggar's Sect",
    description: 'A loose brotherhood famed for unorthodox techniques and a network among commoners.',
    leaderName: 'Chief Beggar',
    leaderTitle: 'Chief of Beggars',
    leaderDescription: 'Charismatic organizer of commonfolk fighters.',
    leaderAge: 40000000,
    leaderCultivation: 'Perfect Immortal Emperor rank 1',
    leaderTechniques: ['beggar_club_tactics'],
    sectComposition: { leader: 1, brigades: 'many' },
    pills: ['Street Herb'],
    location: 'Wandering Encampments',
    philosophy: 'Unity in oddity.',
    type: 'neutral',
    realm: 5,
    power: 9000,
    reputation: 0,
    requirements: { minRealm: 3 },
    benefits: { techniques: ['beggar_club_tactics'], resources: { yuan: 5000 } },
    rivals: ['demon_immortal_palace'],
    allies: ['lower_south_sect']
}, {
    id: 'huashan_sword_school',
    name: 'Huashan Sword School',
    description: 'A focused sword school branch of Mount Hua, obsessive about precision and dueling.',
    leaderName: 'Huashan Blade',
    leaderTitle: 'Master of Huashan',
    leaderDescription: 'An obsessive duelist focused on precision.',
    leaderAge: 52000000,
    leaderCultivation: 'Heaven Immortal',
    leaderTechniques: ['sky_cleaver_slash'],
    sectComposition: { leader: 1, duelists: 20 },
    pills: ['Edge Sharpen Pill'],
    location: 'Huashan',
    philosophy: 'Perfection through repetition.',
    type: 'righteous',
    realm: 6,
    power: 10400,
    reputation: 0,
    requirements: { minRealm: 4 },
    benefits: { techniques: ['sky_cleaver_slash'], resources: { swordManuals: 5 } },
    rivals: ['mount_hua_sect'],
    allies: ['wudang_sect']
}, {
    id: 'xingyun_sect',
    name: 'Xingyun Sect',
    description: 'A sect attuned to fate and stars.',
    leaderName: 'Star Chancellor',
    leaderTitle: 'Chancellor of Xingyun',
    leaderDescription: 'A fate-weaver who crafts destiny into martial technique.',
    leaderAge: 60000000,
    leaderCultivation: 'Heaven Immortal',
    leaderTechniques: ['star_binding'],
    sectComposition: { leader: 1, seers: 6 },
    pills: ['Fate Pill'],
    location: 'Celestial Terrace',
    philosophy: 'Fate guides the blade.',
    type: 'ancient',
    realm: 6,
    power: 11800,
    reputation: 0,
    requirements: { minRealm: 5, specialRequirements: ['celestial_affinity'] },
    benefits: { techniques: ['star_binding'], resources: { starEssence: 60 } },
    rivals: ['starlight_sect'],
    allies: ['eternal_dao_academy']
}, {
    id: 'ming_cult',
    name: 'Ming Cult',
    description: 'A charismatic organization mixing faith, swordplay, and rituals.',
    leaderName: 'Grandmaster Ming',
    leaderTitle: 'Grandmaster of Ming Cult',
    leaderDescription: 'Inspires zeal and devotion in followers.',
    leaderAge: 70000000,
    leaderCultivation: 'Loose Immortal',
    leaderTechniques: ['righteous_flame_ritual'],
    sectComposition: { leader: 1, preachers: 'many' },
    pills: ['Cultist Pill'],
    location: 'Ming Citadel',
    philosophy: 'Faith strengthens the blade.',
    type: 'neutral',
    realm: 5,
    power: 9800,
    reputation: 0,
    requirements: { minRealm: 4 },
    benefits: { techniques: ['righteous_flame_ritual'], resources: { followers: 200 } },
    rivals: ['heavenly_court'],
    allies: []
}, {
    id: 'wanshou_valley',
    name: 'Wanshou Valley',
    description: 'A secluded valley famed for beast-taming and longevity arts.',
    leaderName: 'Valley Sage',
    leaderTitle: 'Sage of Wanshou',
    leaderDescription: 'Master of beasts and longevity.',
    leaderAge: 80000000,
    leaderCultivation: 'Perfect Immortal emperor Rank 2',
    leaderTechniques: ['beast_whisper'],
    sectComposition: { leader: 1, tamers: 12 },
    pills: ['Longevity Brew'],
    location: 'Wanshou Valley',
    philosophy: 'Life is a covenant with beasts.',
    type: 'neutral',
    realm: 5,
    power: 9200,
    reputation: 0,
    requirements: { minRealm: 4 },
    benefits: { techniques: ['beast_whisper'], resources: { rareHerbs: 90 } },
    rivals: ['upper_north_sect'],
    allies: []
}, {
    id: 'qingcheng_sect',
    name: 'Qingcheng Sect',
    description: 'A quiet Taoist sect emphasizing inner tranquility and subtle poisons.',
    leaderName: 'Hermit Qing',
    leaderTitle: 'Hermit of Qingcheng',
    leaderDescription: 'A secluded taoist scholar blending medicine and internal arts.',
    leaderAge: 65000000,
    leaderCultivation: 'True Heaven Immortal',
    leaderTechniques: ['mountain_meditation'],
    sectComposition: { leader: 1, hermits: 8 },
    pills: ['Antidote Pill'],
    location: 'Qingcheng',
    philosophy: 'Stillness breeds insight.',
    type: 'righteous',
    realm: 5,
    power: 9400,
    reputation: 0,
    requirements: { minRealm: 4 },
    benefits: { techniques: ['mountain_meditation'], resources: { medicinalHerbs: 70 } },
    rivals: ['darkness_sect'],
    allies: ['buddha_sect']
}, {
    id: 'celestial_demon_sect',
    name: 'Celestial Demon Sect',
    description: 'Blends celestial forms with demonic power — feared and ostracized.',
    leaderName: 'Demon Lord Celest',
    leaderTitle: 'Lord of Celestial Demon',
    leaderDescription: 'Fuses celestial technique with abyssal force.',
    leaderAge: 230000000,
    leaderCultivation: 'Silver Immortal',
    leaderTechniques: ['demon_heaven_merge'],
    sectComposition: { leader: 1, demon_knights: 6 },
    pills: ['Demonic Essence'],
    location: 'Fallen Spire',
    philosophy: 'Power above all.',
    type: 'demonic',
    realm: 7,
    power: 13500,
    reputation: 0,
    requirements: { minRealm: 6, karma: -30 },
    benefits: { techniques: ['demon_heaven_merge'], resources: { demonEssence: 80 } },
    rivals: ['heavenly_court'],
    allies: ['demon_immortal_palace']
}, {
    id: 'sword_sect_mount_shu',
    name: 'Sword Sect of Mount Shu',
    description: 'A proud sword sect from Mount Shu obsessed with refining blade art.',
    leaderName: 'Swordmaster Shu',
    leaderTitle: 'Swordmaster of Mount Shu',
    leaderDescription: 'A swordsman-philosopher pursuing blade perfection.',
    leaderAge: 98000000,
    leaderCultivation: 'Mystic Immortal',
    leaderTechniques: ['shu_blade_code'],
    sectComposition: { leader: 1, blade_masters: 10 },
    pills: ['Sword Spirit Pill'],
    location: 'Mount Shu',
    philosophy: 'Blade refines soul.',
    type: 'ancient',
    realm: 6,
    power: 10900,
    reputation: 0,
    requirements: { minRealm: 5 },
    benefits: { techniques: ['shu_blade_code'], resources: { swordManuals: 6 } },
    rivals: ['huashan_sword_school'],
    allies: ['xian_network']
}, {
    id: 'heavenly_dao_sect',
    name: 'Heavenly Dao Sect',
    description: 'A lofty sect devoted to mastering the Heavenly Dao and governance of fate.',
    leaderName: 'Heaven Prelate',
    leaderTitle: 'Prelate of the Heavenly Dao',
    leaderDescription: 'A transcendent jurist who codifies fate and dao laws.',
    leaderAge: 300000000,
    leaderCultivation: 'Perfect Immortal Emperor rank 5',
    leaderTechniques: ['heavenly_dao_calculation'],
    sectComposition: { leader: 1, prelates: 4 },
    pills: ['Dao Insight Pill'],
    location: 'Heaven Council',
    philosophy: 'Order through cosmic law.',
    type: 'ancient',
    realm: 8,
    power: 18000,
    reputation: 0,
    requirements: { minRealm: 6, minCombatPower: 9000 },
    benefits: { techniques: ['heavenly_dao_calculation'], resources: { daoInsights: 12 } },
    rivals: ['void_emperor_sect'],
    allies: ['eternal_dao_academy']
}, {
    id: 'lingxiao_palace',
    name: 'Lingxiao Palace',
    description: 'A secretive palace of etheric refinement, specializing in immortal techniques and soul-forging.',
    leaderName: 'Palace Matron Lingxiao',
    leaderTitle: 'Matron of Lingxiao Palace',
    leaderDescription: 'Keeper of soul-forging rites and arcane immortal arts.',
    leaderAge: 260000000,
    leaderCultivation: 'Silver Immortal',
    leaderTechniques: ['lingxiao_soul_forge'],
    sectComposition: { leader: 1, forgers: 8 },
    pills: ['Ethereal Pill'],
    location: 'Lingxiao Palace',
    philosophy: 'Forge the soul to shape destiny.',
    type: 'hidden',
    realm: 7,
    power: 15000,
    reputation: 0,
    requirements: { minRealm: 6 },
    benefits: { techniques: ['lingxiao_soul_forge'], resources: { ethereal_ore: 40 } },
    rivals: ['demon_immortal_palace'],
    allies: ['void_emperor_sect']
});
// Add missing leader metadata for Ten Great Martial member sects that were
// restored from build artifacts but lacked explicit leader fields in the
// canonical TypeScript source. These are lightweight, authoritative entries
// (name/title/one-line description) so the UI and tests can display leaders.
const _TEN_GREAT_MARTIAL_LEADERS = {
    diancang_sect: {
        leaderName: 'Master Diancang',
        leaderTitle: 'Grand Chancellor of Diancang',
        leaderDescription: 'An elder strategist famed for elegance in sabercraft and political cunning.'
    },
    kongtong_sect: {
        leaderName: 'Elder Kong',
        leaderTitle: 'Patriarch of Kongtong',
        leaderDescription: 'A venerable daoist whose balance of insight and blade technique is unrivaled.'
    },
    zhongnan_sect: {
        leaderName: 'Zhongnan Master',
        leaderTitle: 'Sage of Zhongnan',
        leaderDescription: 'A hermit-sage who governs the mountain’s rites and secret sword postures.'
    },
    lingxiao_sect: {
        leaderName: 'Palace Matron Lingxiao',
        leaderTitle: 'Matron of Lingxiao Palace',
        leaderDescription: 'Keeper of soul-forging rites and arcane immortal arts.'
    },
    heavenly_dao_sect: {
        leaderName: 'High Prelate of Heaven',
        leaderTitle: 'Heavenly Prelate',
        leaderDescription: 'A transcendent jurist dedicated to the codification of Daoic law and fate.'
    },
    sword_sect_mount_shu: {
        leaderName: 'Lord Shu',
        leaderTitle: 'Swordmaster of Mount Shu',
        leaderDescription: 'A swordsman-philosopher who pursues blade perfection as spiritual practice.'
    },
    celestial_demon_sect: {
        leaderName: 'Demon Regent',
        leaderTitle: 'Regent of the Celestial Demon',
        leaderDescription: 'A fearsome cultivator who fuses celestial technique with abyssal force.'
    },
    qingcheng_sect: {
        leaderName: 'Hermit Qing',
        leaderTitle: 'Hermit of Qingcheng',
        leaderDescription: 'A secluded taoist scholar who blends medicine with subtle internal arts.'
    },
    wanshou_valley: {
        leaderName: 'Valley Elder',
        leaderTitle: 'Elder of Wanshou',
        leaderDescription: 'Master of longevity arts and beast companionship within the secret valley.'
    },
    ming_cult: {
        leaderName: 'Cult Grandmaster',
        leaderTitle: 'Grandmaster of the Ming Cult',
        leaderDescription: 'A charismatic leader whose rituals inspire fierce loyalty and martial zeal.'
    },
    xingyun_sect: {
        leaderName: 'Star Chancellor',
        leaderTitle: 'Chancellor of Xingyun',
        leaderDescription: 'A fate-weaver who reads omens and crafts destiny into martial technique.'
    }
};
// Merge leader metadata into MAJOR_SECTS where entries exist but lack leaderName.
exports.MAJOR_SECTS.forEach(s => {
    if (s && s.id && !Object.prototype.hasOwnProperty.call(_TEN_GREAT_MARTIAL_LEADERS, s.id))
        return;
    const meta = _TEN_GREAT_MARTIAL_LEADERS[s.id];
    if (!meta)
        return;
    // Only set fields that are missing so we don't override intentionally authored data.
    if (!s.leaderName && meta.leaderName)
        s.leaderName = meta.leaderName;
    if (!s.leaderTitle && meta.leaderTitle)
        s.leaderTitle = meta.leaderTitle;
    if (!s.leaderDescription && meta.leaderDescription)
        s.leaderDescription = meta.leaderDescription;
});
// Broad set of major sect leader stubs for other important factions in the game.
// These are intentionally minimal; you said you'd set cultivation/lifespan fields yourself.
const _MAJOR_SECT_LEADERS = {
    azure_cloud_sect: { leaderName: 'Cloud Patriarch', leaderTitle: 'Patriarch of Azure Cloud', leaderDescription: 'A moral leader guiding disciples through cloud-walking arts.' },
    blood_moon_sect: { leaderName: 'Crimson Lord', leaderTitle: 'Lord of the Blood Moon', leaderDescription: 'Wields forbidden blood techniques and commands fierce loyalty.' },
    eternal_dao_academy: { leaderName: 'Dean Ershi', leaderTitle: 'Dean of the Eternal Dao Academy', leaderDescription: 'A venerable scholar who preserves ancient Daoic knowledge.' },
    dragon_emperor_palace: { leaderName: 'Dragon Emperor', leaderTitle: 'Emperor of Dragons', leaderDescription: 'Supreme leader of the dragon race with unmatched bloodline mastery.' },
    emptiness_emperor_sect: { leaderName: 'Emperor of Emptiness', leaderTitle: 'Emptiness Emperor', leaderDescription: 'A mysterious sovereign who manipulates dimensional emptiness.' },
    buddha_sect: { leaderName: 'Buddha Patriarch', leaderTitle: 'Patriarch of the Buddha Sect', leaderDescription: 'Embodies compassion and leads with spiritual wisdom.' },
    starlight_sect: { leaderName: 'Celestial Captain', leaderTitle: 'Captain of Starlight', leaderDescription: 'A master of celestial arts and cosmic navigation.' },
    lower_south_sect: { leaderName: 'Southern Master', leaderTitle: 'Master of the Lower South', leaderDescription: 'A tactician in fluid combat and terrain manipulation.' },
    darkness_sect: { leaderName: 'Umbra Lord', leaderTitle: 'Lord of Darkness', leaderDescription: 'Controls shadow techniques and covert orders.' },
    wudang_sect: { leaderName: 'Wudang Elder', leaderTitle: 'Elder of Wudang', leaderDescription: 'Balanced swordsman and internal cultivator leading the sect.' },
    emei_sect: { leaderName: 'Emei Matron', leaderTitle: 'Matron of Emei', leaderDescription: 'Graceful swordmaster and healer, upholding tradition.' },
    kunlun_sect: { leaderName: 'Kunlun Patriarch', leaderTitle: 'Patriarch of Kunlun', leaderDescription: 'A sage-warrior who defends the western peaks.' },
    beggars_sect: { leaderName: "Chief Beggar", leaderTitle: "Chief of the Beggars' Sect", leaderDescription: 'A charismatic leader organizing the brotherhood.' },
    huashan_sword_school: { leaderName: 'Blade Master Huashan', leaderTitle: 'Master of Huashan Sword School', leaderDescription: 'An obsessive duelist focused on precision and technique.' },
    // (single entry kept for Dragon Emperor Palace above)
};
// Merge the broader leader stubs into MAJOR_SECTS (non-destructive: only fill missing fields)
exports.MAJOR_SECTS.forEach(s => {
    if (!s || !s.id)
        return;
    const meta = _MAJOR_SECT_LEADERS[s.id];
    if (!meta)
        return;
    if (!s.leaderName && meta.leaderName)
        s.leaderName = meta.leaderName;
    if (!s.leaderTitle && meta.leaderTitle)
        s.leaderTitle = meta.leaderTitle;
    if (!s.leaderDescription && meta.leaderDescription)
        s.leaderDescription = meta.leaderDescription;
});
// Helper: map permissive leaderCultivation strings (from built artifact) to canonical realm keys.
function mapCultivationStringToRealmKey(cult) {
    if (!cult || typeof cult !== 'string')
        return undefined;
    const s = cult.toLowerCase();
    if (s.includes('mortal'))
        return 'mortal';
    if (s.includes('qi'))
        return 'qi_refinement';
    if (s.includes('foundation'))
        return 'foundation_establishment';
    if (s.includes('core'))
        return 'core_formation';
    if (s.includes('nascent'))
        return 'nascent_soul';
    if (s.includes('soul'))
        return 'soul_transformation';
    if (s.includes('void'))
        return 'emptiness_refinement';
    if (s.includes('body'))
        return 'body_integration';
    if (s.includes('tribulation'))
        return 'tribulation_transcendence';
    if (s.includes('mahayana'))
        return 'mahayana';
    if (s.includes('golden'))
        return 'golden_immortal';
    if (s.includes('taiyi'))
        return 'taiyi_golden_immortal';
    if (s.includes('daluo'))
        return 'daluo_golden_immortal';
    if (s.includes('loose immortal') || s.includes('loose'))
        return 'loose_immortal';
    if (s.includes('true heaven'))
        return 'true_heaven_immortal';
    if (s.includes('heaven'))
        return 'heaven_immortal';
    if (s.includes('mystic'))
        return 'mystic_immortal';
    if (s.includes('silver'))
        return 'silver_immortal';
    if (s.includes('perfect') && s.includes('emperor'))
        return 'perfect_immortal_emperor_rank1';
    if (s.includes('mystic divine'))
        return 'mystic_celestial_origin_1';
    if (s.includes('zenith') || s.includes('quasi-sage') || s.includes('sage') || s.includes('saint') || s.includes('pseudo') || s.includes('perfected') || s.includes('freedom') || s.includes('pseudo') || s.includes('great dao') || s.includes('dao converging') || s.includes('supreme') || s.includes('dao creator') || s.includes('saint sovereign') || s.includes('eternal dao') || s.includes('dao ancestor') || s.includes('absolute existence') || s.includes('primordial')) {
        // Prefer a safe legacy mapping for very high-tier labels: map to a reasonable peak key
        if (s.includes('primordial') || s.includes('dao ancestor'))
            return 'dao_ancestor_peak';
        if (s.includes('eternal dao'))
            return 'eternal_dao_emperor_peak';
        if (s.includes('saint'))
            return 'saint_peak';
        // fallback to a high-tier quasi-sage peak
        return 'quasi_sage_peak';
    }
    return undefined;
}
// Default leaderRealm for existing MAJOR_SECTS from permissive leaderCultivation where available.
exports.MAJOR_SECTS.forEach(s => {
    if (!s.leaderRealm && s.leaderCultivation) {
        const mapped = mapCultivationStringToRealmKey(s.leaderCultivation);
        if (mapped)
            s.leaderRealm = mapped;
    }
});
// Deduplicate MAJOR_SECTS by id. If multiple entries share the same id prefer the one
// whose leaderName is 'Bei Ling' (user requested keeping Bei Ling) otherwise keep the
// first occurrence. This guards against duplicate entries copied from built artifacts.
(() => {
    const byId = new Map();
    for (const s of exports.MAJOR_SECTS) {
        const existing = byId.get(s.id);
        if (!existing) {
            byId.set(s.id, s);
            continue;
        }
        // If the new entry is specifically the Bei Ling variant, prefer it.
        if (s.leaderName === 'Bei Ling') {
            byId.set(s.id, s);
            continue;
        }
        // If the existing is Bei Ling, keep existing. Otherwise keep existing (no-op).
    }
    // Replace MAJOR_SECTS in-place to preserve exported reference.
    exports.MAJOR_SECTS.length = 0;
    exports.MAJOR_SECTS.push(...Array.from(byId.values()));
})();
// Normalize leader ages for a few sects per user request without editing generated artifacts.
(() => {
    const target = new Set([
        'diancang_sect',
        'kongtong_sect',
        'zhongnan_sect',
        'lingxiao_sect',
        'heavenly_dao_sect',
        'sword_sect_mount_shu',
        'celestial_demon_sect',
        'qingcheng_sect',
        'wanshou_valley_sect',
        'ming_cult',
        'xingyun_sect'
    ]);
    try {
        exports.MAJOR_SECTS.forEach(s => {
            if (s && typeof s.id === 'string' && target.has(s.id)) {
                // Set leaderAge to 30,000,000 (use number for canonical source)
                s.leaderAge = 30000000;
            }
        });
    }
    catch (e) {
        // Ignore errors to keep this normalization non-fatal
        logger_1.logger.warn('Sect leader age normalization failed:', e);
    }
})();
exports.MAJOR_FACTIONS = [
    {
        id: 'ten_great_martial_sects_alliance',
        name: 'Ten Great Martial Sects Alliance',
        description: 'A formal alliance of the ten great martial sects formed to coordinate defense and share restricted techniques.',
        members: exports.MAJOR_SECTS.map(s => s.id)
    },
    // Additional high-level factions / schools often referenced by systems and UI
    {
        id: 'heavenly_merchant_guild',
        name: 'Heavenly Merchant Guild',
        description: 'The largest trading organization spanning multiple realms.',
        members: [],
        services: [
            { id: 'rare_item_access', name: 'Rare Item Access', cost: { yuan: 10000 }, requirements: { minStanding: 40 } },
            { id: 'trade_protection', name: 'Trade Route Protection', cost: { yuan: 5000 }, requirements: { minStanding: 25 } }
        ],
        territories: ['trade_cities', 'merchant_routes']
    },
    {
        id: 'heavenly_court',
        name: 'Heavenly Court',
        description: 'Upholds celestial order through divine judgment and political influence.',
        members: [],
        services: [
            { id: 'heavenly_judgment', name: 'Heavenly Judgment', cost: { karma: 80 }, requirements: { minRealm: 8 } },
            { id: 'celestial_chains', name: 'Celestial Chains', cost: { spiritStones: 200 }, requirements: { minStanding: 40 } }
        ]
    },
    {
        id: 'demon_immortal_palace',
        name: 'Demon Immortal Palace',
        description: 'An organization of forbidden practitioners seeking immortality at any cost.',
        members: ['demon_immortal_palace'],
        services: [
            { id: 'soul_absorption', name: 'Soul Absorption', cost: { karma: -100, bloodEssence: 50 }, requirements: { minRealm: 7 } },
            { id: 'immortal_wrath', name: 'Immortal\'s Wrath', cost: { forbiddenManuals: 3 }, requirements: { minStanding: 50 } }
        ]
    },
    {
        id: 'tao_school',
        name: 'Tao School',
        description: 'A scholarly order that teaches the flowing principles of Dao.',
        members: [],
        services: [
            { id: 'daoist_palm', name: 'Daoist Palm Training', cost: { spiritStones: 150 }, requirements: { minRealm: 5 } },
            { id: 'flowing_dao', name: 'Flowing Dao Strike', cost: { spiritStones: 200 }, requirements: { minRealm: 6 } }
        ]
    }
];
exports.MAJOR_ALLIANCES = [
    {
        id: 'ten_great_martial_sects_alliance',
        name: 'Ten Great Martial Sects Alliance',
        members: exports.MAJOR_SECTS.map(s => s.id)
    }
];
class SectFactionSystem {
    constructor(rivalSystem) {
        this.playerSect = null;
        this.sectReputations = {};
        this.factionStandings = {};
        // RivalSystem is optional for tests that instantiate SectFactionSystem without one
        if (rivalSystem)
            this.rivalSystem = rivalSystem;
        exports.MAJOR_SECTS.forEach(sect => {
            this.sectReputations[sect.id] = 0;
        });
        exports.MAJOR_FACTIONS.forEach(f => {
            this.factionStandings[f.id] = 0;
        });
    }
    // Run a tournament among top disciples of a sect. Builds profiles using generateRivalFromSect
    // and applies a small reputation bonus to the sect if one of its disciples wins.
    runTournamentForSect(sectId, count = 32, playerLevel = 10) {
        try {
            count = Math.max(2, Math.min(128, count));
            const profiles = [];
            for (let i = 0; i < count; i++) {
                const rival = this.generateRivalFromSect(sectId, playerLevel);
                // give each rival a unique id so deterministic jitter works
                rival.id = `${sectId}_r_${i}`;
                profiles.push(rival);
            }
            const ms = new MiniGameSystem_1.MiniGameSystem();
            const res = ms.runSectTournament(count, profiles);
            // apply reputation and prestige/loot to the sect for hosting/winning
            const bonus = 5; // small boost to reputation for hosting
            this.adjustSectReputation(sectId, bonus);
            // richer consequence: award prestige points to winner's sect (stored in factionStandings)
            try {
                // small prestige depending on bracket size
                const prestige = Math.max(1, Math.floor((res.bracketSize || 16) / 8));
                this.factionStandings[sectId] = (this.factionStandings[sectId] || 0) + prestige;
                // optionally drop a small loot reward into a sect-level pool (represented as reputation increases)
                this.adjustSectReputation(sectId, Math.floor(prestige / 2));
            }
            catch (e) {
                // ignore non-fatal
            }
            return { winnerId: res.winnerIndex, result: res };
        }
        catch (e) {
            // non-fatal
            return null;
        }
    }
    // Run a faction war and apply simplified territorial/standing consequences.
    // This intentionally does not execute in real-time; it returns a result and applies immediate consequences.
    runFactionWar(attackerFactionId, defenderFactionId, attackerStrength, defenderStrength) {
        try {
            const ms = new MiniGameSystem_1.MiniGameSystem();
            const res = ms.runFactionWar(attackerStrength, defenderStrength, 12);
            // apply simple standings adjustments based on victor
            if (res.victor === 'attacker') {
                this.adjustFactionStanding(attackerFactionId, 10);
                this.adjustFactionStanding(defenderFactionId, -8);
            }
            else if (res.victor === 'defender') {
                this.adjustFactionStanding(defenderFactionId, 6);
                this.adjustFactionStanding(attackerFactionId, -4);
            }
            else {
                // stalemate small mutual loss
                this.adjustFactionStanding(attackerFactionId, -2);
                this.adjustFactionStanding(defenderFactionId, -2);
            }
            return res;
        }
        catch (e) {
            return null;
        }
    }
    joinSect(sectId, playerState) {
        const sect = exports.MAJOR_SECTS.find(s => s.id === sectId);
        if (!sect)
            return false;
        this.playerSect = sectId;
        this.sectReputations[sectId] = Math.max(this.sectReputations[sectId] || 0, 25);
        this.applySectBenefits(sect, playerState);
        // adjust rival relationships in a safe way if RivalSystem is available
        if (this.rivalSystem && typeof this.rivalSystem.updateRivalRelationship === 'function') {
            try {
                // simple placeholder behavior: slightly anger rivals
                (sect.rivals || []).forEach(rid => this.rivalSystem && this.rivalSystem.updateRivalRelationship(rid, -10));
            }
            catch (e) {
                // ignore errors from external system
            }
        }
        return true;
    }
    leaveSect() {
        if (!this.playerSect)
            return;
        const id = this.playerSect;
        const cur = this.sectReputations[id] || 0;
        this.sectReputations[id] = Math.max(-100, cur - 20);
        this.playerSect = null;
    }
    applySectBenefits(sect, playerState) {
        if (!sect.benefits)
            return;
        if (Array.isArray(sect.benefits.techniques)) {
            playerState.techniques = playerState.techniques || [];
            sect.benefits.techniques.forEach((t) => {
                if (!playerState.techniques.includes(t))
                    playerState.techniques.push(t);
            });
        }
        if (sect.benefits && sect.benefits.resources) {
            Object.entries(sect.benefits.resources).forEach(([k, v]) => {
                playerState[k] = (playerState[k] || 0) + Number(v);
            });
        }
    }
    getAvailableSects(playerState) {
        // basic requirement filter
        return exports.MAJOR_SECTS.filter(sect => {
            const req = sect.requirements || {};
            if (req.minRealm && playerState.realm < req.minRealm)
                return false;
            if (req.minCombatPower && playerState.combatPower < req.minCombatPower)
                return false;
            return true;
        });
    }
    getPlayerSect() {
        return this.playerSect;
    }
    getSectReputation(sectId) {
        return this.sectReputations[sectId] || 0;
    }
    generateRivalFromSect(sectId, playerLevel) {
        const sect = exports.MAJOR_SECTS.find(s => s.id === sectId);
        const sectName = sect ? sect.name : sectId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        // Resolve RNG at call-time using central helper
        const rivalState = this.rivalSystem && typeof this.rivalSystem.getState === 'function' ? this.rivalSystem.getState() : undefined;
        const rngForLevel = (0, rng_1.getRng)(rivalState);
        const levelOffset = (0, rng_1.randInt)(5, { rng: rngForLevel }); // 0..4
        const level = Math.max(playerLevel, Math.min(99, playerLevel + levelOffset));
        return {
            name: `${sectName} Disciple`,
            sect: sectId,
            level,
            techniques: (sect && sect.benefits && Array.isArray(sect.benefits.techniques) ? sect.benefits.techniques.slice(0, 2) : ['basic_attack']),
            stats: {
                hp: 80 + level * 6,
                qi: 60 + level * 5,
                atk: 8 + level * 1.2,
                def: 6 + level * 1,
                speed: 6 + Math.floor(level * 0.6)
            }
        };
    }
    adjustSectReputation(sectId, amount) {
        this.sectReputations[sectId] = Math.max(-100, Math.min(100, (this.sectReputations[sectId] || 0) + amount));
    }
    adjustFactionStanding(factionId, amount) {
        this.factionStandings[factionId] = Math.max(-1000, Math.min(1000, (this.factionStandings[factionId] || 0) + amount));
    }
    getAllReputations() {
        return { ...this.sectReputations };
    }
}
exports.SectFactionSystem = SectFactionSystem;
exports.default = SectFactionSystem;
