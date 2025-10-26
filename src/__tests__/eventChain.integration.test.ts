import { eventManager } from '../systems/eventManager';
import { worldState } from '../systems/worldState';

describe('Event chain persistence & advancement', () => {
  beforeEach(() => { worldState.reset(); });

  test('create bandit chain instance and advance through steps', () => {
    const inst = eventManager.createInstance('bandit_ambush');
    expect(inst).toBeDefined();
    const instances = eventManager.getInstances();
    expect(instances.find((i:any)=>i.id===inst.id)).toBeDefined();
    // advance twice to progress through the chain
    eventManager.advanceInstance(inst.id, 'fight');
    eventManager.advanceInstance(inst.id, 'pursue');
    const instAfter = eventManager.getInstances().find((i:any)=>i.id===inst.id);
    expect(instAfter).toBeDefined();
    expect(instAfter.state.step).toBeGreaterThanOrEqual(2);
  });
});
