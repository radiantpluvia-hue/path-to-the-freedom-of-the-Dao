"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSystem = exports.MARKETS = exports.MARKET_ITEMS = void 0;
exports.MARKET_ITEMS = [
    // Common Items
    {
        id: 'qi_gathering_pill',
        name: 'Qi Gathering Pill',
        description: 'A basic pill that helps gather spiritual energy.',
        type: 'pill',
        rarity: 'common',
        price: { yuan: 100 },
        effects: { qi: 50 },
        stock: 50,
        refreshRate: 1
    },
    {
        id: 'mortal_jian',
        name: 'Mortal-grade Jian',
        description: 'A basic mortal-grade straight sword suitable for novice cultivators.',
        type: 'weapon',
        rarity: 'common',
        price: { yuan: 500 },
        effects: { atk: 10 },
        stock: 20,
        refreshRate: 3
    },
    // Added generic Xianxia weapons (fit Weapon Mastery)
    {
        id: 'mortal_saber',
        name: 'Mortal-grade Saber',
        description: 'A sturdy mortal-grade single-edged saber favored by outer disciples.',
        type: 'weapon',
        rarity: 'common',
        price: { yuan: 520 },
        effects: { atk: 12 },
        stock: 18,
        refreshRate: 3
    },
    {
        id: 'mortal_staff',
        name: 'Mortal-grade Staff',
        description: 'A mortal-grade spiritwood staff, light yet resilient.',
        type: 'weapon',
        rarity: 'common',
        price: { yuan: 480 },
        effects: { atk: 9 },
        stock: 22,
        refreshRate: 3
    },
    {
        id: 'mortal_spear',
        name: 'Mortal-grade Spear',
        description: 'A balanced mortal-grade spear for decisive thrusts.',
        type: 'weapon',
        rarity: 'common',
        price: { yuan: 600 },
        effects: { atk: 14 },
        stock: 16,
        refreshRate: 4
    },
    {
        id: 'mortal_dagger',
        name: 'Mortal-grade Dagger',
        description: 'A short mortal-grade dagger, quick and precise.',
        type: 'weapon',
        rarity: 'common',
        price: { yuan: 450 },
        effects: { atk: 11 },
        stock: 24,
        refreshRate: 3
    },
    {
        id: 'mortal_bow',
        name: 'Mortal-grade Bow',
        description: 'A simple mortal-grade recurve bow for steady shots.',
        type: 'weapon',
        rarity: 'common',
        price: { yuan: 580 },
        effects: { atk: 13 },
        stock: 12,
        refreshRate: 4
    },
    // Uncommon Items
    // Additional swords and weapons to enrich early/mid game
    {
        id: 'earth_jian',
        name: 'Earth-grade Jian',
        description: 'A refined earth-grade straight sword balanced for precise strikes.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1500 },
        effects: { atk: 25, special: ['swordsmanship_bonus'] },
        stock: 10,
        refreshRate: 7
    },
    {
        id: 'earth_broadsword',
        name: 'Earth-grade Broadsword',
        description: 'A broad, heavy earth-grade blade that delivers crushing blows.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1600 },
        effects: { atk: 28 },
        stock: 8,
        refreshRate: 8
    },
    {
        id: 'earth_saber',
        name: 'Earth-grade Willow Saber',
        description: 'A slightly curved earth-grade saber suited for flowing techniques.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1400 },
        effects: { atk: 23 },
        stock: 12,
        refreshRate: 7
    },
    {
        id: 'earth_spear',
        name: 'Earth-grade Spear',
        description: 'An earth-grade spear with a keen point, ideal for penetrating defenses.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1700 },
        effects: { atk: 30 },
        stock: 7,
        refreshRate: 8
    },
    {
        id: 'earth_daggers',
        name: 'Earth-grade Shadow Daggers',
        description: 'Paired earth-grade daggers designed for swift, precise strikes.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1550 },
        effects: { atk: 26 },
        stock: 9,
        refreshRate: 8
    },
    {
        id: 'earth_bow',
        name: 'Earth-grade Bow',
        description: 'A reinforced earth-grade bow with strong draw and stable arcs.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1650 },
        effects: { atk: 27 },
        stock: 8,
        refreshRate: 8
    },
    {
        id: 'earth_staff',
        name: 'Earth-grade Staff',
        description: 'A balanced earth-grade staff favored by traveling monks.',
        type: 'weapon',
        rarity: 'uncommon',
        price: { yuan: 1350 },
        effects: { atk: 22 },
        stock: 11,
        refreshRate: 7
    },
    {
        id: 'spirit_herb',
        name: 'Thousand Year Spirit Herb',
        description: 'A rare herb that enhances cultivation speed.',
        type: 'material',
        rarity: 'uncommon',
        price: { spiritStones: { low: 10 } },
        effects: { cultivationSpeed: 1.2 },
        stock: 15,
        refreshRate: 7
    },
    {
        id: 'basic_qi_gathering',
        name: 'Basic Qi Gathering Manual',
        description: 'Fundamental techniques for sensing and gathering spiritual energy.',
        type: 'manual',
        rarity: 'common',
        price: { yuan: 500 },
        effects: { cultivationSpeed: 1.1, qiGathering: 20 },
        stock: 10,
        refreshRate: 7
    },
    {
        id: 'foundation_manual',
        name: 'Foundation Building Manual',
        description: 'A manual containing foundation establishment techniques.',
        type: 'manual',
        rarity: 'uncommon',
        price: { spiritStones: { low: 25 } },
        effects: { unlockTechnique: 'foundation_building' },
        requirements: { minRealm: 2 },
        stock: 5,
        refreshRate: 14
    },
    {
        id: 'elemental_affinity',
        name: 'Elemental Affinity Manual',
        description: 'Techniques to develop affinity with basic elements.',
        type: 'manual',
        rarity: 'uncommon',
        price: { spiritStones: { low: 35 } },
        effects: { elementalMastery: 1, qi: 25, special: ['elemental_sense'] },
        requirements: { minRealm: 3 },
        stock: 3,
        refreshRate: 21
    },
    // Rare Items
    {
        id: 'dragon_scale_armor',
        name: 'Dragon Scale Armor',
        description: 'Armor crafted from ancient dragon scales.',
        type: 'armor',
        rarity: 'rare',
        price: { spiritStones: { mid: 5 } },
        effects: { def: 50, hp: 100 },
        requirements: { minRealm: 5 },
        stock: 3,
        refreshRate: 30
    },
    {
        id: 'soul_tempering_pill',
        name: 'Soul Tempering Pill',
        description: 'A powerful pill that strengthens the soul.',
        type: 'pill',
        rarity: 'rare',
        price: { spiritStones: { mid: 3 } },
        effects: { daoHeart: 25, mentalFortitude: 2 },
        requirements: { minRealm: 4 },
        stock: 2,
        refreshRate: 21
    },
    {
        id: 'dragon_breathing',
        name: 'Dragon Breathing Technique',
        description: 'Ancient breathing method that mimics the dragon\'s qi circulation.',
        type: 'manual',
        rarity: 'rare',
        price: { spiritStones: { mid: 8 } },
        effects: { qi: 100, cultivationSpeed: 1.5, special: ['draconic_qi', 'enhanced_recovery'] },
        requirements: { minRealm: 5 },
        stock: 2,
        refreshRate: 30
    },
    // Epic Items
    {
        id: 'heaven_jian',
        name: 'Heaven-grade Jian of the Void',
        description: 'A heaven-grade sword that can cut through space itself.',
        type: 'weapon',
        rarity: 'epic',
        price: { spiritStones: { high: 2 } },
        effects: { atk: 200, special: ['void_cut', 'spatial_slash'] },
        requirements: { minRealm: 8, minCombatPower: 50000 },
        stock: 1,
        refreshRate: 90
    },
    {
        id: 'immortal_jian',
        name: 'Immortal-grade Jian of Starlight',
        description: 'An immortal-grade sword that sings with starlight, enhancing the wielder\'s sword intent.',
        type: 'weapon',
        rarity: 'epic',
        price: { spiritStones: { high: 3 } },
        effects: { atk: 140, special: ['starlight_edge', 'sword_intent_boost'] },
        requirements: { minRealm: 7, minCombatPower: 30000 },
        stock: 1,
        refreshRate: 120
    },
    // New Immortal/Heaven-grade Weapons
    {
        id: 'immortal_spear',
        name: 'Immortal-grade Dragon Spear',
        description: 'A spear forged from dragon bone, capable of piercing through any defense.',
        type: 'weapon',
        rarity: 'epic',
        price: { spiritStones: { high: 4 } },
        effects: { atk: 180, special: ['dragon_pierce', 'defense_penetration'] },
        requirements: { minRealm: 8, minCombatPower: 40000, sect: 'azure_cloud_sect' },
        stock: 1,
        refreshRate: 100
    },
    {
        id: 'heaven_saber',
        name: 'Heaven-grade Moonlight Saber',
        description: 'A curved saber that glows with moonlight, delivering swift and precise strikes.',
        type: 'weapon',
        rarity: 'epic',
        price: { spiritStones: { high: 3 } },
        effects: { atk: 160, special: ['moonlight_slash', 'swift_strike'] },
        requirements: { minRealm: 7, minCombatPower: 35000, faction: 'moonlight_pavilion' },
        stock: 1,
        refreshRate: 110
    },
    {
        id: 'immortal_staff',
        name: 'Immortal-grade Phoenix Staff',
        description: 'A staff carved from phoenix wood, capable of controlling elemental forces.',
        type: 'weapon',
        rarity: 'epic',
        price: { spiritStones: { high: 5 } },
        effects: { atk: 150, special: ['elemental_control', 'phoenix_rebirth'] },
        requirements: { minRealm: 9, minCombatPower: 45000, karma: 100 },
        stock: 1,
        refreshRate: 120
    },
    // Fate Defying Tier Weapons
    {
        id: 'fate_defying_sword',
        name: 'Fate Defying Sword of Destiny',
        description: 'A sword that defies the heavens themselves, capable of altering destiny.',
        type: 'weapon',
        rarity: 'legendary',
        price: { spiritStones: { high: 20 }, karma: 500 },
        effects: { atk: 300, special: ['destiny_alteration', 'heaven_defiance', 'fate_manipulation'] },
        requirements: { minRealm: 12, minCombatPower: 100000, karma: 300 },
        stock: 1,
        refreshRate: 365
    },
    {
        id: 'fate_defying_spear',
        name: 'Fate Defying Spear of Revolution',
        description: 'A spear that challenges the natural order, capable of overthrowing established powers.',
        type: 'weapon',
        rarity: 'legendary',
        price: { spiritStones: { high: 18 }, karma: 400 },
        effects: { atk: 280, special: ['revolutionary_force', 'order_disruption', 'power_overthrow'] },
        requirements: { minRealm: 11, minCombatPower: 90000, karma: 250 },
        stock: 1,
        refreshRate: 300
    },
    {
        id: 'immortal_ascension_pill',
        name: 'Immortal Ascension Pill',
        description: 'A divine pill that aids in breaking through to immortality.',
        type: 'pill',
        rarity: 'epic',
        price: { spiritStones: { high: 5 }, karma: 100 },
        effects: { breakthroughChance: 0.5, realmAdvancement: 1 },
        requirements: { minRealm: 9 },
        stock: 1,
        refreshRate: 365
    },
    {
        id: 'void_walking',
        name: 'Void Walking Manual',
        description: 'Advanced spatial manipulation techniques for traversing dimensions.',
        type: 'manual',
        rarity: 'epic',
        price: { spiritStones: { high: 12 }, karma: 200 },
        effects: { speed: 40, special: ['dimensional_travel', 'spatial_awareness', 'void_immunity'], daoInsight: 3 },
        requirements: { minRealm: 10, minCombatPower: 50000 },
        stock: 1,
        refreshRate: 180
    },
    // New Armor and Equipment Artifacts
    {
        id: 'immortal_robes',
        name: 'Immortal-grade Cloud Robes',
        description: 'Robes woven from celestial clouds, providing exceptional protection.',
        type: 'armor',
        rarity: 'epic',
        price: { spiritStones: { high: 6 } },
        effects: { def: 80, hp: 150, special: ['cloud_evasion', 'qi_regeneration'] },
        requirements: { minRealm: 8, minCombatPower: 40000 },
        stock: 2,
        refreshRate: 90
    },
    {
        id: 'heaven_armor',
        name: 'Heaven-grade Starfall Armor',
        description: 'Armor forged from fallen stars, granting celestial protection.',
        type: 'armor',
        rarity: 'epic',
        price: { spiritStones: { high: 8 } },
        effects: { def: 100, hp: 200, special: ['starfall_protection', 'cosmic_resistance'] },
        requirements: { minRealm: 9, minCombatPower: 50000 },
        stock: 1,
        refreshRate: 120
    },
    {
        id: 'fate_defying_armor',
        name: 'Fate Defying Chaos Armor',
        description: 'Armor that defies destiny itself, protecting the wearer from cosmic forces.',
        type: 'armor',
        rarity: 'legendary',
        price: { spiritStones: { high: 25 }, karma: 300 },
        effects: { def: 150, hp: 300, special: ['destiny_protection', 'chaos_immunity', 'reality_anchoring'] },
        requirements: { minRealm: 13, minCombatPower: 120000, karma: 200 },
        stock: 1,
        refreshRate: 365
    },
    // Artifact Equipment
    {
        id: 'celestial_ring',
        name: 'Celestial Ring of Harmony',
        description: 'A ring that harmonizes the wearer\'s qi with the cosmos.',
        type: 'treasure',
        rarity: 'epic',
        price: { spiritStones: { high: 7 } },
        effects: { qi: 200, cultivationSpeed: 1.8, special: ['cosmic_harmony', 'qi_amplification'] },
        requirements: { minRealm: 8, minCombatPower: 45000 },
        stock: 2,
        refreshRate: 100
    },
    {
        id: 'fate_defying_amulet',
        name: 'Fate Defying Amulet of Freedom',
        description: 'An amulet that grants freedom from predetermined destiny.',
        type: 'treasure',
        rarity: 'legendary',
        price: { spiritStones: { high: 30 }, karma: 400 },
        effects: { daoHeart: 50, mentalFortitude: 5, special: ['destiny_freedom', 'fate_resistance', 'free_will'] },
        requirements: { minRealm: 14, minCombatPower: 150000, karma: 350 },
        stock: 1,
        refreshRate: 400
    },
    // Legendary Items
    {
        id: 'chaos_origin_manual',
        name: 'Chaos Origin Cultivation Manual',
        description: 'The ultimate manual containing the secrets of chaos cultivation.',
        type: 'manual',
        rarity: 'legendary',
        price: { spiritStones: { high: 50 }, karma: 500 },
        effects: { unlockPath: 'chaos_cultivation', allStatsMultiplier: 2 },
        requirements: { minRealm: 15, minCombatPower: 1000000 },
        stock: 1,
        refreshRate: 3650 // 10 years
    }
];
// Items imported from data/items.json (starter content). These are appended here for quick playtesting.
const EXTRA_MARKET_ITEMS = [
    {
        id: 'spirit_stone',
        name: 'Spirit Stone',
        description: 'A raw spirit stone that can be absorbed for cultivation energy.',
        type: 'material',
        rarity: 'common',
        price: { yuan: 0 },
        effects: { cultivation_gain: 15 },
        stock: 999,
        refreshRate: 1
    },
    {
        id: 'ancient_manual_basic',
        name: 'Basic Manual',
        description: 'A worn manual teaching a simple technique.',
        type: 'manual',
        rarity: 'common',
        price: { yuan: 100 },
        effects: { skill_unlock: 'basic_strike' },
        stock: 10,
        refreshRate: 7
    },
    {
        id: 'ancient_manual_advanced',
        name: 'Advanced Manual',
        description: 'An advanced treatise that grants a permanent combat bonus.',
        type: 'manual',
        rarity: 'rare',
        price: { yuan: 500 },
        effects: { stat_bonus: { attack: 5 } },
        stock: 3,
        refreshRate: 21
    },
    {
        id: 'rebirth_petal',
        name: 'Rebirth Petal',
        description: 'Petals of a phoenix that can revive a fallen disciple once.',
        type: 'manual',
        rarity: 'rare',
        price: { yuan: 300 },
        effects: { revive: true },
        stock: 2,
        refreshRate: 30
    },
    {
        id: 'jade_fragment',
        name: 'Jade Fragment',
        description: 'A shard of jade with lingering elemental power.',
        type: 'treasure',
        rarity: 'uncommon',
        price: { yuan: 0 },
        effects: { void_resistance: 10 },
        stock: 10,
        refreshRate: 14
    },
    {
        id: 'alchemy_kit',
        name: 'Alchemy Kit',
        description: 'Basic kit used to attempt alchemy and crafts.',
        type: 'material',
        rarity: 'common',
        price: { yuan: 120 },
        effects: { alchemy_success_chance: 0.12 },
        stock: 8,
        refreshRate: 7
    },
    {
        id: 'qi_focus_charm',
        name: 'Qi Focus Charm',
        description: 'A charm that increases cultivation gain while equipped.',
        type: 'treasure',
        rarity: 'uncommon',
        price: { yuan: 250 },
        effects: { cultivation_rate_pct: 0.15 },
        stock: 5,
        refreshRate: 14
    },
    {
        id: 'tribulation_token',
        name: 'Tribulation Token',
        description: 'A rare token earned from high-level trials to ease tribulation difficulty.',
        type: 'treasure',
        rarity: 'epic',
        price: { yuan: 0 },
        effects: { reduce_tribulation_difficulty: 1 },
        stock: 1,
        refreshRate: 365
    },
    {
        id: 'ascend_essence',
        name: 'Ascend Essence',
        description: 'Essence used as a catalyst when forging bloodline pillars.',
        type: 'material',
        rarity: 'rare',
        price: { yuan: 0 },
        effects: { used_for: 'pillar_forging' },
        stock: 2,
        refreshRate: 90
    },
    {
        id: 'healer_salve',
        name: "Healer's Salve",
        description: 'A common salve that heals wounds and restores vigor.',
        type: 'pill',
        rarity: 'common',
        price: { yuan: 40 },
        effects: { heal: 50 },
        stock: 20,
        refreshRate: 7
    },
    {
        id: 'mirror_shard',
        name: 'Mirror Shard',
        description: 'A shard that confers moments of insight; used in Dao checks.',
        type: 'treasure',
        rarity: 'uncommon',
        price: { yuan: 0 },
        effects: { insight_bonus: 3 },
        stock: 6,
        refreshRate: 21
    },
    {
        id: 'battle_technique_scroll',
        name: 'Technique Scroll',
        description: 'Scroll that teaches a single-use martial technique when studied.',
        type: 'manual',
        rarity: 'uncommon',
        price: { yuan: 200 },
        effects: { learn_skill: 'shadow_strike' },
        stock: 6,
        refreshRate: 21
    }
];
exports.MARKET_ITEMS.push(...EXTRA_MARKET_ITEMS);
exports.MARKETS = [
    {
        id: 'mortal_bazaar',
        name: 'Mortal Realm Bazaar',
        description: 'A bustling marketplace for beginning cultivators.',
        location: 'Mortal Realm',
        type: 'general',
        items: exports.MARKET_ITEMS.filter(item => item.rarity === 'common' ||
            (item.rarity === 'uncommon' && (!item.requirements?.minRealm || item.requirements.minRealm <= 3)))
    },
    {
        id: 'immortal_emporium',
        name: 'Immortal Emporium',
        description: 'An exclusive marketplace for immortal beings.',
        location: 'Immortal Realm',
        type: 'immortal',
        items: exports.MARKET_ITEMS.filter(item => item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary'),
        requirements: { minRealm: 10 }
    },
    {
        id: 'shadow_black_market',
        name: 'Shadow Black Market',
        description: 'A hidden market dealing in forbidden items.',
        location: 'Underground',
        type: 'black',
        items: exports.MARKET_ITEMS.filter(item => item.effects?.karma && item.effects.karma < 0).concat([
            {
                id: 'hell_heaven_defying_blade',
                name: 'Heaven-Defying Hell Blade',
                description: 'An infamous blade that devours souls and defies the order of heaven.',
                type: 'weapon',
                rarity: 'epic',
                price: { yuan: 100000, karma: -100 },
                effects: { atk: 150, special: ['soul_steal', 'life_drain', 'heaven_defiance'] },
                stock: 1,
                refreshRate: 180
            }
        ]),
        requirements: { faction: 'shadow_thieves_guild' }
    },
    {
        id: 'heavenly_auction_house',
        name: 'Heavenly Auction House',
        description: 'The premier auction house spanning all realms.',
        location: 'Neutral Territory',
        type: 'auction',
        items: [], // Auction items are dynamic
        requirements: { minRealm: 5 }
    }
];
class MarketSystem {
    // Simple player listings (auction house)
    listItemForAuction(itemId, startingBid, buyoutPrice, playerState) {
        // Ensure player owns at least 1 of the item
        if (!this.playerInventory[itemId] || this.playerInventory[itemId] <= 0)
            return false;
        const item = exports.MARKET_ITEMS.find(i => i.id === itemId);
        if (!item)
            return false;
        const auction = {
            id: `auction_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            item: { ...item },
            sellerId: 'player',
            sellerName: playerState.name || 'You',
            startingBid: Math.max(1, startingBid),
            currentBid: Math.max(1, startingBid),
            currentBidder: null,
            timeRemaining: 24, // 24 hours default
            bidHistory: [],
            buyoutPrice
        };
        // Remove item from inventory and create auction
        this.removeFromInventory(itemId, 1);
        this.activeAuctions.push(auction);
        return true;
    }
    sellToMarket(marketId, itemId, quantity, playerState) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market)
            return false;
        if (!this.playerInventory[itemId] || this.playerInventory[itemId] < quantity)
            return false;
        const item = exports.MARKET_ITEMS.find(i => i.id === itemId);
        if (!item)
            return false;
        // Simple sell price: 40% of base yuan-equivalent value
        const unitPrice = this.calculateBasePrice(item) * 0.4;
        const total = Math.floor(unitPrice * quantity);
        playerState.yuan = (playerState.yuan || 0) + total;
        this.removeFromInventory(itemId, quantity);
        return true;
    }
    removeFromInventory(itemId, quantity) {
        if (!this.playerInventory[itemId])
            return;
        this.playerInventory[itemId] = Math.max(0, (this.playerInventory[itemId] || 0) - quantity);
        if (this.playerInventory[itemId] === 0)
            delete this.playerInventory[itemId];
    }
    constructor() {
        this.markets = [...exports.MARKETS];
        this.activeAuctions = [];
        this.playerInventory = {};
        this.lastRefresh = {};
        this.initializeMarkets();
    }
    initializeMarkets() {
        const now = Date.now();
        this.markets.forEach(market => {
            this.lastRefresh[market.id] = now;
        });
        // Generate initial auctions
        this.generateRandomAuctions();
    }
    getAvailableMarkets(playerState) {
        return this.markets.filter(market => {
            if (!market.requirements)
                return true;
            if (market.requirements.minRealm && playerState.realm < market.requirements.minRealm) {
                return false;
            }
            if (market.requirements.faction && playerState.faction !== market.requirements.faction) {
                return false;
            }
            if (market.requirements.sect && playerState.sect !== market.requirements.sect) {
                return false;
            }
            if (market.requirements.karma && playerState.karma < market.requirements.karma) {
                return false;
            }
            return true;
        });
    }
    getMarketItems(marketId, playerState) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market)
            return [];
        // Refresh market if needed
        this.refreshMarket(marketId);
        return market.items.filter(item => {
            if (!item.requirements)
                return true;
            if (item.requirements.minRealm && playerState.realm < item.requirements.minRealm) {
                return false;
            }
            if (item.requirements.minCombatPower && playerState.combatPower < item.requirements.minCombatPower) {
                return false;
            }
            return true;
        });
    }
    buyItem(marketId, itemId, playerState) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market)
            return false;
        const item = market.items.find(i => i.id === itemId);
        if (!item || item.stock <= 0)
            return false;
        // Check if player can afford the item
        if (!this.canAfford(item.price, playerState))
            return false;
        // Deduct payment
        this.deductPayment(item.price, playerState);
        // Add item to inventory
        this.addToInventory(item);
        // Reduce stock
        item.stock--;
        return true;
    }
    canAfford(price, playerState) {
        if (price.yuan && playerState.yuan < price.yuan)
            return false;
        if (price.spiritStones) {
            if (price.spiritStones.low && playerState.spiritStones.low < price.spiritStones.low)
                return false;
            if (price.spiritStones.mid && playerState.spiritStones.mid < price.spiritStones.mid)
                return false;
            if (price.spiritStones.high && playerState.spiritStones.high < price.spiritStones.high)
                return false;
        }
        if (price.karma && playerState.karma < price.karma)
            return false;
        return true;
    }
    deductPayment(price, playerState) {
        if (price.yuan)
            playerState.yuan -= price.yuan;
        if (price.spiritStones) {
            if (price.spiritStones.low)
                playerState.spiritStones.low -= price.spiritStones.low;
            if (price.spiritStones.mid)
                playerState.spiritStones.mid -= price.spiritStones.mid;
            if (price.spiritStones.high)
                playerState.spiritStones.high -= price.spiritStones.high;
        }
        if (price.karma)
            playerState.karma -= price.karma;
    }
    addToInventory(item) {
        this.playerInventory[item.id] = (this.playerInventory[item.id] || 0) + 1;
    }
    refreshMarket(marketId) {
        const market = this.markets.find(m => m.id === marketId);
        if (!market)
            return;
        const now = Date.now();
        const lastRefresh = this.lastRefresh[marketId] || 0;
        const daysSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60 * 24);
        market.items.forEach(item => {
            if (daysSinceRefresh >= item.refreshRate) {
                // Restore some stock
                const restockAmount = Math.floor(Math.random() * 3) + 1;
                item.stock = Math.min(item.stock + restockAmount, 100); // Max stock of 100
            }
        });
        if (daysSinceRefresh >= 1) {
            this.lastRefresh[marketId] = now;
        }
    }
    // Auction System
    getActiveAuctions() {
        // Update auction times
        this.updateAuctionTimes();
        return this.activeAuctions.filter(auction => auction.timeRemaining > 0);
    }
    placeBid(auctionId, bidAmount, playerState) {
        const auction = this.activeAuctions.find(a => a.id === auctionId);
        if (!auction || auction.timeRemaining <= 0)
            return false;
        if (bidAmount <= auction.currentBid)
            return false;
        if (playerState.yuan < bidAmount)
            return false;
        // Record the bid
        auction.bidHistory.push({
            bidderId: 'player',
            bidderName: playerState.name || 'Anonymous',
            amount: bidAmount,
            timestamp: Date.now()
        });
        auction.currentBid = bidAmount;
        auction.currentBidder = 'player';
        return true;
    }
    buyoutAuction(auctionId, playerState) {
        const auction = this.activeAuctions.find(a => a.id === auctionId);
        if (!auction || !auction.buyoutPrice || auction.timeRemaining <= 0)
            return false;
        if (playerState.yuan < auction.buyoutPrice)
            return false;
        // Deduct payment
        playerState.yuan -= auction.buyoutPrice;
        // Add item to inventory
        this.addToInventory(auction.item);
        // Remove auction
        this.activeAuctions = this.activeAuctions.filter(a => a.id !== auctionId);
        return true;
    }
    updateAuctionTimes() {
        this.activeAuctions.forEach(auction => {
            auction.timeRemaining = Math.max(0, auction.timeRemaining - 0.1); // Decrease by 0.1 hours
            // If auction ended and player won
            if (auction.timeRemaining <= 0 && auction.currentBidder === 'player') {
                this.addToInventory(auction.item);
                // In a real game, you'd also handle payment here
            }
        });
        // Remove expired auctions
        this.activeAuctions = this.activeAuctions.filter(auction => auction.timeRemaining > 0);
    }
    generateRandomAuctions() {
        // Generate 3-5 random auctions
        const auctionCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < auctionCount; i++) {
            const randomItem = exports.MARKET_ITEMS[Math.floor(Math.random() * exports.MARKET_ITEMS.length)];
            const basePrice = this.calculateBasePrice(randomItem);
            const auction = {
                id: `auction_${Date.now()}_${i}`,
                item: { ...randomItem },
                sellerId: `npc_${Math.floor(Math.random() * 1000)}`,
                sellerName: this.generateSellerName(),
                startingBid: Math.floor(basePrice * 0.7),
                currentBid: Math.floor(basePrice * 0.7),
                currentBidder: null,
                timeRemaining: Math.random() * 48 + 12, // 12-60 hours
                bidHistory: [],
                buyoutPrice: Math.floor(basePrice * 1.5)
            };
            this.activeAuctions.push(auction);
        }
    }
    calculateBasePrice(item) {
        let basePrice = item.price.yuan || 0;
        if (item.price.spiritStones) {
            basePrice += (item.price.spiritStones.low || 0) * 100;
            basePrice += (item.price.spiritStones.mid || 0) * 10000;
            basePrice += (item.price.spiritStones.high || 0) * 1000000;
        }
        return Math.max(basePrice, 1000); // Minimum base price
    }
    generateSellerName() {
        const prefixes = ['Elder', 'Master', 'Lord', 'Lady', 'Sage', 'Immortal'];
        const names = ['Cloudwalker', 'Stormbreaker', 'Voidseeker', 'Flameborn', 'Starweaver', 'Shadowbane'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        return `${prefix} ${name}`;
    }
    getPlayerInventory() {
        return { ...this.playerInventory };
    }
}
exports.MarketSystem = MarketSystem;
