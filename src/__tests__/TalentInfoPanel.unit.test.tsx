import React from 'react';
import { render, screen } from '@testing-library/react';
import { TalentInfoPanel } from '../components/info/TalentInfoPanel';

describe('TalentInfoPanel fallback', () => {
  it('shows raw talent id and hint when talent data missing', () => {
    render(<TalentInfoPanel talentId={'nonexistent_talent_xxx'} />);
    expect(screen.getByText(/Unknown Talent/i)).toBeInTheDocument();
    expect(screen.getByText(/nonexistent_talent_xxx/)).toBeInTheDocument();
    expect(screen.getByText(/Talent data not found/i)).toBeInTheDocument();
  });
});
