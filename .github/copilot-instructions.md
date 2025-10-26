## Quick orientation

Short: this is a React + TypeScript single-page game using Zustand for state, Vite for dev, and a handful of "systems" that encapsulate game logic (RivalSystem, DomainSystem, MarketSystem, etc.). The central integration point is `src/store/useGameStore.ts` — treat it as the canonical API for UI and systems.

Key entrypoints to open first:
- `src/store/useGameStore.ts` — single source of truth; contains helpers used by UI (e.g. `addEventLog`, `setUIProperty`, `playMusic`, `stopMusic`).
- `src/main.tsx` — app bootstrapping, global exposure (`window.gameStore`), and dev-only playtest hooks.
- `src/components/**` — UI components; `EventLog` is `src/components/EventLog.tsx` and is used by tests.
- `utils/domainSystem.ts` (and `utils/eventExecutors_act*.ts`) — domain helpers and how domains are represented.

## Developer workflows (how to run & verify)
- Dev server: `npm run dev` (Vite) — open http://localhost:3000
- Unit/integration tests: `npm test` (Jest)
- Node/CI verification (compiled CommonJS):
  1. `npm ci`
  2. `npm run build:node` (produces `.tmp_build` via `tsc -p tsconfig.cjs.json` and post-rename script)
  3. `node scripts/verify/run_all.cjs` to run game-specific validation checks and produce `reports/`

If a UI feature looks missing (domain, music, work/job, event log, settings), start with these quick checks:
- Search for the state selectors: `addEventLog`, `playMusic`, `stopMusic`, `setUIProperty`, `currentScreen`. If the store still exposes these, the problem is likely in the component wiring rather than backend logic.
- Confirm `index.html` contains `<div id="root"></div>` and `src/main.tsx` rendered the app — when `root` is missing the app logs a warning and skips rendering.

## Project-specific conventions & patterns
- Central store: `useGameStore` is a Zustand hook but also used as a global API via `useGameStore.getState()` in many places. It's common to call `useGameStore.getState().someAction(...)` from systems/tools.
- UI routing: simple screen switching is done with `setUIProperty('currentScreen', '<screenId>')`. Common values: `'game'`, `'combat'`, `'market'`, etc. Look for `setUIProperty('currentScreen', ...)` usages.
- Event log: `EventLog` (`src/components/EventLog.tsx`) uses a reversed column layout (CSS: `flexDirection: 'column-reverse'`) and exposes `data-testid="event-log-container"`. The store method is `addEventLog(message)` — use that to append messages. Tests rely on the reversed rendering and a test id for autoscroll checks.
- Audio: state fields `musicPlaying`, `currentMusicTrack` and actions `playMusic(trackId)` / `stopMusic()` live in the store (`src/store/useGameStore.ts`). Tests set `musicPlaying` directly in the mocked store when verifying UI.
- Domain: lightweight domain helpers are in `utils/domainSystem.ts` (functions like `createDomain`, `getDomainById`). Several event executors reference `gs.player.domain` — check `utils/eventExecutors_act*.ts` when domain-related UI is missing.
- Lazy-loading and safe fallbacks: heavy systems (e.g., MarketSystem) are lazy-loaded and proxied to provide synchronous fallbacks for common getters. When modifying these, preserve the proxy/fallback pattern to avoid runtime errors in the UI.
- Global exposure: `src/main.tsx` intentionally exposes a small API on `window.gameStore` and `window.rivalSystem` for cross-cutting scripts — changing this can break tools and tests.

## Tests & mocking patterns
- Many component tests mock `useGameStore` by providing a simple hook that returns selected state and spyable functions (see `src/tests/testUtils/mockUseGameStore.ts`). When adding features, prefer making them optional in tests or supply minimal mocks.
- EventLog tests assert autoscroll and expect `addEventLog` to exist on the mocked store. If you refactor EventLog, update `src/__tests__/EventLog.unit.test.tsx` and `src/__tests__/eventLog.autoscroll.dom.test.tsx` accordingly.

## Debugging tips for the missing features you reported
- Event log not visible: Confirm `EventLog` is mounted in the main UI. If it's mounted but not updating, verify `useGameStore` has `eventLog` and `addEventLog` and that components select `state.eventLog` (see `src/components/EventLog.tsx`). Check `data-testid="event-log-container"` to query it in debugging tools.
- Music not playing / CTA missing: Check store keys `musicPlaying`, `currentMusicTrack`, and the UI component that displays music controls (search for `.musicPlaying` or `playMusic` usages). Tests like `tests/audioFallback.test.tsx` show the expected behavior for autoplay-block fallback.
- Work/job/pay not working: search `worked ${job.name}` in `useGameStore` (there is an implementation that logs `Worked ${job.name} and earned ...`), then trace where the UI lists jobs (search `work`, `job`, `earn` in `src/components`). Ensure `setUIProperty` navigation isn't hiding the game screen.

## Where to look (quick file map)
- Central store: `src/store/useGameStore.ts`
- Event log UI: `src/components/EventLog.tsx`
- Main bootstrap: `src/main.tsx`, `index.html`
- Domain system: `utils/domainSystem.ts`, `utils/eventExecutors_act*.ts`
- Game UI/flow: `src/components/game/*` (look for `GameInterface.tsx` / panels)
- Tests: `src/__tests__` and `src/tests` for integration examples
- Build/verify scripts: `scripts/verify/*`, `scripts/helpers/*`, and `BUILD.md`

## Minimal examples (how an AI agent should apply small fixes)
- Add an event message: call `useGameStore.getState().addEventLog('Your message')` or inject `addEventLog` via hook in a component.
- Play a track: `useGameStore.getState().playMusic('china-chinese-asian-music-346568.mp3')` and ensure the UI component reads `currentMusicTrack`.
- Restore a missing screen: locate the `setUIProperty('currentScreen', ...)` call and make sure the matching component is imported and mounted by the parent screen.

If anything here is unclear or you want me to prioritize restoring the specific UI pieces you mentioned (domain, music, work/job list, event log placement, settings), tell me which one to start with and I will (1) locate the relevant component(s), (2) run a focused test or render, and (3) produce a safe patch with verification steps.

# Changelog
-Always add changes into CHANGELOG.md
