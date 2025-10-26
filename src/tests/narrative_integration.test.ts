import { describe, it, expect } from '@jest/globals';
const storeModule = require('../store/useGameStore');

describe('NarrativeEngine integration', () => {
  it('StorySystem surfaces NarrativeEngine generated events', () => {
    const useGameStore = storeModule.useGameStore as any;
    // Ensure store instance is available
    const s = useGameStore.getState();

    // Ensure narrative engine exists and has triggers
    expect(s.narrativeEngine).toBeDefined();
  const triggers = s.narrativeEngine.narrativeTriggers || [];

  // Call engine directly to see what it returns (sanity)
  const direct = s.narrativeEngine.generateEventsForPlayer({ player: s.player, world: s.world, story: s.story, ui: s.ui, systems: s.systems });

  // When asking StorySystem for available events, include narrativeEngine so it can integrate
  const events = s.storySystem.getAvailableEvents({ player: s.player, world: s.world, story: s.story, ui: s.ui, systems: s.systems, narrativeEngine: s.narrativeEngine });
  // debug removed

  // Should include the demo narrative event (title matches)
  const found = events.some((e: any) => (e.title && e.title.includes("Heaven's Whisper")) || (e.id && String(e.id).startsWith('narrative_generated')));
  expect(found).toBe(true);
  });
});
