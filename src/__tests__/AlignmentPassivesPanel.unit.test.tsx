import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlignmentPassivesPanel from '../components/game/AlignmentPassivesPanel';

// Minimal passive registry mock: we rely on actual implementation, but ensure getPassive returns id
jest.mock('../systems/passiveRegistry', () => {
  const actual = jest.requireActual('../systems/passiveRegistry');
  return {
    ...actual,
    getPassive: (id: string) => ({ id })
  };
});

describe('AlignmentPassivesPanel', () => {
  test('renders active alignment passives with bonus values', () => {
    const player = {
      alignmentPassiveApplied: ['tag_honor_bound', 'tag_bloodthirsty'],
      _alignmentPassiveAppliedValues: {
        tag_honor_bound: 2,
        tag_bloodthirsty: 4,
      }
    };

    render(<AlignmentPassivesPanel player={player} />);

    expect(screen.getByText('Alignment Passives')).toBeInTheDocument();
    expect(screen.getByText('Honor Bound')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('Bloodthirsty')).toBeInTheDocument();
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  test('renders nothing when no passives', () => {
    const { container } = render(<AlignmentPassivesPanel player={{}} />);
    // No heading
    expect(container.textContent).toBe('');
  });
});
