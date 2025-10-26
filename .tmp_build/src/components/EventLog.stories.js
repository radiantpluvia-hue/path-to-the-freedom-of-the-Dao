"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const EventLog_1 = __importDefault(require("./EventLog"));
const useGameStore_1 = require("../store/useGameStore");
exports.default = {
    title: 'Components/EventLog',
    component: EventLog_1.default,
};
const Template = (args) => {
    // Seed some events for the story
    const s = useGameStore_1.useGameStore.getState();
    if (!s.eventLog || s.eventLog.length === 0) {
        // Story-only helper: directly mutate the store for demo purposes
        s.setState({ eventLog: ['Welcome to the game', 'You gained 10 XP', 'You found a relic'] });
    }
    return (0, jsx_runtime_1.jsx)(EventLog_1.default, { ...args });
};
exports.Default = Template.bind({});
exports.Default.args = { maxVisible: 10 };
