import { CodexEntry } from '../types/codex';
import { TAI_YUNG_COMBINED_LORE, TAI_YUNG_OPENING_LORE, TAI_YUNG_REALM_LORE, CULTIVATION_PHILOSOPHY } from './taiYungLore';

// Minimal migration: wrap existing lore arrays into CodexEntry shapes
export const CODEX_ENTRIES: Record<string, CodexEntry> = {
  tai_yung_creation: {
    id: 'tai_yung_creation',
    title: 'Creation Myth of Tai Yung',
    summary: 'Origins and the Great Dao Integration',
    content: TAI_YUNG_COMBINED_LORE,
    tags: ['myth', 'history', 'tai_yung'],
    source: 'tai_yung_lore',
  },
  tai_yung_opening: {
    id: 'tai_yung_opening',
    title: 'Tai Yung: Opening',
    summary: 'Opening lore for the beginning of the game',
    content: TAI_YUNG_OPENING_LORE,
    tags: ['intro', 'opening'],
    source: 'tai_yung_lore',
  },
  tai_yung_realms: {
    id: 'tai_yung_realms',
    title: 'Realms of Tai Yung',
    summary: 'Descriptions of realms and their characteristics',
    content: [
      'Introduction',
      ...TAI_YUNG_REALM_LORE.introduction,
      'Mortal Realms',
      ...TAI_YUNG_REALM_LORE.mortal_realms,
      'Immortal Realms',
      ...TAI_YUNG_REALM_LORE.immortal_realms,
      'Transcendent Realms',
      ...TAI_YUNG_REALM_LORE.transcendent_realms,
      'Absolute Realm',
      ...TAI_YUNG_REALM_LORE.absolute_realm,
    ],
    tags: ['realms', 'worldbuilding'],
    source: 'tai_yung_lore',
  },
  cultivation_philosophy: {
    id: 'cultivation_philosophy',
    title: 'Cultivation Philosophy',
    summary: 'Guidance and philosophy on cultivation',
    content: CULTIVATION_PHILOSOPHY,
    tags: ['philosophy', 'cultivation'],
    source: 'tai_yung_lore',
  }
};

export default CODEX_ENTRIES;
