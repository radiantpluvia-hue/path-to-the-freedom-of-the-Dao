import { Era, EraTemplate } from './types';
import { seededFromString } from '@/utils/seededRng';

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

function normalizeBias(bias: { dark: number; neutral: number; light: number }) {
  const sum = bias.dark + bias.neutral + bias.light;
  if (sum <= 0) return { dark: 1/3, neutral: 1/3, light: 1/3 };
  return { dark: bias.dark / sum, neutral: bias.neutral / sum, light: bias.light / sum };
}

function applyDeltas(t: EraTemplate, rng: () => number): EraTemplate {
  const jitter = (base: number) => {
    const delta = Math.floor(base * (rng() * 0.05 - 0.025));
    return Math.max(0, base + delta);
  };
  const biasJitter = (x: number) => clamp01(x + (rng() * 0.06 - 0.03));
  const sf = t.startingFactions.map(f => ({ ...f, influence: Math.max(0, f.influence + Math.floor(rng() * 7) - 3) }));

  const mod = {
    ...t.modifiers,
    qiDensity: jitter(t.modifiers.qiDensity),
    artifactDensity: jitter(t.modifiers.artifactDensity),
    sectCorruptionRate: jitter(t.modifiers.sectCorruptionRate),
    eventBias: normalizeBias({
      dark: biasJitter(t.modifiers.eventBias.dark),
      neutral: biasJitter(t.modifiers.eventBias.neutral),
      light: biasJitter(t.modifiers.eventBias.light)
    }),
    tribulationSeverity: clamp01(t.modifiers.tribulationSeverity)
  };

  return { ...t, modifiers: mod, startingFactions: sf };
}

export function generateEraFromTemplate(
  template: EraTemplate,
  options: { seed?: string; playerId?: string; reincarnationCount?: number; index?: number } = {}
): Era {
  const seedStr = `${options.playerId || 'anon'}|${options.reincarnationCount ?? 0}|${template.seedHint || ''}|${options.seed || ''}`;
  const rng = seededFromString(seedStr);
  const withDeltas = applyDeltas({ ...template, index: options.index ?? template.index }, rng);
  const generatedSeed = seedStr;
  // Deterministic timestamp from seed so repeated calls with same inputs are equal in tests
  const generatedAt = Math.floor(rng() * 1_000_000_000_000); // up to ~10^12
  return { ...withDeltas, generatedSeed, generatedAt };
}
