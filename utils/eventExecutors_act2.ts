// eventExecutors_act2.ts
// Drop-in executor registry for Act 2 events (exec_act2_e01 .. exec_act2_e30).
// Recommendation implemented: mix of genericExecutor for most events + custom handlers
// for high-impact events (meditation nodes, merchants, duels, archives, cave exploration, sabotage, etc.)

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
    skills?: Record<string, number>;
    statuses?: Record<string, any>;
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

/* -----------------------
   Basic ensure helpers
   ----------------------- */
function ensurePlayer(gs: GameState) {
  gs.player = gs.player || ({} as any);
  gs.player.hp = typeof gs.player.hp === "number" ? gs.player.hp : 1000;
  gs.player.maxHp = typeof gs.player.maxHp === "number" ? gs.player.maxHp : 1000;
  gs.player.qi = typeof gs.player.qi === "number" ? gs.player.qi : 500;
  gs.player.daoHeart = typeof gs.player.daoHeart === "number" ? gs.player.daoHeart : 10;
  gs.player.reputation = typeof gs.player.reputation === "number" ? gs.player.reputation : 0;
  gs.player.wealth = typeof gs.player.wealth === "number" ? gs.player.wealth : 0;
  gs.player.inventory = gs.player.inventory || {};
  gs.player.manuals = gs.player.manuals || [];
  gs.player.relationships = gs.player.relationships || {};
  gs.player.factionRep = gs.player.factionRep || {};
  gs.player.contribution = typeof gs.player.contribution === "number" ? gs.player.contribution : 0;
  gs.player.skills = gs.player.skills || {};
  gs.player.statuses = gs.player.statuses || {};
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
   Small mutators / helpers
   ----------------------- */
function addItem(gs: GameState, itemId: string, qty = 1) {
  ensurePlayer(gs);
  gs.player.inventory![itemId] = (gs.player.inventory![itemId] || 0) + qty;
}

function chanceAddItem(gs: GameState, itemId: string, qty: number, chance: number) {
  if (Math.random() < chance) addItem(gs, itemId, qty);
}

function unlockManual(gs: GameState, manualId: string) {
  ensurePlayer(gs);
  if (!gs.player.manuals!.includes(manualId)) gs.player.manuals!.push(manualId);
}

function gainSkill(gs: GameState, skill: string, amount = 1) {
  ensurePlayer(gs);
  gs.player.skills![skill] = (gs.player.skills![skill] || 0) + amount;
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

function addQuestMarker(gs: GameState, markerId: string) {
  ensureWorld(gs);
  if (!gs.world.questMarkers!.includes(markerId)) gs.world.questMarkers!.push(markerId);
}

function startQuestMarkerAndNote(gs: GameState, questId: string) {
  addQuestMarker(gs, questId);
  // for engine integration: consider enqueue quest system hook here
}

function spendItem(gs: GameState, itemId: string, qty = 1): boolean {
  ensurePlayer(gs);
  const have = gs.player.inventory![itemId] || 0;
  if (have >= qty) {
    gs.player.inventory![itemId] = have - qty;
    if (gs.player.inventory![itemId] === 0) delete gs.player.inventory![itemId];
    return true;
  }
  return false;
}

/* -----------------------
   Domain/Exploration helpers (simplified)
   ----------------------- */
function unlockMapArea(gs: GameState, areaId: string) {
  ensureWorld(gs);
  gs.world.flags![`map_unlocked_${areaId}`] = true;
}

function startExplorationArea(gs: GameState, areaId: string) {
  unlockMapArea(gs, areaId);
  addQuestMarker(gs, `explore_${areaId}`);
}

/* -----------------------
   Generic executor (fallback)
   ----------------------- */
export async function genericExecutor(gs: GameState, meta: { id?: string; title?: string; description?: string }, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);

  const title = meta.title || meta.id || "Event";
  const description = meta.description || "";

  let text = `${title}\n\n${description}\n\nOutcome:`;
  const effects: any = {};

  // small randomized reward behavior
  if (Math.random() < 0.12) {
    addItem(gs, "minor_treasure", 1);
    effects.addedItem = "minor_treasure";
    text += " You found a minor treasure.";
  }

  // simple choice heuristics
  if (choiceId === "meditate" || (choiceId || "").toLowerCase().includes("meditat")) {
    const qiGain = Math.max(6, Math.round((gs.player.qi || 0) * 0.02) + 6);
    gs.player.qi = (gs.player.qi || 0) + qiGain;
    effects.qiGain = qiGain;
    text += ` Qi +${qiGain}.`;
  } else if (choiceId === "study") {
    gainSkill(gs, "dao_comprehension", 2);
    effects.daoComprehension = 2;
    text += " You feel your comprehension deepen.";
  } else {
    text += " Nothing dramatic — the moment passes but leaves its mark.";
  }

  return { text, effects };
}

/* -----------------------
   Custom executors for selected Act 2 events
   (recommendation: these are worth explicit handlers)
   ----------------------- */

/**
 * exec_act2_e01 - The Whispering Grove
 * choices: 'meditate' | 'trace' | 'leave'
 * - meditate: small qi + dao insight, with a rare mini-enlightenment
 * - trace: starts a small quest chain (map/whisper source)
 */
async function meditationNodeExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "The Whispering Grove";
  const desc = "You wander into a grove where the rustling leaves seem to carry ancient whispers. A strange Qi resonance fills the air, making it feel as if the very trees are alive and aware of your presence.";
  if (choiceId === "meditate") {
    // meditation cooldown should be enforced by the caller; we grant modest benefit
    const qiGain = Math.max(10, Math.round((gs.player.qi || 0) * 0.03));
    gs.player.qi = (gs.player.qi || 0) + qiGain;
    gainSkill(gs, "dao_comprehension", 2);
    let text = `${title}\n\n${desc}\n\nYou sit still and let the whispers weave through your mind. Qi +${qiGain}. Dao comprehension +2.`;
    // rare mini-enlightenment
    if (Math.random() < 0.05) {
      gainSkill(gs, "dao_comprehension", 5);
      addItem(gs, "mini_enlightenment_token", 1);
      text += " A spark of insight flares — mini-enlightenment! Extra comprehension and a token.";
      return { text, effects: { qiGain, daoComprehension: 7, miniEnlightenment: true } };
    }
    return { text, effects: { qiGain, daoComprehension: 2 } };
  } else if (choiceId === "trace") {
    startQuestMarkerAndNote(gs, "trace_whisper_source");
    return { text: `${title}\n\n${desc}\n\nYou attempt to trace the source of the whispers. You find a faint trail of Qi — a quest begins.`, effects: { questStarted: "trace_whisper_source" } };
  } else {
    return { text: `${title}\n\n${desc}\n\nYou leave the grove before the voices sink into your bones. Caution preserved.`, effects: {} };
  }
}

