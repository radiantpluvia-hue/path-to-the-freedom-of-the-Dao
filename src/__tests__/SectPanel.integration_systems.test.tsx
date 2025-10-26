import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

jest.resetModules();

test('Integration: mission progress reported by MissionSystem helper updates UI and logs', () => {
  const story = { activeRandomMissions: [{
    id: 'm-sys-1',
    title: 'System Mission',
    description: 'Progress driven by system',
    objectives: [{ description: 'Gather ore', progress: 0, target: 2 }],
    reward: { yuan: 2 }
  }], completedQuests: [] } as any;

  const addEventLog = jest.fn();

  // Provide a real updateMissionObjectiveProgress that mutates story in-place
  const updateMissionObjectiveProgress = jest.fn((missionId: string, idx: number, delta = 1) => {
    const m = story.activeRandomMissions.find((x: any) => x.id === missionId);
    if (!m) return false;
    m.objectives[idx].progress = (m.objectives[idx].progress || 0) + delta;
    addEventLog('System reported progress on: ' + m.title);
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
  const { reportMissionObjectiveProgress } = require('../systems/MissionSystem');

  render(React.createElement(SectPanel));

  // Open details
  const detailsBtn = screen.getByText('Details');
  fireEvent.click(detailsBtn);
  render(React.createElement(SectPanel));
  expect(screen.getByText('Gather ore')).toBeTruthy();
  expect(screen.getByText('0/2')).toBeTruthy();

  // Call the system helper which should call into the store mock's update
  reportMissionObjectiveProgress('m-sys-1', 0, 1);

  // Re-render to pick up mutated mock state
  render(React.createElement(SectPanel));

  expect(addEventLog).toHaveBeenCalledWith('System reported progress on: System Mission');
  expect(screen.getByText('1/2')).toBeTruthy();
});
