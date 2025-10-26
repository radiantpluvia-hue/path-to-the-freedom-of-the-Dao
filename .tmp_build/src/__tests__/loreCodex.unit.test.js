"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loreCodex_1 = require("../systems/loreCodex");
const worldState_1 = require("../systems/worldState");
describe('LoreCodex basics', () => {
    beforeEach(() => { worldState_1.worldState.reset(); });
    test('add and list fragments', () => {
        const f = loreCodex_1.loreCodex.addFragment({ title: 'Old Echo', content: 'An echo of the past', era: 'Primordial', tags: ['echo'] });
        expect(f).toBeDefined();
        const list = loreCodex_1.loreCodex.listFragments({ era: 'Primordial' });
        expect(list.find(x => x.id === f.id)).toBeDefined();
    });
    test('astral wandering yields fragment on long sessions', () => {
        const session = { currentProgress: 300 };
        // force success
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
        const frag = loreCodex_1.loreCodex.tryAstralWander(session);
        expect(frag).toBeDefined();
        Math.random.mockRestore();
    });
});
