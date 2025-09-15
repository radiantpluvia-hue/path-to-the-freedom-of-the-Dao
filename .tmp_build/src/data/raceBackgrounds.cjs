"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RACE_BACKGROUNDS = void 0;
exports.RACE_BACKGROUNDS = {
    Human: [
        {
            id: 'human_noble',
            name: 'Noble Family',
            description: 'Born into a prestigious cultivation family with ancient heritage.',
            rarity: 'legendary',
            effects: {
                yuan: 2000,
                spiritStones: { low: 100, mid: 10 },
                socialSkills: { level: 3 },
                reputation: { world: 50 }
            }
        },
        {
            id: 'human_commoner',
            name: 'Common Folk',
            description: 'Humble origins with strong determination and work ethic.',
            rarity: 'common',
            effects: {
                discipline: 20,
                patience: 25,
                bodyTempering: { level: 2 },
                mentalFortitude: { level: 2 }
            }
        },
        {
            id: 'human_orphan',
            name: 'Street Orphan',
            description: 'Survived on cunning and wit in the harsh streets.',
            rarity: 'uncommon',
            effects: {
                cunning: 30,
                mentalFortitude: { level: 3 },
                combatSkills: { level: 2 },
                karma: -10
            }
        },
        {
            id: 'human_scholar',
            name: 'Scholar Family',
            description: 'Raised among ancient texts and cultivation knowledge.',
            rarity: 'rare',
            effects: {
                insight: 30,
                daoInsight: { level: 3 },
                qiControl: { level: 2 },
                yuan: 500
            }
        }
    ],
    Demon: [
        {
            id: 'demon_royal',
            name: 'Demon Royal Bloodline',
            description: 'Descended from ancient demon royalty with pure bloodline.',
            rarity: 'legendary',
            effects: {
                combatPower: 200,
                atk: 20,
                combatSkills: { level: 4 },
                karma: -50,
                reputation: { demon_realm: 100 }
            }
        },
        {
            id: 'demon_warrior',
            name: 'Demon Warrior Clan',
            description: 'Born into a clan of fierce demon warriors.',
            rarity: 'common',
            effects: {
                hp: 50,
                atk: 15,
                bodyTempering: { level: 3 },
                combatSkills: { level: 3 },
                discipline: 15
            }
        },
        {
            id: 'demon_outcast',
            name: 'Demon Outcast',
            description: 'Exiled from demon society, forced to survive alone.',
            rarity: 'uncommon',
            effects: {
                cunning: 40,
                mentalFortitude: { level: 4 },
                karma: -20,
                reputation: { demon_realm: -50 }
            }
        },
        {
            id: 'demon_scholar',
            name: 'Demon Sage Lineage',
            description: 'Inheritor of ancient demon cultivation knowledge.',
            rarity: 'rare',
            effects: {
                insight: 25,
                daoInsight: { level: 2 },
                qiControl: { level: 3 },
                spiritStones: { mid: 5 }
            }
        }
    ],
    Spirit: [
        {
            id: 'spirit_ancient',
            name: 'Ancient Spirit',
            description: 'An old spirit with deep connection to natural forces.',
            rarity: 'legendary',
            effects: {
                qi: 100,
                daoHeart: 30,
                daoInsight: { level: 4 },
                age: 500,
                lifespan: 2000
            }
        },
        {
            id: 'spirit_elemental',
            name: 'Elemental Spirit',
            description: 'Born from pure elemental energy with natural affinities.',
            rarity: 'rare',
            effects: {
                qi: 80,
                qiControl: { level: 3 },
                speed: 15,
                special: ['elemental_mastery']
            }
        },
        {
            id: 'spirit_nature',
            name: 'Nature Spirit',
            description: 'Guardian of forests and natural harmony.',
            rarity: 'uncommon',
            effects: {
                daoHeart: 40,
                patience: 30,
                karma: 50,
                special: ['nature_communion']
            }
        },
        {
            id: 'spirit_wandering',
            name: 'Wandering Spirit',
            description: 'A free spirit that has traveled many realms.',
            rarity: 'common',
            effects: {
                insight: 35,
                socialSkills: { level: 3 },
                cunning: 20,
                reputation: { world: 25 }
            }
        }
    ],
    Dragon: [
        {
            id: 'dragon_imperial',
            name: 'Imperial Dragon Bloodline',
            description: 'Direct descendant of the Dragon Emperor with pure bloodline.',
            rarity: 'legendary',
            effects: {
                combatPower: 500,
                hp: 100,
                atk: 30,
                qi: 150,
                combatSkills: { level: 5 },
                reputation: { dragon_realm: 200 }
            }
        },
        {
            id: 'dragon_ancient',
            name: 'Ancient Dragon Clan',
            description: 'Member of an ancient dragon clan with deep wisdom.',
            rarity: 'legendary',
            effects: {
                age: 1000,
                lifespan: 10000,
                daoInsight: { level: 5 },
                qiControl: { level: 4 },
                spiritStones: { high: 5 }
            }
        },
        {
            id: 'dragon_young',
            name: 'Young Dragon',
            description: 'A recently awakened dragon with untapped potential.',
            rarity: 'rare',
            effects: {
                hp: 80,
                qi: 120,
                bodyTempering: { level: 3 },
                potential: 150
            }
        },
        {
            id: 'dragon_exile',
            name: 'Exiled Dragon',
            description: 'Cast out from dragon society, seeking redemption.',
            rarity: 'uncommon',
            effects: {
                combatPower: 300,
                mentalFortitude: { level: 4 },
                karma: -30,
                reputation: { dragon_realm: -100 }
            }
        }
    ],
    Phoenix: [
        {
            id: 'phoenix_reborn',
            name: 'Reborn Phoenix',
            description: 'Recently reborn from ashes with renewed purpose.',
            rarity: 'legendary',
            effects: {
                hp: 120,
                daoHeart: 50,
                mentalFortitude: { level: 5 },
                special: ['rebirth_memory']
            }
        },
        {
            id: 'phoenix_flame',
            name: 'Flame Phoenix Lineage',
            description: 'Master of divine flames and purification.',
            rarity: 'rare',
            effects: {
                qi: 130,
                qiControl: { level: 4 },
                karma: 30,
                special: ['divine_flames']
            }
        },
        {
            id: 'phoenix_ice',
            name: 'Ice Phoenix Heritage',
            description: 'Rare ice phoenix with mastery over frozen elements.',
            rarity: 'rare',
            effects: {
                qi: 110,
                def: 20,
                daoInsight: { level: 3 },
                special: ['ice_mastery']
            }
        },
        {
            id: 'phoenix_wind',
            name: 'Wind Phoenix Clan',
            description: 'Swift phoenix with dominion over wind and sky.',
            rarity: 'uncommon',
            effects: {
                speed: 25,
                qi: 100,
                qiControl: { level: 3 },
                special: ['wind_mastery']
            }
        }
    ],
    Celestial: [
        {
            id: 'celestial_court',
            name: 'Heavenly Court Noble',
            description: 'High-ranking member of the celestial bureaucracy.',
            rarity: 'rare',
            effects: {
                karma: 100,
                socialSkills: { level: 5 },
                reputation: { heavenly_court: 150 },
                spiritStones: { high: 10 }
            }
        },
        {
            id: 'celestial_guardian',
            name: 'Celestial Guardian',
            description: 'Protector of heavenly realms and divine order.',
            rarity: 'rare',
            effects: {
                combatPower: 400,
                daoHeart: 60,
                combatSkills: { level: 4 },
                mentalFortitude: { level: 4 }
            }
        },
        {
            id: 'celestial_scholar',
            name: 'Heavenly Scholar',
            description: 'Keeper of celestial knowledge and divine wisdom.',
            rarity: 'legendary',
            effects: {
                insight: 50,
                daoInsight: { level: 6 },
                qiControl: { level: 5 },
                special: ['divine_knowledge']
            }
        },
        {
            id: 'celestial_fallen',
            name: 'Fallen Celestial',
            description: 'Cast down from heaven, seeking redemption.',
            rarity: 'uncommon',
            effects: {
                combatPower: 350,
                karma: -80,
                mentalFortitude: { level: 5 },
                reputation: { heavenly_court: -200 }
            }
        }
    ],
    Asura: [
        {
            id: 'asura_warlord',
            name: 'Asura Warlord',
            description: 'Born to lead armies in eternal warfare.',
            rarity: 'legendary',
            effects: {
                combatPower: 600,
                atk: 40,
                combatSkills: { level: 6 },
                karma: -60,
                reputation: { asura_realm: 100 }
            }
        },
        {
            id: 'asura_berserker',
            name: 'Asura Berserker',
            description: 'Consumed by battle rage and bloodlust.',
            rarity: 'rare',
            effects: {
                hp: 150,
                atk: 35,
                bodyTempering: { level: 5 },
                special: ['battle_rage']
            }
        },
        {
            id: 'asura_tactician',
            name: 'Asura Tactician',
            description: 'Strategic mind behind countless victories.',
            rarity: 'uncommon',
            effects: {
                cunning: 50,
                combatSkills: { level: 4 },
                socialSkills: { level: 3 },
                insight: 25
            }
        },
        {
            id: 'asura_exile',
            name: 'Exiled Asura',
            description: 'Banished for refusing to participate in endless war.',
            rarity: 'rare',
            effects: {
                mentalFortitude: { level: 6 },
                daoHeart: 40,
                karma: 20,
                reputation: { asura_realm: -150 }
            }
        }
    ],
    Void: [
        {
            id: 'void_born',
            name: 'Void Born',
            description: 'Born from the primordial void itself.',
            rarity: 'legendary',
            effects: {
                qi: 200,
                daoInsight: { level: 7 },
                special: ['void_mastery', 'spatial_immunity']
            }
        },
        {
            id: 'void_walker',
            name: 'Void Walker',
            description: 'Traveler between dimensions and realities.',
            rarity: 'rare',
            effects: {
                speed: 30,
                qiControl: { level: 5 },
                insight: 40,
                special: ['dimensional_travel']
            }
        },
        {
            id: 'void_seeker',
            name: 'Void Seeker',
            description: 'Pursuer of ultimate emptiness and truth.',
            rarity: 'rare',
            effects: {
                daoHeart: 70,
                daoInsight: { level: 6 },
                mentalFortitude: { level: 5 },
                patience: 50
            }
        },
        {
            id: 'void_fragment',
            name: 'Void Fragment',
            description: 'A fragment of the void given consciousness.',
            rarity: 'uncommon',
            effects: {
                qi: 150,
                def: 25,
                special: ['void_immunity', 'reality_resistance']
            }
        }
    ],
    Fox: [
        { id: 'fox_nine_tailed', name: 'Nine-Tailed Fox', description: 'Ancient fox spirit with nine tails and immense power.', rarity: 'legendary', effects: { cunning: 80, socialSkills: { level: 4 }, special: ['nine_tails'] } },
        { id: 'fox_mountain', name: 'Mountain Fox', description: 'Fox spirit dwelling in sacred mountains with nature affinity.', rarity: 'rare', effects: { daoHeart: 30, patience: 30, special: ['nature_communion'] } },
        { id: 'fox_city', name: 'City Fox', description: 'Urban fox spirit adapted to human society.', rarity: 'common', effects: { socialSkills: { level: 3 }, cunning: 25 } }
    ],
    Qilin: [
        { id: 'qilin_royal', name: 'Royal Qilin', description: 'Noble qilin with divine heritage and auspicious nature.', rarity: 'legendary', effects: { reputation: { world: 80 }, daoInsight: { level: 4 }, special: ['auspice'] } },
        { id: 'qilin_guardian', name: 'Guardian Qilin', description: 'Protector of sacred places and righteous causes.', rarity: 'rare', effects: { def: 30, daoHeart: 25, special: ['guardian_presence'] } }
    ],
    Turtle: [
        { id: 'turtle_ancient', name: 'Ancient Turtle', description: 'Elder turtle with wisdom spanning millennia.', rarity: 'legendary', effects: { lifespan: 2000, insight: 50, special: ['stone_shell'] } },
        { id: 'turtle_guardian', name: 'Guardian Turtle', description: 'Protector of sacred waters and ancient secrets.', rarity: 'rare', effects: { hp: 120, def: 40, patience: 40 } }
    ],
    Snake: [
        { id: 'snake_divine', name: 'Divine Snake', description: 'Heavenly snake with divine powers and wisdom.', rarity: 'legendary', effects: { qi: 120, daoInsight: { level: 4 }, special: ['venomous_grace'] } },
        { id: 'snake_venom', name: 'Venomous Snake', description: 'Snake with deadly venom and poison mastery.', rarity: 'rare', effects: { atk: 20, cunning: 35, special: ['poison_mastery'] } }
    ],
    Monkey: [
        { id: 'monkey_king', name: 'Monkey King', description: 'Legendary monkey with immense power and trickery.', rarity: 'legendary', effects: { agility: 50, cunning: 60, special: ['trickster_arts'] } },
        { id: 'monkey_mountain', name: 'Mountain Monkey', description: 'Monkey dwelling in sacred mountains with agility.', rarity: 'rare', effects: { speed: 30, combatSkills: { level: 3 } } }
    ],
    Divine: [
        { id: 'divine_emissary', name: 'Divine Emissary', description: 'Chosen messenger of the gods with celestial blessings.', rarity: 'rare', effects: { socialSkills: { level: 4 }, reputation: { divine: 80 } }, },
        { id: 'divine_guardian', name: 'Divine Guardian', description: 'Protector of sacred realms and divine order.', rarity: 'rare', effects: { combatPower: 300, daoHeart: 40 } }
    ],
    Heavenly: [
        { id: 'heavenly_noble', name: 'Heavenly Noble', description: 'High-born celestial with authority in heavenly courts.', rarity: 'rare', effects: { socialSkills: { level: 4 }, reputation: { heavenly_court: 100 } } },
        { id: 'heavenly_warrior', name: 'Heavenly Warrior', description: 'Celestial soldier enforcing divine justice.', rarity: 'rare', effects: { combatPower: 350, daoHeart: 45 } }
    ],
    Devil: [
        { id: 'devil_prince', name: 'Devil Prince', description: 'Royal heir to infernal realms with dark power.', rarity: 'rare', effects: { karma: -100, combatPower: 300 } },
        { id: 'devil_temptor', name: 'Devil Temptor', description: 'Master of deception and corrupting influences.', rarity: 'uncommon', effects: { cunning: 40, socialSkills: { level: 3 } } }
    ],
    Ghost: [
        { id: 'ghost_ancestral', name: 'Ancestral Ghost', description: 'Spirit of ancient ancestors with wisdom beyond death.', rarity: 'rare', effects: { insight: 40, daoHeart: 30 } },
        { id: 'ghost_vengeful', name: 'Vengeful Ghost', description: 'Spirit consumed by rage and unfinished business.', rarity: 'uncommon', effects: { karma: -40, combatPower: 200 } }
    ],
    Monster: [
        { id: 'monster_ancient', name: 'Ancient Monster', description: 'Primordial creature from before time with immense power.', rarity: 'legendary', effects: { hp: 400, combatPower: 800 } },
        { id: 'monster_abomination', name: 'Abomination', description: 'Twisted creature born of forbidden experiments.', rarity: 'rare', effects: { atk: 50, special: ['mutation'] } }
    ]
};
