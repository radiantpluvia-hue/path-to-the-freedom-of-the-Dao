import { GameState, HeavensListEntry } from "../utils/types";
import { epochalTournamentExecutor, shouldRunEpochTournament } from "../src/events/executors/eventExecutors_global";

const baseState: GameState = {
  player: {
    name: "MC",
    realm: 5,
    level: 40,
    stats: { hp: 1000, qi: 1000, atk: 200, def: 150, speed: 120 },
    qi: 1000,
    daoHeart: 20,
    manuals: [],
    inventory: [],
    reputation: { world: 0 },
    karma: 10,
    combatPower: 1200
  },
  world: {
    day: 20000, flags: {
      knownProdigies: [
        { id: "n1", name: "Dragon Spear Heir", rank: 0, combatPower: 1300, karma: 5, fame: 30 },
        { id: "n2", name: "Moonlit Saber Saint", rank: 0, combatPower: 1150, karma: 25, fame: 50 },
        { id: "n3", name: "Silent Lotus", rank: 0, combatPower: 1100, karma: 60, fame: 10 }
      ] as any
    }, factions: {}
  }
};

describe("Epochal Heavenly Assembly", () => {
  it("should trigger on 10,000-year cadence", () => {
    expect(shouldRunEpochTournament(baseState)).toBe(true);
  });

  it("runs, picks a champion, and updates heavens list", () => {
    const result = epochalTournamentExecutor(JSON.parse(JSON.stringify(baseState)));
    const champ = result.world.flags["epochalTournament.champion"];
    expect(champ).toBeDefined();
    expect(result.world.heavensList && result.world.heavensList.length > 0).toBe(true);
    expect(result.world.lastEpochTournamentYear).toBe(result.world.day);
  });
});
