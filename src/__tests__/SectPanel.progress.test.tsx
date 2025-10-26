import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

jest.resetModules();

test('Details toggle and objective progress update', () => {
  const story = { activeRandomMissions: [{
    id: 'm-prog-1',
    title: 'Progress Mission',
    description: 'Make progress',
    objectives: [{ description: 'Do thing', progress: 0, target: 3 }],
    reward: { yuan: 5 }
  }], completedQuests: [] } as any;

  const addEventLog = jest.fn();
  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    addEventLog('Progress made on mission: ' + m.title);
    return true;
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
  // our mock toggles story in-place but the component is not reactive to the mocked store
  // re-render to pick up the mutated story (tests commonly re-render after mutating mock state)
  render(React.createElement(SectPanel));
  expect(screen.getByText('Do thing')).toBeTruthy();
  expect(screen.getByText('0/3')).toBeTruthy();

  // Simulate progress update via store API
  updateMissionObjectiveProgress('m-prog-1', 0, 2);

  // Re-render to pick up mocked state changes
  // (component uses store reference; our mock mutated story in-place so UI should reflect on re-render)
  // Force re-render by requiring and rendering again (simple approach for test)
  render(React.createElement(SectPanel));

  expect(addEventLog).toHaveBeenCalledWith('Progress made on mission: Progress Mission');
  expect(screen.getByText('2/3')).toBeTruthy();
});
