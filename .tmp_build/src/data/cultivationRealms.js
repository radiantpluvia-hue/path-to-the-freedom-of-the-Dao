"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REALM_QI_REQUIREMENTS = exports.REALM_ORDER = exports.CULTIVATION_REALMS = void 0;
exports.getNextRealm = getNextRealm;
exports.getRealmBreakthroughDifficulty = getRealmBreakthroughDifficulty;
exports.getRealmLifespanBonus = getRealmLifespanBonus;
exports.getMinorStageCount = getMinorStageCount;
// Base (explicit) realm entries for canonical named realms. These are authoritative
// and will be used to seed explicit entries for any expanded variant ids.
const BASE_REALMS = {
    mortal: {
        id: 'mortal', name: 'Mortal', minorStages: 9,
        description: 'The beginning of cultivation journey. Mortals start with limited lifespan and spiritual awareness.',
        qiRequirement: 100, lifespanBonus: 0, breakthroughDifficulty: 1, nextRealm: 'qi_refinement'
    },
    qi_refinement: {
        id: 'qi_refinement', name: 'Qi Refinement', minorStages: 9,
        description: 'Learning to sense and gather spiritual energy. Foundation of all cultivation.',
        qiRequirement: 1000, lifespanBonus: 50, breakthroughDifficulty: 3, nextRealm: 'foundation_establishment'
    },
    foundation_establishment: {
        id: 'foundation_establishment', name: 'Foundation Establishment', minorStages: 9,
        description: 'Building a solid foundation for future cultivation. Spiritual energy begins to condense.',
        qiRequirement: 5000, lifespanBonus: 100, breakthroughDifficulty: 5, nextRealm: 'core_formation'
    },
    body_integration: {
        id: 'body_integration', name: 'Body Integration', minorStages: 9,
        description: 'Integrating spiritual energy with physical body. Greatly enhances physical capabilities.',
        qiRequirement: 15000, lifespanBonus: 200, breakthroughDifficulty: 8, nextRealm: 'mahayana'
    },
    mahayana: {
        id: 'mahayana', name: 'Mahayana', minorStages: 9,
        description: 'Achieving great vehicle of cultivation. Spiritual energy becomes purer and more refined.',
        qiRequirement: 30000, lifespanBonus: 300, breakthroughDifficulty: 12, nextRealm: 'golden_immortal'
    },
    golden_immortal: {
        id: 'golden_immortal', name: 'Golden Immortal', minorStages: 9,
        description: 'Achieving immortality with golden core. Lifespan extends significantly.',
        qiRequirement: 60000, lifespanBonus: 500, breakthroughDifficulty: 20, nextRealm: 'taiyi_golden_immortal'
    },
    taiyi_golden_immortal: {
        id: 'taiyi_golden_immortal', name: 'Taiyi Golden Immortal', minorStages: 9,
        description: 'Advanced golden immortal stage. Spiritual energy reaches new heights of purity.',
        qiRequirement: 120000, lifespanBonus: 800, breakthroughDifficulty: 35, nextRealm: 'daluo_golden_immortal'
    },
    daluo_golden_immortal: {
        id: 'daluo_golden_immortal', name: 'Daluo Golden Immortal', minorStages: 9,
        description: 'Peak of golden immortal realm. One step away from true divinity.',
        qiRequirement: 250000, lifespanBonus: 1200, breakthroughDifficulty: 60, nextRealm: 'true_immortal'
    },
    soul_transformation: {
        id: 'soul_transformation', name: 'Soul Transformation', minorStages: 7,
        description: 'Transforming mortal soul into divine essence. First step into true divinity.',
        qiRequirement: 500000, lifespanBonus: 2000, breakthroughDifficulty: 100, nextRealm: 'void_refinement'
    },
    void_refinement: {
        id: 'void_refinement', name: 'Void Refinement', minorStages: 7,
        description: 'Refining spiritual energy into void essence. Understanding cosmic emptiness.',
        qiRequirement: 1000000, lifespanBonus: 3000, breakthroughDifficulty: 150, nextRealm: 'saint'
    },
    saint: {
        id: 'saint', name: 'Saint', minorStages: 7,
        description: 'Achieving sainthood. Spiritual energy becomes saintly essence.',
        qiRequirement: 2000000, lifespanBonus: 5000, breakthroughDifficulty: 250, nextRealm: 'primordial_saint'
    },
    primordial_saint: {
        id: 'primordial_saint', name: 'Primordial Saint', minorStages: 7,
        description: 'Ancient saint from primordial times. Understanding of cosmic laws deepens.',
        qiRequirement: 4000000, lifespanBonus: 8000, breakthroughDifficulty: 400, nextRealm: 'dao'
    },
    dao: {
        id: 'dao', name: 'Dao', minorStages: 7,
        description: 'Comprehending the Great Dao. Spiritual energy transforms into dao essence.',
        qiRequirement: 8000000, lifespanBonus: 12000, breakthroughDifficulty: 600, nextRealm: 'eternal_dao_sovereign'
    },
    eternal_dao_sovereign: {
        id: 'eternal_dao_sovereign', name: 'Eternal Dao Sovereign', minorStages: 7,
        description: 'Sovereign of eternal dao. Mastery over cosmic principles.',
        qiRequirement: 16000000, lifespanBonus: 20000, breakthroughDifficulty: 900, nextRealm: 'infinite_dao_master'
    },
    infinite_dao_master: {
        id: 'infinite_dao_master', name: 'Infinite Dao Master', minorStages: 7,
        description: 'Master of infinite dao. Understanding reaches beyond cosmic limitations.',
        qiRequirement: 32000000, lifespanBonus: 30000, breakthroughDifficulty: 1400, nextRealm: 'dimension_lord'
    },
    core_formation: {
        id: 'core_formation', name: 'Core Formation', minorStages: 5,
        description: 'Forming divine core. Spiritual energy condenses into divine nucleus.',
        qiRequirement: 20000, lifespanBonus: 50000, breakthroughDifficulty: 2000, nextRealm: 'nascent_soul'
    },
    nascent_soul: {
        id: 'nascent_soul', name: 'Nascent Soul', minorStages: 5,
        description: 'Cultivating nascent soul. Spiritual consciousness separates from physical form.',
        qiRequirement: 40000, lifespanBonus: 80000, breakthroughDifficulty: 3000, nextRealm: 'soul_transformation'
    },
    true_immortal: {
        id: 'true_immortal', name: 'True Immortal', minorStages: 5,
        description: 'Achieving true immortality. Soul becomes eternal and indestructible.',
        qiRequirement: 256000000, lifespanBonus: 120000, breakthroughDifficulty: 4500, nextRealm: 'quasi_saint'
    },
    quasi_saint: {
        id: 'quasi_saint', name: 'Quasi-Saint', minorStages: 5,
        description: 'Half-step to sainthood. Power approaches divine levels.',
        qiRequirement: 512000000, lifespanBonus: 180000, breakthroughDifficulty: 6500, nextRealm: 'dao_ancestor'
    },
    dao_ancestor: {
        id: 'dao_ancestor', name: 'Dao Ancestor', minorStages: 5,
        description: 'Ancestor of dao. Understanding reaches primordial levels.',
        qiRequirement: 1024000000, lifespanBonus: 250000, breakthroughDifficulty: 9000, nextRealm: 'dimension_lord'
    },
    dimension_lord: {
        id: 'dimension_lord', name: 'Dimension Lord', minorStages: 5,
        description: 'Lord of dimensions. Power to create and destroy worlds.',
        qiRequirement: 2048000000, lifespanBonus: 350000, breakthroughDifficulty: 13000, nextRealm: 'chaos_saint'
    },
    chaos_saint: {
        id: 'chaos_saint', name: 'Chaos Saint', minorStages: 3,
        description: 'Saint of chaos. Understanding primordial chaos and order.',
        qiRequirement: 4096000000, lifespanBonus: 500000, breakthroughDifficulty: 18000, nextRealm: 'supreme_dao_origin'
    },
    supreme_dao_origin: {
        id: 'supreme_dao_origin', name: 'Supreme Dao Origin', minorStages: 3,
        description: 'Origin of supreme dao. Understanding the source of all existence.',
        qiRequirement: 8192000000, lifespanBonus: 750000, breakthroughDifficulty: 25000, nextRealm: 'void_transcendent'
    },
    void_transcendent: {
        id: 'void_transcendent', name: 'Void Transcendent', minorStages: 3,
        description: 'Transcending the void. Beyond space and time limitations.',
        qiRequirement: 16384000000, lifespanBonus: 1000000, breakthroughDifficulty: 35000, nextRealm: 'reality_weaver'
    },
    reality_weaver: {
        id: 'reality_weaver', name: 'Reality Weaver', minorStages: 1,
        description: 'Weaver of reality. Power to reshape existence itself.',
        qiRequirement: 32768000000, lifespanBonus: 1500000, breakthroughDifficulty: 50000, nextRealm: 'multiverse_sovereign'
    },
    multiverse_sovereign: {
        id: 'multiverse_sovereign', name: 'Multiverse Sovereign', minorStages: 1,
        description: 'Sovereign of multiverse. Mastery over infinite realities.',
        qiRequirement: 65536000000, lifespanBonus: 2500000, breakthroughDifficulty: 75000, nextRealm: 'omniversal_emperor'
    },
    omniversal_emperor: {
        id: 'omniversal_emperor', name: 'Omniversal Emperor', minorStages: 1,
        description: 'Emperor of omniverse. Beyond all known existence.',
        qiRequirement: 131072000000, lifespanBonus: 5000000, breakthroughDifficulty: 100000, nextRealm: 'absolute_existence'
    },
    absolute_existence: {
        id: 'absolute_existence', name: 'Absolute Existence', minorStages: 1,
        description: 'Absolute existence. The pinnacle of cultivation, beyond mortal comprehension.',
        qiRequirement: 262144000000, lifespanBonus: 10000000, breakthroughDifficulty: 150000, nextRealm: 'primordial_chaos_lord'
    },
    primordial_chaos_lord: {
        id: 'primordial_chaos_lord', name: 'Primordial Chaos Lord', minorStages: 1,
        description: 'Lord of primordial chaos. Master of the fundamental forces that existed before creation.',
        qiRequirement: 524288000000, lifespanBonus: 20000000, breakthroughDifficulty: 200000, nextRealm: 'eternal_dao_emperor'
    },
    eternal_dao_emperor: {
        id: 'eternal_dao_emperor', name: 'Eternal Dao Emperor', minorStages: 1,
        description: 'Emperor of the eternal dao. The ultimate pinnacle of cultivation, transcending all existence and non-existence.',
        qiRequirement: 1048576000000, lifespanBonus: 50000000, breakthroughDifficulty: 300000, nextRealm: undefined
    }
};
// Declare exported map early so other helpers can reference it; we'll populate it below
exports.CULTIVATION_REALMS = {};
// CULTIVATION_REALMS will be built after the finalized `REALM_ORDER` is declared below.
// Export an explicit realm order to keep numeric realmId stable even if the
// `CULTIVATION_REALMS` object is edited or additional realms are added later.
// This prevents accidental shifting of `realmId` values which other parts of
// the codebase (and saved game state) may depend on.
// Expanded grouped realm lists extracted from the bundled artifact (flattened tiers
// and variant keys). Kept as a compatibility/authoritative reference to map
// or import variant keys that may appear in saved data or build artifacts.
// The original grouped structure was malformed and contained several syntax errors
// and duplicated entries. The user has provided a canonical flat realm order to
// be used as the authoritative `REALM_ORDER`. We'll declare a single flat array
// here and avoid the grouped structure to keep the file simple and deterministic.
exports.REALM_ORDER = [
    'mortal', 'qi_refinement', 'foundation_establishment', 'core_formation', 'nascent_soul',
    'body_integration', 'mahayana',
    'true_immortal', 'golden_immortal', 'taiyi_golden_immortal', 'daluo_golden_immortal',
    'earth_loose_immortal', 'loose_immortal', 'heaven_immortal', 'true_heaven_immortal',
    'mystic_immortal', 'silver_immortal', 'perfect_immortal_emperor_rank1', 'perfect_immortal_emperor_rank2',
    'perfect_immortal_emperor_rank3', 'perfect_immortal_emperor_rank4', 'perfect_immortal_emperor_rank5',
    'soul_transformation', 'void_refinement', 'tribulation_transcendence',
    'mystic_divine_origin_1', 'mystic_divine_origin_2', 'mystic_divine_origin_3',
    'mystic_divine_origin_4', 'mystic_divine_origin_5', 'mystic_divine_origin_6',
    'zenith_heaven_early', 'zenith_heaven_mid', 'zenith_heaven_late', 'zenith_heaven_peak',
    'quasi_sage_early', 'quasi_sage_mid', 'quasi_sage_late', 'quasi_sage_peak',
    'perfected_sage_early', 'perfected_sage_mid', 'perfected_sage_late', 'perfected_sage_peak',
    'freedom_sage_early', 'freedom_sage_mid', 'freedom_sage_late', 'freedom_sage_peak',
    'saint_early', 'saint_mid', 'saint_late', 'saint_peak',
    'pseudo_saint_early', 'pseudo_saint_mid', 'pseudo_saint_late', 'pseudo_saint_peak',
    'great_dao_saint_early', 'great_dao_saint_mid', 'great_dao_saint_late', 'great_dao_saint_peak',
    'dao_converging_saint_early', 'dao_converging_saint_mid', 'dao_converging_saint_late', 'dao_converging_saint_peak',
    'supreme_saint_early', 'supreme_saint_mid', 'supreme_saint_late', 'supreme_saint_peak',
    'dao_creator_early', 'dao_creator_mid', 'dao_creator_late', 'dao_creator_peak',
    'saint_sovereign_early', 'saint_sovereign_mid', 'saint_sovereign_late', 'saint_sovereign_peak',
    'eternal_dao_emperor_early', 'eternal_dao_emperor_mid', 'eternal_dao_emperor_late', 'eternal_dao_emperor_peak',
    'dao_ancestor_early', 'dao_ancestor_mid', 'dao_ancestor_late', 'dao_ancestor_peak',
    'chaos_saint', 'supreme_dao_origin', 'void_transcendent',
    'absolute_existence_early', 'absolute_existence_mid', 'absolute_existence_late', 'absolute_existence_peak',
    'eternal_dao_emperor'
];
// If other code imported REALM_ORDER previously (flattened from groups), keep the
// same exported `REALM_ORDER` identifier expected elsewhere in the codebase.
// This file now declares `REALM_ORDER` above as the canonical flat sequence.
// Populate CULTIVATION_REALMS deterministically from REALM_ORDER and BASE_REALMS.
(() => {
    const suffixScale = { early: 0.65, mid: 0.85, late: 1.0, peak: 1.25 };
    // Lifespan overrides provided by the user (finalized list). These are absolute values.
    const LIFESPAN_OVERRIDES = {
        mortal: 100,
        qi_refinement: 300,
        foundation_establishment: 500,
        core_formation: 1000,
        nascent_soul: 1500,
        soul_transformation: 4000,
        void_refinement: 9000, // "Void amalgation" -> void_refinement
        body_integration: 27000,
        tribulation_transcendence: 110000,
        mahayana: 300000,
        earth_loose_immortal: 1200000,
        loose_immortal: 5000000,
        heaven_immortal: 14000000,
        true_heaven_immortal: 30000000,
        mystic_immortal: 100000000,
        silver_immortal: 1000000000,
        perfect_immortal_emperor_rank1: 50000000000,
        perfect_immortal_emperor_rank2: 69000000000,
        perfect_immortal_emperor_rank3: 99000000000,
        perfect_immortal_emperor_rank4: 500000000000,
        // Assumption: user listed "rank 5 is 1 billion" but that drops from rank4; assume they meant 1 trillion
        perfect_immortal_emperor_rank5: 1000000000000,
        mystic_divine_origin_1: 9000000000000,
        mystic_divine_origin_2: 20000000000000,
        mystic_divine_origin_3: 50000000000000,
        mystic_divine_origin_4: 100000000000000,
        mystic_divine_origin_5: 300000000000000,
        mystic_divine_origin_6: 900000000000000,
        zenith_heaven_early: 1e15,
        zenith_heaven_mid: 5e16,
        zenith_heaven_late: 1e17,
        zenith_heaven_peak: 3e17
    };
    // Explicit qiRequirement overrides matching the user's requested values.
    const QI_OVERRIDES = {
        mortal: 100,
        qi_refinement: 300,
        foundation_establishment: 500,
        core_formation: 1000,
        nascent_soul: 1500,
        soul_transformation: 4000,
        void_refinement: 9000,
        body_integration: 27000,
        tribulation_transcendence: 110000,
        mahayana: 300000,
        earth_loose_immortal: 1200000,
        loose_immortal: 5000000,
        heaven_immortal: 14000000,
        true_heaven_immortal: 30000000,
        mystic_immortal: 100000000,
        silver_immortal: 1000000000,
        perfect_immortal_emperor_rank1: 50000000000,
        perfect_immortal_emperor_rank2: 69000000000,
        perfect_immortal_emperor_rank3: 99000000000,
        perfect_immortal_emperor_rank4: 500000000000,
        perfect_immortal_emperor_rank5: 1000000000000,
        mystic_divine_origin_1: 9000000000000,
        mystic_divine_origin_2: 20000000000000,
        mystic_divine_origin_3: 50000000000000,
        mystic_divine_origin_4: 100000000000000,
        mystic_divine_origin_5: 300000000000000,
        mystic_divine_origin_6: 1000000000000000,
        zenith_heaven_early: 1e15,
        zenith_heaven_mid: 5e16,
        zenith_heaven_late: 1e17,
        zenith_heaven_peak: 3e17
    };
    // Minor-stage overrides requested by user to tune breakthrough granularity.
    // These values are authoritative for the listed realms. If a realm is not
    // present here we fall back to the base/minorStages scaling logic below.
    const MINOR_STAGE_OVERRIDES = {
        qi_refinement: 12,
        foundation_establishment: 12,
        core_formation: 5,
        nascent_soul: 7,
        soul_transformation: 3,
        void_refinement: 12,
        body_integration: 5,
        tribulation_transcendence: 10,
        mahayana: 9,
        earth_loose_immortal: 5,
        loose_immortal: 3,
        heaven_immortal: 9,
        true_heaven_immortal: 8,
        mystic_immortal: 6,
        silver_immortal: 5
    };
    // For realms above zenith, the user specified very large absolute numbers for suffix variants.
    // We'll apply these absolute values when the realm appears after 'zenith_heaven_peak' in REALM_ORDER.
    const POST_ZENITH_SUFFIX_OVERRIDES = {
        early: 9e17, // 900 quadrillion
        mid: 1.5e18, // 1.5 quintillion
        late: 3e18, // 3 quintillion
        peak: 5e18 // 5 quintillion
    };
    const zenithPeakIndex = exports.REALM_ORDER.indexOf('zenith_heaven_peak');
    for (let i = 0; i < exports.REALM_ORDER.length; i++) {
        const id = exports.REALM_ORDER[i];
        if (exports.CULTIVATION_REALMS[id])
            continue;
        // Use explicit base if available
        if (BASE_REALMS[id]) {
            const entry = { ...BASE_REALMS[id] };
            // Apply minor-stage override even for explicit base entries so user-specified
            // minor stage counts take precedence over the BASE_REALMS defaults.
            if (MINOR_STAGE_OVERRIDES[id] !== undefined) {
                entry.minorStages = Math.max(1, Math.floor(MINOR_STAGE_OVERRIDES[id]));
            }
            exports.CULTIVATION_REALMS[id] = entry;
            continue;
        }
        // Derive a base from the id by stripping suffixes or numeric tails
        const baseId = id.replace(/_(early|mid|late|peak)$/, '').replace(/_\d+$/, '');
        let base = BASE_REALMS[baseId] || exports.CULTIVATION_REALMS[baseId];
        // If not found, search backwards
        if (!base) {
            for (let j = i - 1; j >= 0; j--) {
                const cand = exports.REALM_ORDER[j];
                base = BASE_REALMS[cand] || exports.CULTIVATION_REALMS[cand];
                if (base)
                    break;
            }
        }
        const suffixMatch = id.match(/_(early|mid|late|peak)$/);
        const scale = suffixMatch ? (suffixScale[suffixMatch[1]] || 1) : 1;
        const qiRequirement = QI_OVERRIDES[id] !== undefined ? QI_OVERRIDES[id] : (base ? Math.max(1, Math.floor(base.qiRequirement * scale)) : 1000);
        // Lifespan resolution order:
        // 1) explicit LIFESPAN_OVERRIDES for the id
        // 2) if id has suffix and is after zenith, use POST_ZENITH_SUFFIX_OVERRIDES
        // 3) if base exists and has lifecycle, scale base.lifespanBonus
        // 4) fallback default 0
        let lifespanBonus;
        if (LIFESPAN_OVERRIDES[id] !== undefined) {
            lifespanBonus = LIFESPAN_OVERRIDES[id];
        }
        else if (suffixMatch && zenithPeakIndex >= 0 && i > zenithPeakIndex) {
            const s = suffixMatch[1];
            lifespanBonus = POST_ZENITH_SUFFIX_OVERRIDES[s] || Math.max(0, Math.floor((base?.lifespanBonus || 0) * scale));
        }
        else if (base) {
            lifespanBonus = Math.max(0, Math.floor(base.lifespanBonus * scale));
        }
        else {
            lifespanBonus = 0;
        }
        const breakthroughDifficulty = base ? Math.max(0, Math.floor(base.breakthroughDifficulty * scale)) : 0;
        // Resolve minor stage count. Priority:
        // 1) explicit MINOR_STAGE_OVERRIDES for the id
        // 2) if id has suffix, scale the base minorStages by the suffix scale
        // 3) fallback to base.minorStages or 1
        let minorStages;
        if (MINOR_STAGE_OVERRIDES[id] !== undefined) {
            minorStages = Math.max(1, Math.floor(MINOR_STAGE_OVERRIDES[id]));
        }
        else if (base) {
            minorStages = Math.max(1, Math.floor((base.minorStages || 1) * scale));
        }
        else {
            minorStages = 1;
        }
        // Generate display name: if this id has a suffix like _early/_mid/_late/_peak,
        // render as "Base Name (Suffix)" to be clearer in UI.
        const suffixMatchForName = id.match(/_(early|mid|late|peak)$/);
        const baseDisplay = id.replace(/_(early|mid|late|peak)$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const displayName = suffixMatchForName ? `${baseDisplay} (${suffixMatchForName[1].charAt(0).toUpperCase() + suffixMatchForName[1].slice(1)})` : id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        exports.CULTIVATION_REALMS[id] = {
            id,
            name: displayName,
            minorStages,
            description: base ? `Variant of ${base.name}.` : 'A cultivation realm variant.',
            qiRequirement,
            lifespanBonus,
            breakthroughDifficulty,
            nextRealm: exports.REALM_ORDER[i + 1]
        };
    }
})();
// Build a stable map of qi requirements for quick lookups. Populate after CULTIVATION_REALMS is ready.
exports.REALM_QI_REQUIREMENTS = Object.fromEntries(Object.entries(exports.CULTIVATION_REALMS).map(([key, realm]) => [key, realm.qiRequirement]));
function getNextRealm(currentRealm) {
    // Prefer the canonical ordering defined in REALM_ORDER to determine the next realm.
    // If the explicit realm entry defines a nextRealm, prefer that (explicit override).
    const explicit = exports.CULTIVATION_REALMS[currentRealm];
    if (explicit && explicit.nextRealm)
        return explicit.nextRealm;
    const idx = exports.REALM_ORDER.indexOf(currentRealm);
    if (idx >= 0 && idx + 1 < exports.REALM_ORDER.length)
        return exports.REALM_ORDER[idx + 1];
    return undefined;
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
// Auto-generate missing variant realm entries (e.g., suffixes like _early/_mid/_late/_peak or numbered variants)
// This keeps `CULTIVATION_REALMS` compatible with the expanded order extracted into `REALM_ORDER`.
// Strategy:
//  - For any id present in REALM_ORDER but missing from CULTIVATION_REALMS, derive a reasonable entry
//    by looking up the nearest existing base realm (strip suffixes or fallback to previous defined realm)
//  - Scale qiRequirement, lifespanBonus and breakthroughDifficulty by suffix where applicable.
//  - Set nextRealm to the following id in REALM_ORDER when not present.
// (removed duplicate auto-generator — `CULTIVATION_REALMS` is populated deterministically above)
