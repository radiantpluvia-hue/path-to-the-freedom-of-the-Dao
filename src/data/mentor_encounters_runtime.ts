// Runtime registration for secret mentor encounters.
// This module is intentionally small and lazy-imported from exploration logic.
import { ENCOUNTER_NARRATIVES } from './encounterNarratives';
import { allMentors } from './mentors_runtime';

// Create simple encounter templates for secret mentors. These are short narrative
// templates that allow meeting a mentor during exploration. They reference the
// mentor id under meta so UI can render more context if needed.
export function registerSecretMentorEncounters(mentorIds: string[]) {
  if (!Array.isArray(mentorIds) || mentorIds.length === 0) return;
  for (const id of mentorIds) {
    const mentor = allMentors.find(m => m.id === id);
    if (!mentor) continue;
    const tid = `mentor_encounter_${id}`;
    if (ENCOUNTER_NARRATIVES[tid]) continue; // don't overwrite
    ENCOUNTER_NARRATIVES[tid] = {
      id: tid,
      title: `A Mysterious Teacher: ${mentor.displayName || mentor.name || id}`,
      body: `You notice a lone figure in the distance. As you approach, their aura suggests deep cultivation experience. They may offer guidance — but at what cost?`,
      choices: [
        { id: 'accept', text: 'Accept mentorship / listen', consequence: 'reward' },
        { id: 'decline', text: 'Decline and move on', consequence: 'escape' }
      ],
      meta: { mentorId: id }
    };
  }
}

// Helper to pick a rare secret mentor id list. For now, choose from mentors marked
// `secret` in the runtime mentor list and return up to N ids.
export function pickRareMentorIds(count = 1) {
  const candidates = allMentors.filter(m => m && (m.secret || m.status === 'immortal'));
  if (candidates.length === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * candidates.length);
    const id = candidates[idx].id;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export default registerSecretMentorEncounters;
