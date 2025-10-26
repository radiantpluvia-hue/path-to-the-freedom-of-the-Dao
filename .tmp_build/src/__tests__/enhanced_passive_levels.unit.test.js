"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rarity_1 = require("@/config/rarity");
const raceBackgrounds_1 = require("@/data/raceBackgrounds");
describe('ENHANCED_PASSIVE_LEVELS application', () => {
    test('legendary backgrounds have passives upgraded to target levels', () => {
        // pick a background that is legendary and contains one of the known legendary passive ids
        const legendaryBackgrounds = Object.values(raceBackgrounds_1.RACE_BACKGROUNDS).flat().filter(b => b.rarity === "D");
        expect(legendaryBackgrounds.length).toBeGreaterThan(0);
        // find at least one passive id from ENHANCED_PASSIVE_LEVELS.legendary present in backgrounds
        const legendaryTargets = rarity_1.ENHANCED_PASSIVE_LEVELS.legendary || {};
        const targetKeys = Object.keys(legendaryTargets);
        expect(targetKeys.length).toBeGreaterThan(0);
        const found = legendaryBackgrounds.some(bg => {
            const passives = (bg.effects && bg.effects.passives) || {};
            for (const k of Object.keys(passives)) {
                if (k in legendaryTargets) {
                    const cur = passives[k];
                    const target = legendaryTargets[k];
                    if ((cur && (cur.level || 1)) >= target)
                        return true;
                }
            }
            return false;
        });
        expect(found).toBe(true);
    });
    test('rare backgrounds have passives upgraded to target levels', () => {
        const rareBackgrounds = Object.values(raceBackgrounds_1.RACE_BACKGROUNDS).flat().filter(b => b.rarity === "F");
        expect(rareBackgrounds.length).toBeGreaterThan(0);
        const rareTargets = rarity_1.ENHANCED_PASSIVE_LEVELS.rare || {};
        const targetKeys = Object.keys(rareTargets);
        expect(targetKeys.length).toBeGreaterThan(0);
        const found = rareBackgrounds.some(bg => {
            const passives = (bg.effects && bg.effects.passives) || {};
            for (const k of Object.keys(passives)) {
                if (k in rareTargets) {
                    const cur = passives[k];
                    const target = rareTargets[k];
                    if ((cur && (cur.level || 1)) >= target)
                        return true;
                }
            }
            return false;
        });
        expect(found).toBe(true);
    });
});
