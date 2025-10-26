"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarmaSystem = void 0;
const rng_1 = require("../utils/rng");
class KarmaSystem {
    constructor(narrativeEngine) {
        this.narrativeEngine = narrativeEngine;
    }
    /**
     * Adds a karma event to the player's karma history
     */
    addKarmaEvent(type, value, description, source, consequences) {
        const rng = (0, rng_1.getRng)();
        const event = {
            id: `karma_${Date.now()}_${Math.floor(rng() * 0x100000).toString(36).substr(0, 7)}`,
            timestamp: Date.now(),
            type,
            value,
            description,
            source,
            consequences
        };
        this.narrativeEngine.karmaHistory.push(event);
        return event;
    }
    /**
     * Calculates the player's current karmic balance
     */
    getKarmicBalance() {
        return this.narrativeEngine.karmaHistory.reduce((balance, event) => {
            switch (event.type) {
                case 'good':
                    return balance + event.value;
                case 'evil':
                    return balance - event.value;
                case 'neutral':
                default:
                    return balance;
            }
        }, 0);
    }
    /**
     * Gets the player's karmic alignment based on their balance
     */
    getKarmicAlignment() {
        const _balance = this.getKarmicBalance();
        if (_balance >= 1000)
            return 'saintly';
        if (_balance >= 100)
            return 'virtuous';
        if (_balance <= -1000)
            return 'demonic';
        if (_balance <= -100)
            return 'sinful';
        return 'neutral';
    }
    /**
     * Applies karma consequences based on recent events
     */
    applyKarmaConsequences(player) {
        let newPlayer = { ...player };
        // Check for recent karma events that haven't had consequences applied
        const recentEvents = this.narrativeEngine.karmaHistory.filter((event) => Date.now() - event.timestamp < 24 * 60 * 60 * 1000); // Last 24 hours
        for (const event of recentEvents) {
            if (event.consequences) {
                for (const consequence of event.consequences) {
                    newPlayer = this.applyKarmaConsequence(newPlayer, consequence);
                }
            }
        }
        return newPlayer;
    }
    /**
     * Applies a single karma consequence to the player
     */
    applyKarmaConsequence(player, consequence) {
        const newPlayer = { ...player };
        switch (consequence.type) {
            case 'buff':
                // Apply buff effects (would integrate with BuffSystem)
                if (consequence.effect.stats) {
                    newPlayer.stats = { ...newPlayer.stats };
                    for (const [stat, value] of Object.entries(consequence.effect.stats)) {
                        if (typeof value === 'number') {
                            newPlayer.stats[stat] = (newPlayer.stats[stat] || 0) + value;
                        }
                    }
                }
                break;
            case 'debuff':
                // Apply debuff effects
                if (consequence.effect.stats) {
                    newPlayer.stats = { ...newPlayer.stats };
                    for (const [stat, value] of Object.entries(consequence.effect.stats)) {
                        if (typeof value === 'number') {
                            newPlayer.stats[stat] = Math.max(1, (newPlayer.stats[stat] || 0) - value);
                        }
                    }
                }
                break;
            case 'event':
                // Trigger narrative events (would integrate with StorySystem)
                // This is a placeholder for event triggering logic
                break;
            case 'opportunity':
                // Grant opportunities (would integrate with QuestSystem)
                break;
            case 'threat':
                // Create threats (would integrate with RivalSystem)
                break;
        }
        return newPlayer;
    }
    /**
     * Checks if the player has karmic debt that needs to be resolved
     */
    hasKarmicDebt() {
        return this.getKarmicBalance() < -500;
    }
    /**
     * Checks if the player has significant karmic credit
     */
    hasKarmicCredit() {
        return this.getKarmicBalance() > 500;
    }
    /**
     * Gets karma events within a time range
     */
    getKarmaEventsInRange(startTime, endTime) {
        return this.narrativeEngine.karmaHistory.filter((event) => event.timestamp >= startTime && event.timestamp <= endTime);
    }
    /**
     * Gets the most significant karma events
     */
    getSignificantKarmaEvents(limit = 10) {
        return this.narrativeEngine.karmaHistory
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(0, limit);
    }
    /**
     * Calculates karmic influence on various game aspects
     */
    getKarmicInfluence() {
        const alignment = this.getKarmicAlignment();
        let cultivationModifier = 0;
        let relationshipModifier = 0;
        let luckModifier = 0;
        let tribulationSeverity = 1;
        switch (alignment) {
            case 'saintly':
                cultivationModifier = 0.15;
                relationshipModifier = 0.2;
                luckModifier = 0.1;
                tribulationSeverity = 0.8;
                break;
            case 'virtuous':
                cultivationModifier = 0.08;
                relationshipModifier = 0.1;
                luckModifier = 0.05;
                tribulationSeverity = 0.9;
                break;
            case 'neutral':
                // No modifiers
                break;
            case 'sinful':
                cultivationModifier = -0.08;
                relationshipModifier = -0.1;
                luckModifier = -0.05;
                tribulationSeverity = 1.1;
                break;
            case 'demonic':
                cultivationModifier = -0.15;
                relationshipModifier = -0.2;
                luckModifier = -0.1;
                tribulationSeverity = 1.2;
                break;
        }
        return {
            cultivationModifier,
            relationshipModifier,
            luckModifier,
            tribulationSeverity
        };
    }
}
exports.KarmaSystem = KarmaSystem;
