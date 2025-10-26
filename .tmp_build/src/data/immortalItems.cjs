"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMMORTAL_ITEM_RARITY_WEIGHTS = exports.IMMORTAL_ITEMS = void 0;
exports.findImmortalItemById = findImmortalItemById;
const immortalEmperorConsciousness_1 = require("@/systems/immortalEmperorConsciousness");
const tierMigration_1 = require("@/migrations/tierMigration");
exports.IMMORTAL_ITEMS = [
    {
        id: 'immortal_heaven_sealing_sword',
        name: "Heaven-Sealing Sword",
        type: 'weapon',
        rarity: "D",
        rarityCode: (0, tierMigration_1.migrateTier)("D"),
        spawnWeight: 5,
        coords: { x: 342, y: 128 },
        guardianSects: ['Azure Sword Sect'],
        discoveryHints: ['Find the old sword shrine beneath the northern peaks', 'Whispers of a proud will linger in moonlit forges'],
        containsConsciousness: true,
        consciousness: (0, immortalEmperorConsciousness_1.createSampleConsciousnessFor)('Sword Immortal', 'Founding Era'),
        description: 'A sword that hums with a proud ancient will.'
    },
    {
        id: 'immortal_primordial_mirror',
        name: 'Primordial Mirror',
        type: 'artifact',
        rarity: "F",
        rarityCode: (0, tierMigration_1.migrateTier)("F"),
        spawnWeight: 15,
        coords: { x: 82, y: 900 },
        guardianSects: ['Chaos Keepers'],
        discoveryHints: ['Hidden behind the waterfall of the lost marsh', 'Reflects the storms of the Primordial Era'],
        containsConsciousness: true,
        consciousness: (0, immortalEmperorConsciousness_1.createSampleConsciousnessFor)('Lord of Chaos', 'Primordial Era'),
        description: 'A mirror containing chaotic yet ancient awareness.'
    },
    {
        id: 'immortal_emperor_jade_slip',
        name: "Emperor's Heritage Jade Slip",
        type: 'manual',
        rarity: "F",
        rarityCode: (0, tierMigration_1.migrateTier)("F"),
        spawnWeight: 10,
        coords: { x: 501, y: 412 },
        guardianSects: ['Jade Library Monks'],
        discoveryHints: ['Buried in the library vault of the Jade Monastery', 'Requires the proper ritual to reveal'],
        containsConsciousness: true,
        consciousness: (0, immortalEmperorConsciousness_1.createSampleConsciousnessFor)('Imperial Sage', 'Era of Ascendancy'),
        description: 'A jade slip that whispers tests and trials to the mind.'
    }
];
function findImmortalItemById(id) {
    return exports.IMMORTAL_ITEMS.find(i => i.id === id) || null;
}
// Small rarity weight map to be used by quest selection
exports.IMMORTAL_ITEM_RARITY_WEIGHTS = {
    H: 60,
    G: 25,
    F: 10,
    D: 5,
};
