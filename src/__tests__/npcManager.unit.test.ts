import { npcManager } from '../systems/npcManager';
import { worldState } from '../systems/worldState';

describe('NPC Manager progression', () => {
  beforeEach(() => { worldState.reset(); });

  test('npcs load from template and progress to breakthrough', () => {
    const list = npcManager.listNPCs();
    expect(list.length).toBeGreaterThan(0);
    // fast-forward a single NPC to breakthrough
    const events = npcManager.tickNPCs(1000 * 100); // large dt to ensure progress >= 100
    expect(events.length).toBeGreaterThanOrEqual(1);
    const log = worldState.getEventLog();
    expect(log.find((e: any) => e.type === 'npcBreakthrough')).toBeDefined();
  });
});
