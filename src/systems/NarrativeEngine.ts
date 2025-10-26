import type { NarrativeEngine as NarrativeEngineType, NarrativeTrigger, PastLife, LegacyRemnant, HeavenlyDaoInsight, KarmaEvent, DestinyThread } from '../types';

export class NarrativeEngine implements NarrativeEngineType {
  public karmaHistory: KarmaEvent[] = [];
  public destinyThreads: DestinyThread[] = [];
  public legacyRemnants: LegacyRemnant[] = [];
  public heavenlyDaoInsights: HeavenlyDaoInsight[] = [];
  public pastLives: PastLife[] = [];
  public activeEventChains = [];
  public narrativeTriggers: NarrativeTrigger[] = [];

  constructor() {
    // seed with minimal defaults if needed
  }

  public registerTrigger(trigger: NarrativeTrigger) {
    this.narrativeTriggers.push(trigger);
  }

  public generateEventsForPlayer(context: Record<string, any>) {
    // Improved proof-of-concept: evaluate conditions against nested context areas
    const generated: any[] = [];
    for (const t of this.narrativeTriggers) {
      const conds = t.conditions || {};
      let matches = true;
      for (const [key, expected] of Object.entries(conds)) {
        let found = false;

        // check top-level
        if (key in context) {
          if (expected === undefined) found = true;
          else found = context[key] === expected;
        }

        // check player
        if (!found && context.player && key in context.player) {
          if (expected === undefined) found = true;
          else found = context.player[key] === expected;
        }

        // check world
        if (!found && context.world && key in context.world) {
          if (expected === undefined) found = true;
          else found = context.world[key] === expected;
        }

        // check story
        if (!found && context.story && key in context.story) {
          if (expected === undefined) found = true;
          else found = context.story[key] === expected;
        }

        // check ui
        if (!found && context.ui && key in context.ui) {
          if (expected === undefined) found = true;
          else found = context.ui[key] === expected;
        }

        if (!found) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // Affinity bias support: optional t.affinityBias = 'positive'|'negative'|'any'
        // If present, require player's destinyAffinity sign to match when specified
        const playerAffinity = (context.player && typeof context.player.destinyAffinity === 'number') ? context.player.destinyAffinity : 0;
        if (t.affinityBias === 'positive' && playerAffinity <= 0) continue;
        if (t.affinityBias === 'negative' && playerAffinity >= 0) continue;

        for (const g of t.eventGenerators || []) {
          const templates = (g.templates || []);

          // If a DestinySystem is present, get influenceable threads ordered by affinity and
          // attempt a light-weight bias: if a thread name or description contains a template keyword,
          // prioritize templates that match (best-effort, content-driven). Otherwise use affinityBias.
          const destinySystem = context.systems?.destinySystem;
          const prioritized: any[] = [];
          const others: any[] = [];

          if (destinySystem && typeof destinySystem.getInfluenceableThreadsForPlayer === 'function') {
            try {
              const threads = destinySystem.getInfluenceableThreadsForPlayer(context.player || {});
              // Gather keywords from top threads
              const keywords: string[] = [];
              for (let i = 0; i < Math.min(3, threads.length); i++) {
                const tname = threads[i].name || '';
                const parts = tname.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                keywords.push(...parts);
              }

              for (const temp of templates) {
                const text = ((temp.title || '') + ' ' + (temp.description || '')).toLowerCase();
                const score = keywords.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
                if (score > 0) prioritized.push({ temp, score });
                else others.push({ temp, score: 0 });
              }

              // Sort prioritized by score desc, then push them first
              prioritized.sort((a, b) => b.score - a.score);
              generated.push(...prioritized.map(p => p.temp));
              generated.push(...others.map(p => p.temp));
              continue;
            } catch (err) {
              // fall back to affinityBias behavior below
            }
          }

          // affinityBias fallback
          if ((playerAffinity > 0 && t.affinityBias === 'positive') || (playerAffinity < 0 && t.affinityBias === 'negative')) {
            generated.unshift(...templates);
          } else {
            generated.push(...templates);
          }
        }
      }
    }

    return generated;
  }

  public recordPastLife(life: PastLife) {
    this.pastLives.push(life);
  }
}

export default NarrativeEngine;
