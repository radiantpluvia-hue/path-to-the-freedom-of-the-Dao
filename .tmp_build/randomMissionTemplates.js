"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionTemplates = void 0;
exports.missionTemplates = {
    'azure_cloud_sect': [
        {
            type: 'defeat',
            title: 'Clear out the {target}',
            description: 'A pack of {target} has made a lair in the {location}, threatening nearby villages. Uphold the sect\'s duty and eliminate them.',
            targets: ['Vicious Spirit Wolves', 'Corrupted Forest Sprites', 'Rogue Cultivators'],
            locations: ['Whispering Woods', 'Greenwater Valley', 'Silent Mountain Pass'],
            reward: {
                spiritStones: { low: [50, 100], mid: [0, 5] },
                sectReputation: [5, 10],
                karma: [2, 5],
            },
        },
    ],
    'eternal_dao_academy': [
        {
            type: 'investigate',
            title: 'Survey the {location}',
            description: 'An ancient text mentions strange energy fluctuations in the {location}. Go there, record your findings on this {target}, and return. Do not engage any threats unless necessary.',
            targets: ['Survey Slate', 'Acoustic Resonance Crystal', 'Spiritual Compass'],
            locations: ['Fallen Star Crater', 'The Shifting Sands', 'The Echoing Caverns'],
            reward: {
                spiritStones: { low: [60, 90], mid: [1, 4] },
                sectReputation: [5, 10],
            },
        },
    ],
    'blood_moon_sect': [
        {
            type: 'gather',
            title: 'Harvest {target}',
            description: 'The elders require {target} for a dark ritual. Travel to the {location} and retrieve it. Do not fail.',
            targets: ['Blood-Soaked Spirit Herbs', 'Hearts of Shadow Beasts', 'Screaming Mandrake Roots'],
            locations: ['Gloomfang Swamp', 'The Scarred Peaks', 'The Sunken Crypt'],
            reward: {
                spiritStones: { low: [75, 125], mid: [3, 8] },
                sectReputation: [5, 10],
                karma: [-5, -2],
            },
        },
    ],
    'heavenly_merchant_guild': [
        {
            type: 'escort',
            title: 'Protect the {target}',
            description: 'A valuable {target} is being transported through the {location}. Ensure it reaches its destination safely. Your payment depends on its condition.',
            targets: ['Spirit Stone Caravan', 'Rare Artifact Shipment', 'VIP Client'],
            locations: ['Crimson Road', 'Dragon\'s Tooth Pass', 'The Merchant\'s Trail'],
            reward: {
                spiritStones: { low: [100, 200], mid: [5, 15] },
                sectReputation: [5, 10],
            },
        },
    ],
};
