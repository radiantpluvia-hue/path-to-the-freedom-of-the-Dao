# Fix TypeScript Errors in useGameStore.ts

## Issues Found:
1. **Line 462, 483, 1104, 1105, 1107**: Using `state.player.realm` instead of `state.player.realmId`
2. **Line 863**: Using `'encounter'` type which is not in the allowed union type `'chance' | 'provoked' | 'defense' | 'competition'`

## Plan:
- [ ] Fix all instances of `state.player.realm` to `state.player.realmId`
- [ ] Change `'encounter'` type to one of the allowed types (likely `'chance'`)

## Files to Edit:
- `src/store/useGameStore.ts`
