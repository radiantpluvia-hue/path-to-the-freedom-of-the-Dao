import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrainModal from '@/components/game/TrainModal';
import { useGameStore } from '@/store/useGameStore';

describe('TrainModal integration', () => {
  it('shows feedback message after training and calls store methods', () => {
    const store = useGameStore.getState();
    const spyBody = jest.spyOn(store, 'trainBody');

    const handleClose = jest.fn();
    render(<TrainModal open={true} onClose={handleClose} /> as any);

    const bodyBtn = screen.getByText('Body Tempering');
    fireEvent.click(bodyBtn);

    // Expect training method to be called
    expect(spyBody).toHaveBeenCalled();

    // The modal should now render a feedback message (either success or cooldown)
    const msg = screen.queryByText(/training completed|cooldown|failed/i);
    expect(msg).toBeTruthy();
  });
});
