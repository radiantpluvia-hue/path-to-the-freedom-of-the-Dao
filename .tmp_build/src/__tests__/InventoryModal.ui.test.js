"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
// Note: jest-dom assertions are available in the test environment via project setup
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
// Install the mocked store and then import the component under test
const { useGameStoreMock, setUIProperty } = (0, mockUseGameStore_1.mockUseGameStore)({
    ui: { currentScreen: 'game', showInventoryModal: false },
    player: {
        inventory: [],
        spiritStones: { low: 0, mid: 0, high: 0 },
        hp: 100,
        maxHp: 100,
        currentQi: 0,
        qiRequired: 100,
        cultivationPower: 0,
        insight: 0,
        karma: 0,
        yuan: 0,
        stats: { atk: 0, def: 0, speed: 0 }
    },
    eventLog: [],
    realms: { default: { name: 'Default Realm' } },
    world: { currentWorldType: 'mortal', flags: { expelledFrom: false } },
    // Minimal system stubs required by GameInterface
    getQuestsByType: (_type) => [],
    getActiveEnhancedQuests: () => [],
    checkEnhancedQuestCompletion: () => ({ completed: [] }),
    checkDailyReset: () => { },
    requestSectMission: () => { },
    startRivalEncounter: () => { },
    startCombatWithRival: () => { },
    updateObjectiveProgress: () => { },
    clearQuestCompletionNotification: () => { },
    addEventLog: () => { },
    saveGame: () => { },
    loadGame: () => { },
});
// Import after mock installed
const GameInterface_1 = require("@/components/game/GameInterface");
describe('Inventory modal behavior', () => {
    it('opens inventory modal when Inventory button is clicked', async () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(GameInterface_1.GameInterface, {}));
        // Find the Game Management Inventory button (has emoji prefix)
        const invBtn = react_1.screen.getByText(/🎒\s*Inventory/);
        expect(invBtn).toBeInTheDocument();
        // Click it
        react_1.fireEvent.click(invBtn);
        // The click should request the UI to show the inventory modal via setUIProperty
        expect(setUIProperty).toHaveBeenCalledWith('showInventoryModal', true);
    });
});
