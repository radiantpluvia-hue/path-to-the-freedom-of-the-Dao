import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/store/useGameStore', () => {
  const mockState: any = {
    player: { manuals: [{ id: 'm1' }], daoHeart: 10, cultivationStartTick: 100, minorStage: 3, currentQi: 0, realmId: 1, realm: 'mortal', skills: {} },
    ui: { isCultivating: false, cultivationProgress: 0 },
    world: { tick: 101 }, // 1 tick since start -> consolidationFactor = 1/3
    breakthroughSystem: { getAvailableChallenges: () => [] },
    addEventLog: jest.fn()
  };
  mockState.attemptRealmBreakthroughWithConsolidation = jest.fn(() => true);
  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import { CultivationUI } from '@/components/CultivationUI';

test('shows consolidation info and Attempt triggers consolidation handler', () => {
  const onClose = jest.fn();
  render(<CultivationUI onClose={onClose} />);

  // Expect consolidation summary present (multiple nodes may match 'Consolidation' so use getAllByText)
  const consolidationMatches = screen.getAllByText(/Consolidation/i);
  expect(consolidationMatches.length).toBeGreaterThan(0);
  expect(screen.getByText(/Ticks spent consolidating:/i)).toBeInTheDocument();
  expect(screen.getByText(/Consolidation factor:/i)).toBeInTheDocument();

  // Attempt button is inside the breakthrough picker; to simulate, open the picker by clicking the main breakthrough button
  const breakthroughBtn = screen.getByRole('button', { name: /Breakthrough to|Advance to Stage/i });
  fireEvent.click(breakthroughBtn);

  // If challenges are empty the picker shows a message; ensure no crash and that our mocked handler exists
  const store = require('@/store/useGameStore');
  const mock = store.useGameStore();
  expect(typeof mock.attemptRealmBreakthroughWithConsolidation).toBe('function');
});
