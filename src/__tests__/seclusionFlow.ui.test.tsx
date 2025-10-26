import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/store/useGameStore', () => {
  const mockState: any = {
    player: { cultivationDaysAllocated: 365, manuals: [], skills: {} },
    ui: { seclusionProgress: 100, seclusionReadyForBreakthrough: true },
  };
  mockState.enterSeclusion = jest.fn(() => { mockState.ui.isInSeclusion = true; });
  mockState.exitSeclusion = jest.fn(() => { mockState.ui.isInSeclusion = false; });
  mockState.performSeclusionStudy = jest.fn(() => {});
  mockState.attemptRealmBreakthroughWithConsolidation = jest.fn(() => {});
  mockState.addEventLog = jest.fn(() => {});

  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import SeclusionPanel from '@/components/SeclusionPanel';

test('SeclusionPanel shows progress and attempts breakthrough when ready', () => {
  const store = require('@/store/useGameStore');
  const mock = store.useGameStore();
  render(<SeclusionPanel />);

  expect(screen.getByText(/Seclusion Progress:/i)).toBeInTheDocument();
  const btn = screen.getByRole('button', { name: /Attempt Breakthrough/i });
  expect(btn).toBeEnabled();
  fireEvent.click(btn);
  expect(mock.attemptRealmBreakthroughWithConsolidation).toHaveBeenCalledWith('seclusion_auto');
});
