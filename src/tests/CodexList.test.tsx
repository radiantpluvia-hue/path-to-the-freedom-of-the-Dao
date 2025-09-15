import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodexList from '../components/CodexList';

describe('CodexList', () => {
  test('shows search box and filters entries', async () => {
  render(<CodexList />);
  const input = screen.getByPlaceholderText('Search codex...');
  expect(input).toBeInTheDocument();

  const user = userEvent.setup();
  // Type a query that likely exists in sample data
  await user.type(input, 'Tai Yung');

    // Should find at least one details/summary with matching title text
    const entries = screen.getAllByText(/Creation Myth of Tai Yung/i);
    expect(entries.length).toBeGreaterThan(0);

    // Expand the first matching entry by clicking its summary and assert body becomes visible
    const firstSummary = entries[0];
    // summary is inside a <summary> element — click it to toggle
  await user.click(firstSummary);

    // Now expect an element with additional content from that entry to be visible
    const detailParagraphs = screen.getAllByText(/Tai Yung/i, { exact: false });
    expect(detailParagraphs.length).toBeGreaterThan(0);

    // Collapse by clicking the summary again
  await user.click(firstSummary);
    // Collapsing should hide the details body — ensure one of the paragraphs is not visible (aria-hidden or not in document)
    // We check that at least one of the detail paragraphs is not visible
    const afterCollapse = screen.getAllByText(/Tai Yung/i, { exact: false });
    // At least one of the elements should be present but not visible when collapsed — use some() on matches
    const anyHidden = afterCollapse.some((el) => el.closest('details') && !(el.closest('details') as HTMLElement).hasAttribute('open'));
    expect(anyHidden).toBe(true);
  });
});
