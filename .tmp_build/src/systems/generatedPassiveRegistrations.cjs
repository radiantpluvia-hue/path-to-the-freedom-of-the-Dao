"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGeneratedPassives = registerGeneratedPassives;
const rng_1 = require("../utils/rng");
async function registerGeneratedPassives(registerPassive) {
    // Defer loading the heavy generated passives until registration time.
    // This prevents bundling the large generated JSON into the main chunk.
    try {
        const mod = await Promise.resolve().then(() => __importStar(require('../data/generated/passives.generated')));
        const GENERATED_PASSIVES = (mod && (mod.GENERATED_PASSIVES || mod.default)) || [];
        GENERATED_PASSIVES.forEach((p) => {
            const defId = p.id;
            const stats = p.stats || {};
            const reg = {
                id: defId,
                name: p.name,
                description: p.description,
                apply: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    if (stats.atk)
                        out.stats.attack = (out.stats.attack || 0) + stats.atk;
                    if (stats.def)
                        out.stats.defense = (out.stats.defense || 0) + stats.def;
                    if (stats.hp) {
                        out.maxHp = (out.maxHp || 0) + stats.hp;
                        out.hp = Math.min(out.hp || out.maxHp, out.maxHp);
                    }
                    if (stats.atkPct) {
                        out._passivePct = { ...(out._passivePct || {}) };
                        out._passivePct[defId] = stats.atkPct;
                        out.stats.attack = Math.floor((out.stats.attack || 0) * (1 + stats.atkPct / 100));
                    }
                    return out;
                },
                remove: (player) => {
                    const out = { ...player };
                    out.stats = { ...(out.stats || {}) };
                    if (stats.atk)
                        out.stats.attack = (out.stats.attack || 0) - stats.atk;
                    if (stats.def)
                        out.stats.defense = (out.stats.defense || 0) - stats.def;
                    if (stats.hp) {
                        out.maxHp = (out.maxHp || 0) - stats.hp;
                        out.hp = Math.min(out.hp || out.maxHp, out.maxHp);
                    }
                    if (stats.atkPct) {
                        const prev = ((out._passivePct || {})[defId]) || 0;
                        delete (out._passivePct || {})[defId];
                        const factor = 1 + (prev / 100);
                        out.stats.attack = Math.floor((out.stats.attack || 0) / factor);
                    }
                    return out;
                }
            };
            const tags = p.tags || [];
            if (tags.includes('reflect') || tags.includes('thorn')) {
                reg.onHit = ({ attacker, target: _target, damage }) => {
                    const pct = 0.15; // 15% baseline
                    const refl = Math.max(1, Math.floor(damage * pct));
                    if (attacker && typeof attacker.hp === 'number')
                        attacker.hp = Math.max(0, attacker.hp - refl);
                    return;
                };
            }
            if (tags.includes('aura') || tags.includes('bleed')) {
                reg.auraTick = (player, _ctx) => {
                    if (player && typeof player.hp === 'number' && typeof player.maxHp === 'number') {
                        const heal = Math.max(1, Math.floor((player.maxHp || 10) * 0.02));
                        player.hp = Math.min(player.maxHp, player.hp + heal);
                    }
                };
            }
            if (p.origin && p.origin.type === 'ability') {
                reg.proc = (ctx) => {
                    try {
                        const rngFn = (ctx && ctx.rng) ? ctx.rng : (0, rng_1.getRng)(ctx);
                        if (rngFn && typeof rngFn === 'function' ? rngFn() < 0.10 : (0, rng_1.roll)() < 0.10) {
                            const attacker = ctx.attacker;
                            const target = ctx.target;
                            if (attacker && target) {
                                const extra = Math.max(1, Math.floor(((ctx.damage || 1) * 0.25)));
                                target.hp = Math.max(0, target.hp - extra);
                            }
                        }
                    }
                    catch (e) { /* ignore */ }
                };
            }
            registerPassive(reg);
        });
    }
    catch (e) {
        // If generated content isn't present or fails to load, fail gracefully (no-op)
    }
}
exports.default = true;
