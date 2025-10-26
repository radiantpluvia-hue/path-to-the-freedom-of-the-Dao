import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock minimal store shape so NarrativePanel can render predictably
jest.mock('@/store/useGameStore', () => {
  const mockState = {
    narrativeEngine: { destinyThreads: [{ id: 't1', name: 'Compassion', strength: 2 }], karmaHistory: [] },
    player: { destinyAffinity: 2, karmicSeeds: [] }
  };
  return {
    useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState))
  };
});

import NarrativePanel from '@/components/ui/NarrativePanel';

test('renders destinyAffinity value and threads', () => {
  render(<NarrativePanel />);

  // Affinity label and numeric value
  expect(screen.getByText(/Destiny Affinity/i)).toBeInTheDocument();
  expect(screen.getByText('+2')).toBeInTheDocument();

  // Thread from mocked engine
  expect(screen.getByText(/Compassion/i)).toBeInTheDocument();
});
