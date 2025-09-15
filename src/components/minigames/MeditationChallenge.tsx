import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChallengeResult } from '../../types/MentorTeaching';

interface MeditationChallengeProps {
  difficulty: string;
  timeLimit?: number;
  successThreshold: number;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

export const MeditationChallenge: React.FC<MeditationChallengeProps> = ({
  difficulty,
  timeLimit = 300,
  successThreshold,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [qiPoints, setQiPoints] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [rhythmPattern, setRhythmPattern] = useState<number[]>([]);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  const difficultySettings = {
    easy: { breathDuration: 4000, patternLength: 3, qiMultiplier: 1 },
    medium: { breathDuration: 3000, patternLength: 4, qiMultiplier: 1.2 },
    hard: { breathDuration: 2000, patternLength: 5, qiMultiplier: 1.5 },
    extreme: { breathDuration: 1500, patternLength: 6, qiMultiplier: 2 },
    legendary: { breathDuration: 1000, patternLength: 7, qiMultiplier: 2.5 }
  };

  const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

  const generateRhythmPattern = useCallback(() => {
    const pattern = Array.from({ length: settings.patternLength }, () => 
      Math.floor(Math.random() * 4) + 1 // 1-4 beats
    );
    setRhythmPattern(pattern);
  }, [settings.patternLength]);

  useEffect(() => {
    generateRhythmPattern();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    };
  }, [generateRhythmPattern]);

  const startChallenge = () => {
    setIsActive(true);
    setTimeLeft(timeLimit);
    setScore(0);
    setQiPoints(0);
    setCurrentPatternIndex(0);
    generateRhythmPattern();
    startBreathCycle();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBreathCycle = () => {
    setBreathPhase('inhale');
    setBreathProgress(0);
    
    const phaseDuration = settings.breathDuration / 4;
    
    breathTimerRef.current = setInterval(() => {
      setBreathProgress(prev => {
        const newProgress = prev + (100 / (phaseDuration / 100));
        
        if (newProgress >= 100) {
          // Transition to next phase
          switch (breathPhase) {
            case 'inhale':
              setBreathPhase('hold');
              break;
            case 'hold':
              setBreathPhase('exhale');
              break;
            case 'exhale':
              setBreathPhase('rest');
              break;
            case 'rest':
              setBreathPhase('inhale');
              checkRhythmPattern();
              break;
          }
          return 0;
        }
        return newProgress;
      });
    }, 100);
  };

  const checkRhythmPattern = () => {
    // Player should press at the right moment based on pattern
    // const expectedBeat = rhythmPattern[currentPatternIndex];
    const accuracy = Math.random() * 100; // Simulate player input accuracy
    
    if (accuracy > 70) {
      const pointsEarned = Math.floor(accuracy * settings.qiMultiplier);
      setQiPoints(prev => prev + pointsEarned);
      setScore(prev => prev + pointsEarned);
    }
    
    setCurrentPatternIndex(prev => (prev + 1) % rhythmPattern.length);
  };

  const handleBreathInput = () => {
    if (!isActive) return;
    
    const phaseAccuracy = 100 - Math.abs(breathProgress - 50); // Best at 50% progress
    const points = Math.floor(phaseAccuracy * settings.qiMultiplier * 0.1);
    
    setQiPoints(prev => prev + points);
    setScore(prev => prev + points);
  };

  const endChallenge = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    
    const success = score >= successThreshold;
    const accuracy = Math.min(100, (score / successThreshold) * 100);
    
    onComplete({
      success,
      score,
      timeTaken: timeLimit - timeLeft,
      accuracy,
      efficiency: Math.min(100, (timeLeft / timeLimit) * 100),
      bonusRewards: success ? { qi: 1 } : undefined,
      penaltyConsequences: !success ? { qi: -1 } : undefined
    });
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#4CAF50';
      case 'hold': return '#2196F3';
      case 'exhale': return '#FF9800';
      case 'rest': return '#9E9E9E';
      default: return '#4CAF50';
    }
  };

  const getPhaseInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold Breath';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
      default: return 'Breathe In';
    }
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
      <h3>Meditation Challenge</h3>
      <p>Difficulty: {difficulty.toUpperCase()}</p>
      
      {!isActive ? (
        <div>
          <p>Focus on your breathing rhythm and maintain Qi flow</p>
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
            Start Meditation
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h4>
            <p>Score: {score} / {successThreshold}</p>
            <p>Qi Points: {qiPoints}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: getPhaseColor() }}>{getPhaseInstruction()}</h4>
            <div style={{
              width: '100%',
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${breathProgress}%`,
                height: '100%',
                backgroundColor: getPhaseColor(),
                transition: 'width 0.1s ease'
              }} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p>Rhythm Pattern: {rhythmPattern.join(' - ')}</p>
            <p>Current Beat: {rhythmPattern[currentPatternIndex]}</p>
          </div>

          <button 
            onClick={handleBreathInput}
            style={{
              padding: '15px 30px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '10px'
            }}
          >
            Focus Qi
          </button>

          <br />
          
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
            End Early
          </button>
        </div>
      )}
    </div>
  );
};