/**
 * exec_act2_e02 - Merchant of Thousand Charms
 * choices: 'buy_talisman' | 'sense_curse' | 'walk_away'
 * - buy_talisman: spend spirit stones (attempt), grants item
 * - sense_curse: skill check on 'perception' or 'alchemy' to reveal curse (gain manual or avoid)
 */
  async function merchantAppraisalExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Merchant of Thousand Charms";
  const desc = "In the market of an outlying sect town, a hunched merchant in layered robes lays out trinkets, talismans, and small jade slips. His eyes glint as he recognizes the faint spiritual aura on you.";
  if (choiceId === "buy_talisman") {
    // prefer spending a currency called 'spirit_stones' in inventory, else wealth fallback
    const spent = spendIfHas(gs, "spirit_stones", 5, "wealth", 20);
    addItem(gs, "talisman_warding", 1);
    return { text: `${title}\n\n${desc}\n\nYou purchase a talisman. (${spent ? "spent 5 spirit stones" : "spent 20 wealth"})`, effects: { item: "talisman_warding" } };
  } else if (choiceId === "sense_curse") {
    const perception = gs.player.skills?.perception || 0;
    const chance = Math.min(0.9, 0.2 + perception * 0.05);
    if (Math.random() < chance) {
      // success: detect curse, gain skill or avoid curse
      gainSkill(gs, "alchemy", 2);
      return { text: `${title}\n\n${desc}\n\nYou sense subtle runes — a hidden curse is detected. Your alchemy skill improves as you study its pattern.`, effects: { alchemyGain: 2 } };
    } else {
      // failure: minor backlash
      addStatusSimple(gs, "cursed_mark", 3);
      return { text: `${title}\n\n${desc}\n\nYou misread the talisman and feel a prickling curse linger. Minor backlash applied.`, effects: { backlash: true } };
    }
  } else {
    return { text: `${title}\n\n${desc}\n\nYou walk away — men of bargains like that often carry hidden strings.`, effects: {} };
  }
}

