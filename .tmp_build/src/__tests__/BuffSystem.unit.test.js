"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint @typescript-eslint/no-non-null-assertion: "off" */
const BuffSystem_1 = require("@/systems/BuffSystem");
describe('BuffSystem unit tests', () => {
    let bs;
    let player;
    beforeEach(() => {
        bs = new BuffSystem_1.BuffSystem();
        player = {
            id: 'player1',
            name: 'Tester',
            stats: { atk: 10, def: 10, speed: 10 },
            baseStats: { atk: 10, def: 10, speed: 10 },
            maxHp: 100,
            hp: 100,
            qi: 0,
            activeBuffs: [],
        };
    });
    test('applyBuff applies stat delta and records appliedEffects', () => {
        const item = { itemId: 'b1', name: 'Strong Tonic' };
        const buff = bs.createBuff(item, 'Strong', { stats: { atk: 5 } }, 3, 'ticks');
        const res = bs.applyBuff(player, buff);
        expect(res.stats.atk).toBe(15);
        expect(res.activeBuffs.length).toBe(1);
        expect(res.activeBuffs[0].appliedEffects).toBeDefined();
        expect(res.activeBuffs[0].appliedEffects.stats.atk).toBe(5);
    });
    test('remove via revertBuffs restores stats', () => {
        const item = { itemId: 'b2', name: 'Weakening Potion' };
        const buff = bs.createBuff(item, 'Weaken', { stats: { atk: -3 } }, 2, 'ticks');
        let p = bs.applyBuff(player, buff);
        expect(p.stats.atk).toBe(7);
        // revert
        p = bs.revertBuffs(p, [p.activeBuffs[0]]);
        expect(p.stats.atk).toBe(10);
    });
    test('stacking increments stacks and reapplies correct bonus', () => {
        const item = { itemId: 'b3', name: 'Stackable Elixir', stackable: true, maxStacks: 3 };
        const buff = bs.createBuff(item, 'StackElixir', { stats: { atk: 2 } }, 5, 'ticks');
        let p = bs.applyBuff(player, buff);
        expect(p.stats.atk).toBe(12);
        // add another stack via applyBuff with same sourceId -> should merge
        const buff2 = bs.createBuff(item, 'StackElixir', { stats: { atk: 2 } }, 5, 'ticks');
        // ensure same sourceId so merging occurs
        buff2.sourceId = buff.sourceId;
        p = bs.applyBuff(p, buff2);
        // two stacks => +4
        expect(p.stats.atk).toBe(14);
        expect(p.activeBuffs[0].currentStacks).toBeGreaterThanOrEqual(2);
    });
    test('addStack and removeStack adjust applied effects correctly', () => {
        const item = { itemId: 'b4', name: 'Progressive Tonic', stackable: true, maxStacks: 3 };
        const buff = bs.createBuff(item, 'Prog', { stats: { atk: 3 } }, 5, 'ticks');
        let p = bs.applyBuff(player, buff);
        expect(p.stats.atk).toBe(13);
        // add stack
        p = bs.addStack(p, p.activeBuffs[0]);
        expect(p.stats.atk).toBe(16); // now 2 stacks => +6
        // remove stack
        p = bs.removeStack(p, p.activeBuffs[0]);
        expect(p.stats.atk).toBe(13);
    });
    test('tick expiration removes buff and reverts', () => {
        const item = { itemId: 'b5', name: 'Short Buff' };
        const buff = bs.createBuff(item, 'Short', { stats: { atk: 4 } }, 1, 'ticks');
        let p = bs.applyBuff(player, buff);
        expect(p.stats.atk).toBe(14);
        // process tick
        p = bs.processBuffsOnTick(p);
        // duration was 1 -> should expire and be removed
        expect((p.activeBuffs || []).length).toBe(0);
        expect(p.stats.atk).toBe(10);
    });
    test('action expiration works for actions durationType', () => {
        const item = { itemId: 'b6', name: 'Action Buff' };
        const buff = bs.createBuff(item, 'Act', { stats: { atk: 2 } }, 1, 'actions');
        let p = bs.applyBuff(player, buff);
        expect(p.stats.atk).toBe(12);
        p = bs.processBuffsOnAction(p);
        expect((p.activeBuffs || []).length).toBe(0);
        expect(p.stats.atk).toBe(10);
    });
    test('combat end expiration removes combat buffs', () => {
        const item = { itemId: 'b7', name: 'Combat Short' };
        const buff = bs.createBuff(item, 'Combat', { stats: { atk: 8 } }, 1, 'combat');
        let p = bs.applyBuff(player, buff);
        expect(p.stats.atk).toBe(18);
        p = bs.processBuffsOnCombatEnd(p);
        expect((p.activeBuffs || []).length).toBe(0);
        expect(p.stats.atk).toBe(10);
    });
});
