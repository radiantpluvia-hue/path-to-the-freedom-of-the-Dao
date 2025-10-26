"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuffSystem = void 0;
const powerScale_1 = __importDefault(require("../utils/powerScale"));
class BuffSystem {
    createBuff(sourceItem, name, effects, duration, durationType = 'ticks') {
        return {
            id: `${sourceItem.itemId}_${Date.now()}`,
            source: sourceItem.source || 'item',
            sourceId: sourceItem.itemId,
            name: sourceItem.name || name,
            description: sourceItem.description || `Provides a temporary effect.`,
            duration,
            initialDuration: duration,
            durationType,
            effects,
            appliedEffects: {}, // Initialize appliedEffects
            specialEffectId: sourceItem.uniqueProperties?.specialEffectId,
            appliedAt: 0, // This would be set by the game store
            appliedTick: 0,
            stackable: !!sourceItem.stackable,
            currentStacks: 1,
            isPermanent: duration < 0,
            category: 'stat',
        };
    }
    applyBuff(player, buff) {
        const newPlayer = { ...player };
        const newBuff = { ...buff }; // Create a mutable copy of the buff
        const computePerStackDelta = (p, b) => {
            const deltas = {};
            if (!b.effects?.stats)
                return deltas;
            let scale = 1;
            try {
                scale = (0, powerScale_1.default)(p, p?.world || undefined).buffScale || 1;
            }
            catch {
                scale = 1;
            }
            for (const [stat, value] of Object.entries(b.effects.stats)) {
                let bonus = 0;
                if (typeof value === 'number') {
                    bonus = value * scale;
                }
                else if (typeof value === 'object' && value.percent) {
                    const baseStat = p.baseStats[stat] || 0;
                    bonus = Math.floor(baseStat * value.percent * scale);
                }
                if (bonus !== 0)
                    deltas[stat] = bonus;
            }
            return deltas;
        };
        // If this buff is stackable and there is an existing instance from the same source, merge as a stack
        const existingIndex = (newPlayer.activeBuffs || []).findIndex(b => b.sourceId === newBuff.sourceId && b.name === (newBuff.name || b.name));
        if (newBuff.stackable && existingIndex >= 0) {
            const existing = { ...newPlayer.activeBuffs[existingIndex] };
            const maxStacks = existing.maxStacks ?? newBuff.maxStacks ?? 99;
            if ((existing.currentStacks ?? 1) < maxStacks) {
                // Increment stack and apply an additional delta
                const perStack = computePerStackDelta(newPlayer, existing);
                newPlayer.stats = { ...newPlayer.stats };
                for (const [stat, delta] of Object.entries(perStack)) {
                    newPlayer.stats[stat] = (newPlayer.stats[stat] || 0) + delta;
                }
                existing.currentStacks = (existing.currentStacks ?? 1) + 1;
                existing.appliedEffects = existing.appliedEffects || {};
                existing.appliedEffects.stats = {
                    ...(existing.appliedEffects.stats || {}),
                };
                for (const [stat, delta] of Object.entries(perStack)) {
                    existing.appliedEffects.stats[stat] = ((existing.appliedEffects.stats[stat] || 0) + delta);
                }
                const updatedBuffs = [...(newPlayer.activeBuffs || [])];
                updatedBuffs[existingIndex] = existing;
                newPlayer.activeBuffs = updatedBuffs;
            }
            return newPlayer;
        }
        // Otherwise, apply as a new buff instance
        newPlayer.activeBuffs = [...(newPlayer.activeBuffs || []), newBuff];
        if (newBuff.effects?.stats) {
            newPlayer.stats = { ...newPlayer.stats };
            const ae = { ...(newBuff.appliedEffects || {}) };
            ae.stats = ae.stats || {};
            const perStack = computePerStackDelta(newPlayer, newBuff);
            for (const [stat, delta] of Object.entries(perStack)) {
                newPlayer.stats[stat] = (newPlayer.stats[stat] || 0) + delta;
                ae.stats[stat] = delta; // record per-stack delta
            }
            newBuff.appliedEffects = ae;
        }
        return newPlayer;
    }
    revertBuffs(player, buffsToRevert) {
        if (buffsToRevert.length === 0) {
            return player;
        }
        const newPlayer = { ...player };
        newPlayer.stats = { ...newPlayer.stats };
        for (const buff of buffsToRevert) {
            console.log(`Reverting buff: ${buff.name}`);
            // Revert stat changes
            if (buff.appliedEffects?.stats) {
                for (const [stat, value] of Object.entries(buff.appliedEffects.stats)) {
                    newPlayer.stats[stat] = Math.max(1, (newPlayer.stats[stat] || 0) - value);
                }
            }
        }
        return newPlayer;
    }
    addStack(player, buff) {
        if (!buff.stackable)
            return player;
        const newPlayer = { ...player };
        const idx = (newPlayer.activeBuffs || []).findIndex(b => b === buff || b.id === buff.id);
        if (idx < 0)
            return player;
        const target = { ...newPlayer.activeBuffs[idx] };
        const maxStacks = target.maxStacks ?? 99;
        if ((target.currentStacks ?? 1) >= maxStacks)
            return player;
        // compute per-stack delta and apply
        const deltas = {};
        if (target.effects?.stats) {
            for (const [stat, value] of Object.entries(target.effects.stats)) {
                let bonus = 0;
                if (typeof value === 'number')
                    bonus = value;
                else if (typeof value === 'object' && value.percent) {
                    const base = newPlayer.baseStats[stat] || 0;
                    bonus = Math.floor(base * value.percent);
                }
                if (bonus !== 0)
                    deltas[stat] = bonus;
            }
        }
        newPlayer.stats = { ...newPlayer.stats };
        for (const [s, d] of Object.entries(deltas)) {
            newPlayer.stats[s] = (newPlayer.stats[s] || 0) + d;
        }
        target.currentStacks = (target.currentStacks ?? 1) + 1;
        target.appliedEffects = target.appliedEffects || {};
        target.appliedEffects.stats = { ...(target.appliedEffects.stats || {}) };
        for (const [s, d] of Object.entries(deltas)) {
            target.appliedEffects.stats[s] = ((target.appliedEffects.stats[s] || 0) + d);
        }
        const arr = [...(newPlayer.activeBuffs || [])];
        arr[idx] = target;
        newPlayer.activeBuffs = arr;
        return newPlayer;
    }
    removeStack(player, buff) {
        if (!buff.stackable)
            return player;
        const newPlayer = { ...player };
        const idx = (newPlayer.activeBuffs || []).findIndex(b => b === buff || b.id === buff.id);
        if (idx < 0)
            return player;
        const target = { ...newPlayer.activeBuffs[idx] };
        const current = target.currentStacks ?? 1;
        if (current <= 1) {
            // removing last stack => fully revert and remove
            const reverted = this.revertBuffs(newPlayer, [target]);
            const arr = [...(reverted.activeBuffs || [])];
            arr.splice(idx, 1);
            reverted.activeBuffs = arr;
            return reverted;
        }
        // revert one stack worth of effects
        const perStack = {};
        if (target.effects?.stats) {
            for (const [stat, value] of Object.entries(target.effects.stats)) {
                let bonus = 0;
                if (typeof value === 'number')
                    bonus = value;
                else if (typeof value === 'object' && value.percent) {
                    const base = newPlayer.baseStats[stat] || 0;
                    bonus = Math.floor(base * value.percent);
                }
                if (bonus !== 0)
                    perStack[stat] = bonus;
            }
        }
        newPlayer.stats = { ...newPlayer.stats };
        for (const [s, d] of Object.entries(perStack)) {
            newPlayer.stats[s] = Math.max(1, (newPlayer.stats[s] || 0) - d);
        }
        target.currentStacks = current - 1;
        // reduce recorded appliedEffects total
        target.appliedEffects = target.appliedEffects || {};
        target.appliedEffects.stats = { ...(target.appliedEffects.stats || {}) };
        for (const [s, d] of Object.entries(perStack)) {
            target.appliedEffects.stats[s] = Math.max(0, ((target.appliedEffects.stats[s] || 0) - d));
        }
        const arr = [...(newPlayer.activeBuffs || [])];
        arr[idx] = target;
        newPlayer.activeBuffs = arr;
        return newPlayer;
    }
    processBuffsOnTick(player) {
        const newPlayer = { ...player };
        let updated = { ...newPlayer };
        const remaining = [];
        for (const buff of (newPlayer.activeBuffs || [])) {
            if (buff.isPermanent) {
                remaining.push(buff);
                continue;
            }
            if (buff.durationType === 'ticks') {
                const next = { ...buff, duration: (buff.duration || 0) - 1 };
                if ((next.duration || 0) <= 0) {
                    // expire and revert
                    updated = this.revertBuffs(updated, [next]);
                    continue;
                }
                remaining.push(next);
            }
            else {
                remaining.push(buff);
            }
        }
        updated.activeBuffs = remaining;
        return updated;
    }
    processBuffsOnAction(player) {
        const newPlayer = { ...player };
        let updated = { ...newPlayer };
        const remaining = [];
        for (const buff of (newPlayer.activeBuffs || [])) {
            if (buff.isPermanent) {
                remaining.push(buff);
                continue;
            }
            if (buff.durationType === 'actions') {
                const next = { ...buff, duration: (buff.duration || 0) - 1 };
                if ((next.duration || 0) <= 0) {
                    updated = this.revertBuffs(updated, [next]);
                    continue;
                }
                remaining.push(next);
            }
            else {
                remaining.push(buff);
            }
        }
        updated.activeBuffs = remaining;
        return updated;
    }
    processBuffsOnCombatEnd(player) {
        const newPlayer = { ...player };
        let updated = { ...newPlayer };
        const remaining = [];
        for (const buff of (newPlayer.activeBuffs || [])) {
            if (buff.durationType === 'combat') {
                updated = this.revertBuffs(updated, [buff]);
                continue;
            }
            remaining.push(buff);
        }
        updated.activeBuffs = remaining;
        return updated;
    }
}
exports.BuffSystem = BuffSystem;
