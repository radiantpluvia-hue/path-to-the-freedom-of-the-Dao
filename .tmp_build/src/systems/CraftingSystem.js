"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CraftingSystem = void 0;
const craftingStations_1 = require("../data/craftingStations");
class CraftingSystem {
    constructor(recipes) {
        this.recipes = new Map(recipes.map(r => [r.id, r]));
    }
    getRecipe(id) {
        return this.recipes.get(id);
    }
    getAvailableRecipes(player) {
        const available = [];
        const discovered = new Set(player.discoveredRecipes || []);
        for (const recipe of this.recipes.values()) {
            const skill = player.skills[recipe.skill];
            // Recipe is available if it's not secret, or if it is secret and has been discovered.
            if (skill && skill.level >= recipe.requiredLevel && (!recipe.isSecret || discovered.has(recipe.id))) {
                available.push(recipe);
            }
        }
        return available;
    }
    canCraft(recipeId, player) {
        const recipe = this.getRecipe(recipeId);
        if (!recipe)
            return { can: false, reason: 'Recipe does not exist.' };
        const skill = player.skills[recipe.skill];
        if (!skill || skill.level < recipe.requiredLevel) {
            return { can: false, reason: `Requires ${String(recipe.skill)} level ${recipe.requiredLevel}.` };
        }
        for (const ingredient of recipe.ingredients) {
            // Check inventory for items with a matching itemId. This supports multi-stage crafting.
            // Note: This assumes all inventory items that are ingredients have a consistent `itemId` property.
            const itemCount = player.inventory.filter((i) => i.itemId === ingredient.itemId).length;
            if (itemCount < ingredient.quantity) {
                return { can: false, reason: `Missing ingredient: ${ingredient.itemId}.` };
            }
        }
        return { can: true, reason: '' };
    }
    craft(recipeId, player, stationId) {
        const canCraftCheck = this.canCraft(recipeId, player);
        if (!canCraftCheck.can) {
            return { success: false, critical: 'none', message: canCraftCheck.reason, expGained: 0 };
        }
        const recipe = this.getRecipe(recipeId);
        const skill = player.skills[recipe.skill];
        const station = stationId ? craftingStations_1.stationsById.get(stationId) : undefined;
        // Apply station bonuses if applicable
        const stationSuccessBonus = (station && (station.skill === 'all' || station.skill === recipe.skill)) ? station.bonuses.successChance || 0 : 0;
        const stationQualityBonus = (station && (station.skill === 'all' || station.skill === recipe.skill)) ? station.bonuses.qualityChance || 0 : 0;
        const stationExpMultiplier = (station && (station.skill === 'all' || station.skill === recipe.skill)) ? station.bonuses.expGainMultiplier || 1 : 1;
        const stationMessage = station ? ` Using the ${station.name} provided a bonus!` : '';
        // Calculate success chance
        const skillBonus = (skill.level - recipe.requiredLevel) * 0.025; // 2.5% bonus per level above requirement
        const successChance = Math.min(1, recipe.baseSuccessChance + skillBonus + stationSuccessBonus);
        if (Math.random() > successChance) {
            // Check for critical failure (e.g., lose extra ingredients)
            if (Math.random() < 0.1) {
                return { success: false, critical: 'failure', message: 'Critical failure! The cauldron exploded, destroying the ingredients.', expGained: 0 };
            }
            return { success: false, critical: 'none', message: 'Crafting failed. The materials were wasted.', expGained: 0 };
        }
        // --- Success ---
        let qualityIndex = 0; // 0: Low, 1: Medium, 2: High
        const qualityRoll = Math.random() + (skill.level * 0.01) + stationQualityBonus; // Roll with skill and station bonus
        if (qualityRoll > 0.95)
            qualityIndex = 2; // High quality
        else if (qualityRoll > 0.6)
            qualityIndex = 1; // Medium quality
        const quality = recipe.qualityTiers[qualityIndex];
        const craftedItem = {
            ...recipe.output,
            name: `${quality} ${recipe.output.name}`,
            quality: quality,
        };
        // Check for critical success (e.g., double yield or max quality)
        if (Math.random() < 0.05) {
            craftedItem.quantity = (craftedItem.quantity || 1) * 2;
            return { success: true, critical: 'success', item: craftedItem, message: `Critical success! You feel enlightened and create a superior product!${stationMessage}`, expGained: recipe.expGain * 2 * stationExpMultiplier };
        }
        return { success: true, critical: 'none', item: craftedItem, message: `Success! You crafted a ${craftedItem.name}.${stationMessage}`, expGained: recipe.expGain * stationExpMultiplier };
    }
    experiment(ingredients, player) {
        if (ingredients.length === 0) {
            return { success: false, message: 'You must add ingredients to experiment.', expGained: 0 };
        }
        const providedIngredients = new Map(ingredients.map(i => [i.itemId, i.quantity]));
        for (const recipe of this.recipes.values()) {
            // Skip if already discovered
            if (player.discoveredRecipes?.includes(recipe.id))
                continue;
            const requiredIngredients = new Map(recipe.ingredients.map(i => [i.itemId, i.quantity]));
            if (providedIngredients.size !== requiredIngredients.size)
                continue;
            let match = true;
            for (const [itemId, quantity] of requiredIngredients.entries()) {
                if (providedIngredients.get(itemId) !== quantity) {
                    match = false;
                    break;
                }
            }
            if (match) {
                // Success! Recipe discovered.
                const skill = player.skills[recipe.skill];
                const expGained = skill ? recipe.expGain * 1.5 : 0; // Bonus EXP for discovery
                return { success: true, discoveredRecipeId: recipe.id, message: `Enlightenment strikes! You have discovered the recipe for ${recipe.name}!`, expGained };
            }
        }
        // Failure
        const expGained = Math.max(1, Math.floor(ingredients.length)); // Small EXP gain for trying
        return { success: false, message: 'The ingredients react, but fizzle into a useless residue.', expGained };
    }
}
exports.CraftingSystem = CraftingSystem;
