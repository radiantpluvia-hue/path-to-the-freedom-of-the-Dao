"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const missionTemplateRegistry_1 = require("@/systems/missionTemplateRegistry");
describe('missionTemplateRegistry', () => {
    beforeEach(() => { (0, missionTemplateRegistry_1.clearMissionRegistry)(); });
    test('registers and retrieves templates', () => {
        const tpl = { id: 't1', title: 'T1', description: 'Desc' };
        expect((0, missionTemplateRegistry_1.registerMissionTemplate)(tpl)).toBe(true);
        const got = (0, missionTemplateRegistry_1.getRegisteredMissionTemplate)('t1');
        expect(got).not.toBeNull();
        expect(got.title).toBe('T1');
        expect((0, missionTemplateRegistry_1.listRegisteredTemplates)().length).toBe(1);
    });
    test('clear removes templates', () => {
        (0, missionTemplateRegistry_1.registerMissionTemplate)({ id: 't2', title: 'T2' });
        expect((0, missionTemplateRegistry_1.listRegisteredTemplates)().length).toBe(1);
        (0, missionTemplateRegistry_1.clearMissionRegistry)();
        expect((0, missionTemplateRegistry_1.listRegisteredTemplates)().length).toBe(0);
        expect((0, missionTemplateRegistry_1.getRegisteredMissionTemplate)('t2')).toBeNull();
    });
});
