Release Notes

Version: Unreleased
Date: TBD

Highlights
- Buffs UI: New interface for viewing and managing active buffs and consumables.
- Crafting & Market (alpha): Initial UI and functionality for crafting items and interacting with a market.
- Codex modernized: Improved performance and type safety for `CodexModal` and lookup components.
- Build & packaging: Build process validated to produce `dist` for distribution.

Important notes for users
- This is an early release of the crafting and market systems; expect iterative changes.
- Some features are behind feature flags and will be enabled gradually.

Developer upgrade notes
- Run `npm install` to ensure dev dependencies (TypeScript, Vite) are present.
- To validate locally:

```powershell
cd "C:\Users\xbo4k.ZLOVE.000\Downloads\xianxia game"
npm install
npx tsc --project tsconfig.json --noEmit
npm run build
```

- CI should include a step to run `npx tsc --project tsconfig.json --noEmit` and check `dist` exists after `npm run build`.

Planned timeline & priorities
- Week 1: Implement Buff UI and store wiring (Zustand). Add unit tests.
- Week 2: Implement basic Crafting & Market UI and interactions.
- Week 3: Modernize Codex & polish UI, run full QA.

Contact
- Dev: repository maintainer
- Issues/PRs: open in the project's issue tracker
