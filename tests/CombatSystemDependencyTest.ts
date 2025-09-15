import { CombatSystem, DEFAULT_TECHNIQUES } from '../src/systems/CombatSystem';
import { RivalSystem } from '../src/systems/RivalSystem';

// Mock GameStore with all required methods
class MockGameStore {
  player = {
    id: 'player',
    name: 'Test Player',
    sect: 'Azure Cloud Sect',
    hp: 100,
    maxHp: 100,
    qi: 50,
    maxQi: 50,
    ap: 5,
    maxAp: 5,
    stats: { atk: 10, def: 10, speed: 10 },
    techniques: DEFAULT_TECHNIQUES,
    buffs: [],
    debuffs: []
  };

  rivalRelationships: Record<string, number> = {
    'rival_1': 0,
    'rival_2': -20,
    'rival_3': 30
  };

  sectReputations: Record<string, number> = {
    'Azure Cloud Sect': 150,
    'Heavenly Sword Sect': 100
  };

  factionStandings: Record<string, number> = {
    'Azure Cloud Sect': 120,
    'Heavenly Sword Sect': 80,
    'Blood Demon Sect': -50
  };

  defeatedRivals: Set<string> = new Set();

  getSectReputation(sect: string): number {
    return this.sectReputations[sect] || 0;
  }

  getFactionStanding(faction: string): number {
    return this.factionStandings[faction] || 0;
  }

  adjustRivalRelationship(rivalId: string, change: number): void {
    this.rivalRelationships[rivalId] = (this.rivalRelationships[rivalId] || 0) + change;
    console.log(`Rival relationship ${rivalId} adjusted by ${change}`);
  }

  adjustFactionStanding(faction: string, change: number): void {
    this.factionStandings[faction] = (this.factionStandings[faction] || 0) + change;
    console.log(`Faction standing ${faction} adjusted by ${change}`);
  }

  adjustSectReputation(sect: string, change: number): void {
    this.sectReputations[sect] = (this.sectReputations[sect] || 0) + change;
    console.log(`Sect reputation ${sect} adjusted by ${change}`);
  }

  markRivalDefeated(rivalId: string): void {
    this.defeatedRivals.add(rivalId);
    console.log(`Rival ${rivalId} marked as defeated`);
  }
}

// Mock RivalSystem
class MockRivalSystem {
  rivals: Record<string, any> = {
    'rival_1': {
      id: 'rival_1',
      name: 'Aggressive Rival',
      personality: 'aggressive',
      faction: 'Heavenly Sword Sect',
      relationship: 0
    },
    'rival_2': {
      id: 'rival_2',
      name: 'Cunning Rival',
      personality: 'cunning',
      faction: 'Blood Demon Sect',
      relationship: -20
    },
    'rival_3': {
      id: 'rival_3',
      name: 'Honorable Rival',
      personality: 'honorable',
      faction: 'Azure Cloud Sect',
      relationship: 30
    }
  };

  getRival(id: string): any {
    return this.rivals[id];
  }
}

// Test helper functions
function createTestParticipant(id: string, name: string, isRival = false) {
  return {
    id,
    name,
    hp: 100,
    maxHp: 100,
    qi: 50,
    maxQi: 50,
    ap: 5,
    maxAp: 5,
    stats: { atk: 10, def: 10, speed: 10 },
    techniques: DEFAULT_TECHNIQUES,
    buffs: [],
    debuffs: []
  };
}

