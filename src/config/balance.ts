// Global balance settings for the game. Keep simple getters/setters so tests
// and UI can adjust the overall power scale without changing many files.

const STORAGE_KEY = 'xianxia_power_scale_percent';

// Default scale decimal (1.0 == 100%)
let powerScaleDecimal = 1.0;

// Helper to attempt to access the game's store safely (dynamic require to avoid ESM/CJS interop issues in tests)
function tryGetStore(): any | null {
  try {
    // dynamic require to avoid top-level cycles during module load in tests
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../store/useGameStore');
    return mod && mod.useGameStore ? mod.useGameStore : (mod && mod.default ? mod.default : null);
  } catch (e) {
    return null;
  }
}

// Try to initialize from localStorage if available (guarded so tests/node won't throw)
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed)) {
        powerScaleDecimal = Math.max(1, Math.min(100, parsed)) / 100;
      }
    }
  }
} catch (e) {
  // ignore - tests or some environments may not provide localStorage
}

// Prefer persisted player setting from the game's store (store-only persistence)
try {
  const store = tryGetStore();
  if (store && store.getState) {
    const s = store.getState();
    const p = s && s.player && (s.player as any).settings && (s.player as any).settings.powerScalePercent;
    if (typeof p === 'number') {
      powerScaleDecimal = Math.max(1, Math.min(100, Math.round(p))) / 100;
    }
  }
} catch (e) { /* ignore runtime config parse errors */ console.debug && console.debug('balance config parse failed', e); }

export function getPowerScale(): number {
  return powerScaleDecimal;
}

// Accept percent (1..100) or decimal (0..1). Normalize and persist percent to localStorage when possible.
export function setPowerScalePercent(percent: number) {
  if (percent > 1) {
    percent = Math.max(1, Math.min(100, Math.round(percent)));
    powerScaleDecimal = percent / 100;
  } else {
    // assume decimal
    powerScaleDecimal = Math.max(0.01, Math.min(1, percent));
  }

  // persist percent value (as integer 1..100) if possible
  // Persist into the game's store under player.settings.powerScalePercent (store-only persistence)
  try {
    const store = tryGetStore();
    if (store && store.setState && store.getState) {
      // Prefer explicit API if available
      const s = store.getState();
      if (typeof s.setSettings === 'function') {
        s.setSettings({ powerScalePercent: Math.round(powerScaleDecimal * 100) });
      } else {
        const cur = store.getState();
        const settings = (cur.player && (cur.player as any).settings) || {};
        store.setState({ player: { ...cur.player, settings: { ...settings, powerScalePercent: Math.round(powerScaleDecimal * 100) } } });
      }
      return;
    }
  } catch (e) {
    // ignore store errors
  }
}

export function setPowerScaleDecimal(d: number) {
  // Accept decimal 0..1 or >1 scaled to percent
  if (d > 1) {
    setPowerScalePercent(Math.round(d));
  } else {
    setPowerScalePercent(Math.round(Math.max(0.01, Math.min(1, d)) * 100));
  }
}
