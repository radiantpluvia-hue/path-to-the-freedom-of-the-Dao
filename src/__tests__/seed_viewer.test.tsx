import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SeedViewerModal from '@/components/admin/SeedViewerModal';

describe('SeedViewerModal', () => {
  it('renders when open and shows text and effects', () => {
    const seed = { id: 's1', title: 'Test Seed', description: 'This is a test', effects: ['e1','e2'] };
    const onClose = jest.fn();
    render(<SeedViewerModal open={true} onClose={onClose} seed={seed} />);
    expect(screen.getByText('Test Seed')).toBeInTheDocument();
    expect(screen.getByText('This is a test')).toBeInTheDocument();
    expect(screen.getByText('e1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
