/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { getEncounterTemplate } from '../data/encounterTemplates';
import { useGameStore } from '../store/useGameStore';

describe('Encounter templates and pre-roll', () => {
  it('returns templates', () => {
    const tmpl = getEncounterTemplate('roadbandit_small');
    expect(tmpl).not.toBeNull();
    expect(tmpl.name).toBe('Road Bandit');
  });

  it('pre-rolls pending encounters when requested', () => {
    const store = useGameStore.getState();
    // set minimal map nodes/edges
    useGameStore.setState(state => ({ player: { ...state.player, mapNodes: [{ id: 'a' }, { id: 'b' }], mapEdges: [{ from: 'a', to: 'b', durationSeconds: 5, encounter: { chance: 1.0, interrupt: true, encounterId: 'roadbandit_small' } }], currentMapNode: 'a' } } as any));
    // mock RNG to ensure willTrigger = true
    jest.spyOn(global.Math, 'random').mockReturnValue(0.0);

    // call startTravel with preRollEncounters
    const active = (useGameStore.getState() as any).startTravel('b', { fromNodeId: 'a', mode: 'walk', preRollEncounters: true });
    expect(active).not.toBeNull();
    const meta = (useGameStore.getState() as any).player.activeTravel.meta;
    expect(meta.pendingEncounters && meta.pendingEncounters.length > 0).toBe(true);
    expect(meta.pendingEncounters[0].willTrigger).toBe(true);

    (global.Math.random as any).mockRestore();
  });
});
