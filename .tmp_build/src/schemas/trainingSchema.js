"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrainings = validateTrainings;
// Lightweight runtime validator for training definitions.
// This file intentionally avoids adding external dependencies to keep the
// project minimal. It returns an array of error messages (empty if valid).
function validateTrainings(data) {
    const errors = [];
    if (!Array.isArray(data)) {
        errors.push('trainings must be an array');
        return errors;
    }
    const requiredTopLevel = ['id', 'name', 'category', 'cost', 'time_ticks', 'cooldown_ticks', 'success_base'];
    const optionalTopLevel = ['xp_gain', 'risk', 'rewards', 'hooks', 'flavor_text', 'ui_hint', 'unlock_realm', 'xp_gain', 'rewards'];
    const allowedTopLevel = new Set([...requiredTopLevel, ...optionalTopLevel]);
    data.forEach((t, idx) => {
        if (typeof t !== 'object' || t === null) {
            errors.push(`entry[${idx}] must be an object`);
            return;
        }
        for (const k of requiredTopLevel) {
            if (!(k in t))
                errors.push(`entry[${idx}] missing required field '${k}'`);
        }
        if (t.id && typeof t.id !== 'string')
            errors.push(`entry[${idx}].id must be a string`);
        if (t.name && typeof t.name !== 'string')
            errors.push(`entry[${idx}].name must be a string`);
        if (t.category && typeof t.category !== 'string')
            errors.push(`entry[${idx}].category must be a string`);
        // no unknown top-level keys
        for (const k of Object.keys(t)) {
            if (!allowedTopLevel.has(k))
                errors.push(`entry[${idx}] contains unknown top-level key '${k}'`);
        }
        // cost should be an object with optional items array and numeric resources
        if (t.cost && typeof t.cost !== 'object')
            errors.push(`entry[${idx}].cost must be an object`);
        else if (t.cost) {
            // numeric cost keys (stamina, qi, etc.) should be numbers >= 0
            for (const k of Object.keys(t.cost)) {
                if (k === 'items')
                    continue;
                if (typeof t.cost[k] !== 'number' || t.cost[k] < 0)
                    errors.push(`entry[${idx}].cost.${k} must be a non-negative number`);
            }
            if ('items' in t.cost && !Array.isArray(t.cost.items))
                errors.push(`entry[${idx}].cost.items must be an array`);
            else if (Array.isArray(t.cost.items)) {
                t.cost.items.forEach((it, j) => {
                    if (typeof it !== 'string')
                        errors.push(`entry[${idx}].cost.items[${j}] must be a string id`);
                });
            }
        }
        if ('time_ticks' in t && (typeof t.time_ticks !== 'number' || t.time_ticks <= 0))
            errors.push(`entry[${idx}].time_ticks must be a positive number`);
        if ('cooldown_ticks' in t && (typeof t.cooldown_ticks !== 'number' || t.cooldown_ticks < 0))
            errors.push(`entry[${idx}].cooldown_ticks must be a non-negative number`);
        if ('success_base' in t && (typeof t.success_base !== 'number' || t.success_base < 0 || t.success_base > 1))
            errors.push(`entry[${idx}].success_base must be a number between 0 and 1`);
        // hooks should be an object mapping hook-names to string function ids
        if ('hooks' in t) {
            if (t.hooks && typeof t.hooks !== 'object')
                errors.push(`entry[${idx}].hooks must be an object`);
            else if (t.hooks) {
                for (const hk of Object.keys(t.hooks)) {
                    if (typeof t.hooks[hk] !== 'string')
                        errors.push(`entry[${idx}].hooks.${hk} must be a string`);
                }
            }
        }
        // xp_gain should be an object mapping domain -> number
        if ('xp_gain' in t) {
            if (t.xp_gain && typeof t.xp_gain !== 'object')
                errors.push(`entry[${idx}].xp_gain must be an object`);
            else if (t.xp_gain) {
                for (const d of Object.keys(t.xp_gain)) {
                    if (typeof t.xp_gain[d] !== 'number' || t.xp_gain[d] < 0)
                        errors.push(`entry[${idx}].xp_gain.${d} must be a non-negative number`);
                }
            }
        }
        // risk/backlash validations
        if ('risk' in t) {
            if (t.risk && typeof t.risk !== 'object')
                errors.push(`entry[${idx}].risk must be an object`);
            else if (t.risk) {
                if ('backlash_chance' in t.risk && (typeof t.risk.backlash_chance !== 'number' || t.risk.backlash_chance < 0 || t.risk.backlash_chance > 1)) {
                    errors.push(`entry[${idx}].risk.backlash_chance must be a number between 0 and 1`);
                }
                if ('backlash' in t.risk) {
                    if (typeof t.risk.backlash !== 'object' || t.risk.backlash === null)
                        errors.push(`entry[${idx}].risk.backlash must be an object`);
                    else {
                        // backlash must map to numeric effects (e.g., mental_hp_pct: 0.05)
                        for (const bk of Object.keys(t.risk.backlash)) {
                            if (typeof t.risk.backlash[bk] !== 'number')
                                errors.push(`entry[${idx}].risk.backlash.${bk} must be a number`);
                        }
                    }
                }
            }
        }
        // rewards validations: must be an object; values may be numbers or nested objects mapping to numbers
        if ('rewards' in t) {
            if (t.rewards && typeof t.rewards !== 'object')
                errors.push(`entry[${idx}].rewards must be an object`);
            else if (t.rewards) {
                for (const rk of Object.keys(t.rewards)) {
                    const val = t.rewards[rk];
                    if (typeof val === 'number')
                        continue;
                    if (typeof val === 'object' && val !== null) {
                        for (const subk of Object.keys(val)) {
                            if (typeof val[subk] !== 'number')
                                errors.push(`entry[${idx}].rewards.${rk}.${subk} must be a number`);
                        }
                        continue;
                    }
                    errors.push(`entry[${idx}].rewards.${rk} must be a number or object of numbers`);
                }
            }
        }
        // unlock_realm should be a non-negative integer if present
        if ('unlock_realm' in t && (typeof t.unlock_realm !== 'number' || t.unlock_realm < 0 || !Number.isInteger(t.unlock_realm))) {
            errors.push(`entry[${idx}].unlock_realm must be a non-negative integer`);
        }
        // flavor_text and ui_hint should be strings if present
        if ('flavor_text' in t && t.flavor_text && typeof t.flavor_text !== 'string')
            errors.push(`entry[${idx}].flavor_text must be a string`);
        if ('ui_hint' in t && t.ui_hint && typeof t.ui_hint !== 'string')
            errors.push(`entry[${idx}].ui_hint must be a string`);
    });
    return errors;
}
exports.default = validateTrainings;
