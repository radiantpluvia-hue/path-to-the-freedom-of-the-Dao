import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import DialogueBox from '../src/components/game/DialogueBox';
import { useGameStore } from '../src/store/useGameStore';

jest.useFakeTimers();

test('timed choice shows countdown and auto-selects default', () => {
  const store = useGameStore.getState();
  // create a short timed dialogue
  const dlg = { id: 't_test', lines: [{ text: 'Test', choices: [{ text: 'A' }, { text: 'B' }] }] } as any;
  act(() => {
    (useGameStore.getState() as any).startTimedChoice(dlg, 200, 1);
  });
  render(<DialogueBox />);
  const countdown = screen.getByText(/s$/);
  expect(countdown).toBeTruthy();
  // wait for auto-select
  jest.advanceTimersByTime(300);
  // after timeout the dialogue should be cleared or advanced
  const cur = useGameStore.getState().currentDialogue;
  expect(cur === null || cur.id !== 't_test').toBe(true);
});
