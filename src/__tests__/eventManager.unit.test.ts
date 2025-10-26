import { eventManager } from '../systems/eventManager';
import { worldState } from '../systems/worldState';

describe('EventManager basic behavior', () => {
  beforeEach(() => {
    worldState.reset();
  });

  test('createInstance and advanceInstance work and log events', () => {
    const inst = eventManager.createInstance('bandit_ambush');
    expect(inst).toBeDefined();
    const beforeLog = worldState.getEventLog();
    eventManager.advanceInstance(inst.id, 'fight');
    const afterLog = worldState.getEventLog();
    expect(afterLog.length).toBeGreaterThan(beforeLog.length);
  });

  test('checkInterrupts can return an interrupt object', () => {
    // increase chance by setting chosenType stability low
    const fakeSession: any = { chosenType: { stability: 0.1 } };
    // Force Math.random to return a tiny value so interrupt triggers
    jest.spyOn(Math, 'random').mockReturnValue(0.001);
    const res = eventManager.checkInterrupts(fakeSession as any);
    expect(res).not.toBeNull();
    expect(res!.type).toBe('interrupt');
    (Math.random as any).mockRestore();
  });
});
