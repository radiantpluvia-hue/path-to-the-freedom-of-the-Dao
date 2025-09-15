"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const TimingChallenge = ({ difficulty = 'medium' }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mini-game timing-challenge", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Timing Challenge (scaffold)" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Placeholder timing mini-game. Difficulty: ", difficulty] })] }));
};
exports.default = TimingChallenge;
