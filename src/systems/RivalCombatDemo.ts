import { CombatSystem, DEFAULT_TECHNIQUES } from './CombatSystem';
import { getRng } from '../utils/rng';
import { logger } from '../utils/logger';
import { SectFactionSystem } from './SectSystem';
import { RivalSystem } from './RivalSystem';

// Demo function to show rival combat integration
export function demonstrateRivalCombat() {
  logger.info('=== Rival Combat System Demo ===');
  
  // Create sect system with actual rival system
  const sectSystem = new SectFactionSystem(new RivalSystem());
  
  // Create player character
  const player = {
    id: 'player',
    name: 'Player Cultivator',
    hp: 100,
    maxHp: 100,
    qi: 50,
    maxQi: 50,
    ap: 3,
    maxAp: 3,
    stats: {
      atk: 15,
      def: 10,
      speed: 12
    },
    techniques: [...DEFAULT_TECHNIQUES],
    buffs: [],
    debuffs: []
  };

  // Generate a rival from Azure Cloud Sect
  const rival = sectSystem.generateRivalFromSect('azure_cloud_sect', 5);
  if (!rival) {
    logger.warn('Failed to generate rival');
    return;
  }

  // Create rival combat participant
  const rivalParticipant = {
    id: 'rival_1',
    name: rival.name,
    hp: rival.stats.hp,
    maxHp: rival.stats.hp,
    qi: rival.stats.qi,
    maxQi: rival.stats.qi,
    ap: 3,
    maxAp: 3,
    stats: {
      atk: rival.stats.atk,
      def: rival.stats.def,
      speed: rival.stats.speed
    },
    techniques: rival.techniques.map((techId: string) => 
      DEFAULT_TECHNIQUES.find(t => t.id === techId) || DEFAULT_TECHNIQUES[0]
    ),
    buffs: [],
    debuffs: []
  };

  // Create mock game store and rival system for demo
  const mockGameStore = {
    player: player,
    rivalSystem: {
      getRival: () => null,
      getAllRivals: () => [],
      getRivalsByFaction: () => [],
      getRivalsBySect: () => [],
      updateRivalRelationship: () => { void 0; },
      markRivalDefeated: () => { void 0; },
      addRivalEncounter: () => 'encounter_1',
      getRivalEncounters: () => [],
      startFactionBattle: () => 'battle_1',
      resolveFactionBattle: () => { void 0; },
      getFactionBattles: () => [],
      canEncounterRival: () => true,
      getRivalAsCombatParticipant: () => rivalParticipant
    }
  };

  // Create combat with rival context
  const combatSystem = new CombatSystem(player, [rivalParticipant], mockGameStore, mockGameStore.rivalSystem, {
    type: 'rival',
    rivalId: 'azure_cloud_disciple_1'
  });

  logger.info('Rival combat initiated!');
  logger.info(`Player: ${player.name}`);
  logger.info(`Rival: ${rivalParticipant.name}`);
  logger.info(`Rival Level: ${rival.level}`);
  logger.info(`Rival Techniques: ${rival.techniques.join(', ')}`);

  // Simulate a few combat turns
  for (let i = 0; i < 3; i++) {
    if (combatSystem.getState().status !== 'ongoing') break;
    
    const current = combatSystem.getCurrentParticipant();
    if (current && current.id === 'player') {
      // Player uses basic attack
      combatSystem.useTechnique('player', 'basic_attack', 'rival_1');
    } else if (current) {
      // Rival uses random technique
      const availableTechs = combatSystem.getAvailableTechniques(current.id);
      if (availableTechs.length > 0) {
        const rng = getRng(mockGameStore);
        const randomTech = availableTechs[Math.floor(rng() * availableTechs.length)];
        combatSystem.useTechnique(current.id, randomTech.id, 'player');
      }
    }
    
    combatSystem.endTurn();
  }

  const combatState = combatSystem.getState();
  logger.info('\nCombat Log:');
  combatState.combatLog.forEach(log => logger.info(log));
  
  logger.info('\nFinal Combat Status:', combatState.status);
  
  // Show reputation impact (would be handled by game store in real implementation)
  if (combatState.status === 'victory') {
    logger.info('Player defeated rival! Reputation with Azure Cloud Sect increased.');
    sectSystem.adjustSectReputation('azure_cloud_sect', 15);
  } else if (combatState.status === 'defeat') {
    logger.info('Player was defeated by rival! Reputation with Azure Cloud Sect decreased.');
    sectSystem.adjustSectReputation('azure_cloud_sect', -10);
  }
}

// Run demo if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  demonstrateRivalCombat();
}
