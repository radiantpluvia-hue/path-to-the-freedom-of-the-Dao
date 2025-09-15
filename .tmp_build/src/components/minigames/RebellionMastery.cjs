"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RebellionMastery = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RebellionMastery = ({ difficulty, timeLimit = 180, successThreshold, onComplete }) => {
    const [timeLeft, setTimeLeft] = (0, react_1.useState)(timeLimit);
    const [score, setScore] = (0, react_1.useState)(0);
    const [isActive, setIsActive] = (0, react_1.useState)(false);
    const [currentScenario, setCurrentScenario] = (0, react_1.useState)(null);
    const [round, setRound] = (0, react_1.useState)(1);
    const [scenariosCompleted, setScenariosCompleted] = (0, react_1.useState)(0);
    const [gameLog, setGameLog] = (0, react_1.useState)([]);
    const [resources, setResources] = (0, react_1.useState)({
        reputation: 50,
        followers: 30,
        supplies: 40,
        morale: 60
    });
    const [timer, setTimer] = (0, react_1.useState)(null);
    const difficultySettings = {
        easy: {
            scenarioComplexity: 1,
            scoreMultiplier: 1,
            maxRounds: 6,
            resourcePenalty: 5
        },
        medium: {
            scenarioComplexity: 2,
            scoreMultiplier: 1.2,
            maxRounds: 8,
            resourcePenalty: 7
        },
        hard: {
            scenarioComplexity: 3,
            scoreMultiplier: 1.5,
            maxRounds: 10,
            resourcePenalty: 10
        },
        extreme: {
            scenarioComplexity: 4,
            scoreMultiplier: 2,
            maxRounds: 12,
            resourcePenalty: 12
        },
        legendary: {
            scenarioComplexity: 5,
            scoreMultiplier: 2.5,
            maxRounds: 15,
            resourcePenalty: 15
        }
    };
    const scenarios = [
        {
            id: 'scenario_1',
            title: 'Resource Shortage',
            description: 'Your rebellion faces a severe resource shortage. How do you handle it?',
            options: [
                {
                    text: 'Raid enemy supply lines (High risk, high reward)',
                    consequences: { reputation: 5, resources: 20, followers: -5, risk: 0.6 }
                },
                {
                    text: 'Negotiate with local merchants (Low risk, moderate reward)',
                    consequences: { reputation: 10, resources: 10, followers: 2, risk: 0.2 }
                },
                {
                    text: 'Implement strict rationing (No risk, low reward)',
                    consequences: { reputation: -5, resources: 5, followers: -3, risk: 0.1 }
                }
            ],
            correctOption: 1,
            complexity: 2
        },
        {
            id: 'scenario_2',
            title: 'Internal Conflict',
            description: 'Two of your commanders are in conflict over strategy. How do you resolve it?',
            options: [
                {
                    text: 'Support the aggressive commander',
                    consequences: { reputation: 8, resources: -10, followers: 5, risk: 0.4 }
                },
                {
                    text: 'Support the cautious commander',
                    consequences: { reputation: 5, resources: 5, followers: -2, risk: 0.2 }
                },
                {
                    text: 'Mediate and find a compromise',
                    consequences: { reputation: 15, resources: 0, followers: 8, risk: 0.1 }
                }
            ],
            correctOption: 2,
            complexity: 3
        },
        {
            id: 'scenario_3',
            title: 'Enemy Ultimatum',
            description: 'The enemy offers peace in exchange for your surrender. How do you respond?',
            options: [
                {
                    text: 'Accept the offer (End rebellion)',
                    consequences: { reputation: -20, resources: 0, followers: -15, risk: 0.0 }
                },
                {
                    text: 'Reject and prepare for battle',
                    consequences: { reputation: 10, resources: -15, followers: 5, risk: 0.5 }
                },
                {
                    text: 'Pretend to consider while planning counter-attack',
                    consequences: { reputation: 20, resources: 5, followers: 10, risk: 0.7 }
                }
            ],
            correctOption: 2,
            complexity: 4
        },
        {
            id: 'scenario_4',
            title: 'Alliance Opportunity',
            description: 'A powerful faction offers alliance. What are your terms?',
            options: [
                {
                    text: 'Demand equal partnership',
                    consequences: { reputation: 15, resources: 20, followers: 10, risk: 0.3 }
                },
                {
                    text: 'Accept subordinate position for safety',
                    consequences: { reputation: -10, resources: 30, followers: -8, risk: 0.1 }
                },
                {
                    text: 'Request time to consider while gathering intelligence',
                    consequences: { reputation: 8, resources: 5, followers: 5, risk: 0.2 }
                }
            ],
            correctOption: 0,
            complexity: 3
        },
        {
            id: 'scenario_5',
            title: 'Public Support',
            description: 'The people are divided. How do you gain their support?',
            options: [
                {
                    text: 'Promise wealth and prosperity',
                    consequences: { reputation: 5, resources: -20, followers: 8, risk: 0.4 }
                },
                {
                    text: 'Appeal to justice and freedom',
                    consequences: { reputation: 20, resources: -5, followers: 15, risk: 0.2 }
                },
                {
                    text: 'Use fear and intimidation',
                    consequences: { reputation: -15, resources: 10, followers: -10, risk: 0.6 }
                }
            ],
            correctOption: 1,
            complexity: 2
        }
    ];
    const settings = difficultySettings[difficulty] || difficultySettings.medium;
    const generateScenario = () => {
        const availableScenarios = scenarios.filter(s => s.complexity <= settings.scenarioComplexity);
        return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
    };
    (0, react_1.useEffect)(() => {
        return () => {
            if (timer)
                clearInterval(timer);
        };
    }, [timer]);
    const startChallenge = () => {
        setIsActive(true);
        setTimeLeft(timeLimit);
        setScore(0);
        setRound(1);
        setScenariosCompleted(0);
        setResources({
            reputation: 50,
            followers: 30,
            supplies: 40,
            morale: 60
        });
        setGameLog(['Rebellion mastery challenge begins! Make strategic decisions wisely.']);
        const newTimer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    endChallenge();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setTimer(newTimer);
        startNewScenario();
    };
    const startNewScenario = () => {
        const scenario = generateScenario();
        setCurrentScenario(scenario);
        setGameLog(prev => [...prev, `Scenario ${round}: ${scenario.title}`]);
    };
    const handleOptionSelect = (optionIndex) => {
        if (!currentScenario)
            return;
        const option = currentScenario.options[optionIndex];
        const isCorrect = optionIndex === currentScenario.correctOption;
        // Apply consequences
        const newResources = { ...resources };
        newResources.reputation += option.consequences.reputation;
        newResources.followers += option.consequences.followers;
        newResources.supplies += option.consequences.resources;
        newResources.morale += Math.floor((option.consequences.reputation + option.consequences.followers) / 2);
        setResources(newResources);
        // Calculate score
        let scenarioScore = 0;
        if (isCorrect) {
            scenarioScore = currentScenario.complexity * 25;
            setScenariosCompleted(prev => prev + 1);
            setGameLog(prev => [...prev, `Excellent choice! +${scenarioScore} points`]);
        }
        else {
            scenarioScore = Math.max(0, currentScenario.complexity * 10 - settings.resourcePenalty);
            setGameLog(prev => [...prev, `Strategic error. +${scenarioScore} points`]);
        }
        // Apply risk
        if (Math.random() < option.consequences.risk) {
            const riskPenalty = Math.floor(scenarioScore * 0.3);
            scenarioScore = Math.max(0, scenarioScore - riskPenalty);
            setGameLog(prev => [...prev, `Risk realized! -${riskPenalty} points`]);
        }
        setScore(prev => prev + scenarioScore);
        setTimeout(() => {
            if (round < settings.maxRounds) {
                setRound(prev => prev + 1);
                startNewScenario();
            }
            else {
                endChallenge();
            }
        }, 1000);
    };
    const calculateFinalScore = () => {
        const resourceBonus = (resources.reputation + resources.followers + resources.supplies + resources.morale) / 4;
        const timeBonus = Math.floor((timeLeft / timeLimit) * 100);
        const completionBonus = (scenariosCompleted / settings.maxRounds) * 50;
        return Math.floor((score + resourceBonus + timeBonus + completionBonus) * settings.scoreMultiplier);
    };
    const endChallenge = () => {
        setIsActive(false);
        if (timer)
            clearInterval(timer);
        const finalScore = calculateFinalScore();
        const accuracy = scenariosCompleted > 0 ? (scenariosCompleted / settings.maxRounds) * 100 : 0;
        const efficiency = (timeLeft / timeLimit) * 100;
        onComplete({
            success: finalScore >= successThreshold,
            score: finalScore,
            timeTaken: timeLimit - timeLeft,
            accuracy,
            efficiency,
            bonusRewards: finalScore >= successThreshold ? {
                leadership: 1,
                cunning: 1,
                charisma: 1
            } : undefined,
            penaltyConsequences: finalScore < successThreshold ? {
                leadership: -1,
                cunning: -1
            } : undefined
        });
    };
    const renderResources = () => {
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                margin: '20px 0',
                padding: '10px',
                backgroundColor: '#e0e0e0',
                borderRadius: '8px'
            }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Reputation:" }), " ", resources.reputation, (0, jsx_runtime_1.jsx)("div", { style: {
                                width: '100%',
                                height: '10px',
                                backgroundColor: '#ddd',
                                borderRadius: '5px',
                                marginTop: '5px'
                            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: `${Math.min(100, resources.reputation)}%`,
                                    height: '100%',
                                    backgroundColor: '#4CAF50',
                                    borderRadius: '5px'
                                } }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Followers:" }), " ", resources.followers, (0, jsx_runtime_1.jsx)("div", { style: {
                                width: '100%',
                                height: '10px',
                                backgroundColor: '#ddd',
                                borderRadius: '5px',
                                marginTop: '5px'
                            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: `${Math.min(100, resources.followers)}%`,
                                    height: '100%',
                                    backgroundColor: '#2196F3',
                                    borderRadius: '5px'
                                } }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Supplies:" }), " ", resources.supplies, (0, jsx_runtime_1.jsx)("div", { style: {
                                width: '100%',
                                height: '10px',
                                backgroundColor: '#ddd',
                                borderRadius: '5px',
                                marginTop: '5px'
                            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: `${Math.min(100, resources.supplies)}%`,
                                    height: '100%',
                                    backgroundColor: '#FF9800',
                                    borderRadius: '5px'
                                } }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Morale:" }), " ", resources.morale, (0, jsx_runtime_1.jsx)("div", { style: {
                                width: '100%',
                                height: '10px',
                                backgroundColor: '#ddd',
                                borderRadius: '5px',
                                marginTop: '5px'
                            }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    width: `${Math.min(100, resources.morale)}%`,
                                    height: '100%',
                                    backgroundColor: '#9C27B0',
                                    borderRadius: '5px'
                                } }) })] })] }));
    };
    const renderOptions = () => {
        if (!currentScenario)
            return null;
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                display: 'grid',
                gap: '10px',
                margin: '20px 0'
            }, children: currentScenario.options.map((option, index) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handleOptionSelect(index), style: {
                    padding: '12px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px'
                }, children: option.text }, index))) }));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            maxWidth: '700px',
            margin: '0 auto'
        }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Rebellion Mastery Challenge" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Difficulty: ", difficulty.toUpperCase()] }), !isActive ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: "Lead your rebellion through strategic challenges" }), (0, jsx_runtime_1.jsx)("p", { children: "Make wise decisions to build your resources and followers" }), (0, jsx_runtime_1.jsx)("button", { onClick: startChallenge, style: {
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }, children: "Start Challenge" })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Time Left: ", Math.floor(timeLeft / 60), ":", (timeLeft % 60).toString().padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Score: ", score, " / ", successThreshold] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Scenario: ", round, " / ", settings.maxRounds] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Successful Decisions: ", scenariosCompleted] })] }), renderResources(), currentScenario && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }, children: [(0, jsx_runtime_1.jsx)("h4", { children: currentScenario.title }), (0, jsx_runtime_1.jsx)("p", { children: currentScenario.description }), renderOptions()] })), (0, jsx_runtime_1.jsxs)("div", { style: {
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
                        }, children: "End Challenge" })] }))] }));
};
exports.RebellionMastery = RebellionMastery;
