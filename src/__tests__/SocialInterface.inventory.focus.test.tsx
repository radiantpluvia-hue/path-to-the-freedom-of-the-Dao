import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';
import { waitFor } from '@testing-library/react';

// Install a mock store that has focusInventory true
const { useGameStoreMock } = mockUseGameStore({
  ui: { currentScreen: 'social', focusInventory: true },
  world: { currentWorldType: 'mortal' }
});

// Import the component after installing the mock
import { SocialInterface } from '@/components/game/SocialInterface';

describe('SocialInterface inventory focus', () => {
  it('scrolls inventory into view when focusInventory is set', async () => {
    // Ensure scrollIntoView exists in this test environment, then spy on it
    if (!(Element.prototype as any).scrollIntoView) {
      (Element.prototype as any).scrollIntoView = function() { /* noop in test env */ };
    }
    const scrollSpy = jest.spyOn(Element.prototype as any, 'scrollIntoView').mockImplementation(() => undefined as any);

    render(<SocialInterface />);

    // The Inventory card title(s) should be present (component renders nested cards)
    expect(screen.queryAllByText(/🎒 Inventory/).length).toBeGreaterThanOrEqual(1);

    // Wait for the scrollIntoView call (the UI uses smooth scroll and timers)
    await waitFor(() => expect(scrollSpy).toHaveBeenCalled());

    // If an input exists inside the inventory, it should be focused (our UX enhancement)
    const input = screen.queryByPlaceholderText('Search items...');
    if (input) {
      await waitFor(() => expect(document.activeElement).toBe(input as HTMLElement));
    }

    scrollSpy.mockRestore();
  });
});
