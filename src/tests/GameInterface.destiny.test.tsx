import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useGameStore selector-aware so GameInterface reads expected player data
jest.mock('@/store/useGameStore', () => {
  const mockState = {
    player: { name: 'Tester', destinyAffinity: -1, cultivationPower: 10, insight: 5, karma: -2, spiritStones: { low: 1, mid: 0, high: 0 } },
    realms: {},
    ui: { currentScreen: 'game', compactLayout: false, selectedRival: null, showCodex: false, showNotes: false },
  world: { flags: { expelledFrom: false } },
  systems: { factionStandings: {}, sectReputations: {} },
  eventLog: [],
    getQuestsByType: () => [],
    getActiveEnhancedQuests: () => [],
    checkEnhancedQuestCompletion: () => ({ completed: [] }),
    checkDailyReset: () => {},
    setUIProperty: () => {},
    cultivate: () => {},
    explore: () => {},
    saveGame: () => {},
    loadGame: () => {},
  };
  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import { GameInterface } from '@/components/game/GameInterface';

test('shows destinyAffinity in character card and stats', () => {
  render(<GameInterface />);

  // Character area should include the numeric affinity (-1)
  expect(screen.getAllByText(/Destiny Affinity/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText('-1').length).toBeGreaterThan(0);

  // Stats card also shows the affinity label and Karma (allow multiple matches)
  expect(screen.getAllByText(/Karma/i).length).toBeGreaterThan(0);
});
