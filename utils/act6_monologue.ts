// act6_monologue.ts

export const act6Monologue = {
  opening: `The heavens dim, as though the very stars retreat from what is to come.\nWhispers spread of a convergence — a rare alignment of celestial currents said to open paths to realms untouched since the Primordial Era.\nYet the air carries tension; the great sects watch each other with predatory caution. Treasures unimaginable will be born in this convergence, but so too will calamities.\nYou feel it in your bones: the Path ahead will either forge you into a legend… or break you utterly.`,

  lore: `Act 6 centers on The Twilight Convergence, a cosmic phenomenon that temporarily weakens the barriers between realms, causing treasures, forbidden zones, and ancient entities to surface.\nIt’s the last major proving ground before the Heaven’s Divide in Act 7.`,

  keyThemes: [
    'Opportunity vs. Overreach — rare chances come with deadly risks.',
    'Factions in Shadow — hidden sects and forbidden clans reappear.',
    'Dao Testing Grounds — environments that push the player’s comprehension and resourcefulness.',
    'Celestial Politics — every gain you make can shift alliances or paint a target on your back.'
  ],

  structure: [
    'Pre-Convergence Events (setup + rumors)',
    'The Convergence Peaks (high-value opportunities, dangerous fights)',
    'Twilight Tribulation (special trial unique to the convergence)',
    'Post-Convergence Fallout (rival power jumps, mentor guidance, setup for Act 7)'
  ],

  mechanics: [
    'Temporal Rifts — timed events that disappear after a few turns if ignored.',
    'Faction Alignment Meter — gain or lose standing with 3 key sect alliances based on choices.',
    'Twilight Tribulation — hybrid combat + comprehension challenge, failure has severe political and cultivation consequences.'
  ],

  eventPool: {
    preConvergence: [
      'Wandering Sage warns of the celestial shift — cryptic riddle choice.',
      'Merchant sells “Twilight Keys” of unknown function.',
      'Sect Leader summons you for a political directive.',
      'Hidden assassin tests your readiness.',
      'Rumor chain of the “Starlit Tomb” (multi-stage).',
      'Rival duel under the aurora sky.',
      'Mentor requests rare herb before convergence.',
      'Minor realm tribulation interference.',
      'Pilgrims seeking celestial blessing.',
      'Map fragment acquisition.'
    ],
    peakConvergence: [
      'Rift opens to treasure vault (trap vs. loot).',
      'Battle over the Astral Spring.',
      'Rare Dao scripture drifting in open space.',
      'Void beast rampage.',
      'Heaven-grade ore deposit.',
      'Duel invitation from another sect’s prodigy.',
      'Celestial mirror challenge.',
      'Rescue mission from collapsing rift.',
      'Cross-faction council debate.',
      'Ancient spirit’s gamble.'
    ],
    falloutTribulation: [
      'Faction reward ceremony.',
      'Mentor delivers cryptic praise or warning.',
      'Twilight Tribulation begins.',
      'Betrayal within your sect.',
      'Rival gains an unexpected boon.',
      'Political marriage proposal.',
      'Rogue cultivator ambush.',
      'Mysterious illness affecting sect elders.',
      'Closing Rift—last chance treasure.',
      'Final monologue leading to Act 7.'
    ]
  },

  mentorQuestChain: [
    'Gather intelligence on rival sect movements.',
    'Escort a rare resource shipment safely.',
    'Duel a chosen prodigy under mentor’s watch.',
    'Retrieve a “Twilight Key” from a dangerous rift.',
    'Win the Celestial Mirror challenge.',
    'Aid the mentor in a forbidden ritual to stabilize the convergence.',
    'Pass the mentor’s personal trial — a duel of wills in the Dao Sea.'
  ],

  twilightTribulation: {
    setup: 'Player is pulled into a convergence node; Dao essence collapses and reforms rapidly.',
    mechanics: 'Alternating combat waves + comprehension QTE events.',
    failure: 'Severe realm instability, -20% core stat growth for 10 turns, Dao-Heart -10, rival gains leap in power.',
    success: 'Unique title “Twilight-Touched”, +15% comprehension speed permanently, alliance boost.'
  },

  closing: `The stars realign. The air feels heavier, as though the Heavens themselves are watching.\nThe treasures you’ve gained shine brightly in your possession, but shadows gather at the edge of the horizon.\nSomewhere beyond the veil, the Heaven’s Divide stirs — a promise and a threat in equal measure.`
};
