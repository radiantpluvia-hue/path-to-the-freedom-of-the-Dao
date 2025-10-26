```markdown
# Fix TypeScript Errors — prioritized action plan

Status: test/build blockers resolved (import.meta fix). Remaining type cleanup is medium priority and should be done conservatively.

Goal: remove confusing/legacy types (and a few literal mismatches) without changing runtime behavior. Each change must be covered by tests or a manual smoke check.

Top issues to fix (conservative, small steps):
1. Normalize legacy `player.realm` usages to `player.realmId` safely. Don't mass-replace; instead add a helper `getPlayerRealmId(player)` and update call sites to use it. This avoids runtime behavior changes when `realmId` is missing.
2. Fix isolated literal union mismatches (e.g., `'encounter'`) by inspecting usage and mapping to the intended union member. Prefer safe aliases (e.g., keep the original value but cast via a narrow helper) if intent is uncertain.
3. Add minimal smoke/unit tests around any helpers you change so future refactors are guarded.

Small-step implementation plan (3 quick PRs):
- PR 1 — Add helper and normalization shims (low risk)
  - Create `src/utils/playerHelpers.ts` exporting `getPlayerRealmId(player)` and `ensureRealmId(player)` (no runtime mutation unless explicitly requested).
  - Update 3–6 call sites in `src/store/useGameStore.ts`, `src/utils/realmHelpersLoader.ts`, and one or two other small utilities to use the helper.
  - Run `npm test` and ensure green. If a test fails, revert the specific change.

- PR 2 — Fix literal union mismatches
  - Search for failing TypeScript union errors (or the known literals in the TODO file). For each, inspect the call site and replace the literal with the correct union member or use a small mapping helper.
  - Add a one-line test for any change that affects public helper behavior.

- PR 3 — Clean up and small typings
  - Tighten a few `any` usages exposed during the sweep. Prefer `unknown` -> narrowed types in helper boundaries.

Verification steps (run locally):
```powershell
npm ci
npm run build:node
npm test --silent
```

Files most likely touched:
- `src/store/useGameStore.ts`
- `src/utils/realmHelpersLoader.ts` (or `src/utils/realmHelpers.ts`)
- `src/utils/evolutionUtils.ts`
- `src/utils/playerHelpers.ts` (new)

If you want I can start PR 1 (helper + 3–6 conservative call-site edits) now and run the tests. Say "start type fixes" to proceed.

```
# Fix TypeScript Errors (status updated)

This file tracked several TypeScript issues found earlier in `src/store/useGameStore.ts` and related utilities. Since the last changes in this session we've fixed a critical build blocker (usage of `import.meta` in `src/main.tsx`) and the project test suite currently passes. The remaining type issues are lower priority but should be cleaned up to avoid regressions.

## Known Issues (current):
1. Some code still references `state.player.realm` (legacy) instead of the normalized `state.player.realmId`. These occur in `useGameStore` and a few utility modules.
2. A few string-literal union mismatches were recorded previously (for example an `'encounter'` literal that doesn't match the allowed union). These are small and isolated.

## Recommended Plan & Next Steps:
- [ ] Sweep and normalize `player.realm` -> `player.realmId` usages. Prefer conservative fixes: where the value may be missing, use a safe accessor (e.g. `getPlayerRealmId(state)` helper) to avoid changing runtime behaviour.
- [ ] Replace invalid literal types (e.g. `'encounter'`) with the correct union member after confirming intent; prefer `'chance'` if the intent was a random encounter.
- [ ] Add a small unit test that imports `useGameStore` and performs a smoke-check of the affected helper(s) to guard future refactors.

## Files likely to edit:
- `src/store/useGameStore.ts` (primary)
- `src/utils/realmHelpers.ts` (or similar helper files)
- `src/utils/evolutionUtils.ts`

Notes: I avoided automated mass-replacements in this pass to keep runtime behaviour stable. I can perform the conservative refactors and run the test suite in a follow-up change once you confirm you'd like me to proceed.
