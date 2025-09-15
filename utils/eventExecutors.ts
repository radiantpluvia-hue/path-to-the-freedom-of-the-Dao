import { GameState, EventExecutor } from "./types";

// eventExecutors.ts
export const eventExecutors: Record<string, EventExecutor> = {
  sectSchism1: (gs: GameState) => {
    // Sect schism logic
    gs.world.flags.sectSchismStarted = true;
    return gs;
  },
  councilSeat1: (gs: GameState) => {
    // Council seat logic
    gs.player.councilSeats = (gs.player.councilSeats || 0) + 1;
    return gs;
  },
  bloodlineAwakening1: (gs: GameState) => {
    // Bloodline awakening logic
    if (gs.player.bloodline) {
      (gs.player.bloodline as any).active = true;
    }
    return gs;
  },
  artifactEnchant1: (gs: GameState) => {
    // Artifact enchantment logic
    const ancientSword = gs.player.inventory.find(item => item.name === 'Ancient Sword');
    if (ancientSword) {
      gs.player.inventory.push({ id: 'enchanted_sword', name: 'Enchanted Sword', qty: 1 });
    }
    return gs;
  },
  warMode1: (gs: GameState) => {
    // War mode logic
    gs.world.flags.sectAtWar = true;
    return gs;
  },
  tribulation20: (gs: GameState, tribulationResolver?: any) => {
    // Tribulation 20 logic
    return tribulationResolver ? tribulationResolver(gs) : gs;
  }
};
