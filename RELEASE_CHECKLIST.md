Release Checklist for Xianxia Game

1. Sanity & Validation
- Run `node scripts/validate_mentors_and_executors.cjs` and ensure no missing executor IDs or mentor unlocks.
- Run smoke tests: `node scripts/smoke_test.cjs` (runtime) and `node scripts/smoke_test_compiled.cjs` (compiled artifacts in `.tmp_build`).

2. Build & Packaging
- Ensure `npx tsc --project tsconfig.json --noEmit` passes (fix type errors if present).
- Build frontend with project-specific build command (e.g., `npm run build` if configured).

3. Tests
- Run unit tests: `npm test` (Jest) and ensure passing.
- Playtest critical flows manually (Act 1 start, mentor unlocks, Act 4 events).

4. Known Issues to Watch
- Node `package.json` contains `"type": "module"` which can make requiring compiled `.js` files behave as ESM. Use `.cjs` when necessary or update harness.
- Full project TypeScript compile to CommonJS can surface unrelated UI/test typing errors; use `tsconfig.executors.json` for narrow compile when necessary.

5. Release Notes
- Mention that Act 4 content and conservative executors were added.
- Note any TODOs remaining (executor richness, UI polish).

6. Release Steps
- Tag the repo with version.
- Create a release build and attach compiled artifacts.
- Publish release notes and changelog.
