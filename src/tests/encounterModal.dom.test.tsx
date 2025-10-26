/** @jest-environment jsdom */
/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EncounterModal from '../components/game/EncounterModal';
import { useGameStore } from '../store/useGameStore';

// Minimal mocks for CombatSystem to detect when combat is started
jest.mock('../systems/CombatSystem', () => {
  return {
    CombatSystem: jest.fn().mockImplementation(() => ({ getState: () => ({ status: 'init' }) }))
  };
});

// Prevent the test from actually resolving/clearing encounters (which would unmount the modal
// and can cause hooks ordering errors). We'll spy and stub the resolver per-test when needed.
const travelSys = require('../systems/TravelEncounterSystem');

describe('EncounterModal DOM interactions', () => {
  beforeEach(() => {
    // ensure clean store
    try { (useGameStore as any).setState({ player: { ...useGameStore.getState().player, activeEncounter: null, activeTravel: null, yuan: 0, inventory: [] } }); } catch (e) {}
  });

  it('starts combat when Fight is clicked for a non-narrative encounter', () => {
    const store = useGameStore.getState();
    // set a simple activeEncounter with no narrative template
    useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: { encounterId: 'roadbandit_small', startedAtTick: store.world.tick, meta: {} } } } as any));

    render(<EncounterModal />);
    const fightBtn = screen.getByText('Fight');
    fireEvent.click(fightBtn);

    // CombatSystem mock should have been constructed and combat UI invoked (store.ui.currentScreen should be 'combat')
    const after = useGameStore.getState();
    expect(after.ui.currentScreen).toBe('combat');
  });

  it('records branch choice when clicking a narrative choice and grants reward when applicable', async () => {
    const store = useGameStore.getState();
    // place a narrative activeEncounter using a template with a reward choice from JSON
    const ae = { encounterId: 'merchant_deal', startedAtTick: store.world.tick, meta: {}, branchState: { currentTemplateId: 'merchant_deal', choiceHistory: [] } };
    useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: ae, yuan: 15, inventory: [] } } as any));

    // Stub the resolver to avoid unmounting the modal during the click handler
    const spy = jest.spyOn(travelSys, 'resolveActiveEncounterOutcome').mockImplementation(() => {});
    render(<EncounterModal />);
    // find the Buy button
    const buyBtn = screen.getByText(/Buy the trinket/i);
    expect(buyBtn).toBeTruthy();
    fireEvent.click(buyBtn);

    // After clicking, wait for the deferred branch history update and inventory addition
    await waitFor(() => {
      const s = useGameStore.getState();
      expect(s.player.activeEncounter!.branchState!.choiceHistory!.length).toBe(1);
    });
    await waitFor(() => {
      const s2 = useGameStore.getState();
      expect(s2.player.inventory.some((it: any) => it && (it.id === 'trinket_01' || it.name === 'Mysterious Trinket'))).toBe(true);
    });

    spy.mockRestore();
  });

  it('hides conditional choices when requirements are not met', () => {
    const store = useGameStore.getState();
    // use guard_challenge which has a requires itemId=permit_pass for one choice
    const ae = { encounterId: 'guard_challenge', startedAtTick: store.world.tick, meta: {}, branchState: { currentTemplateId: 'guard_challenge', choiceHistory: [] } };
    useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: ae, inventory: [] } } as any));

    render(<EncounterModal />);
    // 'Show permit' choice should be hidden because player lacks the item
    expect(screen.queryByText(/Show permit/i)).toBeNull();
    // 'Bribe the guard' and 'Refuse and fight' should be present
    expect(screen.getByText(/Bribe the guard/i)).toBeTruthy();
    expect(screen.getByText(/Refuse and fight/i)).toBeTruthy();
  });
});
