import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

describe('SectPanel', () => {
  test('renders member view and calls leaveSect and requestSectMission', () => {
    const leaveSect = jest.fn();
    const requestSectMission = jest.fn();
    const setUIProperty = jest.fn();
    const addEventLog = jest.fn();

    // reset module registry so each test can install its own mock state
    jest.resetModules();
    mockUseGameStore({
      player: { sect: 'test_sect', inventory: [{ id: 'x' }], spiritStones: { low: 0, mid: 0, high: 0 } },
      leaveSect,
      requestSectMission,
      setUIProperty,
      addEventLog,
      getSectReputation: (id: string) => 42,
    });

    // require after mocking so the module picks up the jest mock
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SectPanel = require('../components/game/SectPanel').default as React.ComponentType<any>;
    render(<SectPanel />);

  // member heading and reputation (match combined text)
  expect(screen.getByText(/Member of:/i)).toBeInTheDocument();
  expect(screen.getByText(/Reputation:\s*42/i)).toBeInTheDocument();

    // Request mission
    const requestBtn = screen.getByRole('button', { name: /Request Sect Mission/i });
    fireEvent.click(requestBtn);
    expect(requestSectMission).toHaveBeenCalled();

    // Leave sect
    const leaveBtn = screen.getByRole('button', { name: /Leave Sect/i });
    fireEvent.click(leaveBtn);
    expect(leaveSect).toHaveBeenCalled();
    expect(addEventLog).toHaveBeenCalledWith('You left your sect.');
  });

  test('renders non-member view and Browse Sects navigates to sects screen', () => {
    const setUIProperty = jest.fn();
  jest.resetModules();
  mockUseGameStore({ player: { sect: null, inventory: [] }, setUIProperty });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SectPanel = require('../components/game/SectPanel').default as React.ComponentType<any>;
  render(<SectPanel />);

  expect(screen.getByText(/You are not a member of any sect/i)).toBeInTheDocument();

    const browseBtn = screen.getByRole('button', { name: /Browse Sects/i });
    fireEvent.click(browseBtn);
    expect(setUIProperty).toHaveBeenCalledWith('currentScreen', 'sects');
  });
});
