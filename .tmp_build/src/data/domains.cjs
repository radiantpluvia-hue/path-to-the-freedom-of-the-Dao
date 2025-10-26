"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_PARAMS = exports.FACTION_TEMPLATES = exports.TERRITORY_TYPES = exports.BUILDING_PROTOTYPES = void 0;
exports.BUILDING_PROTOTYPES = {
    watchtower: {
        id: 'watchtower',
        name: 'Watchtower',
        description: 'Provides defense and scouting capabilities',
        cost: { gold: 50, spirit_ore: 10 },
        maintenanceCost: { gold: 5 },
        defenseBonus: 25,
        yieldBonus: { influencePoint: 2 },
        buildTime: 10,
        requirements: { domainLevel: 1 }
    },
    farm: {
        id: 'farm',
        name: 'Farm',
        description: 'Increases food production',
        cost: { gold: 30 },
        maintenanceCost: { gold: 2 },
        yieldBonus: { food: 15 },
        buildTime: 5,
        requirements: { domainLevel: 1 }
    },
    mine: {
        id: 'mine',
        name: 'Mine',
        description: 'Extracts spirit ore from the ground',
        cost: { gold: 40, spirit_ore: 5 },
        maintenanceCost: { gold: 3 },
        yieldBonus: { spirit_ore: 8 },
        buildTime: 8,
        requirements: { domainLevel: 2 }
    },
    market: {
        id: 'market',
        name: 'Market',
        description: 'Increases gold income and trade efficiency',
        cost: { gold: 60 },
        maintenanceCost: { gold: 4 },
        yieldBonus: { gold: 20 },
        buildTime: 12,
        requirements: { domainLevel: 3 },
        slots: 2
    },
    shrine: {
        id: 'shrine',
        name: 'Shrine',
        description: 'Provides spiritual benefits and influence',
        cost: { gold: 80, spirit_stone: 5 },
        maintenanceCost: { gold: 6 },
        yieldBonus: { influencePoint: 5, spirit_stone: 2 },
        buildTime: 15,
        requirements: { domainLevel: 4 }
    },
    workshop: {
        id: 'workshop',
        name: 'Workshop',
        description: 'Enables crafting and production bonuses',
        cost: { gold: 70, spirit_ore: 15 },
        maintenanceCost: { gold: 5 },
        yieldBonus: { spirit_stone: 3 },
        buildTime: 10,
        requirements: { domainLevel: 3 },
        slots: 1
    },
    barracks: {
        id: 'barracks',
        name: 'Barracks',
        description: 'Increases garrison capacity and training',
        cost: { gold: 90 },
        maintenanceCost: { gold: 7 },
        defenseBonus: 40,
        buildTime: 14,
        requirements: { domainLevel: 2 }
    },
    clan_hall: {
        id: 'clan_hall',
        name: 'Clan Hall',
        description: 'Domain-wide headquarters providing global bonuses',
        cost: { gold: 200, spirit_stone: 20 },
        maintenanceCost: { gold: 15 },
        yieldBonus: { gold: 10, food: 10, influencePoint: 10 },
        buildTime: 30,
        requirements: { domainLevel: 5 },
        slots: 3
    }
};
exports.TERRITORY_TYPES = {
    town: {
        id: 'town',
        name: 'Town',
        description: 'Urban settlement with good infrastructure',
        baseYield: { gold: 15, food: 10, influencePoint: 3 },
        defenseModifier: 1.2,
        buildableBuildings: ['watchtower', 'market', 'barracks', 'clan_hall'],
        specialFeatures: ['population_growth', 'trade_hub']
    },
    farmland: {
        id: 'farmland',
        name: 'Farmland',
        description: 'Fertile agricultural land',
        baseYield: { food: 25, gold: 5 },
        defenseModifier: 0.8,
        buildableBuildings: ['farm', 'watchtower'],
        specialFeatures: ['agricultural_bonus', 'seasonal_yields']
    },
    mine: {
        id: 'mine',
        name: 'Mine',
        description: 'Rich mineral deposits',
        baseYield: { spirit_ore: 12, gold: 8 },
        defenseModifier: 0.9,
        buildableBuildings: ['mine', 'workshop', 'watchtower'],
        specialFeatures: ['ore_deposits', 'underground_networks']
    },
    sect: {
        id: 'sect',
        name: 'Sect Grounds',
        description: 'Sacred cultivation grounds',
        baseYield: { spirit_stone: 5, influencePoint: 8 },
        defenseModifier: 1.5,
        buildableBuildings: ['shrine', 'watchtower', 'clan_hall'],
        specialFeatures: ['cultivation_focus', 'spiritual_energy']
    },
    ruin: {
        id: 'ruin',
        name: 'Ancient Ruins',
        description: 'Remnants of ancient civilization',
        baseYield: { influencePoint: 6, spirit_stone: 3 },
        defenseModifier: 0.7,
        buildableBuildings: ['shrine', 'workshop'],
        specialFeatures: ['archaeological_findings', 'hidden_treasures']
    },
    wild: {
        id: 'wild',
        name: 'Wilderness',
        description: 'Untamed natural territory',
        baseYield: { food: 8, influencePoint: 2 },
        defenseModifier: 0.6,
        buildableBuildings: ['watchtower', 'farm'],
        specialFeatures: ['natural_resources', 'monster_habitats']
    },
    fort: {
        id: 'fort',
        name: 'Fortress',
        description: 'Military stronghold',
        baseYield: { influencePoint: 4 },
        defenseModifier: 2.0,
        buildableBuildings: ['barracks', 'watchtower', 'clan_hall'],
        specialFeatures: ['military_training', 'strategic_position']
    },
    port: {
        id: 'port',
        name: 'Port',
        description: 'Coastal trading hub',
        baseYield: { gold: 20, food: 12 },
        defenseModifier: 1.1,
        buildableBuildings: ['market', 'watchtower', 'workshop'],
        specialFeatures: ['maritime_trade', 'fishing_bonus']
    }
};
exports.FACTION_TEMPLATES = {
    player_faction: {
        id: 'player_faction',
        name: 'Player Domain',
        description: 'Your personal faction and domain',
        startingRelation: 'ally',
        techTree: {
            basic_infrastructure: {
                id: 'basic_infrastructure',
                name: 'Basic Infrastructure',
                description: 'Improves basic resource production',
                cost: 100,
                effects: {
                    yieldModifiers: { gold: 0.1, food: 0.1 },
                    upkeepReduction: 0.05
                }
            },
            advanced_mining: {
                id: 'advanced_mining',
                name: 'Advanced Mining',
                description: 'Unlocks better mining techniques',
                cost: 200,
                effects: {
                    yieldModifiers: { spirit_ore: 0.25 },
                    exclusiveBuildings: ['mine']
                },
                prerequisites: ['basic_infrastructure']
            },
            spiritual_focus: {
                id: 'spiritual_focus',
                name: 'Spiritual Focus',
                description: 'Enhances spiritual cultivation and influence',
                cost: 150,
                effects: {
                    yieldModifiers: { spirit_stone: 0.2, influencePoint: 0.3 },
                    exclusiveBuildings: ['shrine']
                },
                prerequisites: ['basic_infrastructure']
            },
            military_training: {
                id: 'military_training',
                name: 'Military Training',
                description: 'Improves garrison effectiveness',
                cost: 180,
                effects: {
                    territoryBonuses: { garrisonBonus: 0.2 }
                },
                prerequisites: ['basic_infrastructure']
            }
        }
    },
    rival_sect: {
        id: 'rival_sect',
        name: 'Rival Sect',
        description: 'Competing cultivation sect',
        startingRelation: 'hostile',
        techTree: {
            sect_expansion: {
                id: 'sect_expansion',
                name: 'Sect Expansion',
                description: 'Focuses on territorial growth',
                cost: 120,
                effects: {
                    yieldModifiers: { influencePoint: 0.15 }
                }
            }
        }
    },
    merchant_guild: {
        id: 'merchant_guild',
        name: 'Merchant Guild',
        description: 'Trading organization focused on commerce',
        startingRelation: 'neutral',
        techTree: {
            trade_networks: {
                id: 'trade_networks',
                name: 'Trade Networks',
                description: 'Enhances market efficiency',
                cost: 140,
                effects: {
                    yieldModifiers: { gold: 0.2 },
                    exclusiveBuildings: ['market']
                }
            }
        }
    }
};
exports.DOMAIN_PARAMS = {
    tickIntervalSec: 60,
    baseInfluenceThreshold: 100,
    influenceDecayPerTick: 0.02,
    ownershipLeadPct: 0.25,
    contestDurationSec: 3600,
    garrisonWeight: 0.5,
    baseYield: { gold: 10, food: 20, spirit_ore: 1, spirit_stone: 0, influencePoint: 1 },
    rarityMultipliers: { common: 1, rare: 1.5, ancient: 2.5 },
    upkeepMultiplierPerBuildingLevel: 0.05,
    raidBaseSuccessChance: 0.35,
    maxGarrisonSize: 100,
    baseClaimCost: 50,
    buildingMaintenanceInterval: 3600, // 1 hour in seconds
    factionContributionDecay: 0.01,
    territoryDiscoveryRadius: 3,
    migrationBatchSize: 10
};
