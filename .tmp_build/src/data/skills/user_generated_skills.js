"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMMORTAL_IMPORTED_SKILLS = exports.MORTAL_IMPORTED_SKILLS = void 0;
// Explicit group -> tier mapping (user-specified guidance)
const GROUP_TO_TIER = {
    'Earth/Stone': 3,
    'Darkness/Demonic': 4,
    'Light/Heavenly': 5,
    'Yin-Yang': 5,
    'Summoning/Beast': 4,
    'Fire': 5,
    'Ice/Water': 4,
    'Lightning/Storm': 5,
    'Wind': 3,
    'Sword': 7,
    'Martial/Fist': 4,
    'Movement/Body': 2,
};
// Category-based effect templates for variety
const CATEGORY_EFFECTS = {
    'Earth/Stone': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'debuff', target: 'enemy', stat: 'def', value: -5, duration: 2 }],
    'Darkness/Demonic': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'debuff', target: 'enemy', stat: 'atk', value: -10, duration: 3 }],
    'Light/Heavenly': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'buff', target: 'self', stat: 'heal', value: Math.round(_p * 0.2), duration: 1 }],
    'Yin-Yang': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'special', target: 'enemy' }],
    'Summoning/Beast': (_n, _p) => [{ type: 'buff', target: 'self', stat: 'summon_power', value: Math.round(_p * 0.5), duration: 3 }, { type: 'special', target: 'self' }],
    'Fire': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'debuff', target: 'enemy', stat: 'burn', value: Math.round(_p * 0.1), duration: 3 }],
    'Ice/Water': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'debuff', target: 'enemy', stat: 'speed', value: -3, duration: 2 }],
    'Lightning/Storm': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'special', target: 'enemy' }],
    'Wind': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'debuff', target: 'enemy', stat: 'speed', value: -4, duration: 2 }],
    'Sword': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'special', target: 'enemy' }],
    'Martial/Fist': (_n, _p) => [{ type: 'damage', target: 'enemy', value: _p }, { type: 'debuff', target: 'enemy', stat: 'stun', value: -1, duration: 1 }],
    'Movement/Body': (_n, _p) => [{ type: 'buff', target: 'self', stat: 'speed', value: 6, duration: 2 }],
};
// Flattened names grouped in arrays — kept short here for maintainability; real list will be imported programmatically.
// For brevity we reuse the list previously appended; maintain group order.
const GROUPS = [
    { name: 'Earth/Stone', names: [
            'Mountain-Crushing Palm', 'Stone Fist Barrage', 'Earthquake Stomp', 'Rock Shattering Punch', 'Sandstorm Sweep', 'Stone Lotus Bloom', 'Boulder Smash Strike', 'Quaking Heaven Kick', 'Earth Spike Burst', 'Tremor Palm Shockwave', 'Iron Mountain Sweep', 'Crushing Rock Barrage', 'Mudflow Wave Eruption', 'Earth Fang Rend', 'Quaking Dragon’s Ascent', 'Stone Prison Bind', 'Dust Storm Barrage', 'Earth Splitting Palm', 'Mountain Guard Smash', 'Rockfall Lotus Drop'
        ] },
    { name: 'Darkness/Demonic', names: [
            'Shadow Fang Strike', 'Demon Flame Slash', 'Blood Moon Claw', 'Soul-Devouring Palm', 'Abyssal Howl Roar', 'Demonic Fang Barrage', 'Shadow Chain Bind', 'Ghostly Slash Waltz', 'Blood Mist Explosion', 'Demon Claw Rend', 'Nightshade Fang Strike', 'Black Flame Lotus', 'Shadowstep Evasion', 'Phantom Fang Kick', 'Soul-Breaking Strike', 'Dark Abyss Palm', 'Shadow Fang Sweep', 'Demonic Lotus Burst', 'Ghostfire Claw', 'Abyssal Dragon Descent'
        ] },
    { name: 'Light/Heavenly', names: [
            'Radiant Sun Slash', 'Heavenly Palm of Purity', 'Golden Lotus Explosion', 'Divine Spear of Light', 'Solar Burst Fist', 'Dawnshine Slash', 'Holy Radiance Barrage', 'Heaven’s Judgment Palm', 'Sacred Flame Strike', 'Blinding Sun Ray', 'Celestial Fang Claw', 'Radiant Starfall', 'Pure Lotus Palm', 'Starlight Blade Waltz', 'Heaven’s Roar Kick', 'Solar Heaven Ascension', 'Divine Radiance Burst', 'Sunlight Prison Bind', 'Holy Flame Strike', 'Heaven-Piercing Light Beam'
        ] },
    { name: 'Yin-Yang', names: [
            'Yin-Yang Dual Palm', 'Black-White Lotus Burst', 'Twin Dragon Harmony Slash', 'Balance of Heaven Strike', 'Shadow-Sun Fang Claw', 'Moon-Sun Radiance Palm', 'Yin-Yang Serpent Whip', 'Twin Lotus Explosion', 'Dark-Light Dual Fang', 'Eclipse Slash Waltz', 'Yin-Yang Reversal Kick', 'Twilight Lotus Palm', 'Shadow-Sun Wave Burst', 'Harmony Blade Waltz', 'Lunar-Solar Fang Rend', 'Yin-Yang Dragon Ascension', 'Dawn-Dusk Strike', 'Balance Severing Palm', 'Dual Heaven Burst', 'Eternal Yin-Yang Collapse'
        ] },
    { name: 'Summoning/Beast', names: [
            'Dragon Roar Wave', 'White Tiger Slash', 'Vermilion Bird Flame Dive', 'Black Tortoise Shield Smash', 'Azure Dragon Coil', 'Spirit Beast Fang Barrage', 'Heavenly Wolf Howl', 'Roc Wing Slash', 'Flood Dragon Strike', 'Serpent Fang Lash', 'Spirit Tiger Palm', 'Crane Dance Waltz', 'Elephant Stomp Tremor', 'Kirin Flame Charge', 'Demon Ape Rampage', 'Thunder Hawk Dive', 'Nine-Tailed Fox Illusion Claw', 'Spirit Bear Smash', 'Dragon-Tiger Dual Roar', 'Phoenix Rebirth Flame'
        ] },
    { name: 'Fire', names: [
            'Crimson Flame Burst', 'Fire Lotus Explosion', 'Blazing Dragon Breath', 'Infernal Sky Rain', 'Burning Palm Strike', 'Molten Wave Eruption', 'Nine Suns Flame Torrent', 'Firestorm Spiral Kick', 'Scarlet Phoenix Dive', 'Hellfire Chain Whip', 'Flame Tiger Charge', 'Sun-Burst Fist', 'Fire Serpent Coil', 'Inferno Blade Dance', 'Fiery Meteor Drop', 'Crimson Scorching Strike', 'Fire Lotus Beam', 'Lava Eruption Palm', 'Skyfire Explosion', 'Scarlet Pillar of Destruction', 'Flame Claw Rend', 'Firestorm Barrage', 'Blazing Sun Cannon', 'Burning Sky Slash', 'Phoenix Fire Wings', 'Flame Whirlwind Kick', 'Fire Spirit Wave', 'Lava Flow Sweep', 'Solar Flare Slash', 'Fire Lotus Prison', 'Flame-Wrapped Fist', 'Fire Burst Palm', 'Scorching Dragon Wave', 'Blazing Comet Dash', 'Firestorm Collapse', 'Crimson Lotus Spiral', 'Fire Fang Strike', 'Phoenix Flame Impact', 'Exploding Flame Ring', 'Inferno Dragon Ascension'
        ] },
    { name: 'Ice/Water', names: [
            'Frost Lotus Bloom', 'Ice Dragon Bite', 'Frozen Heaven Spear', 'Snowstorm Gale Slash', 'Ice Fang Claw', 'Arctic Palm Strike', 'Glacial Prison Bind', 'Thousand Snowflake Strike', 'Frost Shattering Kick', 'Frozen River Wave', 'Ice Blade Spiral', 'Cryo-Lotus Burst', 'Winter’s Roar', 'Ice Serpent Whip', 'Crystal Frost Shards', 'Frozen Meteor Drop', 'Frost Nova Palm', 'Shattering Ice Kick', 'Blizzard Barrage', 'Ice Fang Sweep', 'Winter’s Embrace Trap', 'Frosty Chain Bind', 'Polar Wave Eruption', 'Ice Spear Volley', 'Frost Claw Rend', 'Glacial Pillar Smash', 'Snowflake Sword Waltz', 'Frozen Starlight Blast', 'Icy Tornado Spin', 'Cryo-Seal Palm', 'Glacier Collapse Strike', 'Frost Armor Breaker', 'Cold Moon Slash', 'Frozen Flame Dual Burst', 'Winter Lotus Dance', 'Subzero Palm', 'Shattering Ice Wall', 'Frozen Dragon’s Descent', 'Frost Storm Explosion', 'Icebound Heaven Slash'
        ] },
    { name: 'Lightning/Storm', names: [
            'Thunderclap Fist', 'Lightning Serpent Whip', 'Storm Roar Slash', 'Heavenly Thunder Palm', 'Lightning Spear Throw', 'Electric Burst Kick', 'Thunderstorm Barrage', 'Shocking Wave Strike', 'Skybolt Descent', 'Lightning Lotus Explosion', 'Thunder Dragon Coil', 'Storm Gale Dash', 'Heavenly Judgment Strike', 'Lightning Fang Bite', 'Storm Blade Waltz', 'Raging Thunder Sweep', 'Electric Nova Burst', 'Skyfire Lightning Whip', 'Thundercloud Strike', 'Bolt Step Evasion', 'Thunder God’s Roar', 'Lightning Lotus Prison', 'Crackling Fist Barrage', 'Thunderbolt Collapse', 'Storm Fang Slash', 'Raging Thunder Palm', 'Lightning Wave Crash', 'Shocking Fang Claw', 'Thunderbolt Spin Kick', 'Skyshatter Lightning Strike', 'Storm Dragon Ascension', 'Flashstep Thunder Kick', 'Heaven’s Thunder Wrath', 'Thunderstorm Lotus Bloom', 'Crackling Heaven Whip', 'Storm Gale Slash', 'Lightning Inferno Burst', 'Thunderbolt Rainfall', 'Storm Cage Bind', 'Lightning Dragon’s Descent'
        ] },
    { name: 'Wind', names: [
            'Hurricane Palm', 'Gale Step Slash', 'Whistling Wind Barrage', 'Storm Fang Claw', 'Tornado Palm Burst', 'Wind Serpent Coil', 'Cyclone Kick', 'Whirlwind Blade Dance', 'Wind Barrier Slash', 'Stormstrike Dash', 'Howling Wind Roar', 'Air Severing Palm', 'Skybreaker Tornado', 'Swift Gale Strike', 'Thousand Petal Wind Slash', 'Storm Fang Sweep', 'Whispering Gale Waltz', 'Cyclone Lotus Spin', 'Tempest Palm Smash', 'Hurricane Dragon Ascent', 'Razor Wind Barrage', 'Gale Fang Kick', 'Whirlwind Prison', 'Sky-Sundering Wind Slash', 'Storm Lotus Burst', 'Swift Feather Strike', 'Air-Walking Blade Spin', 'Whispering Wind Claws', 'Cyclone Heaven Collapse', 'Storm Step Dash'
        ] },
    { name: 'Sword', names: [
            'Heaven-Piercing Sword Slash', 'Thousand Petal Lotus Sword Dance', 'Nine Heavens Severing Sword', 'Drifting Cloud Sword Step', 'Moon-Reflecting Blade Style', 'Crimson Flame Sword Arc', 'Sword Qi Torrent', 'Jade Serpent Sword Flow', 'Spirit-Cleaving Sword Intent', 'Eternal Sword Domain', 'Sword of Boundless Sky', 'Falling Meteor Sword Light', 'Whistling Wind Sword Song', 'Thousand Phantom Sword Mirage', 'Sword of Silent Annihilation', 'Sword Qi Body Protection', 'Immortal Sword Heart', 'Sword of Shattered Illusions', 'Myriad Sword Formation', 'Sword of Yin-Yang Harmony', 'Endless River Sword Style', 'Sword Qi Resonance', 'Frost Lotus Sword Art', 'Sword of Roaring Thunder', 'Sword-Breaking Palm Counter', 'Sword of Heaven’s Judgment', 'Sword Qi Ripple Burst', 'Sword of the Empty Sky', 'Void-Edge Sword Strike', 'Sword of the Frozen Abyss', 'Dusk-Dawn Twin Sword Flow', 'Sword Intent Manifestation', 'Blazing Sun Sword Wheel', 'Sword of Ten Thousand Calamities', 'Lunar Shadow Sword Waltz', 'Sword Qi Lotus Bloom', 'Spirit-Slaying Sword Intent', 'Sword of the Immortal Dao', 'Transcendent Sword Step', 'Flowing Water Sword Guard', 'Sword of Withering Autumn', 'Sword Qi Heaven-Net', 'Sword of Thousand Realms', 'Dragon-Soaring Sword Dance', 'Sword of Heavenly Fate', 'Shadowless Sword Slash', 'Sword Qi Devouring Heaven', 'Sword of Blood Moon', 'Sword of Eternal Silence', 'Dao-Severing Sword'
        ] },
    { name: 'Martial/Fist', names: [
            'Heaven Shattering Palm', 'Iron Body Fist', 'Thousand Mountain Crushing Palm', 'Roaring Dragon Fist', 'Mountain Splitting Strike', 'Hundred Beast Claw Technique', 'Vajra Iron Fist', 'Flowing River Palm', 'Qi-Infused Dragon Strike', 'Nine Oxen Strength Fist', 'Crushing Boulder Palm', 'Heaven Sundering Punch', 'Divine Ape Battle Arts', 'Hundred-Hand Palm Barrage', 'Storm-Breaking Kick', 'Phoenix Wing Strike', 'Tyrant King Palm', 'Thunderclap Strike', 'Blood-Burning Fist', 'Blazing Sun Palm', 'Yin-Yang Harmony Strike', 'Eternal Lotus Palm', 'Heaven Dragon Roar Punch', 'Shadow Serpent Strike', 'Demon-Slaying Fist', 'Qi-Bursting Palm', 'Iron Wall Defense Art', 'Celestial War Drum Fist', 'Crashing Tide Kick', 'Flame Tiger Palm', 'Profound Heaven Strike', 'Silent Moon Palm', 'Nine Revolutions Heaven Strike', 'Crimson Dragon Ascension Punch', 'Mountain Guarding Palm', 'Storm Roaring Fist', 'Qi-Condensed Iron Palm', 'Spirit-Beast Claw Art', 'Golden Buddha Palm', 'Infinite Mountain Smash', 'Meteor Shower Fist', 'Thousand Leaf Palm Dance', 'Frost-Sealing Fist', 'Void-Crushing Strike', 'Raging Demon Punch', 'Spirit-Breaking Palm', 'Lotus Blooming Strike', 'Boundless Earth Palm', 'Heaven-Devouring Fist', 'Eternal Body Art'
        ] },
    { name: 'Movement/Body', names: [
            'Cloud-Stepping Technique', 'Shadowless Ghost Step', 'Thousand Mile Stride', 'Soaring Dragon Flight Art', 'Flickering Shadow Movement', 'Crane Dance Step', 'Heaven-Leaping Escape Technique', 'Lotus Bloom Step', 'Whirling Leaf Body Art', 'Mist Concealment Movement', 'Flowing Water Evasion', 'Thunder Flash Step', 'Nine Heavens Cloud Soar', 'Shadow Cloak Body Skill', 'Moonlight Drift Step', 'Serpent Slithering Art', 'Wind-Breaking Sprint', 'Soaring Crane Glide', 'Star-Treading Steps', 'Heaven-Walking Escape Art', 'Phantom Mirage Step', 'Ghostly Flicker Movement', 'Immortal Cloud Step', 'Thousand Shadow Body Art', 'Body of Flowing Flame', 'Body of Glacial Frost', 'Qi-Burst Acceleration', 'Blood-Burning Escape Technique', 'Void Phase Step', 'Spirit-Binding Evasion', 'Wind God’s Footwork', 'Lotus Petal Dance Movement', 'Mist-Walking Steps', 'Body of Shifting Sand', 'Body of Thunder’s Roar', 'Heaven Serpent Glide', 'Body of Endless Waves', 'Starry Sky Walk', 'Great Roc Flight Technique', 'Flickering Sword Body', 'Concealing Shadow Art', 'Thousand Phantom Escape', 'Spirit-Light Step', 'Void Dissolving Body', 'Flowing Qi Circulation Body Art', 'Light Feather Step', 'Celestial Cloud Drift', 'Ghost Serpent Flicker', 'Supreme Escape Art', 'Body of Heaven’s Will'
        ] }
];
// Helper to generate skills from groups and assign mortal vs immortal by tier threshold
exports.MORTAL_IMPORTED_SKILLS = [];
exports.IMMORTAL_IMPORTED_SKILLS = [];
for (const g of GROUPS) {
    const tier = GROUP_TO_TIER[g.name] ?? 3;
    for (let i = 0; i < g.names.length; i++) {
        const name = g.names[i];
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + `_ug${i}`;
        const power = Math.round(30 + tier * 12 + (i % 20));
        const cooldown = Math.max(1, 6 - Math.floor(tier / 2));
        const apCost = Math.min(5, Math.ceil(tier / 2));
        const qiCost = Math.round((tier >= 6 ? (tier * 120) : (tier * 30)) + (i % 15));
        const effects = CATEGORY_EFFECTS[g.name]?.(name, power) ?? [{ type: 'damage', target: 'enemy', value: power }];
        const skill = {
            id,
            name,
            tier,
            power,
            cooldown,
            cost: { ap: apCost, qi: qiCost },
            apCost,
            qiCost,
            scalesWithIntensity: tier >= 4,
            effects,
            description: `${name} — imported group ${g.name}`
        };
        // classify mortal vs immortal by tier threshold (<=4 mortal, >4 immortal)
        if (tier <= 4)
            exports.MORTAL_IMPORTED_SKILLS.push(skill);
        else
            exports.IMMORTAL_IMPORTED_SKILLS.push(skill);
    }
}
exports.default = {
    MORTAL_IMPORTED_SKILLS: exports.MORTAL_IMPORTED_SKILLS,
    IMMORTAL_IMPORTED_SKILLS: exports.IMMORTAL_IMPORTED_SKILLS,
};
