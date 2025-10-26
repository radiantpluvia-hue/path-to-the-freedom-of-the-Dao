"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorTeachingSystem = void 0;
const rng_1 = require("../utils/rng");
const TEACHING_COOLDOWN_TICKS = 2000; // cooldown after any teaching attempt/success
class MentorTeachingSystem {
    // Player-specific progress is now managed in the GameState.
    constructor() {
        this.allTeachings = new Map();
        this.teachingsByMentor = new Map();
        this.teachingToMentorId = new Map();
        // Teachings should be loaded externally, e.g., from JSON files
    }
    loadMentorTeachings(mentorId, teachings) {
        this.teachingsByMentor.set(mentorId, teachings);
        teachings.forEach(teaching => {
            this.allTeachings.set(teaching.id, teaching);
            this.teachingToMentorId.set(teaching.id, mentorId);
        });
    }
    isOnMentorCooldown(mentorId, gameState) {
        const mp = gameState.systems.mentorProgress?.[mentorId];
        const lastTick = mp?.lastTaughtTick ?? -Infinity;
        return (gameState.world.tick - lastTick) < TEACHING_COOLDOWN_TICKS;
    }
    getMentorCooldownRemaining(mentorId, gameState) {
        const mp = gameState.systems.mentorProgress?.[mentorId];
        const lastTick = mp?.lastTaughtTick ?? -Infinity;
        const remaining = TEACHING_COOLDOWN_TICKS - (gameState.world.tick - lastTick);
        return Math.max(0, remaining);
    }
    getAvailableTeachings(mentorId, gameState) {
        const mentorTeachings = this.teachingsByMentor.get(mentorId) || [];
        // Block during mentor cooldown
        if (this.isOnMentorCooldown(mentorId, gameState))
            return [];
        return mentorTeachings.filter(teaching => {
            const progress = this.getTeachingProgress(teaching.id, gameState);
            return !progress.completed && this.checkPrerequisites(teaching, gameState);
        });
    }
    attemptTeaching(teachingId, gameState) {
        // This would trigger the actual challenge mini-game
        // For now, simulate based on player skills and teaching difficulty
        const teaching = this.getTeachingById(teachingId);
        if (!teaching) {
            return {
                result: {
                    success: false,
                    score: 0,
                    timeTaken: 0,
                    penaltyConsequences: { qi: -10, insight: -5 }
                }
            };
        }
        const mentorId = this.teachingToMentorId.get(teachingId) || '';
        // Respect cooldown: do not allow attempt if on cooldown
        if (mentorId && this.isOnMentorCooldown(mentorId, gameState)) {
            return {
                result: {
                    success: false,
                    score: 0,
                    timeTaken: 0,
                    penaltyConsequences: { cooldownRemaining: this.getMentorCooldownRemaining(mentorId, gameState) }
                }
            };
        }
        const difficultyMultiplier = this.getDifficultyMultiplier(teaching.challenge.difficulty);
        const playerSkill = this.calculatePlayerSkill(gameState.player, teaching.challenge.type);
        const successChance = Math.min(0.95, playerSkill * difficultyMultiplier);
        const success = (0, rng_1.roll)(gameState) < successChance;
        const score = success ? Math.floor((0, rng_1.randInt)(20, gameState) + 80) : Math.floor((0, rng_1.randInt)(60, gameState));
        const timeTaken = Math.floor(((0, rng_1.roll)(gameState) * (teaching.challenge.timeLimit || 60) * 0.5));
        const result = {
            success,
            score,
            timeTaken,
            accuracy: success ? (score / 100) * 100 : Math.floor((0, rng_1.randInt)(50, gameState)),
            efficiency: success ? (timeTaken / (teaching.challenge.timeLimit || 60)) * 100 : 0,
            bonusRewards: success ? this.calculateBonusRewards(score, teaching) : undefined,
            penaltyConsequences: !success ? teaching.failureConsequence : undefined
        };
        const updatedProgress = success ? this.getUpdatedTeachingProgress(teaching.id, result, gameState) : undefined;
        // Build mentor progress patch (cooldown starts after any attempt)
        if (mentorId) {
            const mp = gameState.systems.mentorProgress?.[mentorId] || {
                teachingsReceived: 0,
                lastTaughtTimestamp: 0,
                lastTaughtTick: undefined,
                learnedTeachings: []
            };
            const newMp = {
                ...mp,
                teachingsReceived: (mp.teachingsReceived || 0) + 1,
                lastTaughtTimestamp: Date.now(), // keep legacy field updated
                lastTaughtTick: gameState.world.tick,
                learnedTeachings: success && !mp.learnedTeachings.includes(teachingId)
                    ? [...mp.learnedTeachings, teachingId]
                    : mp.learnedTeachings
            };
            return { result, updatedProgress, updatedMentorProgress: { mentorId, progress: newMp } };
        }
        return { result, updatedProgress };
    }
    recordChallengeResult(teachingId, result, gameState) {
        return this.getUpdatedTeachingProgress(teachingId, result, gameState);
    }
    getTeachingById(teachingId) {
        return this.allTeachings.get(teachingId);
    }
    getDifficultyMultiplier(difficulty) {
        const multipliers = {
            easy: 1.2,
            medium: 1.0,
            hard: 0.8,
            extreme: 0.6,
            legendary: 0.4,
            mythical: 0.2,
            transcendent: 0.1,
            impossible: 0.05
        };
        return multipliers[difficulty] || 1.0;
    }
    calculatePlayerSkill(playerState, challengeType) {
        // Calculate player skill based on relevant stats for the challenge type
        let baseSkill = 0.5; // Base 50% chance
        if (challengeType.includes('meditation') || challengeType.includes('qi')) {
            baseSkill += (playerState.skills?.qiControl?.level || 0) * 0.1;
            baseSkill += (playerState.insight ?? 0) * 0.01;
        }
        else if (challengeType.includes('combat')) {
            baseSkill += (playerState.skills?.combatSkills?.level || 0) * 0.1;
            baseSkill += (playerState.combatPower ?? 0) * 0.0001;
        }
        else if (challengeType.includes('puzzle') || challengeType.includes('memory')) {
            baseSkill += (playerState.skills?.mentalFortitude?.level || 0) * 0.1;
            baseSkill += (playerState.insight ?? 0) * 0.01;
        }
        return Math.min(0.95, Math.max(0.05, baseSkill)); // Ensure skill is between 5% and 95%
    }
    calculateBonusRewards(score, teaching) {
        const bonus = {};
        const bonusMultiplier = score / 100;
        Object.entries(teaching.reward || {}).forEach(([key, value]) => {
            if (typeof value === 'number') {
                bonus[key] = Math.floor(value * bonusMultiplier * 0.5); // 50% of base reward as bonus
            }
        });
        return bonus;
    }
    checkPrerequisites(teaching, gameState) {
        return this.checkPrerequisitesForRequirements(teaching.prerequisites || {}, gameState);
    }
    checkPrerequisitesForRequirements(prerequisites, gameState) {
        if (!prerequisites)
            return true;
        const { player, world } = gameState;
        for (const key in prerequisites) {
            const reqValue = prerequisites[key];
            if (reqValue === undefined)
                continue;
            switch (key) {
                case 'minLevel':
                    if ((player.level || 0) < reqValue)
                        return false;
                    break;
                case 'karma': // Assuming karma is a max value, e.g., for evil teachings
                    if ((player.karma || 0) > reqValue)
                        return false;
                    break;
                case 'cunning':
                    if ((player.cunning || 0) < reqValue)
                        return false;
                    break;
                case 'rebelliousness':
                    if (player.rebelliousness !== undefined && player.rebelliousness < reqValue)
                        return false;
                    break;
                case 'phoenixBlood':
                    if (player.phoenixBlood !== undefined && player.phoenixBlood !== reqValue)
                        return false;
                    break;
                case 'mentorAffinity':
                    for (const [mentorId, requiredAffinity] of Object.entries(reqValue)) {
                        if ((player.mentorAffinity?.[mentorId] || 0) < requiredAffinity)
                            return false;
                    }
                    break;
                case 'requiredSkills':
                    for (const [skill, level] of Object.entries(reqValue)) {
                        if ((player.skills?.[skill]?.level || 0) < level)
                            return false;
                    }
                    break;
                // This check needs access to the world state
                case 'eventFlags':
                    for (const [flag, value] of Object.entries(reqValue)) {
                        if (world.flags?.[flag] !== value)
                            return false;
                    }
                    break;
                // Handle logical operators
                case 'and':
                    if (!reqValue.every(p => this.checkPrerequisitesForRequirements(p, gameState)))
                        return false;
                    break;
                case 'or':
                    if (!reqValue.some(p => this.checkPrerequisitesForRequirements(p, gameState)))
                        return false;
                    break;
                case 'not':
                    if (this.checkPrerequisitesForRequirements(reqValue, gameState))
                        return false;
                    break;
                case 'requiredTeachings':
                    for (const tid of reqValue) {
                        const tp = gameState.systems.teachingProgress?.[tid];
                        if (!tp?.completed)
                            return false;
                    }
                    break;
                // TODO: Implement other checks from Prerequisites interface as needed
            }
        }
        return true;
    }
    // This method now returns a new progress object instead of mutating state
    getUpdatedTeachingProgress(teachingId, result, gameState) {
        const progress = this.getTeachingProgress(teachingId, gameState);
        const newProgress = { ...progress, attempts: progress.attempts + 1, lastAttempt: Date.now() };
        if (result.success) {
            newProgress.completed = true;
            newProgress.bestScore = Math.max(newProgress.bestScore, result.score);
            newProgress.completionTime = result.timeTaken;
        }
        return newProgress;
    }
    // New method to get teaching progress
    getTeachingProgress(teachingId, gameState) {
        return gameState.systems.teachingProgress?.[teachingId] || {
            attempts: 0,
            completed: false,
            bestScore: 0,
            currentStage: 0,
            masteryLevel: 0,
            masteryPoints: 0
        };
    }
    // Get mastery level for a teaching
    getTeachingMastery(teachingId, gameState) {
        const progress = this.getTeachingProgress(teachingId, gameState);
        const masteryLevel = progress.masteryLevel || 0;
        const masteryPoints = progress.masteryPoints || 0;
        const nextLevelPoints = (masteryLevel + 1) * 100; // 100 points per level
        return {
            level: masteryLevel,
            points: masteryPoints,
            nextLevelPoints
        };
    }
    // Award mastery points for successful teaching completion
    awardMasteryPoints(teachingId, points, gameState) {
        const progress = this.getTeachingProgress(teachingId, gameState);
        const newMasteryPoints = (progress.masteryPoints || 0) + points;
        const currentLevel = progress.masteryLevel || 0;
        const pointsForNextLevel = (currentLevel + 1) * 100;
        let newMasteryLevel = currentLevel;
        let remainingPoints = newMasteryPoints;
        // Check for level ups
        while (remainingPoints >= pointsForNextLevel && newMasteryLevel < 10) { // Max level 10
            remainingPoints -= pointsForNextLevel;
            newMasteryLevel++;
        }
        return {
            ...progress,
            masteryLevel: newMasteryLevel,
            masteryPoints: remainingPoints
        };
    }
    // Get all completed teachings for a mentor with mastery info
    getMentorMasteryProgress(mentorId, gameState) {
        const mentorTeachings = this.teachingsByMentor.get(mentorId) || [];
        return mentorTeachings
            .filter(teaching => {
            const progress = this.getTeachingProgress(teaching.id, gameState);
            return progress.completed;
        })
            .map(teaching => {
            const mastery = this.getTeachingMastery(teaching.id, gameState);
            return {
                teachingId: teaching.id,
                title: teaching.title,
                masteryLevel: mastery.level,
                masteryPoints: mastery.points
            };
        });
    }
}
exports.MentorTeachingSystem = MentorTeachingSystem;
