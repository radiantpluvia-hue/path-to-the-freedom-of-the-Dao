import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/store/useGameStore', () => {
  const challenge = { id: 'mortal_mental', name: 'Dao Heart Refinement', description: 'Test', difficulty: 1, requirements: {}, rewards: {}, risks: [] };
  const mockState: any = {
    player: { manuals: [{ id: 'm1' }], daoHeart: 10, cultivationStartTick: 100, minorStage: 9, currentQi: 0, realmId: 1, realm: 'mortal', skills: {} },
    ui: { isCultivating: false, cultivationProgress: 0 },
    world: { tick: 100 },
    breakthroughSystem: { getAvailableChallenges: () => [challenge] },
    addEventLog: jest.fn()
  };
  return { useGameStore: jest.fn(() => mockState) };
});

import * as helpers from '@/utils/attemptHelpers';
import { CultivationUI } from '@/components/CultivationUI';

test('Proceed calls performBreakthroughAttempt with selected challengeId', () => {
  const spy = jest.spyOn(helpers, 'performBreakthroughAttempt').mockImplementation(() => true as any);
  render(<CultivationUI onClose={() => {}} />);

  const breakthroughBtn = screen.getByRole('button', { name: /Breakthrough to|Advance to Stage/i });
  fireEvent.click(breakthroughBtn);

  const attemptButton = screen.getByRole('button', { name: /Attempt/i });
  expect(attemptButton).toBeInTheDocument();
  fireEvent.click(attemptButton);

  const proceedBtn = screen.getByRole('button', { name: /Proceed/i });
  expect(proceedBtn).toBeInTheDocument();
  fireEvent.click(proceedBtn);

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith('mortal_mental');
  spy.mockRestore();
});
