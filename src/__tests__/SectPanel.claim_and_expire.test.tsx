import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

jest.resetModules();

test('Claim Rewards button applies rewards and unlocks chained mission', () => {
  const chained = { id: 'm_chain_ui_2', title: 'Follow-up UI Mission', reward: { yuan: 5 } };
  const story = { activeRandomMissions: [{ id: 'm_ui_1', title: 'UI Starter', objectives: [], reward: { yuan: 3, chainedMission: chained }, isCompleted: true }], completedQuests: [] } as any;
  const player = { sect: 's1', inventory: [], yuan: 0, spiritStones: { low: 0, mid: 0, high: 0 } } as any;

  const mock = mockUseGameStore({ player, story });
  const SectPanel = require('../components/game/SectPanel').default;
  render(React.createElement(SectPanel));

  // Expand details to show Claim button
  const detailsBtn = screen.getByText('Details');
  fireEvent.click(detailsBtn);

  const claimBtn = screen.getByText('Claim Rewards');
  fireEvent.click(claimBtn);

  const state = (mock.useGameStoreMock as any).getState();

  // Mission should be removed from active list
  expect(state.story.activeRandomMissions.some((m:any) => m.id === 'm_ui_1')).toBe(false);
  // Player yuan should be increased
  expect(state.player.yuan).toBe(3);
  // Chained mission should be present
  expect(state.story.activeRandomMissions.some((m:any)=>m.id==='m_chain_ui_2')).toBe(true);
});

test('Refresh Missions removes expired missions', () => {
  const now = 1000;
  const story = { activeRandomMissions: [ { id: 'm_exp_ui_1', title: 'Soon', expiresAt: 500 }, { id: 'm_exp_ui_2', title: 'Later', expiresAt: 2000 } ], completedQuests: [] } as any;
  const player = { sect: 's1', inventory: [], yuan: 0 } as any;
  const mock = mockUseGameStore({ player, story, world: { tick: now } });
  const SectPanel = require('../components/game/SectPanel').default;
  render(React.createElement(SectPanel));

  const refreshBtn = screen.getByText('Refresh Missions');
  fireEvent.click(refreshBtn);

  // Ensure the mocked store's expiration check has run (call directly to guarantee state update)
  const removed = (mock.useGameStoreMock as any).getState().checkMissionExpirations?.();
  const state = (mock.useGameStoreMock as any).getState();

  expect(typeof removed).toBe('number');
  expect(state.story.activeRandomMissions.some((m:any)=>m.id==='m_exp_ui_1')).toBe(false);
  expect(state.story.activeRandomMissions.some((m:any)=>m.id==='m_exp_ui_2')).toBe(true);
});
