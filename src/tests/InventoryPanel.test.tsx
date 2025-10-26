import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// Use actual InventoryPanel but mock the store hooks
import InventoryPanel from '../components/game/InventoryPanel';

// We'll mock useGameStore to provide deterministic data and spies
jest.mock('../store/useGameStore', () => {
  const actual = jest.requireActual('../store/useGameStore');
  // Provide a fake implementation that returns fixed player state and spies
  const fakeStore = {
    player: {
      inventory: [
        { id: 'qi_gathering_pill', name: 'Qi Pill', description: 'Restores qi', quantity: 2 },
        { id: 'qi_gathering_pill', name: 'Qi Pill', description: 'Restores qi', quantity: 3 },
        { id: 'mortal_jian', name: 'Mortal Jian', description: 'A basic sword', quantity: 1, slot: 'weapon' }
      ],
      equipment: { mainHand: null }
    },
    useItem: jest.fn((idx:number) => {}),
    removeInventoryAt: jest.fn((idx:number) => {}),
    removeFromInventoryById: jest.fn((id:string, qty?:number) => {}),
    // equip helpers
    // note: some code paths call (useGameStore as any).equipItem; return a function
    equipItem: jest.fn((slot:string, item:any) => {}),
    unequipItem: jest.fn((slot:string) => {}),
  };

  // Return a function that selects keys like the real hook
  return {
    useGameStore: (selector?: any) => {
      if (!selector) return fakeStore;
      return selector(fakeStore);
    }
  };
});

describe('InventoryPanel', () => {
  test('renders grouped items and supports search and expansion', () => {
    render(<InventoryPanel />);

    // Search box present
    const search = screen.getByPlaceholderText(/Search items.../i);
    expect(search).toBeInTheDocument();

    // Should show grouped Qi Pill with Qty: 5
    const pillRow = screen.getByText(/Qi Pill/i);
    expect(pillRow).toBeInTheDocument();
    const qty = screen.getByText(/Qty: 5/);
    expect(qty).toBeInTheDocument();

    // Filter to Mortal Jian only
    fireEvent.change(search, { target: { value: 'mortal' } });
    expect(screen.queryByText(/Qi Pill/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Mortal Jian/i)).toBeInTheDocument();

    // Clear search
    fireEvent.change(search, { target: { value: '' } });

    // Expand the Qi Pill group
    const pillGroup = screen.getByText(/Qi Pill/i).closest('.inventory-row');
    expect(pillGroup).toBeTruthy();
    if (pillGroup) fireEvent.click(pillGroup);

    // After expand, individual stacks should appear
    expect(screen.getByText(/Individual stacks/i)).toBeInTheDocument();

    // Click Remove All
    const removeBtn = screen.getByText(/Remove All/i);
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);

    // Verify removeFromInventoryById called (the mock function lives inside the mocked store selectors)
    const useGameStore = require('../store/useGameStore').useGameStore as any;
    const removeSpy = useGameStore((s:any)=>s.removeFromInventoryById);
    expect(removeSpy).toHaveBeenCalledWith('qi_gathering_pill', 5);
  });
});
