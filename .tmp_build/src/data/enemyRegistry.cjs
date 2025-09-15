"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnemyById = getEnemyById;
exports.getRandomEnemyForAct = getRandomEnemyForAct;
exports.listAllEnemies = listAllEnemies;
const enemies_json_1 = __importDefault(require("../../data/enemies.json"));
const ENEMIES = enemies_json_1.default;
function getEnemyById(id) {
    return ENEMIES.find(e => e.id === id);
}
function getRandomEnemyForAct(act) {
    // Very simple selection: pick by act-based thresholds or random
    const pool = ENEMIES.filter(e => {
        if (act <= 1)
            return e.xpReward <= 20;
        if (act <= 3)
            return e.xpReward <= 50;
        if (act <= 5)
            return e.xpReward <= 150;
        return true;
    });
    if (pool.length === 0)
        return ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    return pool[Math.floor(Math.random() * pool.length)];
}
function listAllEnemies() { return [...ENEMIES]; }
