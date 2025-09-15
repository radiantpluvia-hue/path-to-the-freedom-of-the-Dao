import { Quest } from './storyData';

export interface RevengeQuest extends Quest {
  offeredBy: string; // rivalId
  offeredByName: string; // rivalName
  targetSect: string; // player's sectId
  objective: string;
  reward: {
    spiritStones?: { low?: number; mid?: number; high?: number };
    item?: any;
    rivalRelationship?: number;
    sectReputation?: number;
  };
}

export const revengeQuests: Record<string, Record<string, RevengeQuest>> = {
  'blood_moon_sect': {
    'revenge_on_azure_cloud': {
      id: 'revenge_on_azure_cloud',
      title: 'Revenge: A Debt of Blood',
      description: 'The Azure Cloud Sect preaches order and purity. As their new enemy, the Blood Moon Sect demands you show them the beauty of chaos. Disrupt their annual purification ritual at the Azure Spring and make them remember your name.',
      offeredBy: 'blood_moon_elder',
      offeredByName: 'Elder Blood Moon',
      targetSect: 'azure_cloud_sect',
      objective: 'Disrupt the Azure Spring purification ritual',
      reward: {
        spiritStones: { mid: 500 },
        rivalRelationship: 20,
        sectReputation: 50
      },
      objectives: [
        {
          description: 'Disrupt the Azure Spring Ritual.',
          type: 'trigger_event',
          target: 'revenge_azure_cloud_disrupt_ritual',
          isCompleted: (state) => state.world.flags['ritual_disrupted'] === true,
        }
      ]
    }
  },
  'azure_cloud_sect': {
    'revenge_on_blood_moon': {
      id: 'revenge_on_blood_moon',
      title: 'Revenge: Cleansing the Stain',
      description: 'The Blood Moon Sect thrives on chaos and slaughter. The Azure Cloud Sect requires you to strike at their heart. Destroy their primary Blood Altar, a nexus of their demonic power, and prove your commitment to righteousness.',
      offeredBy: 'azure_cloud_master',
      offeredByName: 'Master Azure Cloud',
      targetSect: 'blood_moon_sect',
      objective: 'Destroy the Blood Moon Altar',
      reward: {
        spiritStones: { high: 100 },
        rivalRelationship: 25,
        sectReputation: 75
      },
      objectives: [
        {
          description: 'Destroy the Blood Moon Altar.',
          type: 'trigger_event',
          target: 'revenge_blood_moon_destroy_altar',
          isCompleted: (state) => state.world.flags['altar_destroyed'] === true,
        }
      ]
    }
  },
  'heavenly_merchant_guild': {
    'revenge_on_azure_cloud': {
      id: 'revenge_on_azure_cloud_merchant',
      title: 'Revenge: A Hostile Market',
      description: 'The Azure Cloud Sect prides itself on its control over the northern spirit stone mines. The Guild sees an opportunity. Use your knowledge of their operations to orchestrate a market crash and acquire their mining rights for a pittance.',
      offeredBy: 'merchant_guild_master',
      offeredByName: 'Guild Master',
      targetSect: 'azure_cloud_sect',
      objective: 'Sabotage Azure Cloud mining operations',
      reward: {
        spiritStones: { low: 1000, mid: 200 },
        rivalRelationship: 15,
        sectReputation: 40
      },
      objectives: [
        {
          description: 'Sabotage the Azure Cloud Sect\'s mining operations.',
          type: 'trigger_event',
          target: 'revenge_azure_cloud_sabotage_market',
          isCompleted: (state) => state.world.flags['market_crashed'] === true,
        }
      ]
    }
  },
  'eternal_dao_academy': {
    'revenge_on_blood_moon': {
      id: 'revenge_on_blood_moon_academy',
      title: 'Revenge: A Stolen Legacy',
      description: 'The Blood Moon Sect recently plundered an ancient tomb, stealing texts the Academy has sought for centuries. Infiltrate their library, retrieve the stolen knowledge, and escape. We value knowledge, not bloodshed.',
      offeredBy: 'academy_elder',
      offeredByName: 'Elder Scholar',
      targetSect: 'blood_moon_sect',
      objective: 'Retrieve stolen ancient texts',
      reward: {
        spiritStones: { mid: 300, high: 50 },
        rivalRelationship: 18,
        sectReputation: 60
      },
      objectives: [
        {
          description: 'Retrieve the stolen texts from the Blood Moon Sect.',
          type: 'trigger_event',
          target: 'revenge_blood_moon_retrieve_texts',
          isCompleted: (state) => state.world.flags['texts_retrieved'] === true,
        }
      ]
    }
  }
};
