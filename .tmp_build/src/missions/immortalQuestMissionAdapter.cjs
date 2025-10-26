"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMissionComplete = onMissionComplete;
const immortalSecretQuest_1 = require("@/quests/immortalSecretQuest");
// Called when a mission completes; may trigger the immortal secret quest
function onMissionComplete(ctx, rng) {
    if (!ctx.foundSecretClue)
        return { triggered: false, message: 'No secret clue.' };
    const q = (0, immortalSecretQuest_1.attemptSecretQuest)({ playerReputation: ctx.playerReputation, foundSecretClue: ctx.foundSecretClue, stealthSuccessful: ctx.stealthSuccessful, worldState: ctx.worldState }, rng);
    return { triggered: q.success, reward: q.reward, message: q.message };
}
