"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passiveRegistry_1 = require("../systems/passiveRegistry");
const all_skills_json_1 = __importDefault(require("../data/skills/all_skills.json"));
describe('passive idempotency', () => {
    beforeAll(async () => {
        // ensure the custom/passive registration module is loaded (it registers handcrafted passives)
        try {
            // require the module so its top-level registrations run synchronously
            // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
            require('../systems/customPassives');
        }
        catch (e) {
            // ignore if not present in some test environments
        }
        // also attempt to load other generated passives if available
        try {
            await (0, passiveRegistry_1.loadGeneratedPassives)();
        }
        catch (e) { /* ignore */ }
    });
    const makePlayer = () => ({ stats: { atk: 10, def: 5, cultivationSpeed: 1 }, _passiveHooks: {} });
    const testIds = [
        all_skills_json_1.default.find(s => s.tier === 'S')?.id,
        all_skills_json_1.default.find(s => s.tier === 'A')?.id,
        all_skills_json_1.default.find(s => s.tier === 'B')?.id,
        all_skills_json_1.default.find(s => s.tier === 'C')?.id,
    ].filter(Boolean);
    testIds.forEach((id) => {
        test(`apply/remove idempotency for ${id}`, () => {
            const def = (0, passiveRegistry_1.getPassive)(id);
            expect(def).toBeDefined();
            const p = makePlayer();
            const after1 = def.apply(p);
            const after2 = def.apply(after1);
            // Applying twice should not double-apply in our generated pattern because _autoApplied tracks deltas
            // After applying twice, cultivationSpeed should be >= original (should not shrink)
            const afterCult = (after2.stats && typeof after2.stats.cultivationSpeed === 'number') ? after2.stats.cultivationSpeed : (p.stats.cultivationSpeed || 1);
            expect(afterCult).toBeGreaterThanOrEqual(p.stats.cultivationSpeed || 1);
            const removed1 = def.remove(after2);
            const removed2 = def.remove(removed1);
            // After removal twice, key stats should be back to original
            expect(removed2.stats.atk).toBe(p.stats.atk);
            expect(removed2.stats.def).toBe(p.stats.def);
            // cultivationSpeed should be back to original or close (floating math)
            expect(Math.abs((removed2.stats.cultivationSpeed || 1) - (p.stats.cultivationSpeed || 1))).toBeLessThan(0.0001);
        });
    });
});
