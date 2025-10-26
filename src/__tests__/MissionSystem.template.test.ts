import { MissionSystem } from '@/systems/MissionSystem';
import { registerMissionTemplate, clearMissionRegistry, getRegisteredMissionTemplate } from '@/systems/missionTemplateRegistry';

describe('MissionSystem.generateMissionFromTemplateId', () => {
  const ms = new MissionSystem();
  beforeEach(() => { clearMissionRegistry(); });

  test('returns null for unknown template id', () => {
    const gameState: any = { player: { level: 1 } };
    expect(ms.generateMissionFromTemplateId('nope', gameState)).toBeNull();
  });

  test('generates mission from registered template', () => {
    registerMissionTemplate({ id: 'test_tpl', title: 'Test Template', description: 'D', baseReward: { spiritStones: { low: 10 } }, difficulty: 'easy' } as any);
    const gameState: any = { player: { level: 5 } };
    const mission = ms.generateMissionFromTemplateId('test_tpl', gameState);
    expect(mission).not.toBeNull();
    expect(mission!.title).toBe('Test Template');
    expect(typeof mission!.id).toBe('string');
    expect(mission!.reward).toBeDefined();
    // scaling should have applied: low spirit stones should be > 0 if present
    expect(mission!.reward.spiritStones).toBeDefined();
    expect((mission!.reward.spiritStones as any).low).toBeGreaterThan(0);
  });
});
