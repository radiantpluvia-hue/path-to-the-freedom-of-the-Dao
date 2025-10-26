# TODO Progress Tracking

## Priority 1: Critical Fixes (In Progress)
- [ ] Fix TypeScript Errors in `useGameStore.ts` and related utilities (see `TODO_FIX_TYPE_ERRORS.md`)
  - [ ] Sweep `player.realm` -> `player.realmId` usages conservatively and add defensive helpers where necessary
  - [ ] Replace invalid literal types (e.g. `'encounter'`) after confirming intent
  - [ ] Fix realm arithmetic in `evolutionUtils.ts` if it relies on the legacy `realm` value

- ## Priority 2: Rival System Integration
- [ ] Game Store Integration Fixes
  - [ ] Fix rival relationship management in useGameStore.ts
  - [ ] Ensure proper synchronization between RivalSystem and game store
  - [ ] Implement proper faction battle resolution mechanics
  - [ ] Add missing rival encounter cooldown logic
- [ ] UI Components Development
  - [ ] Create RivalInfoPanel component
  - [ ] Add faction relationship display to GameInterface
  - [ ] Enhance battle interface for faction context
- [ ] Testing & Polish
  - [ ] Test all rival encounter scenarios
  - [ ] Verify faction battle mechanics
  - [ ] Test reputation impact systems
  - [ ] Validate UI components

## Priority 3: Mentor Teaching System Enhancement
- [ ] Add Teaching Progression Data
  - [ ] Add progression data to all mentor JSON files in `src/data/mentor_teachings/`
  - [ ] Create teaching trees with proper prerequisites and connections
  - [ ] Implement mastery levels and cooldown systems
- [ ] Challenge Mini-Game Components (Already marked as complete in main TODO)
- [ ] Update MentorTeachingSystem.ts to handle new progression data
- [ ] Update UI components to display teaching progression

## Implementation Timeline
- **Phase 1 (Critical Fixes)**: 1 day (conservative sweep + tests)
- **Phase 2 (Rival Integration)**: 2-3 days
- **Phase 3 (Mentor Teaching)**: 2 days

**Total Estimated Time: 5-6 days**

Notes: The build-blocking issue related to `import.meta` in `src/main.tsx` was resolved during the previous session (replaced with a runtime/global check) and the Node/CJS build was regenerated successfully. The project's Jest test suite is currently green.
