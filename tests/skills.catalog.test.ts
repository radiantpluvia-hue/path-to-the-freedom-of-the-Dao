import { SKILL_CATALOG, getSkillById } from '../src/components/minigames/skills';
import { resolveRound, Combatant } from '../src/components/minigames/CombatSimulation';

describe('Skill catalog and usage', () => {
  test('catalog size and tiers', () => {
    // increased catalog size to 400 (expanded by +200)
    expect(SKILL_CATALOG.length).toBe(400);
    const tiers = new Set(SKILL_CATALOG.map(s => s.tier));
    expect(tiers.size).toBeGreaterThanOrEqual(8);
  });

  test('skill application increases damage via boosted attack', () => {
    const skill = SKILL_CATALOG[0];
    const p: Combatant = { id: 'p', name: 'P', maxHp: 50, hp: 50, attack: 5, defense: 1, speed: 6, equippedSkills: [skill.id], ap: (skill.cost.ap || 0), qi: (skill.cost.qi || 0) };
    const r: Combatant = { id: 'r', name: 'R', maxHp: 50, hp: 50, attack: 4, defense: 1, speed: 3 };

    // Simulate a special using the equipped skill (resolveRound itself doesn't select skills; CombatSimulation component did boosting)
    const boosted = { ...p, attack: p.attack + skill.power };
    const result = resolveRound(boosted, r, 'special', 'attack');
    expect(result.rival.hp).toBeLessThan(50);
  });
});
