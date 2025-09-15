import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

// Do not import the component or the real store at top-level — register mocks first
const mockAttempt = jest.fn(() => true);
// Provide a mock that mimics zustand's useStore selector and a mutable state with setter
jest.mock('../src/store/useGameStore', () => {
  let mockState: any = {
    player: { yuan: 5, currentQi: 50 },
    attemptStudy: mockAttempt
  };
  const useGameStore = (selector: any) => selector(mockState);
  (useGameStore as any).getState = () => mockState;
  const __setMockState = (s: any) => { mockState = s; };
  return { useGameStore, __setMockState };
});

describe('SutraBrowser Study flow', () => {
  // Import the component after the mock has been registered
  const SutraBrowser = require('../src/components/ui/SutraBrowser').default;
  test('opens study modal and confirms study when affordable', () => {
  const { queryByTestId } = render(<SutraBrowser />);
  // pick first sutra in the list by selecting the first matching study button
  const studyButtons = screen.getAllByTestId(/study-/i);
  expect(studyButtons.length).toBeGreaterThan(0);
  fireEvent.click(studyButtons[0]);

    const modal = queryByTestId('study-modal');
    expect(modal).toBeTruthy();

  const confirm = screen.getByTestId('confirm-study');
    fireEvent.click(confirm);

    // the modal should be closed after confirmation
    expect(queryByTestId('study-modal')).toBeNull();
    expect(mockAttempt).toHaveBeenCalled();
  });

  test('confirm is disabled when insufficient resources', () => {
    // Update the mocked store state with low resources
    const mockLowAttempt = jest.fn(() => false);
    const lowState = {
      player: { yuan: 0, currentQi: 0 },
      attemptStudy: mockLowAttempt
    } as any;
    const storeMock = require('../src/store/useGameStore');
    storeMock.__setMockState(lowState);
  // Render the component (it will use the updated mock state)
  const SutraLow = require('../src/components/ui/SutraBrowser').default;
  render(<SutraLow />);
    // pick first sutra in the list by selecting the first matching study button
    const studyButtons = screen.getAllByTestId(/study-/i);
    expect(studyButtons.length).toBeGreaterThan(0);
    fireEvent.click(studyButtons[0]);
    const confirm = screen.getByTestId('confirm-study');
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
  });

  test('deducts resources on confirm', () => {
    const mockAttempt2 = jest.fn(() => true);
    const state2 = {
      player: { yuan: 10, currentQi: 50 },
      attemptStudy: mockAttempt2
    } as any;
    const storeMock = require('../src/store/useGameStore');
    storeMock.__setMockState(state2);
  const SutraDeduct = require('../src/components/ui/SutraBrowser').default;
  const { queryByTestId } = render(<SutraDeduct />);
    const studyButtons = screen.getAllByTestId(/study-/i);
    expect(studyButtons.length).toBeGreaterThan(0);
    fireEvent.click(studyButtons[0]);
    const confirm = screen.getByTestId('confirm-study');
    fireEvent.click(confirm);
    expect(mockAttempt2).toHaveBeenCalled();
  });
});
