import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';
// TrainModal imports use a relative path to the store. To ensure our test mock
// is applied correctly we require the component after installing the jest mock
// (mockUseGameStore registers a jest.mock for the alias; some files use
// relative imports so we load the component after mocking the module view).

describe('TrainModal UI', () => {
  it('calls the comprehend training method in test env when clicking Comprehend Manual', () => {
    const comprehendMock = jest.fn(() => ({ success: true, message: 'trained' }));
  const { useGameStoreMock } = mockUseGameStore({ ui: { showTechniqueMastery: false }, trainComprehendManual: comprehendMock });
  // require the component after installing the mock so relative imports pick up the mocked store
  const TrainModal = require('../components/game/TrainModal').default;

  const onClose = jest.fn();
  render(<TrainModal open={true} onClose={onClose} />);

    const btn = screen.getByText('Comprehend Manual');
    fireEvent.click(btn);

    const stateFn = useGameStoreMock.getState().trainComprehendManual;
    expect(stateFn).toHaveBeenCalled();
    // the UI should show the training result message synchronously in test env
    expect(screen.getByText(/trained/i)).toBeTruthy();
  });

  it('calls onClose when Close button is clicked', () => {
  mockUseGameStore({ ui: { showTechniqueMastery: false } });
  const TrainModal = require('../components/game/TrainModal').default;
  const onClose = jest.fn();
  render(<TrainModal open={true} onClose={onClose} />);
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
