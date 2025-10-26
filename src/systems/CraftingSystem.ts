import { PlayerState as Player } from '../types';
import { stationsById } from '../data/craftingStations';
import { roll } from '../utils/rng';
import { reportMissionObjectiveProgress } from './MissionSystem';

export interface Ingredient {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  skill: keyof Player['skills'];
  isSecret?: boolean;
  requiredLevel: number;
  ingredients: Ingredient[];
  output: {
    itemId: string;
    name:string;
    type: 'pill' | 'elixir' | 'weapon' | 'armor' | 'artifact';
    quantity: number;
    effects: Record<string, any>;
    uniqueProperties?: { specialEffectId: string; description: string; [key: string]: any };
  };
  baseSuccessChance: number;
  qualityTiers: [string, string, string]; // e.g., [Low, Medium, High]
  expGain: number;
}

export interface CraftingResult {
  success: boolean;
  critical: 'success' | 'failure' | 'none';
  item?: any; // The crafted item object
  message: string;
  expGained: number;
}

export interface ExperimentResult {
  success: boolean;
  discoveredRecipeId?: string;
  message: string;
  expGained: number;
}

export class CraftingSystem {
  private recipes: Map<string, Recipe>;
  private gameStore?: any;

  constructor(recipes: Recipe[], gameStore?: any) {
    this.recipes = new Map(recipes.map(r => [r.id, r]));
    this.gameStore = gameStore;
  }

