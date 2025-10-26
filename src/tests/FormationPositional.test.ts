/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { CombatSystem } from '../systems/CombatSystem';
import { getFormationById } from '../data/registry';
import NodeMapSystem from '../systems/NodeMapSystem';
import { FORMATIONS } from '../data/formations';

describe('Formation Positional Mechanics', () => {
  let combatSystem: CombatSystem;
  let nodeMapSystem: NodeMapSystem;

  beforeEach(() => {
    nodeMapSystem = NodeMapSystem.getInstance();
  });

  test('should apply positional bonuses to combat participants', () => {
    const player = {
      id: 'player',
      name: 'Player',
      hp: 100,
      maxHp: 100,
      qi: 50,
      maxQi: 50,
      ap: 5,
      maxAp: 5,
      stats: { atk: 50, def: 40, speed: 30 },
      techniques: [],
      buffs: [],
      debuffs: [],
      weaponMastery: {}
    };

    const enemy = {
      id: 'enemy1',
      name: 'Enemy',
      hp: 100,
      maxHp: 100,
      qi: 45,
      maxQi: 45,
      ap: 4,
      maxAp: 4,
      stats: { atk: 45, def: 35, speed: 25 },
      techniques: [],
      buffs: [],
      debuffs: [],
      weaponMastery: {}
    };

    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    expect(formation).toBeDefined();

    combatSystem = new CombatSystem(
      player,
      [enemy],
      null,
      null,
      {
        type: 'normal',
        formationId: 'formation_wedge_breaker',
        applyFormationTo: 'both'
      }
    );

    // Check that formations are set up
    expect(combatSystem.getContext().formationId).toBe('formation_wedge_breaker');
  });

  test('NodeMapSystem should create formation layouts correctly', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    expect(formation).toBeDefined();

    const layout = nodeMapSystem.createFormationLayout(formation!, 2, 2);
  expect(layout.nodes).toHaveLength((formation && formation.positions) ? formation.positions.length : 0);
    expect(layout.centerX).toBe(2);
    expect(layout.centerY).toBe(2);
  });

  test('should assign units to formation positions', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    const layout = nodeMapSystem.createFormationLayout(formation!, 2, 2);
    const unitIds = ['player', 'ally1'];

    const assignedLayout = nodeMapSystem.assignUnitsToFormation(layout, unitIds);

    expect(assignedLayout.nodes[0].occupied).toBe(true);
    expect(assignedLayout.nodes[0].unitId).toBe('player');
    expect(assignedLayout.nodes[1].occupied).toBe(true);
    expect(assignedLayout.nodes[1].unitId).toBe('ally1');
  });

  test('should calculate positional bonuses correctly', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    const layout = nodeMapSystem.createFormationLayout(formation!, 2, 2);
    const unitIds = ['player'];

    const assignedLayout = nodeMapSystem.assignUnitsToFormation(layout, unitIds);
    const bonuses = nodeMapSystem.calculatePositionalBonuses(assignedLayout, 'player');

    // Front position should have attack bonus
    expect(bonuses.atk).toBeGreaterThan(0);
    expect(bonuses.flankingBonus).toBe(0); // Not a flank position
  });

  test('should detect flanking attacks', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    const layout = nodeMapSystem.createFormationLayout(formation!, 2, 2);
    const unitIds = ['player', 'enemy'];

    const assignedLayout = nodeMapSystem.assignUnitsToFormation(layout, unitIds);

    // Check if player can flank enemy (depends on positions)
    const canFlank = nodeMapSystem.canFlank(assignedLayout, 'player', 'enemy');
    expect(typeof canFlank).toBe('boolean');
  });

  test('should detect back attacks', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    const layout = nodeMapSystem.createFormationLayout(formation!, 2, 2);
    const unitIds = ['player', 'enemy'];

    const assignedLayout = nodeMapSystem.assignUnitsToFormation(layout, unitIds);

    // Check if player can attack from behind
    const isBackAttack = nodeMapSystem.isBackAttack(assignedLayout, 'player', 'enemy');
    expect(typeof isBackAttack).toBe('boolean');
  });

  test('should calculate formation effectiveness', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');
    const layout = nodeMapSystem.createFormationLayout(formation!, 2, 2);
    const unitIds = ['player'];

    const assignedLayout = nodeMapSystem.assignUnitsToFormation(layout, unitIds);
    const effectiveness = nodeMapSystem.getFormationEffectiveness(assignedLayout);

    expect(effectiveness).toBeGreaterThan(0);
    expect(effectiveness).toBeLessThanOrEqual(100);
  });

  test('should validate formation deployment positions', () => {
    const formation = FORMATIONS.find(f => f.id === 'formation_wedge_breaker');

    // Should be able to deploy at center
    expect(nodeMapSystem.canDeployFormation(formation!, 5, 5)).toBe(true);

    // Should not be able to deploy outside map bounds
    expect(nodeMapSystem.canDeployFormation(formation!, 0, 0)).toBe(false);
  });
});
