"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TribulationSystem = void 0;
const rng_1 = require("../utils/rng");
const tribulationPatterns_1 = require("../data/tribulationPatterns");
class TribulationSystem {
    constructor() {
        this.patterns = tribulationPatterns_1.TRIBULATION_PATTERNS;
    }
    // Select tribulation pattern based on player characteristics
    selectTribulationPattern(player, realm) {
        const patterns = Object.keys(this.patterns.patterns);
        // Base selection on realm and player traits
        const realmTier = this.getRealmTier(realm);
        const bloodlineTier = this.getBloodlineTier(player.bloodline || 'none');
        // physique tier intentionally unused for now
        // Weight patterns based on player characteristics
        const weights = {};
        patterns.forEach(pattern => {
            let weight = 1.0;
            // Heavenly Thunder - more common for early realms
            if (pattern === 'heavenly_thunder') {
                weight = realmTier < 5 ? 2.0 : 0.5;
            }
            // Heart Demon - scales with mental fortitude
            if (pattern === 'heart_demon_assault') {
                const mentalStrength = player.mentalFortitude || 0;
                weight = Math.max(0.5, Math.min(2.0, mentalStrength / 50));
            }
            // Karmic Retribution - scales with karmic actions
            if (pattern === 'karmic_retribution') {
                const karmicSeeds = player.karmicSeeds || 0;
                weight = Math.max(0.3, Math.min(2.5, karmicSeeds / 10));
            }
            // Dao Chaos - more likely for higher realms
            if (pattern === 'dao_chaos_storm') {
                weight = realmTier > 8 ? 2.0 : 0.3;
            }
            // Bloodline Awakening - scales with bloodline purity
            if (pattern === 'bloodline_awakening') {
                weight = bloodlineTier > 3 ? 2.0 : 0.2;
            }
            weights[pattern] = weight;
        });
        // Select pattern using weighted random
        return this.weightedRandomSelect(weights);
    }
    // Resolve tribulation with pattern-based mechanics
    resolveTribulation(player, patternName, realm) {
        const pattern = this.patterns.patterns[patternName];
        if (!pattern) {
            throw new Error(`Unknown tribulation pattern: ${patternName}`);
        }
        const realmMultiplier = this.patterns.modifiers.realm_scaling[realm] || 1.0;
        const bloodlineMultiplier = this.patterns.modifiers.bloodline_multipliers[player.bloodline || 'none'] || 1.0;
        const physiqueMultiplier = this.patterns.modifiers.physique_multipliers[player.physique || 'none'] || 1.0;
        const totalMultiplier = realmMultiplier * bloodlineMultiplier * physiqueMultiplier;
        let wavesCompleted = 0;
        let totalDamage = 0;
        let totalMentalStress = 0;
        let totalDaoDeviation = 0;
        let success = true;
        const rewards = {
            daoInsight: 0,
            mentalFortitude: 0,
            tribulationResistance: 0
        };
        // Process each wave
        for (const wave of pattern.waves) {
            const scaledWave = this.scaleWave(wave, totalMultiplier);
            // Check if player can withstand this wave
            const canWithstand = this.checkWaveResistance(player, scaledWave, wavesCompleted);
            if (!canWithstand) {
                success = false;
                break;
            }
            // Apply wave effects
            totalDamage += scaledWave.effects.damage;
            totalMentalStress += scaledWave.effects.mentalStress;
            totalDaoDeviation += scaledWave.effects.daoDeviation;
            // Accumulate rewards
            rewards.daoInsight += scaledWave.rewards.daoInsight;
            rewards.mentalFortitude += scaledWave.rewards.mentalFortitude;
            rewards.tribulationResistance += scaledWave.rewards.tribulationResistance;
            wavesCompleted++;
        }
        // Apply completion bonus if successful
        const completionBonus = success ? pattern.completionBonus : undefined;
        // Determine active curses
        const activeCurses = success ? [] : this.selectCurses(pattern.curses, wavesCompleted);
        return {
            success,
            wavesCompleted,
            totalDamage,
            totalMentalStress,
            totalDaoDeviation,
            rewards,
            completionBonus,
            activeCurses
        };
    }
    // Apply tribulation results to player
    applyTribulationResults(player, result) {
        // Apply damage and stress
        player.currentHp = Math.max(0, (player.currentHp || player.stats.hp) - result.totalDamage);
        player.mentalStress = (player.mentalStress || 0) + result.totalMentalStress;
        player.daoDeviation = (player.daoDeviation || 0) + result.totalDaoDeviation;
        // Apply rewards if successful
        if (result.success) {
            player.daoInsight = (player.daoInsight || 0) + result.rewards.daoInsight;
            player.mentalFortitude = (player.mentalFortitude || 0) + result.rewards.mentalFortitude;
            player.tribulationResistance = (player.tribulationResistance || 0) + result.rewards.tribulationResistance;
            // Apply completion bonuses
            if (result.completionBonus) {
                Object.entries(result.completionBonus).forEach(([stat, value]) => {
                    player[stat] = (player[stat] || 0) + value;
                });
            }
        }
        // Apply curses
        if (result.activeCurses.length > 0) {
            player.activeCurses = player.activeCurses || [];
            player.activeCurses.push(...result.activeCurses);
        }
    }
    // Get tribulation preview for UI
    getTribulationPreview(patternName, player, realm) {
        const pattern = this.patterns.patterns[patternName];
        if (!pattern) {
            throw new Error(`Unknown tribulation pattern: ${patternName}`);
        }
        const realmMultiplier = this.patterns.modifiers.realm_scaling[realm] || 1.0;
        const bloodlineMultiplier = this.patterns.modifiers.bloodline_multipliers[player.bloodline || 'none'] || 1.0;
        const physiqueMultiplier = this.patterns.modifiers.physique_multipliers[player.physique || 'none'] || 1.0;
        const totalMultiplier = realmMultiplier * bloodlineMultiplier * physiqueMultiplier;
        // Calculate estimated difficulty
        const maxWave = pattern.waves[pattern.waves.length - 1];
        const scaledDamage = maxWave.damage * totalMultiplier;
        const playerHp = player.currentHp || player.stats.hp;
        let difficulty = 'Easy';
        if (scaledDamage > playerHp * 0.8)
            difficulty = 'Hard';
        else if (scaledDamage > playerHp * 0.5)
            difficulty = 'Medium';
        // Generate preparation recommendations
        const recommendations = [];
        if (scaledDamage > playerHp * 0.3) {
            recommendations.push('Strengthen your physique');
        }
        if (totalMultiplier > 2.0) {
            recommendations.push('Seek protective treasures');
        }
        if (pattern.curses.includes('mental') || pattern.type === 'mental') {
            recommendations.push('Cultivate mental fortitude techniques');
        }
        if (recommendations.length === 0) {
            recommendations.push('Standard tribulation preparation');
        }
        return {
            pattern,
            estimatedDifficulty: difficulty,
            recommendedPreparation: recommendations
        };
    }
    scaleWave(wave, multiplier) {
        return {
            ...wave,
            effects: {
                damage: Math.floor(wave.effects.damage * multiplier),
                mentalStress: Math.floor(wave.effects.mentalStress * multiplier),
                daoDeviation: Math.floor(wave.effects.daoDeviation * multiplier)
            },
            rewards: {
                daoInsight: Math.floor(wave.rewards.daoInsight * multiplier * 0.5), // Rewards scale less than damage
                mentalFortitude: Math.floor(wave.rewards.mentalFortitude * multiplier * 0.5),
                tribulationResistance: Math.floor(wave.rewards.tribulationResistance * multiplier * 0.5)
            }
        };
    }
    checkWaveResistance(player, wave, _wavesCompleted) {
        const playerHp = player.currentHp || player.stats.hp;
        const tribulationResistance = player.tribulationResistance || 0;
        const mentalFortitude = player.mentalFortitude || 0;
        // Base resistance check
        const damageResistance = tribulationResistance * 2;
        const mentalResistance = mentalFortitude * 0.5;
        const effectiveDamage = Math.max(0, wave.effects.damage - damageResistance);
        const effectiveMentalStress = Math.max(0, wave.effects.mentalStress - mentalResistance);
        // Player fails if damage would kill them or mental stress is too high
        return effectiveDamage < playerHp * 0.9 && effectiveMentalStress < 100;
    }
    selectCurses(availableCurses, wavesCompleted) {
        const numCurses = Math.min(wavesCompleted, availableCurses.length);
        const selected = [];
        const rngFn = (0, rng_1.getRng)();
        for (let i = 0; i < numCurses; i++) {
            // choose without replacement deterministically
            const idx = (0, rng_1.randInt)(availableCurses.length, { rng: rngFn });
            selected.push(availableCurses[idx]);
            availableCurses.splice(idx, 1);
        }
        return selected;
    }
    getRealmTier(realm) {
        const realmOrder = [
            'mortal', 'qi_refinement', 'foundation_establishment', 'body_integration',
            'mahayana', 'golden_immortal', 'taiyi_golden_immortal', 'daluo_golden_immortal',
            'soul_transformation', 'void_refinement', 'saint', 'primordial_saint', 'dao',
            'eternal_dao_sovereign', 'infinite_dao_master', 'core_formation', 'nascent_soul',
            'true_immortal', 'quasi_saint', 'dao_ancestor', 'dimension_lord', 'chaos_saint',
            'supreme_dao_origin', 'void_transcendent', 'reality_weaver', 'multiverse_sovereign',
            'omniversal_emperor', 'absolute_existence', 'primordial_chaos_lord', 'eternal_dao_emperor'
        ];
        return realmOrder.indexOf(realm) + 1;
    }
    getBloodlineTier(bloodline) {
        const tiers = ['none', 'mortal', 'earth', 'heaven', 'immortal', 'divine', 'primordial', 'chaos', 'creation', 'destruction', "B"];
        return tiers.indexOf(bloodline);
    }
    getPhysiqueTier(physique) {
        const tiers = ['none', 'mortal', 'earth', 'heaven', 'immortal', 'divine', 'primordial', 'chaos', 'creation', 'destruction', "B"];
        return tiers.indexOf(physique);
    }
    weightedRandomSelect(weights) {
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        const rng = (0, rng_1.getRng)();
        let random = rng() * totalWeight;
        for (const [item, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return item;
            }
        }
        return Object.keys(weights)[0]; // Fallback
    }
}
exports.TribulationSystem = TribulationSystem;
