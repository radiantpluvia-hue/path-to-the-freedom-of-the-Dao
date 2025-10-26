import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

describe('ModalCloseButton', () => {
  test('renders with accessible name and calls onClick', () => {
    const handle = jest.fn();
    render(<ModalCloseButton ariaLabel="Close modal" title="Close" onClick={handle} />);

    const btn = screen.getByRole('button', { name: /close modal/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('title', 'Close');

    // simulate click
    fireEvent.click(btn);
    expect(handle).toHaveBeenCalledTimes(1);
  });

  test('has expected visual size/hit area via computed style', () => {
    render(<ModalCloseButton ariaLabel="Close" title="Close" onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: /close/i });
    // Check computed padding exists and is greater than zero (robust in JSDOM)
    const cs = window.getComputedStyle(btn as Element);
    const pad = parseInt(cs.padding || '0', 10) || 0;
    expect(pad).toBeGreaterThan(0);
  });
});
