import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

describe('Load confirmation modal', () => {
  it('shows confirmation and calls loadGame on confirm', () => {
    const loadGameMock = jest.fn();
    const { useGameStoreMock } = mockUseGameStore({ ui: { currentScreen: 'game', saveInProgress: false }, loadGame: loadGameMock });

    // import the component after installing the mock so its module-level import is mocked
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const TopBar = require('@/components/game/TopBar').default;

    render(<TopBar currentScreen="game" setUIProperty={() => {}} />);

    const loadBtn = screen.getByTitle('Load game');
    expect(loadBtn).toBeInTheDocument();

    // Click load — should open modal rather than calling loadGame directly
    fireEvent.click(loadBtn);

    // Modal title should be visible
    expect(screen.getByText(/Load saved game\?/i)).toBeInTheDocument();

    // Confirm button should call loadGame
    const confirmBtn = screen.getByText(/Confirm/i);
    fireEvent.click(confirmBtn);

    expect(loadGameMock).toHaveBeenCalled();

    // Cleanup mock
    (useGameStoreMock as any).mockRestore?.();
  });
});
