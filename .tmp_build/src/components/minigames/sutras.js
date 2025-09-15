"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORM_TECHNIQUES = exports.CURATED = void 0;
// Curated sutra/mantra techniques (moved out of skills.ts for cleanliness)
exports.CURATED = [
    { id: 'sutra_heavenly_draw', name: 'Heavenly Sutra of the Drawn Sky', tier: 8, power: 420, cooldown: 8, cost: { ap: 2, qi: 20 }, description: 'An exalted sutra said to be inscribed upon the vault of heaven; it pulls celestial pressure into a single, shattering stroke.' },
    { id: 'mutra_void_sutra', name: 'Secret Mantra of the Void Scripture', tier: 8, power: 390, cooldown: 8, cost: { ap: 2, qi: 18 }, description: 'A forbidden mantra recorded in void-scrolls; its recitation warps the weave of fate and unstrings enemy tempo.' },
    { id: 'sutra_draconic_verse', name: 'Dragon Sutra — Verse of Ancestral Coil', tier: 7, power: 320, cooldown: 7, cost: { ap: 1, qi: 14 }, description: 'A bloodline sutra that sings ancestral dragon qi into the bones, empowering strikes with elder resonance.' },
    { id: 'mutra_iron_palm_sutra', name: 'Mantra of Iron Dharma', tier: 6, power: 220, cooldown: 5, cost: { ap: 1, qi: 10 }, description: 'A dharma-mantra that hardens the veins and centers breath into an unyielding blow; taught in secluded mountain dharmas.' },
    { id: 'sutra_moonfall_chant', name: 'Lunar Sutra — Chant of Waning Light', tier: 7, power: 310, cooldown: 6, cost: { ap: 1, qi: 13 }, description: 'A moonlit sutra that draws the hush of lunar tides to unbalance the foe and cleave through stillness.' },
    { id: 'mutra_soulbind_gesture', name: 'Mantra of Soul-Tether', tier: 7, power: 305, cooldown: 7, cost: { ap: 2, qi: 15 }, description: 'An ancient tethering mantra that binds a fragment of an enemy\'s spirit, loosening defenses and will.' },
    { id: 'sutra_ashen_seal', name: 'Ashen Sutra — Seal of Quiet Endings', tier: 6, power: 230, cooldown: 5, cost: { ap: 1, qi: 11 }, description: 'A funerary sutra that stamps an ashen sigil upon a foe, corroding their fortitude.' },
    { id: 'mutra_gale_hand_sutra', name: 'Wind-chant Mantra of the Gale Scripture', tier: 5, power: 180, cooldown: 4, cost: { ap: 1, qi: 8 }, description: 'A brisk mantra taught by wandering adepts that threads wind-breath into a series of slicing cadences.' },
    { id: 'sutra_starbound_orison', name: 'Star Sutra — Orison of Falling Lights', tier: 8, power: 380, cooldown: 8, cost: { ap: 2, qi: 19 }, description: 'A celestial orison that draws down starlight threads to pierce mortal shields and pierce fate for a heartbeat.' },
    { id: 'mutra_quietus_motion', name: 'Mantra of Quietus Motion', tier: 7, power: 300, cooldown: 6, cost: { ap: 1, qi: 14 }, description: 'A hush-mantra that coaxes the flow of moments to slow for the user, enabling strikes between ticks.' },
    { id: 'sutra_silverscribe_breath', name: 'Sutra of Silver Script Breath', tier: 6, power: 240, cooldown: 5, cost: { ap: 1, qi: 12 }, description: 'A breathing sutra whose ink-like breaths trace silver lines along meridians, amplifying follow-throughs.' },
    { id: 'mutra_thunderhand_chant', name: 'Mantra of Thunder-Hymn', tier: 6, power: 250, cooldown: 5, cost: { ap: 1, qi: 12 }, description: 'A thunder-hymn mantra that resonates in the limbs, delivering a concussive cadence that stuns and rends.' },
    { id: 'sutra_rain_of_clarity', name: 'Sutra — Rain of Clear Dharma', tier: 5, power: 190, cooldown: 4, cost: { ap: 1, qi: 9 }, description: 'A clarifying sutra that washes away clouded thought and sharpens the cultivator\'s edge for a time.' },
    { id: 'mutra_phantom_step_sutra', name: 'Mantra of the Phantom Walk', tier: 6, power: 230, cooldown: 4, cost: { ap: 1, qi: 10 }, description: 'A footwork mantra that lets the cultivator pass like a shadow between beats, striking where gaps open.' },
    { id: 'sutra_bloodline_siren', name: 'Sutra of Ancestral Sirens', tier: 7, power: 325, cooldown: 7, cost: { ap: 2, qi: 16 }, description: 'A bloodline chant that calls forth ancestral echoes to magnify the user\'s blow in sympathetic resonance.' },
    { id: 'mutra_fate_unwind', name: 'Mantra of Unwinding Fate', tier: 8, power: 400, cooldown: 8, cost: { ap: 2, qi: 20 }, description: 'A perilous mantra that frays the bindings of fortune, letting the user redirect guarded outcomes.' },
    { id: 'sutra_tidebinder_verse', name: 'Tide Sutra — Verse of the Bound Current', tier: 6, power: 235, cooldown: 5, cost: { ap: 1, qi: 11 }, description: 'A coastal sutra that folds tidal qi into a wave to wash away the foe\'s stance.' },
    { id: 'mutra_spectral_cloak', name: 'Mantra of the Veiled Shade', tier: 5, power: 170, cooldown: 4, cost: { ap: 1, qi: 8 }, description: 'A veiling mantra that wraps the user in a thin pall of shade, increasing evasion.' },
    { id: 'sutra_ironbinding_hymn', name: 'Iron Sutra — Binding Hymn', tier: 7, power: 315, cooldown: 6, cost: { ap: 1, qi: 15 }, description: 'A hymn that tempers sinew and bone by sutra-laced will, letting strikes rend through defenses.' },
    { id: 'mutra_hollow_palm_sutra', name: 'Mantra — Hollow Turning', tier: 6, power: 240, cooldown: 5, cost: { ap: 1, qi: 12 }, description: 'A cunning turning-mantra that channels incoming force outward as a sharpened counter.' },
    { id: 'sutra_whispered_vault', name: 'Sutra — Whispered Vault of Holding', tier: 5, power: 185, cooldown: 4, cost: { ap: 1, qi: 9 }, description: 'A low sutra that stores a kernel of spiritual charge for a later, concentrated release.' },
    { id: 'mutra_cinder_moon', name: 'Mantra of Cinder-Moon Bloom', tier: 7, power: 330, cooldown: 7, cost: { ap: 2, qi: 16 }, description: 'A volcanic mantra that blooms ember-shells around blows, burning through slow regeneration.' },
    { id: 'sutra_sundering_echo', name: 'Sutra — Echo of Sundering Bells', tier: 6, power: 245, cooldown: 5, cost: { ap: 1, qi: 12 }, description: 'A bell-sutra whose toll fractures cohesion in the enemy formation.' },
    { id: 'mutra_windvein_sutra', name: 'Mantra — Windvein Script', tier: 5, power: 175, cooldown: 4, cost: { ap: 1, qi: 8 }, description: 'A brisk wind-script mantra that threads cuts between heartbeats for micro-precision hits.' },
    { id: 'sutra_golden_meridian', name: 'Golden Meridian Sutra', tier: 7, power: 310, cooldown: 6, cost: { ap: 1, qi: 14 }, description: 'A sutra concentrated on meridian flow that channels inner pressure into a singular, potent strike.' },
    { id: 'mutra_voidhand_syllable', name: 'Mantra — Voidhand Syllable', tier: 8, power: 395, cooldown: 8, cost: { ap: 2, qi: 19 }, description: 'A syllable from the void-manuscripts that opens a small gulf in reality for a strike to pass through.' },
    { id: 'sutra_ashen_gate', name: 'Ashen Gate Sutra', tier: 6, power: 240, cooldown: 5, cost: { ap: 1, qi: 11 }, description: 'A gate-sutra that erodes wards and thins armor with ashen cadence.' },
    { id: 'mutra_stormfist_chant', name: 'Stormfist Mantra', tier: 6, power: 250, cooldown: 5, cost: { ap: 1, qi: 12 }, description: 'A furious chant that syncs limbs with storm tempo, cleaving through grouped guards.' },
    { id: 'sutra_silvered_lattice', name: 'Silver Lattice Sutra', tier: 5, power: 185, cooldown: 4, cost: { ap: 1, qi: 9 }, description: 'A defensive lattice-form sutra that lets breath weave a thin guard to soften incoming blows.' },
    { id: 'mutra_shadowbind_hymn', name: 'Hymn of Shadowbinding', tier: 7, power: 320, cooldown: 7, cost: { ap: 2, qi: 15 }, description: 'A night-hymn mantra that laces shadows to tether enemy motion and slow actions.' },
    { id: 'sutra_celestial_liturgy', name: 'Celestial Liturgy Sutra', tier: 8, power: 410, cooldown: 8, cost: { ap: 2, qi: 20 }, description: 'A grand liturgy that calls the attention of heaven, aligning the cultivator with celestial cadence.' },
    { id: 'mutra_flower_of_void', name: 'Mantra — Void-Flower Canticle', tier: 7, power: 330, cooldown: 7, cost: { ap: 2, qi: 16 }, description: 'A canticle that unfurls void-petals to nick at the foe\'s resolve with each bloom.' },
    { id: 'sutra_stoneshatter_canctus', name: 'Canctus of Stone-Shatter', tier: 6, power: 250, cooldown: 5, cost: { ap: 1, qi: 12 }, description: 'A stony canctus that calls vibrations through the ground to crack stances and foundations.' },
    { id: 'mutra_echoing_braid', name: 'Mantra — Echoing Braid', tier: 5, power: 170, cooldown: 4, cost: { ap: 1, qi: 8 }, description: 'A braided echo-mantra that links prior strikes into a sudden chained flourish.' },
    { id: 'sutra_soulforge_psalm', name: 'Soulforge Psalm Sutra', tier: 7, power: 315, cooldown: 6, cost: { ap: 1, qi: 15 }, description: 'A psalmic sutra that tempers spirit into a blade of will, especially potent vs. spirit-beasts.' },
    { id: 'mutra_serpent_twine', name: 'Mantra — Serpent-Twine Canticle', tier: 6, power: 235, cooldown: 5, cost: { ap: 1, qi: 11 }, description: 'A twining canticle that coils into the enemy limbs, enabling grappling follow-ups.' },
    { id: 'sutra_last_crescendo', name: 'Final Crescendo Sutra', tier: 8, power: 425, cooldown: 9, cost: { ap: 3, qi: 22 }, description: 'A climactic sutra reserved for finales; a devastated crescendo that breaks even the most stubborn guard.' }
];
// Generate 50 form techniques (3-36 form counts) across sect flavors
const FORM_BASES = [
    { base: 'Plum Blossom Strike', sect: "Mount Hua" },
    { base: 'Heavy Snow Slash', sect: 'Upper North' },
    { base: 'Lotus Palm Sequence', sect: 'Southern Isle' },
    { base: 'Iron Cliff Thrust', sect: 'Iron Summit' },
    { base: 'Azure Wave Twelve', sect: 'Azure Peak' },
    { base: 'Crimson Serpent Coil', sect: 'Black Marsh' },
    { base: 'Twin Moon Steps', sect: 'Silver Hermitage' },
    { base: 'Thunderbreaker Array', sect: 'Storm Gate' }
];
exports.FORM_TECHNIQUES = (() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
        const count = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 21, 24, 27, 30, 33, 36][i % 20];
        const pick = FORM_BASES[i % FORM_BASES.length];
        const id = `form_${i + 1}`;
        const name = `${pick.base} — ${count} Forms (${pick.sect})`;
        // tiers roughly scale with count but remain in familiar cultivation bands
        const tier = Math.min(7, Math.max(3, Math.ceil(count / 6) + 2));
        const power = Math.round(30 + count * 4 + (i % 5) * 3);
        const cooldown = Math.max(1, 5 - Math.floor(tier / 2));
        const ap = Math.max(0, Math.ceil(tier / 2));
        const qi = tier >= 6 ? Math.ceil(tier / 2) : 0;
        const description = `A traditional ${count}-form sequence from ${pick.sect}. Practitioners repeat the sequence to hone rhythm and strike patterns; effective as a chained technique.`;
        arr.push({ id, name, tier, power, cooldown, cost: { ap, qi }, description });
    }
    return arr;
})();
exports.default = exports.CURATED;
