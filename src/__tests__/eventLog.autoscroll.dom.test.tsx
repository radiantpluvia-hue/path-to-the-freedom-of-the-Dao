/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useGameStore } from '@/store/useGameStore';
import EventLog from '@/components/EventLog';

// This test ensures the event log auto-scrolls so the newest message is visible
// when a new event is appended. We check the scrollTop equals scrollHeight on the
// event log container after pushing a new entry.

describe('Event Log auto-scroll', () => {
  beforeEach(() => {
    // Reset store eventLog and ensure addEventLog exists
    const s = useGameStore.getState();
    useGameStore.setState({ eventLog: [], addEventLog: s.addEventLog } as any);
  });

    it('sets scrollTop to scrollHeight when a new event is added (mocked layout)', async () => {
    let container: HTMLElement | null = null;

    // Prepare many events first (wrap in act to avoid React update warnings)
    const manyEvents = Array.from({ length: 30 }, (_, i) => `Initial ${i}`);
    await act(async () => {
      useGameStore.setState({ eventLog: manyEvents } as any);
    });

    // Render EventLog directly (avoid mounting full GameInterface which brings in many
    // other components and can cause store snapshot loops in JSDOM test env).
    await act(async () => {
      render(<EventLog />);
    });

    // Query the EventLog container directly by test id
    container = screen.getByTestId('event-log-container') as HTMLElement | null;
    expect(container).not.toBeNull();

  // JSDOM doesn't compute layout sizes; mock sizes so we can assert scrollTop behavior
  Object.defineProperty(container!, 'scrollHeight', { value: 1200, configurable: true });
  Object.defineProperty(container!, 'clientHeight', { value: 200, configurable: true });
  // Ensure our mock applied
  expect(container!.scrollHeight).toBeGreaterThan(container!.clientHeight);

    // Now append a new event via the store's addEventLog (wrapped in act)
    const s = useGameStore.getState();
    if (typeof s.addEventLog === 'function') {
      await act(async () => {
        s.addEventLog('Newest event for auto-scroll test');
      });
    } else {
      await act(async () => {
        useGameStore.setState({ eventLog: [...manyEvents, 'Newest event for auto-scroll test'] } as any);
      });
    }

    // Wait for render (no-op act)
    await act(async () => {});

    // After update the container should have scrolled so newest message is visible
    // With column-reverse, visual top maps to scrollTop == scrollHeight
      expect(container!.scrollTop).toBe(container!.scrollHeight);
  });
});
