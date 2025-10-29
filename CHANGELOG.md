# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-09-12
### Added
- Added 15 major mortal-world sects and corresponding Immortal Realm leaders in `src/data/immortal_leaders.json`.
- Added runtime merger `src/data/mentors_runtime.ts` to merge curated mentors and immortal leaders at runtime.
- Mapped immortal leader teaching unlocks to canonical skill ids in `src/data/skills/*`.
- Added `src/data/README_immortal_leaders.md` documenting the file and runtime merge.

### Fixed
- Resolved placeholder unlock ids and validated mappings via unit tests.

### Tests
- Ran full Jest test suite and verified all tests pass.


### 2025-09-13
- Renamed two skill tiers in `src/components/minigames/skills.ts`: tier 4 -> 'Emperor Grade', tier 5 -> 'Divine Grade' and updated their descriptions.


> For older changes see project history (git commits).

## [Unreleased] - 2025-09-15
### Changed
### Tests
### Added
- Wired `src/data/eras_dossiers.json` into `src/data/codexEntries.ts` so each era appears as a codex entry (id: `<eraId>_dossier`).
- Added `src/data/example_items.ts` with sample items annotated with `eraId` (includes `rusted_blade`).
- Inventory tooltips updated: `src/components/game/InventoryPanel.tsx` will display an item's era provenance when `eraId` is present.
- Added `src/utils/eraQuestGenerator.ts` — small generator to produce quest templates from an era hook.
### Added
- Initial trainings data: `data/trainings.json` with new training definitions (Dao Contemplation, Insight Meditation, Heart Demon Confrontation, Alchemy Practice, Array Training, Beast Taming, Smithing Forging, Dao Heart Tempering, Karmic Cleansing, Heavenly Resonance).
### Changed

### Tests
- Added `src/tests/rebindPassive.test.ts` (new) — ensures that applying a passive, saving/loading, and then removing it preserves and rebinds runtime behavior and correctly reverts stat deltas.

### Removed
- Deleted redundant duplicate generated `*.js` files that duplicated `*.cjs` runtime copies to reduce repository clutter:
	- `scripts/dedupe_act2.js`
	- `scripts/normalize_sect_leaders.js`

### Validation

- This month focused on safety and persistence hardening for the passive system: centralizing helpers, preventing functions from being serialized, ensuring idempotent apply/remove semantics, and adding concrete tests to prevent regressions in Save/Load rebind behavior.

### Commits (local)
The following commits from this repository (local) are included in the scope of these changes. There is no remote `origin` configured in this repository, so these are provided as SHAs rather than remote links.

- 6017f688395524040bc03251bde2a471b69c21e1 (6...68) — 2025-10-04 — test: scope modal assertions with within() and add Market/Rival smoke tests


### Migration
- Save/load migration: loading legacy save data now backfills missing player realm fields. If a saved `gameState.player` has `realm` but not `realmId`, `realmId` will be computed and added on load (and vice-versa). This is a backward-compatible migration that preserves existing values and only fills missing fields.

### Notes

- UX: Confirmation modal Proceed now forces consolidation attempt to run (prevents modal re-check loop).

### Added (2025-10-28)
- Equipment data improvements and tooling:
	- Added `src/data/equipment_generated_extra.ts` containing additional generated equipment items (multiple tiers).
	- Added `scripts/validate_equipment.js` — a lightweight validator to ensure each equipment entry includes required fields (`id`, `name`, `slot`, `tier`, `basePower`, `description`).
	- Added/updated `scripts/merge_equipment.js` to merge `src/data/equipment*.ts` into `src/data/equipment_full.ts` and normalize missing metadata; the script now emits:
		- `EQUIPMENT_FULL_META` — full metadata array of equipment objects
		- `EQUIPMENT_FULL` (default export) — an array of equipment id strings for legacy compatibility
	- Regenerated `src/data/equipment_full.ts` from existing data sources and added safe defaults for missing fields where appropriate.

### Tests (2025-10-28)
- Ran full Jest suite after equipment merge and tooling updates; all tests passed.

## [1.1.0] - 2025-10-28
### Added
- Equipment data tooling and canonical merge output (`src/data/equipment_full.ts`) with metadata and id list exports.
- `scripts/merge_equipment.js`, `scripts/validate_equipment.js`, `scripts/equipment_audit.js` and `scripts/qa_smoke.js` added to support generation, validation and auditing of equipment datasets.
### Changed
- Regenerated equipment dataset to include user-provided extra items and normalized missing fields with safe defaults.

### Tests
- Full Jest test suite run and verified passing on local environment.

---