/**
 * exec_act2_e03 - Duel Invitation
 * choices: 'accept' | 'defuse' | 'walk'
 * - accept: trigger duel (simplified here: compare player skill)
 * - defuse: small relationship + or - depending on success
 */
  async function duelExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Duel Invitation";
  const desc = "Your sect rival steps into your path, eyes sharp with hostility. 'I've seen you slacking,' they say. 'Prove your worth, or I'll make sure the elders know you're unfit for advancement.'";
  if (choiceId === "accept") {
    // simplified duel logic: use weapon_handling + qi as proxy
    const playerPower = (gs.player.skills?.weapon_handling || 0) + ((gs.player.qi || 0) / 50) + (gs.player.level || 0) * 2;
    const rivalPower = Math.max(5, Math.round(playerPower * (0.8 + Math.random() * 0.6)));
    const win = playerPower >= rivalPower;
    if (win) {
      gainSkill(gs, "weapon_handling", 3);
      adjustReputation(gs, 3);
      return { text: `${title}\n\n${desc}\n\nYou fought and prevailed. Skill & reputation improved.`, effects: { result: "win" } };
    } else {
      gs.player.hp = Math.max(0, (gs.player.hp || 1000) - 80);
      adjustReputation(gs, -2);
      return { text: `${title}\n\n${desc}\n\nYou were bested and left bruised. Reputation suffers.`, effects: { result: "loss", hpLoss: 80 } };
    }
  } else if (choiceId === "defuse") {
    // rhetorical skill check
    const rhetoric = gs.player.skills?.rhetoric || 0;
    if (Math.random() < 0.3 + rhetoric * 0.05) {
      adjustReputation(gs, 2);
      adjustRelationshipSimple(gs, "rival", 5);
      return { text: `${title}\n\n${desc}\n\nYou calm the rival with words — a small victory of diplomacy.`, effects: { relationship: { rival: 5 } } };
    } else {
      adjustRelationshipSimple(gs, "rival", -3);
      return { text: `${title}\n\n${desc}\n\nYour attempt to reason falls flat; the rival grows colder.`, effects: { relationship: { rival: -3 } } };
    }
  } else {
    // walk away
    adjustReputation(gs, -1);
    return { text: `${title}\n\n${desc}\n\nYou walk away. Your honor is questioned by some but preserved by prudence.`, effects: { reputation: -1 } };
  }
}

