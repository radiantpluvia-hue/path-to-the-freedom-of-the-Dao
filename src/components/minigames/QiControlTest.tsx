import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChallengeResult } from '../../types/MentorTeaching';

interface QiControlTestProps {
  difficulty: string;
  timeLimit?: number;
  successThreshold: number;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

export const QiControlTest: React.FC<QiControlTestProps> = ({
  difficulty,
  timeLimit = 300,
  successThreshold,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentTarget, setCurrentTarget] = useState({ x: 50, y: 50, size: 30 });
  const [qiPosition, setQiPosition] = useState({ x: 50, y: 50 });
  const [isControlling, setIsControlling] = useState(false);
  const [precision, setPrecision] = useState(0);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const difficultySettings = {
    easy: { targetSize: 40, moveSpeed: 2, spawnRate: 2000, precisionMultiplier: 1 },
    medium: { targetSize: 30, moveSpeed: 3, spawnRate: 1500, precisionMultiplier: 1.2 },
    hard: { targetSize: 25, moveSpeed: 4, spawnRate: 1000, precisionMultiplier: 1.5 },
    extreme: { targetSize: 20, moveSpeed: 5, spawnRate: 800, precisionMultiplier: 2 },
    legendary: { targetSize: 15, moveSpeed: 6, spawnRate: 600, precisionMultiplier: 2.5 }
  };

  const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    };
  }, []);

  const startChallenge = () => {
    setIsActive(true);
    setTimeLeft(timeLimit);
    setScore(0);
    setPrecision(0);
    setTargetsHit(0);
    setTotalTargets(0);
    spawnNewTarget();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Mouse movement for Qi control
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setQiPosition({ x, y });
      checkTargetHit();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  };

  const spawnNewTarget = () => {
    if (!isActive) return;
    
    const newTarget = {
      x: Math.random() * 80 + 10, // 10-90%
      y: Math.random() * 80 + 10,
      size: settings.targetSize
    };
    
    setCurrentTarget(newTarget);
    setTotalTargets(prev => prev + 1);
    
    targetTimerRef.current = setTimeout(() => {
      if (isActive) {
        spawnNewTarget();
      }
    }, settings.spawnRate);
  };

  const checkTargetHit = () => {
    const distance = Math.sqrt(
      Math.pow(qiPosition.x - currentTarget.x, 2) +
      Math.pow(qiPosition.y - currentTarget.y, 2)
    );

    if (distance < currentTarget.size / 2) {
      // Target hit!
      const hitPrecision = 100 - (distance / (currentTarget.size / 2)) * 100;
      const points = Math.floor(hitPrecision * settings.precisionMultiplier);
      
      setScore(prev => prev + points);
      setPrecision(prev => (prev + hitPrecision) / 2);
      setTargetsHit(prev => prev + 1);
      
      spawnNewTarget();
    }
  };

  const endChallenge = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    
    const success = score >= successThreshold;
    const accuracy = Math.min(100, (targetsHit / totalTargets) * 100);
    
    onComplete({
      success,
      score,
      timeTaken: timeLimit - timeLeft,
      accuracy,
      efficiency: Math.min(100, (timeLeft / timeLimit) * 100),
      bonusRewards: success ? { 
        qiControl: 1,
        insight: 1
      } : undefined,
      penaltyConsequences: !success ? { 
        qi: -1 
      } : undefined
    });
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw target
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(
      (currentTarget.x / 100) * canvas.width,
      (currentTarget.y / 100) * canvas.height,
      currentTarget.size / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
    // Draw Qi point
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(
      (qiPosition.x / 100) * canvas.width,
      (qiPosition.y / 100) * canvas.height,
      8,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
    // Draw connection line if controlling
    if (isControlling) {
      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        (qiPosition.x / 100) * canvas.width,
        (qiPosition.y / 100) * canvas.height
      );
      ctx.lineTo(
        (currentTarget.x / 100) * canvas.width,
        (currentTarget.y / 100) * canvas.height
      );
      ctx.stroke();
    }
  }, [currentTarget, qiPosition, isControlling]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(drawCanvas);
    return () => cancelAnimationFrame(animationFrame);
  }, [drawCanvas]);

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h3>Qi Control Test</h3>
      <p>Difficulty: {difficulty.toUpperCase()}</p>
      
      {!isActive ? (
        <div>
          <p>Control your Qi to hit the targets with precision</p>
          <p>Move your mouse to control the Qi point</p>
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
            <p>Targets Hit: {targetsHit} / {totalTargets}</p>
            <p>Precision: {precision.toFixed(1)}%</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              style={{
                border: '2px solid #333',
                borderRadius: '8px',
                backgroundColor: '#222'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              onMouseDown={() => setIsControlling(true)}
              onMouseUp={() => setIsControlling(false)}
              onMouseLeave={() => setIsControlling(false)}
              style={{
                padding: '15px 30px',
                backgroundColor: isControlling ? '#f44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {isControlling ? 'Releasing Qi...' : 'Focus Qi Control'}
            </button>
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
    </div>
  );
};
