"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CODEX_ENTRIES = void 0;
const taiYungLore_1 = require("./taiYungLore");
// Minimal migration: wrap existing lore arrays into CodexEntry shapes
exports.CODEX_ENTRIES = {
    tai_yung_creation: {
        id: 'tai_yung_creation',
        title: 'Creation Myth of Tai Yung',
        summary: 'Origins and the Great Dao Integration',
        content: taiYungLore_1.TAI_YUNG_COMBINED_LORE,
        tags: ['myth', 'history', 'tai_yung'],
        source: 'tai_yung_lore',
    },
    tai_yung_opening: {
        id: 'tai_yung_opening',
        title: 'Tai Yung: Opening',
        summary: 'Opening lore for the beginning of the game',
        content: taiYungLore_1.TAI_YUNG_OPENING_LORE,
        tags: ['intro', 'opening'],
        source: 'tai_yung_lore',
    },
    tai_yung_realms: {
        id: 'tai_yung_realms',
        title: 'Realms of Tai Yung',
        summary: 'Descriptions of realms and their characteristics',
        content: [
            'Introduction',
            ...taiYungLore_1.TAI_YUNG_REALM_LORE.introduction,
            'Mortal Realms',
            ...taiYungLore_1.TAI_YUNG_REALM_LORE.mortal_realms,
            'Immortal Realms',
            ...taiYungLore_1.TAI_YUNG_REALM_LORE.immortal_realms,
            'Transcendent Realms',
            ...taiYungLore_1.TAI_YUNG_REALM_LORE.transcendent_realms,
            'Absolute Realm',
            ...taiYungLore_1.TAI_YUNG_REALM_LORE.absolute_realm,
        ],
        tags: ['realms', 'worldbuilding'],
        source: 'tai_yung_lore',
    },
    cultivation_philosophy: {
        id: 'cultivation_philosophy',
        title: 'Cultivation Philosophy',
        summary: 'Guidance and philosophy on cultivation',
        content: taiYungLore_1.CULTIVATION_PHILOSOPHY,
        tags: ['philosophy', 'cultivation'],
        source: 'tai_yung_lore',
    }
};
exports.default = exports.CODEX_ENTRIES;
