"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const ModalCloseButton_1 = __importDefault(require("@/components/ui/ModalCloseButton"));
describe('ModalCloseButton', () => {
    test('renders with accessible name and calls onClick', () => {
        const handle = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { ariaLabel: "Close modal", title: "Close", onClick: handle }));
        const btn = react_1.screen.getByRole('button', { name: /close modal/i });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute('title', 'Close');
        // simulate click
        react_1.fireEvent.click(btn);
        expect(handle).toHaveBeenCalledTimes(1);
    });
    test('has expected visual size/hit area via computed style', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ModalCloseButton_1.default, { ariaLabel: "Close", title: "Close", onClick: () => { } }));
        const btn = react_1.screen.getByRole('button', { name: /close/i });
        // Check computed padding exists and is greater than zero (robust in JSDOM)
        const cs = window.getComputedStyle(btn);
        const pad = parseInt(cs.padding || '0', 10) || 0;
        expect(pad).toBeGreaterThan(0);
    });
});