/**
 * exec_act2_e04 - Forbidden Archive
 * choices: 'open' | 'leave' | 'hide'
 * - open: unlockManual but risk relationship with librarians/elders
 * - leave: safe
 * - hide: start secret investigation quest
 */
  async function hiddenManualExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Forbidden Archive";
  const desc = "While helping an elder organize manuals, you find a locked lacquered box marked with the seal of the Forbidden Archive. The elder steps away briefly, leaving you alone.";
  if (choiceId === "open") {
    unlockManual(gs, "esoteric_core_flow");
    adjustReputation(gs, -5);
    return { text: `${title}\n\n${desc}\n\nYou opened the box and absorbed its teachings — but the elders will not look kindly on the breach. Manual unlocked, reputation lowered.`, effects: { manual: "esoteric_core_flow", reputationDelta: -5 } };
  } else if (choiceId === "leave") {
    adjustReputation(gs, 1);
    return { text: `${title}\n\n${desc}\n\nYou resist temptation and leave the box untouched. A small mark of virtue registers with the sect.`, effects: { reputationDelta: 1 } };
  } else {
    startQuestMarkerAndNote(gs, "secret_archive_investigation");
    return { text: `${title}\n\n${desc}\n\nYou hide the box and plan to study it in secret—dangerous, but potentially rewarding.`, effects: { questMarker: "secret_archive_investigation" } };
  }
}

/**
 * exec_act2_e05 - Night of Flickering Stars
 * choices: 'meditate' | 'sketch' | 'rest'
 * - meditate: meditate cooldown-enabled (small qi + rare insight)
 * - sketch: gain skill or item
 * - rest: heal
 */
  async function hiddenCaveExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Night of Flickering Stars";
  const desc = "The night sky above the sect becomes unusually vivid. Stars shift subtly, forming shapes like dragons and phoenixes. Senior disciples whisper that such omens precede great changes.";
  if (choiceId === "meditate") {
    const qiGain = Math.max(12, Math.round((gs.player.qi || 0) * 0.03));
    gs.player.qi = (gs.player.qi || 0) + qiGain;
    // small chance of rare boon
    if (Math.random() < 0.06) {
      unlockManual(gs, "star_phase_blessing");
      return { text: `${title}\n\n${desc}\n\nUnder the dancing stars you transcend a little — Qi +${qiGain} and you glean a star-phase blessing manual.`, effects: { qiGain, manual: "star_phase_blessing" } };
    }
    return { text: `${title}\n\n${desc}\n\nYou meditate and let the constellations calm and teach you. Qi +${qiGain}.`, effects: { qiGain } };
  } else if (choiceId === "sketch") {
    gainSkill(gs, "observation", 3);
    addItem(gs, "constellation_sketch", 1);
    return { text: `${title}\n\n${desc}\n\nYou sketch the constellations; study rewards your eye.`, effects: { skillGain: { observation: 3 }, item: "constellation_sketch" } };
  } else {
    // rest: small heal
    const heal = Math.min(gs.player.maxHp! - gs.player.hp!, 40);
    gs.player.hp = Math.min(gs.player.maxHp!, (gs.player.hp || 0) + heal);
    return { text: `${title}\n\n${desc}\n\nYou rest through the night; wounds feel lighter. HP +${heal}.`, effects: { hpGain: heal } };
  }
}

/**
 * exec_act2_e10 - Sabotaged Training Ground
 * choices: 'inspect' | 'report'
 * - inspect: start investigation quest
 * - report: relationships with elders + hint
 */
  async function sabotageInvestigationExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Sabotaged Training Ground";
  const desc = "During practice you stumble on a loose floorboard and nearly trip into a blade rack. It smells like deliberate sabotage — someone wanted an accident to occur.";
  if (choiceId === "inspect") {
    startQuestMarkerAndNote(gs, "investigate_sabotage");
    return { text: `${title}\n\n${desc}\n\nYou kneel and search for clues — a trail begins.`, effects: { questStarted: "investigate_sabotage" } };
  } else {
    adjustReputation(gs, 5);
    adjustFactionRep(gs, "elder_council", 6);
    return { text: `${title}\n\n${desc}\n\nYou report to the elders, earning trust and a promise of protection.`, effects: { reputationDelta: 5 } };
  }
}

