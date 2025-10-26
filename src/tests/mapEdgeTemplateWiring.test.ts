/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { resolvePlannedEncountersAndMaybeInterrupt } from '../systems/TravelEncounterSystem';
import { useGameStore } from '../store/useGameStore';

describe('MapEdge.templateId wiring to encounter branchState', () => {
  beforeEach(() => {
    try { (useGameStore as any).setState({ player: { ...useGameStore.getState().player, activeEncounter: null, activeTravel: null, lastPlannedTravel: null, mapNodes: [{ id: 'a' }, { id: 'b' }], currentMapNode: 'a' } }); } catch (e) {}
  });

  it('creates activeEncounter.branchState.currentTemplateId from edge.templateId when interrupted', () => {
    const edges = [{ from: 'a', to: 'b', templateId: 'bandit_camp', encounter: { chance: 1.0, interrupt: true } }];
    const res = resolvePlannedEncountersAndMaybeInterrupt({ edges, fromNodeId: 'a', toNodeId: 'b', mode: 'walk' });
    const after = useGameStore.getState();
    expect(after.player.activeEncounter).not.toBeNull();
    expect(after.player.activeEncounter!.branchState).not.toBeNull();
    expect(after.player.activeEncounter!.branchState!.currentTemplateId).toBe('bandit_camp');
  });
});
