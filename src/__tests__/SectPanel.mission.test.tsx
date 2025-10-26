import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

const makeMission = (id = 'm1') => ({ id, title: 'Test Mission', description: 'Collect herbs', objectives: [] });

describe('SectPanel mission flow', () => {
  test('Accept calls completeMission or attemptMission', () => {
    jest.resetModules();
    const completeMission = jest.fn(() => true);
    const attemptMission = jest.fn(() => true);
    const story = { activeRandomMissions: [makeMission()] };

    mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, completeMission, attemptMission });
    // require after mocking
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SectPanel = require('../components/game/SectPanel').default as React.ComponentType<any>;
    render(<SectPanel />);

    expect(screen.getByText(/Test Mission/i)).toBeInTheDocument();
    const acceptBtn = screen.getByRole('button', { name: /Accept/i });
    fireEvent.click(acceptBtn);

    // either completeMission or attemptMission should have been called
    expect(completeMission.mock.calls.length + attemptMission.mock.calls.length).toBeGreaterThan(0);
  });

  test('Decline calls declineSectMission', () => {
    jest.resetModules();
    const declineSectMission = jest.fn();
    const story = { activeRandomMissions: [makeMission('m2')] };
    mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, declineSectMission });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SectPanel = require('../components/game/SectPanel').default as React.ComponentType<any>;
    render(<SectPanel />);

    const declineBtn = screen.getByRole('button', { name: /Decline/i });
    fireEvent.click(declineBtn);
    expect(declineSectMission).toHaveBeenCalledWith('m2');
  });
});
