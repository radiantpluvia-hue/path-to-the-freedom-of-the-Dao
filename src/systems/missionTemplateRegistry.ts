// Lightweight registry to store named mission templates that can be referenced
// by id when unlocking chained missions. Templates are plain objects compatible
// with MissionSystem's MissionTemplate shape (partial allowed).
export type RegisteredMissionTemplate = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  target?: string;
  location?: string;
  baseReward?: any;
  difficulty?: string;
  requirements?: any;
};

const registry: Record<string, RegisteredMissionTemplate> = {};

export function registerMissionTemplate(t: RegisteredMissionTemplate) {
  if (!t || !t.id) return false;
  registry[t.id] = t;
  return true;
}

export function getRegisteredMissionTemplate(id: string): RegisteredMissionTemplate | null {
  return registry[id] || null;
}

export function clearMissionRegistry() {
  for (const k of Object.keys(registry)) delete registry[k];
}

export function listRegisteredTemplates(): RegisteredMissionTemplate[] {
  return Object.values(registry);
}

// Seed with a couple of common templates (safe defaults for tests/dev)
registerMissionTemplate({ id: 'herb_collection', title: 'Herb Collection', description: 'Collect herbs for your sect.', type: 'gather', target: 'spirit_herbs', location: 'Misty Valley', difficulty: 'easy' });
registerMissionTemplate({ id: 'beast_core_hunt', title: 'Beast Core Hunt', description: 'Hunt beasts for cores.', type: 'defeat', target: 'shadow_wolves', location: 'Dark Forest', difficulty: 'medium' });

export default {
  registerMissionTemplate,
  getRegisteredMissionTemplate,
  clearMissionRegistry,
  listRegisteredTemplates
};
