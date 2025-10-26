/**
 * Simple narrative templating helpers for LifePhase events.
 * Supports ${var} placeholders and some utility helpers in context.
 */

export type TemplateContext = Record<string, any>;

// Basic safe renderer for templates using ${key} placeholders.
import { choice as rngChoice } from '../utils/rng';

export function renderTemplate(template: string, ctx: TemplateContext = {}): string {
  // Replace ${key} with corresponding ctx value (supports nested keys with dot)
  return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
    try {
      // support simple helper: capitalize(key) or random(listName)
      if (expr.startsWith('capitalize(') && expr.endsWith(')')) {
        const inner = expr.slice(11, -1).trim();
        const v = lookup(ctx, inner);
        return String(v ?? '').replace(/(^|\s)([a-z])/g, (m) => m.toUpperCase());
      }
      if (expr.startsWith('upper(') && expr.endsWith(')')) {
        const inner = expr.slice(6, -1).trim();
        const v = lookup(ctx, inner);
        return String(v ?? '').toUpperCase();
      }
      if (expr.startsWith('random(') && expr.endsWith(')')) {
        const inner = expr.slice(7, -1).trim();
        const arr = lookup(ctx, inner);
        try {
          if (Array.isArray(arr) && arr.length > 0) return String(rngChoice(arr) ?? '');
        } catch (e) { /* fall back */ }
        return '';
      }
      const v = lookup(ctx, expr.trim());
      return v === undefined || v === null ? '' : String(v);
    } catch (e) {
      return '';
    }
  });
}

function lookup(obj: any, path: string) {
  if (!obj) return undefined;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// Small library of templates keyed by event id or generic type
export const TEMPLATES: Record<string, string> = {
  // Mortal Life starters
  birth: 'At dawn in the ${region}, a child named ${playerName} drew their first breath. It was a quiet beginning for the ${title}.',
  awakening: 'After a night of strange dreams in ${region}, ${playerName} first felt the stirrings of ${daoConcept} within.',
  village: '${playerName} grew beneath the thatch of ${villageName}, learning simple trades and the rhythm of the land.',
  choosing_path: '${playerName} stood at a crossroad and chose the path of ${pathName}, unaware of the tides it would set into motion.',

  // Cultivator Life
  breakthrough: '${playerName} labored for years until, in a burst of light, they achieved ${stageName} — a breakthrough that reshaped their fate.',
  sect_invitation: 'A letter arrived bearing the seal of ${sectName}. ${playerName} was invited to join the ${sectTitle}.',
  wandering_trials: '${playerName} wandered the ${region}, where trials by bandits and spirits forged their resolve.',

  // Ascendant Life
  nascent_soul: 'Within the crucible of tribulation, ${playerName} birthed a Nascent Soul. Stars bent to its will.',
  world_domination: 'With power widening like a storm, ${playerName} bent provinces to their will; a name whispered in fear and reverence.',
  disciple_training: '${playerName} took disciples, teaching them the nuances of ${daoConcept} and shaping the next generation.',

  // Mythic Life
  immortal_realm: '${playerName} ascended to the Immortal Realm, carving laws into the sky and shaping a corner of eternity.',
  creating_galaxies: '${playerName} spun lesser worlds like playthings, their ambition echoing across the cosmos.',
  forming_dao: '${playerName} declared a new Dao: ${daoName}. Even the heavens took note.',

  // Reincarnation
  death: 'When ${playerName} fell in ${region}, a hush settled. Their deeds became stories told by those who survived.',
  reincarnation: '${playerName} returned anew, bound by karmic threads: ${karmicSummary}',

  // Generic fallback
  generic_event: '${title}: ${description}'
};

export function templateForEvent(eventId: string, fallback = 'generic_event') {
  return TEMPLATES[eventId] || TEMPLATES[fallback] || '';
}
