import { CombatSystem, DEFAULT_TECHNIQUES } from '../systems/CombatSystem';
import { scaleBloodlineStats, scalePhysiqueStats, getRealmMultiplier } from '../data/scalingSystem';
import { CULTIVATION_REALMS } from '../data/cultivationRealms';

// Mock GameStore
const mockGameStore = {
  player: {
    id: 'player',
    name: 'Test Player',
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
  },
  rivalSystem: null,
};

// Test damage calculation balance
function testDamageCalculationBalance() {
  console.log('\n=== Testing Damage Calculation Balance ===');

  const testCases = [
    { name: 'Balanced Stats', playerAtk: 10, playerDef: 10, enemyAtk: 10, enemyDef: 10 },
    { name: 'High Attack vs Low Defense', playerAtk: 20, playerDef: 5, enemyAtk: 5, enemyDef: 5 },
    { name: 'Low Attack vs High Defense', playerAtk: 5, playerDef: 5, enemyAtk: 20, enemyDef: 20 },
    { name: 'Extreme Imbalance', playerAtk: 50, playerDef: 10, enemyAtk: 10, enemyDef: 5 },
  ];

  testCases.forEach(testCase => {
    const player = {
      id: 'player',
      name: 'Test Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: testCase.playerAtk, def: testCase.playerDef, speed: 10 },
      techniques: DEFAULT_TECHNIQUES,
      buffs: [],
      debuffs: []
    };

    const enemy = {
      id: 'enemy',
      name: 'Test Enemy',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: testCase.enemyAtk, def: testCase.enemyDef, speed: 10 },
      techniques: DEFAULT_TECHNIQUES,
      buffs: [],
      debuffs: []
    };

    const combatSystem = new CombatSystem(player, [enemy], mockGameStore, mockGameStore.rivalSystem, { type: 'normal' });

    // Simulate a basic attack
    const basicAttack = player.techniques.find(t => t.id === 'basic_attack');
    if (basicAttack) {
      const success = combatSystem.useTechnique('player', 'basic_attack', 'enemy');
      const state = combatSystem.getState();
      const enemyHp = state.participants.find(p => p.id === 'enemy')?.hp || 0;
      const damage = 100 - enemyHp;

      console.log(`${testCase.name}:`);
      console.log(`  Player ATK: ${testCase.playerAtk}, DEF: ${testCase.playerDef}`);
      console.log(`  Enemy ATK: ${testCase.enemyAtk}, DEF: ${testCase.enemyDef}`);
      console.log(`  Damage dealt: ${damage} (Expected: ${Math.max(1, 10 + testCase.playerAtk - testCase.enemyDef)})`);

      // Check if damage calculation is reasonable
      const expectedDamage = Math.max(1, 10 + testCase.playerAtk - testCase.enemyDef);
      if (Math.abs(damage - expectedDamage) > 1) {
        console.log(`  ⚠️  Damage calculation may be off by ${Math.abs(damage - expectedDamage)}`);
      } else {
        console.log(`  ✅ Damage calculation correct`);
      }
    }
  });
}

// Test stat scaling through realms
function testRealmScalingBalance() {
  console.log('\n=== Testing Realm Scaling Balance ===');

  const baseStats = { hp: 100, qi: 50, atk: 10, def: 10, speed: 10 };
  const testRealms = ['mortal', 'foundation_establishment', 'core_formation', 'true_immortal'];

  testRealms.forEach(realm => {
    const multiplier = getRealmMultiplier(realm);
    const scaledStats = {
      hp: Math.round(baseStats.hp * multiplier),
      qi: Math.round(baseStats.qi * multiplier),
      atk: Math.round(baseStats.atk * multiplier),
      def: Math.round(baseStats.def * multiplier),
      speed: Math.round(baseStats.speed * multiplier)
    };

    console.log(`${realm}:`);
    console.log(`  Multiplier: ${multiplier.toFixed(2)}x`);
    console.log(`  Scaled Stats: HP=${scaledStats.hp}, ATK=${scaledStats.atk}, DEF=${scaledStats.def}, SPD=${scaledStats.speed}`);

    // Check for exponential growth
    if (multiplier > 10) {
      console.log(`  ⚠️  Very high multiplier - may cause balance issues`);
    }
  });
}

