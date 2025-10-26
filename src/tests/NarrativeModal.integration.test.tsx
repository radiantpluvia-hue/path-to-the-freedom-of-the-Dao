import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Ensure the mocked store exposes a spyable setUIProperty
jest.mock('@/store/useGameStore', () => {
  const setUIProperty = jest.fn();
  const mockState = {
    player: { name: 'Tester', destinyAffinity: 2, destinyHistory: [{ delta: 1, reason: 'quest' }] },
    ui: { currentScreen: 'game', compactLayout: false, selectedRival: null, showCodex: false, showNotes: false, showNarrative: false },
    narrativeEngine: { destinyThreads: [{ id: 't1', name: 'Compassion', strength: 2 }], karmaHistory: [] },
    setUIProperty,
  };
  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import DestinyAffinityBadge from '@/components/ui/DestinyAffinityBadge';

test('clicking View threads triggers showNarrative via store', () => {
  const store = require('@/store/useGameStore');
  const spy = store.useGameStore().setUIProperty;

  // Render the badge directly and pass an onOpenThreads handler that calls the store
  render(<DestinyAffinityBadge value={2} history={[{ delta: 1, reason: 'quest' }]} onOpenThreads={() => spy('showNarrative', true)} />);

  const wrapper = screen.getByLabelText(/Destiny Affinity/i);
  fireEvent.focus(wrapper);

  const btn = screen.getByText(/View threads/i);
  fireEvent.click(btn);

  expect(spy).toHaveBeenCalledWith('showNarrative', true);
});
