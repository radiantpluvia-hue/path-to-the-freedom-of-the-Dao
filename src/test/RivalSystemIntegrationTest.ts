import { useGameStore } from '../store/useGameStore';
import { RivalSystem } from '../systems/RivalSystem';

describe('Rival System Integration Test', () => {
  let store: ReturnType<typeof useGameStore.getState>;
  let rivalSystem: RivalSystem;

  beforeEach(() => {
    // Reset the store state
    useGameStore.setState({
      world: { ...useGameStore.getState().world, year: 1, day: 1, flags: {}, factions: {}, heavensList: [], lastEpochTournamentYear: 0 },
      player: {
        ...useGameStore.getState().player,
        rivalRelationships: {},
        lastRivalEncounters: {}
      }
    });
    store = useGameStore.getState();
    rivalSystem = store.rivalSystem;
  });

  test('adjustRivalRelationship passes current day to RivalSystem', () => {
    // Get a test rival
    const rivals = rivalSystem.getAllRivals();
    expect(rivals.length).toBeGreaterThan(0);
    const testRival = rivals[0];

    // Set initial state
    const initialDay = 5;
    useGameStore.setState({
      world: { ...store.world, day: initialDay }
    });

    // Call adjustRivalRelationship
    const change = 10;
    store.adjustRivalRelationship(testRival.id, change);

    // Verify the rival's relationship was updated
    const updatedRival = rivalSystem.getRival(testRival.id);
    expect(updatedRival).toBeTruthy();
    expect(updatedRival!.relationship).toBe(testRival.relationship + change);

    // Verify the lastEncounter was set to the current day
    expect(updatedRival!.lastEncounter).toBe(initialDay);
  });

  test('adjustRivalRelationship handles non-existent rival gracefully', () => {
    const initialDay = 3;
    useGameStore.setState({
      world: { ...store.world, day: initialDay }
    });

    // This should not throw an error
    expect(() => {
      store.adjustRivalRelationship('non_existent_rival', 5);
    }).not.toThrow();

    // Verify no rival was created
    const rival = rivalSystem.getRival('non_existent_rival');
    expect(rival).toBeNull();
  });

  test('adjustRivalRelationship updates local state correctly', () => {
    const rivals = rivalSystem.getAllRivals();
    const testRival = rivals[0];
    const initialDay = 7;

    useGameStore.setState({
      world: { ...store.world, day: initialDay },
      player: {
        ...store.player,
        rivalRelationships: { [testRival.id]: testRival.relationship },
        lastRivalEncounters: {}
      }
    });

    const change = -15;
    store.adjustRivalRelationship(testRival.id, change);

    // Check that local state was updated
    const updatedStore = useGameStore.getState();
    expect(updatedStore.player.rivalRelationships[testRival.id]).toBe(testRival.relationship + change);
    expect(updatedStore.player.lastRivalEncounters[testRival.id]).toBe(initialDay);
  });
});
