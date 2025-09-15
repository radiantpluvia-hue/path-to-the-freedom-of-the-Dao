# Release Preparation TODO for Acts 1-4

## Phase 1: Critical Cleanup (1-2 days)
- [x] Delete deprecated system files (SectSystem_updated.ts, QuestSystem_updated.ts, SectMissionSystem_updated.ts)  <!-- archived in repo at `archive/deprecated_before_release/` -->
- [x] Consolidate duplicate Codex components (Codex_updated.tsx, CodexFinal.tsx, CodexFixed.tsx)  <!-- canonical wrapper `src/components/Codex.tsx` present; variants are archived -->
- [ ] Centralize combat scaling in combatConfig.ts with tests
- [ ] Fix state duplication between PlayerState/SystemState, consolidate mentor/teaching progress ownership

## Phase 2: Core Systems Integration (2-3 days)
- [ ] Implement daily loop system with resets and cooldowns
- [ ] Enhance save/load with migration helpers and validation
- [ ] Ensure rival system is fully integrated with game store and UI

## Phase 3: Testing & Validation (1-2 days)
- [x] Run tests (in-progress)
- [ ] Run validation scripts (mentors/executors)
- [ ] Execute smoke tests (runtime and compiled)
- [ ] Fix any test failures
- [ ] Manual playtest: Act 1 start, mentor unlocks, Act 4 events

## Phase 4: UI Polish & Release Prep (1-2 days)
- [ ] Add missing UI for buffs, crafting, market systems
- [ ] Modernize Codex and other components
  
### Codex consolidation decision

- Canonical implementation: `src/components/Codex.tsx` which re-exports the original `CodexModal` implementation (located at `CodexModal.tsx`).
- Migration: all UI imports should use `import { CodexModal } from '../Codex'` (or the correct relative path) instead of importing directly from `CodexModal.tsx` or variant copies. This reduces duplicate implementations and prevents divergent behavior.
- Rationale: The wrapper centralizes future changes and keeps the original `CodexModal` implementation intact for easier refactors.
- [ ] Update CHANGELOG.md and create RELEASE_NOTES.md
- [ ] Ensure build produces dist folder successfully
