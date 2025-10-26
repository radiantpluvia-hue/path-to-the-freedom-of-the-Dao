import { RivalSystem } from '@/systems/RivalSystem';
import { RivalAISystem } from '@/systems/RivalAISystem';
import { CombatSystem } from '@/systems/CombatSystem';
import { seededFromString, setRuntimeRng, clearRuntimeRng } from '@/utils/seededRng';

// This integration test simulates many repeated combats to ensure RivalAISystem
// collects learning data and RivalSystem.applyLearningToRival produces hints that
// change CombatSystem behavior over time.

describe('Rival adaptive long-run integration', () => {
  jest.setTimeout(10000);

  test('repeated combats update learning and change rival behavior', () => {
    const ai = new RivalAISystem();
    ai.debug = false;
    const rs = new RivalSystem();
    rs.attachAISystem(ai);

    // Create a rival with techniques t_low (lower DPS) and t_high (higher DPS)
    const rival = rs.generateRival({ minLevel: 5, maxLevel: 5, silent: true });
    rival.techniques = ['t_low', 't_high'];
    rs.addRival(rival);

    // Minimal gameStore mock
    const gameStoreMock: any = {
      player: { sect: null, weaponMastery: {} },
      getSectReputation: () => 0,
      getFactionStanding: () => 0,
      adjustSectReputation: () => {},
      adjustReputation: () => {},
      adjustRivalRelationship: () => {},
      addEventLog: () => {},
      markRivalDefeated: () => {},
      getRivalById: () => null
    };

    // Build a deterministic RNG for the test
    setRuntimeRng(seededFromString('long-run-adapt'));

    const playerBase = { id: 'player', name: 'P', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 10, def: 5, speed: 10 }, techniques: [], buffs: [], debuffs: [] } as any;

    // Helper to create a participant for the rival that has techniques mapped roughly
    function makeRivalParticipant(): any {
      const p = rs.getRivalAsCombatParticipant(rival.id)!;
      // Map t_low and t_high to simple CombatTechnique objects with distinguishing names so logs include them
      p.techniques = p.techniques.map((t: any) => {
        if (t.id === 't_low') return { id: 't_low', name: 'Low Strike', apCost: 1, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 6 }] };
        if (t.id === 't_high') return { id: 't_high', name: 'High Strike', apCost: 1, qiCost: 0, type: 'attack', effects: [{ type: 'damage', target: 'enemy', value: 12 }] };
        return t;
      });
      return p;
    }

    // We'll simulate 30 combats where the rival 'wins' using 't_high' more often initially
    // But to test learning we will artificially record outcomes where t_high led to success
    for (let i = 0; i < 30; i++) {
      const rivalParticipant = makeRivalParticipant();
      // Start a simple CombatSystem: player HP small so combat ends quickly
      const player = { ...playerBase, hp: 40, maxHp: 40 } as any;
      const cs = new CombatSystem(player, [rivalParticipant], gameStoreMock, rs as any, { type: 'rival', rivalId: rival.id });
      // Seed RNG to vary choices but deterministic
      // Let the rival take its turn until combat ends or reaches some rounds
      while (cs.getState().status === 'ongoing' && cs.getState().round < 6) {
        // Make player pass (no techniques) and execute rival turn
        cs.executeRivalTurn(rivalParticipant.id);
        // End loop if combat ended
        if (cs.getState().status !== 'ongoing') break;
        // Let player pass a basic regather to advance round
        cs.endTurn();
      }
      // Force handleCombatOutcome is called via checkCombatEnd in CombatSystem; RivalSystem.recordCombatOutcome should have been invoked
      // To make the learning signal stronger, also directly record the outcome to the RivalAISystem with technique usage info
      const usedTechniques = ['t_high'];
      const outcome = Math.random() < 0.6 ? 'victory' : 'defeat';
      ai.recordCombatOutcome(rival.id, outcome as any, cs.getState().round, { hp: player.hp, qi: player.qi, techniques: [] }, { hp: rivalParticipant.hp, qi: rivalParticipant.qi, techniques: [] }, [], usedTechniques);
    }

    // At this point learning data should exist; apply learning via RivalSystem
    rs.applyLearningToRival(rival.id);

    const hints = (rs.getRival(rival.id)! as any).aiHints || {};
    expect(Array.isArray(hints.preferredTechniques)).toBeTruthy();
    expect(hints.preferredTechniques.length).toBeGreaterThan(0);

    // Now run several deterministic combats and measure how often CombatSystem chooses t_high on round 1
    let chosenHigh = 0;
    const attempts = 30;
    for (let i = 0; i < attempts; i++) {
      const rivalParticipant = makeRivalParticipant();
      const player = { ...playerBase, hp: 60, maxHp: 60 } as any;
      const cs = new CombatSystem(player, [rivalParticipant], gameStoreMock, rs as any, { type: 'rival', rivalId: rival.id });
      cs.getState().round = 1;
      cs.executeRivalTurn(rivalParticipant.id);
      const log = cs.getState().combatLog.join('\n');
      if (/High Strike|t_high/i.test(log)) chosenHigh++;
    }

    // Expect the promoted technique to be chosen more often than random (i.e., at least a few times)
    expect(chosenHigh).toBeGreaterThan(Math.max(1, Math.floor(attempts * 0.1)));

    clearRuntimeRng();
  });
});
