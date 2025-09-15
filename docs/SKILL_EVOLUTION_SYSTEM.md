# Skill Evolution System Documentation

## Overview

The Skill Evolution System allows players to evolve their basic skills into more specialized and powerful versions when they reach certain milestones (levels 5, 10, 15, 20, 25, and 30).

## Evolution Paths

Each base skill can evolve into one of two specialized paths:

### Weapon Mastery
- **Sword Qi**: Focuses on sword-based cultivation techniques
- **Spear Arts**: Specializes in spear and polearm techniques

### Alchemy
- **Pill Refining**: Advanced pill creation and refinement
- **Elixir Crafting**: Potion and elixir brewing expertise

### Comprehension
- **Cultivation Speed**: Enhances overall cultivation efficiency
- **Understanding Speed**: Improves learning and comprehension rates

### Qi Control
- **Qi Manipulation**: Fine control over spiritual energy
- **Spiritual Sense**: Enhanced perception and awareness

### Body Tempering
- **Iron Body**: Physical defense and resilience
- **Diamond Body**: Ultimate physical perfection

### Dao Insight
- **Dao Comprehension**: Deeper understanding of the Dao
- **Heavenly Insight**: Divine-level comprehension abilities

### Combat Skills
- **Martial Arts**: Traditional combat techniques
- **Battle Tactics**: Strategic combat planning

### Social Skills
- **Diplomacy**: Persuasion and negotiation
- **Intimidation**: Forceful influence and dominance

### Mental Fortitude
- **Mind Palace**: Mental organization and memory
- **Soul Defense**: Protection against mental attacks

### Spirit Beast Taming
- **Beast Communication**: Understanding and communicating with spirit beasts
- **Spirit Bonding**: Forming deep bonds with spirit companions

### Meditation
- **Deep Meditation**: Enhanced focus and concentration
- **Enlightenment**: Spiritual awakening and insight

### Forging
- **Artifact Crafting**: Creating powerful artifacts
- **Rune Inscription**: Adding magical properties to items

## How It Works

### Evolution Triggers
Evolution opportunities become available when a skill reaches levels: 5, 10, 15, 20, 25, or 30.

### Evolution Process
1. Player reaches an evolution milestone level
2. System logs available evolution paths in the event log
3. Player can choose to evolve using the `evolveSkill` method
4. Base skill is reset to level 0
5. Evolved skill is created at level 1 with increased EXP requirements

### API Methods

#### `gainSkillExp(skillId: string, exp: number)`
- Adds experience to a skill
- Automatically checks for evolution opportunities at milestone levels
- Logs evolution options in the event log

#### `evolveSkill(baseSkillId: string, evolutionPath: string)`
- Evolves a base skill into a specialized path
- Validates the evolution path is available
- Resets base skill and creates evolved skill
- Logs the evolution result

## Usage Examples

```typescript
// Add experience to trigger evolution check
gainSkillExp('weaponMastery', 500);

// Evolve when ready
evolveSkill('weaponMastery', 'Sword Qi');
```

## Evolution Benefits

- **Specialization**: Evolved skills provide more focused benefits
- **Power Boost**: Evolved skills start with higher base effectiveness
- **Progression**: Opens up new gameplay options and content
- **Strategic Depth**: Players must choose evolution paths that match their playstyle

## Balance Considerations

- Base skills are reset to level 0 after evolution
- Evolved skills require more EXP to level up (1.2x base requirement)
- Players can only evolve each skill once per milestone
- Evolution choices are permanent (cannot be reversed)

## Future Enhancements

- Multiple evolution tiers (further specializations)
- Evolution requirements beyond just level (items, quests, etc.)
- Evolution trees with branching paths
- Hybrid evolution options
- Evolution-specific bonuses and abilities
