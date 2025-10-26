import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Comprehensive mock of useGameStore to support rendering GameInterface
jest.mock('@/store/useGameStore', () => {
  // mutable mock state so setUIProperty can modify it
  const mockState: any = {
    player: {
      name: 'Tester',
      destinyAffinity: 2,
      destinyHistory: [{ delta: 1, reason: 'quest' }],
      cultivationPower: 10,
      insight: 5,
      karma: -2,
      spiritStones: { low: 1, mid: 0, high: 0 },
      race: 'Human',
      gender: 'Male',
      age: 25,
      realm: 'mortal',
      realmId: 1,
      qiRequired: 100,
      currentQi: 20,
      minorStage: 1,
      cultivationDaysAllocated: 0,
      manuals: [],
      talentId: 'mortal',
      bloodline: null,
      physique: null,
      sect: null,
      defeatedRivals: [],
    },
    realms: { mortal: { name: 'Mortal Realm' } },
    eventLog: [],
    ui: { currentScreen: 'game', compactLayout: false, selectedRival: null, showCodex: false, showNotes: false, showNarrative: false },
    world: { flags: {} },
    story: { quests: [] },
    systems: {},
  getQuestsByType: () => [],
  getActiveEnhancedQuests: () => [],
  checkEnhancedQuestCompletion: () => ({ completed: [] }),
  checkDailyReset: () => {},
  // StoryEventPanel dependencies
  getAvailableEvents: () => [],
  triggerStoryEvent: () => false,
  makeStoryChoice: () => false,
  };

  const setUIProperty = jest.fn((key: any, value: any) => {
    // mutate the mock state so subsequent selectors would see it if needed
    mockState.ui = mockState.ui || {};
    mockState.ui[key] = value;
  });

  // add no-op functions expected by GameInterface
  mockState.cultivate = () => {};
  mockState.explore = () => {};
  mockState.saveGame = () => {};
  mockState.loadGame = () => {};
  mockState.clearQuestCompletionNotification = () => {};
  mockState.requestSectMission = () => {};
  mockState.seekRefuge = () => {};
  mockState.startRivalEncounter = () => {};
  mockState.startCombatWithRival = () => {};
  mockState.updateObjectiveProgress = () => {};
  mockState.setUIProperty = setUIProperty;
  mockState.setCultivationDaysAllocated = () => {};
  mockState.addEventLog = () => {};

  return { useGameStore: jest.fn((selector?: any) => (typeof selector === 'function' ? selector(mockState) : mockState)) };
});

import { GameInterface } from '@/components/game/GameInterface';

test('GameInterface: clicking View threads calls setUIProperty("showNarrative", true)', () => {
  const store = require('@/store/useGameStore');
  const spy = store.useGameStore().setUIProperty;

  render(<GameInterface />);

  // click the first visible 'View threads' button (stats card badge)
  const btns = screen.getAllByText(/View threads/i);
  expect(btns.length).toBeGreaterThan(0);
  fireEvent.click(btns[0]);

  expect(spy).toHaveBeenCalledWith('showNarrative', true);
});
