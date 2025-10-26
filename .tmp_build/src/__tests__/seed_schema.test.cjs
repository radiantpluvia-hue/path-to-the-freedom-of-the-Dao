"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("@/data/index"));
const manuals_1 = require("@/data/manuals");
const passiveRegistry_1 = require("@/systems/passiveRegistry");
describe('seed schema validation', () => {
    test('items have valid effect shapes', () => {
        const items = (index_1.default.SEED_ITEMS || []);
        items.forEach((it) => {
            expect(it).toHaveProperty('id');
            expect(it).toHaveProperty('name');
            // effects should be an array of { type: string, value: number }
            expect(Array.isArray(it.effects)).toBe(true);
            it.effects.forEach((ef) => {
                expect(typeof ef.type).toBe('string');
                expect(typeof ef.value === 'number' || typeof ef.value === 'object').toBe(true);
            });
        });
    });
    test('manuals contain required fields and shapes', () => {
        const manuals = (index_1.default.SEED_MANUALS || []);
        manuals.forEach((m) => {
            expect(m).toHaveProperty('id');
            expect(m).toHaveProperty('title');
            expect(m).toHaveProperty('effects');
            // effects should be an array of objects with at least 'stat' and 'amount'
            expect(Array.isArray(m.effects)).toBe(true);
            m.effects.forEach((e) => {
                expect(typeof e.stat).toBe('string');
                expect(typeof e.amount).toBe('number');
            });
            // ensure the manual id exists in the runtime ALL_MANUALS (merge step)
            const exists = manuals_1.ALL_MANUALS.some((am) => am.id === m.id);
            expect(exists).toBe(true);
        });
    });
    test('passives register in passive registry and have basic fields', () => {
        const passives = (index_1.default.SEED_PASSIVES || []);
        passives.forEach((p) => {
            expect(p).toHaveProperty('id');
            expect(p).toHaveProperty('description');
            // ensure registry contains them
            expect((0, passiveRegistry_1._registryContains)(p.id)).toBe(true);
        });
    });
});
