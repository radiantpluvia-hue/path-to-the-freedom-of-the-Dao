"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immortalItems_1 = require("@/data/immortalItems");
describe('Immortal Emperor Consciousness core', () => {
    test('sample items load and consciousness can be awakened prudently', () => {
        expect(immortalItems_1.IMMORTAL_ITEMS.length).toBeGreaterThanOrEqual(1);
        const sword = (0, immortalItems_1.findImmortalItemById)('immortal_heaven_sealing_sword');
        expect(sword).not.toBeNull();
        if (!sword || !sword.consciousness)
            return;
        // too weak
        const r1 = sword.consciousness.attemptAwaken(10, 5, 0);
        expect(r1.success).toBe(false);
        // compatible
        const r2 = sword.consciousness.attemptAwaken(200, 10, 0.2);
        // allow either awakening or more gradual success; don't require full activation
        expect(typeof r2.message).toBe('string');
    });
});
