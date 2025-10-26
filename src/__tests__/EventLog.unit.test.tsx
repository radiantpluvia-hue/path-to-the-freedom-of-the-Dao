/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React from 'react';
import { render, act } from '@testing-library/react';
import EventLog from '@/components/EventLog';
import { useGameStore } from '@/store/useGameStore';

describe('EventLog component unit', () => {
  beforeEach(() => {
    // ensure a clean eventLog
    const s = useGameStore.getState();
    useGameStore.setState({ eventLog: [], addEventLog: s.addEventLog } as any);
  });

  it('writes scrollTop equal to scrollHeight on ref when events append', () => {
    const mockRef: any = { current: null };

    // initial render with empty log
    render(<EventLog forwardedRef={mockRef} />);

    const el = mockRef.current as HTMLElement;
    expect(el).toBeTruthy();

    // mock sizes on the real DOM element (JSDOM doesn't compute layout)
    Object.defineProperty(el, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true });
    // ensure initial state
    el.scrollTop = 0;

    const s = useGameStore.getState();
    act(() => {
      // simulate adding events which should trigger the auto-scroll effect
      s.addEventLog('one');
      s.addEventLog('two');
      // update scrollHeight to simulate more content
      Object.defineProperty(el, 'scrollHeight', { value: 800, configurable: true });
    });

    // After the store update and effect, scrollTop should be set to scrollHeight
    expect(el.scrollTop).toBe(el.scrollHeight);
  });
});
