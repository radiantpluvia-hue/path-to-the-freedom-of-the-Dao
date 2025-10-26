import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

// We'll install the mock before requiring the component to ensure hooks are mocked
jest.resetModules();

test('Request button calls requestSectMission', () => {
  const story = { activeRandomMissions: [] as any[], completedQuests: [] } as any;
  const requestSectMission = jest.fn();
  mockUseGameStore({ player: { sect: 's1', inventory: [] }, story, requestSectMission });
  const SectPanel = require('../components/game/SectPanel').default;
  render(React.createElement(SectPanel));

  const reqBtn = screen.getByText('Request Sect Mission');
  fireEvent.click(reqBtn);
  expect(requestSectMission).toHaveBeenCalled();
});

test('Accept on an existing mission applies rewards and logs', () => {
  jest.resetModules();

  const story = { activeRandomMissions: [{
    id: 'm-test-1',
    title: 'Test Mission',
    description: 'Collect 1 herb',
    objectives: [{ description: 'Collect herb', progress: 1, target: 1 }],
    reward: { yuan: 42, spiritStones: { low: 2, mid: 0, high: 0 }, items: [{ id: 'minor_treasure', name: 'Minor Treasure' }] }
  }], completedQuests: [] } as any;

  const addEventLog = jest.fn();
  const addToInventory = jest.fn();
  const player = { sect: 's1', inventory: [], yuan: 0, spiritStones: { low: 0, mid: 0, high: 0 } } as any;

  const acceptSectMission = jest.fn((missionId: string) => {
    const m = story.activeRandomMissions.find((m: any) => m.id === missionId);
    if (m) {
      player.yuan += m.reward.yuan || 0;
      player.spiritStones.low += (m.reward.spiritStones?.low || 0);
      addToInventory(m.reward.items[0]);
      story.activeRandomMissions = story.activeRandomMissions.filter((x: any) => x.id !== missionId);
      story.completedQuests.push(missionId);
      addEventLog('Sect mission accepted and rewards applied.');
    }
  });

  mockUseGameStore({ player, story, addEventLog, addToInventory, acceptSectMission });
  const SectPanel = require('../components/game/SectPanel').default;
  render(React.createElement(SectPanel));

  // Mission visible
  expect(screen.getByText('Test Mission')).toBeTruthy();
  const acceptBtn = screen.getByText('Accept');
  fireEvent.click(acceptBtn);

  expect(addToInventory).toHaveBeenCalled();
  expect(addEventLog).toHaveBeenCalledWith('Sect mission accepted and rewards applied.');
});
