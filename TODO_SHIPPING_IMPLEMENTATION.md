# What's Needed To Ship (Browser-only) - Implementation Plan

## High-Impact Gaps Identified

### 1. Single Source of Truth for State
- **Issue**: Duplicated fields between PlayerState and SystemState in types.ts
- **Impact**: Data inconsistency, maintenance overhead
- **Solution**: Consolidate state ownership and remove duplication

### 2. Conflicting System Variants
- **Issue**: Multiple duplicate system files:
   - SectSystem.ts vs SectSystem_updated.ts (deprecated)  <!-- deprecated copies archived at `archive/deprecated_before_release/` -->
   - QuestSystem.ts vs QuestSystem_updated.ts (deprecated)  <!-- deprecated copies archived at `archive/deprecated_before_release/` -->
   - SectMissionSystem.ts vs SectMissionSystem_updated.ts (deprecated)  <!-- deprecated copies archived at `archive/deprecated_before_release/` -->
   - CombatSystem.ts vs CombatSystem_enhanced.ts (missing)
   - Codex.tsx vs Codex_updated.tsx vs CodexFinal.tsx vs CodexFixed.tsx (identical)  <!-- canonical wrapper `src/components/Codex.tsx` used; variants archived -->
- **Impact**: Confusion, maintenance overhead, potential bugs
- **Solution**: Delete deprecated files, consolidate duplicates

### 3. Combat/Stats Scaling Coherence
- **Issue**: Scaling formulas scattered across multiple files
- **Impact**: Inconsistent stat calculations, hard to balance
- **Solution**: Centralize in combatConfig.ts with comprehensive tests

### 4. Progression Gating and Daily Loop
- **Issue**: No enforced daily resets or cooldowns
- **Impact**: Players can bypass progression limits
- **Solution**: Implement daily loop system with proper gating

### 5. Save/Load Robustness
- **Issue**: No migration helpers for schema changes
- **Impact**: Save file corruption on updates
- **Solution**: Add migration system and validation

## Implementation Priority

### Phase 1: Critical Cleanup (Week 1)
1. **Delete Deprecated System Files**
   - Remove SectSystem_updated.ts, QuestSystem_updated.ts, SectMissionSystem_updated.ts
   - Consolidate Codex components into single authoritative version
   - Update all imports

2. **Centralize Combat Scaling**
   - Create src/systems/combatConfig.ts with all scaling formulas
   - Move scaling functions from scalingSystem.ts
   - Add comprehensive unit tests

3. **Fix State Duplication**
   - Audit PlayerState vs SystemState overlap
   - Consolidate mentor/teaching progress ownership
   - Remove redundant fields

### Phase 2: Core Systems Integration (Week 2)
4. **Implement Daily Loop System**
   - Add daily reset mechanics
   - Implement cooldown tracking
   - Add progression gating

5. **Enhance Save/Load System**
   - Add migration helpers
   - Implement schema validation
   - Add backup/restore functionality

### Phase 3: UI/UX Polish (Week 3)
6. **Modernize UI Components**
   - Update Codex to use modern React patterns
   - Improve responsive design
   - Add loading states and error handling

7. **Add Missing Features**
   - Implement buff system UI
   - Add crafting system interface
   - Enhance market system

## Detailed Audit by System

### CombatSystem
- **Status**: Core implementation exists but needs scaling centralization
- **Action**: Extract scaling to combatConfig.ts, add tests

### RivalSystem
- **Status**: Well implemented with AI integration
- **Action**: Minor cleanup, ensure proper state ownership

### MentorTeachingSystem
- **Status**: Good implementation but progress tracking duplicated
- **Action**: Consolidate progress ownership, remove duplication

### QuestSystem
- **Status**: Core exists, deprecated file needs removal
- **Action**: Delete deprecated file, update imports

### SectSystem
- **Status**: Comprehensive implementation
- **Action**: Delete deprecated file, update imports

### MarketSystem
- **Status**: Basic implementation exists
- **Action**: Add UI integration, enhance features

### BuffSystem
- **Status**: Implementation exists but needs UI
- **Action**: Add buff management UI

### CraftingSystem
- **Status**: Implementation exists but needs UI
- **Action**: Add crafting interface

### Type/State Hygiene
- **Status**: Good foundation but needs consolidation
- **Action**: Remove duplicated fields, clarify ownership

## Success Criteria

1. **No Duplicate Files**: All deprecated system files removed
2. **Centralized Scaling**: All combat calculations in one place with tests
3. **Clean State**: No duplicated fields between PlayerState/SystemState
4. **Daily Loop**: Proper progression gating and resets implemented
5. **Robust Save/Load**: Migration system with validation
6. **Modern UI**: Responsive, accessible components
7. **Browser-Ready**: No Node.js dependencies, works in browser

## Testing Strategy

1. **Unit Tests**: Combat scaling, state management, migrations
2. **Integration Tests**: System interactions, save/load cycles
3. **Browser Tests**: Full game loop in browser environment
4. **Performance Tests**: Memory usage, load times

## Risk Mitigation

1. **Backup Strategy**: Git branches for each phase
2. **Incremental Changes**: Small, testable changes
3. **Import Updates**: Automated script to update all imports
4. **Validation**: Comprehensive testing before each phase completion
