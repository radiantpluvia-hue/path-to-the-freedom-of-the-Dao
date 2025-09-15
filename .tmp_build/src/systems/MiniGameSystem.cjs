"use strict";
// Simple MiniGameSystem with difficulty presets and score calculation utilities
// Non-UI: exposes APIs to start/complete mini-games and compute basic scores.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniGameSystem = exports.difficultySettings = void 0;
exports.calculateScore = calculateScore;
exports.difficultySettings = {
    easy: { targetSize: 40, moveSpeed: 2, spawnRate: 2000, precisionMultiplier: 1 },
    medium: { targetSize: 30, moveSpeed: 3, spawnRate: 1500, precisionMultiplier: 1.2 },
    hard: { targetSize: 25, moveSpeed: 4, spawnRate: 1000, precisionMultiplier: 1.5 },
    extreme: { targetSize: 20, moveSpeed: 5, spawnRate: 800, precisionMultiplier: 2 },
    legendary: { targetSize: 15, moveSpeed: 6, spawnRate: 600, precisionMultiplier: 2.5 }
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
        return {
            id,
            difficulty,
            startTick: currentTick,
            sessionId: `${id}-${currentTick}-${Math.random().toString(36).slice(2, 8)}`
        };
    }
    endSession(session, result) {
        const mult = exports.difficultySettings[session.difficulty].precisionMultiplier;
        const score = calculateScore({ moves: result.moves, timeLeft: result.timeLeft, timeLimit: result.timeLimit, multiplier: mult });
        return { score };
    }
}
exports.MiniGameSystem = MiniGameSystem;
