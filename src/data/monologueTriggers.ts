import { NarrativeTrigger } from '../types';
// Triggers that surface monologue/dialogue templates from the dialogues pool.
// These generators create lightweight templates whose id or description may hint the NarrativeEngine
// to prioritize monologues from the extended dialogues array when conditions match.

export const MONOLOGUE_TRIGGERS: NarrativeTrigger[] = [
  {
    id: 'mono_leader_on_sect_join',
    type: 'state_based',
    conditions: { 'player.sect': undefined }, // fires when a player has sect info available (matching done in engine)
    priority: 30,
    eventGenerators: [
      {
        id: 'mono_leader_gen',
        type: 'template_based',
        templates: [
          {
            id: 'mono_leader_welcome_template',
            title: 'Leader Greeting',
            description: 'leader', // keyword used for light-weight matching against dialogue templates/tags
            choices: [],
            baseEffects: {},
            variables: []
          }
        ],
        parameters: {},
        weight: 1
      }
    ]
  },
  {
    id: 'mono_ruins_explore',
    type: 'state_based',
    conditions: { 'world.currentLocationId': undefined }, // engine will attempt to match when explore sets location
    priority: 20,
    eventGenerators: [
      {
        id: 'mono_ruins_gen',
        type: 'template_based',
        templates: [
          { id: 'mono_ruins_whisper', title: 'Ruins Whisper', description: 'ruins', choices: [], baseEffects: {}, variables: [] }
        ],
        parameters: {},
        weight: 1
      }
    ]
  },
  {
    id: 'mono_combat_quick',
    type: 'state_based',
    conditions: { 'ui.currentScreen': 'combat' },
    priority: 25,
    eventGenerators: [
      {
        id: 'mono_combat_gen',
        type: 'template_based',
        templates: [
          { id: 'mono_combat_short', title: 'Combat Shout', description: 'combat', choices: [], baseEffects: {}, variables: [] }
        ],
        parameters: {},
        weight: 1
      }
    ]
  },
  {
    id: 'mono_ambient_pool',
    type: 'state_based',
    conditions: { 'world.tick': undefined }, // generic ambient trigger evaluated frequently
    priority: 5,
    eventGenerators: [
      {
        id: 'mono_ambient_gen',
        type: 'template_based',
        templates: [
          { id: 'mono_ambient_1', title: 'Ambient Line', description: 'ambient', choices: [], baseEffects: {}, variables: [] }
        ],
        parameters: {},
        weight: 1
      }
    ]
  }
];

export default MONOLOGUE_TRIGGERS;
