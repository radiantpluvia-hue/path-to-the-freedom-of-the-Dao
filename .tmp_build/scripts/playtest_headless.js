"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const playtestHelpers_ts_1 = require("../src/test_helpers/playtestHelpers.ts");
(async function run() {
    // This helper should create a fresh store and return actions
    const { store, actions } = await (0, playtestHelpers_ts_1.initializeStoreForPlaytest)();
    console.log('Starting Act 1 playtest...');
    // Simulate Act 1 start: initial player creation
    actions.startNewGame({ name: 'Playtester', seed: 12345 });
    // Unlock mentor (if unlock function exists)
    if (actions.unlockMentor) {
        actions.unlockMentor('mentor_1');
        console.log('Unlocked mentor_1');
    }
    // Advance time and trigger some events
    actions.advanceDays(7);
    // Trigger Act 4 events list (if available)
    if (actions.triggerActEvents) {
        actions.triggerActEvents(4);
        console.log('Triggered Act 4 events');
    }
    const snap = (0, playtestHelpers_ts_1.getStoreSnapshot)(store);
    console.log('Playtest snapshot:', snap.player ? { level: snap.player.level, sect: snap.player.sect } : snap);
})();
