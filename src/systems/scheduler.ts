import { GameState } from "../../utils/types";
import { shouldRunEpochTournament } from "../events/executors/eventExecutors_global";
import { globalExecutors } from "../events/executors/eventExecutors_global.registry";

// Call once per in-game “year” or tick that represents a year
export function onYearTick(state: GameState): GameState {
  if (shouldRunEpochTournament(state)) {
    const exec = globalExecutors["global_epochal_tournament"];
    if (exec) return exec(state, { rankCount: 100 });
  }
  return state;
}
