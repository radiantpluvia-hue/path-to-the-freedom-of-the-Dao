// eventExecutors_act1.ts
// Drop-in executor registry for Act 1 events (exec_act1_e01 .. exec_act1_e30).
// Self-contained: GameState type, helpers, metadata with long-form modal descriptions,
// programmatic registry mapping each exec_act1_eXX to the generic executor.

export type GameState = {
  player: {
    name?: string;
    realm?: number;
    level?: number;
    hp?: number;
    maxHp?: number;
    qi?: number;
    daoHeart?: number;
    reputation?: number;
    wealth?: number;
    inventory?: Record<string, number>;
    manuals?: string[];
    relationships?: Record<string, number>;
    factionRep?: Record<string, number>;
    contribution?: number;
    domain?: { id?: string; modifiers?: Record<string, any> } | null;
    [k: string]: any;
  };
  world: {
    flags?: Record<string, any>;
    domains?: any[];
    realmShards?: Array<{ id: string; effects?: any }>;
    questMarkers?: string[];
    stats?: Record<string, number>;
    [k: string]: any;
  };
};

export type ExecResult = {
  text: string;
  effects?: Record<string, any>;
};

function ensurePlayer(gs: GameState) {
  gs.player = gs.player || ({} as any);
  gs.player.hp = typeof gs.player.hp === "number" ? gs.player.hp : 1000;
  gs.player.maxHp = typeof gs.player.maxHp === "number" ? gs.player.maxHp : 1000;
  gs.player.qi = typeof gs.player.qi === "number" ? gs.player.qi : 200;
  gs.player.daoHeart = typeof gs.player.daoHeart === "number" ? gs.player.daoHeart : 5;
  gs.player.reputation = typeof gs.player.reputation === "number" ? gs.player.reputation : 0;
  gs.player.wealth = typeof gs.player.wealth === "number" ? gs.player.wealth : 0;
  gs.player.inventory = gs.player.inventory || {};
  gs.player.manuals = gs.player.manuals || [];
  gs.player.relationships = gs.player.relationships || {};
  gs.player.factionRep = gs.player.factionRep || {};
  gs.player.contribution = typeof gs.player.contribution === "number" ? gs.player.contribution : 0;
  gs.player.domain = gs.player.domain || null;
}

function ensureWorld(gs: GameState) {
  gs.world = gs.world || {};
  gs.world.flags = gs.world.flags || {};
  gs.world.domains = gs.world.domains || [];
  gs.world.realmShards = gs.world.realmShards || [];
  gs.world.questMarkers = gs.world.questMarkers || [];
  gs.world.stats = gs.world.stats || {};
}

/* -----------------------
   Helpers
   ----------------------- */

function addItem(gs: GameState, itemId: string, qty = 1) {
  ensurePlayer(gs);
  gs.player.inventory![itemId] = (gs.player.inventory![itemId] || 0) + qty;
}

function removeItem(gs: GameState, itemId: string, qty = 1) {
  ensurePlayer(gs);
  const have = gs.player.inventory![itemId] || 0;
  gs.player.inventory![itemId] = Math.max(0, have - qty);
  if (gs.player.inventory![itemId] === 0) delete gs.player.inventory![itemId];
}

function gainSkill(gs: GameState, skill: string, amount = 1) {
  gs.player.skills = gs.player.skills || {};
  gs.player.skills[skill] = (gs.player.skills[skill] || 0) + amount;
}

function adjustReputation(gs: GameState, amount: number) {
  ensurePlayer(gs);
  gs.player.reputation = (gs.player.reputation || 0) + amount;
}

function adjustFactionRep(gs: GameState, factionId: string, amount: number) {
  ensurePlayer(gs);
  gs.player.factionRep![factionId] = (gs.player.factionRep![factionId] || 0) + amount;
}

function grantContribution(gs: GameState, amount: number) {
  ensurePlayer(gs);
  gs.player.contribution = (gs.player.contribution || 0) + amount;
}

function unlockManual(gs: GameState, manualId: string) {
  ensurePlayer(gs);
  if (!gs.player.manuals!.includes(manualId)) gs.player.manuals!.push(manualId);
}

function addQuestMarker(gs: GameState, markerId: string) {
  ensureWorld(gs);
  if (!gs.world.questMarkers!.includes(markerId)) gs.world.questMarkers!.push(markerId);
}

function setFlag(gs: GameState, key: string, value: any) {
  ensureWorld(gs);
  gs.world.flags![key] = value;
}

function increaseStat(gs: GameState, stat: string, amount: number) {
  ensureWorld(gs);
  gs.world.stats![stat] = (gs.world.stats![stat] || 0) + amount;
}

/* -----------------------
   Generic executor
   - Receives meta (title + description). Returns ExecResult and may mutate GameState.
   - ChoiceId is optional; some UIs will pass e.g. 'meditate' or custom ids.
   ----------------------- */

export async function genericExecutor(
  gs: GameState,
  meta: { id?: string; title?: string; description?: string },
  choiceId?: string
): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);

  const title = meta.title || meta.id || "Event";
  const description = meta.description || "";

  let text = `${title}\n\n${description}\n\nOutcome:`;
  const effects: any = {};

  // small randomized bonus: minor treasure 10% chance
  if (Math.random() < 0.10) {
    addItem(gs, "minor_treasure", 1);
    effects.addedItem = "minor_treasure";
    text += " You discovered a minor treasure.";
  }

  // standard choice heuristics
  if (choiceId === "meditate" || choiceId?.toLowerCase().includes("meditat")) {
    const qiGain = Math.max(5, Math.round((gs.player.qi || 0) * 0.02) + 5);
    gs.player.qi = (gs.player.qi || 0) + qiGain;
    effects.qiGain = qiGain;
    text += ` Qi +${qiGain}.`;
  } else if (choiceId === "accept" || choiceId === "accept_task") {
    grantContribution(gs, 5);
    effects.contribution = 5;
    text += " Your contribution to the sect increased.";
  } else if (choiceId === "study") {
    gainSkill(gs, "dao_comprehension", 2);
    effects.daoComprehension = 2;
    text += " Dao comprehension increased.";
  }

  // fallback small positive mood
  if (!Object.keys(effects).length) {
    text += " The day leaves a subtle impression—nothing dramatic.";
  }

  return { text, effects };
}

/* -----------------------
   Act 1 metadata (30 events) — long-form modal descriptions
   Replace or extend any description if you prefer slightly different wording.
   ----------------------- */

const eventsMeta: Array<{ id: string; title: string; description: string }> = [
  // ...event metadata as in your provided file...
];

/* -----------------------
   Programmatic registry
   - Builds exec_act1_e01..exec_act1_e30 as wrappers around genericExecutor
   ----------------------- */

export const EventExecutors: Record<string, (gs: GameState, choiceId?: string) => Promise<ExecResult>> = {};

eventsMeta.forEach((meta, idx) => {
  const execKey = `exec_act1_e${String(idx + 1).padStart(2, "0")}`;
  EventExecutors[execKey] = async (gs: GameState, choiceId?: string) => {
    return genericExecutor(gs, { id: meta.id, title: meta.title, description: meta.description }, choiceId);
  };
});

/* safe runner: call by exec id (e.g., 'exec_act1_e03') */
export async function runEventById(execId: string, gs: GameState, choiceId?: string): Promise<ExecResult> {
  const fn = EventExecutors[execId];
  if (fn) return fn(gs, choiceId);
  // fallback: a minimal generic event
  return genericExecutor(gs, { id: execId, title: execId, description: "An event occurs." }, choiceId);
}

export default EventExecutors;
