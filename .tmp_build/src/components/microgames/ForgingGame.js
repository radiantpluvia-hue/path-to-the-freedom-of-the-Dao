"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgingGame = ForgingGame;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function ForgingGame({ onComplete, difficulty = 1 }) {
    const [heat, setHeat] = (0, react_1.useState)(50);
    const [targetZone] = (0, react_1.useState)({ min: 70, max: 90 });
    const [strikes, setStrikes] = (0, react_1.useState)(0);
    const [maxStrikes] = (0, react_1.useState)(5 + difficulty);
    const [isActive, setIsActive] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!isActive)
            return;
        const timer = setInterval(() => {
            setHeat(prev => {
                const change = (Math.random() - 0.5) * 10;
                return Math.max(0, Math.min(100, prev + change));
            });
        }, 200);
        return () => clearInterval(timer);
    }, [isActive]);
    const strike = () => {
        if (!isActive) {
            setIsActive(true);
            return;
        }
        const newStrikes = strikes + 1;
        setStrikes(newStrikes);
        const inZone = heat >= targetZone.min && heat <= targetZone.max;
        const quality = inZone ? 20 : Math.max(0, 20 - Math.abs(heat - 80));
        if (newStrikes >= maxStrikes) {
            const totalQuality = quality * newStrikes;
            onComplete({
                success: totalQuality > maxStrikes * 15,
                quality: totalQuality
            });
        }
    };
    const getHeatColor = () => {
        if (heat < 30)
            return 'bg-blue-500';
        if (heat < 60)
            return 'bg-yellow-500';
        if (heat < targetZone.min)
            return 'bg-orange-500';
        if (heat <= targetZone.max)
            return 'bg-green-500';
        return 'bg-red-500';
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "forging-ui p-6 bg-gradient-to-b from-red-900 to-orange-900 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl text-white mb-4", children: "Spiritual Forging" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300 mb-4", children: "Strike when the spiritual fire reaches the perfect temperature!" }), (0, jsx_runtime_1.jsxs)("div", { className: "heat-meter mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full h-8 bg-gray-700 rounded-lg overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: `h-full transition-all duration-200 ${getHeatColor()}`, style: { width: `${heat}%` } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-gray-400 mt-1", children: [(0, jsx_runtime_1.jsx)("span", { children: "Cold" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-green-400", children: ["Perfect Zone: ", targetZone.min, "-", targetZone.max] }), (0, jsx_runtime_1.jsx)("span", { children: "Overheated" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("button", { onClick: strike, className: "px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg", disabled: strikes >= maxStrikes, children: !isActive ? 'Begin Forging' : 'Strike!' }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-gray-300", children: ["Strikes: ", strikes, "/", maxStrikes, " | Heat: ", Math.round(heat), "\u00B0"] })] })] }));
}
