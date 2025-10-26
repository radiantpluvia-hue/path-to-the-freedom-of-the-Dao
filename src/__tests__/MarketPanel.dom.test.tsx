import React from 'react';
import { render, screen, act } from '@testing-library/react';
import MarketPanel from '@/components/game/MarketPanel';
import { useGameStore } from '@/store/useGameStore';

describe('MarketPanel DOM', () => {
  beforeEach(() => {
    // Ensure store provides safe market fallbacks
    const s = useGameStore.getState();
    useGameStore.setState({
      listMarkets: () => [],
      listMarketItems: (mid?: string) => [],
      listActiveAuctions: () => [],
      listPlayerMarketInventory: () => ({}),
      purchaseFromMarket: () => false,
    } as any);
  });

  test('shows no items placeholder when market empty', async () => {
    await act(async () => {
      render(<MarketPanel />);
    });
    expect(screen.getByText(/No items available/i)).toBeInTheDocument();
  });
});
