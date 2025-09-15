import React, { useState, useEffect, useRef } from 'react';
import { ChallengeResult } from '../../types/MentorTeaching';

interface MemoryTestProps {
  difficulty: string;
  timeLimit?: number;
  successThreshold: number;
  onComplete: (result: ChallengeResult) => void;
  onCancel?: () => void;
}

interface MemoryPattern {
  id: string;
  sequence: number[];
  displayTime: number;
  complexity: number;
}

const MemoryTest: React.FC<MemoryTestProps> = ({
  difficulty,
  timeLimit = 120,
  successThreshold,
  onComplete,
  onCancel: _onCancel
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<MemoryPattern | null>(null);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gamePhase, setGamePhase] = useState<'showing' | 'input' | 'result'>('showing');
  const [round, setRound] = useState(1);
  const [patternsCompleted, setPatternsCompleted] = useState(0);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

  const generatePattern = (): MemoryPattern => {
    const length = settings.patternLength;
    const sequence: number[] = [];
    
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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

  const handleNumberClick = (number: number) => {
    if (gamePhase !== 'input' || !currentPattern) return;

    const newInput = [...userInput, number];
    setUserInput(newInput);

    if (newInput.length === currentPattern.sequence.length) {
      checkPattern(newInput);
    }
  };

  const checkPattern = (input: number[]) => {
    if (!currentPattern) return;

    const isCorrect = input.every((num, index) => num === currentPattern.sequence[index]);
    
    if (isCorrect) {
      const roundScore = calculateRoundScore();
      setScore(prev => prev + roundScore);
      setPatternsCompleted(prev => prev + 1);
      setGameLog(prev => [...prev, `Correct! +${roundScore} points`]);
    } else {
      setGameLog(prev => [...prev, 'Incorrect pattern!']);
    }

    setGamePhase('result');
    
    setTimeout(() => {
      if (round < settings.maxRounds) {
        setRound(prev => prev + 1);
        startNewRound();
      } else {
        endChallenge();
      }
    }, 1000);
  };

  const calculateRoundScore = (): number => {
    if (!currentPattern) return 0;
    
    const baseScore = currentPattern.sequence.length * 10;
    const timeBonus = Math.floor((timeLeft / timeLimit) * 20);
    const complexityBonus = currentPattern.complexity * 5;
    
    return Math.floor((baseScore + timeBonus + complexityBonus) * settings.scoreMultiplier);
  };

  const endChallenge = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
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
    if (!currentPattern || gamePhase !== 'showing') return null;

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        margin: '20px 0'
      }}>
        {currentPattern.sequence.map((number, index) => (
          <div
            key={index}
            style={{
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
            }}
          >
            {number}
          </div>
        ))}
      </div>
    );
  };

  const renderNumberPad = () => {
    if (gamePhase !== 'input') return null;

    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '10px',
        margin: '20px 0'
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <button
            key={number}
            onClick={() => handleNumberClick(number)}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  const renderUserInput = () => {
    if (gamePhase !== 'input' && gamePhase !== 'result') return null;

    return (
      <div style={{ margin: '10px 0' }}>
        <h4>Your Input:</h4>
        <div style={{ 
          display: 'flex', 
          gap: '5px',
          justifyContent: 'center',
          minHeight: '40px'
        }}>
          {userInput.map((num, index) => (
            <span
              key={index}
              style={{
                padding: '8px 12px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {num}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h3>Memory Test Challenge</h3>
      <p>Difficulty: {difficulty.toUpperCase()}</p>
      
      {!isActive ? (
        <div>
          <p>Remember and reproduce the number patterns shown to you</p>
          <p>Test your memory and concentration skills</p>
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
            Start Test
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h4>
            <p>Score: {score} / {successThreshold}</p>
            <p>Round: {round} / {settings.maxRounds}</p>
            <p>Patterns Completed: {patternsCompleted}</p>
          </div>

          {renderPatternDisplay()}
          {renderUserInput()}
          {renderNumberPad()}

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
            End Test
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default MemoryTest;
