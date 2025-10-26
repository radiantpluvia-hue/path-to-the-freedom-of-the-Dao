"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const idleManager_1 = require("../systems/idleManager");
describe('IdleManager basic flow', () => {
    beforeEach(() => {
        (0, idleManager_1._resetIdleManagerForTests)();
    });
    test('start meditation and tick increases progress', () => {
        const sid = idleManager_1.idleManager.startMeditation('quiet_cultivation');
        expect(typeof sid).toBe('string');
        const sessionsBefore = idleManager_1.idleManager.listSessions();
        expect(sessionsBefore).toContain(sid);
        const r1 = idleManager_1.idleManager.tick(1); // 1 second
        expect(r1.length).toBeGreaterThan(0);
        const s = idleManager_1.idleManager.getSession(sid);
        expect(s.currentProgress).toBeGreaterThan(0);
    });
    test('stop meditation returns result with progress', () => {
        const sid = idleManager_1.idleManager.startMeditation('comprehend_dao');
        idleManager_1.idleManager.tick(2);
        const res = idleManager_1.idleManager.stopMeditation(sid, 'test_stop');
        expect(res).not.toBeNull();
        expect(res.progressGained).toBeGreaterThan(0);
        const sessionsAfter = idleManager_1.idleManager.listSessions();
        expect(sessionsAfter).not.toContain(sid);
    });
});
