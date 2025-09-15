# Finalization Scope for Game Core

This document defines the scope, acceptance criteria, and actionable tasks to "finalize" the core of the Xianxia game (mechanics, story, lore, races, battle mechanics, NPCs, cultivation).

Scope
- Combat & Battle Mechanics: deterministic combat core, passive/buff system, faction adjustments, and stable combat result model.
- Cultivation & Progression: realms, breakthrough checks, cultivation speed, physique/bloodline effects.
- Mentors & Teaching: mentors data, teaching progression, runtime discovery, and UI wiring.
- Sects & Factions: sect registry, faction standing, reputation impacts in systems.
- Story & Lore Content: opening lore, act content, and NPC templates.
- Races & Bloodlines: canonical race definitions, physiologies, and unique effects.
- Testing: unit tests for each subsystem and integration tests covering core flows.

Acceptance Criteria (must all be satisfied for a release candidate):
1. Build: `npm run build` completes with exit code 0 and produces a `dist` folder.
2. Tests: `npm test` passes all suites locally.
3. Combat: deterministic combat simulation unit test for a 1v1 encounter passes and confirms expected outcome metrics (damage, AP changes, status effects).
4. Cultivation: tests for realm breakpoints and cultivation speed modifiers (physiques/bloodlines) exist and pass.
5. Mentors: mentors runtime merge returns curated mentors + immortal leaders; every mentor `unlocks` id exists in `ALL_SKILLS` and is tested.
6. Sects & Factions: `MAJOR_SECTS` includes configured sects; faction reputation impacts at least two systems (combat and rival generation) and is tested.
7. Story & Lore: opening lore loads without runtime errors and is referenced by the store.
8. Release artifacts: `CHANGELOG.md`, `FINALIZATION_SCOPE.md`, and `release` script exist; `release.zip` is produced when `npm run release` is run.

Priority implementation tasks (small and testable):
- Task A (High): Ensure build + tests: run `npm run build` and `npm test`. If build fails, fix TypeScript errors listed in `TODO_FIX_TYPE_ERRORS.md`.
- Task B (High): Combat smoke test: implement/verify a unit test `tests/combat.smoke.test.ts` that runs a canonical 1v1 simulation.
- Task C (High): Cultivation test: add `tests/cultivation.realm.test.ts` covering realm breakpoints and physique modifiers.
- Task D (High): Mentors QA: run `src/tests/immortalLeadersDiscovery.test.ts`, add coverage for mentor teaching progression lookup.
- Task E (Medium): Sects & Factions: verify `src/systems/SectSystem.ts` includes all MAJOR_SECTS and add tests for reputation impact.
- Task F (Medium): Lore test: add a test that loads `TAI_YUNG_OPENING_LORE` from the store and asserts expected sections.
- Task G (Low): Create a `RELEASE_NOTES.md` summarizing content included in this release.

Implementation notes
- Keep curated data files unchanged. Additive changes should be in separate `src/data/*` files and merged at runtime when necessary.
- All new behaviors must include unit tests and small integration tests.
- Use existing test infra (Jest) and match repository lint/tsconfig rules.

How I'll work next
1. Finish scanning `TODO_*.md` files and convert top items into actionable tasks (I will do this iteratively).
2. Run `npm run build` and `npm test` to surface TypeScript/build issues and prioritize `TODO_FIX_TYPE_ERRORS.md` items.
3. Implement the highest priority tests/fixes (Task A, B, C, D) and iterate until passing.

If this scope looks good, I'll proceed to run `npm run build` and then `npm test` to see the current build status and compile errors (if any).