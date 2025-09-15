import React, { useState, useEffect } from 'react';
import { ChallengeResult } from '../../types/MentorTeaching';

interface RebellionMasteryProps {
  difficulty: string;
  timeLimit?: number;
  successThreshold: number;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

interface RebellionScenario {
  id: string;
  title: string;
  description: string;
  options: RebellionOption[];
  correctOption: number;
  complexity: number;
}

interface RebellionOption {
  text: string;
  consequences: {
    reputation: number;
    resources: number;
    followers: number;
    risk: number;
  };
}

export const RebellionMastery: React.FC<RebellionMasteryProps> = ({
  difficulty,
  timeLimit = 180,
  successThreshold,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<RebellionScenario | null>(null);
  const [round, setRound] = useState(1);
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [resources, setResources] = useState({
    reputation: 50,
    followers: 30,
    supplies: 40,
    morale: 60
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

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

  const scenarios: RebellionScenario[] = [
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

  const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

  const generateScenario = (): RebellionScenario => {
    const availableScenarios = scenarios.filter(s => s.complexity <= settings.scenarioComplexity);
    return availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
  };

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
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

  const handleOptionSelect = (optionIndex: number) => {
    if (!currentScenario) return;

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
    } else {
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
      } else {
        endChallenge();
      }
    }, 1000);
  };

  const calculateFinalScore = (): number => {
    const resourceBonus = (resources.reputation + resources.followers + resources.supplies + resources.morale) / 4;
    const timeBonus = Math.floor((timeLeft / timeLimit) * 100);
    const completionBonus = (scenariosCompleted / settings.maxRounds) * 50;
    
    return Math.floor((score + resourceBonus + timeBonus + completionBonus) * settings.scoreMultiplier);
  };

  const endChallenge = () => {
    setIsActive(false);
    if (timer) clearInterval(timer);
    
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
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        margin: '20px 0',
        padding: '10px',
        backgroundColor: '#e0e0e0',
        borderRadius: '8px'
      }}>
        <div>
          <strong>Reputation:</strong> {resources.reputation}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#ddd',
            borderRadius: '5px',
            marginTop: '5px'
          }}>
            <div style={{
              width: `${Math.min(100, resources.reputation)}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '5px'
            }} />
          </div>
        </div>
        <div>
          <strong>Followers:</strong> {resources.followers}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#ddd',
            borderRadius: '5px',
            marginTop: '5px'
          }}>
            <div style={{
              width: `${Math.min(100, resources.followers)}%`,
              height: '100%',
              backgroundColor: '#2196F3',
              borderRadius: '5px'
            }} />
          </div>
        </div>
        <div>
          <strong>Supplies:</strong> {resources.supplies}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#ddd',
            borderRadius: '5px',
            marginTop: '5px'
          }}>
            <div style={{
              width: `${Math.min(100, resources.supplies)}%`,
              height: '100%',
              backgroundColor: '#FF9800',
              borderRadius: '5px'
            }} />
          </div>
        </div>
        <div>
          <strong>Morale:</strong> {resources.morale}
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#ddd',
            borderRadius: '5px',
            marginTop: '5px'
          }}>
            <div style={{
              width: `${Math.min(100, resources.morale)}%`,
              height: '100%',
              backgroundColor: '#9C27B0',
              borderRadius: '5px'
            }} />
          </div>
        </div>
      </div>
    );
  };

  const renderOptions = () => {
    if (!currentScenario) return null;

    return (
      <div style={{ 
        display: 'grid', 
        gap: '10px',
        margin: '20px 0'
      }}>
        {currentScenario.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionSelect(index)}
            style={{
              padding: '12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px'
            }}
          >
            {option.text}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      <h3>Rebellion Mastery Challenge</h3>
      <p>Difficulty: {difficulty.toUpperCase()}</p>
      
      {!isActive ? (
        <div>
          <p>Lead your rebellion through strategic challenges</p>
          <p>Make wise decisions to build your resources and followers</p>
          <button 
            onClick={startChallenge}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start Challenge
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h4>
            <p>Score: {score} / {successThreshold}</p>
            <p>Scenario: {round} / {settings.maxRounds}</p>
            <p>Successful Decisions: {scenariosCompleted}</p>
          </div>

          {renderResources()}

          {currentScenario && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4>{currentScenario.title}</h4>
              <p>{currentScenario.description}</p>
              {renderOptions()}
            </div>
          )}

          <div style={{ 
            marginBottom: '20px', 
            maxHeight: '100px', 
            overflowY: 'auto',
            backgroundColor: '#222',
            color: '#fff',
            padding: '10px',
            borderRadius: '4px',
            textAlign: 'left'
          }}>
            <h5>Game Log:</h5>
            {gameLog.slice(-3).map((log, index) => (
              <div key={index} style={{ marginBottom: '4px', fontSize: '14px' }}>
                {log}
              </div>
            ))}
          </div>

          <button 
            onClick={endChallenge}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            End Challenge
          </button>
        </div>
      )}
    </div>
  );
};
