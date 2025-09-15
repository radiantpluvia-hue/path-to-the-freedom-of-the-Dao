"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinigameManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const MeditationChallenge_1 = require("./MeditationChallenge");
const QiControlTest_1 = require("@/components/minigames/QiControlTest");
const PuzzleSolving_1 = require("./PuzzleSolving");
const CombatSimulation_1 = __importDefault(require("./CombatSimulation"));
const MemoryTest_1 = __importDefault(require("./MemoryTest"));
const ReactionTest_1 = __importDefault(require("./ReactionTest"));
const PatternRecognition_1 = __importDefault(require("./PatternRecognition"));
const ResourceManagement_1 = __importDefault(require("./ResourceManagement"));
const TimingChallenge_1 = __importDefault(require("./TimingChallenge"));
const RebellionMastery_1 = require("./RebellionMastery");
const MinigameManager = ({ challengeType, difficulty, timeLimit, successThreshold, onComplete, onCancel }) => {
    // Coerce common props to `any` to avoid TS mismatches between different minigame prop shapes
    const commonProps = { difficulty, timeLimit, successThreshold, onComplete, onCancel };
    const renderChallengeComponent = () => {
        switch (challengeType) {
            case 'meditation_challenge':
                return ((0, jsx_runtime_1.jsx)(MeditationChallenge_1.MeditationChallenge, { ...commonProps }));
            case 'qi_control_test':
                return ((0, jsx_runtime_1.jsx)(QiControlTest_1.QiControlTest, { ...commonProps }));
            case 'puzzle_solving':
                return ((0, jsx_runtime_1.jsx)(PuzzleSolving_1.PuzzleSolving, { ...commonProps }));
            case 'combat_simulation':
                return ((0, jsx_runtime_1.jsx)(CombatSimulation_1.default, { ...commonProps }));
            case 'memory_test':
                return ((0, jsx_runtime_1.jsx)(MemoryTest_1.default, { ...commonProps }));
            case 'reaction_test':
                return ((0, jsx_runtime_1.jsx)(ReactionTest_1.default, { ...commonProps }));
            case 'pattern_recognition':
                return ((0, jsx_runtime_1.jsx)(PatternRecognition_1.default, { ...commonProps }));
            case 'resource_management':
                return ((0, jsx_runtime_1.jsx)(ResourceManagement_1.default, { ...commonProps }));
            case 'timing_challenge':
                return ((0, jsx_runtime_1.jsx)(TimingChallenge_1.default, { ...commonProps }));
            case 'rebellion_mastery':
                return ((0, jsx_runtime_1.jsx)(RebellionMastery_1.RebellionMastery, { ...commonProps }));
            case 'transformation_trial':
            case 'custom':
            default:
                return ((0, jsx_runtime_1.jsxs)("div", { style: {
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '10px'
                    }, children: [(0, jsx_runtime_1.jsxs)("h3", { children: ["Challenge Type: ", challengeType] }), (0, jsx_runtime_1.jsx)("p", { children: "This challenge type is coming soon!" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Difficulty: ", difficulty.toUpperCase()] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Success Threshold: ", successThreshold] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '20px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => onComplete({
                                        success: true,
                                        score: successThreshold,
                                        timeTaken: 60,
                                        accuracy: 100,
                                        efficiency: 100,
                                        bonusRewards: { qi: 1, insight: 1 }
                                    }), style: {
                                        padding: '10px 20px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        marginRight: '10px'
                                    }, children: "Simulate Success" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onComplete({
                                        success: false,
                                        score: Math.floor(successThreshold * 0.6),
                                        timeTaken: timeLimit || 300,
                                        accuracy: 60,
                                        efficiency: 0,
                                        penaltyConsequences: { qi: -1 }
                                    }), style: {
                                        padding: '10px 20px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }, children: "Simulate Failure" })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '20px' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: onCancel, style: {
                                    padding: '10px 20px',
                                    backgroundColor: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }, children: "Cancel Challenge" }) })] }));
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'auto'
            }, children: renderChallengeComponent() }) }));
};
exports.MinigameManager = MinigameManager;
