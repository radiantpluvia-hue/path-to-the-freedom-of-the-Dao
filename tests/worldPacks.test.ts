import { useGameStore } from '../src/store/useGameStore';
import { StorySystem } from '../src/systems/StorySystem';

// Validate that added world-specific packs can be manually injected and gating respects worldType.

describe('World Event Packs Gating', () => {
  test('murim-only events excluded after ascension (immortal world)', () => {
    const gs = useGameStore.getState();
    // Simulate a murim event injection
    const murimEvent = {
      id: 'murim_local_duel_testcopy',
      title: 'Alley Duel (Test)',
      description: 'Test murim duel',
      worldTypes: ['murim'],
      maxRealm: 'foundation_establishment',
      choices: [{ id: 'ok', text: 'Ok', consequences: {} }]
    } as any;
  // Ensure storySystem available
  const story = gs.storySystem as StorySystem;
  // Force mortal world type to simulate pre-ascension
  gs.setWorldType('murim');
    story.addEvent(gs.story.currentAct, murimEvent);
    // Pre-ascension (still mortal world) should include it
    const pre = story.getAvailableEvents(useGameStore.getState());
    expect(pre.some(e => e.id === murimEvent.id)).toBe(true);
    // Force ascension world type
    gs.setWorldType('immortal');
    const post = story.getAvailableEvents(useGameStore.getState());
    expect(post.some(e => e.id === murimEvent.id)).toBe(false);
  });
});
