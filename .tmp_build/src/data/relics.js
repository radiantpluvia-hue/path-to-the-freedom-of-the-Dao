"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RELICS = void 0;
// Inspired by well-known xianxia protagonists; names/lore are original homages (non-infringing)
exports.RELICS = [
    {
        id: 'relic_mountain_oath_tablet',
        name: 'Mountain Oath Tablet',
        slot: 'accessory',
        rarity: 'Legendary',
        description: 'A weathered stone tablet etched with vows that shake the heavens.',
        lore: 'An homage to a scholar who carved oaths upon a mountain, defying clans and fate alike.',
        // Balanced: accessory defensive relic (legendary tier) slightly above top rare gear
        stats: { def: 8, hp: 80 },
        passives: ['gen_passive_020', 'gen_passive_040'],
        unique: true,
        source: 'Oath-Carving Prodigy'
    },
    {
        id: 'relic_endless_mirror_sword',
        name: 'Endless Mirror Sword',
        slot: 'weapon',
        rarity: 'Transcendent',
        description: 'A blade whose polished body reflects myriad Dao lights.',
        lore: 'Inspired by a sword genius famed for comprehending reflections within still water to grasp sword intents.',
        // Balance: Transcendent weapon now ~25% above strongest unique mortal weapon (22 atk baseline)
        stats: { atk: 26, crit: 8 },
        passives: ['gen_passive_055'],
        unique: true,
        source: 'Mirror Sword Adept'
    },
    {
        id: 'relic_heavens_changing_fan',
        name: 'Heaven-Changing Fan',
        slot: 'weapon',
        rarity: 'Mythic',
        description: 'An ornate folding fan that can summon tempests or lull worlds to calm.',
        lore: 'Tribute to a schemer famed for turning calamity into fortune—each wave reshapes momentum.',
        // Mythic support weapon: focuses more on qi utility than raw atk
        stats: { atk: 27, qi: 160 },
        passives: ['gen_passive_066'],
        unique: true,
        source: 'Calamity Weaver'
    },
    {
        id: 'relic_void_script_robe',
        name: 'Void Script Robe',
        slot: 'armor',
        rarity: 'Transcendent',
        description: 'Robes interlaced with runic void-script that swallows stray strikes.',
        lore: 'Inspired by a secluded cultivator whose silent endurance let him outlast epochs.',
        // Balance: defensive relic scaled to keep EHP roughly +40-50% over strong rare armor expectations
        stats: { def: 20, hp: 220 },
        passives: ['gen_passive_033', 'gen_passive_077'],
        unique: true,
        source: 'Epoch Hermit'
    },
    {
        id: 'relic_demonic_reversal_ring',
        name: 'Demonic Reversal Ring',
        slot: 'accessory',
        rarity: 'Legendary',
        description: 'A dark ring that inverts minor curses into surges of power.',
        lore: 'Salute to a devilish prodigy who cultivated atop calamity, reversing poison into strength.',
        // Balance: offensive accessory trimmed to sit just above rare weapon-adjacent trinkets
        stats: { atk: 14, def: 4, hp: 70 },
        passives: ['gen_passive_088'],
        unique: true,
        source: 'Calamity Reforger'
    },
    {
        id: 'relic_dragon_subduing_pen',
        name: 'Dragon-Subduing Pen',
        slot: 'weapon',
        rarity: 'Legendary',
        description: 'An ink brush that writes characters which manifest as binding coils.',
        lore: 'Homage to a tactician whose calligraphy subdued beasts and sealed draconic veins.',
        // Legendary weapon tuned near top legendary bracket (20-22 target range)
        stats: { atk: 20, qi: 120 },
        passives: ['gen_passive_011'],
        unique: true,
        source: 'Seal Script Strategist'
    },
    {
        id: 'relic_eightfold_resonance_core',
        name: 'Eightfold Resonance Core',
        slot: 'accessory',
        rarity: 'Mythic',
        description: 'A crystalline core pulsing with eight cyclical resonance paths.',
        lore: 'Inspired by a cultivator who harmonized disparate Daos into unified cycles.',
        // Mythic accessory: high qi focus, restrained atk to below mythic weapons
        stats: { atk: 18, qi: 240 },
        passives: ['gen_passive_022', 'gen_passive_044'],
        unique: true,
        source: 'Cycle Synthesist'
    },
    {
        id: 'relic_eternal_bone_pike',
        name: 'Eternal Bone Pike',
        slot: 'weapon',
        rarity: 'Transcendent',
        description: 'A pale pike carved from immortal marrow; it resonates with ancient wills.',
        lore: 'Tribute to a wanderer who harvested archaic remains to forge a path against heaven.',
        // Transcendent weapon bracket (26-28 atk)
        stats: { atk: 28, crit: 8 },
        passives: ['gen_passive_090'],
        unique: true,
        source: 'Ancient Remnant Wanderer'
    },
    {
        id: 'relic_lotus_dream_diadem',
        name: 'Lotus Dream Diadem',
        slot: 'accessory',
        rarity: 'Legendary',
        description: 'A circlet blooming with illusory petals that cradle the spirit.',
        lore: 'Inspired by a gentle yet unyielding genius whose serenity concealed unstoppable progress.',
        // Legendary accessory supportive stats
        stats: { def: 8, qi: 140 },
        passives: ['gen_passive_014'],
        unique: true,
        source: 'Serene Ascender'
    },
    {
        id: 'relic_sky_sunder_greatsaber',
        name: 'Sky-Sunder Greatsaber',
        slot: 'weapon',
        rarity: 'Mythic',
        description: 'Colossal saber that splits clouds; each swing tests the horizon.',
        lore: 'Homage to a relentless cultivator whose saber path battered the firmament itself.',
        // Top mythic ceiling weapon (approx 35% above top unique mortal-tier weapon)
        stats: { atk: 30, crit: 8 },
        passives: ['gen_passive_099'],
        unique: true,
        source: 'Horizon Breaker'
    }
];
exports.default = exports.RELICS;
