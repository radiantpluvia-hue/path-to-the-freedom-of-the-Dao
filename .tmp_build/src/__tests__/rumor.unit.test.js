"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rumorSystem_1 = require("../systems/rumorSystem");
const worldState_1 = require("../systems/worldState");
describe('RumorSystem basics', () => {
    beforeEach(() => { worldState_1.worldState.reset(); });
    test('postRumor stores and returns rumor object', () => {
        const r = rumorSystem_1.rumorSystem.postRumor({ content: 'A spirit beast was seen', truthiness: 0.8 });
        expect(r).toBeDefined();
        const list = rumorSystem_1.rumorSystem.getRumors();
        expect(list.find((x) => x.id === r.id)).toBeDefined();
    });
    test('expireRumors removes expired entries', () => {
        const now = Date.now();
        // post two rumors, one expired
        rumorSystem_1.rumorSystem.postRumor({ id: 'r1', content: 'Old rumor', truthiness: 0.2, expiryMs: now - 1000 });
        rumorSystem_1.rumorSystem.postRumor({ id: 'r2', content: 'Fresh rumor', truthiness: 0.9, expiryMs: now + 1000000 });
        const before = rumorSystem_1.rumorSystem.getRumors({ activeOnly: true });
        expect(before.find((r) => r.id === 'r2')).toBeDefined();
        const active = rumorSystem_1.rumorSystem.expireRumors();
        expect(active.find((r) => r.id === 'r1')).toBeUndefined();
        expect(active.find((r) => r.id === 'r2')).toBeDefined();
    });
});