/**
 * exec_act2_e19 - Cave Behind the Waterfall
 * choices: 'enter' | 'mark'
 */
  async function caveBehindWaterfallExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Cave Behind the Waterfall";
  const desc = "You discover a narrow cave behind a waterfall in the sect’s back mountain. The air inside is cool and humming with quiet Qi. Stalactites drip like clockwork.";
  if (choiceId === "enter") {
    startExplorationArea(gs, "WaterfallCave");
    // small loot chance
    chanceAddItem(gs, "crystal_shard", 1, 0.18);
    return { text: `${title}\n\n${desc}\n\nYou enter the cave and its hush reveals secrets. You mark the area explored.`, effects: { explored: "WaterfallCave" } };
  } else {
    unlockMapArea(gs, "WaterfallCave");
    addQuestMarker(gs, "waterfall_cave_team");
    return { text: `${title}\n\n${desc}\n\nYou mark the location for a later expedition with a team.`, effects: { marker: "waterfall_cave_team" } };
  }
}

/**
 * exec_act2_e20 - Lost Jade Slip
 * choices: 'pocket' | 'translate'
 */
  async function lostJadeSlipExecutor(gs: GameState, choiceId?: string): Promise<ExecResult> {
  ensurePlayer(gs);
  ensureWorld(gs);
  const title = "Lost Jade Slip";
  const desc = "You stumble upon a jade slip containing cryptic cultivation notes. The characters shift faintly when you try to focus on them.";
  if (choiceId === "pocket") {
    addItem(gs, "jade_slip_cryptic", 1);
    return { text: `${title}\n\n${desc}\n\nYou pocket the jade slip for later study.`, effects: { item: "jade_slip_cryptic" } };
  } else {
    unlockManual(gs, "Jade_Slip_Fragment");
    adjustRelationshipSimple(gs, "teacher_translation", 8);
    return { text: `${title}\n\n${desc}\n\nYou bring it to a teacher for translation — a new fragment is unlocked and you earn favor.`, effects: { manualUnlocked: "Jade_Slip_Fragment" } };
  }
}

/* -----------------------
   Utility helpers used in custom handlers
   ----------------------- */
function spendIfHas(gs: GameState, itemKey: string, costItemQty: number, fallbackWealthKey: string, fallbackAmount: number): boolean {
  // try to spend item (like 'spirit_stones'), otherwise reduce wealth
  ensurePlayer(gs);
  const have = gs.player.inventory![itemKey] || 0;
  if (have >= costItemQty) {
    gs.player.inventory![itemKey] = have - costItemQty;
    if (gs.player.inventory![itemKey] === 0) delete gs.player.inventory![itemKey];
    return true;
  } else {
    gs.player.wealth = (gs.player.wealth || 0) - fallbackAmount;
    return false;
  }
}

function addStatusSimple(gs: GameState, statusId: string, durationTurns: number) {
  ensurePlayer(gs);
  gs.player.statuses![statusId] = { turns: durationTurns, setAt: Date.now() };
}

function adjustRelationshipSimple(gs: GameState, target: string, amount: number) {
  ensurePlayer(gs);
  gs.player.relationships![target] = (gs.player.relationships![target] || 0) + amount;
}

/* -----------------------
   metadata for 30 Act 2 events
   (long-form modal descriptions — replace wording if you prefer)
   ----------------------- */

