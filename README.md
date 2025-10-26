# Path to Dao — Developer Guide

## 🧭 Project Overview

**Path to Dao** is a browser-based cultivation RPG built with **React + TypeScript**, using **Zustand** for state management and **Vite** for development. Game logic is organized into modular “systems” (e.g. `RivalSystem`, `DomainSystem`, `MarketSystem`) which operate on the central store.

The UI and systems interact via a single source of truth in **`src/store/useGameStore.ts`**. All major logic, events, and state transitions flow through or depend on that store.

---

## 🚀 Quick Orientation

### 1. Core integration points
 # Path to Dao — Developer Guide

## 🧭 Project Overview

**Path to Dao** is a browser-based cultivation RPG built with **React + TypeScript**, using **Zustand** for state management and **Vite** for development. Game logic is organized into modular “systems” (e.g. `RivalSystem`, `DomainSystem`, `MarketSystem`) which operate on the central store.

The UI and systems interact via a single source of truth in **`src/store/useGameStore.ts`**. All major logic, events, and state transitions flow through or depend on that store.

---

## 🚀 Quick Orientation

### 1. Core integration points

| File / Module | Role |
|---|---|
| `src/store/useGameStore.ts` | The canonical store. Exposes state and methods (e.g. `addEventLog`, `setUIProperty`, `playMusic`, `stopMusic`) — UI and systems both depend on it |
| `src/main.tsx` | App bootstrap. Renders root React component, sets up dev hooks, and exposes `window.gameStore` for debugging/testing |
| `src/components/**` | React components / UI. Notably, `EventLog` is `src/components/EventLog.tsx` and used in integration tests |
| `utils/domainSystem.ts` & `utils/eventExecutors_act*.ts` | Domain logic and event executors — how game domains update, what event effects are, etc. |

### 2. Developer workflows

- Run dev server:
```powershell
npm run dev
```
Open http://localhost:3000 in your browser.

- Run tests (unit / integration):
```powershell
npm test
```

- CI / Node build & validation:
```powershell
npm ci
npm run build:node
node scripts/verify/run_all.cjs
```

🛠 Project Conventions & Patterns

Central store usage
Use `useGameStore` hook in components. In logic / systems code, call `useGameStore.getState()` to access store methods and state.

UI routing / screen switching
Use `setUIProperty('currentScreen', <screenId>)`. Typical screens: `'game'`, `'combat'`, `'market'`, etc.

Event log
`EventLog` uses reversed flex layout (`column-reverse`) and is identified via `data-testid="event-log-container"`. Call `addEventLog(msg)` to append messages. Tests assume this reversed layout.

Audio management
Store fields: `musicPlaying`, `currentMusicTrack`. Actions: `playMusic(trackId)`, `stopMusic()`. UI components read those and respond accordingly.

Domain / system logic
Domain state and update logic live in `utils/domainSystem.ts`. Event executors live in `utils/eventExecutors_act*.ts`. Many systems read/write via `gameStore.player.domain`.

Lazy systems & fallback proxies
Some systems (e.g. `MarketSystem`) are lazy-loaded and wrapped in proxies to preserve synchronous getters. When changing them, maintain fallback behavior to avoid runtime UI errors.

Global dev hooks & exposure
`main.tsx` exposes `window.gameStore`, `window.rivalSystem` (or others) for debugging, console access, dev scripts, etc. Don’t break those without updating testing / tooling expectations.

Content tone tags for era bias
- To steer era-aware event sorting, content authors can add tags to events:
	- `tags: ["tone:dark"]`, `tags: ["tone:light"]`, or `tags: ["tone:neutral"]`
	- When tags are missing, a safe heuristic based on event text is used.
	- Sorting weight is controlled by `world.eventBias = { dark, neutral, light }` set by the current Era.

🔮 New Systems Overview
These are the features you’re building now: Alignment System, Gu Cultivation Branch, and Side-Zone / Enemy Unlocks.

Alignment System
- Players can evolve toward Righteous, Demonic, Unorthodox/Rogue, or Antihero/Lone Cultivator.
- Uses numeric moral axes (virtue, order, independence, ruthlessness).
- Player actions shift axes, and axes map to one of the archetypes.
- Each alignment influences reputation modifiers, sect reactions, passive tags, dialogue options.

