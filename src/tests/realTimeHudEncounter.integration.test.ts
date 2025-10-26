import { setRuntimeRng, seededFromString, clearRuntimeRng } from '../utils/seededRng';
import { useGameStore } from '../store/useGameStore';

describe('RealTime HUD -> Encounter -> CombatUI integration', () => {
  beforeEach(() => {
    // deterministic RNG
    setRuntimeRng(seededFromString('integration-test-seed'));
    // reset store minimal state
    try { (useGameStore as any).setState({ player: { ...useGameStore.getState().player, activeEncounter: null, lastPlannedTravel: null, activeTravel: null }, world: { ...useGameStore.getState().world, tick: 0 } }); } catch (e) {}
  });

  afterEach(() => {
    clearRuntimeRng();
  });

  it('triggers pending encounter and resumes travel on simulated combat victory', () => {
    const store = useGameStore.getState();
    // craft a pending encounter that is due now
    const now = Date.now();
    const pending = [{ epochMs: now - 1000, from: 'a', to: 'b', encounter: { chance: 1.0, interrupt: true, encounterId: 'roadbandit_small' } }];
    // set activeTravel meta to include pendingEncounters and lastPlannedTravel
    useGameStore.setState(state => ({ player: { ...state.player, activeTravel: { fromNodeId: 'a', toNodeId: 'b', startedAtTick: 0, arrivalTick: 0, durationTicks: 1, mode: 'walk', meta: { realTime: true, realTimeDurationSeconds: 10, realTimeStartTimestamp: now - 5000, arrivalEpochMs: now + 5000, pendingEncounters: pending, plannedEncounters: [{ from: 'a', to: 'b', encounter: { chance: 1.0 } }] } }, lastPlannedTravel: { toNodeId: 'b', opts: { mode: 'walk' } }, activeEncounter: null } } as any));

    // simulate HUD behavior by calling the TravelEncounterSystem resolver directly
    const { resolvePlannedEncountersAndMaybeInterrupt } = require('../systems/TravelEncounterSystem');
    const res = resolvePlannedEncountersAndMaybeInterrupt({ edges: [pending[0]], fromNodeId: 'a', toNodeId: 'b', mode: 'walk' });
    expect(res).not.toBeNull();
    const after = useGameStore.getState();
    expect(after.player.activeEncounter).not.toBeNull();

    // Simulate Combat victory: invoke resolveActiveEncounterOutcome
    const { resolveActiveEncounterOutcome } = require('../systems/TravelEncounterSystem');
    resolveActiveEncounterOutcome({ success: true, resumeTravel: true });
    const final = useGameStore.getState();
    expect(final.player.activeEncounter).toBeNull();
    expect(final.player.activeTravel).not.toBeNull();
  });
});
