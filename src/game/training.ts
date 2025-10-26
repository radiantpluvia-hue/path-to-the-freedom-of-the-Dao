import trainingsData from '../../data/trainings.json';
import rawBloodlineModifiers from '../../data/bloodlineModifiers.json';

type Player = any; // keep flexible to integrate with project's player shape

const trainingsById: Record<string, any> = {};
const bloodlineModifiers: Record<string, Record<string, number>> = rawBloodlineModifiers as any;
for (const t of trainingsData as any[]) trainingsById[t.id] = t;

export function getTraining(id: string) {
  return trainingsById[id];
}

export function ensurePlayerTrainingFields(player: Player) {
  if (!player.cooldowns) player.cooldowns = {};
  if (!player.cooldowns.training) player.cooldowns.training = {};
  if (!player.trainingQueue) player.trainingQueue = null;
}

export function hasRequiredItems(player: Player, items: string[] = []) {
  if (!items || items.length === 0) return true;
  if (!player.inventory) return false;
  for (const it of items) {
    if (!player.inventory[it] || player.inventory[it] <= 0) return false;
  }
  return true;
}

export function consumeItems(player: Player, items: string[] = []) {
  if (!items) return;
  for (const it of items) {
    if (!player.inventory) continue;
    if (player.inventory[it]) player.inventory[it] = Math.max(0, player.inventory[it] - 1);
  }
}

export function computeSuccessModifier(player: Player, training: any) {
  // multiplicative modifiers from bloodline, physique, mentor, items
  let mul = 1.0;
  if (player.bloodline && bloodlineModifiers[String(player.bloodline)]) {
    const map = bloodlineModifiers[String(player.bloodline)];
    if (map && map[training.id]) mul *= 1 + (map[training.id] || 0);
  }
  // simple physique stub
  if (player.physique === 'turtle_ancient' && training.id === 'dao_heart_tempering') mul *= 1.08;
  // mentor bonus example
  if (player.mentor && player.mentor.bonusTrainingPct) mul *= 1 + player.mentor.bonusTrainingPct;
  return mul;
}

export function startTraining(player: Player, trainingId: string, nowTick: number) {
  ensurePlayerTrainingFields(player);
  const t = getTraining(trainingId);
  if (!t) return { error: 'not_found' };
  if ((player.realm || 0) < t.unlock_realm) return { error: 'locked' };
  if ((player.cooldowns.training[trainingId] || 0) > nowTick) return { error: 'cooldown' };
  if (!hasRequiredItems(player, t.cost?.items || [])) return { error: 'missing_items' };
  // Deduct costs atomically (simple implementation)
  player.stamina = Math.max(0, (player.stamina || 0) - (t.cost?.stamina || 0));
  player.qi = Math.max(0, (player.qi || 0) - (t.cost?.qi || 0));
  consumeItems(player, t.cost?.items || []);
  player.trainingQueue = { id: trainingId, startedAtTick: nowTick, endTick: nowTick + (t.time_ticks || 0) };
  player.cooldowns.training[trainingId] = nowTick + (t.cooldown_ticks || 0);
  fireHook(t.hooks?.onStart, player, trainingId);
  emitTelemetry(`training.${trainingId}.start`, { playerId: player.id });
  return { ok: true };
}

export function tickTraining(player: Player, nowTick: number) {
  ensurePlayerTrainingFields(player);
  const q = player.trainingQueue;
  if (!q) return;
  if (q.endTick > nowTick) return; // not finished
  resolveTraining(player, nowTick);
}

export function resolveTraining(player: Player, _nowTick: number) {
  ensurePlayerTrainingFields(player);
  const q = player.trainingQueue;
  if (!q) return { error: 'no_active' };
  const t = getTraining(q.id);
  if (!t) return { error: 'not_found' };
  const mod = computeSuccessModifier(player, t);
  const successChance = Math.min(1, (t.success_base || 0) * mod);
  const success = Math.random() <= successChance;
  if (success) {
    // apply xp gains
    if (!player.xp) player.xp = {};
    for (const k of Object.keys(t.xp_gain || {})) {
      player.xp[k] = (player.xp[k] || 0) + (t.xp_gain[k] || 0);
    }
    applyRewards(player, t.rewards);
    player.trainingQueue = null;
    fireHook(t.hooks?.onComplete, player, q.id);
    emitTelemetry(`training.${q.id}.complete`, { playerId: player.id });
    return { ok: true, success: true };
  } else {
    // failure, possible backlash
    const backlashRoll = Math.random() <= (t.risk?.backlash_chance || 0);
    if (backlashRoll) applyBacklash(player, t.risk?.backlash || {});
    player.trainingQueue = null;
    fireHook(t.hooks?.onFail, player, q.id);
    emitTelemetry(`training.${q.id}.fail`, { playerId: player.id, backlash: backlashRoll });
    return { ok: true, success: false, backlash: backlashRoll };
  }
}

