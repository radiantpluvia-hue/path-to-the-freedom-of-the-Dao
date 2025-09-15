"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MemoryTest = ({ difficulty, timeLimit = 120, successThreshold, onComplete, onCancel: _onCancel }) => {
    const [timeLeft, setTimeLeft] = (0, react_1.useState)(timeLimit);
    const [score, setScore] = (0, react_1.useState)(0);
    const [isActive, setIsActive] = (0, react_1.useState)(false);
    const [currentPattern, setCurrentPattern] = (0, react_1.useState)(null);
    const [userInput, setUserInput] = (0, react_1.useState)([]);
    const [gamePhase, setGamePhase] = (0, react_1.useState)('showing');
    const [round, setRound] = (0, react_1.useState)(1);
    const [patternsCompleted, setPatternsCompleted] = (0, react_1.useState)(0);
    const [gameLog, setGameLog] = (0, react_1.useState)([]);
    const timerRef = (0, react_1.useRef)(null);
    const difficultySettings = {
        easy: {
            patternLength: 4,
            displayTime: 3000,
            complexity: 1,
            scoreMultiplier: 1,
            maxRounds: 5
        },
        medium: {
            patternLength: 5,
            displayTime: 2500,
            complexity: 2,
            scoreMultiplier: 1.2,
            maxRounds: 6
        },
        hard: {
            patternLength: 6,
            displayTime: 2000,
            complexity: 3,
            scoreMultiplier: 1.5,
            maxRounds: 7
        },
        extreme: {
            patternLength: 7,
            displayTime: 1500,
            complexity: 4,
            scoreMultiplier: 2,
            maxRounds: 8
        },
        legendary: {
            patternLength: 8,
            displayTime: 1000,
            complexity: 5,
            scoreMultiplier: 2.5,
            maxRounds: 10
        }
    };
    const settings = difficultySettings[difficulty] || difficultySettings.medium;
    const generatePattern = () => {
        const length = settings.patternLength;
        const sequence = [];
        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 9) + 1); // Numbers 1-9
        }
        return {
            id: `pattern_${Date.now()}`,
            sequence,
            displayTime: settings.displayTime,
            complexity: settings.complexity
        };
    };
    (0, react_1.useEffect)(() => {
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
    }, []);
    const startChallenge = () => {
        setIsActive(true);
        setTimeLeft(timeLimit);
        setScore(0);
        setRound(1);
        setPatternsCompleted(0);
        setGameLog(['Memory test begins! Remember the patterns.']);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endChallenge();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        startNewRound();
    };
    const startNewRound = () => {
        const pattern = generatePattern();
        setCurrentPattern(pattern);
        setUserInput([]);
        setGamePhase('showing');
        setGameLog(prev => [...prev, `Round ${round}: Watch the pattern...`]);
        setTimeout(() => {
            setGamePhase('input');
            setGameLog(prev => [...prev, 'Now enter the pattern!']);
        }, pattern.displayTime);
    };
    const handleNumberClick = (number) => {
        if (gamePhase !== 'input' || !currentPattern)
            return;
        const newInput = [...userInput, number];
        setUserInput(newInput);
        if (newInput.length === currentPattern.sequence.length) {
            checkPattern(newInput);
        }
    };
    const checkPattern = (input) => {
        if (!currentPattern)
            return;
        const isCorrect = input.every((num, index) => num === currentPattern.sequence[index]);
        if (isCorrect) {
            const roundScore = calculateRoundScore();
            setScore(prev => prev + roundScore);
            setPatternsCompleted(prev => prev + 1);
            setGameLog(prev => [...prev, `Correct! +${roundScore} points`]);
        }
        else {
            setGameLog(prev => [...prev, 'Incorrect pattern!']);
        }
        setGamePhase('result');
        setTimeout(() => {
            if (round < settings.maxRounds) {
                setRound(prev => prev + 1);
                startNewRound();
            }
            else {
                endChallenge();
            }
        }, 1000);
    };
    const calculateRoundScore = () => {
        if (!currentPattern)
            return 0;
        const baseScore = currentPattern.sequence.length * 10;
        const timeBonus = Math.floor((timeLeft / timeLimit) * 20);
        const complexityBonus = currentPattern.complexity * 5;
        return Math.floor((baseScore + timeBonus + complexityBonus) * settings.scoreMultiplier);
    };
    const endChallenge = () => {
        setIsActive(false);
        if (timerRef.current)
            clearInterval(timerRef.current);
        const accuracy = patternsCompleted > 0 ? (patternsCompleted / settings.maxRounds) * 100 : 0;
        const efficiency = (timeLeft / timeLimit) * 100;
        onComplete({
            success: score >= successThreshold,
            score,
            timeTaken: timeLimit - timeLeft,
            accuracy,
            efficiency,
            bonusRewards: score >= successThreshold ? {
                mentalFortitude: 1,
                comprehension: 1
            } : undefined,
            penaltyConsequences: score < successThreshold ? {
                mentalFortitude: -1,
                comprehension: -1
            } : undefined
        });
    };
    const renderPatternDisplay = () => {
        if (!currentPattern || gamePhase !== 'showing')
            return null;
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                margin: '20px 0'
            }, children: currentPattern.sequence.map((number, index) => ((0, jsx_runtime_1.jsx)("div", { style: {
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    animation: 'pulse 1s infinite'
                }, children: number }, index))) }));
    };
    const renderNumberPad = () => {
        if (gamePhase !== 'input')
            return null;
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                margin: '20px 0'
            }, children: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handleNumberClick(number), style: {
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }, children: number }, number))) }));
    };
    const renderUserInput = () => {
        if (gamePhase !== 'input' && gamePhase !== 'result')
            return null;
        return ((0, jsx_runtime_1.jsxs)("div", { style: { margin: '10px 0' }, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Your Input:" }), (0, jsx_runtime_1.jsx)("div", { style: {
                        display: 'flex',
                        gap: '5px',
                        justifyContent: 'center',
                        minHeight: '40px'
                    }, children: userInput.map((num, index) => ((0, jsx_runtime_1.jsx)("span", { style: {
                            padding: '8px 12px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }, children: num }, index))) })] }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            maxWidth: '500px',
            margin: '0 auto'
        }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Memory Test Challenge" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Difficulty: ", difficulty.toUpperCase()] }), !isActive ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: "Remember and reproduce the number patterns shown to you" }), (0, jsx_runtime_1.jsx)("p", { children: "Test your memory and concentration skills" }), (0, jsx_runtime_1.jsx)("button", { onClick: startChallenge, style: {
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }, children: "Start Test" })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Time Left: ", Math.floor(timeLeft / 60), ":", (timeLeft % 60).toString().padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Score: ", score, " / ", successThreshold] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Round: ", round, " / ", settings.maxRounds] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Patterns Completed: ", patternsCompleted] })] }), renderPatternDisplay(), renderUserInput(), renderNumberPad(), (0, jsx_runtime_1.jsxs)("div", { style: {
                            marginBottom: '20px',
                            maxHeight: '100px',
                            overflowY: 'auto',
                            backgroundColor: '#222',
                            color: '#fff',
                            padding: '10px',
                            borderRadius: '4px',
                            textAlign: 'left'
                        }, children: [(0, jsx_runtime_1.jsx)("h5", { children: "Game Log:" }), gameLog.slice(-3).map((log, index) => ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '4px', fontSize: '14px' }, children: log }, index)))] }), (0, jsx_runtime_1.jsx)("button", { onClick: endChallenge, style: {
                            padding: '10px 20px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }, children: "End Test" })] })), (0, jsx_runtime_1.jsx)("style", { children: `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        ` })] }));
};
exports.default = MemoryTest;
