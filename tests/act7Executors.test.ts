import { act7EventExecutors } from "../utils/eventExecutors_act7";
import { GameState } from "../utils/types";

const baseState: GameState = {
  player: {
    name: "Test",
    realm: 5,
    level: 30,
    stats: { hp: 100, qi: 500, atk: 50, def: 40, speed: 30 },
    qi: 500,
    daoHeart: 10,
    manuals: [],
    inventory: [],
    reputation: {}
  },
  world: { day: 1, flags: {}, factions: {} }
};

describe("Act7 executors", () => {
  it("registry contains 30 keys", () => {
    expect(Object.keys(act7EventExecutors).length).toBe(30);
  });

  it("first event executor mutates state", () => {
    const exec = act7EventExecutors["act7_event_1"];
    const result = exec(baseState);
    expect(result.player.inventory.length).toBeGreaterThan(0);
    expect(result.player.inventory[0].id).toBe("celestial_manual");
  });
});
