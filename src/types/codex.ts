export interface CodexEntry {
  id: string;
  title: string;
  summary?: string;
  content: string[]; // paragraphs or sections
  tags?: string[];
  source?: string; // e.g. 'tai_yung_lore'
  addedTick?: number; // optional world tick when added
}

export type CodexIndex = Record<string, CodexEntry>;

export default CodexEntry;
