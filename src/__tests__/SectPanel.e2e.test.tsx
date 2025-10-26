import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

jest.resetModules();

test('End-to-end: mission objective updated by external system is reflected in UI and event log', () => {
  const story = { activeRandomMissions: [{
    id: 'm-e2e-1',
    title: 'E2E Mission',
    description: 'External update',
    objectives: [{ description: 'Collect shards', progress: 0, target: 2 }],
    reward: { yuan: 3 }
  }], completedQuests: [] } as any;

  const addEventLog = jest.fn();

  // Provide the real updateMissionObjectiveProgress implementation inside the mock so
  // external systems can call it as they would in production.
  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    addEventLog('External system updated mission progress: ' + m.title);
    return true;
  });

  // Simulate an external system that will call into the store's update API when triggered
  const externalSystemTrigger = jest.fn((missionId: string) => {
    // In production, this would be something like sharedMissionSystem.onEvent -> store.updateMissionObjectiveProgress
    return updateMissionObjectiveProgress(missionId, 0, 1);
  });

  const toggleMissionDetails = jest.fn((missionId: string) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m._uiExpanded = !m._uiExpanded;
    return m._uiExpanded;
  });

  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, updateMissionObjectiveProgress, addEventLog, toggleMissionDetails });
  const SectPanel = require('../components/game/SectPanel').default;
  render(React.createElement(SectPanel));

  // Open details
  const detailsBtn = screen.getByText('Details');
  fireEvent.click(detailsBtn);
  render(React.createElement(SectPanel));
  expect(screen.getByText('Collect shards')).toBeTruthy();
  expect(screen.getByText('0/2')).toBeTruthy();

  // Trigger external system to update mission progress
  externalSystemTrigger('m-e2e-1');

  // Re-render to pick up mutated mock story
  render(React.createElement(SectPanel));

  expect(addEventLog).toHaveBeenCalledWith('External system updated mission progress: E2E Mission');
  expect(screen.getByText('1/2')).toBeTruthy();
});
