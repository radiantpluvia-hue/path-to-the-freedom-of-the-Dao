import { PlaytestScaling } from '../src/utils/playtestScaling';

afterEach(() => {
  try { delete (globalThis as any).__PLAYTEST_SCALING__; } catch {};
});

test('global override toggles PlaytestScaling', () => {
  (globalThis as any).__PLAYTEST_SCALING__ = 'true';
  jest.resetModules();
  const ps = require('../src/utils/playtestScaling').PlaytestScaling;
  expect(ps.isEnabled()).toBe(true);
  delete (globalThis as any).__PLAYTEST_SCALING__;
});

test('env var PLAYTEST_SCALING respected when set', () => {
  process.env.PLAYTEST_SCALING = 'true';
  jest.resetModules();
  const ps = require('../src/utils/playtestScaling').PlaytestScaling;
  expect(ps.isEnabled()).toBe(true);
  delete process.env.PLAYTEST_SCALING;
});

test('defaults to disabled in Jest env when no overrides', () => {
  jest.resetModules();
  const ps = require('../src/utils/playtestScaling').PlaytestScaling;
  // In test environment default should be false unless overridden
  expect(ps.isEnabled()).toBe(false);
});