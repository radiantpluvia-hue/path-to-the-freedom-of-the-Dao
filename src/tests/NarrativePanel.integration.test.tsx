import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Integration smoke: mount NarrativePanel with a selector-aware mocked store
jest.mock('@/store/useGameStore', () => {
  const mockState = {
    narrativeEngine: { destinyThreads: [{ id: 't1', name: 'Compassion', strength: 2 }], karmaHistory: [] },
    player: { destinyAffinity: 1, karmicSeeds: [] }
  };
  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import NarrativePanel from '@/components/ui/NarrativePanel';

test('integration: narrative panel shows affinity badge and threads', () => {
  render(<NarrativePanel />);

  expect(screen.getByText(/Destiny Affinity/i)).toBeInTheDocument();
  expect(screen.getByText('+1')).toBeInTheDocument();
  expect(screen.getByText(/Compassion/i)).toBeInTheDocument();
});
