"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryEventPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const Button_1 = require("./core/Button");
const Card_1 = require("./core/Card");
const StoryEventPanel = () => {
    const { getAvailableEvents, triggerStoryEvent, makeStoryChoice,
    // addEventLog intentionally not used here
     } = (0, useGameStore_1.useGameStore)();
    const [availableEvents, setAvailableEvents] = (0, react_1.useState)([]);
    const [activeEvent, setActiveEvent] = (0, react_1.useState)(null);
    const [showEventModal, setShowEventModal] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const events = (typeof getAvailableEvents === 'function') ? getAvailableEvents() : [];
        setAvailableEvents(events);
    }, [getAvailableEvents]);
    const handleTriggerEvent = (eventId) => {
        const success = triggerStoryEvent(eventId);
        if (success) {
            const event = availableEvents.find(e => e.id === eventId);
            if (event) {
                setActiveEvent(event);
                setShowEventModal(true);
            }
        }
    };
    const handleMakeChoice = (choiceId) => {
        if (!activeEvent)
            return;
        const success = (typeof makeStoryChoice === 'function') ? makeStoryChoice(activeEvent.id, choiceId) : false;
        if (success) {
            setShowEventModal(false);
            setActiveEvent(null);
            // Refresh available events
            const events = (typeof getAvailableEvents === 'function') ? getAvailableEvents() : [];
            setAvailableEvents(events);
        }
    };
    const closeModal = () => {
        setShowEventModal(false);
        setActiveEvent(null);
    };
    if (availableEvents.length === 0 && !showEventModal) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [availableEvents.length > 0 && ((0, jsx_runtime_1.jsx)(Card_1.Card, { title: "\uD83D\uDCD6 Story Events", children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '10px' }, children: availableEvents.map(event => ((0, jsx_runtime_1.jsxs)("div", { style: {
                            border: '1px solid var(--border)',
                            padding: '10px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 215, 0, 0.05)'
                        }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: 'var(--primary)' }, children: event.title }), (0, jsx_runtime_1.jsx)("p", { style: {
                                    color: 'var(--muted)',
                                    fontSize: '0.85rem',
                                    margin: '5px 0',
                                    lineHeight: 1.4
                                }, children: event.description }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleTriggerEvent(event.id), size: "small", style: { marginTop: '8px' }, children: "Begin Event" })] }, event.id))) }) })), showEventModal && activeEvent && ((0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                        backgroundColor: 'var(--bg-primary)',
                        border: '2px solid var(--border)',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: {
                                        color: 'var(--primary)',
                                        marginBottom: '12px',
                                        fontSize: '1.4rem'
                                    }, children: activeEvent.title }), (0, jsx_runtime_1.jsx)("p", { style: {
                                        color: 'var(--text)',
                                        lineHeight: 1.5,
                                        marginBottom: '20px'
                                    }, children: activeEvent.description })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: {
                                        color: 'var(--secondary)',
                                        marginBottom: '12px',
                                        fontSize: '1.1rem'
                                    }, children: "Choose your response:" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '12px' }, children: activeEvent.choices.map(choice => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            padding: '12px',
                                            backgroundColor: choice.unavailableReason
                                                ? 'rgba(128, 128, 128, 0.1)'
                                                : 'rgba(255, 255, 255, 0.02)'
                                        }, children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '8px' }, children: (0, jsx_runtime_1.jsx)("strong", { style: {
                                                        color: choice.unavailableReason ? 'var(--muted)' : 'var(--text)'
                                                    }, children: choice.text }) }), choice.description && ((0, jsx_runtime_1.jsx)("p", { style: {
                                                    fontSize: '0.85rem',
                                                    color: 'var(--muted)',
                                                    margin: '4px 0 8px 0',
                                                    lineHeight: 1.3
                                                }, children: choice.description })), choice.unavailableReason ? ((0, jsx_runtime_1.jsx)("div", { style: {
                                                    fontSize: '0.8rem',
                                                    color: 'var(--danger)',
                                                    fontStyle: 'italic'
                                                }, children: choice.unavailableReason })) : ((0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleMakeChoice(choice.id), size: "small", style: { marginTop: '4px' }, children: "Choose" }))] }, choice.id))) })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                borderTop: '1px solid var(--border)',
                                paddingTop: '16px'
                            }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: closeModal, variant: "secondary", children: "Cancel" }) })] }) }))] }));
};
exports.StoryEventPanel = StoryEventPanel;
