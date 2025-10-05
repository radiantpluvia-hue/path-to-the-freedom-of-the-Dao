import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/store/useGameStore', () => ({
  useGameStore: jest.fn(() => ({
    startGame: jest.fn(),
    lifePhaseSystem: { renderNovel: () => 'A vivid opening line\nSecond line of the novel' },
    systems: {}
  }))
}));

import { CharacterCreation } from '@/components/game/CharacterCreation';

test('renders novel content from lifePhaseSystem.renderNovel', () => {
  render(<CharacterCreation />);
  const btn = screen.getByText(/View Full Novel/i);
  fireEvent.click(btn);
  const heading = screen.getByText(/Life Chronicle/i);
  expect(heading).toBeInTheDocument();
  // search only inside the modal content to avoid matching the preview text outside the modal
  const modalContent = heading.parentElement!;
  expect(within(modalContent).getByText(/A vivid opening line/i)).toBeInTheDocument();
});
