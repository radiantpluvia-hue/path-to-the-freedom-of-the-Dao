"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorDialogueSystem = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button_1 = require("./core/Button");
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
    },
    modal: {
        backgroundColor: 'var(--dark-secondary, #2a2a2a)',
        color: 'var(--light, #f0f0f0)',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        width: '90%',
        border: '1px solid var(--primary-dark, #444)',
    },
    dialogueText: {
        marginBottom: '20px',
        fontSize: '1.1rem',
        fontStyle: 'italic',
        color: 'var(--muted, #aaa)',
        lineHeight: 1.6,
    },
    optionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    optionButton: {
        padding: '12px',
        border: '1px solid var(--primary-dark, #444)',
        borderRadius: '5px',
        backgroundColor: 'var(--dark, #1e1e1e)',
        color: 'var(--light, #f0f0f0)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 0.2s, border-color 0.2s',
    },
};
const MentorDialogueSystem = ({ dialogue, options, onOptionSelect, onClose, }) => {
    return ((0, jsx_runtime_1.jsx)("div", { style: styles.overlay, onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { style: styles.modal, onClick: e => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.dialogueText, children: ["\"", dialogue, "\""] }), (0, jsx_runtime_1.jsx)("div", { style: styles.optionsContainer, children: options.map(option => ((0, jsx_runtime_1.jsx)("button", { onClick: () => onOptionSelect(option.id), style: styles.optionButton, children: option.text }, option.id))) }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: onClose, variant: "secondary", size: "small", children: "Leave" }) })] }) }));
};
exports.MentorDialogueSystem = MentorDialogueSystem;
