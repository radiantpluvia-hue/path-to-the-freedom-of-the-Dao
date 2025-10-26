"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
require("@testing-library/jest-dom");
const AlignmentPassivesPanel_1 = __importDefault(require("../components/game/AlignmentPassivesPanel"));
// Minimal passive registry mock: we rely on actual implementation, but ensure getPassive returns id
jest.mock('../systems/passiveRegistry', () => {
    const actual = jest.requireActual('../systems/passiveRegistry');
    return {
        ...actual,
        getPassive: (id) => ({ id })
    };
});
describe('AlignmentPassivesPanel', () => {
    test('renders active alignment passives with bonus values', () => {
        const player = {
            alignmentPassiveApplied: ['tag_honor_bound', 'tag_bloodthirsty'],
            _alignmentPassiveAppliedValues: {
                tag_honor_bound: 2,
                tag_bloodthirsty: 4,
            }
        };
        (0, react_1.render)((0, jsx_runtime_1.jsx)(AlignmentPassivesPanel_1.default, { player: player }));
        expect(react_1.screen.getByText('Alignment Passives')).toBeInTheDocument();
        expect(react_1.screen.getByText('Honor Bound')).toBeInTheDocument();
        expect(react_1.screen.getByText('+2')).toBeInTheDocument();
        expect(react_1.screen.getByText('Bloodthirsty')).toBeInTheDocument();
        expect(react_1.screen.getByText('+4')).toBeInTheDocument();
    });
    test('renders nothing when no passives', () => {
        const { container } = (0, react_1.render)((0, jsx_runtime_1.jsx)(AlignmentPassivesPanel_1.default, { player: {} }));
        // No heading
        expect(container.textContent).toBe('');
    });
});
