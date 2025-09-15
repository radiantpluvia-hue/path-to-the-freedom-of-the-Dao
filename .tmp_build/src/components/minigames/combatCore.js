"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDamage = calculateDamage;
exports.resolveRound = resolveRound;
exports.applyCombatBuffsWithMeta = applyCombatBuffsWithMeta;
exports.applyCombatBuffs = applyCombatBuffs;
exports.defaultCombatant = defaultCombatant;
const balance_1 = require("../../config/balance");
const items_1 = require("./items");
const registry_1 = require("../../data/registry");
// Pure combat helpers
function calculateDamage(attacker, defender, action) {
    const defendBonus = defender.isDefending ? Math.floor(defender.defense * 0.5) : 0;
    const base = Math.max(1, attacker.attack - (defender.defense + defendBonus));
    const scale = (0, balance_1.getPowerScale)();
    let dmg = base;
    if (action === 'special') {
        dmg = base + Math.max(1, Math.floor(attacker.attack * 0.5));
    }
    return Math.max(1, Math.floor(dmg * scale));
}
function resolveRound(player, rival, playerAction, rivalAction) {
    const p = { ...player };
    const r = { ...rival };
    p.isDefending = playerAction === 'defend';
    r.isDefending = rivalAction === 'defend';
    const logs = [];
    const firstIsPlayer = p.speed >= r.speed;
    const applyAction = (actor, target, action, actorName, targetName) => {
        if (actor.hp <= 0)
            return;
        if (action === 'defend') {
            logs.push(`${actorName} defends, reducing incoming damage this round.`);
            return;
        }
        const dmg = calculateDamage(actor, target, action);
        target.hp = Math.max(0, target.hp - dmg);
        logs.push(`${actorName} uses ${action} on ${targetName} for ${dmg} damage.`);
    };
    if (firstIsPlayer) {
        applyAction(p, r, playerAction, p.name, r.name);
        applyAction(r, p, rivalAction, r.name, p.name);
    }
    else {
        applyAction(r, p, rivalAction, r.name, p.name);
        applyAction(p, r, playerAction, p.name, r.name);
    }
    if (p.specialCooldown && p.specialCooldown > 0)
        p.specialCooldown = Math.max(0, p.specialCooldown - 1);
    if (r.specialCooldown && r.specialCooldown > 0)
        r.specialCooldown = Math.max(0, r.specialCooldown - 1);
    return { player: p, rival: r, logs };
}
function applyCombatBuffsWithMeta(c) {
    const base = { ...c };
    const contributions = {};
    (base.passiveIds || []).forEach(pid => {
        const pass = (0, registry_1.getPassiveById)(pid);
        if (!pass)
            return;
        contributions[pid] = {
            atk: pass.atk || 0,
            def: pass.def || 0,
            hp: pass.hp || 0,
            atkPct: pass.atkPct || 0,
            defPct: pass.defPct || 0,
            speedPct: pass.speedPct || 0,
            effects: pass.specialEffects || []
        };
    });
    const passiveDelta = { effects: [] };
    Object.keys(contributions).forEach(pid => {
        const p = contributions[pid];
        passiveDelta.attack = (passiveDelta.attack || 0) + (p.atk || 0);
        passiveDelta.defense = (passiveDelta.defense || 0) + (p.def || 0);
        passiveDelta.maxHp = (passiveDelta.maxHp || 0) + (p.hp || 0);
        if (p.atkPct)
            passiveDelta.atkPct = (passiveDelta.atkPct || 0) + p.atkPct;
        if (p.defPct)
            passiveDelta.defPct = (passiveDelta.defPct || 0) + p.defPct;
        if (p.speedPct)
            passiveDelta.speedPct = (passiveDelta.speedPct || 0) + p.speedPct;
        if (p.effects && p.effects.length)
            passiveDelta.effects = (passiveDelta.effects || []).concat(p.effects || []);
    });
    const temp = { ...base };
    if (temp.equipment) {
        Object.values(temp.equipment).forEach(itemId => {
            if (!itemId)
                return;
            const it = (0, items_1.getItemById)(itemId);
            if (!it)
                return;
            temp.attack = temp.attack + (it.atk || 0);
            temp.defense = temp.defense + (it.def || 0);
            temp.maxHp = temp.maxHp + (it.hp || 0);
            temp.hp = Math.min(temp.hp + (it.hp || 0), temp.maxHp);
            temp.qi = Math.max(0, (temp.qi || 0) + (it.qiMax || 0));
            temp.ap = Math.max(0, (temp.ap || 0) + (it.apBonus || 0));
            (it.passiveIds || []).forEach(itPid => { if (!temp.passiveIds)
                temp.passiveIds = []; if (!temp.passiveIds.includes(itPid))
                temp.passiveIds.push(itPid); });
        });
    }
    if (temp.activeFormationId) {
        const form = (0, registry_1.getFormationById)(temp.activeFormationId);
        if (form) {
            if (!form.disablesPassives) {
                temp.attack = temp.attack + (passiveDelta.attack || 0);
                temp.defense = temp.defense + (passiveDelta.defense || 0);
                if (passiveDelta.maxHp) {
                    temp.maxHp = temp.maxHp + (passiveDelta.maxHp || 0);
                    temp.hp = Math.min(temp.hp + (passiveDelta.maxHp || 0), temp.maxHp);
                }
                if (passiveDelta.atkPct)
                    temp.attack = Math.floor(temp.attack * (1 + passiveDelta.atkPct / 100));
                if (passiveDelta.defPct)
                    temp.defense = Math.floor(temp.defense * (1 + passiveDelta.defPct / 100));
                if (passiveDelta.speedPct)
                    temp.speed = Math.floor((temp.speed || 0) * (1 + passiveDelta.speedPct / 100));
                if (passiveDelta.effects && passiveDelta.effects.length)
                    temp.appliedPassiveEffects = (temp.appliedPassiveEffects || []).concat(passiveDelta.effects);
            }
            temp.attack = Math.floor((temp.attack || 0) * (form.atkMult || 1));
            temp.defense = Math.floor((temp.defense || 0) * (form.defMult || 1));
            temp.speed = Math.floor((temp.speed || 0) * (form.speedMult || 1));
        }
    }
    else {
        temp.attack = temp.attack + (passiveDelta.attack || 0);
        temp.defense = temp.defense + (passiveDelta.defense || 0);
        if (passiveDelta.maxHp) {
            temp.maxHp = temp.maxHp + (passiveDelta.maxHp || 0);
            temp.hp = Math.min(temp.hp + (passiveDelta.maxHp || 0), temp.maxHp);
        }
        if (passiveDelta.atkPct)
            temp.attack = Math.floor(temp.attack * (1 + passiveDelta.atkPct / 100));
        if (passiveDelta.defPct)
            temp.defense = Math.floor(temp.defense * (1 + passiveDelta.defPct / 100));
        if (passiveDelta.speedPct)
            temp.speed = Math.floor((temp.speed || 0) * (1 + passiveDelta.speedPct / 100));
        if (passiveDelta.effects && passiveDelta.effects.length)
            temp.appliedPassiveEffects = (temp.appliedPassiveEffects || []).concat(passiveDelta.effects);
    }
    return { combatant: temp, passiveContributions: contributions };
}
function applyCombatBuffs(c) {
    return applyCombatBuffsWithMeta(c).combatant;
}
function defaultCombatant(id, name, difficulty = 'medium') {
    switch (difficulty) {
        case 'easy':
            return { id, name, maxHp: 300, hp: 300, attack: 60, defense: 20, speed: 25, specialCooldown: 0 };
        case 'hard':
            return { id, name, maxHp: 500, hp: 500, attack: 120, defense: 40, speed: 40, specialCooldown: 0 };
        case 'medium':
        default:
            return { id, name, maxHp: 400, hp: 400, attack: 90, defense: 30, speed: 35, specialCooldown: 0, equippedSkills: [], ap: 4, qi: 40, equipment: {}, passiveIds: [], activeFormationId: null, skillCooldowns: {} };
    }
}
