"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immortalQuestMissionAdapter_1 = require("@/missions/immortalQuestMissionAdapter");
function seededRng(seed = 9999) { let s = seed; return { next: () => (s = (s * 48271) % 0x7fffffff) / 0x7fffffff }; }
describe('Mission adapter triggering secret quest', () => {
    test('does not trigger without clue', () => {
        const r = (0, immortalQuestMissionAdapter_1.onMissionComplete)({ playerReputation: 100, foundSecretClue: false });
        expect(r.triggered).toBe(false);
    });
    test('triggers quest when clue present and stealth', () => {
        const r = (0, immortalQuestMissionAdapter_1.onMissionComplete)({ playerReputation: 0, foundSecretClue: true, stealthSuccessful: true }, seededRng());
        expect(r.triggered).toBe(true);
        expect(r.reward).toBeDefined();
    });
});
