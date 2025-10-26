"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const SeedViewerModal_1 = __importDefault(require("@/components/admin/SeedViewerModal"));
describe('SeedViewerModal', () => {
    it('renders when open and shows text and effects', () => {
        const seed = { id: 's1', title: 'Test Seed', description: 'This is a test', effects: ['e1', 'e2'] };
        const onClose = jest.fn();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(SeedViewerModal_1.default, { open: true, onClose: onClose, seed: seed }));
        expect(react_1.screen.getByText('Test Seed')).toBeInTheDocument();
        expect(react_1.screen.getByText('This is a test')).toBeInTheDocument();
        expect(react_1.screen.getByText('e1')).toBeInTheDocument();
        react_1.fireEvent.click(react_1.screen.getByText('Close'));
        expect(onClose).toHaveBeenCalled();
    });
});
