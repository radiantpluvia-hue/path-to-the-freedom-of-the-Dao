import React from 'react';
import { render, screen, act } from '@testing-library/react';
import RealTimeTravelHUD from '@/components/game/RealTimeTravelHUD';
import { useGameStore } from '@/store/useGameStore';

describe('RealTimeTravelHUD DOM', () => {
  afterEach(() => {
    // clear active travel
    const s = useGameStore.getState();
    useGameStore.setState({ player: { ...s.player, activeTravel: null } } as any);
  });

  test('does not render when no active travel', async () => {
    const s = useGameStore.getState();
    useGameStore.setState({ player: { ...s.player, activeTravel: null } } as any);
    await act(async () => render(<RealTimeTravelHUD />));
    expect(document.body.textContent || '').not.toMatch(/Travelling to/i);
  });

  test('renders HUD when active travel present', async () => {
    const s = useGameStore.getState();
    const travel = { toNodeId: 'village_1', meta: { realTime: true, realTimeDurationSeconds: 10, arrivalEpochMs: Date.now() + 5000 } };
    useGameStore.setState({ player: { ...s.player, activeTravel: travel } } as any);
    await act(async () => render(<RealTimeTravelHUD />));
    expect(document.body.textContent || '').toMatch(/Travelling to village 1/i);
  });
});
