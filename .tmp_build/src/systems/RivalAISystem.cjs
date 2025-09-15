"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RivalAISystem = void 0;
class RivalAISystem {
    constructor() {
        // Data structures for AI learning
        this.combatHistory = [];
        this.learningData = new Map();
        this.maxHistorySize = 50; // Keep last 50 combat records
    }
    makeCombatDecision(rival, _player, _situation) {
        const rivalHealthPercent = _situation.rivalHp / rival.stats.hp;
        const playerHealthPercent = _situation.playerHp / _player.stats.hp;
        // Personality-based decision making
        switch (rival.personality) {
            case 'aggressive':
                return this.makeAggressiveDecision(rival, _player, _situation, rivalHealthPercent, playerHealthPercent);
            case 'cunning':
                return this.makeCunningDecision(rival, _player, _situation, rivalHealthPercent, playerHealthPercent);
            case 'honorable':
                return this.makeHonorableDecision(rival, _player, _situation, rivalHealthPercent, playerHealthPercent);
            case 'treacherous':
                return this.makeTreacherousDecision(rival, _player, _situation, rivalHealthPercent, playerHealthPercent);
            default:
                return this.makeNeutralDecision(rival, _player, _situation, rivalHealthPercent, playerHealthPercent);
        }
    }
    makeAggressiveDecision(rival, _player, _situation, _rivalHealthPercent, _playerHealthPercent) {
        // Always attack if possible
        const attackTechnique = rival.techniques.find(t => t.includes('attack'));
        if (attackTechnique) {
            return { action: 'use_technique', technique: attackTechnique };
        }
        return { action: 'attack' };
    }
    makeCunningDecision(rival, _player, _situation, _rivalHealthPercent, _playerHealthPercent) {
        // Use debuffs if the player is healthy
        if (_playerHealthPercent > 0.7) {
            const debuffTechnique = rival.techniques.find(t => t.includes('debuff'));
            if (debuffTechnique) {
                return { action: 'use_technique', technique: debuffTechnique };
            }
        }
        // Attack if the player is weak
        return { action: 'attack' };
    }
    makeHonorableDecision(rival, _player, _situation, _rivalHealthPercent, _playerHealthPercent) {
        // Heal if low on health
        if (_rivalHealthPercent < 0.3) {
            const healTechnique = rival.techniques.find(t => t.includes('heal'));
            if (healTechnique) {
                return { action: 'use_technique', technique: healTechnique };
            }
        }
        // Defend if the player is strong
        if (_playerHealthPercent > 0.7) {
            return { action: 'defend' };
        }
        // Attack otherwise
        return { action: 'attack' };
    }
    makeTreacherousDecision(rival, _player, _situation, _rivalHealthPercent, _playerHealthPercent) {
        // Use high-damage attacks if the player is weak
        if (_playerHealthPercent < 0.5) {
            const highDamageTechnique = rival.techniques.find(t => t.includes('high_damage'));
            if (highDamageTechnique) {
                return { action: 'use_technique', technique: highDamageTechnique };
            }
        }
        // Retreat if low on health
        if (_rivalHealthPercent < 0.2) {
            return { action: 'retreat' };
        }
        // Attack otherwise
        return { action: 'attack' };
    }
    makeNeutralDecision(rival, _player, _situation, _rivalHealthPercent, _playerHealthPercent) {
        // Attack if health is high, defend if low
        if (_rivalHealthPercent > 0.5) {
            return { action: 'attack' };
        }
        else {
            return { action: 'defend' };
        }
    }
    // Allow external systems to inform the AI about combat results so it can learn or adjust state.
    recordCombatOutcome(rivalId, outcome, rounds = 0, playerStats, rivalStats, playerTechniquesUsed, rivalTechniquesUsed) {
        try {
            // Create combat record
            const record = {
                rivalId,
                outcome,
                rounds,
                timestamp: Date.now(),
                playerStats: playerStats || { hp: 0, qi: 0, techniques: [] },
                rivalStats: rivalStats || { hp: 0, qi: 0, techniques: [] },
                playerTechniquesUsed: playerTechniquesUsed || [],
                rivalTechniquesUsed: rivalTechniquesUsed || []
            };
            // Add to history
            this.combatHistory.push(record);
            // Maintain history size limit
            if (this.combatHistory.length > this.maxHistorySize) {
                this.combatHistory = this.combatHistory.slice(-this.maxHistorySize);
            }
            // Update learning data
            this.updateLearningData(record);
            // Log for debugging (can be removed in production)
            console.log(`AI Learning: Recorded ${outcome} for ${rivalId} in ${rounds} rounds`);
        }
        catch (e) {
            // Swallow errors to avoid cascading failures from optional AI logic
            return;
        }
    }
    updateLearningData(record) {
        const { rivalId, outcome, rounds, playerTechniquesUsed, rivalTechniquesUsed } = record;
        // Get or create learning data for this rival
        let data = this.learningData.get(rivalId);
        if (!data) {
            data = {
                rivalId,
                totalCombats: 0,
                victories: 0,
                defeats: 0,
                averageRounds: 0,
                preferredTechniques: {},
                playerTechniquePatterns: {},
                adaptiveStrategies: {
                    aggressive: 0,
                    defensive: 0,
                    balanced: 0
                },
                lastUpdate: Date.now()
            };
            this.learningData.set(rivalId, data);
        }
        // Update basic stats
        data.totalCombats++;
        if (outcome === 'victory') {
            data.victories++;
        }
        else {
            data.defeats++;
        }
        // Update average rounds
        const oldTotalRounds = data.averageRounds * (data.totalCombats - 1);
        data.averageRounds = (oldTotalRounds + rounds) / data.totalCombats;
        // Update technique preferences
        rivalTechniquesUsed.forEach(technique => {
            if (!data.preferredTechniques[technique]) {
                data.preferredTechniques[technique] = { used: 0, success: 0 };
            }
            data.preferredTechniques[technique].used++;
            if (outcome === 'victory') {
                data.preferredTechniques[technique].success++;
            }
        });
        // Update player technique patterns
        playerTechniquesUsed.forEach(technique => {
            data.playerTechniquePatterns[technique] = (data.playerTechniquePatterns[technique] || 0) + 1;
        });
        // Update adaptive strategies based on outcome
        this.updateAdaptiveStrategies(data, record);
        data.lastUpdate = Date.now();
    }
    updateAdaptiveStrategies(data, record) {
        const { outcome, rounds, playerStats, rivalStats } = record;
        // Analyze combat style based on health ratios and rounds
        const playerHealthRatio = playerStats.hp / (playerStats.hp + rivalStats.hp);
        const rivalHealthRatio = rivalStats.hp / (playerStats.hp + rivalStats.hp);
        if (outcome === 'victory') {
            // Successful strategy - reinforce it
            if (rounds <= 3) {
                // Quick victory - aggressive worked
                data.adaptiveStrategies.aggressive += 0.1;
            }
            else if (rivalHealthRatio > playerHealthRatio) {
                // Won while taking more damage - defensive worked
                data.adaptiveStrategies.defensive += 0.1;
            }
            else {
                // Balanced approach worked
                data.adaptiveStrategies.balanced += 0.1;
            }
        }
        else {
            // Unsuccessful strategy - try different approach
            if (rounds <= 3) {
                // Quick defeat - aggressive failed, try defensive
                data.adaptiveStrategies.aggressive = Math.max(0, data.adaptiveStrategies.aggressive - 0.05);
                data.adaptiveStrategies.defensive += 0.05;
            }
            else if (rivalHealthRatio < playerHealthRatio) {
                // Lost while dealing more damage - aggressive failed
                data.adaptiveStrategies.aggressive = Math.max(0, data.adaptiveStrategies.aggressive - 0.05);
                data.adaptiveStrategies.balanced += 0.05;
            }
            else {
                // Other cases - try aggressive
                data.adaptiveStrategies.aggressive += 0.05;
                data.adaptiveStrategies.defensive = Math.max(0, data.adaptiveStrategies.defensive - 0.05);
            }
        }
        // Normalize strategy weights
        const total = data.adaptiveStrategies.aggressive + data.adaptiveStrategies.defensive + data.adaptiveStrategies.balanced;
        if (total > 0) {
            data.adaptiveStrategies.aggressive /= total;
            data.adaptiveStrategies.defensive /= total;
            data.adaptiveStrategies.balanced /= total;
        }
    }
    // Get learning insights for a specific rival
    getLearningData(rivalId) {
        return this.learningData.get(rivalId) || null;
    }
    // Get recommended strategy for a rival based on learning data
    getRecommendedStrategy(rivalId) {
        const data = this.learningData.get(rivalId);
        if (!data || data.totalCombats < 3) {
            return 'balanced'; // Default for new or inexperienced rivals
        }
        const strategies = data.adaptiveStrategies;
        const maxStrategy = Math.max(strategies.aggressive, strategies.defensive, strategies.balanced);
        if (maxStrategy === strategies.aggressive)
            return 'aggressive';
        if (maxStrategy === strategies.defensive)
            return 'defensive';
        return 'balanced';
    }
    // Get most effective techniques for a rival
    getEffectiveTechniques(rivalId, limit = 3) {
        const data = this.learningData.get(rivalId);
        if (!data)
            return [];
        // Sort techniques by success rate
        const techniqueStats = Object.entries(data.preferredTechniques)
            .map(([technique, stats]) => ({
            technique,
            successRate: stats.used > 0 ? stats.success / stats.used : 0,
            totalUsed: stats.used
        }))
            .filter(stat => stat.totalUsed >= 2) // Only consider techniques used at least twice
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, limit);
        return techniqueStats.map(stat => stat.technique);
    }
    // Get player technique patterns for predictive AI
    getPlayerTechniquePatterns(rivalId) {
        const data = this.learningData.get(rivalId);
        return data?.playerTechniquePatterns || {};
    }
    // Get combat history for analysis
    getCombatHistory(rivalId, limit = 10) {
        let history = this.combatHistory;
        if (rivalId) {
            history = history.filter(record => record.rivalId === rivalId);
        }
        return history.slice(-limit);
    }
    // Clear learning data (useful for testing or reset)
    clearLearningData(rivalId) {
        if (rivalId) {
            this.learningData.delete(rivalId);
            this.combatHistory = this.combatHistory.filter(record => record.rivalId !== rivalId);
        }
        else {
            this.learningData.clear();
            this.combatHistory = [];
        }
    }
    // Get AI performance statistics
    getPerformanceStats() {
        const totalCombats = this.combatHistory.length;
        const totalRounds = this.combatHistory.reduce((sum, record) => sum + record.rounds, 0);
        const victories = this.combatHistory.filter(record => record.outcome === 'victory').length;
        return {
            totalCombats,
            averageRounds: totalCombats > 0 ? totalRounds / totalCombats : 0,
            winRate: totalCombats > 0 ? victories / totalCombats : 0,
            learningRivals: this.learningData.size
        };
    }
}
exports.RivalAISystem = RivalAISystem;
