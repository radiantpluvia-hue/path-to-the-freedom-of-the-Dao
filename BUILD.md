Build & Verification steps
=========================

This project separates the Node/CommonJS compiled artifacts used by verification scripts from the frontend `vite` build.

Quick steps to reproduce verification locally or in CI:

1) Install dependencies

   npm ci

2) Emit Node/CommonJS build artifacts to `.tmp_build`

   npm run build:node

3) Run all verification & smoke tests (compiled)

   node scripts/verify/run_all.cjs

Files produced by verification
- `reports/verify_summary_<ts>.json` — per-run summary of each verification step.
- `.tmp_build/reports/missing_mentor_unlocks.json` — mentor unlock missing-id report.

CI suggestion (GitHub Actions)
-----------------------------
- Run `npm ci` on ubuntu-latest
- Run `npm run build:node` to produce `.tmp_build`
- Run `node scripts/verify/run_all.cjs` and upload `reports/` as job artifacts
