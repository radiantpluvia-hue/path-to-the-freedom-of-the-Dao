
# UI Fixes - Character Creation & Tooltip Improvements

## Phase 1: CharacterCreation Component Update ✅ COMPLETED
- [x] Add proper styling using theme variables
- [x] Implement complete character creation form
- [x] Add background selection functionality
- [x] Add proper form validation
- [x] Implement transition to game screen
- [x] Add responsive design

Notes: The `CharacterCreation` component work is complete and wired into the store. A richer tooltip component (`src/components/ui/RichTooltip.tsx`) was added and integrated into `CharacterCreation` and multiple other UI components to replace native `title` attributes.

## Phase 2: Tooltip / Title Replacement (In progress)
- [x] Add `RichTooltip` component and wire into key UI areas (CharacterCreation, GameInterface, TopBar, CharacterPanel)
- [ ] Finish replacing remaining `title` attributes across the app with `RichTooltip` or `aria-label` fallbacks. Target components: `Icon`, `InventoryPanel`, `FormationSelector`, `DomainPanel`, `LifeNovelModal`, and any remaining small controls.
- [ ] Add accessibility attributes (aria-describedby) where `RichTooltip` provides context for screen readers.

Actionable sweep plan (conservative):
1. Batch size: 3–5 files per patch. For each batch:
	- Search the file for native DOM `title` attributes (not component `title` props).
	- If a `title` is used by tests/scripts (e.g., `getByTitle` or `button[title="Inventory"]`), preserve the `title` but add a `RichTooltip`/aria-label as appropriate and note the dependency so tests/scripts can be migrated later.
	- For icon-only buttons, prefer `aria-label` + sr-only text. For multi-line help text, wrap with `RichTooltip`.
	- Run `npm test` and verify no regressions; if a test fails, revert the specific change and mark that title as protected.

2. Suggested next batch (safe candidates):
	- `src/components/tutorial/TutorialOverlay.tsx` — close button (aria-label) — already applied.
	- `src/components/info/RivalInfoPanel.tsx` — close button (aria-label) — already applied.
	- `src/components/ui/Icon.tsx` — already emits sr-only text for alt; verify and adjust if needed.
	- `src/components/game/InventoryPanel.tsx` — inventory rows use `RichTooltip` already; ensure no lingering `title` attributes.
	- `src/components/game/CharacterCreation.tsx` — already uses `RichTooltip` for backgrounds.

Verification commands (run locally after a batch):
```powershell
npm test --silent
```

Notes: The plan favors preserving titles that external scripts/tests rely on until those can be migrated. If you'd like me to both update titles and migrate dependent tests/scripts in the same pass, say so and I'll include the test edits as part of the batch.

## Phase 3: GameInterface Improvements
- [ ] Make layout responsive
- [ ] Add error handling for missing data
- [ ] Test complete flow

## Phase 4: Testing
- [ ] Test lore → creation → game flow (smoke)
- [ ] Test responsive design
- [ ] Verify all functionality works

Next steps: I can finish the remaining title replacements in an automated pass that uses conservative patterns (single-line tooltips -> `aria-label`, multi-line -> `RichTooltip`) and then run the full test suite to ensure no regressions. Confirm if you want me to proceed now.
