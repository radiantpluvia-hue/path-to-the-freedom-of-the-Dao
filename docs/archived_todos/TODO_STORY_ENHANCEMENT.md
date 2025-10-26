# TODO: Story and Quest System Enhancement Plan

## High Priority Tasks
- [ ] Review and validate act JSON files (act1_events.json to act4_events.json) for completeness and consistency
- [ ] Ensure all objective types used in events are handled in src/events/storyEvents.ts
- [ ] Implement event executors for Acts 1-4 in src/events/executors/
- [ ] Enhance QuestPanels.tsx component for better quest display and progression tracking
- [ ] Add save/load support for story state in src/systems/SaveLoadSystem.ts
- [ ] Integrate TeachingPrerequisiteVisualization component with mentor teaching system
- [ ] Test quest progression and event triggers across Acts 1-4

## Detailed Implementation Steps

### 1. Act JSON Files Validation
- [ ] Check act1_events.json structure matches StoryAct interface
- [ ] Verify act2_events.json has proper conditions and choices
- [ ] Validate act3_events.json event executors and consequences
- [ ] Confirm act4_events.json unlock conditions and rewards
- [ ] Ensure all events have unique IDs and proper executorId references

### 2. Event Executors Implementation
- [ ] Create src/events/executors/eventExecutors_act1.ts with handlers for act1 events
- [ ] Implement src/events/executors/eventExecutors_act2.ts for act2 events
- [ ] Build src/events/executors/eventExecutors_act3.ts for act3 events
- [ ] Develop src/events/executors/eventExecutors_act4.ts for act4 events
- [ ] Register all executors in src/events/storyEvents.ts

### 3. UI Components Enhancement
- [ ] Update src/components/QuestPanels.tsx to show progress bars and rewards preview
- [ ] Improve src/components/TeachingPrerequisiteVisualization.tsx styling and responsiveness
- [ ] Add collapsible descriptions in story act lists
- [ ] Implement "Coming soon" labels for unreleased acts

### 4. Save/Load Integration
- [ ] Extend SaveLoadSystem to persist currentAct, storyFlags, quest progress
- [ ] Ensure rival state and domain state are saved/loaded properly
- [ ] Test round-trip save/load maintains story progression

### 5. Mentor Teaching Integration
- [ ] Connect TeachingPrerequisiteVisualization to mentor selection UI
- [ ] Ensure prerequisite checks work with player state updates
- [ ] Add visual feedback for met/unmet prerequisites

### 6. Testing and Verification
- [ ] Test Act 1 main quest completion triggers Act 2 unlock
- [ ] Verify event choices apply correct consequences
- [ ] Check quest objective completion updates UI properly
- [ ] Ensure save/load preserves all story state

## Acceptance Criteria
- [ ] Acts 1-4 have complete event data with working executors
- [ ] Quest panels display progress and rewards clearly
- [ ] Story state persists across sessions
- [ ] Teaching prerequisites show accurate requirements
- [ ] No TypeScript errors or unhandled objective types

## Notes
- Focus on Acts 1-4 as specified in the original TODO
- Stub Acts 5-7 as unreleased placeholders
- Ensure browser compatibility (no Node imports in client bundle)
- Test with rival system enabled/disabled to avoid crashes