  public getRecipe(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  public getAvailableRecipes(player: Player): Recipe[] {
    const available: Recipe[] = [];
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

  public canCraft(recipeId: string, player: Player): { can: boolean; reason: string } {
    const recipe = this.getRecipe(recipeId);
    if (!recipe) return { can: false, reason: 'Recipe does not exist.' };

    const skill = player.skills[recipe.skill];
    if (!skill || skill.level < recipe.requiredLevel) {
      return { can: false, reason: `Requires ${String(recipe.skill)} level ${recipe.requiredLevel}.` };
    }

    for (const ingredient of recipe.ingredients) {
      // Check inventory for items with a matching itemId. This supports multi-stage crafting.
      // Note: This assumes all inventory items that are ingredients have a consistent `itemId` property.
      const itemCount = player.inventory.filter((i: any) => i.itemId === ingredient.itemId).length;
      if (itemCount < ingredient.quantity) {
        return { can: false, reason: `Missing ingredient: ${ingredient.itemId}.` };
      }
    }

    return { can: true, reason: '' };
  }

  public craft(recipeId: string, player: Player, stationId?: string | null): CraftingResult {
    const canCraftCheck = this.canCraft(recipeId, player);
    if (!canCraftCheck.can) {
      return { success: false, critical: 'none', message: canCraftCheck.reason, expGained: 0 };
    }

    const recipe = this.getRecipe(recipeId);
    if (!recipe) {
      return { success: false, critical: 'none', message: 'Recipe missing.', expGained: 0 };
    }
    const skill = player.skills[recipe.skill];
    if (!skill) {
      return { success: false, critical: 'none', message: `Missing required skill ${String(recipe.skill)}.`, expGained: 0 };
    }
    const station = stationId ? stationsById.get(stationId) : undefined;

    // Apply station bonuses if applicable
    const stationSuccessBonus = (station && (station.skill === 'all' || station.skill === recipe.skill)) ? station.bonuses.successChance || 0 : 0;
    const stationQualityBonus = (station && (station.skill === 'all' || station.skill === recipe.skill)) ? station.bonuses.qualityChance || 0 : 0;
    const stationExpMultiplier = (station && (station.skill === 'all' || station.skill === recipe.skill)) ? station.bonuses.expGainMultiplier || 1 : 1;

    const stationMessage = station ? ` Using the ${station.name} provided a bonus!` : '';

    // Calculate success chance
    const skillBonus = (skill.level - recipe.requiredLevel) * 0.025; // 2.5% bonus per level above requirement
    const successChance = Math.min(1, recipe.baseSuccessChance + skillBonus + stationSuccessBonus);

    // Roll success deterministically using player's RNG context
    if (roll(player) > successChance) {
      // Check for critical failure (e.g., lose extra ingredients)
      if (roll(player) < 0.1) {
        return { success: false, critical: 'failure', message: 'Critical failure! The cauldron exploded, destroying the ingredients.', expGained: 0 };
      }
      return { success: false, critical: 'none', message: 'Crafting failed. The materials were wasted.', expGained: 0 };
    }

    // --- Success ---
    let qualityIndex = 0; // 0: Low, 1: Medium, 2: High
  const qualityRoll = roll(player) + (skill.level * 0.01) + stationQualityBonus; // Roll with skill and station bonus
    if (qualityRoll > 0.95) qualityIndex = 2; // High quality
    else if (qualityRoll > 0.6) qualityIndex = 1; // Medium quality

    const quality = recipe.qualityTiers[qualityIndex];
    const craftedItem = {
      ...recipe.output,
      name: `${quality} ${recipe.output.name}`,
      quality: quality,
    };

    // Check for critical success (e.g., double yield or max quality)
    if (roll(player) < 0.05) {
      craftedItem.quantity = (craftedItem.quantity || 1) * 2;
      return { success: true, critical: 'success', item: craftedItem, message: `Critical success! You feel enlightened and create a superior product!${stationMessage}`, expGained: recipe.expGain * 2 * stationExpMultiplier };
    }

    return { success: true, critical: 'none', item: craftedItem, message: `Success! You crafted a ${craftedItem.name}.${stationMessage}`, expGained: recipe.expGain * stationExpMultiplier };
  }

  /**
   * Notify that an item was crafted; used to update missions that target crafted item ids.
   */
  public notifyItemCrafted(itemId: string) {
    // Prefer an injected store when available (easier for tests). Fall back to mocked module or global.
    try {
      if (typeof reportMissionObjectiveProgress !== 'function') return;

      let state: any = null;

      // 1) instance-injected store: support Zustand-like getState, or a plain state object, or hook
      if (this.gameStore) {
        const gs = this.gameStore;
        if (typeof gs.getState === 'function') state = gs.getState();
        else if (typeof gs === 'function') state = gs();
        else state = gs;
      }

      // 2) module mock (tests often mock '@/store/useGameStore')
      if (!state) {
        try {
          const mod = require('@/store/useGameStore');
          const useFn = mod && mod.useGameStore ? mod.useGameStore : mod;
          state = useFn && typeof useFn.getState === 'function' ? useFn.getState() : (typeof useFn === 'function' ? useFn() : null);
        } catch (e) { /* ignore */ }
      }

      // 3) global fallback (legacy tests/systems)
      if (!state) state = (globalThis as any).gameStore;

      const story = state && state.story;
      if (!story || !Array.isArray(story.activeRandomMissions)) return;

      for (const m of story.activeRandomMissions) {
        if (!m.objectives) continue;
        for (let i = 0; i < m.objectives.length; i++) {
          const obj = m.objectives[i];
          if (obj && obj.target && obj.target === itemId) {
            try { reportMissionObjectiveProgress(m.id, i, 1); } catch (e) { /* ignore */ }
          }
        }
      }
    } catch (e) { /* ignore */ }
  }

  public experiment(ingredients: Ingredient[], player: Player): ExperimentResult {
    if (ingredients.length === 0) {
      return { success: false, message: 'You must add ingredients to experiment.', expGained: 0 };
    }

    const providedIngredients = new Map(ingredients.map(i => [i.itemId, i.quantity]));

    for (const recipe of this.recipes.values()) {
      // Skip if already discovered
      if (player.discoveredRecipes?.includes(recipe.id)) continue;

      const requiredIngredients = new Map(recipe.ingredients.map(i => [i.itemId, i.quantity]));

      if (providedIngredients.size !== requiredIngredients.size) continue;

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