function applyRewards(player: Player, rewards: any) {
  if (!rewards) return;
  // simple deterministic reward application for common keys
  if (rewards.insight_stack) {
    player.insight = (player.insight || 0) + rewards.insight_stack;
  }
  if (rewards.alchemy_skill_increase) {
    player.skills = player.skills || {};
    player.skills.alchemy = (player.skills.alchemy || 0) + rewards.alchemy_skill_increase;
  }
  if (rewards.formation_level_progress) {
    player.formation = player.formation || {};
    player.formation.level = (player.formation.level || 0) + rewards.formation_level_progress;
  }
}

function applyBacklash(player: Player, backlash: any) {
  if (!backlash) return;
  if (backlash.mental_hp_pct) {
    player.mental_hp = Math.max(0, (player.mental_hp || 100) - Math.round((backlash.mental_hp_pct || 0) * (player.max_mental_hp || 100)));
  }
  if (backlash.qi_loss_pct) {
    player.qi = Math.max(0, (player.qi || 0) - Math.round((backlash.qi_loss_pct || 0) * (player.max_qi || 100)));
  }
  if (backlash.dao_heart_damage) {
    player.dao_heart = Math.max(0, (player.dao_heart || 0) - backlash.dao_heart_damage);
  }
  if (backlash.corruption_gain) {
    player.dao_heart_corruption = (player.dao_heart_corruption || 0) + backlash.corruption_gain;
  }
}

function fireHook(hookName: string | undefined, player: Player, trainingId?: string) {
  if (!hookName) return;
  const stub = hookStubs[hookName];
  if (stub) stub(player, trainingId);
}

const hookStubs: Record<string, (player: any, trainingId?: string) => void> = {
  startMeditationAmbience: (_p) => { /* no-op: could play music */ },
  grantInsightStack: (p) => { p.insight = (p.insight || 0) + 1; },
  minorMentalShock: (p) => { p.mental_hp = Math.max(0, (p.mental_hp || 100) - 5); },
  logInsightTrainingStart: (_p) => { /* console.log stub */ },
  applyBreakthroughBonusTemp: (p) => { p.breakthroughBonus = (p.breakthroughBonus || 0) + 3; },
  applyConfusionDebuff: (p) => { p.confused = true; },
  sealRoomForConfrontation: (p) => { p.roomSealed = true; },
  purifyDaoHeart: (p) => { p.dao_heart_corruption = Math.max(0, (p.dao_heart_corruption || 0) - 15); },
  spawnHeartDemonEvent: (p) => { p.spawnedHeartDemon = true; },
  reserveAlchemyTools: (_p) => { /* noop */ },
  increaseAlchemySkill: (p) => { p.skills = p.skills || {}; p.skills.alchemy = (p.skills.alchemy || 0) + 1; },
  consumeMaterialsWithFailure: (_p) => { /* noop */ },
  prepareArrayGrid: (_p) => { /* noop */ },
  increaseFormationRank: (p) => { p.formation = p.formation || {}; p.formation.level = (p.formation.level || 0) + 1; },
  disruptFormation: (_p) => { /* noop */ },
  drawBeastEncounter: (_p) => { /* noop */ },
  createBondWithBeast: (p) => { p.bondPoints = (p.bondPoints || 0) + 2; },
  beastFleesOrAttacks: (_p) => { /* noop */ },
  heatForge: (_p) => { /* noop */ },
  attemptForgeArtifact: (_p) => { /* noop */ },
  forgeExplosionEvent: (p) => { p.forget = true; },
  gatherTemperingArtifacts: (_p) => { /* noop */ },
  applyDaoHeartResilience: (p) => { p.dao_heart_resilience = (p.dao_heart_resilience || 0) + 10; },
  severeDaoHeartBacklash: (p) => { p.dao_heart = Math.max(0, (p.dao_heart || 0) - 10); },
  callCleansingMonk: (_p) => { /* noop */ },
  applyKarmaReduction: (p) => { p.karma = Math.max(0, (p.karma || 0) - 10); },
  minorKarmicRebound: (_p) => { /* noop */ },
  callHeavenlyMusic: (_p) => { /* noop */ },
  grantHeavenlyAffinity: (p) => { p.heavenlyAffinity = (p.heavenlyAffinity || 0) + 1; },
  triggerHeavenlyBacklashEvent: (_p) => { /* noop */ }
};

function emitTelemetry(_: string, __: any) { /* telemetry noop */ }

export default {
  startTraining,
  tickTraining,
  resolveTraining,
  ensurePlayerTrainingFields,
  computeSuccessModifier,
  getTraining
};
