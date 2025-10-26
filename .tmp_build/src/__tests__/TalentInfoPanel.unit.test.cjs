"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const TalentInfoPanel_1 = require("../components/info/TalentInfoPanel");
describe('TalentInfoPanel fallback', () => {
    it('shows raw talent id and hint when talent data missing', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(TalentInfoPanel_1.TalentInfoPanel, { talentId: 'nonexistent_talent_xxx' }));
        expect(react_1.screen.getByText(/Unknown Talent/i)).toBeInTheDocument();
        expect(react_1.screen.getByText(/nonexistent_talent_xxx/)).toBeInTheDocument();
        expect(react_1.screen.getByText(/Talent data not found/i)).toBeInTheDocument();
    });
});
