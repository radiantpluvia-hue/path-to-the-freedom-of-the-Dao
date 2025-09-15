"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const CodexModal_1 = __importDefault(require("../../CodexModal"));
describe('CodexModal', () => {
    test('renders when open and closes on Escape', () => {
        const onClose = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(CodexModal_1.default, { open: true, onClose: onClose }));
        expect(react_1.screen.getByRole('dialog')).toBeInTheDocument();
        react_1.fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(onClose).toHaveBeenCalled();
    });
    test('overlay click closes modal', () => {
        const onClose = jest.fn();
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(CodexModal_1.default, { open: true, onClose: onClose }));
        const overlay = container.querySelector('.codex-modal-overlay');
        overlay && react_1.fireEvent.click(overlay);
        expect(onClose).toHaveBeenCalled();
    });
});
