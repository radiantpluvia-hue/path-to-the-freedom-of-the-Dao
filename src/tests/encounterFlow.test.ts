/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { useGameStore } from '../store/useGameStore';
import { resolvePlannedEncountersAndMaybeInterrupt, resolveActiveEncounterOutcome } from '../systems/TravelEncounterSystem';

describe('TravelEncounterSystem', () => {
  beforeEach(() => {
    // reset store to initial state helper if available
    try { (useGameStore as any).setState({ player: { ...useGameStore.getState().player, activeEncounter: null, lastPlannedTravel: null, activeTravel: null } }); } catch (e) {}
  });

  it('interrupts travel when an interrupting encounter rolls', () => {
    const store = useGameStore.getState();
    // prepare a pending edge with interrupting encounter
    const edge = { from: 'a', to: 'b', encounter: { chance: 1.0, interrupt: true, encounterId: 'test_enc' } };
    // force RNG to always trigger
    jest.spyOn(global.Math, 'random').mockReturnValue(0.0);

    const res = resolvePlannedEncountersAndMaybeInterrupt({ edges: [edge], fromNodeId: 'a', toNodeId: 'b', mode: 'walk' });
    expect(res).not.toBeNull();
    const state = useGameStore.getState();
    expect(state.player.activeEncounter).not.toBeNull();
    expect((state.player.activeEncounter as any).encounterId).toBe('test_enc');

    // restore RNG
    (global.Math.random as any).mockRestore();
  });

  it('resolveActiveEncounterOutcome clears encounter and resumes travel when requested', () => {
    const store = useGameStore.getState();
    // set lastPlannedTravel so resume can be attempted; mock startTravel to record calls
    useGameStore.setState(state => ({ player: { ...state.player, lastPlannedTravel: { toNodeId: 'dest1', opts: { mode: 'walk' } }, activeEncounter: { encounterId: 'test_enc', startedAtTick: store.world.tick } } } as any));
    const spy = jest.spyOn(useGameStore.getState() as any, 'startTravel').mockImplementation(() => ({ }));

    resolveActiveEncounterOutcome({ success: true, resumeTravel: true });
    const after = useGameStore.getState();
    expect(after.player.activeEncounter).toBeNull();
    expect(spy).toHaveBeenCalledWith('dest1', { mode: 'walk' });
    spy.mockRestore();
  });
});
