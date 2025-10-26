/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// Ensure the store hook is mocked so the component can render in isolation
// Mock the game store module before importing the component so heavy/complex
// real store initialization doesn't run during the test.
jest.mock('@/store/useGameStore', () => ({
  useGameStore: jest.fn(() => ({
    startGame: jest.fn(),
    lifePhaseSystem: null,
    systems: {},
  }))
}));

import { CharacterCreation } from '@/components/game/CharacterCreation';

test('opens LifeNovelModal when View Full Novel clicked', () => {
  render(<CharacterCreation />);

  // The button should exist and open the modal
  const btn = screen.getByText(/View Full Novel/i);
  expect(btn).toBeInTheDocument();

  fireEvent.click(btn);

  // Modal heading
  const heading = screen.getByText(/Life Chronicle/i);
  expect(heading).toBeInTheDocument();

  // With no life recorded in the mocked store, the modal should show the fallback message
  const modalContent = heading.parentElement!;
  expect(within(modalContent).getByText(/No life recorded yet\./i)).toBeInTheDocument();
});
