import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';
import { GameInterface } from '@/components/game/GameInterface';

describe('GameInterface train button', () => {
  it('opens the TrainModal when Train button is clicked', () => {
    // Provide a minimal mocked store for rendering the UI
    mockUseGameStore({ ui: { currentScreen: 'game' }, player: { inventory: [] } });

  render(<GameInterface /> as any);

    // The Train button should be present in the cultivation panel
    const btn = screen.getByText('Train');
    expect(btn).toBeTruthy();

    fireEvent.click(btn);

  // The modal should show training options
  expect(screen.getByText(/Choose a training method/i)).toBeTruthy();
  // Use role lookup to avoid collisions with descriptive text elsewhere; allow multiple matches
  const cmpBtns = screen.getAllByRole('button', { name: /Comprehend Manual/i });
  expect(cmpBtns.length).toBeGreaterThanOrEqual(1);
  });
});
