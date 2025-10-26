import type { Era } from './types';
import type { GameState } from '@/types';
import { generateEraFromTemplate } from './eraGenerator';
import eras from '../../data/eras/default_eras.json';
import { randInt } from '../utils/rng';
// SaveLoadSystem import is intentionally dynamic/optional in some environments; bypass restricted-imports rule here
// eslint-disable-next-line no-restricted-imports
import { SaveLoadSystem } from '@/systems/SaveLoadSystem';

type EraTemplate = typeof eras[number];

export type WorldSnapshot = {
  world: Partial<GameState['world']>;
  story?: Partial<GameState['story']>;
};

function deepClone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

function mergeModifiers(target: any, mod: Era['modifiers']) {
  if (!target.modifiers) target.modifiers = {} as any;
  // Merge by override; leave interpretation (multipliers) to systems using normalized layer
  target.modifiers.qiDensity = mod.qiDensity;
  target.modifiers.demonicQi = mod.demonicQi;
  target.modifiers.holyQi = mod.holyQi;
  target.modifiers.sectCorruptionRate = mod.sectCorruptionRate;
  target.modifiers.artifactDensity = mod.artifactDensity;
  target.modifiers.eventBias = deepClone(mod.eventBias);
  target.modifiers.tribulationSeverity = mod.tribulationSeverity;
}

function findTemplateById(id: string): EraTemplate | undefined {
  return (eras as EraTemplate[]).find(e => e.id === id);
}

function latestDefinedIndex(): number {
  return (eras as EraTemplate[]).reduce((m, e) => Math.max(m, e.index), -1);
}

export const eraManager = {
  generate(options: { templateId?: string; seed?: string; index?: number; playerId?: string; reincarnationCount?: number } = {}): Era {
    const template = options.templateId ? findTemplateById(options.templateId) : (eras as EraTemplate[])[0];
    if (!template) throw new Error('Era template not found');
    return generateEraFromTemplate(template, { seed: options.seed, playerId: options.playerId, reincarnationCount: options.reincarnationCount, index: options.index ?? template.index });
  },

  applyEra(era: Era, worldState: GameState['world'], story?: GameState['story']) {
    // Persist current era id/index on world
    (worldState as any).currentEraId = era.id;
    (worldState as any).currentEraIndex = era.index;
    (worldState as any).currentEraSeed = era.generatedSeed;
    mergeModifiers(worldState as any, era.modifiers);
    // Seed factions minimally
    if (!worldState.factions) worldState.factions = {} as any;
    for (const f of era.startingFactions) {
      (worldState.factions as any)[f.id] = { type: f.type, influence: f.influence };
    }
    // Push unique events into a world pool flag; StorySystem may later consume
    if (!worldState.flags) worldState.flags = {} as any;
    const pool: string[] = Array.isArray((worldState as any).eventPool) ? (worldState as any).eventPool : [];
    (worldState as any).eventPool = Array.from(new Set([...pool, ...era.uniqueEvents]));
    // Optional: expose normalized modifiers for per-tick systems
    (worldState as any).eraNormalized = {
      qiDensityNorm: era.modifiers.qiDensity / 10000,
      artifactDensityNorm: era.modifiers.artifactDensity / 100
    };
    // Attach bias for consumers selecting events
    (worldState as any).eventBias = deepClone(era.modifiers.eventBias);
    if (story) {
      // Provide available mentors hint for UI/system use
      (story as any).availableMentors = Array.from(new Set([...((story as any).availableMentors || []), ...era.availableMentors]));
    }
  },

  snapshotAndUnapply(gs: GameState): WorldSnapshot {
    const snap: WorldSnapshot = { world: deepClone(gs.world), story: deepClone(gs.story) };
    // Clear era-specific fields in world to simulate unapply during tests
    const w: any = gs.world as any;
    delete w.currentEraId;
    delete w.currentEraIndex;
    delete w.currentEraSeed;
    delete w.eraNormalized;
    delete w.eventBias;
    // Don't touch unrelated keys
    return snap;
  },

  reincarnateToIndex(gs: GameState, targetIndex: number, seed?: string) {
    const currentIndex = (gs.world as any).currentEraIndex ?? 0;
    if (targetIndex < currentIndex) throw new Error('Cannot reincarnate into an earlier era');
    const tpl = (eras as EraTemplate[]).find(e => e.index === targetIndex) || (eras as EraTemplate[])[(eras as EraTemplate[]).length - 1];
    const era = this.generate({ templateId: tpl.id, seed, index: targetIndex, playerId: String((gs.player as any).id || (gs.player as any).name || 'player'), reincarnationCount: ((gs.player as any).reincarnationCount || 0) + 1 });

    try { SaveLoadSystem.saveGame(gs); } catch { /* best-effort */ }
    (gs.player as any).previousLives = Array.isArray((gs.player as any).previousLives) ? (gs.player as any).previousLives : [];
    const lifeNum = ((gs.player as any).previousLives.length || 0) + 1;
    (gs.player as any).previousLives.push({ lifeNum, eraId: era.id, eraIndex: era.index, fateSummary: 'Reincarnated', seed: era.generatedSeed });
    this.applyEra(era, gs.world, gs.story);
  },

  attemptReincarnation(gs: GameState, options: { sameEra?: boolean; nextEra?: boolean; randomFuture?: boolean; seed?: string }) {
    const currentIndex = (gs.world as any).currentEraIndex ?? 0;
    const lastIndex = latestDefinedIndex();
  let targetIndex = currentIndex;
  // targetTemplateId intentionally unused in current flow; kept for future extension

    if (options.nextEra) {
      targetIndex = currentIndex + 1;
      if (targetIndex > lastIndex) {
        // For now, clamp to last defined; a future appendProceduralEra() could extend
        targetIndex = lastIndex;
      }
  // template lookup retained for potential future use
    } else if (options.randomFuture) {
      if (currentIndex >= lastIndex) {
        targetIndex = lastIndex;
      } else {
    const choices = (eras as EraTemplate[]).filter(e => e.index > currentIndex);
  const pick = choices.length ? choices[randInt(choices.length)] : choices[0];
  targetIndex = pick ? pick.index : currentIndex;
      }
    } else if (options.sameEra) {
      // keep same template id, same index
      targetIndex = currentIndex;
    }

    if (targetIndex < currentIndex) {
      throw new Error('Cannot reincarnate into an earlier era');
    }

    this.reincarnateToIndex(gs, targetIndex, options.seed);
  },

  reseedEra(eraId: string, seed: string, ctx: { playerId?: string; reincarnationCount?: number } = {}) {
    const template = findTemplateById(eraId);
    if (!template) throw new Error('Template not found');
    return generateEraFromTemplate(template as any, { seed, playerId: ctx.playerId, reincarnationCount: ctx.reincarnationCount, index: template.index });
  },

  appendProceduralEra(_archetype?: string) {
    const nextIndex = latestDefinedIndex() + 1;
    const base: EraTemplate = {
      id: `era_proc_${nextIndex}`,
      name: `Procedural Era ${nextIndex}`,
      index: nextIndex,
      description: 'A procedurally generated era.',
      seedHint: 'procedural',
      modifiers: { qiDensity: 500000, demonicQi: 200000, holyQi: 300000, sectCorruptionRate: 3000, eventBias: { dark: 0.33, neutral: 0.34, light: 0.33 }, tribulationSeverity: 0.5, artifactDensity: 2000 },
      startingFactions: [],
      uniqueEvents: [],
      availableMentors: []
    } as any;
    return generateEraFromTemplate(base, { seed: `${Date.now()}`, index: nextIndex });
  }
};
