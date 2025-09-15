"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuelIntent = DuelIntent;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function DuelIntent({ onComplete, difficulty = 1 }) {
    const [intent, setIntent] = (0, react_1.useState)(0);
    const [enemyAttack, setEnemyAttack] = (0, react_1.useState)(0);
    const [parryWindow, setParryWindow] = (0, react_1.useState)(false);
    const [round, setRound] = (0, react_1.useState)(0);
    const [maxRounds] = (0, react_1.useState)(5 + difficulty);
    const [successfulParries, setSuccessfulParries] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (round >= maxRounds) {
            onComplete({
                success: successfulParries > maxRounds * 0.6,
                level: successfulParries
            });
            return;
        }
        // Enemy attack cycle
        const attackTimer = setTimeout(() => {
            setEnemyAttack(100);
            setParryWindow(true);
            // Parry window duration decreases with difficulty
            const windowTimer = setTimeout(() => {
                setParryWindow(false);
                setEnemyAttack(0);
                setRound(prev => prev + 1);
            }, 1500 - difficulty * 200);
            return () => clearTimeout(windowTimer);
        }, 2000);
        return () => clearTimeout(attackTimer);
    }, [round, maxRounds, difficulty, successfulParries, onComplete]);
    const parry = () => {
        if (parryWindow && enemyAttack > 50) {
            setSuccessfulParries(prev => prev + 1);
            setIntent(prev => Math.min(100, prev + 15));
            setParryWindow(false);
            setEnemyAttack(0);
            setRound(prev => prev + 1);
        }
        else if (parryWindow) {
            // Early parry penalty
            setIntent(prev => Math.max(0, prev - 5));
        }
    };
    const getIntentColor = () => {
        if (intent < 30)
            return 'bg-red-500';
        if (intent < 70)
            return 'bg-yellow-500';
        return 'bg-blue-500';
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "duel-ui p-6 bg-gradient-to-b from-gray-900 to-blue-900 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl text-white mb-4", children: "Sword Intent Duel" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300 mb-4", children: "Channel your sword intent. Parry at the peak of enemy attacks!" }), (0, jsx_runtime_1.jsxs)("div", { className: "intent-meter mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-gray-300", children: "Sword Intent" }), (0, jsx_runtime_1.jsx)("div", { className: "w-full h-6 bg-gray-700 rounded-lg overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: `h-full transition-all duration-300 ${getIntentColor()}`, style: { width: `${intent}%` } }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "enemy-attack mb-4", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-gray-300", children: "Enemy Attack Power" }), (0, jsx_runtime_1.jsx)("div", { className: "w-full h-6 bg-gray-700 rounded-lg overflow-hidden", children: (0, jsx_runtime_1.jsx)("div", { className: `h-full transition-all duration-200 ${parryWindow ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`, style: { width: `${enemyAttack}%` } }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("button", { onClick: parry, className: `px-6 py-3 text-white rounded-lg ${parryWindow ? 'bg-green-600 hover:bg-green-700 animate-pulse' :
                            'bg-gray-600 hover:bg-gray-700'}`, children: "Parry!" }), (0, jsx_runtime_1.jsxs)("p", { className: "mt-2 text-gray-300", children: ["Round: ", round + 1, "/", maxRounds, " | Successful Parries: ", successfulParries] }), parryWindow && ((0, jsx_runtime_1.jsx)("p", { className: "text-yellow-400 animate-pulse", children: "PARRY NOW!" }))] })] }));
}
