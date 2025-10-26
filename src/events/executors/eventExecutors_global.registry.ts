import { EventExecutor } from "../../../utils/types";
import { epochalTournamentExecutor, forcedAscensionExecutor, global_check_alignment_unlocks, global_alignment_unlocks_combined } from "./eventExecutors_global";

export const globalExecutors: Record<string, EventExecutor> = {
  "global_epochal_tournament": epochalTournamentExecutor,
  "global_forced_ascension": forcedAscensionExecutor
  ,"global_check_alignment_unlocks": global_check_alignment_unlocks
  ,"global_alignment_unlocks_combined": global_alignment_unlocks_combined
};