// Test 1: Dependency Injection Test
function testDependencyInjection() {
  console.log('\n🧪 Testing Dependency Injection...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const enemy = createTestParticipant('enemy', 'Test Enemy');

  try {
    const combatSystem = new CombatSystem(player, [enemy], mockGameStore, mockRivalSystem, { type: 'normal' });
    console.log('✅ CombatSystem initialized with injected dependencies');
    return true;
  } catch (error) {
    console.error('❌ Dependency injection failed:', error);
    return false;
  }
}

// Test 2: Normal Combat Test
function testNormalCombat() {
  console.log('\n🧪 Testing Normal Combat...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const enemy = createTestParticipant('enemy', 'Test Enemy');

  try {
    const combatSystem = new CombatSystem(player, [enemy], mockGameStore, mockRivalSystem, { type: 'normal' });
    const state = combatSystem.getState();

    if (state.participants.length === 2 && state.status === 'ongoing') {
      console.log('✅ Normal combat initialized correctly');
      return true;
    } else {
      console.error('❌ Normal combat initialization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Normal combat test failed:', error);
    return false;
  }
}

// Test 3: Rival Combat Test
function testRivalCombat() {
  console.log('\n🧪 Testing Rival Combat...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const rival = createTestParticipant('rival_1', 'Aggressive Rival');

  try {
    const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem,
      { type: 'rival', rivalId: 'rival_1' });

    const state = combatSystem.getState();

    if (state.participants.length === 2 && state.combatLog.some(log => log.includes('Rival encounter'))) {
      console.log('✅ Rival combat initialized with context-specific messages');

      // Test rival defeat outcome by simulating damage
      const initialRelationship = mockGameStore.rivalRelationships['rival_1'];

      // Simulate combat by using a technique that deals damage
      const availableTechniques = combatSystem.getAvailableTechniques('player');
      if (availableTechniques.length > 0) {
        const basicAttack = availableTechniques.find(t => t.id === 'basic_attack');
        if (basicAttack) {
          // Deal enough damage to defeat the rival
          while (rival.hp > 0) {
            combatSystem.useTechnique('player', 'basic_attack', 'rival_1');
          }

          if (mockGameStore.rivalRelationships['rival_1'] > initialRelationship) {
            console.log('✅ Rival defeat outcome handled correctly');
            return true;
          } else {
            console.error('❌ Rival relationship not adjusted on defeat');
            return false;
          }
        }
      }

      console.log('⚠️ Could not test rival defeat - no basic attack available');
      return true; // Still pass if initialization worked
    } else {
      console.error('❌ Rival combat initialization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Rival combat test failed:', error);
    return false;
  }
}

// Test 4: Faction Battle Test
function testFactionBattle() {
  console.log('\n🧪 Testing Faction Battle...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const rival = createTestParticipant('rival_2', 'Cunning Rival');

  try {
    const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem,
      { type: 'faction_battle', faction: 'Azure Cloud Sect', rivalId: 'rival_2' });

    const state = combatSystem.getState();

    if (state.combatLog.some(log => log.includes('Faction battle'))) {
      console.log('✅ Faction battle initialized with context-specific messages');

      // Test victory outcome by simulating damage
      const initialPlayerFactionStanding = mockGameStore.factionStandings['Azure Cloud Sect'];
      const initialEnemyFactionStanding = mockGameStore.factionStandings['Blood Demon Sect'];

      // Simulate combat by using a technique that deals damage
      const availableTechniques = combatSystem.getAvailableTechniques('player');
      if (availableTechniques.length > 0) {
        const basicAttack = availableTechniques.find(t => t.id === 'basic_attack');
        if (basicAttack) {
          // Deal enough damage to defeat the rival
          while (rival.hp > 0) {
            combatSystem.useTechnique('player', 'basic_attack', 'rival_2');
          }

          if (mockGameStore.factionStandings['Azure Cloud Sect'] > initialPlayerFactionStanding &&
              mockGameStore.factionStandings['Blood Demon Sect'] < initialEnemyFactionStanding) {
            console.log('✅ Faction battle victory outcome handled correctly');
            return true;
          } else {
            console.error('❌ Faction standings not adjusted correctly on victory');
            return false;
          }
        }
      }

      console.log('⚠️ Could not test faction battle victory - no basic attack available');
      return true; // Still pass if initialization worked
    } else {
      console.error('❌ Faction battle initialization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Faction battle test failed:', error);
    return false;
  }
}

// Test 5: Sect War Test
function testSectWar() {
  console.log('\n🧪 Testing Sect War...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const enemy = createTestParticipant('enemy', 'Sect Enemy');

  try {
    const combatSystem = new CombatSystem(player, [enemy], mockGameStore, mockRivalSystem,
      { type: 'sect_war', sect: 'Azure Cloud Sect' });

    const state = combatSystem.getState();

    if (state.combatLog.some(log => log.includes('Sect war'))) {
      console.log('✅ Sect war initialized with context-specific messages');

      // Test victory outcome by simulating damage
      const initialSectReputation = mockGameStore.sectReputations['Azure Cloud Sect'];

      // Simulate combat by using a technique that deals damage
      const availableTechniques = combatSystem.getAvailableTechniques('player');
      if (availableTechniques.length > 0) {
        const basicAttack = availableTechniques.find(t => t.id === 'basic_attack');
        if (basicAttack) {
          // Deal enough damage to defeat the enemy
          while (enemy.hp > 0) {
            combatSystem.useTechnique('player', 'basic_attack', 'enemy');
          }

          if (mockGameStore.sectReputations['Azure Cloud Sect'] > initialSectReputation) {
            console.log('✅ Sect war victory outcome handled correctly');
            return true;
          } else {
            console.error('❌ Sect reputation not adjusted on victory');
            return false;
          }
        }
      }

      console.log('⚠️ Could not test sect war victory - no basic attack available');
      return true; // Still pass if initialization worked
    } else {
      console.error('❌ Sect war initialization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Sect war test failed:', error);
    return false;
  }
}

// Test 6: Faction Stat Adjustments Test
function testFactionStatAdjustments() {
  console.log('\n🧪 Testing Faction Stat Adjustments...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const rival = createTestParticipant('rival_1', 'Aggressive Rival');

  const originalPlayerAtk = player.stats.atk;
  const originalRivalAtk = rival.stats.atk;

  try {
    const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem, { type: 'normal' });

    // Check if player's stats were adjusted based on sect reputation
    const expectedPlayerBonus = Math.max(0.9, Math.min(1.2, 1 + (150 / 200))); // 150 reputation
    const expectedPlayerAtk = originalPlayerAtk * expectedPlayerBonus;

    // Check if rival's stats were adjusted based on faction standing
    const expectedRivalBonus = Math.max(0.9, Math.min(1.2, 1 + (80 / 200))); // 80 standing for Heavenly Sword Sect
    const expectedRivalAtk = originalRivalAtk * expectedRivalBonus;

    if (Math.abs(player.stats.atk - expectedPlayerAtk) < 0.01 &&
        Math.abs(rival.stats.atk - expectedRivalAtk) < 0.01) {
      console.log('✅ Faction stat adjustments applied correctly');
      return true;
    } else {
      console.error('❌ Faction stat adjustments failed');
      console.error(`Player atk: ${player.stats.atk}, expected: ${expectedPlayerAtk}`);
      console.error(`Rival atk: ${rival.stats.atk}, expected: ${expectedRivalAtk}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Faction stat adjustments test failed:', error);
    return false;
  }
}

// Test 7: Rival Mechanics Test
function testRivalMechanics() {
  console.log('\n🧪 Testing Rival Mechanics...');

  const mockGameStore = new MockGameStore();
  const mockRivalSystem = new MockRivalSystem();

  const player = createTestParticipant('player', 'Test Player');
  const aggressiveRival = createTestParticipant('rival_1', 'Aggressive Rival');
  const cunningRival = createTestParticipant('rival_2', 'Cunning Rival');
  const honorableRival = createTestParticipant('rival_3', 'Honorable Rival');

  try {
    const combatSystem = new CombatSystem(player, [aggressiveRival, cunningRival, honorableRival],
      mockGameStore, mockRivalSystem, { type: 'normal' });

    // Check aggressive rival adjustments (atk +20%, def -10%)
    const expectedAggressiveAtk = 10 * 1.2; // 12
    const expectedAggressiveDef = 10 * 0.9; // 9

    // Check cunning rival adjustments (speed +15%)
    const expectedCunningSpeed = 10 * 1.15; // 11.5

    // Check honorable rival adjustments (atk +5%, def +5%)
    const expectedHonorableAtk = 10 * 1.05; // 10.5
    const expectedHonorableDef = 10 * 1.05; // 10.5

    if (Math.abs(aggressiveRival.stats.atk - expectedAggressiveAtk) < 0.01 &&
        Math.abs(aggressiveRival.stats.def - expectedAggressiveDef) < 0.01 &&
        Math.abs(cunningRival.stats.speed - expectedCunningSpeed) < 0.01 &&
        Math.abs(honorableRival.stats.atk - expectedHonorableAtk) < 0.01 &&
        Math.abs(honorableRival.stats.def - expectedHonorableDef) < 0.01) {
      console.log('✅ Rival mechanics applied correctly');
      return true;
    } else {
      console.error('❌ Rival mechanics failed');
      console.error(`Aggressive - atk: ${aggressiveRival.stats.atk}, def: ${aggressiveRival.stats.def}`);
      console.error(`Cunning - speed: ${cunningRival.stats.speed}`);
      console.error(`Honorable - atk: ${honorableRival.stats.atk}, def: ${honorableRival.stats.def}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Rival mechanics test failed:', error);
    return false;
  }
}

// Test 8: Window Global Access Test
function testNoWindowAccess() {
  console.log('\n🧪 Testing No Window Global Access...');

  // Mock window to detect any access
  const originalWindow = global.window;
  let windowAccessed = false;

  (global as any).window = new Proxy({}, {
    get(target, prop) {
      windowAccessed = true;
      console.error(`❌ Window global accessed: ${String(prop)}`);
      return undefined;
    },
    set(target, prop, value) {
      windowAccessed = true;
      console.error(`❌ Window global set: ${String(prop)}`);
      return true;
    }
  });

  try {
    const mockGameStore = new MockGameStore();
    const mockRivalSystem = new MockRivalSystem();

    const player = createTestParticipant('player', 'Test Player');
    const rival = createTestParticipant('rival_1', 'Test Rival');

    const combatSystem = new CombatSystem(player, [rival], mockGameStore, mockRivalSystem,
      { type: 'rival', rivalId: 'rival_1' });

    // Trigger various methods that previously used window
    combatSystem.getState();

    // Simulate combat by using a technique that deals damage
    const availableTechniques = combatSystem.getAvailableTechniques('player');
    if (availableTechniques.length > 0) {
      const basicAttack = availableTechniques.find(t => t.id === 'basic_attack');
      if (basicAttack) {
        // Deal enough damage to defeat the rival
        while (rival.hp > 0) {
          combatSystem.useTechnique('player', 'basic_attack', 'rival_1');
        }
      }
    }

    if (!windowAccessed) {
      console.log('✅ No window global access detected');
      return true;
    } else {
      console.error('❌ Window global was accessed');
      return false;
    }
  } catch (error) {
    console.error('❌ Window access test failed:', error);
    return false;
  } finally {
    // Restore original window
    (global as any).window = originalWindow;
  }
}

// Run all tests
console.log('=== Comprehensive Combat System Dependency Injection Tests ===\n');

const tests = [
  { name: 'Dependency Injection', func: testDependencyInjection },
  { name: 'Normal Combat', func: testNormalCombat },
  { name: 'Rival Combat', func: testRivalCombat },
  { name: 'Faction Battle', func: testFactionBattle },
  { name: 'Sect War', func: testSectWar },
  { name: 'Faction Stat Adjustments', func: testFactionStatAdjustments },
  { name: 'Rival Mechanics', func: testRivalMechanics },
  { name: 'No Window Access', func: testNoWindowAccess }
];

let passedTests = 0;
let totalTests = tests.length;

tests.forEach(test => {
  try {
    if (test.func()) {
      passedTests++;
    }
  } catch (error) {
    console.error(`❌ Test "${test.name}" threw an exception:`, error);
  }
});

console.log('\n=== Test Results ===');
console.log(`Passed: ${passedTests}/${totalTests} tests`);

if (passedTests === totalTests) {
  console.log('\n🎉 All tests passed! The refactored CombatSystem is working correctly with dependency injection.');
  console.log('✅ No window globals are accessed');
  console.log('✅ All combat contexts work properly');
  console.log('✅ Faction and rival mechanics function correctly');
} else {
  console.log(`\n❌ ${totalTests - passedTests} test(s) failed. Please check the errors above.`);
}
