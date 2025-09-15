"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationRhythm = MeditationRhythm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function MeditationRhythm({ onComplete, difficulty = 1 }) {
    const [rhythm, setRhythm] = (0, react_1.useState)([]);
    const [currentBeat, setCurrentBeat] = (0, react_1.useState)(0);
    const [score, setScore] = (0, react_1.useState)(0);
    const [isActive, setIsActive] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Generate rhythm pattern based on difficulty
        const pattern = Array.from({ length: 8 + difficulty * 2 }, () => Math.random() > 0.3 ? 1 : 0);
        setRhythm(pattern);
    }, [difficulty]);
    (0, react_1.useEffect)(() => {
        if (!isActive)
            return;
        const timer = setInterval(() => {
            setCurrentBeat(prev => {
                if (prev >= rhythm.length - 1) {
                    setIsActive(false);
                    onComplete({ success: score > rhythm.length * 0.6, score });
                    return prev;
                }
                return prev + 1;
            });
        }, 800 - difficulty * 100);
        return () => clearInterval(timer);
    }, [isActive, rhythm, score, difficulty, onComplete]);
    const handleBeat = () => {
        if (!isActive) {
            setIsActive(true);
            return;
        }
        if (rhythm[currentBeat] === 1) {
            setScore(prev => prev + 1);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "meditation-ui p-6 bg-gradient-to-b from-purple-900 to-indigo-900 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl text-white mb-4", children: "Dao Meditation Rhythm" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300 mb-4", children: "Focus on the Dao rhythm. Press when you feel the spiritual pulse." }), (0, jsx_runtime_1.jsx)("div", { className: "rhythm-display mb-4", children: rhythm.map((note, i) => ((0, jsx_runtime_1.jsx)("div", { className: `inline-block w-8 h-8 mx-1 rounded ${i === currentBeat ? 'bg-yellow-400' :
                        i < currentBeat ? (note ? 'bg-green-500' : 'bg-gray-600') :
                            'bg-gray-400'}` }, i))) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleBeat, className: "px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg", children: !isActive ? 'Begin Meditation' : 'Channel Qi' }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-gray-300", children: ["Score: ", score, "/", rhythm.filter(n => n).length] })] })] }));
}
