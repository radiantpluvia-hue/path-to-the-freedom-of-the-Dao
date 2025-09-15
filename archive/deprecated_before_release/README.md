This folder holds deprecated or archived files moved from the main source tree for pre-release cleanup.

Files moved here were present in the repository at the time of archival and are preserved for audit and potential rollback. Do NOT delete this folder; it's for review only. Tests are run after copying to ensure nothing breaks.

Moved files:
- src/data/bloodlines_updated.ts
- src/data/manuals_updated.ts
- src/data/physiques_updated.ts

If you want to restore a file, copy it back to its original path and run the test suite.

Archive note (2025-09-14):
- Backup created for thin re-export shims prior to safe deletion from `src/data/`.
- To rollback: copy archived files back into `src/data/` and run `npm test`.

Reason: These `_updated` files were thin shims that duplicated canonical modules. They were removed from source to reduce confusion; backups retained here for safety.

Backup details:

- Backup folder: `archive/deprecated_before_release/backup_20250914_110504/`
- Contents: `manuals_updated.ts`, `bloodlines_updated.ts`, `physiques_updated.ts`
- Commit hint: changes made during this cleanup are in the working tree; consider creating a tag or commit like `cleanup/remove-updated-shims-20250914` after review.

Note: inert placeholder copies were also created under `src/archive/deprecated_before_release/` to keep backups close to the source tree without introducing type/build errors. The authoritative archived files remain in this folder at the repo root.