Gu Cultivation Branch (Unlocked via Affinity)
- Gain affinity with Fang Yuan via certain actions or quests.
- Once affinity ≥ threshold, unlock Gu branch, which locks out all other advanced cultivation paths except Body Cultivation + Gu Refinement.
- Gu branch has its own progression: awaken aperture, feed primeval essence, break walls, rank up Gu, etc.
- High ranks in Gu unlock access to a side zone populated by special enemies (inspired by Reverend Insanity).

Side-Zone / Enemy Unlocks
- After reaching a certain Gu rank, `sideZoneUnlocked` toggles.
- This unlocks special “Gu Beast / Insanity-style” enemies with unique designs, loot, or mechanics.
- Systems should spawn these enemies when players enter the zone, run suitable quests, or trigger side events.
- Defeating them can give resources, rare Gu items, or reputation with Fang Yuan.

🧪 Testing & Mocking Guidelines
- Many UI tests mock `useGameStore` via `tests/testUtils/mockUseGameStore.ts`. When you add new store methods (e.g. for alignment, Gu), update your mock implementations to include them optionally.
- `EventLog` tests expect `addEventLog` and autoscroll behavior; if you refactor `EventLog` internals, also update `__tests__/EventLog.unit.test.tsx` and `__tests__/eventLog.autoscroll.dom.test.tsx`.
- For side-zone / enemy logic, write test hooks to simulate unlocking affinity / Gu rank to confirm side enemies spawn or are gated properly.

🐞 Troubleshooting Tips
UI features not showing (music, domain panel, event log, settings):

- Search for state selectors (`addEventLog`, `playMusic`, `setUIProperty`, `currentScreen`) in the store. If they’re still exposed, the issue is likely at the component side (rendering or prop selection).
- Ensure `index.html` contains `<div id="root"></div>` and `main.tsx` actually mounts the React app. If `root` is missing, the app may skip rendering.

New system logic not applied / store not updating:

- Confirm you wired the new logic in your event handlers (e.g. call `onPlayerActionWithGu`).
- Use `console.log` or breakpoints inside store actions / reducers.
- Inspect `useGameStore.getState()` in dev tools to confirm state fields (e.g. `player.guState`) are present.

Tests failing / mock issues after adding new store fields:

- Add fallback default values in mock store implementations.
- Make new store properties optional where UI tests don’t need them.
- Update affected test files to expect or ignore new behavior.

If these are worse than the original, you don't need to update them.

---

### Cultivation consolidation & breakthrough attempts

- UI: `src/components/CultivationUI.tsx` shows a consolidation summary (ticks spent, consolidation factor, and estimated Dao Heart penalty). If the estimated penalty is catastrophic (>= 50% of Dao Heart), the UI shows a confirmation modal before performing the attempt.
- Helper: `src/utils/attemptHelpers.ts` exposes `performBreakthroughAttempt(challengeId, store?)`.
	- If you pass a `store` object, the helper will use it (this simplifies tests).
	- If you omit the `store` arg, the helper will call `useGameStore()` and prefer the store's `attemptRealmBreakthroughWithConsolidation` method when available; otherwise it falls back to `BreakthroughSystem`.

Examples for tests:

```powershell
const mockStore = { attemptRealmBreakthroughWithConsolidation: jest.fn(), player: { skills: {}, daoHeart: 5 } };
performBreakthroughAttempt('challenge_1', mockStore);
expect(mockStore.attemptRealmBreakthroughWithConsolidation).toHaveBeenCalledWith('challenge_1');
```

This pattern avoids module-level mocking in many tests and keeps the UI code simple.
const mockStore = { attemptRealmBreakthroughWithConsolidation: jest.fn(), player: { skills: {}, daoHeart: 5 } };
performBreakthroughAttempt('challenge_1', mockStore);
expect(mockStore.attemptRealmBreakthroughWithConsolidation).toHaveBeenCalledWith('challenge_1');
```

This pattern avoids module-level mocking in many tests and keeps the UI code simple.

