"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stationsById = exports.allStations = void 0;
exports.allStations = [
    {
        id: 'heavenly_forge',
        name: 'Heavenly Forge',
        description: 'A forge blessed by celestial fire, improving the quality of crafted items.',
        skill: 'forging',
        bonuses: {
            successChance: 0.1,
            qualityChance: 0.2,
            expGainMultiplier: 1.5,
        },
    },
    {
        id: 'moonlit_cauldron',
        name: 'Moonlit Cauldron',
        description: 'An alchemy cauldron that gathers moonlight, increasing the potency of pills.',
        skill: 'alchemy',
        bonuses: {
            successChance: 0.05,
            qualityChance: 0.25,
        },
    },
];
exports.stationsById = new Map(exports.allStations.map(s => [s.id, s]));
