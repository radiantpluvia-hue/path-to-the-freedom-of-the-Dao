import fs from 'fs';
import path from 'path';
import { useGameStore } from '../src/store/useGameStore';
import DIALOGUES from '../src/data/dialogues';

describe('Assets and dialogue smoke', () => {
  test('music file was copied to public assets', () => {
    const dest = path.resolve(__dirname, '..', 'public', 'assets', 'music', 'china-chinese-asian-music-346568.mp3');
    expect(fs.existsSync(dest)).toBe(true);
  });

  test('startDialogue sets currentDialogue in store', () => {
    const store = useGameStore.getState();
    const dialog = DIALOGUES.find(d => d.id === 'intro_village_elder');
    expect(dialog).toBeDefined();
    // Start the dialogue via store API
    store.startDialogue?.(dialog as any);
    const s = useGameStore.getState();
    expect(s.currentDialogue?.id).toBe('intro_village_elder');
  });
});