// Test buff/debuff mechanics
function testBuffDebuffBalance() {
  console.log('\n=== Testing Buff/Debuff Balance ===');

  const player = {
    id: 'player',
    name: 'Test Player',
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

  const enemy = {
    id: 'enemy',
    name: 'Test Enemy',
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

  const combatSystem = new CombatSystem(player, [enemy], mockGameStore, mockGameStore.rivalSystem, { type: 'normal' });

  // Test defensive stance buff
  console.log('Testing Defensive Stance buff:');
  const initialDef = player.stats.def;
  combatSystem.useTechnique('player', 'defensive_stance');
  const state = combatSystem.getState();
  const buffedPlayer = state.participants.find(p => p.id === 'player');

  if (buffedPlayer && buffedPlayer.buffs.length > 0) {
    const defBuff = buffedPlayer.buffs.find(b => b.name.includes('def'));
    if (defBuff) {
      console.log(`  ✅ Buff applied: +${defBuff.effects.def} DEF for ${defBuff.duration} turns`);
      console.log(`  Original DEF: ${initialDef}, Buffed DEF: ${initialDef + (defBuff.effects.def || 0)}`);
    }
  } else {
    console.log(`  ❌ Buff not applied correctly`);
  }
}

// Test combat outcomes with different stat configurations
function testCombatOutcomeBalance() {
  console.log('\n=== Testing Combat Outcome Balance ===');

  const scenarios = [
    { name: 'Equal Stats', playerStats: { atk: 10, def: 10, speed: 10 }, enemyStats: { atk: 10, def: 10, speed: 10 } },
    { name: 'Player Advantage', playerStats: { atk: 15, def: 15, speed: 15 }, enemyStats: { atk: 8, def: 8, speed: 8 } },
    { name: 'Enemy Advantage', playerStats: { atk: 8, def: 8, speed: 8 }, enemyStats: { atk: 15, def: 15, speed: 15 } },
  ];

  scenarios.forEach(scenario => {
    const player = {
      id: 'player',
      name: 'Test Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: scenario.playerStats,
      techniques: DEFAULT_TECHNIQUES,
      buffs: [],
      debuffs: []
    };

    const enemy = {
      id: 'enemy',
      name: 'Test Enemy',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: scenario.enemyStats,
      techniques: DEFAULT_TECHNIQUES,
      buffs: [],
      debuffs: []
    };

    const combatSystem = new CombatSystem(player, [enemy], mockGameStore, mockGameStore.rivalSystem, { type: 'normal' });

    // Simulate a few rounds of combat
    let rounds = 0;
    while (rounds < 10 && combatSystem.getState().status === 'ongoing') {
      // Player attacks
      if (combatSystem.getCurrentParticipant()?.id === 'player') {
        combatSystem.useTechnique('player', 'basic_attack', 'enemy');
        combatSystem.endTurn();
      } else {
        combatSystem.useTechnique('enemy', 'basic_attack', 'player');
        combatSystem.endTurn();
      }
      rounds++;
    }

    const finalState = combatSystem.getState();
    const finalPlayer = finalState.participants.find(p => p.id === 'player');
    const finalEnemy = finalState.participants.find(p => p.id === 'enemy');

    console.log(`${scenario.name}:`);
    console.log(`  Rounds: ${rounds}`);
    console.log(`  Player HP: ${finalPlayer?.hp}/${finalPlayer?.maxHp}`);
    console.log(`  Enemy HP: ${finalEnemy?.hp}/${finalEnemy?.maxHp}`);
    console.log(`  Status: ${finalState.status}`);

    // Analyze balance
    if (finalState.status === 'victory' && scenario.name === 'Equal Stats') {
      console.log(`  ⚠️  Equal stats led to victory - may indicate imbalance`);
    } else if (finalState.status === 'defeat' && scenario.name === 'Player Advantage') {
      console.log(`  ⚠️  Player advantage led to defeat - significant imbalance`);
    }
  });
}

// Test edge cases
function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===');

  // Test fleeing
  console.log('Testing flee mechanics:');
  const fastPlayer = {
    id: 'player',
    name: 'Fast Player',
    hp: 100,
    maxHp: 100,
    qi: 50,
    maxQi: 50,
    ap: 5,
    maxAp: 5,
    stats: { atk: 10, def: 10, speed: 20 },
    techniques: DEFAULT_TECHNIQUES,
    buffs: [],
    debuffs: []
  };

  const slowEnemy = {
    id: 'enemy',
    name: 'Slow Enemy',
    hp: 100,
    maxHp: 100,
    qi: 50,
    maxQi: 50,
    ap: 5,
    maxAp: 5,
    stats: { atk: 10, def: 10, speed: 5 },
    techniques: DEFAULT_TECHNIQUES,
    buffs: [],
    debuffs: []
  };

  const combatSystem = new CombatSystem(fastPlayer, [slowEnemy], mockGameStore, mockGameStore.rivalSystem, { type: 'normal' });
  const fleeSuccess = combatSystem.flee();
  console.log(`  Flee attempt: ${fleeSuccess ? 'Success' : 'Failed'}`);

  // Test zero stats (shouldn't crash)
  console.log('Testing zero stats:');
  const zeroStatsPlayer = {
    id: 'player',
    name: 'Zero Stats Player',
    hp: 1,
    maxHp: 1,
    qi: 0,
    maxQi: 0,
    ap: 1,
    maxAp: 1,
    stats: { atk: 0, def: 0, speed: 0 },
    techniques: DEFAULT_TECHNIQUES,
    buffs: [],
    debuffs: []
  };

  try {
    const zeroCombat = new CombatSystem(zeroStatsPlayer, [slowEnemy], mockGameStore, mockGameStore.rivalSystem, { type: 'normal' });
    console.log(`  ✅ Zero stats handled without crash`);
  } catch (error) {
    console.log(`  ❌ Zero stats caused crash: ${error}`);
  }
}

// Run all balance tests
console.log('=== Game Balance Assessment Tests ===\n');

testDamageCalculationBalance();
testRealmScalingBalance();
testBuffDebuffBalance();
testCombatOutcomeBalance();
testEdgeCases();

console.log('\n=== Balance Assessment Complete ===');
console.log('Review the test results above for potential balance issues.');
console.log('Key areas to watch:');
console.log('- Damage calculations should be consistent');
console.log('- Stat scaling should provide meaningful progression without overwhelming power spikes');
console.log('- Buffs/debuffs should have noticeable but not game-breaking effects');
console.log('- Combat should remain engaging across different stat configurations');
console.log('- Edge cases should be handled gracefully');
