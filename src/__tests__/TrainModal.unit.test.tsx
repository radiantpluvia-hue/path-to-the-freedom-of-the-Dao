import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

describe('TrainModal additional UI tests', () => {
  afterEach(() => jest.restoreAllMocks());

  // Install a single mocked store and a single TrainModal module instance so the
  // component always calls the same mocked hook function. This avoids module cache
  // and mocking-order issues where different tests reinstall different mocks.
  let useGameStoreMock: any;
  let TrainModal: any;
  beforeAll(() => {
    const res = mockUseGameStore({ player: { realm: 1, inventory: {} } });
    useGameStoreMock = res.useGameStoreMock;
    // require the UI after the mock is installed so it binds to the mocked hook
    TrainModal = require('../ui/trainModal').default;
  });

  it('disables Start when required items are missing', () => {
    // Player missing sacrificial_incense needed for heart_demon_confrontation
    (useGameStoreMock as any).setState({ player: { realm: 8, inventory: {} } });
    render(<TrainModal open={true} onClose={() => {}} />);

    // find the training row by its name
    const row = screen.getByText(/Heart Demon Confrontation/i)?.closest('.training-row') || screen.getByText(/Heart Demon Confrontation/i)?.parentElement;
    expect(row).toBeTruthy();
    const btn = within(row as HTMLElement).getByRole('button', { name: /start/i });
    expect(btn).toBeDisabled();
  });

  it('shows confirmation dialog and calls startTraining when confirming high-risk training', () => {
    const startMock = jest.fn(() => ({ ok: true }));
    // Provide required item so Start is enabled
    const player = { realm: 8, inventory: { sacrificial_incense: 1 }, cooldowns: {}, trainingQueue: null };
    // Update the mocked store state to include the player and the mocked startTrainingById
    (useGameStoreMock as any).setState({ player, startTrainingById: startMock });
    // Sanity-check the training helper directly with the player shape used in the test
    const { hasRequiredItems } = require('../game/training');
    expect(hasRequiredItems(player, ['sacrificial_incense'])).toBe(true);
    render(<TrainModal open={true} onClose={() => {}} />);

    // find the Heart Demon row and click Start (should open confirmation)
    const row = screen.getByText(/Heart Demon Confrontation/i)?.closest('.training-row') || screen.getByText(/Heart Demon Confrontation/i)?.parentElement;
    expect(row).toBeTruthy();
    const startBtn = within(row as HTMLElement).getByRole('button', { name: /start/i });
    expect(startBtn).not.toBeDisabled();
    fireEvent.click(startBtn);

    // Confirmation dialog should appear — find the dialog that contains the confirmation text
    const dialogs = screen.getAllByRole('dialog', { hidden: true });
    const confirm = dialogs.find(d => /This training may have severe consequences/i.test(d.textContent || '')) || screen.getByText(/This training may have severe consequences/i);
    expect(confirm).toBeTruthy();

    // Click Confirm (button text may be 'Confirm')
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    // startTrainingById mock should have been called
    expect(startMock).toHaveBeenCalled();
  });
});
