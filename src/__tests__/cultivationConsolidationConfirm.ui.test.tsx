import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/store/useGameStore', () => {
  const challenge = { id: 'mortal_mental', name: 'Dao Heart Refinement', description: 'Test', difficulty: 1, requirements: {}, rewards: {}, risks: [] };
  const mockState: any = {
    // Set minorStage to the realm's max (9) so the major realm breakthrough picker is shown
    player: { manuals: [{ id: 'm1' }], daoHeart: 10, cultivationStartTick: 100, minorStage: 9, currentQi: 0, realmId: 1, realm: 'mortal', skills: {} },
    ui: { isCultivating: false, cultivationProgress: 0 },
    world: { tick: 100 }, // 0 ticks -> consolidationFactor 0 -> penalty = daoHeart (10) catastrophic
    breakthroughSystem: { getAvailableChallenges: () => [challenge] },
    addEventLog: jest.fn()
  };
  mockState.attemptRealmBreakthroughWithConsolidation = jest.fn(() => true);
  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import { CultivationUI } from '@/components/CultivationUI';

test('shows confirmation when penalty catastrophic and Proceed calls store handler', () => {
  render(<CultivationUI onClose={() => {}} />);

  // Open breakthrough picker by clicking the main breakthrough button
  const breakthroughBtn = screen.getByRole('button', { name: /Breakthrough to|Advance to Stage/i });
  fireEvent.click(breakthroughBtn);

  // The picker should render our single challenge and show an Attempt button
  const attemptButton = screen.getByRole('button', { name: /Attempt/i });
  expect(attemptButton).toBeInTheDocument();
  fireEvent.click(attemptButton);

  // Now the confirmation modal should be visible because penalty is catastrophic
  const proceedBtn = screen.getByRole('button', { name: /Proceed/i });
  expect(proceedBtn).toBeInTheDocument();
  fireEvent.click(proceedBtn);

  // For safety, assert our mocked handler exists and was called once after Proceed
  const store = require('@/store/useGameStore');
  const mock = store.useGameStore();
  expect(typeof mock.attemptRealmBreakthroughWithConsolidation).toBe('function');
  expect(mock.attemptRealmBreakthroughWithConsolidation).toHaveBeenCalledTimes(1);
});
