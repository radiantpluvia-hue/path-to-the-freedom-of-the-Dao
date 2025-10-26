"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoiceModal = ChoiceModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const choiceHandler_1 = require("./src/systems/choiceHandler");
const Card_1 = require("@/components/core/Card");
const Button_1 = require("@/components/core/Button");
function ChoiceModal() {
    // Use separate selectors to avoid returning a new object identity each render
    const choiceData = (0, useGameStore_1.useGameStore)(state => state.ui.activeStoryChoice);
    const player = (0, useGameStore_1.useGameStore)(state => state.player);
    const addEventLog = (0, useGameStore_1.useGameStore)(state => state.addEventLog);
    const setUIProperty = (0, useGameStore_1.useGameStore)(state => state.setUIProperty);
    if (!choiceData)
        return null;
    const handleChoice = (choice) => {
        const handler = (0, choiceHandler_1.createDefaultChoiceHandler)();
        const gs = useGameStore_1.useGameStore.getState();
        const { newState, narrative } = handler.handleChoice(gs, choice);
        useGameStore_1.useGameStore.setState(newState);
        addEventLog(choice.narrative || `You chose to "${choice.text}".`);
        if (narrative)
            addEventLog(narrative);
        setUIProperty('activeStoryChoice', undefined);
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                width: 'clamp(300px, 60vw, 600px)',
                maxHeight: '80vh',
                overflowY: 'auto',
            }, children: (0, jsx_runtime_1.jsxs)(Card_1.Card, { title: `📜 ${choiceData.title}`, children: [(0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.5 }, children: choiceData.description }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', flexDirection: 'column', gap: '10px' }, children: choiceData.choices.map(choice => ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleChoice(choice), size: "large", children: choice.text }, choice.text))) })] }) }) }));
}
