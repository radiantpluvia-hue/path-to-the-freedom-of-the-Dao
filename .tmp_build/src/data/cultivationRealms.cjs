"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REALM_ORDER = exports.REALM_QI_REQUIREMENTS = exports.CULTIVATION_REALMS = void 0;
exports.getNextRealm = getNextRealm;
exports.getRealmBreakthroughDifficulty = getRealmBreakthroughDifficulty;
exports.getRealmLifespanBonus = getRealmLifespanBonus;
exports.getMinorStageCount = getMinorStageCount;
exports.CULTIVATION_REALMS = {
    // Mortal Realm - 8 realms with 1-9 minor stages each
    mortal: {
        id: 'mortal',
        name: 'Mortal',
        minorStages: 9,
        description: 'The beginning of cultivation journey. Mortals start with limited lifespan and spiritual awareness.',
        qiRequirement: 100,
        lifespanBonus: 0,
        breakthroughDifficulty: 1,
        nextRealm: 'qi_refinement'
    },
    qi_refinement: {
        id: 'qi_refinement',
        name: 'Qi Refinement',
        minorStages: 9,
        description: 'Learning to sense and gather spiritual energy. Foundation of all cultivation.',
        qiRequirement: 1000,
        lifespanBonus: 50,
        breakthroughDifficulty: 3,
        nextRealm: 'foundation_establishment'
    },
    foundation_establishment: {
        id: 'foundation_establishment',
        name: 'Foundation Establishment',
        minorStages: 9,
        description: 'Building a solid foundation for future cultivation. Spiritual energy begins to condense.',
        qiRequirement: 5000,
        lifespanBonus: 100,
        breakthroughDifficulty: 5,
        nextRealm: 'body_integration'
    },
    body_integration: {
        id: 'body_integration',
        name: 'Body Integration',
        minorStages: 9,
        description: 'Integrating spiritual energy with physical body. Greatly enhances physical capabilities.',
        qiRequirement: 15000,
        lifespanBonus: 200,
        breakthroughDifficulty: 8,
        nextRealm: 'mahayana'
    },
    mahayana: {
        id: 'mahayana',
        name: 'Mahayana',
        minorStages: 9,
        description: 'Achieving great vehicle of cultivation. Spiritual energy becomes purer and more refined.',
        qiRequirement: 30000,
        lifespanBonus: 300,
        breakthroughDifficulty: 12,
        nextRealm: 'golden_immortal'
    },
    golden_immortal: {
        id: 'golden_immortal',
        name: 'Golden Immortal',
        minorStages: 9,
        description: 'Achieving immortality with golden core. Lifespan extends significantly.',
        qiRequirement: 60000,
        lifespanBonus: 500,
        breakthroughDifficulty: 20,
        nextRealm: 'taiyi_golden_immortal'
    },
    taiyi_golden_immortal: {
        id: 'taiyi_golden_immortal',
        name: 'Taiyi Golden Immortal',
        minorStages: 9,
        description: 'Advanced golden immortal stage. Spiritual energy reaches new heights of purity.',
        qiRequirement: 120000,
        lifespanBonus: 800,
        breakthroughDifficulty: 35,
        nextRealm: 'daluo_golden_immortal'
    },
    daluo_golden_immortal: {
        id: 'daluo_golden_immortal',
        name: 'Daluo Golden Immortal',
        minorStages: 9,
        description: 'Peak of golden immortal realm. One step away from true divinity.',
        qiRequirement: 250000,
        lifespanBonus: 1200,
        breakthroughDifficulty: 60,
        nextRealm: 'soul_transformation'
    },
    // Soul Transformation Realm - 7 realms with 1-7 minor stages each
    soul_transformation: {
        id: 'soul_transformation',
        name: 'Soul Transformation',
        minorStages: 7,
        description: 'Transforming mortal soul into divine essence. First step into true divinity.',
        qiRequirement: 500000,
        lifespanBonus: 2000,
        breakthroughDifficulty: 100,
        nextRealm: 'void_refinement'
    },
    void_refinement: {
        id: 'void_refinement',
        name: 'Void Refinement',
        minorStages: 7,
        description: 'Refining spiritual energy into void essence. Understanding cosmic emptiness.',
        qiRequirement: 1000000,
        lifespanBonus: 3000,
        breakthroughDifficulty: 150,
        nextRealm: 'saint'
    },
    saint: {
        id: 'saint',
        name: 'Saint',
        minorStages: 7,
        description: 'Achieving sainthood. Spiritual energy becomes saintly essence.',
        qiRequirement: 2000000,
        lifespanBonus: 5000,
        breakthroughDifficulty: 250,
        nextRealm: 'primordial_saint'
    },
    primordial_saint: {
        id: 'primordial_saint',
        name: 'Primordial Saint',
        minorStages: 7,
        description: 'Ancient saint from primordial times. Understanding of cosmic laws deepens.',
        qiRequirement: 4000000,
        lifespanBonus: 8000,
        breakthroughDifficulty: 400,
        nextRealm: 'dao'
    },
    dao: {
        id: 'dao',
        name: 'Dao',
        minorStages: 7,
        description: 'Comprehending the Great Dao. Spiritual energy transforms into dao essence.',
        qiRequirement: 8000000,
        lifespanBonus: 12000,
        breakthroughDifficulty: 600,
        nextRealm: 'eternal_dao_sovereign'
    },
    eternal_dao_sovereign: {
        id: 'eternal_dao_sovereign',
        name: 'Eternal Dao Sovereign',
        minorStages: 7,
        description: 'Sovereign of eternal dao. Mastery over cosmic principles.',
        qiRequirement: 16000000,
        lifespanBonus: 20000,
        breakthroughDifficulty: 900,
        nextRealm: 'infinite_dao_master'
    },
    infinite_dao_master: {
        id: 'infinite_dao_master',
        name: 'Infinite Dao Master',
        minorStages: 7,
        description: 'Master of infinite dao. Understanding reaches beyond cosmic limitations.',
        qiRequirement: 32000000,
        lifespanBonus: 30000,
        breakthroughDifficulty: 1400,
        nextRealm: 'core_formation'
    },
    // Core Formation - 6 realms with 1-5 minor stages each
    core_formation: {
        id: 'core_formation',
        name: 'Core Formation',
        minorStages: 5,
        description: 'Forming divine core. Spiritual energy condenses into divine nucleus.',
        qiRequirement: 64000000,
        lifespanBonus: 50000,
        breakthroughDifficulty: 2000,
        nextRealm: 'nascent_soul'
    },
    nascent_soul: {
        id: 'nascent_soul',
        name: 'Nascent Soul',
        minorStages: 5,
        description: 'Cultivating nascent soul. Spiritual consciousness separates from physical form.',
        qiRequirement: 128000000,
        lifespanBonus: 80000,
        breakthroughDifficulty: 3000,
        nextRealm: 'true_immortal'
    },
    true_immortal: {
        id: 'true_immortal',
        name: 'True Immortal',
        minorStages: 5,
        description: 'Achieving true immortality. Soul becomes eternal and indestructible.',
        qiRequirement: 256000000,
        lifespanBonus: 120000,
        breakthroughDifficulty: 4500,
        nextRealm: 'quasi_saint'
    },
    quasi_saint: {
        id: 'quasi_saint',
        name: 'Quasi-Saint',
        minorStages: 5,
        description: 'Half-step to sainthood. Power approaches divine levels.',
        qiRequirement: 512000000,
        lifespanBonus: 180000,
        breakthroughDifficulty: 6500,
        nextRealm: 'dao_ancestor'
    },
    dao_ancestor: {
        id: 'dao_ancestor',
        name: 'Dao Ancestor',
        minorStages: 5,
        description: 'Ancestor of dao. Understanding reaches primordial levels.',
        qiRequirement: 1024000000,
        lifespanBonus: 250000,
        breakthroughDifficulty: 9000,
        nextRealm: 'dimension_lord'
    },
    dimension_lord: {
        id: 'dimension_lord',
        name: 'Dimension Lord',
        minorStages: 5,
        description: 'Lord of dimensions. Power to create and destroy worlds.',
        qiRequirement: 2048000000,
        lifespanBonus: 350000,
        breakthroughDifficulty: 13000,
        nextRealm: 'chaos_saint'
    },
    // Chaos Saint - 3 realms with 1-3 minor stages each
    chaos_saint: {
        id: 'chaos_saint',
        name: 'Chaos Saint',
        minorStages: 3,
        description: 'Saint of chaos. Understanding primordial chaos and order.',
        qiRequirement: 4096000000,
        lifespanBonus: 500000,
        breakthroughDifficulty: 18000,
        nextRealm: 'supreme_dao_origin'
    },
    supreme_dao_origin: {
        id: 'supreme_dao_origin',
        name: 'Supreme Dao Origin',
        minorStages: 3,
        description: 'Origin of supreme dao. Understanding the source of all existence.',
        qiRequirement: 8192000000,
        lifespanBonus: 750000,
        breakthroughDifficulty: 25000,
        nextRealm: 'void_transcendent'
    },
    void_transcendent: {
        id: 'void_transcendent',
        name: 'Void Transcendent',
        minorStages: 3,
        description: 'Transcending the void. Beyond space and time limitations.',
        qiRequirement: 16384000000,
        lifespanBonus: 1000000,
        breakthroughDifficulty: 35000,
        nextRealm: 'reality_weaver'
    },
    // Single-stage realms - 4 realms with only 1 stage
    reality_weaver: {
        id: 'reality_weaver',
        name: 'Reality Weaver',
        minorStages: 1,
        description: 'Weaver of reality. Power to reshape existence itself.',
        qiRequirement: 32768000000,
        lifespanBonus: 1500000,
        breakthroughDifficulty: 50000,
        nextRealm: 'multiverse_sovereign'
    },
    multiverse_sovereign: {
        id: 'multiverse_sovereign',
        name: 'Multiverse Sovereign',
        minorStages: 1,
        description: 'Sovereign of multiverse. Mastery over infinite realities.',
        qiRequirement: 65536000000,
        lifespanBonus: 2500000,
        breakthroughDifficulty: 75000,
        nextRealm: 'omniversal_emperor'
    },
    omniversal_emperor: {
        id: 'omniversal_emperor',
        name: 'Omniversal Emperor',
        minorStages: 1,
        description: 'Emperor of omniverse. Beyond all known existence.',
        qiRequirement: 131072000000,
        lifespanBonus: 5000000,
        breakthroughDifficulty: 100000,
        nextRealm: 'absolute_existence'
    },
    absolute_existence: {
        id: 'absolute_existence',
        name: 'Absolute Existence',
        minorStages: 1,
        description: 'Absolute existence. The pinnacle of cultivation, beyond mortal comprehension.',
        qiRequirement: 262144000000,
        lifespanBonus: 10000000,
        breakthroughDifficulty: 150000,
        nextRealm: 'primordial_chaos_lord'
    },
    primordial_chaos_lord: {
        id: 'primordial_chaos_lord',
        name: 'Primordial Chaos Lord',
        minorStages: 1,
        description: 'Lord of primordial chaos. Master of the fundamental forces that existed before creation.',
        qiRequirement: 524288000000,
        lifespanBonus: 20000000,
        breakthroughDifficulty: 200000,
        nextRealm: 'eternal_dao_emperor'
    },
    eternal_dao_emperor: {
        id: 'eternal_dao_emperor',
        name: 'Eternal Dao Emperor',
        minorStages: 1,
        description: 'Emperor of the eternal dao. The ultimate pinnacle of cultivation, transcending all existence and non-existence.',
        qiRequirement: 1048576000000,
        lifespanBonus: 50000000,
        breakthroughDifficulty: 300000,
        nextRealm: undefined
    }
};
exports.REALM_QI_REQUIREMENTS = Object.fromEntries(Object.entries(exports.CULTIVATION_REALMS).map(([key, realm]) => [key, realm.qiRequirement]));
// Export an explicit realm order to keep numeric realmId stable even if the
// `CULTIVATION_REALMS` object is edited or additional realms are added later.
// This prevents accidental shifting of `realmId` values which other parts of
// the codebase (and saved game state) may depend on.
exports.REALM_ORDER = [
    'mortal',
    'qi_refinement',
    'foundation_establishment',
    'body_integration',
    'mahayana',
    'golden_immortal',
    'taiyi_golden_immortal',
    'daluo_golden_immortal',
    'soul_transformation',
    'void_refinement',
    'saint',
    'primordial_saint',
    'dao',
    'eternal_dao_sovereign',
    'infinite_dao_master',
    'core_formation',
    'nascent_soul',
    'true_immortal',
    'quasi_saint',
    'dao_ancestor',
    'dimension_lord',
    'chaos_saint',
    'supreme_dao_origin',
    'void_transcendent',
    'reality_weaver',
    'multiverse_sovereign',
    'omniversal_emperor',
    'absolute_existence',
    'primordial_chaos_lord',
    'eternal_dao_emperor'
];
function getNextRealm(currentRealm) {
    return exports.CULTIVATION_REALMS[currentRealm]?.nextRealm;
}
function getRealmBreakthroughDifficulty(currentRealm) {
    return exports.CULTIVATION_REALMS[currentRealm]?.breakthroughDifficulty || 0;
}
function getRealmLifespanBonus(currentRealm) {
    return exports.CULTIVATION_REALMS[currentRealm]?.lifespanBonus || 0;
}
function getMinorStageCount(realm) {
    return exports.CULTIVATION_REALMS[realm]?.minorStages || 1;
}
