"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinySystem = void 0;
const rng_1 = require("../utils/rng");
class DestinySystem {
    threads() {
        return (this.narrativeEngine.destinyThreads || []);
    }
    constructor(narrativeEngine) {
        this.narrativeEngine = narrativeEngine;
    }
    /**
     * Creates a new destiny thread
     */
    createDestinyThread(name, description, initialStrength = 50) {
        const thread = {
            id: `destiny_${Date.now()}_${Math.floor((0, rng_1.getRng)()() * 0x100000).toString(36).substr(0, 7)}`,
            name,
            description,
            strength: initialStrength,
            connections: [],
            fatePoints: 0,
            active: true
        };
        this.narrativeEngine.destinyThreads.push(thread);
        return thread;
    }
    /**
     * Adds a connection to a destiny thread
     */
    addDestinyConnection(threadId, targetId, type, strength, description) {
        const thread = this.threads().find((t) => t.id === threadId);
        if (!thread)
            return false;
        const connection = {
            targetId,
            type,
            strength,
            description
        };
        thread.connections.push(connection);
        return true;
    }
    /**
     * Modifies the strength of a destiny thread
     */
    modifyThreadStrength(threadId, strengthChange) {
        const thread = this.threads().find((t) => t.id === threadId);
        if (!thread)
            return false;
        thread.strength = Math.max(0, Math.min(100, thread.strength + strengthChange));
        return true;
    }
    /**
     * Adds fate points to a destiny thread
     */
    addFatePoints(threadId, points) {
        const thread = this.threads().find((t) => t.id === threadId);
        if (!thread)
            return false;
        thread.fatePoints = Math.max(0, thread.fatePoints + points);
        return true;
    }
    /**
     * Gets all active destiny threads
     */
    getActiveThreads() {
        return this.threads().filter((thread) => thread.active);
    }
    /**
     * Gets destiny threads connected to a specific target
     */
    getThreadsForTarget(targetId) {
        return this.threads().filter((thread) => thread.connections.some((conn) => conn.targetId === targetId));
    }
    /**
     * Calculates the total destiny influence on the player
     */
    getTotalDestinyInfluence() {
        const activeThreads = this.getActiveThreads();
        let totalStrength = 0;
        let totalFatePoints = 0;
        const typeCounts = {};
        for (const thread of activeThreads) {
            totalStrength += thread.strength;
            totalFatePoints += thread.fatePoints;
            for (const connection of thread.connections) {
                typeCounts[connection.type] = (typeCounts[connection.type] || 0) + connection.strength;
            }
        }
        const dominantType = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
        return {
            overallStrength: Math.min(100, totalStrength / Math.max(1, activeThreads.length)),
            dominantType,
            fatePoints: totalFatePoints
        };
    }
    /**
     * Applies destiny effects based on thread strength and connections
     */
    applyDestinyEffects(player) {
        let newPlayer = { ...player };
        const activeThreads = this.getActiveThreads();
        for (const thread of activeThreads) {
            if (thread.strength >= 75) {
                // Strong destiny threads provide significant bonuses
                newPlayer = this.applyStrongDestinyEffects(newPlayer, thread);
            }
            else if (thread.strength >= 50) {
                // Moderate destiny threads provide moderate bonuses
                newPlayer = this.applyModerateDestinyEffects(newPlayer, thread);
            }
            else if (thread.strength <= 25) {
                // Weak destiny threads may provide minor penalties or challenges
                newPlayer = this.applyWeakDestinyEffects(newPlayer, thread);
            }
        }
        return newPlayer;
    }
    /**
     * Applies effects from strong destiny threads
     */
    applyStrongDestinyEffects(player, thread) {
        const newPlayer = { ...player };
        // Boost stats based on connection types
        for (const connection of thread.connections) {
            switch (connection.type) {
                case 'mentor':
                    if (connection.strength >= 80) {
                        newPlayer.insight = (newPlayer.insight || 0) + Math.floor(thread.strength * 0.1);
                    }
                    break;
                case 'ally':
                    if (connection.strength >= 80) {
                        newPlayer.reputation = { ...newPlayer.reputation };
                        // Boost general reputation
                        for (const key in newPlayer.reputation) {
                            newPlayer.reputation[key] = (newPlayer.reputation[key] || 0) + Math.floor(thread.strength * 0.05);
                        }
                    }
                    break;
                case 'opportunity':
                    if (connection.strength >= 80) {
                        newPlayer.luckModifier = (newPlayer.luckModifier || 0) + Math.floor(thread.strength * 0.02);
                    }
                    break;
            }
        }
        return newPlayer;
    }
    /**
     * Applies effects from moderate destiny threads
     */
    applyModerateDestinyEffects(player, thread) {
        const newPlayer = { ...player };
        // Minor boosts based on connection types
        for (const connection of thread.connections) {
            switch (connection.type) {
                case 'mentor':
                    newPlayer.insight = (newPlayer.insight || 0) + Math.floor(thread.strength * 0.05);
                    break;
                case 'ally':
                    newPlayer.reputation = { ...newPlayer.reputation };
                    for (const key in newPlayer.reputation) {
                        newPlayer.reputation[key] = (newPlayer.reputation[key] || 0) + Math.floor(thread.strength * 0.02);
                    }
                    break;
            }
        }
        return newPlayer;
    }
    /**
     * Applies effects from weak destiny threads (potential penalties)
     */
    applyWeakDestinyEffects(player, thread) {
        const newPlayer = { ...player };
        // Weak threads may create challenges or minor penalties
        for (const connection of thread.connections) {
            if (connection.type === 'enemy' && connection.strength >= 60) {
                // Strong enemy connections in weak threads create tension
                newPlayer.stressModifier = (newPlayer.stressModifier || 0) + Math.floor((100 - thread.strength) * 0.03);
            }
        }
        return newPlayer;
    }
    /**
     * Triggers destiny events based on thread conditions
     */
    checkDestinyTriggers() {
        const triggeredEvents = [];
        const activeThreads = this.getActiveThreads();
        for (const thread of activeThreads) {
            // Check for destiny milestones
            if (thread.strength >= 90 && thread.fatePoints >= 10) {
                triggeredEvents.push(`${thread.name}_climax`);
            }
            else if (thread.strength <= 10) {
                triggeredEvents.push(`${thread.name}_fading`);
            }
            // Check connection-based triggers
            for (const connection of thread.connections) {
                if (connection.strength >= 90) {
                    triggeredEvents.push(`${thread.name}_${connection.type}_peak`);
                }
            }
        }
        return triggeredEvents;
    }
    /**
     * Spends fate points to influence destiny
     */
    spendFatePoints(threadId, points, effect) {
        const thread = this.threads().find((t) => t.id === threadId);
        if (!thread || thread.fatePoints < points)
            return false;
        thread.fatePoints -= points;
        // Apply the destiny effect
        if (effect.threadId && effect.strengthChange) {
            this.modifyThreadStrength(effect.threadId, effect.strengthChange);
        }
        if (effect.connectionChange) {
            this.addDestinyConnection(threadId, effect.connectionChange.targetId, effect.connectionChange.type, effect.connectionChange.strength, effect.connectionChange.description);
        }
        return true;
    }
    /**
     * Gets destiny threads that could be influenced by player actions
     */
    getInfluenceableThreads(_playerAction) {
        // This would analyze player actions and return relevant destiny threads
        // For now, return threads with opportunities or threats
        return this.threads().filter((thread) => thread.active && thread.connections.some((conn) => conn.type === 'opportunity' || conn.type === 'threat'));
    }
    /**
     * Returns influenceable threads prioritized by player's destinyAffinity.
     * Positive affinity prefers threads with ally/opportunity/mentor, negative prefers rival/threat.
     */
    getInfluenceableThreadsForPlayer(player) {
        const affinity = (player && typeof player.destinyAffinity === 'number') ? player.destinyAffinity : 0;
        const threads = this.getInfluenceableThreads('playerAction');
        if (affinity === 0)
            return threads;
        const positiveTypes = ['ally', 'opportunity', 'mentor'];
        const negativeTypes = ['rival', 'threat', 'enemy'];
        const scored = threads.map(thread => {
            let score = 0;
            for (const conn of thread.connections) {
                if (affinity > 0 && positiveTypes.includes(conn.type))
                    score += conn.strength;
                if (affinity < 0 && negativeTypes.includes(conn.type))
                    score += conn.strength;
            }
            return { thread, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.thread);
    }
    /**
     * Calculates destiny-based luck modifier
     */
    getDestinyLuckModifier() {
        const influence = this.getTotalDestinyInfluence();
        return (influence.overallStrength / 100) * 0.1; // Max 10% luck modifier
    }
    /**
     * Gets a summary of the player's destiny web
     */
    getDestinySummary() {
        const activeThreads = this.getActiveThreads();
        const totalStrength = activeThreads.reduce((sum, thread) => sum + thread.strength, 0);
        const totalFatePoints = activeThreads.reduce((sum, thread) => sum + thread.fatePoints, 0);
        const themes = {};
        for (const thread of activeThreads) {
            for (const connection of thread.connections) {
                themes[connection.type] = (themes[connection.type] || 0) + 1;
            }
        }
        const dominantThemes = Object.entries(themes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([theme]) => theme);
        return {
            threadCount: activeThreads.length,
            averageStrength: activeThreads.length > 0 ? totalStrength / activeThreads.length : 0,
            totalFatePoints,
            dominantThemes
        };
    }
}
exports.DestinySystem = DestinySystem;
