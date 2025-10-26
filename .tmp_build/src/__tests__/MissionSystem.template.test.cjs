"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MissionSystem_1 = require("@/systems/MissionSystem");
const missionTemplateRegistry_1 = require("@/systems/missionTemplateRegistry");
describe('MissionSystem.generateMissionFromTemplateId', () => {
    const ms = new MissionSystem_1.MissionSystem();
    beforeEach(() => { (0, missionTemplateRegistry_1.clearMissionRegistry)(); });
    test('returns null for unknown template id', () => {
        const gameState = { player: { level: 1 } };
        expect(ms.generateMissionFromTemplateId('nope', gameState)).toBeNull();
    });
    test('generates mission from registered template', () => {
        (0, missionTemplateRegistry_1.registerMissionTemplate)({ id: 'test_tpl', title: 'Test Template', description: 'D', baseReward: { spiritStones: { low: 10 } }, difficulty: 'easy' });
        const gameState = { player: { level: 5 } };
        const mission = ms.generateMissionFromTemplateId('test_tpl', gameState);
        expect(mission).not.toBeNull();
        expect(mission.title).toBe('Test Template');
        expect(typeof mission.id).toBe('string');
        expect(mission.reward).toBeDefined();
        // scaling should have applied: low spirit stones should be > 0 if present
        expect(mission.reward.spiritStones).toBeDefined();
        expect(mission.reward.spiritStones.low).toBeGreaterThan(0);
    });
});
