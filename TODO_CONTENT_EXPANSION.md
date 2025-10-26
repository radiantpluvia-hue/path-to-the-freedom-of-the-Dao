# Content Expansion TODO

This file lists the prioritized tasks for the content expansion and release-related steps. It mirrors the tracked TODO list used by the developer task manager.

- [ ] Decide content scope & priorities
  - Choose which content to expand first and produce a prioritized list with target counts (e.g., 40 events, 20 items).
  - Options: (A) Events & lore, (B) Items & equipment, (C) Manuals & skills, (D) Passives/abilities/formations, (E) Proficiency & training mechanics.
  - Deliverable: prioritized list and target counts.

- [ ] Create content seed pack
  - Author a high-quality seed pack for the chosen scope. Suggested size: 12 events, 10 items, 12 manuals, 12 passives/abilities.
  - Include data files (JSON/TS), example usages, and unit tests/examples.

- [ ] Integrate seeds into data files
  - Add new JSON/TS entries under `src/data/` (e.g., `src/data/events/actX_extra.json`, `src/data/items_extra.ts`).
  - Wire up lookups and ensure typing compatibility.

- [ ] Run tests & smoke runtime
  - Run `npm test` and a quick dev server (`npm run dev`) to verify no missing id errors and correct wiring.

- [ ] Iterate on balance & flavor
  - Adjust rewards, rarity, event weights and descriptions based on playtest feedback.

- [ ] Document content & changelog
  - Update `CHANGELOG.md` and add a README for the content pack and data shapes.

- [ ] Optional: Expand proficiency/training systems
  - Design and implement a proficiency XP system, training actions, UI hooks, and tests if chosen.

---

Notes
- After you pick the top priority (Events / Items / Manuals / Passives / Proficiency), I'll start by producing a small seed pack and accompanying tests.
- I can also run the production build and verification scripts when you want to move toward a release.
