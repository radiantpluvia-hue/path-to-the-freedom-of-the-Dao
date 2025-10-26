"use strict";
// Simple MiniGameSystem with difficulty presets and score calculation utilities
// Non-UI: exposes APIs to start/complete mini-games and compute basic scores.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniGameSystem = exports.difficultySettings = void 0;
exports.calculateScore = calculateScore;
const seededRng_1 = require("../utils/seededRng");
const rng_1 = require("../utils/rng");
exports.difficultySettings = {
    easy: { targetSize: 40, moveSpeed: 2, spawnRate: 2000, precisionMultiplier: 1 },
    medium: { targetSize: 30, moveSpeed: 3, spawnRate: 1500, precisionMultiplier: 1.2 },
    hard: { targetSize: 25, moveSpeed: 4, spawnRate: 1000, precisionMultiplier: 1.5 },
    extreme: { targetSize: 20, moveSpeed: 5, spawnRate: 800, precisionMultiplier: 2 },
    legendary: { targetSize: 15, moveSpeed: 6, spawnRate: 600, precisionMultiplier: 2.5 },
    // legacy-letter alias
    D: { targetSize: 15, moveSpeed: 6, spawnRate: 600, precisionMultiplier: 2.5 }
};
function calculateScore(params) {
    const { moves, timeLeft, timeLimit, multiplier = 1 } = params;
    const maxMoves = 100;
    const moveEfficiency = Math.max(0, 100 - (moves / maxMoves) * 100);
    const timeEfficiency = Math.max(0, (timeLeft / timeLimit) * 100);
    return Math.floor((moveEfficiency + timeEfficiency) * multiplier);
}
class MiniGameSystem {
    startSession(id, difficulty, currentTick) {
        // Resolve RNG at call-time using central helper (getRng -> seeded.runtimeRng -> Math.random)
        const randStr = (0, rng_1.getRng)()().toString(36).slice(2, 8);
        return {
            id,
            difficulty,
            startTick: currentTick,
            sessionId: `${id}-${currentTick}-${randStr}`
        };
    }
    endSession(session, result) {
        const mult = exports.difficultySettings[session.difficulty].precisionMultiplier;
        const score = calculateScore({ moves: result.moves, timeLeft: result.timeLeft, timeLimit: result.timeLimit, multiplier: mult });
        return { score };
    }
    // Simulate a single-elimination tournament among `count` competitors.
    // Uses deterministic runtimeRng() for reproducible results in tests when seeded.
    runSectTournament(count, profiles) {
        // round to nearest power of two bracket
        let bracket = 1;
        while (bracket < count)
            bracket <<= 1;
        const resolveRng = () => (0, rng_1.getRng)();
        const competitors = new Array(bracket).fill(null).map((_, i) => {
            if (i < count) {
                if (Array.isArray(profiles) && profiles[i]) {
                    return { id: profiles[i].id ?? i, strength: this.computeStrengthFromProfile(profiles[i]), profile: profiles[i] };
                }
                const rng = resolveRng();
                const r = rng();
                return { id: i, strength: 1 + (r * 2) };
            }
            return { id: i, strength: 0 };
        });
        // build participants array so callers can inspect profiles
        const participants = competitors.map(c => ({ id: c.id, profile: c.profile, strength: c.strength }));
        void participants;
        let round = 0;
        let current = competitors.slice();
        const roundsData = [];
        while (current.length > 1) {
            const next = [];
            const matches = [];
            for (let i = 0; i < current.length; i += 2) {
                const a = current[i];
                const b = current[i + 1] || { id: -1, strength: 0 };
                // decide winner by strength + randomness
                const rngMatch = resolveRng();
                const ar = (a.strength || 0) * (0.7 + ((rngMatch() * 0.6)));
                const br = (b.strength || 0) * (0.7 + ((rngMatch() * 0.6)));
                const winner = ar >= br ? a : b;
                matches.push({ aId: a.id, bId: b.id, winnerId: winner.id, aStrength: a.strength, bStrength: b.strength });
                next.push(winner);
            }
            roundsData.push({ matches });
            current = next;
            round++;
        }
        const winner = current[0] || { id: -1 };
        return { bracketSize: bracket, winnerIndex: winner.id, rounds: round, roundsData };
    }
    // Compute a deterministic strength value from a profile (player/rival/disciple)
    computeStrengthFromProfile(profile) {
        try {
            // use level, atk, def, speed, hp when present
            const lvl = Number(profile.level || (profile.stats && profile.stats.level) || 0);
            const atk = Number((profile.stats && profile.stats.atk) || profile.atk || 0);
            const def = Number((profile.stats && profile.stats.def) || profile.def || 0);
            const speed = Number((profile.stats && profile.stats.speed) || profile.speed || 0);
            const hp = Number((profile.stats && profile.stats.hp) || profile.hp || 0);
            // simple weighted sum normalized then add a tiny deterministic jitter from seeded RNG by id
            const base = (lvl * 1.5) + (atk * 1.2) + (def * 1.0) + (speed * 0.8) + (hp * 0.05);
            // deterministic jitter based on id string
            let jitter = 0;
            if (profile && profile.id) {
                const idStr = String(profile.id);
                let h = 2166136261 >>> 0;
                for (let i = 0; i < idStr.length; i++) {
                    h ^= idStr.charCodeAt(i);
                    h = Math.imul(h, 16777619) >>> 0;
                }
                jitter = ((h & 0x7fffffff) / 0x80000000) * 0.5; // small jitter up to 0.5
            }
            else {
                try {
                    const rng = (0, rng_1.getRng)();
                    jitter = rng() * 0.5;
                }
                catch (e) {
                    jitter = (typeof seededRng_1.runtimeRng === 'function' ? (0, seededRng_1.runtimeRng)() : Math.random()) * 0.5;
                }
            }
            return Math.max(0.1, base / 10 + jitter);
        }
        catch (e) {
            return 1 + (0, seededRng_1.runtimeRng)() * 2;
        }
    }
    // Simulate a simple faction war on a small grid. This is intentionally abstract
    // and returns casualties and victor. Uses runtimeRng for deterministic runs.
    runFactionWar(attackerStrength, defenderStrength, maxTurns = 10) {
        let atk = attackerStrength;
        let def = defenderStrength;
        let turns = 0;
        while (turns < maxTurns && atk > 0 && def > 0) {
            // Attacker deals damage proportional to strength and RNG
            const __rfn2 = (0, rng_1.getRng)();
            const r1 = __rfn2();
            const r2 = __rfn2();
            const atkPower = atk * (0.5 + r1);
            const defPower = def * (0.5 + r2);
            const defLoss = Math.floor(Math.min(def, atkPower / 2));
            const atkLoss = Math.floor(Math.min(atk, defPower / 3));
            def -= defLoss;
            atk -= atkLoss;
            turns++;
        }
        let victor = 'stalemate';
        if (atk > 0 && def <= 0)
            victor = 'attacker';
        if (def > 0 && atk <= 0)
            victor = 'defender';
        return { victor, attackerCasualties: Math.max(0, attackerStrength - atk), defenderCasualties: Math.max(0, defenderStrength - def), turns };
    }
}
exports.MiniGameSystem = MiniGameSystem;