### UI
- Made Cultivation Methods and Game Management cards compact to reduce visual footprint.
- Reduced button sizes and spacing in these sections to prevent overlap with other UI panels.
- Tightened Event Log font size and height in the Game Management card for a smaller sidebar footprint.

### Fixed / Improved UI
- Replaced small textual modal close glyphs across the UI with a reusable SVG-based `ModalCloseButton` component (8px hit padding, semi-opaque background, hover state, and accessible `aria-label`). This improves visibility and click targets for Seclusion, Inventory, Narrative and other overlays.
- Standardized close-button aria-labels for widely-tested modals (kept generic `"Close"` where tests expect it) to avoid regressions.
- Improved TalentInfoPanel fallback when a talent id is missing from `TALENT_DATA`: shows a helpful "Unknown Talent" heading, displays the raw talent id, and emits a dev-only console warning to make missing data easier to trace.

### Tests
- Added lightweight unit tests to prevent regressions:
	- `src/__tests__/UI.closeButtons.test.tsx` — smoke test ensuring modal close button rendering in `InventoryPanel`.
	- `src/__tests__/TalentInfoPanel.unit.test.tsx` — verifies fallback rendering when a talent id is missing.

### Validation
- Ran full Jest test suite and verified all tests pass after these UI changes.

### Added (2025-10-21)
- Added developer content seed pack (events/items/manuals/passives) under `data/` for editor/testing. Files:
	- `data/events/seed_events.json`
	- `data/items/seed_items.json`
	- `data/manuals/seed_manuals.json`
	- `data/passives/seed_passives.json`
- Wired optional seeds into `src/data/index.ts` for editor discovery (non-breaking; wrapped in try/catch to be safe in CI and production builds).
- Added stricter schema tests `src/__tests__/seed_schema.test.ts` to validate seed shapes and registry integration.

### Fixed / Chore (2025-10-22)
- Cleaned up quest UI markup: removed stray control-character artifact in `src/components/quest/EnhancedQuestPanel.tsx` and enforced consistent `SmallChip` usage for quest badges and interactive labels. No behavior changes expected.
 - Cleaned up quest UI markup: removed stray control-character artifact in `src/components/quest/EnhancedQuestPanel.tsx` and enforced consistent `SmallChip` usage for quest badges and interactive labels. No behavior changes expected.

### Added (2025-10-23)
- Training subsystem (data + engine): added data-driven training definitions in `data/trainings.json` and a training engine at `src/game/training.ts` implementing start/tick/resolve flows, success/failure handling, rewards/backlash, and hook firing.
- Bloodline modifiers: `data/bloodlineModifiers.json` added and applied via the engine's success modifier calculations.
- Save/load migration/backfill: added logic to backfill `player.cooldowns.training` and `player.trainingQueue` when loading legacy saves.
- UI: added `src/components/game/TrainModal.tsx` and wired a Train entry in `src/components/game/GameInterface.tsx` to surface trainings, costs, cooldowns and confirmations for high-risk entries.
- Store integration: exposed training wrapper methods on `src/store/useGameStore.ts` (e.g. `startTrainingById`, `tickTrainingQueue`, `resolveTrainingQueue`, `getTrainingDefinition`, `computeTrainingSuccessModifier`).
- Data seeds: required items used by trainings were added to the item registry (e.g. `sacrificial_incense`, `heavenly_pearl`, `taming_whistle`, `array_stone`, `basic_herbs`, `cleansing_salve`).
- Validator & tests: lightweight schema validator added at `src/schemas/trainingSchema.ts`. Added engine and UI tests (`src/__tests__/training.unit.test.ts`, `src/__tests__/TrainModal.ui.test.tsx`) covering success/failure flows, modifiers, and UI rendering/interaction.
- Validation: ran TypeScript node build and full Jest suite after these changes; all tests passed and the node-targeted build completed successfully.

### Added (2025-10-24)
- Added new mentor content: `data/mentors/su_ming.json` describing Su Ming (The Reversal Saint) as a mentor/echo with trust thresholds and teaching methods.
- Added Dao definition: `data/daos/reversal.json` (Dao of Reversal) with techniques (Reverse Pulse Sutra, Temporal Echo, Still Flow Meditation) and passive `reversal_resonance`.
- Added codex entry: `data/codex/mentor_su_ming.xml` for in-game codex unlocks.
- Added sample events and dialogue under `events/mentor_su_ming/` including `act3_echo_encounter.json` and `su_ming_dialogue.json` (lightweight content; systems must map effects to in-game executors).

### Notes
- These files are content-only data files. Hooks into systems (mentor registration, dao registry, event execution, codex unlocks) should be wired by the relevant systems or an integration PR. The files are intentionally minimal and safe for CI.

