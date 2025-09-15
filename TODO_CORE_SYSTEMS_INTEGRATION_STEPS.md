# Core Systems Integration Implementation Steps

## Information Gathered
- **useGameStore.ts**: Has robust rival system integration with methods like `adjustRivalRelationship`, `markRivalDefeated`, `startFactionBattle`, `canEncounterRival`, `recordRivalEncounter`, etc. Uses shared RivalSystem and SectFactionSystem instances.
- **RivalSystem.ts**: Comprehensive rival management with relationships, encounters, faction battles, AI archetypes, and a cooldown-aware `canEncounterRival(rivalId, currentDay)`.
- **CombatSystem.ts**: Applies rival mechanics and faction-based adjustments; has try/catch safeguards when adjusting faction standings during faction battle outcomes.
- **RivalInfoPanel.tsx**: Implemented UI component for displaying rival information (integration into GameInterface pending).

## Current Issues Identified
1. **Faction Battle Events Depth**: Need more comprehensive event hooks and varied outcomes.
2. **UI Integration**: RivalInfoPanel still needs to be fully integrated into GameInterface with faction standing displays.
3. **Combat Outcome Handling Depth**: Ensure reputation impacts are fully applied and visible across UI/store for all contexts.

## Status Summary
- **Resolved**: Removed dependency on any `window.gameStore` access within RivalSystem (none present).
- **Resolved**: Rival encounter cooldown logic implemented and used via store (`canEncounterRival`, `recordRivalEncounter`).
- **Resolved**: Store↔RivalSystem synchronization for relationships and lastEncounter timestamps.
- **Resolved**: Error handling around faction standing adjustments in CombatSystem outcome processing.

## Plan

### Phase 1: Fix Synchronization Issues
- [x] Remove window.gameStore dependency in RivalSystem.ts
- [x] Improve state synchronization between RivalSystem and useGameStore
- [x] Add proper error handling for faction adjustments in CombatSystem
- [x] Fix any missing rival encounter cooldown logic

### Phase 2: Complete Combat System Integration
- [ ] Verify faction-based battle mechanics work correctly (add unit/integration tests)
- [ ] Test rival-specific AI behaviors in combat (personality-driven choices)
- [ ] Ensure reputation impact mechanics function properly and persist
- [ ] Add missing faction context display during combat (UI hooks)

### Phase 3: UI Components Integration
- [ ] Integrate RivalInfoPanel into GameInterface
- [ ] Add faction relationship display to GameInterface
- [ ] Create faction reputation visualization component
- [ ] Add faction battle outcomes display

### Phase 4: Faction Battle Event System
- [ ] Implement faction-specific battle events
- [ ] Add reputation impact scenarios
- [ ] Create betrayal mission system
- [ ] Add faction service access based on standing

## Dependent Files to Edit
- `src/store/useGameStore.ts` - Expose any remaining getters for UI, wire UI actions (combat context, faction deltas)
- `src/systems/CombatSystem.ts` - Surface computed reputation deltas for UI, ensure consistency across outcomes
- `src/components/game/GameInterface.tsx` - Integrate RivalInfoPanel and faction displays
- `src/components/info/RivalInfoPanel.tsx` - Minor updates if needed
- New component: `src/components/info/FactionStandingPanel.tsx`

## Followup Steps
- [ ] Test all rival encounter scenarios, including cooldown edge cases
- [ ] Verify faction battle mechanics with multiple outcomes
- [ ] Test reputation impact systems across UI/store persistence
- [ ] Validate UI components integration end-to-end
- [ ] Run comprehensive integration tests of all systems