"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// idempotent stub maker — records runs in state.__meta.eventsRan to avoid changing GameState type
const makeStub = (id) => {
    return (state, _choice) => {
        try {
            state = { ...state };
            (state.__meta || (state.__meta = { eventsRan: [] }));
            if (!state.__meta.eventsRan.includes(id))
                state.__meta.eventsRan.push(id);
        }
        catch (e) {
            // swallow — stub must be safe
        }
        return state;
    };
};
// Import the richer mentor executor implementations when available so we can
// provide real behavior for selected mentor actions while keeping other
// mentor-related executors as safe stubs.
const mentorExecutors_1 = require("../../../utils/mentorExecutors");
const registry = {
    'mentor_hidden_manual_search': makeStub('mentor_hidden_manual_search'),
    'mentor_sabotage_investigation': makeStub('mentor_sabotage_investigation'),
    'mentor_path_declaration': makeStub('mentor_path_declaration'),
    'mentor_private_teaching': makeStub('mentor_private_teaching'),
    'mentor_final_choice': makeStub('mentor_final_choice'),
    'mentor_meditation_training': makeStub('mentor_meditation_training'),
    'mentor_body_refine': makeStub('mentor_body_refine'),
    // Use the real implementation for supervised duels so mentor interactions
    // can grant buffs/training deterministically in tests.
    'mentor_supervised_duel': mentorExecutors_1.mentorExecutors['mentor_supervised_duel'] || makeStub('mentor_supervised_duel'),
    'mentor_tribulation_trial': makeStub('mentor_tribulation_trial'),
    'mentor_escort_relic': makeStub('mentor_escort_relic'),
    'merchant_appraisal': makeStub('merchant_appraisal'),
    'hidden_manual': makeStub('hidden_manual'),
    'cave_explore': makeStub('cave_explore')
};
exports.default = registry;
