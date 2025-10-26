import { useGameStore } from '@/store/useGameStore';
import DIALOGUES from '@/data/dialogues';

describe('dialogue system', () => {
  it('starts and advances a dialogue', () => {
  // operate on live store state for deterministic checks
  useGameStore.getState().stopDialogue?.();
  const res = useGameStore.getState().startDialogue('intro_village_elder');
  expect(res.success).toBe(true);
  let fresh = useGameStore.getState();
  expect(fresh.currentDialogue?.id).toBe('intro_village_elder');
  expect(fresh.currentLineIndex).toBe(0);
  // advance to player choice
  useGameStore.getState().advanceDialogue();
  fresh = useGameStore.getState();
  expect(fresh.currentLineIndex).toBe(1);
  // choose first option
  useGameStore.getState().chooseDialogueChoice(0);
  // after choosing, either advanced or branched
  fresh = useGameStore.getState();
  expect(fresh.currentDialogue).not.toBeNull();
  });
});
