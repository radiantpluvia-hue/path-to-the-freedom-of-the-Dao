# Buff System Implementation Plan

## Current Status
- [x] Analyze existing buff system code
- [x] Identify type mismatches and missing features
- [x] Create comprehensive implementation plan

## Implementation Steps

### 1. Type Alignment
- [ ] Update Buff interface in types.ts to include all necessary fields
- [ ] Remove duplicate Buff interface from useGameStore.ts
- [ ] Update imports to use consistent types

### 2. BuffSystem Enhancement
- [ ] Update BuffSystem.ts to handle stacking buffs
- [ ] Implement permanent buffs (duration: -1)
- [ ] Add buff expiration logic
- [ ] Implement stat effect calculations
- [ ] Add buff stacking rules and max stacks

### 3. Game Store Integration
- [ ] Update useGameStore.ts buff-related methods
- [ ] Fix processBuffs to handle all buff types
- [ ] Update useItem to properly apply buffs
- [ ] Add buff removal methods

### 4. Combat Integration
- [ ] Update CombatSystem to apply buff effects during combat
- [ ] Add buff processing during combat turns
- [ ] Implement buff-triggered effects in combat

### 5. Testing and Validation
- [ ] Test buff application and stacking
- [ ] Test buff expiration
- [ ] Test permanent buffs
- [ ] Test combat buff effects
- [ ] Validate type consistency

### 6. UI Integration (Future)
- [ ] Add buff display in character panel
- [ ] Show active buffs with timers
- [ ] Add buff tooltips with effects

## Key Features to Implement
- Stacking buffs with configurable max stacks
- Permanent buffs that don't expire
- Time-based buff expiration
- Action-based buff consumption
- Stat modifiers (flat and percentage)
- Special effect triggers
- Combat buff integration
- Buff source tracking

## Files to Modify
- src/types.ts
- src/store/useGameStore.ts
- src/systems/BuffSystem.ts
- src/systems/CombatSystem.ts (for combat integration)
