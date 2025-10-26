import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DestinyAffinityBadge from '@/components/ui/DestinyAffinityBadge';

test('renders positive, negative and zero affinity correctly', () => {
  const { rerender } = render(<DestinyAffinityBadge value={3} />);
  expect(screen.getByText('+3')).toBeInTheDocument();

  rerender(<DestinyAffinityBadge value={-2} />);
  expect(screen.getByText('-2')).toBeInTheDocument();

  rerender(<DestinyAffinityBadge value={0} />);
  expect(screen.getByText('0')).toBeInTheDocument();
});

test('mini-panel hidden by default, shown on focus, and View threads calls callback', async () => {
  const history = [{ delta: 2, reason: 'quest' }, { delta: -1, reason: 'loss' }];
  const onOpen = jest.fn();
  const { getByLabelText, queryByText, getByText } = render(<DestinyAffinityBadge value={1} history={history} onOpenThreads={onOpen} />);

  // by label (tabIndex set) we can focus the wrapper
  const wrapper = getByLabelText(/Destiny Affinity\s*\+?1/);

  // mini-panel should be hidden initially
  expect(queryByText('No recent changes')).not.toBeInTheDocument();

  // focus should show the mini-panel
  fireEvent.focus(wrapper);
  await waitFor(() => expect(getByText(/\+2/)).toBeInTheDocument());

  // clicking View threads calls the callback
  const btn = getByText('View threads');
  fireEvent.click(btn);
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test('shows history and calls onOpenThreads', () => {
  const history = [{ delta: 1, reason: 'Helped' }, { delta: -2, reason: 'Betrayal' }];
  const onOpen = jest.fn();
  render(<DestinyAffinityBadge value={-1} history={history} onOpenThreads={onOpen} />);

  // badge value
  expect(screen.getByText('-1')).toBeInTheDocument();

  // history items are shown
  expect(screen.getByText(/Helped/)).toBeInTheDocument();
  expect(screen.getByText(/Betrayal/)).toBeInTheDocument();

  // click View threads triggers callback
  const btn = screen.getByText(/View threads/i);
  btn.click();
  expect(onOpen).toHaveBeenCalled();
});
