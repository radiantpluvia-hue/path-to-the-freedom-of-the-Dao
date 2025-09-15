# Immortal Leaders (immortal_leaders.json)

This file contains a curated list of Immortal Realm leaders who provide advanced teachings to the player. They are kept separate from the canonical `mentors_full.json` to preserve curated mentors and allow additive runtime augmentation.

Why separate?
- Curated mentors live in the canonical data files used for core game content and playtests.
- `immortal_leaders.json` contains additional high-tier leaders (the leaders of major sects) that should not overwrite or merge with the curated mentor corpus at source.

Runtime merge
- The runtime merger located at `src/data/mentors_runtime.ts` imports both the canonical mentors and `immortal_leaders.json`, deduplicates by `id` and performs a shallow merge so additional fields on immortal leaders are preserved at runtime.

Mapping and unlocks
- Each leader exposes a `teachingProgression` with `tiers` and `unlocks`. These `unlocks` reference canonical skill ids from the central skill catalogs (`src/data/skills/*`).
- Keep unlock ids canonical so the game's skill discovery, teaching trees, and tests can find them in `ALL_SKILLS`.

Current leaders included
- Shaolin Monastery — `mentor_shaolin_abbot`
- Wudang Sect — `mentor_wudang_master`
- Mount Hua Sect / Huashan Sword School — `mentor_huashan_master`
- Emei Sect — `mentor_emei_matron`
- Kunlun Sect — `mentor_kunlun_eldest`
- Beggar's Sect — `mentor_beggars_chief`
- Xingyun Sect — `mentor_xingyun_prophet`
- Ming Cult — `mentor_ming_patron`
- Wanshou Valley — `mentor_wanshou_guardian`
- Qingcheng Sect — `mentor_qingcheng_lama`
- Celestial Demon Sect — `mentor_celestial_demon_overlord`
- Sword Sect of Mount Shu — `mentor_shu_sword_sage`
- Heavenly Dao Sect — `mentor_heavenly_dao_chancellor`
- Lingxiao Palace — `mentor_lingxiao_matron`

If you add new leaders
- Add them to `immortal_leaders.json` and ensure every `unlocks` id exists in `src/data/skills/index.ts` (or a skill file it imports).
- Run `npm test` — the test `immortalLeadersDiscovery.test.ts` validates that leaders exist in the merged mentors and unlocked skills exist in `ALL_SKILLS`.

Notes
- This file is intentionally minimal; treat it as a developer-facing note for contributors and for future release notes.