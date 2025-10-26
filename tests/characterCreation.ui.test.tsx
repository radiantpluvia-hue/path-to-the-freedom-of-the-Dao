import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { seededFromString, setRuntimeRng, clearRuntimeRng } from '../src/utils/seededRng';

// Force deterministic selection by seeding the runtime RNG
beforeAll(() => {
  setRuntimeRng(seededFromString('test-seed-creation'));
});
afterAll(() => {
  clearRuntimeRng();
});

test('CharacterCreation shows probability bars and raw weights toggle', () => {
  const CharacterCreation = require('../src/components/game/CharacterCreation').CharacterCreation;
  const { container } = render(<CharacterCreation /> as any);

  // There should be a label with Available Backgrounds
  expect(screen.getByText(/Available Backgrounds/i)).toBeTruthy();

  // Bars rendered via data-testid
  const anyBar = container.querySelector('[data-testid^="prob-bar-"]');
  expect(anyBar).toBeTruthy();

  // Toggle raw weights and ensure raw weight text appears (if configured)
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);
  const anyRaw = container.querySelector('[data-testid^="raw-weight-"]');
  expect(anyRaw).toBeTruthy();
});
