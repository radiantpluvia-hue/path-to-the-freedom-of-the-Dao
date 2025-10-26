import { idleManager, _resetIdleManagerForTests } from '../systems/idleManager';
import { meditationSubsystem } from '../systems/meditationSubsystem';

describe('IdleManager basic flow', () => {
  beforeEach(() => {
    _resetIdleManagerForTests();
  });

  test('start meditation and tick increases progress', () => {
    const sid = idleManager.startMeditation('quiet_cultivation');
    expect(typeof sid).toBe('string');
    const sessionsBefore = idleManager.listSessions();
    expect(sessionsBefore).toContain(sid);
    const r1 = idleManager.tick(1); // 1 second
    expect(r1.length).toBeGreaterThan(0);
    const s = idleManager.getSession(sid)!;
    expect(s.currentProgress).toBeGreaterThan(0);
  });

  test('stop meditation returns result with progress', () => {
    const sid = idleManager.startMeditation('comprehend_dao');
    idleManager.tick(2);
    const res = idleManager.stopMeditation(sid, 'test_stop');
    expect(res).not.toBeNull();
    expect(res!.progressGained).toBeGreaterThan(0);
    const sessionsAfter = idleManager.listSessions();
    expect(sessionsAfter).not.toContain(sid);
  });
});
