import { SectFactionSystem } from '../src/systems/SectSystem';
import { CombatSystem, DEFAULT_TECHNIQUES } from '../src/systems/CombatSystem';

describe('Rival System Integration', () => {
  it('should generate rivals from sects', () => {
    const sectSystem = new SectFactionSystem();
    const rival = sectSystem.generateRivalFromSect('azure_cloud_sect', 5);
    
    expect(rival).toBeDefined();
    expect(rival?.name).toContain('Azure Cloud Sect');
    expect(rival?.level).toBeGreaterThanOrEqual(5);
    expect(rival?.techniques).toBeDefined();
  });

  it('should adjust sect reputation after combat', () => {
    const sectSystem = new SectFactionSystem();
    const initialReputation = sectSystem.getSectReputation('azure_cloud_sect');
    
    sectSystem.adjustSectReputation('azure_cloud_sect', 15);
    
    const newReputation = sectSystem.getSectReputation('azure_cloud_sect');
    expect(newReputation).toBe(initialReputation + 15);
  });

  it('should create combat with rival context', () => {
    const player = {
      id: 'player',
      name: 'Test Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 3,
      maxAp: 3,
      stats: { atk: 15, def: 10, speed: 12 },
      techniques: [...DEFAULT_TECHNIQUES],
      buffs: [],
      debuffs: []
    };

    const combatSystem = new CombatSystem(player, [], null, null, {
      type: 'rival',
      rivalId: 'test_rival_1'
    });

    const state = combatSystem.getState();
    expect(state.combatLog).toEqual(expect.arrayContaining(['Rival encounter! This battle will affect your reputation.']));
  });
});
