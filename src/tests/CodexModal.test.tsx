import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CodexModal from '../../CodexModal';

describe('CodexModal', () => {
  test('renders when open and closes on Escape', () => {
    const onClose = jest.fn();
    render(<CodexModal open={true} onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('overlay click closes modal', () => {
    const onClose = jest.fn();
    const { container } = render(<CodexModal open={true} onClose={onClose} />);
    const overlay = container.querySelector('.codex-modal-overlay') as HTMLElement;
    overlay && fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
