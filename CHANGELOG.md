# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-09-12
### Added
- Added 15 major mortal-world sects and corresponding Immortal Realm leaders in `src/data/immortal_leaders.json`.
- Added runtime merger `src/data/mentors_runtime.ts` to merge curated mentors and immortal leaders at runtime.
- Mapped immortal leader teaching unlocks to canonical skill ids in `src/data/skills/*`.
- Added `src/data/README_immortal_leaders.md` documenting the file and runtime merge.

### Fixed
- Resolved placeholder unlock ids and validated mappings via unit tests.

### Tests
- Ran full Jest test suite and verified all tests pass.


### 2025-09-13
- Renamed two skill tiers in `src/components/minigames/skills.ts`: tier 4 -> 'Emperor Grade', tier 5 -> 'Divine Grade' and updated their descriptions.


> For older changes see project history (git commits).