import { useGameStore } from '@/store/useGameStore';

// Runs before every test file; hide any tutorial/overlay UI that may block tests.
beforeAll(() => {
  try {
    const s = useGameStore.getState();
    // Common UI flags that tests expect to be false; adjust as needed for your store shape
    if ((s as any).ui) {
      (s as any).ui.showQuickTutorial = false;
      (s as any).ui.showTutorial = false;
    } else {
      // If store has direct flags
      (s as any).showQuickTutorial = false;
      (s as any).showTutorial = false;
    }
    // Also mark the first-run tutorial as seen in localStorage so the TutorialOverlay won't render
    try { localStorage.setItem('xg_tutorial_seen', '1'); } catch (e) { /* ignore */ }
  } catch (e) {
    // No-op if store not available during setup
  }
});
