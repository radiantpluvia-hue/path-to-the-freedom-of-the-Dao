prune_bak script
=================

Small helper to find, archive, or delete `.bak` files produced by previous cleanup steps.

Usage (PowerShell):

```powershell
# dry run (list found .bak files)
node scripts/prune_bak.js

# archive found .bak files to .bak_archive/<timestamp>/ and append gitignore entries
node scripts/prune_bak.js --archive --gitignore

# permanently delete found .bak files (destructive)
node scripts/prune_bak.js --delete --yes
```

Flags:
- `--dry-run` (default) : list found .bak files and exit
- `--archive` : move .bak files into `.bak_archive/<timestamp>/`
- `--delete`  : permanently delete .bak files
- `--gitignore` : append `*.bak` and `.bak_archive/` to project `.gitignore`
- `--yes`     : skip interactive confirmation for destructive ops

The script excludes `node_modules` and `.git` while scanning and is intentionally conservative.
