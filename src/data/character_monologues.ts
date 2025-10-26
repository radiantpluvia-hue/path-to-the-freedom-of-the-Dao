import type { Dialogue } from '../types';

// A curated set of monologues/dialogues for major role archetypes.
// These are short one-to-three line entries suitable for ambient monologues,
// scene beats, combat taunts, or conversation snippets.

const CHARACTER_MONOLOGUES: Dialogue[] = [
  // Sect leaders
  {
    id: 'leader_serene_intro',
    title: 'Serene Sect Leader - Opening',
    mono: false,
    lines: [
      { speaker: 'leader_serene', text: 'You stand at the threshold of choice, disciple. The Dao asks more of you than mere skill.' },
      { speaker: 'leader_serene', text: 'Temper your heart; glory without restraint is a pyre that consumes its worshipers.' }
    ],
    tags: ['leader', 'intro']
  },

  {
    id: 'leader_serene_private',
    title: 'Serene Sect Leader - Private Monologue',
    mono: true,
    lines: [
      { speaker: 'leader_serene', text: 'There are calculations a leader cannot speak aloud. Each life is a stone I must place upon a fragile bridge.' }
    ],
    tags: ['leader', 'monologue']
  },

  // Vice leaders
  {
    id: 'vice_brash_warning',
    title: 'Vice Leader - Brash Warning',
    lines: [
      { speaker: 'vice_brash', text: 'Listen up: the path is not for the faint. Take one misstep and even your reputation will be ash.' }
    ],
    tags: ['vice', 'warning']
  },

  // Senior disciples
  {
    id: 'senior_disciple_pride',
    title: 'Senior Disciple - Quiet Pride',
    lines: [
      { speaker: 'disciple_qiao', text: 'We carry our sect in our posture and our silence. The less we say, the sharper our blade becomes.' }
    ],
    tags: ['disciple', 'ambient']
  },

  // Junior disciples
  {
    id: 'junior_aspiration',
    title: 'Junior Disciple - Aspiration',
    lines: [
      { speaker: 'disciple_yun', text: 'One day I will rise above this courtyard and see the heavens as mentors do.' }
    ],
    tags: ['disciple', 'hope']
  },

  // Rivals
  {
    id: 'rival_cold_taunt',
    title: 'Rival - Cold Taunt',
    lines: [
      { speaker: 'rival_ice', text: "Run if you must; my name is the wind that finds you on the other side of the mountain." }
    ],
    tags: ['rival', 'taunt']
  },

  {
    id: 'rival_bitter_reflection',
    title: 'Rival - Bitter Reflection',
    mono: true,
    lines: [
      { speaker: 'rival_ice', text: 'They call me cruel. They do not remember the bargains I made to protect the ones I loved.' }
    ],
    tags: ['rival', 'monologue']
  },

  // Villains
  {
    id: 'villain_ambition',
    title: 'Villain - Ambition',
    lines: [
      { speaker: 'villain_zhao', text: 'Power is not a sin. It is a language; to speak it is to be fluent in survival.' }
    ],
    tags: ['villain', 'threat']
  },

  {
    id: 'villain_murmur',
    title: 'Villain - Quiet Murmur',
    mono: true,
    lines: [
      { speaker: 'villain_zhao', text: 'Soon the world will remember my name and forget the faces of those who mocked me.' }
    ],
    tags: ['villain', 'monologue']
  },

  // Friends
  {
    id: 'friend_loyal_banter',
    title: 'Friend - Loyal Banter',
    lines: [
      { speaker: 'friend_liu', text: 'If you stumble, I will carry you. If I stumble, you will drag me — that is friendship.' }
    ],
    tags: ['friend', 'banter']
  },

  // Lovers
  {
    id: 'lover_soft_vow',
    title: 'Lover - Soft Vow',
    mono: true,
    lines: [
      { speaker: 'lover_mei', text: 'I would cross the storm to stand by your side. Even a single dawn with you is a thousand lifetimes.' }
    ],
    tags: ['lover', 'romance']
  },

  // Mentor (wise elder)
  {
    id: 'mentor_grand_teach',
    title: 'Mentor - Grand Teaching',
    lines: [
      { speaker: 'mentor_han', text: 'Technique without restraint molds the heart into iron. Iron breaks; compassion endures.' }
    ],
    tags: ['mentor', 'teaching']
  },

  // Minor antagonists / bandits
  {
    id: 'bandit_bravado',
    title: 'Bandit - Bravado',
    lines: [
      { speaker: 'bandit_ao', text: 'Gold for your silence, friend. Or blood for your tomorrow — your choice.' }
    ],
    tags: ['bandit', 'menace']
  },

  // Extra: combat shouts and short one-liners for variety
  {
    id: 'combat_honor_shout',
    title: 'Combat - Honor Shout',
    lines: [
      { speaker: 'combat_generic', text: 'For the path, for honor!' }
    ],
    tags: ['combat', 'shout']
  },
  {
    id: 'combat_fury_shout',
    title: 'Combat - Fury Shout',
    lines: [
      { speaker: 'combat_generic', text: 'Taste steel and regret!' }
    ],
    tags: ['combat', 'taunt']
  },

  // Ambient ruined-ruins monologue for exploration
  {
    id: 'ruins_whisper',
    title: 'Ruins - Whisper',
    mono: true,
    lines: [
      { speaker: 'ancient_ruins', text: 'The stone remembers the footsteps of those who vanished; listen and learn their silence.' }
    ],
    tags: ['ruins', 'ambient']
  }
];

export default CHARACTER_MONOLOGUES;
