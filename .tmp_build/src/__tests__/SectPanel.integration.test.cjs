"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const mockUseGameStore_1 = require("../tests/testUtils/mockUseGameStore");
// We'll install the mock before requiring the component to ensure hooks are mocked
jest.resetModules();
test('Request button calls requestSectMission', () => {
    const story = { activeRandomMissions: [], completedQuests: [] };
    const requestSectMission = jest.fn();
    (0, mockUseGameStore_1.mockUseGameStore)({ player: { sect: 's1', inventory: [] }, story, requestSectMission });
    const SectPanel = require('../components/game/SectPanel').default;
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    const reqBtn = react_2.screen.getByText('Request Sect Mission');
    react_2.fireEvent.click(reqBtn);
    expect(requestSectMission).toHaveBeenCalled();
});
test('Accept on an existing mission applies rewards and logs', () => {
    jest.resetModules();
    const story = { activeRandomMissions: [{
                id: 'm-test-1',
                title: 'Test Mission',
                description: 'Collect 1 herb',
                objectives: [{ description: 'Collect herb', progress: 1, target: 1 }],
                reward: { yuan: 42, spiritStones: { low: 2, mid: 0, high: 0 }, items: [{ id: 'minor_treasure', name: 'Minor Treasure' }] }
            }], completedQuests: [] };
    const addEventLog = jest.fn();
    const addToInventory = jest.fn();
    const player = { sect: 's1', inventory: [], yuan: 0, spiritStones: { low: 0, mid: 0, high: 0 } };
    const acceptSectMission = jest.fn((missionId) => {
        const m = story.activeRandomMissions.find((m) => m.id === missionId);
        if (m) {
            player.yuan += m.reward.yuan || 0;
            player.spiritStones.low += (m.reward.spiritStones?.low || 0);
            addToInventory(m.reward.items[0]);
            story.activeRandomMissions = story.activeRandomMissions.filter((x) => x.id !== missionId);
            story.completedQuests.push(missionId);
            addEventLog('Sect mission accepted and rewards applied.');
        }
    });
    (0, mockUseGameStore_1.mockUseGameStore)({ player, story, addEventLog, addToInventory, acceptSectMission });
    const SectPanel = require('../components/game/SectPanel').default;
    (0, react_2.render)(react_1.default.createElement(SectPanel));
    // Mission visible
    expect(react_2.screen.getByText('Test Mission')).toBeTruthy();
    const acceptBtn = react_2.screen.getByText('Accept');
    react_2.fireEvent.click(acceptBtn);
    expect(addToInventory).toHaveBeenCalled();
    expect(addEventLog).toHaveBeenCalledWith('Sect mission accepted and rewards applied.');
});
