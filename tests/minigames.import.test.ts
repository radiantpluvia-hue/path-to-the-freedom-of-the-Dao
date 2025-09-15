import { CombatSimulation, MemoryTest } from '../src/components/minigames';
import RivalInfoPanel from '../src/components/RivalInfoPanel';
import { RivalAI } from '../src/systems/RivalAI';

test('mini-games and rival modules import', () => {
  expect(CombatSimulation).toBeDefined();
  expect(MemoryTest).toBeDefined();
  expect(RivalInfoPanel).toBeDefined();
  const ai = new RivalAI({ id: 'r1', name: 'Test Rival', personality: 'neutral' });
  expect(ai.decideAction()).toBeDefined();
});
