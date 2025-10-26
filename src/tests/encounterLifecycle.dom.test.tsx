/** @jest-environment jsdom */
/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EncounterModal from '../components/game/EncounterModal';
import { useGameStore } from '../store/useGameStore';

describe('EncounterModal full lifecycle (resume travel)', () => {
  beforeEach(() => {
    try { (useGameStore as any).setState({ player: { ...useGameStore.getState().player, activeEncounter: null, lastPlannedTravel: null, yuan: 0, inventory: [] } }); } catch (e) {}
  });

  it('unmounts and resumes travel when a peace consequence resolves', async () => {
    const store = useGameStore.getState();
    // create a narrative template we can use
    const tpl = { id: 'life_test', title: 'Test', body: 'Test', choices: [ { id: 'c_peace', text: 'Make peace', consequence: 'peace' } ] };
    (require('../data/encounterNarratives') as any).ENCOUNTER_NARRATIVES['life_test'] = tpl;

    // set last planned travel so resolver will resume
    useGameStore.setState(state => ({ player: { ...state.player, lastPlannedTravel: { toNodeId: 'destX', opts: { mode: 'walk' } }, activeEncounter: { encounterId: 'life_test', startedAtTick: state.world.tick, branchState: { currentTemplateId: 'life_test', choiceHistory: [] } } } } as any));

    // mock startTravel on the store to detect resume without performing real navigation
    let startedArgs: any = null;
    (useGameStore.getState() as any).startTravel = (toNodeId: string | null, opts: any) => { startedArgs = { toNodeId, opts }; return null; };

    const { unmount } = render(<EncounterModal />);
    // click the Make peace button
    const btn = screen.getByText(/Make peace/i);
    fireEvent.click(btn);

    // wait for resolver to run and startTravel to be invoked
    await waitFor(() => expect(startedArgs).not.toBeNull());

    // after resolution, modal should unmount (activeEncounter cleared)
    const s = useGameStore.getState();
    expect(s.player.activeEncounter).toBeNull();
    expect(startedArgs.toNodeId).toBe('destX');

    unmount();
  });
});
