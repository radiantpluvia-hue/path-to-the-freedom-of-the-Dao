"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const ReactionTest = ({ difficulty = 'medium' }) => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mini-game reaction-test", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Reaction Test (scaffold)" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Placeholder reaction mini-game. Difficulty: ", difficulty] })] }));
};
exports.default = ReactionTest;
