"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectFactionSystem = exports.MAJOR_FACTIONS = exports.MAJOR_SECTS = void 0;
exports.MAJOR_SECTS = [
    {
        id: 'azure_cloud_sect',
        name: 'Azure Cloud Sect',
        description: 'A righteous sect known for their cloud-walking techniques and moral cultivation.',
        type: 'righteous',
        realm: 3,
        power: 8500,
        reputation: 0,
        requirements: {
            minRealm: 2,
            karma: 10
        },
        benefits: {
            techniques: ['cloud_step', 'azure_sword_art', 'righteous_qi_cultivation'],
            resources: { spiritStones: 50, manuals: 3 },
            protection: 100,
            missions: ['demon_hunting', 'artifact_recovery', 'disciple_rescue']
        },
        rivals: ['blood_moon_sect', 'mount_hua_sect'],
        allies: ['buddha_sect', 'tao_school']
    },
    {
        id: 'blood_moon_sect',
        name: 'Blood Moon Sect',
        description: 'A demonic sect that practices blood cultivation and forbidden techniques.',
        type: 'demonic',
        realm: 4,
        power: 7800,
        reputation: 0,
        requirements: {
            minRealm: 3,
            karma: -20
        },
        benefits: {
            techniques: ['blood_sacrifice', 'crimson_claw', 'soul_devouring_art'],
            resources: { bloodEssence: 100, forbiddenManuals: 2 },
            protection: 80,
            missions: ['soul_harvesting', 'righteous_sect_raids', 'artifact_corruption']
        },
        rivals: ['azure_cloud_sect', 'buddha_sect'],
        allies: ['demon_immortal_palace', 'darkness_sect']
    },
    {
        id: 'eternal_dao_academy',
        name: 'Eternal Dao Academy',
        description: 'An ancient scholarly sect focused on Dao comprehension and knowledge.',
        type: 'ancient',
        realm: 5,
        power: 12000,
        reputation: 0,
        requirements: {
            minRealm: 4,
            minCombatPower: 5000,
            specialRequirements: ['scholar_background', 'high_insight']
        },
        benefits: {
            techniques: ['dao_comprehension', 'reality_analysis', 'time_perception'],
            resources: { ancientTexts: 10, daoInsights: 5 },
            protection: 150,
            missions: ['ancient_ruin_exploration', 'dao_research', 'knowledge_preservation']
        },
        rivals: [],
        allies: ['dao_school', 'tao_school']
    },
    {
        id: 'dragon_emperor_palace',
        name: 'Dragon Emperor Palace',
        description: 'The supreme sect of the dragon race, accepting only those with dragon bloodline.',
        type: 'ancient',
        realm: 8,
        power: 25000,
        reputation: 0,
        requirements: {
            minRealm: 6,
            specialRequirements: ['dragon_bloodline', 'imperial_recognition']
        },
        benefits: {
            techniques: ['dragon_transformation', 'imperial_dominance', 'celestial_dragon_art'],
            resources: { dragonEssence: 200, imperialTreasures: 5 },
            protection: 300,
            missions: ['realm_conquest', 'bloodline_awakening', 'imperial_duties']
        },
        rivals: ['phoenix_court', 'void_emperor_sect'],
        allies: ['upper_north_sect']
    },
    {
        id: 'void_emperor_sect',
        name: 'Void Emperor Sect',
        description: 'A mysterious sect that exists between dimensions, masters of void cultivation.',
        type: 'hidden',
        realm: 10,
        power: 30000,
        reputation: 0,
        requirements: {
            minRealm: 8,
            specialRequirements: ['void_affinity', 'dimensional_awareness']
        },
        benefits: {
            techniques: ['void_mastery', 'dimensional_travel', 'reality_manipulation'],
            resources: { voidEssence: 500, dimensionalShards: 10 },
            protection: 500,
            missions: ['dimensional_stabilization', 'void_exploration', 'reality_maintenance']
        },
        rivals: ['dragon_emperor_palace', 'starlight_sect'],
        allies: ['darkness_sect']
    },
    // New Sects
    {
        id: 'mount_hua_sect',
        name: 'Mount Hua Sect',
        description: 'Balance between swordsmanship and internal cultivation; purity of heart guides strength.',
        type: 'righteous',
        realm: 6,
        power: 9500,
        reputation: 0,
        requirements: {
            minRealm: 4,
            minCombatPower: 4000,
            karma: 15
        },
        benefits: {
            techniques: ['plum_blossom_sword_style', 'petal_storm_slash', 'mountain_meditation'],
            resources: { spiritStones: 60, swordManuals: 4 },
            protection: 120,
            missions: ['sword_training', 'demon_suppression', 'righteous_quests']
        },
        rivals: ['starlight_sect', 'demon_immortal_palace'],
        allies: ['azure_cloud_sect', 'buddha_sect']
    },
    {
        id: 'buddha_sect',
        name: 'Buddha Sect',
        description: 'Enlightenment through compassion, meditation, and selflessness.',
        type: 'righteous',
        realm: 7,
        power: 11000,
        reputation: 0,
        requirements: {
            minRealm: 5,
            karma: 25,
            specialRequirements: ['compassionate_heart']
        },
        benefits: {
            techniques: ['lotus_palm', 'buddha_embrace', 'serene_lotus_meditation'],
            resources: { enlightenmentScrolls: 8, meditationCushions: 3 },
            protection: 180,
            missions: ['meditation_retreats', 'demon_purification', 'compassion_quests']
        },
        rivals: ['demon_immortal_palace', 'blood_moon_sect'],
        allies: ['mount_hua_sect', 'tao_school']
    },
    {
        id: 'starlight_sect',
        name: 'Starlight Sect',
        description: 'The cosmos guides destiny; cultivate in harmony with celestial cycles.',
        type: 'ancient',
        realm: 8,
        power: 13000,
        reputation: 0,
        requirements: {
            minRealm: 6,
            minCombatPower: 6000,
            specialRequirements: ['celestial_affinity']
        },
        benefits: {
            techniques: ['starlight_saber', 'celestial_navigation', 'meteor_fall'],
            resources: { starEssence: 100, celestialCharts: 5 },
            protection: 200,
            missions: ['star_observation', 'cosmic_balance', 'destiny_quests']
        },
        rivals: ['mount_hua_sect', 'dao_school'],
        allies: ['void_emperor_sect', 'world_alliance']
    },
    {
        id: 'upper_north_sect',
        name: 'Upper North Sect',
        description: 'Guardians of the northern wilderness; embraces endurance, adaptability, and resilience.',
        type: 'neutral',
        realm: 7,
        power: 10500,
        reputation: 0,
        requirements: {
            minRealm: 5,
            minCombatPower: 4500,
            specialRequirements: ['northern_heritage']
        },
        benefits: {
            techniques: ['ironwood_palm', 'frostvine_grapple', 'northern_sentinel_form'],
            resources: { winterHerbs: 80, resilienceManuals: 4 },
            protection: 160,
            missions: ['wilderness_survival', 'border_protection', 'endurance_trials']
        },
        rivals: ['lower_south_sect'],
        allies: ['dragon_emperor_palace', 'world_alliance']
    },
    {
        id: 'lower_south_sect',
        name: 'Lower South Sect',
        description: 'Masters of adaptability, fluid combat, and environmental manipulation.',
        type: 'neutral',
        realm: 7,
        power: 10200,
        reputation: 0,
        requirements: {
            minRealm: 5,
            minCombatPower: 4200,
            specialRequirements: ['southern_heritage']
        },
        benefits: {
            techniques: ['torrent_palm', 'jungle_serpent_step', 'southern_mirage_strike'],
            resources: { tropicalHerbs: 75, agilityManuals: 4 },
            protection: 150,
            missions: ['jungle_exploration', 'adaptability_training', 'environment_quests']
        },
        rivals: ['upper_north_sect'],
        allies: ['tao_school', 'darkness_sect']
    },
    {
        id: 'darkness_sect',
        name: 'Darkness Sect',
        description: 'Embraces shadows to understand the balance between light and dark.',
        type: 'hidden',
        realm: 9,
        power: 14000,
        reputation: 0,
        requirements: {
            minRealm: 7,
            minCombatPower: 7000,
            specialRequirements: ['shadow_affinity']
        },
        benefits: {
            techniques: ['shadow_step', 'darkness_devouring_strike', 'umbral_veil'],
            resources: { shadowEssence: 120, stealthManuals: 6 },
            protection: 220,
            missions: ['shadow_training', 'covert_operations', 'balance_quests']
        },
        rivals: ['heavenly_court', 'tao_school'],
        allies: ['blood_moon_sect', 'void_emperor_sect', 'lower_south_sect']
    },
    // User-requested mortal world sects
    {
        id: 'shaolin_monastery',
        name: 'Shaolin Monastery',
        description: 'An ancient monastery blending martial discipline with spiritual cultivation; famed for iron bodies and striking techniques.',
        type: 'righteous',
        realm: 6,
        power: 11500,
        reputation: 0,
        requirements: {
            minRealm: 4,
            minCombatPower: 4500,
            karma: 20
        },
        benefits: {
            techniques: ['iron_bodhisattva_palm', 'shaolin_iron_body', 'monk_strike_form'],
            resources: { spiritStones: 70, meditationScrolls: 4 },
            protection: 160,
            missions: ['monastery_maintenance', 'discipline_training']
        },
        rivals: ['blood_moon_sect', 'demon_immortal_palace'],
        allies: ['buddha_sect', 'azure_cloud_sect']
    },
    {
        id: 'wudang_sect',
        name: 'Wudang Sect',
        description: 'A Taoist sword-and-internal-cultivation sect emphasizing balance, soft power, and internal alchemy.',
        type: 'righteous',
        realm: 6,
        power: 11200,
        reputation: 0,
        requirements: { minRealm: 4, minCombatPower: 4200 },
        benefits: {
            techniques: ['wudang_taiyi_sword', 'internal_harmony', 'taiji_palm'],
            resources: { spiritStones: 65, elixirs: 3 },
            protection: 150,
            missions: ['inner_alchemy', 'sword_training']
        },
        rivals: ['darkness_sect'],
        allies: ['tao_school', 'mount_hua_sect']
    },
    {
        id: 'emei_sect',
        name: 'Emei Sect',
        description: 'Renowned for their combination of sword and healing arts; many female masters and graceful techniques.',
        type: 'righteous',
        realm: 5,
        power: 9800,
        reputation: 0,
        requirements: { minRealm: 4, karma: 12 },
        benefits: {
            techniques: ['emei_sword_dance', 'healing_lotus', 'serene_aura'],
            resources: { spiritStones: 50, medicalManuals: 6 },
            protection: 130,
            missions: ['healing_missions', 'sword_tournaments']
        },
        rivals: ['blood_moon_sect'],
        allies: ['buddha_sect']
    },
    {
        id: 'kunlun_sect',
        name: 'Kunlun Sect',
        description: 'An ancient mountain sect with broad mastery over element-based formation arts and heavenly techniques.',
        type: 'ancient',
        realm: 7,
        power: 14000,
        reputation: 0,
        requirements: { minRealm: 5, minCombatPower: 6000 },
        benefits: {
            techniques: ['kunlun_heavenly_formation', 'elemental_embrace', 'mountain_guardian_stance'],
            resources: { ancientTexts: 6, spiritStones: 120 },
            protection: 200,
            missions: ['formation_mastery', 'ancient_relic_search']
        },
        rivals: ['void_emperor_sect'],
        allies: ['starlight_sect']
    },
    {
        id: 'beggars_sect',
        name: "Beggar's Sect",
        description: "A loose but mighty brotherhood famed for unorthodox techniques and a massive social network among commoners.",
        type: 'neutral',
        realm: 5,
        power: 9000,
        reputation: 0,
        requirements: { minRealm: 3 },
        benefits: {
            techniques: ['beggar_club_tactics', 'crowd_influence', 'rumor_network'],
            resources: { yuan: 5000, connections: 1 },
            protection: 100,
            missions: ['alms_runs', 'community_defense']
        },
        rivals: ['demon_immortal_palace'],
        allies: ['lower_south_sect']
    },
    {
        id: 'huashan_sword_school',
        name: 'Huashan Sword School',
        description: 'A focused sword school branch of Mount Hua, obsessive about precision, speed, and dueling culture.',
        type: 'righteous',
        realm: 6,
        power: 10400,
        reputation: 0,
        requirements: { minRealm: 4, minCombatPower: 3800 },
        benefits: {
            techniques: ['sky_cleaver_slash', 'thousand_phantom_blade', 'sudden_strike_step'],
            resources: { swordManuals: 5, spiritStones: 45 },
            protection: 120,
            missions: ['duel_challenges', 'blade_refinement']
        },
        rivals: ['mount_hua_sect'],
        allies: ['wudang_sect']
    },
    {
        id: 'xingyun_sect',
        name: 'Xingyun Sect',
        description: 'A sect attuned to fate and stars; practitioners weave destiny into their cultivation and combat.',
        type: 'ancient',
        realm: 6,
        power: 11800,
        reputation: 0,
        requirements: { minRealm: 5, specialRequirements: ['celestial_affinity'] },
        benefits: {
            techniques: ['star_binding', 'fortune_tide', 'celestial_shroud'],
            resources: { starEssence: 60 },
            protection: 150,
            missions: ['celestial_omens', 'fate_weaving']
        },
        rivals: ['starlight_sect'],
        allies: ['eternal_dao_academy']
    },
    {
        id: 'ming_cult',
        name: 'Ming Cult',
        description: 'A charismatic, sometimes radical organization mixing faith, swordplay, and charismatic rituals.',
        type: 'neutral',
        realm: 5,
        power: 9800,
        reputation: 0,
        requirements: { minRealm: 4 },
        benefits: {
            techniques: ['righteous_flame_ritual', 'cult_inspiration', 'cleansing_strike'],
            resources: { followers: 200, spiritStones: 40 },
            protection: 110,
            missions: ['mass_conversion', 'ritual_safeguarding']
        },
        rivals: ['heavenly_court', 'buddha_sect'],
        allies: []
    },
    {
        id: 'wanshou_valley',
        name: 'Wanshou Valley',
        description: 'A secluded valley famed for beast-taming and longevity arts, home to many strange cultivators.',
        type: 'neutral',
        realm: 5,
        power: 9200,
        reputation: 0,
        requirements: { minRealm: 4 },
        benefits: {
            techniques: ['beast_whisper', 'valley_endurance', 'longevity_brew'],
            resources: { rareHerbs: 90 },
            protection: 120,
            missions: ['herb_gathering', 'beast_husbandry']
        },
        rivals: ['upper_north_sect'],
        allies: []
    },
    {
        id: 'qingcheng_sect',
        name: 'Qingcheng Sect',
        description: 'A quiet Taoist sect emphasizing inner tranquility, mountain hermitage, and subtle poisons/medicines.',
        type: 'righteous',
        realm: 5,
        power: 9400,
        reputation: 0,
        requirements: { minRealm: 4 },
        benefits: {
            techniques: ['mountain_meditation', 'serpent_poison_antidote', 'hidden_breeze_step'],
            resources: { medicinalHerbs: 70 },
            protection: 125,
            missions: ['hermit_guidance', 'poison_cleansing']
        },
        rivals: ['darkness_sect'],
        allies: ['buddha_sect']
    },
    {
        id: 'celestial_demon_sect',
        name: 'Celestial Demon Sect',
        description: 'A sect that blends celestial forms with demonic power — feared and often ostracized.',
        type: 'demonic',
        realm: 7,
        power: 13500,
        reputation: 0,
        requirements: { minRealm: 6, karma: -30 },
        benefits: {
            techniques: ['demon_heaven_merge', 'star_corruption', 'celestial_fang_strike'],
            resources: { demonEssence: 80 },
            protection: 200,
            missions: ['corrupt_rituals', 'shadow_ambush']
        },
        rivals: ['heavenly_court'],
        allies: ['demon_immortal_palace']
    },
    {
        id: 'sword_sect_mount_shu',
        name: 'Sword Sect of Mount Shu',
        description: 'A proud sword sect from Mount Shu obsessed with refining blade art into philosophical expression.',
        type: 'ancient',
        realm: 6,
        power: 10900,
        reputation: 0,
        requirements: { minRealm: 5, minCombatPower: 4000 },
        benefits: {
            techniques: ['shu_blade_code', 'reflection_slash', 'sword_intent_refinement'],
            resources: { swordManuals: 6 },
            protection: 140,
            missions: ['blade_philosophy', 'duelist_tours']
        },
        rivals: ['huashan_sword_school'],
        allies: ['xian_network']
    },
    {
        id: 'heavenly_dao_sect',
        name: 'Heavenly Dao Sect',
        description: 'A lofty sect devoted to mastering the Heavenly Dao and transcendent governance of fate.',
        type: 'ancient',
        realm: 8,
        power: 18000,
        reputation: 0,
        requirements: { minRealm: 6, minCombatPower: 9000 },
        benefits: {
            techniques: ['heavenly_dao_calculation', 'fate_bend', 'immortal_broadcast'],
            resources: { daoInsights: 12, spiritStones: 200 },
            protection: 300,
            missions: ['daochanneling', 'celestial_council']
        },
        rivals: ['void_emperor_sect'],
        allies: ['eternal_dao_academy']
    },
    {
        id: 'lingxiao_palace',
        name: 'Lingxiao Palace',
        description: 'A secretive palace of etheric refinement, specializing in immortal techniques and soul-forging.',
        type: 'hidden',
        realm: 7,
        power: 15000,
        reputation: 0,
        requirements: { minRealm: 6, specialRequirements: ['soul_affinity'] },
        benefits: {
            techniques: ['lingxiao_soul_forge', 'palace_shroud', 'ethereal_binding'],
            resources: { ethereal_ore: 40, spiritStones: 150 },
            protection: 220,
            missions: ['soul_refinement', 'palace_escort']
        },
        rivals: ['demon_immortal_palace'],
        allies: ['void_emperor_sect']
    }
];
exports.MAJOR_FACTIONS = [
    {
        id: 'heavenly_merchant_guild',
        name: 'Heavenly Merchant Guild',
        description: 'The largest trading organization spanning multiple realms.',
        type: 'merchant',
        influence: 9000,
        standing: 0,
        territories: ['trade_cities', 'merchant_routes', 'auction_houses'],
        services: [
            {
                id: 'rare_item_access',
                name: 'Rare Item Access',
                description: 'Access to exclusive rare items and materials.',
                cost: { yuan: 10000 },
                requirements: { minStanding: 50 },
                effects: { unlockRareShop: true }
            },
            {
                id: 'trade_protection',
                name: 'Trade Route Protection',
                description: 'Safe passage through dangerous territories.',
                cost: { yuan: 5000 },
                requirements: { minStanding: 25 },
                effects: { tradeProtection: true }
            }
        ],
        conflicts: ['demon_immortal_palace', 'darkness_sect', 'shadow_thieves_guild']
    },
    {
        id: 'heavenly_court',
        name: 'Heavenly Court',
        description: 'Upholds order through measured judgment; balances risk and reward.',
        type: 'political',
        influence: 12000,
        standing: 0,
        territories: ['celestial_courts', 'judgment_halls', 'order_temples'],
        services: [
            {
                id: 'heavenly_judgment',
                name: 'Heavenly Judgment',
                description: 'Divine judgment and protection services.',
                cost: { karma: 80 },
                requirements: { minStanding: 60, minRealm: 8 },
                effects: { divineProtection: true, judgmentAuthority: 1 }
            },
            {
                id: 'celestial_chains',
                name: 'Celestial Chains',
                description: 'Access to celestial binding techniques.',
                cost: { spiritStones: 200 },
                requirements: { minStanding: 40, minRealm: 6 },
                effects: { bindingMastery: true }
            }
        ],
        conflicts: ['darkness_sect', 'demon_immortal_palace']
    },
    {
        id: 'demon_immortal_palace',
        name: 'Demon Immortal Palace',
        description: 'Pursuit of forbidden knowledge and immortality; power is the ultimate goal.',
        type: 'criminal',
        influence: 8500,
        standing: 0,
        territories: ['forbidden_libraries', 'dark_sanctuaries', 'immortal_tombs'],
        services: [
            {
                id: 'soul_absorption',
                name: 'Soul Absorption',
                description: 'Forbidden techniques to absorb spiritual energy.',
                cost: { karma: -100, bloodEssence: 50 },
                requirements: { minStanding: 30, minRealm: 7 },
                effects: { soulLeech: true, energyAbsorption: 2 }
            },
            {
                id: 'immortal_wrath',
                name: 'Immortal\'s Wrath',
                description: 'Powerful offensive techniques from forbidden arts.',
                cost: { forbiddenManuals: 3 },
                requirements: { minStanding: 50, minRealm: 9 },
                effects: { wrathStrike: true, attackBonus: 15 }
            }
        ],
        conflicts: ['buddha_sect', 'heavenly_court', 'mount_hua_sect']
    },
    {
        id: 'tao_school',
        name: 'Tao School',
        description: 'Align with the natural flow of the Dao; patience and subtlety over force.',
        type: 'scholarly',
        influence: 8000,
        standing: 0,
        territories: ['dao_temples', 'natural_sanctuaries', 'flowing_rivers'],
        services: [
            {
                id: 'daoist_palm',
                name: 'Daoist Palm Training',
                description: 'Learn the flowing palm techniques of the Tao.',
                cost: { spiritStones: 150 },
                requirements: { minStanding: 35, minRealm: 5 },
                effects: { palmMastery: true, defenseBonus: 10 }
            },
            {
                id: 'flowing_dao',
                name: 'Flowing Dao Strike',
                description: 'Master the flowing dao strike technique',
                cost: { spiritStones: 200 },
                requirements: { minStanding: 40, minRealm: 6 },
                effects: { daoStrikeMastery: true, attackBonus: 12 }
            }
        ],
        conflicts: ['demon_immortal_palace', 'darkness_sect']
    }
];
class SectFactionSystem {
    constructor(rivalSystem) {
        this.playerSect = null;
        this.sectReputations = {};
        this.factionStandings = {};
        this.rivalSystem = rivalSystem;
        // Initialize all reputations to 0
        exports.MAJOR_SECTS.forEach(sect => {
            this.sectReputations[sect.id] = 0;
        });
        exports.MAJOR_FACTIONS.forEach(faction => {
            this.factionStandings[faction.id] = 0;
        });
    }
    joinSect(sectId, playerState) {
        const sect = exports.MAJOR_SECTS.find(s => s.id === sectId);
        if (!sect) {
            console.warn(`Sect ${sectId} not found`);
            return false;
        }
        try {
            // Enhanced requirement checking with detailed feedback
            const requirementCheck = this.checkSectRequirements(sect, playerState);
            if (!requirementCheck.canJoin) {
                console.log(`Cannot join ${sect.name}: ${requirementCheck.reason}`);
                return false;
            }
            // Store previous sect for rival relationship adjustments
            const previousSect = this.playerSect;
            // Leave current sect if any (with enhanced rival relationship handling)
            if (this.playerSect) {
                this.leaveSect(playerState);
            }
            // Join new sect
            this.playerSect = sectId;
            this.sectReputations[sectId] = Math.max(this.sectReputations[sectId], 25); // Starting reputation
            // Apply sect benefits
            this.applySectBenefits(sect, playerState);
            // Enhanced rival relationship adjustments
            this.adjustRivalRelationshipsForSectJoin(sect, previousSect);
            // Adjust relationships with rival sects (enhanced)
            sect.rivals.forEach(rivalSectId => {
                const reputationLoss = this.calculateRivalSectReputationLoss(sect, rivalSectId);
                this.sectReputations[rivalSectId] = Math.max(-100, this.sectReputations[rivalSectId] - reputationLoss);
                // Adjust faction standings for rival sect's faction
                const rivalSect = exports.MAJOR_SECTS.find(s => s.id === rivalSectId);
                if (rivalSect) {
                    // Find associated faction and apply minor negative impact
                    this.applyFactionStandingForSectRivalry(rivalSect, -10);
                }
            });
            // Improve relationships with allied sects (enhanced)
            sect.allies.forEach(allySectId => {
                const reputationGain = this.calculateAlliedSectReputationGain(sect, allySectId);
                this.sectReputations[allySectId] = Math.min(100, this.sectReputations[allySectId] + reputationGain);
                // Adjust faction standings for allied sect's faction
                const alliedSect = exports.MAJOR_SECTS.find(s => s.id === allySectId);
                if (alliedSect) {
                    this.applyFactionStandingForSectAlliance(alliedSect, 5);
                }
            });
            // Apply cross-system integration effects
            this.applyCrossSystemEffectsForSectJoin(sect, playerState);
            console.log(`Successfully joined ${sect.name}`);
            return true;
        }
        catch (error) {
            console.error(`Error joining sect ${sectId}:`, error);
            return false;
        }
    }
    leaveSect(playerState) {
        if (!this.playerSect) {
            return;
        }
        try {
            const leavingSect = exports.MAJOR_SECTS.find(s => s.id === this.playerSect);
            const sectId = this.playerSect;
            // Enhanced penalty calculation based on current reputation and sect type
            const currentReputation = this.sectReputations[sectId] || 0;
            const penaltyMultiplier = this.calculateLeavingPenaltyMultiplier(leavingSect, currentReputation);
            const reputationPenalty = Math.floor(40 * penaltyMultiplier);
            this.sectReputations[sectId] = Math.max(-75, currentReputation - reputationPenalty);
            // Apply rival relationship adjustments for leaving sect
            if (leavingSect) {
                this.adjustRivalRelationshipsForSectLeave(leavingSect);
                // Apply cross-system effects for leaving
                this.applyCrossSystemEffectsForSectLeave(leavingSect, playerState);
            }
            // Clear player sect
            this.playerSect = null;
            console.log(`Left sect ${sectId} with reputation penalty: -${reputationPenalty}`);
        }
        catch (error) {
            console.error(`Error leaving sect ${this.playerSect}:`, error);
            this.playerSect = null; // Clear sect even on error to prevent stuck state
        }
    }
    // Enhanced requirement checking with detailed feedback
    checkSectRequirements(sect, playerState) {
        if (sect.requirements.minRealm && playerState.realm < sect.requirements.minRealm) {
            return { canJoin: false, reason: `Requires minimum realm ${sect.requirements.minRealm}` };
        }
        if (sect.requirements.minCombatPower && playerState.combatPower < sect.requirements.minCombatPower) {
            return { canJoin: false, reason: `Requires minimum combat power ${sect.requirements.minCombatPower}` };
        }
        if (sect.requirements.karma !== undefined && playerState.karma < sect.requirements.karma) {
            return { canJoin: false, reason: `Requires karma ${sect.requirements.karma} or higher` };
        }
        // Check if player has negative reputation that would prevent joining
        const currentReputation = this.sectReputations[sect.id] || 0;
        if (currentReputation < -50) {
            return { canJoin: false, reason: `Reputation too low with ${sect.name} (${currentReputation})` };
        }
        return { canJoin: true };
    }
    // Calculate leaving penalty based on sect type and current reputation
    calculateLeavingPenaltyMultiplier(sect, currentReputation) {
        if (!sect)
            return 1.0;
        let multiplier = 1.0;
        // Sect type affects leaving penalty
        switch (sect.type) {
            case 'righteous':
                multiplier = 1.2; // Righteous sects are more disappointed by betrayal
                break;
            case 'demonic':
                multiplier = 1.5; // Demonic sects punish leaving harshly
                break;
            case 'ancient':
                multiplier = 1.3; // Ancient sects value loyalty
                break;
            case 'hidden':
                multiplier = 1.4; // Hidden sects don't like secrets being exposed
                break;
            case 'neutral':
                multiplier = 0.8; // Neutral sects are more understanding
                break;
        }
        // Higher reputation means bigger penalty for leaving
        if (currentReputation > 50) {
            multiplier *= 1.3;
        }
        else if (currentReputation > 25) {
            multiplier *= 1.1;
        }
        return multiplier;
    }
    // Adjust rival relationships when joining a sect
    adjustRivalRelationshipsForSectJoin(sect, previousSect) {
        if (!this.rivalSystem)
            return;
        try {
            const allRivals = this.rivalSystem.getAllRivals();
            allRivals.forEach(rival => {
                let relationshipChange = 0;
                // Rivals from the same sect become more friendly
                if (rival.sect === sect.id) {
                    relationshipChange = 15;
                }
                // Rivals from rival sects become more hostile
                else if (sect.rivals.includes(rival.sect)) {
                    relationshipChange = -20;
                }
                // Rivals from allied sects become slightly more friendly
                else if (sect.allies.includes(rival.sect)) {
                    relationshipChange = 10;
                }
                // If leaving a sect that rival belonged to, they become disappointed
                else if (previousSect && rival.sect === previousSect) {
                    relationshipChange = -10;
                }
                // Apply personality-based modifiers
                relationshipChange = this.applyPersonalityModifierToRelationshipChange(rival, relationshipChange);
                if (relationshipChange !== 0) {
                    this.rivalSystem.updateRivalRelationship(rival.id, relationshipChange);
                    console.log(`Rival ${rival.name} relationship changed by ${relationshipChange} due to sect join`);
                }
            });
        }
        catch (error) {
            console.error('Error adjusting rival relationships for sect join:', error);
        }
    }
    // Adjust rival relationships when leaving a sect
    adjustRivalRelationshipsForSectLeave(sect) {
        if (!this.rivalSystem)
            return;
        try {
            const allRivals = this.rivalSystem.getAllRivals();
            allRivals.forEach(rival => {
                let relationshipChange = 0;
                // Rivals from the same sect become disappointed/angry
                if (rival.sect === sect.id) {
                    relationshipChange = -25;
                }
                // Rivals from rival sects might be pleased
                else if (sect.rivals.includes(rival.sect)) {
                    relationshipChange = 10;
                }
                // Apply personality-based modifiers
                relationshipChange = this.applyPersonalityModifierToRelationshipChange(rival, relationshipChange);
                if (relationshipChange !== 0) {
                    this.rivalSystem.updateRivalRelationship(rival.id, relationshipChange);
                    console.log(`Rival ${rival.name} relationship changed by ${relationshipChange} due to sect leave`);
                }
            });
        }
        catch (error) {
            console.error('Error adjusting rival relationships for sect leave:', error);
        }
    }
    // Apply personality modifiers to relationship changes
    applyPersonalityModifierToRelationshipChange(rival, baseChange) {
        if (baseChange === 0)
            return 0;
        let modifier = 1.0;
        switch (rival.personality) {
            case 'honorable':
                // Honorable rivals have stronger reactions to sect loyalty/betrayal
                modifier = 1.3;
                break;
            case 'treacherous':
                // Treacherous rivals care less about sect loyalty
                modifier = 0.7;
                break;
            case 'aggressive':
                // Aggressive rivals have stronger negative reactions
                if (baseChange < 0)
                    modifier = 1.2;
                break;
            case 'cunning':
                // Cunning rivals are more calculating, moderate reactions
                modifier = 0.9;
                break;
            case 'neutral':
                // Neutral rivals have standard reactions
                modifier = 1.0;
                break;
        }
        return Math.floor(baseChange * modifier);
    }
    applySectBenefits(sect, playerState) {
        if (sect.benefits.techniques) {
            sect.benefits.techniques.forEach(technique => {
                // Add technique to player's available techniques
                if (!playerState.techniques)
                    playerState.techniques = [];
                if (!playerState.techniques.includes(technique)) {
                    playerState.techniques.push(technique);
                }
            });
        }
        if (sect.benefits.resources) {
            Object.entries(sect.benefits.resources).forEach(([resource, amount]) => {
                if (playerState[resource] !== undefined) {
                    playerState[resource] += amount;
                }
            });
        }
    }
    adjustSectReputation(sectId, amount) {
        if (this.sectReputations[sectId] !== undefined) {
            this.sectReputations[sectId] = Math.max(-100, Math.min(100, this.sectReputations[sectId] + amount));
        }
    }
    adjustFactionStanding(factionId, amount) {
        if (this.factionStandings[factionId] !== undefined) {
            this.factionStandings[factionId] = Math.max(-100, Math.min(100, this.factionStandings[factionId] + amount));
        }
    }
    getPlayerSect() {
        return this.playerSect;
    }
    getAvailableSects(playerState) {
        return exports.MAJOR_SECTS.filter(sect => {
            const requirementCheck = this.checkSectRequirements(sect, playerState);
            return requirementCheck.canJoin;
        });
    }
    // Calculate reputation loss for rival sects
    calculateRivalSectReputationLoss(joiningSect, rivalSectId) {
        const baseReputationLoss = 30;
        // More severe penalties for certain sect type combinations
        const rivalSect = exports.MAJOR_SECTS.find(s => s.id === rivalSectId);
        if (!rivalSect)
            return baseReputationLoss;
        let multiplier = 1.0;
        // Righteous vs Demonic sects have stronger rivalry
        if ((joiningSect.type === 'righteous' && rivalSect.type === 'demonic') ||
            (joiningSect.type === 'demonic' && rivalSect.type === 'righteous')) {
            multiplier = 1.5;
        }
        // Ancient sects have deeper rivalries
        else if (joiningSect.type === 'ancient' || rivalSect.type === 'ancient') {
            multiplier = 1.3;
        }
        // Hidden sects are more secretive about rivalries
        else if (joiningSect.type === 'hidden' || rivalSect.type === 'hidden') {
            multiplier = 1.2;
        }
        return Math.floor(baseReputationLoss * multiplier);
    }
    // Calculate reputation gain for allied sects
    calculateAlliedSectReputationGain(joiningSect, alliedSectId) {
        const baseReputationGain = 15;
        const alliedSect = exports.MAJOR_SECTS.find(s => s.id === alliedSectId);
        if (!alliedSect)
            return baseReputationGain;
        let multiplier = 1.0;
        // Same type sects have stronger alliances
        if (joiningSect.type === alliedSect.type) {
            multiplier = 1.3;
        }
        // Righteous sects support each other more
        else if (joiningSect.type === 'righteous' && alliedSect.type === 'righteous') {
            multiplier = 1.4;
        }
        return Math.floor(baseReputationGain * multiplier);
    }
    // Apply faction standing changes for sect rivalries
    applyFactionStandingForSectRivalry(rivalSect, standingChange) {
        // This would need faction mapping data - for now, apply to related factions
        // In a full implementation, each sect would be associated with specific factions
        console.log(`Applied faction standing change ${standingChange} for sect rivalry with ${rivalSect.name}`);
    }
    // Apply faction standing changes for sect alliances
    applyFactionStandingForSectAlliance(alliedSect, standingChange) {
        // This would need faction mapping data - for now, apply to related factions
        console.log(`Applied faction standing change ${standingChange} for sect alliance with ${alliedSect.name}`);
    }
    // Apply cross-system effects when joining a sect
    applyCrossSystemEffectsForSectJoin(sect, playerState) {
        try {
            // Apply karma adjustments based on sect type
            if (playerState && typeof playerState.karma === 'number') {
                let karmaChange = 0;
                switch (sect.type) {
                    case 'righteous':
                        karmaChange = 5;
                        break;
                    case 'demonic':
                        karmaChange = -10;
                        break;
                    case 'neutral':
                        karmaChange = 0;
                        break;
                    case 'ancient':
                        karmaChange = 2;
                        break;
                    case 'hidden':
                        karmaChange = -2;
                        break;
                }
                if (karmaChange !== 0) {
                    playerState.karma = Math.max(-100, Math.min(100, playerState.karma + karmaChange));
                    console.log(`Karma changed by ${karmaChange} for joining ${sect.name}`);
                }
            }
            // Apply other cross-system effects as needed
            console.log(`Applied cross-system effects for joining ${sect.name}`);
        }
        catch (error) {
            console.error('Error applying cross-system effects for sect join:', error);
        }
    }
    // Apply cross-system effects when leaving a sect
    applyCrossSystemEffectsForSectLeave(sect, playerState) {
        try {
            // Apply karma penalty for leaving (betrayal)
            if (playerState && typeof playerState.karma === 'number') {
                const karmaPenalty = sect.type === 'righteous' ? -15 : sect.type === 'demonic' ? -5 : -8;
                playerState.karma = Math.max(-100, Math.min(100, playerState.karma + karmaPenalty));
                console.log(`Karma changed by ${karmaPenalty} for leaving ${sect.name}`);
            }
            console.log(`Applied cross-system effects for leaving ${sect.name}`);
        }
        catch (error) {
            console.error('Error applying cross-system effects for sect leave:', error);
        }
    }
    // Cross-system validation methods
    validateSystemIntegrity() {
        const errors = [];
        try {
            // Validate rival system integration
            if (!this.rivalSystem) {
                errors.push('RivalSystem not properly initialized');
            }
            // Validate sect data integrity
            exports.MAJOR_SECTS.forEach(sect => {
                if (!sect.id || !sect.name) {
                    errors.push(`Invalid sect data: ${sect.id || 'unknown'}`);
                }
                // Validate sect relationships
                sect.rivals.forEach(rivalId => {
                    if (!exports.MAJOR_SECTS.find(s => s.id === rivalId)) {
                        errors.push(`Sect ${sect.id} has invalid rival reference: ${rivalId}`);
                    }
                });
                sect.allies.forEach(allyId => {
                    if (!exports.MAJOR_SECTS.find(s => s.id === allyId)) {
                        errors.push(`Sect ${sect.id} has invalid ally reference: ${allyId}`);
                    }
                });
            });
            // Validate faction data integrity
            exports.MAJOR_FACTIONS.forEach(faction => {
                if (!faction.id || !faction.name) {
                    errors.push(`Invalid faction data: ${faction.id || 'unknown'}`);
                }
            });
            // Validate reputation data
            Object.keys(this.sectReputations).forEach(sectId => {
                const reputation = this.sectReputations[sectId];
                if (typeof reputation !== 'number' || isNaN(reputation)) {
                    errors.push(`Invalid reputation value for sect ${sectId}: ${reputation}`);
                }
            });
            Object.keys(this.factionStandings).forEach(factionId => {
                const standing = this.factionStandings[factionId];
                if (typeof standing !== 'number' || isNaN(standing)) {
                    errors.push(`Invalid standing value for faction ${factionId}: ${standing}`);
                }
            });
        }
        catch (error) {
            errors.push(`System validation error: ${error}`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    getAvailableFactionServices(factionId, playerState) {
        const faction = exports.MAJOR_FACTIONS.find(f => f.id === factionId);
        if (!faction)
            return [];
        const standing = this.factionStandings[factionId] || 0;
        return faction.services.filter(service => {
            if (service.requirements.minStanding && standing < service.requirements.minStanding)
                return false;
            if (service.requirements.minRealm && playerState.realm < service.requirements.minRealm)
                return false;
            return true;
        });
    }
    getCurrentSect() {
        return this.playerSect;
    }
    getSectReputation(sectId) {
        return this.sectReputations[sectId] || 0;
    }
    getFactionStanding(factionId) {
        return this.factionStandings[factionId] || 0;
    }
    getAllReputations() {
        return { ...this.sectReputations };
    }
    getAllStandings() {
        return { ...this.factionStandings };
    }
    // Rival System Integration Methods
    adjustRivalRelationship(rivalId, change) {
        // Adjust the relationship with the rival based on the change value
        this.rivalSystem.updateRivalRelationship(rivalId, change);
    }
    markRivalDefeated(rivalId) {
        // Mark the rival as defeated in the RivalSystem
        this.rivalSystem.markRivalDefeated(rivalId);
    }
    getFactionEnemies(factionId) {
        const faction = exports.MAJOR_FACTIONS.find(f => f.id === factionId);
        return faction?.conflicts || [];
    }
    getSectRivals(sectId) {
        const sect = exports.MAJOR_SECTS.find(s => s.id === sectId);
        return sect?.rivals || [];
    }
    getSectAllies(sectId) {
        const sect = exports.MAJOR_SECTS.find(s => s.id === sectId);
        return sect?.allies || [];
    }
    canChallengeRival(playerState) {
        // Check if player meets requirements to challenge a rival
        const playerSect = this.playerSect;
        // Basic checks
        if (!playerSect)
            return false;
        if (playerState.combatPower < 500)
            return false; // Minimum combat power
        return true;
    }
    generateRivalFromSect(sectId, playerLevel) {
        const sect = exports.MAJOR_SECTS.find(s => s.id === sectId);
        if (!sect)
            return null;
        // Generate a rival based on sect characteristics
        const rng = (this.rivalSystem && typeof this.rivalSystem.getRng === 'function') ? this.rivalSystem.getRng() : (() => {
            // runtime-only require: seededRng is intentionally required at runtime for non-browser environments
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require('../utils/seededRng').runtimeRng;
        })();
        const level = Math.max(5, Math.min(50, playerLevel + Math.floor(rng() * 10) - 5));
        return {
            name: `Sect Disciple of ${sect.name}`,
            sect: sectId,
            level,
            techniques: sect.benefits.techniques?.slice(0, 2) || ['basic_attack'],
            stats: {
                hp: 100 + (level * 8),
                qi: 80 + (level * 6),
                atk: 12 + (level * 1.2),
                def: 10 + (level * 1),
                speed: 8 + (level * 0.8)
            }
        };
    }
}
exports.SectFactionSystem = SectFactionSystem;
