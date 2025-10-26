import type { Dialogue } from '@/types';
import EXTENDED_MONOLOGUES from './character_monologues_extended';

// Minimal dialogue types used here are compatible with our store but not required to be exported
export const DIALOGUES: Dialogue[] = [
  {
    id: 'intro_village_elder',
    title: 'Village Elder',
    lines: [
  { id: 'l1', speaker: 'elder', portrait: 'icon-elder', text: 'dialogue.elder.greeting' },
      {
        id: 'l2',
        speaker: 'player',
  text: 'dialogue.player.reply',
        choices: [
          { id: 'c1', text: 'Please teach me.', nextLineIndex: 2, effects: { affinity: { elder: 5 } } },
          { id: 'c2', text: 'I can manage on my own.', nextLineIndex: 3, effects: { affinity: { elder: -3 } } }
        ]
      },
      { id: 'l3', speaker: 'elder', text: 'dialogue.elder.offer_help' },
      { id: 'l4', speaker: 'elder', text: 'dialogue.elder.take_care' }
    ]
  },

  {
    id: 'monologue_blacksmith',
    mono: true,
    title: 'Blacksmith Mumbles',
    lines: [
      { speaker: 'blacksmith', text: 'dialogue.blacksmith.hum' },
      { speaker: 'blacksmith', text: 'dialogue.blacksmith.sigh' }
    ],
    tags: ['ambient', 'smith']
  }
,
  {
    id: 'market_vendor',
    title: 'Lively Vendor',
    lines: [
      { id: 'm1', speaker: 'vendor', portrait: 'vendor-happy', text: 'dialogue.vendor.greet' },
      { id: 'm2', speaker: 'vendor', text: 'dialogue.vendor.bargain' },
      { id: 'm3', speaker: 'player', text: 'dialogue.player.buy' }
    ]
  },

  {
    id: 'monologue_old_woman',
    mono: true,
    title: 'Old Woman Remembers',
    lines: [
      { speaker: 'old_woman', text: 'dialogue.old_woman.humming' },
      { speaker: 'old_woman', text: 'dialogue.old_woman.memory' }
    ],
    tags: ['ambient']
  }

  // A set of ambient monologues to add variety
  ,{
    id: 'mono_river_song', mono: true, title: 'River Song', tags: ['ambient'],
    lines: [{ speaker: 'villager', text: 'dialogue.river.song1' }, { speaker: 'villager', text: 'dialogue.river.song2' }]
  }
  ,{
    id: 'mono_farmer_work', mono: true, title: 'Farmer at Work', tags: ['ambient'],
    lines: [{ speaker: 'farmer', text: 'dialogue.farmer.hum' }]
  }
  ,{
    id: 'mono_child_laugh', mono: true, title: 'Child Laugh', tags: ['ambient'],
    lines: [{ speaker: 'child', text: 'dialogue.child.laugh' }]
  }
  ,{
    id: 'mono_temple_bells', mono: true, title: 'Temple Bells', tags: ['ambient'],
    lines: [{ speaker: 'temple', text: 'dialogue.temple.bells1' }, { speaker: 'temple', text: 'dialogue.temple.bells2' }]
  }
  ,{
    id: 'mono_old_poet', mono: true, title: 'Old Poet', tags: ['ambient'],
    lines: [{ speaker: 'poet', text: 'dialogue.poet.murmur' }]
  }

  // Epiphany / Dao-shake monologues
  ,{
    id: 'mono_dao_shake_1', mono: true, title: 'Dao Heart Trembles', tags: ['dao_shake'],
    lines: [
      { speaker: 'player', text: 'monologue.dao.shake_line1' },
      { speaker: 'player', text: 'monologue.dao.shake_line2' }
    ]
  }
  ,{
    id: 'mono_epiphany_1', mono: true, title: 'Epiphany', tags: ['epiphany'],
    lines: [
      { speaker: 'player', text: 'monologue.epiphany.line1' },
      { speaker: 'player', text: 'monologue.epiphany.line2' }
    ]
  }

  // The moral dilemma: wandering cultivator watches mortals being slaughtered
  ,{
    id: 'dao_dilemma_1', title: 'The Dao Heart Trembles',
    lines: [
      { id: 'd1', speaker: 'wanderer', text: 'dialogue.wanderer.challenge' },
      { id: 'd2', speaker: 'player', text: 'dialogue.player.question' , choices: [
        { id: 'save', text: 'Save them!', effects: { affinity: { compassion: 5 }, startDialogue: 'mono_epiphany_1' } },
        { id: 'ignore', text: 'Let fate play out', effects: { affinity: { ambition: 3 }, startDialogue: 'mono_dao_shake_1' } }
      ] }
    ]
  }

  // Chain events (40 short chain dialogues that trigger the next in sequence)
  
  ,
  // generated chain events
  {
    id: 'chain_event_1', title: 'Chain 1', lines: [ { speaker: 'narrator', text: 'chain.line.1' }, { speaker: 'narrator', text: 'chain.line.1b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_2' } } ] } ]
  }
  ,{
    id: 'chain_event_2', title: 'Chain 2', lines: [ { speaker: 'narrator', text: 'chain.line.2' }, { speaker: 'narrator', text: 'chain.line.2b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_3' } } ] } ]
  }
  ,{
    id: 'chain_event_3', title: 'Chain 3', lines: [ { speaker: 'narrator', text: 'chain.line.3' }, { speaker: 'narrator', text: 'chain.line.3b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_4' } } ] } ]
  }
  ,{
    id: 'chain_event_4', title: 'Chain 4', lines: [ { speaker: 'narrator', text: 'chain.line.4' }, { speaker: 'narrator', text: 'chain.line.4b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_5' } } ] } ]
  }
  ,{
    id: 'chain_event_5', title: 'Chain 5', lines: [ { speaker: 'narrator', text: 'chain.line.5' }, { speaker: 'narrator', text: 'chain.line.5b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_6' } } ] } ]
  }
  ,{
    id: 'chain_event_6', title: 'Chain 6', lines: [ { speaker: 'narrator', text: 'chain.line.6' }, { speaker: 'narrator', text: 'chain.line.6b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_7' } } ] } ]
  }
  ,{
    id: 'chain_event_7', title: 'Chain 7', lines: [ { speaker: 'narrator', text: 'chain.line.7' }, { speaker: 'narrator', text: 'chain.line.7b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_8' } } ] } ]
  }
  ,{
    id: 'chain_event_8', title: 'Chain 8', lines: [ { speaker: 'narrator', text: 'chain.line.8' }, { speaker: 'narrator', text: 'chain.line.8b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_9' } } ] } ]
  }
  ,{
    id: 'chain_event_9', title: 'Chain 9', lines: [ { speaker: 'narrator', text: 'chain.line.9' }, { speaker: 'narrator', text: 'chain.line.9b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_10' } } ] } ]
  }
  ,{
    id: 'chain_event_10', title: 'Chain 10', lines: [ { speaker: 'narrator', text: 'chain.line.10' }, { speaker: 'narrator', text: 'chain.line.10b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_11' } } ] } ]
  }
  ,{
    id: 'chain_event_11', title: 'Chain 11', lines: [ { speaker: 'narrator', text: 'chain.line.11' }, { speaker: 'narrator', text: 'chain.line.11b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_12' } } ] } ]
  }
  ,{
    id: 'chain_event_12', title: 'Chain 12', lines: [ { speaker: 'narrator', text: 'chain.line.12' }, { speaker: 'narrator', text: 'chain.line.12b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_13' } } ] } ]
  }
  ,{
    id: 'chain_event_13', title: 'Chain 13', lines: [ { speaker: 'narrator', text: 'chain.line.13' }, { speaker: 'narrator', text: 'chain.line.13b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_14' } } ] } ]
  }
  ,{
    id: 'chain_event_14', title: 'Chain 14', lines: [ { speaker: 'narrator', text: 'chain.line.14' }, { speaker: 'narrator', text: 'chain.line.14b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_15' } } ] } ]
  }
  ,{
    id: 'chain_event_15', title: 'Chain 15', lines: [ { speaker: 'narrator', text: 'chain.line.15' }, { speaker: 'narrator', text: 'chain.line.15b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_16' } } ] } ]
  }
  ,{
    id: 'chain_event_16', title: 'Chain 16', lines: [ { speaker: 'narrator', text: 'chain.line.16' }, { speaker: 'narrator', text: 'chain.line.16b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_17' } } ] } ]
  }
  ,{
    id: 'chain_event_17', title: 'Chain 17', lines: [ { speaker: 'narrator', text: 'chain.line.17' }, { speaker: 'narrator', text: 'chain.line.17b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_18' } } ] } ]
  }
  ,{
    id: 'chain_event_18', title: 'Chain 18', lines: [ { speaker: 'narrator', text: 'chain.line.18' }, { speaker: 'narrator', text: 'chain.line.18b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_19' } } ] } ]
  }
  ,{
    id: 'chain_event_19', title: 'Chain 19', lines: [ { speaker: 'narrator', text: 'chain.line.19' }, { speaker: 'narrator', text: 'chain.line.19b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_20' } } ] } ]
  }
  ,{
    id: 'chain_event_20', title: 'Chain 20', lines: [ { speaker: 'narrator', text: 'chain.line.20' }, { speaker: 'narrator', text: 'chain.line.20b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_21' } } ] } ]
  }
  ,{
    id: 'chain_event_21', title: 'Chain 21', lines: [ { speaker: 'narrator', text: 'chain.line.21' }, { speaker: 'narrator', text: 'chain.line.21b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_22' } } ] } ]
  }
  ,{
    id: 'chain_event_22', title: 'Chain 22', lines: [ { speaker: 'narrator', text: 'chain.line.22' }, { speaker: 'narrator', text: 'chain.line.22b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_23' } } ] } ]
  }
  ,{
    id: 'chain_event_23', title: 'Chain 23', lines: [ { speaker: 'narrator', text: 'chain.line.23' }, { speaker: 'narrator', text: 'chain.line.23b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_24' } } ] } ]
  }
  ,{
    id: 'chain_event_24', title: 'Chain 24', lines: [ { speaker: 'narrator', text: 'chain.line.24' }, { speaker: 'narrator', text: 'chain.line.24b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_25' } } ] } ]
  }
  ,{
    id: 'chain_event_25', title: 'Chain 25', lines: [ { speaker: 'narrator', text: 'chain.line.25' }, { speaker: 'narrator', text: 'chain.line.25b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_26' } } ] } ]
  }
  ,{
    id: 'chain_event_26', title: 'Chain 26', lines: [ { speaker: 'narrator', text: 'chain.line.26' }, { speaker: 'narrator', text: 'chain.line.26b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_27' } } ] } ]
  }
  ,{
    id: 'chain_event_27', title: 'Chain 27', lines: [ { speaker: 'narrator', text: 'chain.line.27' }, { speaker: 'narrator', text: 'chain.line.27b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_28' } } ] } ]
  }
  ,{
    id: 'chain_event_28', title: 'Chain 28', lines: [ { speaker: 'narrator', text: 'chain.line.28' }, { speaker: 'narrator', text: 'chain.line.28b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_29' } } ] } ]
  }
  ,{
    id: 'chain_event_29', title: 'Chain 29', lines: [ { speaker: 'narrator', text: 'chain.line.29' }, { speaker: 'narrator', text: 'chain.line.29b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_30' } } ] } ]
  }
  ,{
    id: 'chain_event_30', title: 'Chain 30', lines: [ { speaker: 'narrator', text: 'chain.line.30' }, { speaker: 'narrator', text: 'chain.line.30b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_31' } } ] } ]
  }
  ,{
    id: 'chain_event_31', title: 'Chain 31', lines: [ { speaker: 'narrator', text: 'chain.line.31' }, { speaker: 'narrator', text: 'chain.line.31b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_32' } } ] } ]
  }
  ,{
    id: 'chain_event_32', title: 'Chain 32', lines: [ { speaker: 'narrator', text: 'chain.line.32' }, { speaker: 'narrator', text: 'chain.line.32b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_33' } } ] } ]
  }
  ,{
    id: 'chain_event_33', title: 'Chain 33', lines: [ { speaker: 'narrator', text: 'chain.line.33' }, { speaker: 'narrator', text: 'chain.line.33b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_34' } } ] } ]
  }
  ,{
    id: 'chain_event_34', title: 'Chain 34', lines: [ { speaker: 'narrator', text: 'chain.line.34' }, { speaker: 'narrator', text: 'chain.line.34b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_35' } } ] } ]
  }
  ,{
    id: 'chain_event_35', title: 'Chain 35', lines: [ { speaker: 'narrator', text: 'chain.line.35' }, { speaker: 'narrator', text: 'chain.line.35b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_36' } } ] } ]
  }
  ,{
    id: 'chain_event_36', title: 'Chain 36', lines: [ { speaker: 'narrator', text: 'chain.line.36' }, { speaker: 'narrator', text: 'chain.line.36b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_37' } } ] } ]
  }
  ,{
    id: 'chain_event_37', title: 'Chain 37', lines: [ { speaker: 'narrator', text: 'chain.line.37' }, { speaker: 'narrator', text: 'chain.line.37b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_38' } } ] } ]
  }
  ,{
    id: 'chain_event_38', title: 'Chain 38', lines: [ { speaker: 'narrator', text: 'chain.line.38' }, { speaker: 'narrator', text: 'chain.line.38b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_39' } } ] } ]
  }
  ,{
    id: 'chain_event_39', title: 'Chain 39', lines: [ { speaker: 'narrator', text: 'chain.line.39' }, { speaker: 'narrator', text: 'chain.line.39b', choices: [ { text: 'Next', nextLineIndex: 99, effects: { startDialogue: 'chain_event_40' } } ] } ]
  }
  ,{
    id: 'chain_event_40', title: 'Chain 40', lines: [ { speaker: 'narrator', text: 'chain.line.40' }, { speaker: 'narrator', text: 'chain.line.40b' } ]
  }
];

// Append externally generated monologues so tags/pool lookups include the extended set
try {
  if (Array.isArray(EXTENDED_MONOLOGUES) && EXTENDED_MONOLOGUES.length) {
    // mutate the DIALOGUES array in-place so existing imports/readers continue to work
    (DIALOGUES as any).push(...EXTENDED_MONOLOGUES as any[]);
  }
} catch (e) {
  // non-fatal if the import fails in some test environments
}

export default DIALOGUES;
