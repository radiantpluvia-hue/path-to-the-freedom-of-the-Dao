import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useGameStore similarly to other UI tests
jest.mock('@/store/useGameStore', () => {
  const mockState: any = {
    player: {
      name: 'Tester',
      manuals: [],
      cultivationPower: 0,
      insight: 0,
      karma: 0,
      spiritStones: { low: 0, mid: 0, high: 0 },
      race: 'Human',
      gender: 'Male',
      age: 20,
      realm: 'mortal',
      realmId: 1,
      qiRequired: 100,
      currentQi: 0,
      minorStage: 1,
      cultivationDaysAllocated: 0,
      talentId: null,
      bloodline: null,
      physique: null,
      sect: null,
      defeatedRivals: [],
    },
    realms: { mortal: { name: 'Mortal Realm' } },
    eventLog: [],
    ui: { currentScreen: 'game', compactLayout: false, selectedRival: null, showCodex: false, showNotes: false, showNarrative: false, isCultivating: false },
    world: { flags: {} },
    story: { quests: [] },
    systems: {},
    getQuestsByType: () => [],
    getActiveEnhancedQuests: () => [],
    checkEnhancedQuestCompletion: () => ({ completed: [] }),
    checkDailyReset: () => {},
  };

  const setUIProperty = jest.fn((key: any, value: any) => {
    mockState.ui = mockState.ui || {};
    mockState.ui[key] = value;
  });

  mockState.cultivate = jest.fn(() => {});
  mockState.explore = jest.fn(() => {});
  mockState.saveGame = jest.fn(() => {});
  mockState.loadGame = jest.fn(() => {});
  mockState.clearQuestCompletionNotification = jest.fn(() => {});
  mockState.requestSectMission = jest.fn(() => {});
  mockState.seekRefuge = jest.fn(() => {});
  mockState.startRivalEncounter = jest.fn(() => {});
  mockState.startCombatWithRival = jest.fn(() => {});
  mockState.updateObjectiveProgress = jest.fn(() => {});
  mockState.setUIProperty = setUIProperty;
  mockState.setCultivationDaysAllocated = jest.fn(() => {});
  mockState.addEventLog = jest.fn(() => {});

  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import { GameInterface } from '@/components/game/GameInterface';

test('Cultivate button is disabled without manuals and clicking logs an event', () => {
  const store = require('@/store/useGameStore');
  const mock = store.useGameStore();
  const addEventLog = mock.addEventLog;

  render(<GameInterface />);

  // Find the small cultivate button in the Cultivation Progress card — it should be clickable so the
  // handler can provide user feedback when no manual exists.
  const btn = screen.getByRole('button', { name: /cultivate/i });
  expect(btn).toBeEnabled();

  // Simulate click and ensure addEventLog was called with helpful message
  fireEvent.click(btn);
  expect(addEventLog).toHaveBeenCalledWith('You need a cultivation manual to cultivate. Find one via Work or Explore.');
});
