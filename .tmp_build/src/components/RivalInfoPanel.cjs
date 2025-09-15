"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const RivalInfoPanel = ({ rivalId }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "rival-info-panel", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Rival Info" }), (0, jsx_runtime_1.jsxs)("p", { children: ["ID: ", rivalId || 'N/A'] }), (0, jsx_runtime_1.jsx)("p", { children: "Personality: (scaffold)" })] }));
};
exports.default = RivalInfoPanel;
