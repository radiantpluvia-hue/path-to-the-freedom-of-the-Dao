/**
 * CharacterGenerator
 * - Defaults to non-deterministic RNG (Math.random)
 * - Accepts an injected rng for deterministic generation when desired
 */
import names from '../data/names_full';
import quirks from '../data/quirks_full';
import abilities from '../data/abilities_full';
import equipment from '../data/equipment_full';
import backstoryHooks from '../data/backstoryHooks';

export type CharacterSnapshot = {
  id: string;
  name: string;
  archetype: string;
  realm?: string;
  abilities: string[];
  equipment: string[];
  quirks: string[];
  personality: number[]; // 6-axis
  backstory?: string;
  dialogueCache?: Record<string,string>;
};

export function defaultRng() { return Math.random; }

function choice<T>(arr: readonly T[], rng: () => number) {
  if (!arr || arr.length === 0) return undefined as any;
  return arr[Math.floor(rng() * arr.length)];
}

/** Compute normalized Levenshtein distance (simple) */
function nameSimilarity(a: string, b: string) {
  if (!a || !b) return 0;
  a = a.toLowerCase(); b = b.toLowerCase();
  if (a === b) return 1;
  const la = a.length, lb = b.length;
  const len = Math.max(la, lb);
  let common = 0;
  for (let i=0;i<Math.min(la,lb);i++) if (a[i]===b[i]) common++;
  return common / len;
}

/** Similarity metric as described (non-deterministic helper) */
export function similarityScoreImproved(a: CharacterSnapshot, b: CharacterSnapshot) {
  // abilities Jaccard
  const sa = new Set(a.abilities||[]); const sb = new Set(b.abilities||[]);
  const inter = [...sa].filter(x=>sb.has(x)).length;
  const union = new Set([...a.abilities||[], ...b.abilities||[]]).size || 1;
  const abilitiesScore = inter / union; // weight 0.40

  const nameScore = nameSimilarity(a.name||'', b.name||''); // weight 0.15

  // personality cosine
  const pa = a.personality || []; const pb = b.personality || [];
  let dot = 0, na = 0, nb = 0;
  for (let i=0;i<Math.max(pa.length,pb.length);i++){ const va=pa[i]||0; const vb=pb[i]||0; dot+=va*vb; na+=va*va; nb+=vb*vb }
  const personalityScore = dot / (Math.sqrt(na)||1) / (Math.sqrt(nb)||1) || 0; // weight 0.20

  const archetypeScore = (a.archetype === b.archetype) ? 1 : 0; // weight 0.12

  const equipA = new Set(a.equipment||[]); const equipB = new Set(b.equipment||[]);
  const eqInter = [...equipA].filter(x=>equipB.has(x)).length;
  const eqUnion = new Set([...a.equipment||[], ...b.equipment||[]]).size||1;
  const equipScore = eqInter / eqUnion; // weight 0.08

  const score = abilitiesScore*0.40 + nameScore*0.15 + personalityScore*0.20 + archetypeScore*0.12 + equipScore*0.08;
  return Math.max(0, Math.min(1, score));
}

export class CharacterGenerator {
  worldSeed: string | undefined;
  cache: Map<string, CharacterSnapshot> = new Map();
  rng: () => number;
  constructor(worldSeed?: string, rng?: ()=>number) {
    this.worldSeed = worldSeed;
    this.rng = rng || Math.random;
  }

  get(entitySeed: string) {
    return this.cache.get(entitySeed);
  }

  buildPersonaPrompt(snapshot: CharacterSnapshot, context: { sceneDescription: string; playerAction?: string; relation?: string }) {
    return `Persona: ${snapshot.name} - ${snapshot.archetype}. Scene: ${context.sceneDescription}.`; 
  }

  generate(entitySeed: string, opts?: { realm?: string; roleHint?: string }): CharacterSnapshot {
    const rng = this.rng;
    // name
    const name = choice(names, rng) as string;
    const archetype = opts?.roleHint || choice(['warrior','scholar','hermit','rogue','mystic'], rng) as string;
    const abilCount = 1 + Math.floor(rng()*3);
    const abilSet = new Set<string>();
    while (abilSet.size < abilCount) abilSet.add(choice(abilities, rng) as string);

    const equipCount = 1 + Math.floor(rng()*2);
    const equipSet = new Set<string>();
    while (equipSet.size < equipCount) equipSet.add(choice(equipment, rng) as string);

    const quirksCount = 1 + Math.floor(rng()*2);
    const qSet = new Set<string>();
    while (qSet.size < quirksCount) qSet.add(choice(quirks, rng) as string);

    // personality 6-axis
    const personality = Array.from({length:6}, ()=>Math.round(rng()*100)/100);

    const snapshot: CharacterSnapshot = {
      id: `${entitySeed}_${Date.now().toString(36)}`,
      name,
      archetype,
      realm: opts?.realm,
      abilities: [...abilSet],
      equipment: [...equipSet],
      quirks: [...qSet],
      personality,
      backstory: choice(backstoryHooks, rng) as string,
      dialogueCache: {},
    };

    // anti-duplication: compare with recent cache entries and mutate if too similar
    let tries = 0;
    while (tries < 6) {
      let tooSimilar = false;
      for (const v of this.cache.values()) {
        const sim = similarityScoreImproved(snapshot, v);
        if (sim > 0.78) { tooSimilar = true; break; }
      }
      if (!tooSimilar) break;
      // mutate slightly
      snapshot.name = choice(names, rng) as string;
      snapshot.personality = Array.from({length:6}, ()=>Math.round(rng()*100)/100);
      tries++;
    }

    this.cache.set(entitySeed, snapshot);
    return snapshot;
  }
}

export default CharacterGenerator;
