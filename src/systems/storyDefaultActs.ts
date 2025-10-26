// Large default story acts extracted into their own module so bundlers can split
// this data into a separate chunk. Kept untyped to avoid circular type imports.
export function loadDefaultActs() {
  const acts = new Map();

  const act1 = {
    id: 'act1',
    title: 'The Path Begins',
    description: 'Your journey into the world of cultivation starts here.',
    mainQuests: [
      {
        id: 'first_cultivation',
        title: 'First Steps on the Dao',
        description: 'Begin your cultivation journey by reaching the Qi Gathering realm.',
        status: 'active',
        objectives: [
          {
            id: 'reach_qi_gathering',
            type: 'REACH_REALM',
            description: 'Reach Qi Gathering realm',
            target: 'realm',
            value: 'Qi Gathering',
            isCompleted: false
          }
        ]
      },
      {
        id: 'join_sect',
        title: 'Find Your Place',
        description: 'Join a sect to gain access to resources and teachings.',
        status: 'inactive',
        objectives: [
          {
            id: 'sect_membership',
            type: 'HAVE_STAT',
            description: 'Join any sect',
            target: 'sect',
            value: 'any',
            isCompleted: false
          }
        ]
      }
    ],
    sideQuests: [
      {
        id: 'first_rival',
        title: 'A Challenger Appears',
        description: 'Defeat your first rival to establish your reputation.',
        status: 'inactive',
        objectives: [
          {
            id: 'defeat_first_rival',
            type: 'DEFEAT_RIVAL',
            description: 'Defeat any rival',
            target: 'any',
            value: 1,
            isCompleted: false
          }
        ]
      }
    ],
    events: [
      {
        id: 'mysterious_encounter',
        title: 'Mysterious Encounter',
        description: 'A hooded figure approaches you with an offer...',
        conditions: { level: 5 },
        choices: [
          {
            id: 'accept_offer',
            text: 'Accept the mysterious offer',
            consequences: {
              karma: -10,
              stats: { insight: 20 },
              flags: { mysterious_ally: true }
            }
          },
          {
            id: 'decline_offer',
            text: 'Politely decline',
            consequences: {
              karma: 5,
              stats: { patience: 10 }
            }
          }
        ]
      }
    ]
  };

  const act2 = {
    id: 'act2',
    title: 'Trials of the Sect',
    description: 'Having joined a sect, you must prove your worth and climb the inner ranks.',
    unlockConditions: {
      previousAct: 'act1',
      level: 8,
      realm: 'Qi Gathering'
    },
    mainQuests: [
      {
        id: 'sect_trials',
        title: 'Prove Your Worth',
        description: 'Complete the sect’s initiation trials.',
        status: 'inactive',
        objectives: [
          {
            id: 'trial_tasks',
            type: 'COMPLETE_TASKS',
            description: 'Complete 3 sect tasks',
            target: 'tasks',
            value: 3,
            isCompleted: false
          }
        ]
      },
      {
        id: 'foundation_prep',
        title: 'Preparing the Foundation',
        description: 'Accumulate resources and insight for Foundation Establishment.',
        status: 'inactive',
        objectives: [
          {
            id: 'gather_resources',
            type: 'GATHER_RESOURCES',
            description: 'Gather cultivation resources',
            target: 'resources',
            value: 100,
            isCompleted: false
          }
        ]
      }
    ],
    sideQuests: [
      {
        id: 'rivalry_deepens',
        title: 'Old Rival, New Stakes',
        description: 'Your old rival resurfaces with a challenge.',
        status: 'inactive',
        objectives: [
          {
            id: 'challenge_duel',
            type: 'WIN_DUEL',
            description: 'Win a duel against your rival',
            target: 'rival',
            value: 1,
            isCompleted: false
          }
        ]
      }
    ],
    events: [
      {
        id: 'hall_elder_audience',
        title: 'Audience with the Hall Elder',
        description: 'An elder summons you to discuss your future.',
        conditions: { level: 10, questCompleted: 'sect_trials' },
        choices: [
          {
            id: 'pledge_loyalty',
            text: 'Pledge loyalty to the sect',
            consequences: {
              sectReputation: 20,
              flags: { pledged_loyalty: true },
              stats: { discipline: 10 }
            }
          },
          {
            id: 'remain_independent',
            text: 'Remain independent',
            consequences: {
              karma: 5,
              flags: { pledged_loyalty: false },
              stats: { freedom: 10 }
            }
          }
        ]
      },
      {
        id: 'revenge_act1_villain',
        title: 'Return of the Bandit Lord',
        description: 'Zhou Ren, the Bandit Lord of Black Marsh, challenges you again.',
        conditions: { level: 9 },
        choices: [
          {
            id: 'accept_duel',
            text: 'Accept the duel',
            consequences: {
              flags: { act1_villain_revenge_triggered: true },
              questStart: 'defeat_act1_villain'
            }
          },
          {
            id: 'avoid',
            text: 'Avoid confrontation',
            consequences: {
              karma: -2,
              flags: { avoided_act1_villain: true }
            }
          }
        ]
      }
    ]
  };

  const act3 = {
    id: 'act3',
    title: 'Foundation and Influence',
    description: 'You lay your Foundation and begin to influence the sect and region.',
    unlockConditions: {
      previousAct: 'act2',
      level: 15,
      realm: 'Foundation Establishment'
    },
    mainQuests: [
      {
        id: 'establish_foundation',
        title: 'Foundation Establishment',
        description: 'Reach Foundation Establishment.',
        status: 'inactive',
        objectives: [
          {
            id: 'reach_foundation',
            type: 'REACH_REALM',
            description: 'Reach Foundation Establishment realm',
            target: 'realm',
            value: 'Foundation Establishment',
            isCompleted: false
          }
        ]
      },
      {
        id: 'secure_allies',
        title: 'Secure Allies',
        description: 'Forge alliances to prepare for future conflicts.',
        status: 'inactive',
        objectives: [
          {
            id: 'ally_count',
            type: 'GAIN_ALLIES',
            description: 'Gain 2 allies',
            target: 'allies',
            value: 2,
            isCompleted: false
          }
        ]
      }
    ],
    sideQuests: [
      {
        id: 'rogue_cultivator',
        title: 'Rogue Cultivator Threat',
        description: 'A rogue cultivator terrorizes nearby villages.',
        status: 'inactive',
        objectives: [
          {
            id: 'deal_with_rogue',
            type: 'DEFEAT_ENEMY',
            description: 'Defeat the rogue cultivator',
            target: 'rogue',
            value: 1,
            isCompleted: false
          }
        ]
      }
    ],
    events: [
      {
        id: 'alliance_banquet',
        title: 'Alliance Banquet',
        description: 'Sects gather to discuss a regional alliance.'
      }
    ]
  };

  const act4 = {
    id: 'act4',
    title: 'Core and Conflict',
    description: 'Approach Core Formation as greater conflicts brew in the realm.',
    unlockConditions: {
      previousAct: 'act3',
      level: 25,
      realm: 'Core Formation'
    },
    mainQuests: [],
    sideQuests: [],
    events: []
  };

  acts.set('act1', act1);
  acts.set('act2', act2);
  acts.set('act3', act3);
  acts.set('act4', act4);

  return acts;
}
