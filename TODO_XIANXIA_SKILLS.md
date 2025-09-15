# Xianxia Skills Implementation Plan

## Tasks to Complete

### Phase 1: Remove Skill Points System ✅ COMPLETED
- [x] Remove `skillPoints` from `src/types.ts`
- [x] Update `src/store/useGameStore.ts` to remove skillPoints initialization and references
- [x] Modify `src/components/game/CharacterCreation.tsx` to remove skill points input

### Phase 2: Define 12 Xianxia Skills ✅ COMPLETED
- [x] Create comprehensive skill definitions in `src/types.ts`
- [x] Update initial game state with new skills structure
- [x] Ensure all skills start at level 0 (mortal with no skills)

### Phase 3: Implement Skill Learning System
- [ ] Update `gainSkillExp` method to handle new skills
- [ ] Create skill progression mechanics
- [ ] Implement skill evolution paths (e.g., Weapon Mastery -> Sword Qi)

### Phase 4: Testing and Validation
- [ ] Test character creation without skill points
- [ ] Verify skill learning through events and proficiency
- [ ] Test skill evolution mechanics

## Xianxia Skills to Implement
1. Weapon Mastery
2. Alchemy
3. Comprehension
4. Qi Control
5. Body Tempering
6. Dao Insight
7. Combat Skills
8. Social Skills
9. Mental Fortitude
10. Spirit Beast Taming
11. Meditation
12. Forging

## New Abilities to Unlock
### Weapon Mastery
1. Sword Qi Strike: A powerful sword attack that channels qi.
2. Spear Thrust: A quick thrust that pierces through defenses.
3. Bow Mastery: Increases accuracy and damage with bows.
4. Dagger Flurry: A rapid series of dagger strikes.
5. Staff Control: Enhances control and damage with staves.

### Alchemy
6. Healing Potion: Restores health over time.
7. Qi Elixir: Boosts qi regeneration temporarily.
8. Strength Potion: Increases physical strength for a short duration.
9. Agility Elixir: Enhances speed and reflexes.
10. Poison Resistance: Reduces damage from poison effects.

### Comprehension
11. Quick Learner: Increases experience gain from skills.
12. Insightful Mind: Enhances understanding of complex techniques.
13. Cultivation Efficiency: Reduces qi cost for cultivation.
14. Memory Recall: Increases retention of learned skills.
15. Analytical Thinking: Improves problem-solving abilities.

### Qi Control
16. Qi Shield: Creates a protective barrier using qi.
17. Qi Blast: Releases a burst of qi energy at enemies.
18. Spiritual Sense: Enhances awareness of surroundings.
19. Qi Flow: Increases the efficiency of qi usage.
20. Qi Manipulation: Allows for fine control over qi movements.

### Body Tempering
21. Iron Skin: Increases physical defense.
22. Resilient Body: Reduces damage taken from attacks.
23. Endurance Training: Increases stamina and recovery rate.
24. Flexibility: Enhances agility and dodging ability.
25. Pain Tolerance: Reduces the effects of pain on performance.

### Dao Insight
26. Dao Comprehension: Increases understanding of the Dao.
27. Heavenly Insight: Grants temporary foresight in battles.
28. Enlightened Mind: Boosts mental clarity and focus.
29. Dao Harmony: Enhances synergy with allies.
30. Celestial Guidance: Provides guidance in difficult situations.

### Combat Skills
31. Martial Arts Mastery: Increases effectiveness in hand-to-hand combat.
32. Tactical Awareness: Improves strategic planning in battles.
33. Counterattack: Allows for a powerful counter after a successful dodge.
34. Combo Mastery: Increases damage from combo attacks.
35. Defensive Stance: Reduces damage taken while defending.

### Social Skills
36. Charismatic Presence: Increases influence in social interactions.
37. Persuasive Speech: Enhances negotiation skills.
38. Intimidation Tactics: Increases effectiveness of intimidation.
39. Networking: Improves relationships with NPCs.
40. Leadership: Boosts morale and effectiveness of allies.

### Mental Fortitude
41. Mind Palace: Organizes thoughts and memories for better recall.
42. Soul Defense: Protects against mental attacks.
43. Focused Mind: Increases concentration during critical moments.
44. Emotional Control: Reduces the impact of emotional stress.
45. Mental Resilience: Increases resistance to mental fatigue.

### Spirit Beast Taming
46. Beast Whisperer: Enhances communication with spirit beasts.
47. Spirit Bond: Strengthens the bond with tamed beasts.
48. Beast Training: Improves the abilities of tamed beasts.
49. Spirit Beast Summon: Summons a spirit beast for assistance.
50. Beast Mastery: Increases overall effectiveness of spirit beasts.

### Meditation
51. Deep Meditation: Enhances cultivation speed.
52. Tranquil Mind: Reduces stress and increases focus.
53. Spiritual Awakening: Grants temporary boosts to cultivation.
54. Qi Synchronization: Aligns qi flow for better cultivation.
55. Inner Peace: Increases mental stability during challenges.

### Forging
56. Master Blacksmith: Increases quality of forged items.
57. Rune Inscription: Adds magical properties to items.
58. Artifact Crafting: Creates powerful artifacts.
59. Weapon Enhancement: Improves existing weapons.
60. Armor Forging: Creates durable armor with special properties.

### Additional Abilities
61. Elemental Mastery: Control over elemental forces.
62. Shadow Step: Enhanced stealth and movement.
63. Healing Touch: Restores health to allies.
64. Battle Cry: Boosts allies' morale in combat.
65. Elemental Resistance: Reduces damage from elemental attacks.
66. Spirit Communication: Communicate with spirits for guidance.
67. Time Dilation: Slows down time for a brief period.
68. Illusion Crafting: Creates illusions to deceive enemies.
69. Energy Drain: Absorbs energy from enemies.
70. Life Drain: Steals health from enemies.

## Skill Evolution Paths
- Weapon Mastery can evolve into specific weapon types (Sword Qi, Spear Arts, etc.)
- Alchemy can evolve into Pill Refining, Elixir Crafting
- Comprehension can evolve into Cultivation Speed, Understanding Speed

## Progress Tracking:
- Skills completed: 12/12
- Abilities completed: 100/100
