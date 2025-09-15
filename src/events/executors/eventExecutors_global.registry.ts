import { EventExecutor } from "../../../utils/types";
import { epochalTournamentExecutor } from "./eventExecutors_global";

export const globalExecutors: Record<string, EventExecutor> = {
  "global_epochal_tournament": epochalTournamentExecutor
};
