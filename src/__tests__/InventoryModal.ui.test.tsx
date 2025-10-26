import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// Note: jest-dom assertions are available in the test environment via project setup
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

// Install the mocked store and then import the component under test
const { useGameStoreMock, setUIProperty } = mockUseGameStore({
  ui: { currentScreen: 'game', showInventoryModal: false },
  player: {
    inventory: [],
    spiritStones: { low: 0, mid: 0, high: 0 },
    hp: 100,
    maxHp: 100,
    currentQi: 0,
    qiRequired: 100,
    cultivationPower: 0,
    insight: 0,
    karma: 0,
    yuan: 0,
    stats: { atk: 0, def: 0, speed: 0 }
  },
  eventLog: [],
  realms: { default: { name: 'Default Realm' } },
  world: { currentWorldType: 'mortal', flags: { expelledFrom: false } },
  // Minimal system stubs required by GameInterface
  getQuestsByType: (_type: string) => [],
  getActiveEnhancedQuests: () => [],
  checkEnhancedQuestCompletion: () => ({ completed: [] }),
  checkDailyReset: () => {},
  requestSectMission: () => {},
  startRivalEncounter: () => {},
  startCombatWithRival: () => {},
  updateObjectiveProgress: () => {},
  clearQuestCompletionNotification: () => {},
  addEventLog: () => {},
  saveGame: () => {},
  loadGame: () => {},
});

// Import after mock installed
import { GameInterface } from '@/components/game/GameInterface';

describe('Inventory modal behavior', () => {
  it('opens inventory modal when Inventory button is clicked', async () => {
    render(<GameInterface />);

  // Find the Game Management Inventory button (has emoji prefix)
  const invBtn = screen.getByText(/🎒\s*Inventory/);
    expect(invBtn).toBeInTheDocument();

    // Click it
  fireEvent.click(invBtn);

    // The click should request the UI to show the inventory modal via setUIProperty
    expect(setUIProperty).toHaveBeenCalledWith('showInventoryModal', true);
  });
});
