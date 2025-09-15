import { useGameStore } from '@/store/useGameStore';

describe('Lore System', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('should navigate through the lore correctly', () => {
    const store = useGameStore.getState();
    
    // Initial state
    expect(store.ui.currentLoreIndex).toBe(0);
    
    // Navigate to the next lore
    useGameStore.getState().nextLore();
    expect(useGameStore.getState().ui.currentLoreIndex).toBe(1);
    
    // Navigate to the next lore again
    useGameStore.getState().nextLore();
    expect(useGameStore.getState().ui.currentLoreIndex).toBe(2);
    
    // Skip to the end of the lore
    const loreLength = useGameStore.getState().taiYungLore.length;
    for (let i = 2; i < loreLength - 1; i++) {
      useGameStore.getState().nextLore();
    }
    
    // Check if it navigates to the end
    expect(useGameStore.getState().ui.currentLoreIndex).toBe(loreLength - 1);
    
    // Check if it transitions to the creation screen when going beyond the lore
    useGameStore.getState().nextLore();
    expect(useGameStore.getState().ui.currentScreen).toBe('creation');
    expect(useGameStore.getState().ui.showLore).toBe(false);
  });

  it('should skip lore correctly', () => {
    // Initial state
    expect(useGameStore.getState().ui.currentScreen).toBe('lore');
    expect(useGameStore.getState().ui.showLore).toBe(true);
    
    // Skip the lore
    useGameStore.getState().skipLore();
    
    // Should transition to creation screen
    expect(useGameStore.getState().ui.currentScreen).toBe('creation');
    expect(useGameStore.getState().ui.showLore).toBe(false);
  });
});
