import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';

describe('SaveLoadSystem realm normalization on load', () => {
  const KEY = (SaveLoadSystem as any).SAVE_KEY || 'cultivation_game_save';

  afterEach(() => {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  });

  test('backfills realmId when only realm string present', () => {
    const raw = { gameState: { player: { realm: 'true_immortal' } } };
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).toBeTruthy();
    const gs: any = (loaded as any).gameState || (loaded as any).migrated?.gameState;
    expect(gs.player.realm).toBe('true_immortal');
    expect(typeof gs.player.realmId).toBe('number');
  });

  test('backfills realm when only realmId present', () => {
    const raw = { gameState: { player: { realmId: 1 } } };
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).toBeTruthy();
    const gs: any = (loaded as any).gameState || (loaded as any).migrated?.gameState;
    expect(typeof gs.player.realm).toBe('string');
    expect(gs.player.realmId).toBe(1);
  });

  test('defaults when both missing', () => {
    const raw = { gameState: { player: {} } };
    localStorage.setItem(KEY, JSON.stringify(raw));
    const loaded = SaveLoadSystem.loadGame();
    expect(loaded).toBeTruthy();
    const gs: any = (loaded as any).gameState || (loaded as any).migrated?.gameState;
    expect(typeof gs.player.realm).toBe('string');
    expect(typeof gs.player.realmId).toBe('number');
  });
});
