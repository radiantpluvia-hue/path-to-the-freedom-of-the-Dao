import React from 'react';
import { render } from '@testing-library/react';
import { toHaveNoViolations, axe } from 'jest-axe';
import EventLog from '@/components/EventLog';
import { useGameStore } from '@/store/useGameStore';

expect.extend(toHaveNoViolations);

describe('EventLog accessibility', () => {
  beforeEach(() => {
    const s = useGameStore.getState();
    // Use getState and mutate in test via cast - this is test-only and avoids typing issues
    (s as any).eventLog = ['Welcome', 'You found a blade'];
  });

  it('has no basic a11y violations', async () => {
    const { container } = render(<EventLog />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
