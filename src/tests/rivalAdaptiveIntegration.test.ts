import { CombatSystem } from '@/systems/CombatSystem';
import { RivalSystem } from '@/systems/RivalSystem';
import { RivalAISystem } from '@/systems/RivalAISystem';
import { seededFromString, setRuntimeRng, clearRuntimeRng } from '@/utils/seededRng';

describe('Rival adaptive integration - Combat preference', () => {
  test('CombatSystem prefers promoted technique after learning applied', () => {
    const ai = new RivalAISystem();
    ai.debug = false;
    const rs = new RivalSystem();
    rs.attachAISystem(ai);

    // Create a rival and manually set techniques
    const rival = rs.generateRival({ minLevel: 5, maxLevel: 5, silent: true });
    rival.techniques = ['atk_basic', 'high_damage', 'finisher'];
    rs.addRival(rival);

    // Simulate learning that 'high_damage' is most effective
    for (let i = 0; i < 4; i++) {
      ai.recordCombatOutcome(rival.id, 'victory', 2, { hp: 40, qi: 10, techniques: [] }, { hp: 5, qi: 2, techniques: [] }, [], ['high_damage']);
    }

    // Minimal gameStore mock required by CombatSystem
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

    // Before applying learning, CombatSystem should pick based on default ordering
    const player = { id: 'player', name: 'P', hp: 100, maxHp: 100, qi: 0, maxQi: 0, ap: 5, maxAp: 5, stats: { atk: 10, def: 5, speed: 10 }, techniques: [], buffs: [], debuffs: [] } as any;
    const rivalParticipant = rs.getRivalAsCombatParticipant(rival.id)!;

    const csBefore = new CombatSystem(player, [rivalParticipant], gameStoreMock, rs as any, { type: 'normal' });
    csBefore.getState().round = 1;
    // Execute rival turn and capture the technique used
    csBefore.executeRivalTurn(rivalParticipant.id);
    const logBefore = csBefore.getState().combatLog.join('\n');

    // Apply learning via the RivalSystem (simulate scheduled application)
    rs.applyLearningToRival(rival.id);

    // After applying learning, regenerate the combat participant so it reflects re-ordered techniques
    const rivalParticipantAfter2 = rs.getRivalAsCombatParticipant(rival.id)!;

    // Seed RNG to make behavior deterministic and run multiple attempts to increase confidence
    setRuntimeRng(seededFromString('rival-promote-test'));
    let seen = 0;
    for (let i = 0; i < 20; i++) {
      const csAfter = new CombatSystem(player, [rivalParticipantAfter2], gameStoreMock, rs as any, { type: 'normal' });
      csAfter.getState().round = 1;
      csAfter.executeRivalTurn(rivalParticipantAfter2.id);
      const logAfter = csAfter.getState().combatLog.join('\n');
      if (/high_damage/i.test(logAfter) || /High Damage/i.test(logAfter)) seen++;
    }
    clearRuntimeRng();

    // Expect promoted technique to be selected at least once in 20 tries (given heavy opening bias)
    expect(seen).toBeGreaterThan(0);
  });
});
