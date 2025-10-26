"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTraining = getTraining;
exports.ensurePlayerTrainingFields = ensurePlayerTrainingFields;
exports.hasRequiredItems = hasRequiredItems;
exports.consumeItems = consumeItems;
exports.computeSuccessModifier = computeSuccessModifier;
exports.startTraining = startTraining;
exports.tickTraining = tickTraining;
exports.resolveTraining = resolveTraining;
const trainings_json_1 = __importDefault(require("../../data/trainings.json"));
const bloodlineModifiers_json_1 = __importDefault(require("../../data/bloodlineModifiers.json"));
const trainingsById = {};
const bloodlineModifiers = bloodlineModifiers_json_1.default;
for (const t of trainings_json_1.default)
    trainingsById[t.id] = t;
function getTraining(id) {
    return trainingsById[id];
}
function ensurePlayerTrainingFields(player) {
    if (!player.cooldowns)
        player.cooldowns = {};
    if (!player.cooldowns.training)
        player.cooldowns.training = {};
    if (!player.trainingQueue)
        player.trainingQueue = null;
}
function hasRequiredItems(player, items = []) {
    if (!items || items.length === 0)
        return true;
    if (!player.inventory)
        return false;
    for (const it of items) {
        if (!player.inventory[it] || player.inventory[it] <= 0)
            return false;
    }
    return true;
}
function consumeItems(player, items = []) {
    if (!items)
        return;
    for (const it of items) {
        if (!player.inventory)
            continue;
        if (player.inventory[it])
            player.inventory[it] = Math.max(0, player.inventory[it] - 1);
    }
}
function computeSuccessModifier(player, training) {
    // multiplicative modifiers from bloodline, physique, mentor, items
    let mul = 1.0;
    if (player.bloodline && bloodlineModifiers[String(player.bloodline)]) {
        const map = bloodlineModifiers[String(player.bloodline)];
        if (map && map[training.id])
            mul *= 1 + (map[training.id] || 0);
    }
    // simple physique stub
    if (player.physique === 'turtle_ancient' && training.id === 'dao_heart_tempering')
        mul *= 1.08;
    // mentor bonus example
    if (player.mentor && player.mentor.bonusTrainingPct)
        mul *= 1 + player.mentor.bonusTrainingPct;
    return mul;
}
function startTraining(player, trainingId, nowTick) {
    ensurePlayerTrainingFields(player);
    const t = getTraining(trainingId);
    if (!t)
        return { error: 'not_found' };
    if ((player.realm || 0) < t.unlock_realm)
        return { error: 'locked' };
    if ((player.cooldowns.training[trainingId] || 0) > nowTick)
        return { error: 'cooldown' };
    if (!hasRequiredItems(player, t.cost?.items || []))
        return { error: 'missing_items' };
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
function tickTraining(player, nowTick) {
    ensurePlayerTrainingFields(player);
    const q = player.trainingQueue;
    if (!q)
        return;
    if (q.endTick > nowTick)
        return; // not finished
    resolveTraining(player, nowTick);
}
function resolveTraining(player, _nowTick) {
    ensurePlayerTrainingFields(player);
    const q = player.trainingQueue;
    if (!q)
        return { error: 'no_active' };
    const t = getTraining(q.id);
    if (!t)
        return { error: 'not_found' };
    const mod = computeSuccessModifier(player, t);
    const successChance = Math.min(1, (t.success_base || 0) * mod);
    const success = Math.random() <= successChance;
    if (success) {
        // apply xp gains
        if (!player.xp)
            player.xp = {};
        for (const k of Object.keys(t.xp_gain || {})) {
            player.xp[k] = (player.xp[k] || 0) + (t.xp_gain[k] || 0);
        }
        applyRewards(player, t.rewards);
        player.trainingQueue = null;
        fireHook(t.hooks?.onComplete, player, q.id);
        emitTelemetry(`training.${q.id}.complete`, { playerId: player.id });
        return { ok: true, success: true };
    }
    else {
        // failure, possible backlash
        const backlashRoll = Math.random() <= (t.risk?.backlash_chance || 0);
        if (backlashRoll)
            applyBacklash(player, t.risk?.backlash || {});
        player.trainingQueue = null;
        fireHook(t.hooks?.onFail, player, q.id);
        emitTelemetry(`training.${q.id}.fail`, { playerId: player.id, backlash: backlashRoll });
        return { ok: true, success: false, backlash: backlashRoll };
    }
}
function applyRewards(player, rewards) {
    if (!rewards)
        return;
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
function applyBacklash(player, backlash) {
    if (!backlash)
        return;
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
function fireHook(hookName, player, trainingId) {
    if (!hookName)
        return;
    const stub = hookStubs[hookName];
    if (stub)
        stub(player, trainingId);
}
const hookStubs = {
    startMeditationAmbience: (_p) => { },
    grantInsightStack: (p) => { p.insight = (p.insight || 0) + 1; },
    minorMentalShock: (p) => { p.mental_hp = Math.max(0, (p.mental_hp || 100) - 5); },
    logInsightTrainingStart: (_p) => { },
    applyBreakthroughBonusTemp: (p) => { p.breakthroughBonus = (p.breakthroughBonus || 0) + 3; },
    applyConfusionDebuff: (p) => { p.confused = true; },
    sealRoomForConfrontation: (p) => { p.roomSealed = true; },
    purifyDaoHeart: (p) => { p.dao_heart_corruption = Math.max(0, (p.dao_heart_corruption || 0) - 15); },
    spawnHeartDemonEvent: (p) => { p.spawnedHeartDemon = true; },
    reserveAlchemyTools: (_p) => { },
    increaseAlchemySkill: (p) => { p.skills = p.skills || {}; p.skills.alchemy = (p.skills.alchemy || 0) + 1; },
    consumeMaterialsWithFailure: (_p) => { },
    prepareArrayGrid: (_p) => { },
    increaseFormationRank: (p) => { p.formation = p.formation || {}; p.formation.level = (p.formation.level || 0) + 1; },
    disruptFormation: (_p) => { },
    drawBeastEncounter: (_p) => { },
    createBondWithBeast: (p) => { p.bondPoints = (p.bondPoints || 0) + 2; },
    beastFleesOrAttacks: (_p) => { },
    heatForge: (_p) => { },
    attemptForgeArtifact: (_p) => { },
    forgeExplosionEvent: (p) => { p.forget = true; },
    gatherTemperingArtifacts: (_p) => { },
    applyDaoHeartResilience: (p) => { p.dao_heart_resilience = (p.dao_heart_resilience || 0) + 10; },
    severeDaoHeartBacklash: (p) => { p.dao_heart = Math.max(0, (p.dao_heart || 0) - 10); },
    callCleansingMonk: (_p) => { },
    applyKarmaReduction: (p) => { p.karma = Math.max(0, (p.karma || 0) - 10); },
    minorKarmicRebound: (_p) => { },
    callHeavenlyMusic: (_p) => { },
    grantHeavenlyAffinity: (p) => { p.heavenlyAffinity = (p.heavenlyAffinity || 0) + 1; },
    triggerHeavenlyBacklashEvent: (_p) => { }
};
function emitTelemetry(_, __) { }
exports.default = {
    startTraining,
    tickTraining,
    resolveTraining,
    ensurePlayerTrainingFields,
    computeSuccessModifier,
    getTraining
};