const eventsMeta: Array<{ id: string; title: string; description: string }> = [
  {
    id: "act2_evt01",
    title: "The Whispering Grove",
    description:
      "You wander into a grove where the rustling leaves seem to carry ancient whispers. At first, you think it’s the wind, but then you recognize fragments of old cultivation mantras. The sound seems to come from nowhere and everywhere at once. Your Dao Heart is unsettled yet drawn to the voices."
  },
  {
    id: "act2_evt02",
    title: "Merchant of Thousand Charms",
    description:
      "In the market of an outlying sect town, a hunched merchant in layered robes lays out trinkets, talismans, and small jade slips. His eyes glint as he recognizes the faint spiritual aura on you. He offers rare charms for protection, but warns that some carry a hidden cost."
  },
  {
    id: "act2_evt03",
    title: "Duel Invitation",
    description:
      "Your sect rival steps into your path, eyes sharp with hostility. 'I've seen you slacking,' they say. 'Prove your worth, or I'll make sure the elders know you're unfit for advancement.' Around you, other disciples gather, sensing potential entertainment and gossip."
  },
  {
    id: "act2_evt04",
    title: "Forbidden Archive",
    description:
      "While helping an elder organize manuals, you find a locked lacquered box marked with the seal of the Forbidden Archive. The elder steps away briefly, leaving you alone. You know that opening it could lead to punishment—or a priceless discovery."
  },
  {
    id: "act2_evt05",
    title: "Night of Flickering Stars",
    description:
      "The night sky above the sect becomes unusually vivid. Stars shift subtly, forming shapes like dragons and phoenixes. Senior disciples whisper that such omens precede great changes. Your body tingles with spiritual energy—perhaps a chance for cultivation insight."
  },
  {
    id: "act2_evt06",
    title: "The Wandering Herb Seller",
    description:
      "A hunched old man with a bamboo basket wanders into the sect, selling rare herbs. His cloudy eyes still glint with knowledge. Some disciples ignore him, but you sense a faint Qi fluctuation from the herbs."
  },
  {
    id: "act2_evt07",
    title: "Sect Courtyard Debate",
    description:
      "Two senior disciples are arguing fiercely about the correct interpretation of a sword manual. The argument has drawn a crowd, and the sect elders have yet to intervene."
  },
  {
    id: "act2_evt08",
    title: "Outer Sect Training Field",
    description:
      "A group of outer sect disciples are struggling with their stances under a strict instructor. They invite you to join their training session to help them improve."
  },
  {
    id: "act2_evt09",
    title: "Forbidden Page Glimmer",
    description:
      "While cleaning the library you discover a torn page from a forbidden manual tucked between mundane scrolls. Its characters pulse faintly with power."
  },
  {
    id: "act2_evt10",
    title: "Sabotaged Training Ground",
    description:
      "During practice you stumble on a loose floorboard and nearly trip into a blade rack. It smells like deliberate sabotage — someone wanted an accident to occur."
  },
  {
    id: "act2_evt11",
    title: "Quiet Mentor's Advice",
    description:
      "A mentor pulls you aside to offer a private correction on your stance. Their words are precise and their attention singular — you leave with a small but valuable adjustment."
  },
  {
    id: "act2_evt12",
    title: "Bridge Duel",
    description:
      "Two disciples claim a narrow bridge for a duel at dawn; the winner earns local renown. It’s a test of balance as much as skill."
  },
  {
    id: "act2_evt13",
    title: "Festival Rehearsal",
    description:
      "Preparations for a small festival are underway. The sect rehearses songs and combat displays to attract visitors. Running orders and timing are tight."
  },
  {
    id: "act2_evt14",
    title: "Herbal Market Bargain",
    description:
      "A merchant offers a suspiciously good deal on spirit herbs. The aroma is intoxicating and possible counterfeit tags show a clever forger at work."
  },
  {
    id: "act2_evt15",
    title: "Strange Lantern",
    description:
      "A lantern flickers in the unused pavilion at night. The light seems restless, and a soft sound like breathing rises from the floorboards."
  },
  {
    id: "act2_evt16",
    title: "Hostel Argument",
    description:
      "A heated argument in the hostel about who should take extra chores threatens to spill into fists. A calm word could end it, or a sharp retort could inflame tempers."
  },
  {
    id: "act2_evt17",
    title: "Old Blacksmith's Secret",
    description:
      "The old blacksmith shows you a hidden technique for tempering blades. The method demands patience and small precisions you did not think mattered — but they do."
  },
  {
    id: "act2_evt18",
    title: "Dawn Sword Practice",
    description:
      "At dawn the early squad practices sword forms in synchronized cadence. Watching and copying for an hour embeds rhythm into your limbs."
  },
  {
    id: "act2_evt19",
    title: "Cave Behind the Waterfall",
    description:
      "You discover a narrow cave behind a waterfall in the sect’s back mountain. The air inside is cool and humming with quiet Qi. Stalactites drip like clockwork."
  },
  {
    id: "act2_evt20",
    title: "Lost Jade Slip",
    description:
      "You stumble upon a jade slip containing cryptic cultivation notes. The characters shift faintly when you try to focus on them."
  },
  {
    id: "act2_evt21",
    title: "Nighttime Lantern Light",
    description:
      "At night, you see a solitary lantern swaying in the wind atop an unused pavilion. The light seems to call you specifically—an invitation or a trap."
  },
  {
    id: "act2_evt22",
    title: "Hidden Sect Path",
    description:
      "A concealed stairway leads deeper into the mountains, rumored to be used by elders for secret passage. The stones are worn to a shine by careful feet."
  },
  {
    id: "act2_evt23",
    title: "Ancient Relic in Storage Room",
    description:
      "While cleaning storage, you find a dust-covered relic radiating faint Qi. The relic's surface is etched with characters you do not entirely understand."
  },
  {
    id: "act2_evt24",
    title: "Whisper in the Wind",
    description:
      "During meditation, a voice whispers cultivation secrets—but only if you can focus. The words are unstable, like reflections in water."
  },
  {
    id: "act2_evt25",
    title: "Mentor Assigns Qi Circulation Drill",
    description:
      "Your mentor asks you to repeat a harsh Qi circulation exercise for hours. The breathing is precise and the pain is honest."
  },
  {
    id: "act2_evt26",
    title: "Martial Form Perfection",
    description:
      "Your mentor critiques your martial form, guiding you toward flawless execution through slow repetition and acute correction."
  },
  {
    id: "act2_evt27",
    title: "Mentor's Errand",
    description:
      "Sent to deliver a message to another elder, you overhear important sect news about shifting allegiances. The information could be useful or dangerous."
  },
  {
    id: "act2_evt28",
    title: "Mentor Gift – Minor Artifact",
    description:
      "Impressed by your diligence, your mentor gifts you a basic spiritual artifact—simple, but containing a seed of refinement."
  },
  {
    id: "act2_evt29",
    title: "Mentor's Insight Lecture",
    description:
      "Your mentor recounts a personal experience of failure and recovery, illustrating resilience and the right attitude toward setbacks."
  },
  {
    id: "act2_evt30",
    title: "Mentor Introduces You to an Elder",
    description:
      "You are presented to an influential elder for future opportunities. The elder's gaze is appraising; this moment could unlock future schooling or obligations."
  }
];

