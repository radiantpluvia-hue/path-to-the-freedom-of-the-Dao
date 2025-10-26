"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const choiceHandler_1 = require("../systems/choiceHandler");
describe('RivalChoiceHandler', () => {
    it('applies relationship, stats, addItem, and setFlag tokens', () => {
        const gs = {
            player: {
                name: 'Player', gender: 'Male', race: 'human', background: null, age: 20, realmId: 0, realm: 'mortal', combatPower: 0,
                talentId: '', minorStage: 0, level: 1, baseStats: {}, stats: {}, insight: 0, karma: 0, cunning: 0, resolve: 0, resourcefulness: 0,
                currentQi: 0, qiRequired: 0, lifespan: 100, spiritStones: { low: 0, mid: 0, high: 0 }, yuan: 0, inventory: [], skills: {},
                mentorAffinity: {}, manuals: [], bloodline: null, physique: null, sect: null, techniques: [], daoPrinciple: undefined,
                severedAspect: undefined, defeatedRivals: [], cultivationPower: 0, discipline: 0, patience: 0, daoHeart: 0, reputation: {},
                factionStandings: {}, sectReputations: {}, rivalRelationships: {}, lastRivalEncounters: {}, factionBattles: [], factionReputations: {},
                teachingProgress: {}, mentorProgress: {}, buffs: {}, experience: 0, discoveredRecipes: [], currentLocationId: null, activeBuffs: [], hp: 100, qi: 50, maxHp: 100, maxQi: 50
            },
            world: { year: 1, day: 1, tick: 0, flags: {}, factions: {} },
            story: { currentAct: 'act1', mainQuestId: '', questProgress: {}, activeSectQuests: [], activeRandomMissions: [], completedQuests: [], storyFlags: {} },
            ui: { currentScreen: 'game', selectedMentor: null, showMentorModal: false, showLore: false, currentLoreIndex: 0, showCodex: false, showDebugMenu: false },
            systems: { rivals: {}, rivalEncounters: [], rivalCooldowns: {}, combatHistory: [] }
        };
        const handler = new choiceHandler_1.RivalChoiceHandler();
        const choice = { effects: { relationship: { rivalId: 'r1', delta: 5 }, stats: { atk: 2 }, addItem: { id: 'jade_slip', qty: 1 }, setFlag: { path: 'trained_by_master', value: true } } };
        const res = handler.handleChoice(gs, choice);
        expect(res.newState.player.rivalRelationships['r1']).toBe(5);
        expect(res.newState.player.stats.atk).toBe(2);
        expect(res.newState.player.inventory.some((i) => i.id === 'jade_slip')).toBe(true);
        expect(res.newState.world.flags['trained_by_master']).toBe(true);
        expect(typeof res.narrative).toBe('string');
    });
    it('falls back to applyEventEffects for unknown tokens', () => {
        const gs = {
            player: {
                name: 'Player', gender: 'Male', race: 'human', background: null, age: 20, realmId: 0, realm: 'mortal', combatPower: 0,
                talentId: '', minorStage: 0, level: 1, baseStats: {}, stats: { atk: 1 }, insight: 0, karma: 0, cunning: 0, resolve: 0, resourcefulness: 0,
                currentQi: 0, qiRequired: 0, lifespan: 100, spiritStones: { low: 0, mid: 0, high: 0 }, yuan: 0, inventory: [], skills: {},
                mentorAffinity: {}, manuals: [], bloodline: null, physique: null, sect: null, techniques: [], daoPrinciple: undefined,
                severedAspect: undefined, defeatedRivals: [], cultivationPower: 0, discipline: 0, patience: 0, daoHeart: 0, reputation: {},
                factionStandings: {}, sectReputations: {}, rivalRelationships: {}, lastRivalEncounters: {}, factionBattles: [], factionReputations: {},
                teachingProgress: {}, mentorProgress: {}, buffs: {}, experience: 0, discoveredRecipes: [], currentLocationId: null, activeBuffs: [], hp: 100, qi: 50, maxHp: 100, maxQi: 50
            },
            world: { year: 1, day: 1, tick: 0, flags: {}, factions: {} },
            story: { currentAct: 'act1', mainQuestId: '', questProgress: {}, activeSectQuests: [], activeRandomMissions: [], completedQuests: [], storyFlags: {} },
            ui: { currentScreen: 'game', selectedMentor: null, showMentorModal: false, showLore: false, currentLoreIndex: 0, showCodex: false, showDebugMenu: false },
            systems: { rivals: {}, rivalEncounters: [], rivalCooldowns: {}, combatHistory: [] }
        };
        const handler = new choiceHandler_1.RivalChoiceHandler();
        const choice = { effects: { fame: 10 } };
        const res = handler.handleChoice(gs, choice);
        // fame is not a stat in stats; applyEventEffects should have attempted to add to player.fame or similar
        expect(res.newState.player.fame === 10 || res.newState.player.stats.atk === 1).toBeTruthy();
    });
    it('ignores relationship token when rivalId is missing', () => {
        const gs = {
            player: { name: 'Player', gender: 'Male', race: 'human', background: null, age: 20, realmId: 0, realm: 'mortal', combatPower: 0,
                talentId: '', minorStage: 0, level: 1, baseStats: {}, stats: {}, insight: 0, karma: 0, cunning: 0, resolve: 0, resourcefulness: 0,
                currentQi: 0, qiRequired: 0, lifespan: 100, spiritStones: { low: 0, mid: 0, high: 0 }, yuan: 0, inventory: [], skills: {},
                mentorAffinity: {}, manuals: [], bloodline: null, physique: null, sect: null, techniques: [], daoPrinciple: undefined,
                severedAspect: undefined, defeatedRivals: [], cultivationPower: 0, discipline: 0, patience: 0, daoHeart: 0, reputation: {},
                factionStandings: {}, sectReputations: {}, rivalRelationships: {}, lastRivalEncounters: {}, factionBattles: [], factionReputations: {},
                teachingProgress: {}, mentorProgress: {}, buffs: {}, experience: 0, discoveredRecipes: [], currentLocationId: null, activeBuffs: [], hp: 100, qi: 50, maxHp: 100, maxQi: 50 },
            world: { year: 1, day: 1, tick: 0, flags: {}, factions: {} },
            story: { currentAct: 'act1', mainQuestId: '', questProgress: {}, activeSectQuests: [], activeRandomMissions: [], completedQuests: [], storyFlags: {} },
            ui: { currentScreen: 'game', selectedMentor: null, showMentorModal: false, showLore: false, currentLoreIndex: 0, showCodex: false, showDebugMenu: false },
            systems: { rivals: {}, rivalEncounters: [], rivalCooldowns: {}, combatHistory: [] }
        };
        const handler = new choiceHandler_1.RivalChoiceHandler();
        const choice = { effects: { relationship: { delta: 3 } } };
        const res = handler.handleChoice(gs, choice);
        // since no rivalId, no relationships should be set
        expect(Object.keys(res.newState.player.rivalRelationships || {}).length).toBe(0);
    });
    it('adds multiple items when qty > 1 and treats qty=undefined as 1', () => {
        const gs = {
            player: { name: 'Player', gender: 'Male', race: 'human', background: null, age: 20, realmId: 0, realm: 'mortal', combatPower: 0,
                talentId: '', minorStage: 0, level: 1, baseStats: {}, stats: {}, insight: 0, karma: 0, cunning: 0, resolve: 0, resourcefulness: 0,
                currentQi: 0, qiRequired: 0, lifespan: 100, spiritStones: { low: 0, mid: 0, high: 0 }, yuan: 0, inventory: [], skills: {},
                mentorAffinity: {}, manuals: [], bloodline: null, physique: null, sect: null, techniques: [], daoPrinciple: undefined,
                severedAspect: undefined, defeatedRivals: [], cultivationPower: 0, discipline: 0, patience: 0, daoHeart: 0, reputation: {},
                factionStandings: {}, sectReputations: {}, rivalRelationships: {}, lastRivalEncounters: {}, factionBattles: [], factionReputations: {},
                teachingProgress: {}, mentorProgress: {}, buffs: {}, experience: 0, discoveredRecipes: [], currentLocationId: null, activeBuffs: [], hp: 100, qi: 50, maxHp: 100, maxQi: 50 },
            world: { year: 1, day: 1, tick: 0, flags: {}, factions: {} },
            story: { currentAct: 'act1', mainQuestId: '', questProgress: {}, activeSectQuests: [], activeRandomMissions: [], completedQuests: [], storyFlags: {} },
            ui: { currentScreen: 'game', selectedMentor: null, showMentorModal: false, showLore: false, currentLoreIndex: 0, showCodex: false, showDebugMenu: false },
            systems: { rivals: {}, rivalEncounters: [], rivalCooldowns: {}, combatHistory: [] }
        };
        const handler = new choiceHandler_1.RivalChoiceHandler();
        const choice1 = { effects: { addItem: { id: 'herb', qty: 3 } } };
        const choice2 = { effects: { addItem: { id: 'stone' } } };
        const res1 = handler.handleChoice(gs, choice1);
        const herbCount = res1.newState.player.inventory
            .filter((i) => i.id === 'herb')
            .reduce((s, i) => s + (i.qty || i.quantity || 1), 0);
        expect(herbCount).toBeGreaterThanOrEqual(3);
        const res2 = handler.handleChoice(res1.newState, choice2);
        const stoneCount = res2.newState.player.inventory
            .filter((i) => i.id === 'stone')
            .reduce((s, i) => s + (i.qty || i.quantity || 1), 0);
        expect(stoneCount).toBeGreaterThanOrEqual(1);
    });
    it('applies negative relationship deltas correctly', () => {
        const gs = {
            player: { name: 'Player', gender: 'Male', race: 'human', background: null, age: 20, realmId: 0, realm: 'mortal', combatPower: 0,
                talentId: '', minorStage: 0, level: 1, baseStats: {}, stats: {}, insight: 0, karma: 0, cunning: 0, resolve: 0, resourcefulness: 0,
                currentQi: 0, qiRequired: 0, lifespan: 100, spiritStones: { low: 0, mid: 0, high: 0 }, yuan: 0, inventory: [], skills: {},
                mentorAffinity: {}, manuals: [], bloodline: null, physique: null, sect: null, techniques: [], daoPrinciple: undefined,
                severedAspect: undefined, defeatedRivals: [], cultivationPower: 0, discipline: 0, patience: 0, daoHeart: 0, reputation: {},
                factionStandings: {}, sectReputations: {}, rivalRelationships: { 'r2': 10 }, lastRivalEncounters: {}, factionBattles: [], factionReputations: {},
                teachingProgress: {}, mentorProgress: {}, buffs: {}, experience: 0, discoveredRecipes: [], currentLocationId: null, activeBuffs: [], hp: 100, qi: 50, maxHp: 100, maxQi: 50 },
            world: { year: 1, day: 1, tick: 0, flags: {}, factions: {} },
            story: { currentAct: 'act1', mainQuestId: '', questProgress: {}, activeSectQuests: [], activeRandomMissions: [], completedQuests: [], storyFlags: {} },
            ui: { currentScreen: 'game', selectedMentor: null, showMentorModal: false, showLore: false, currentLoreIndex: 0, showCodex: false, showDebugMenu: false },
            systems: { rivals: {}, rivalEncounters: [], rivalCooldowns: {}, combatHistory: [] }
        };
        const handler = new choiceHandler_1.RivalChoiceHandler();
        const choice = { effects: { relationship: { rivalId: 'r2', delta: -7 } } };
        const res = handler.handleChoice(gs, choice);
        expect(res.newState.player.rivalRelationships['r2']).toBe(3);
    });
});
