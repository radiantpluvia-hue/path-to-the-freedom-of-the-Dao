# Multi-World Event Authoring & Diagnostics

This document explains how to author events that participate in the multi‑world + realm gating system, how ascension interacts with content availability, and how to use the new diagnostics facilities to spot coverage gaps.

## World Types
Current canonical world types:
- `murim` (martial low/mid tier)
- `cultivation` (classical cultivation progression; also treated as mortal)
- `immortal` (post‑ascension high realm)

A player begins in either `murim` (70%) or `cultivation` (30%) unless a deterministic override is supplied via:
- `globalThis.__WORLD_OVERRIDE__ = 'murim' | 'cultivation'` (test/runtime)
- Build env var `WORLD_OVERRIDE`

Ascension flips the world type irreversibly to `immortal` and locks out reverting to mortal types.

## Event Metadata Fields
Add these optional fields to any `StoryEvent` (or LifeArc event object) to control availability:
- `worldTypes?: Array<'murim'|'cultivation'|'immortal'>`
  - Presence means: event is ONLY available in listed world types.
  - Absence means: mortal‑only by default (available in `murim` & `cultivation`, excluded in `immortal`).
- `minRealm?: string` Inclusive lower bound realm key (must exist in `REALM_ORDER`).
- `maxRealm?: string` Inclusive upper bound realm key.

Realm names correspond to entries in `REALM_ORDER` (see `data/cultivationRealms.ts`).

## Default Behavior (Fail‑Open with Sensible Safety)
- Missing `worldTypes`: treated as mortal content, automatically filtered once the player ascends.
- Invalid realm keys or ordering errors: quietly ignored (event remains available) with a console warning in dev.

## Ascension Flow Recap
1. Player reaches `true_immortal` realm.
2. A forced ascension event (`forced_ascension_true_immortal`) is injected if they have not yet ascended.
3. Choosing the ascension option triggers executor `global_forced_ascension` which:
   - Sets `world.ascended = true`
   - Sets `world.currentWorldType = 'immortal'`
   - Protects against reverting to mortal world types.

## Migration Semantics (Existing Saves)
During `loadGame()` we now ensure:
- Missing `world.currentWorldType` is inferred.
  - If player realm is `true_immortal` or higher OR `world.ascended` is true => set to `immortal` and mark ascended.
  - Otherwise default to `murim`.
- Inconsistent `ascended` + non‑immortal world => coerced to `immortal`.
- Player realm in ascension tier but `ascended` flag missing => auto‑ascend (idempotent).

This guarantees older saves remain playable without manual intervention.

## Diagnostics (Phase 5)
Both `StorySystem` and `LifeArcSystem` now maintain lightweight counters:
```
{
  totalChecked: number;       // events evaluated by gating
  filtered: number;           // events excluded by gating
  passed: number;             // convenience (totalChecked - filtered)
  reasons: {
    worldType: number;        // filtered because worldTypes mismatch or immortal exclusion default
    minRealm: number;         // below minRealm
    maxRealm: number;         // above maxRealm
  }
}
```

### Accessing Diagnostics
From the store (LifeArcSystem default):
```ts
const diagnostics = useGameStore.getState().getStoryDiagnostics();
console.log(diagnostics);
```
Reset counters:
```ts
useGameStore.getState().resetStoryDiagnostics();
```
If you explicitly use `StorySystem`, call its `getDiagnosticsSummary()` / `resetDiagnostics()` directly.

### When to Use
- After adding new content packs, call `getAvailableEvents()` once per frame/tick (already done by UI) then inspect counters.
- High `worldType` filters suggest missing worldTypes metadata (or expected mortal‑only fallback working correctly if intentional).
- Unexpected `minRealm`/`maxRealm` filters may indicate mis‑ordered or misspelled realm keys.

## Authoring Guidelines
1. Always specify `worldTypes` for content intended to survive ascension (e.g., put `'immortal'` explicitly).
2. For mortal‑only flavor events, omit `worldTypes`; they will auto‑retire post‑ascension.
3. Use `minRealm` for progressive unlocks (e.g., rare alchemy markets at `Core Formation+`).
4. Use both `minRealm` & `maxRealm` for narrow narrative windows (e.g., a formative rivalry only during `Foundation Establishment`).
5. Keep events realm‑agnostic unless the flavor explicitly ties to a milestone; over‑gating shrinks available content.

## Testing Tips
- To simulate immortal filtering quickly in tests: set `world.currentWorldType = 'immortal'` and confirm mortal‑only (no `worldTypes`) events vanish.
- Override initial world type deterministically for CI by setting `global.__WORLD_OVERRIDE__` before importing the store.
- Use diagnostics to assert at least one event was filtered for a given reason after a gating scenario.

## Roadmap Extensions (Future)
- Add per‑reason sampling list (IDs of first N filtered events) for deeper debugging.
- Add dev‑mode HUD panel summarizing diagnostics each tick.
- Add realm tier bands (grouping multiple realms) for simpler metadata on broad ranges.

## FAQ
Q: Why default mortal‑only instead of all‑world by default?  
A: It prevents mortal ambiance events from cluttering the Immortal world without needing explicit retrofitting of legacy content.

Q: Will adding `worldTypes: ['murim','cultivation']` change anything vs omission?  
A: Functionally similar pre‑ascension; explicit list documents intent and diagnostics will attribute filtering to worldType mismatch post‑ascension the same way.

Q: How expensive is diagnostics tracking?  
A: O(1) integer increments per evaluated event; negligible vs other game logic.

---
Happy authoring—may your event chains ascend gracefully! 🔥