/* -----------------------
   Build registry: custom executors where implemented, otherwise genericExecutor
   ----------------------- */

// Custom handler mapping for high-impact/gameplay events (matches act2Events.ts)
export const EventExecutors: Record<string, (gs: GameState, choiceId?: string) => Promise<ExecResult>> = {
  exec_act2_e01: meditationNodeExecutor,
  exec_act2_e02: merchantAppraisalExecutor,
  exec_act2_e03: duelExecutor,
  exec_act2_e04: hiddenManualExecutor,
  exec_act2_e05: hiddenCaveExecutor,
  exec_act2_e10: sabotageInvestigationExecutor,
  exec_act2_e19: caveBehindWaterfallExecutor,
  exec_act2_e20: lostJadeSlipExecutor
};

// fill in the rest with genericExecutor wrappers
eventsMeta.forEach((meta, idx) => {
  const key = `exec_act2_e${String(idx + 1).padStart(2, "0")}`;
  if (!EventExecutors[key]) {
    EventExecutors[key] = async (gs: GameState, choiceId?: string) => genericExecutor(gs, { id: meta.id, title: meta.title, description: meta.description }, choiceId);
  }
});

/* safe runner: call by exec id (e.g., 'exec_act2_e05') */
export async function runEventById(execId: string, gs: GameState, choiceId?: string): Promise<ExecResult> {
  const fn = EventExecutors[execId];
  if (fn) return fn(gs, choiceId);
  return genericExecutor(gs, { id: execId, title: execId, description: "An event occurs." }, choiceId);
}

export default EventExecutors;
