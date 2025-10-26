import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// use our selector-aware helper
import { mockUseGameStore } from './testUtils/mockUseGameStore';

// install the store mock before importing components so module imports see the mock
const { setUIProperty } = mockUseGameStore({
  ui: { showNarrative: true },
  narrativeEngine: { destinyThreads: [{ id: 't1', name: 'Compassion', strength: 3 }] },
  player: { destinyAffinity: 5 },
});

import NarrativeModal from '@/components/ui/NarrativeModal';

test('NarrativeModal renders threads and affinity and Close calls setUIProperty', () => {
  render(<NarrativeModal />);

  // dialog should be present
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // shows player affinity
  expect(screen.getByText(/Player Affinity:/i)).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument();

  // shows thread
  expect(screen.getByText(/Compassion/i)).toBeInTheDocument();

  // clicking close should call setUIProperty('showNarrative', false)
  const btn = screen.getByLabelText('Close');
  fireEvent.click(btn);
  expect(setUIProperty).toHaveBeenCalledWith('showNarrative', false);
});
