// Simple narrative templates for encounter branching
// Each template is a node with id, title, body, and choices. Choices may point to another template
// via nextTemplateId or resolve immediately via consequence: 'combat' | 'peace' | 'reward' | 'escape'

export const ENCOUNTER_NARRATIVES: Record<string, any> = {
  'ambush_intro': {
    id: 'ambush_intro',
    title: 'An Ambush on the Road',
    body: 'You round a bend and find several figures blocking the path. They brandish crude weapons and shout for your valuables.',
    choices: [
      { id: 'fight_now', text: 'Stand your ground and fight', consequence: 'combat' },
      { id: 'attempt_neg', text: 'Try to reason / bribe them', consequence: 'peace' , nextTemplateId: 'ambush_negotiate'},
      { id: 'slip_past', text: 'Try to slip past silently', consequence: 'escape' }
    ],
    ai: { preferredTechniques: ['quick_strike', 'parry'], openingBias: true }
  },

  'ambush_negotiate': {
    id: 'ambush_negotiate',
    title: 'Negotiation',
    body: 'You offer a modest sum and speak calmly. The leader seems unsure.',
    choices: [
      { id: 'pay', text: 'Pay them off', consequence: 'reward' },
      { id: 'insult', text: 'Insult them and provoke', consequence: 'combat' },
      { id: 'withdraw', text: 'Back away slowly and leave', consequence: 'escape' }
    ]
  }
};

/**
 * Initialize encounter narratives from external JSON data.
 * Call this once at app startup to merge any content pipelines' JSON files.
 */
export async function initEncounterNarratives() {
  try {
    // Prefer static ESM import of optional JSON where possible; fall back to dynamic import
    // Always use dynamic import to avoid introducing synchronous CommonJS require() into bundles.
    let extra: any = null;
    try {
      const mod = await import('./encounter_narratives.json');
      // Support both ESM default export and direct object
      extra = (mod && (mod as any).default) ? (mod as any).default : mod;
    } catch (e) {
      extra = null;
    }
    if (extra && typeof extra === 'object') {
      for (const k of Object.keys(extra)) {
        ENCOUNTER_NARRATIVES[k] = { ...(ENCOUNTER_NARRATIVES[k] || {}), ...extra[k] };
      }
    }
  } catch (e) {
    // No-op if JSON not present; content may be provided by other means
  }
}

export function getEncounterTemplate(id: string) {
  return ENCOUNTER_NARRATIVES[id] || null;
}

// Bulk-add more small narrative templates used across travel edges
ENCOUNTER_NARRATIVES['roadside_merchant'] = {
  id: 'roadside_merchant',
  title: 'Roadside Merchant',
  body: 'A small merchant barters exotic wares by the roadside. He eyes your gear with interest.',
  choices: [
    { id: 'haggle', text: 'Haggle for a discount', consequence: 'reward' },
    { id: 'ignore', text: 'Ignore and move on', consequence: 'escape' }
  ]
};

ENCOUNTER_NARRATIVES['lonely_monk'] = {
  id: 'lonely_monk',
  title: 'A Lonely Monk',
  body: 'A monk kneels and asks for alms. He humbly requests a word of guidance.',
  choices: [
    { id: 'speak', text: 'Offer a few words of advice', consequence: 'peace' },
    { id: 'decline', text: 'Decline and hurry on', consequence: 'escape' }
  ]
};

ENCOUNTER_NARRATIVES['bandit_camp'] = {
  id: 'bandit_camp',
  title: 'Bandit Camp',
  body: 'You discover a small camp of bandits. They have your trail — this could turn violent.',
  choices: [
    { id: 'launch', text: 'Launch a surprise attack', consequence: 'combat' },
    { id: 'sneak', text: 'Try to sneak past', consequence: 'escape' }
  ],
  ai: { preferredTechniques: ['cur_multi_slash', 'cur_stun_strike'], openingBias: true }
};

ENCOUNTER_NARRATIVES['strange_ruin'] = {
  id: 'strange_ruin',
  title: 'Strange Ruins',
  body: 'Ancient stones whisper on the wind. Something valuable might lurk within.',
  choices: [
    { id: 'enter', text: 'Enter the ruins to explore', consequence: 'reward' },
    { id: 'leave', text: 'Leave it be', consequence: 'escape' }
  ]
};
