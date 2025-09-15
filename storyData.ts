import { GameState } from './src/types';
import { getRealmKeyFromPlayer } from './src/utils/realmHelpers';

type ObjectiveCheck = (state: GameState) => boolean;

export interface StoryObjective {
  description: string;
  type: 'trigger_event' | 'stat_check' | 'item_check' | 'flag_check' | 'realm_check';
  target: string; // event name, stat name, item id, flag name, realm id
  value?: number | string | boolean;
  isCompleted: ObjectiveCheck;
}

export interface Quest {
  id: string;
  title:string;
  description: string;
  objectives: StoryObjective[];
}

export interface Act {
  id: string;
  title: string;
  quests: Record<string, Quest>;
}

export const storyActs: Act[] = [
  {
    id: 'act1',
    title: 'Act I: The Mortal Coil – The Spark of Ambition',
    quests: {
      'spark_of_ambition': {
        id: 'spark_of_ambition',
        title: 'The Spark of Ambition',
        description: "Your life of obscurity is shattered by a chance encounter. A dying cultivator thrusts a mysterious jade slip into your hands, muttering about a great secret and a terrible truth. Now, you are hunted, and this slip is your only key to survival and power.",
        objectives: [
          {
            description: 'Survive the initial encounter and secure your first power.',
            type: 'trigger_event',
            target: 'act1_inciting_incident',
            isCompleted: (state) => state.world.flags['act1_branch_choice_made'] === true,
          },
          {
            description: 'Decipher the secrets of the Jade Slip.',
            type: 'stat_check',
            target: 'player.insight',
            value: 10,
            isCompleted: (state) => state.player.insight >= 10,
          },
        ],
      },
    },
  },
  {
    id: 'act2',
    title: 'Act II: The First Step – Qi Condensation',
    quests: {
      'first_step': {
        id: 'first_step',
        title: 'The First Step',
        description: "With a rudimentary cultivation manual, you must now formalize your path. The world is larger and more dangerous than you imagined. Will you seek the structure of a sect, or brave the wilds alone?",
        objectives: [
          {
            description: 'Reach the Qi Condensation Realm.',
            type: 'realm_check',
            target: 'qi_condensation',
            isCompleted: (state) => getRealmKeyFromPlayer(state.player as any) === 'qi_condensation',
          },
          {
            description: 'Choose a Faction or remain Independent.',
            type: 'trigger_event',
            target: 'act2_choose_faction',
            isCompleted: (state) => state.player.sect !== null || state.world.flags['chose_independent'] === true,
          },
          {
            description: 'Face your first true rival.',
            type: 'trigger_event',
            target: 'act2_rival_challenge',
            isCompleted: (state) => state.world.flags['act2_rival_defeated'] === true,
          },
        ],
      },
    },
  },
  {
    id: 'act3',
    title: 'Act III: Foundation Establishment – Forging the Path',
    quests: {
      'forging_the_path': {
        id: 'forging_the_path',
        title: 'Forging the Path',
        description: "Your cultivation has reached a bottleneck. To establish a solid foundation, you must comprehend your own Dao. This is a defining moment that will shape all future growth.",
        objectives: [
          {
            description: 'Choose your foundational Dao Principle.',
            type: 'trigger_event',
            target: 'act3_choose_dao',
            isCompleted: (state) => !!state.player.daoPrinciple,
          },
          {
            description: 'Obtain the rare resource needed to solidify your Foundation.',
            type: 'trigger_event',
            target: 'act3_resource_quest',
            isCompleted: (state) => state.world.flags['act3_resource_obtained'] === true,
          },
          {
            description: 'Reach the Foundation Establishment Realm.',
            type: 'realm_check',
            target: 'foundation_establishment',
            isCompleted: (state) => getRealmKeyFromPlayer(state.player as any) === 'foundation_establishment',
          },
        ],
      },
    },
  },
  {
    id: 'act4',
    title: 'Act IV: Core Formation – The Unfolding World',
    quests: {
      'unfolding_world': {
        id: 'unfolding_world',
        title: 'The Unfolding World',
        description: "You are no longer a novice. The wider world beckons, with its grand conflicts and hidden dangers. The Tournament of the Ten Sects is your chance to make a name for yourself, but the influence of the Heavenly Devourer begins to cast a long shadow.",
        objectives: [
          {
            description: 'Participate in the Tournament of the Ten Sects.',
            type: 'trigger_event',
            target: 'act4_tournament_start',
            isCompleted: (state) => state.world.flags['act4_tournament_completed'] === true,
          },
          {
            description: 'Investigate the strange Qi fluctuations and discover the Heavenly Devourer.',
            type: 'flag_check',
            target: 'world.flags.devourer_influence_known',
            value: true,
            isCompleted: (state) => state.world.flags['devourer_influence_known'] === true,
          },
          {
            description: 'Reach the Core Formation Realm.',
            type: 'realm_check',
            target: 'core_formation',
            isCompleted: (state) => getRealmKeyFromPlayer(state.player as any) === 'core_formation',
          },
        ],
      },
    },
  },
  {
    id: 'act5',
    title: "Act V: Nascent Soul – A Soul of One's Own",
    quests: {
      'soul_of_ones_own': {
        id: 'soul_of_ones_own',
        title: "A Soul of One's Own",
        description: "Forming a Nascent Soul is more than a breakthrough; it is the birth of a second self, a reflection of your Dao and all your choices. You must undertake a unique quest to nurture and strengthen this new existence.",
        objectives: [
          {
            description: 'Undertake your Nascent Soul strengthening quest.',
            type: 'trigger_event',
            target: 'act5_nascent_soul_quest',
            isCompleted: (state) => state.world.flags['nascent_soul_quest_completed'] === true,
          },
          {
            description: 'Reach the Nascent Soul Realm.',
            type: 'realm_check',
            target: 'nascent_soul',
            isCompleted: (state) => getRealmKeyFromPlayer(state.player as any) === 'nascent_soul',
          },
        ],
      },
    },
  },
  {
    id: 'act6',
    title: 'Act VI: Spirit Severing – The Price of Power',
    quests: {
      'price_of_power': {
        id: 'price_of_power',
        title: 'The Price of Power',
        description: "To ascend further, you must sever a part of yourself that holds you back—a weakness, an attachment, a regret. This profound, personal choice will birth an Inner Demon, a shadow that will walk in your steps.",
        objectives: [
          {
            description: 'Confront yourself and choose what to sever.',
            type: 'trigger_event',
            target: 'act6_severing_ritual',
            isCompleted: (state) => state.world.flags['act6_severing_complete'] === true,
          },
          {
            description: 'Reach the Spirit Severing Realm.',
            type: 'realm_check',
            target: 'spirit_severing',
            isCompleted: (state) => getRealmKeyFromPlayer(state.player as any) === 'spirit_severing',
          },
        ],
      },
    },
  },
  {
    id: 'act7',
    title: 'Act VII: Dao Seeking – The Immortal Threshold',
    quests: {
      'immortal_threshold': {
        id: 'immortal_threshold',
        title: 'The Immortal Threshold',
        description: "The final gate stands before you. Your Immortal Tribulation is not just a test of power, but a judgment of your entire life's path. Your karma, your enemies, your choices—all manifest to stop you. At the peak, the Heavenly Devourer itself will offer you a choice.",
        objectives: [
          {
            description: 'Face your Immortal Tribulation.',
            type: 'trigger_event',
            target: 'act7_start_tribulation',
            isCompleted: (state) => state.world.flags['act7_tribulation_faced'] === true,
          },
          {
            description: 'Ascend to Immortality... or fall to dust.',
            type: 'realm_check',
            target: 'immortal',
            isCompleted: (state) => getRealmKeyFromPlayer(state.player as any) === 'immortal' || state.world.flags['player_perished'] === true,
          },
        ],
      },
    },
  },
];