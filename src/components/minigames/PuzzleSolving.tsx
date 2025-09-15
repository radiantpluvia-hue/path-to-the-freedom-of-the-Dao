import React, { useState, useEffect, useRef } from 'react';
import { ChallengeResult } from '../../types/MentorTeaching';

interface PuzzleSolvingProps {
  difficulty: string;
  timeLimit?: number;
  successThreshold: number;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

interface PuzzlePiece {
  id: number;
  value: number;
  isBlank: boolean;
}

export const PuzzleSolving: React.FC<PuzzleSolvingProps> = ({
  difficulty,
  timeLimit = 300,
  successThreshold,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [puzzle, setPuzzle] = useState<PuzzlePiece[]>([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const difficultySettings = {
    easy: { gridSize: 3, shuffleMoves: 10, moveMultiplier: 1 },
    medium: { gridSize: 4, shuffleMoves: 20, moveMultiplier: 1.2 },
    hard: { gridSize: 5, shuffleMoves: 30, moveMultiplier: 1.5 },
    extreme: { gridSize: 6, shuffleMoves: 40, moveMultiplier: 2 },
    legendary: { gridSize: 7, shuffleMoves: 50, moveMultiplier: 2.5 }
  };

  const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generatePuzzle = () => {
    const totalPieces = settings.gridSize * settings.gridSize;
    const pieces: PuzzlePiece[] = [];
    
    for (let i = 1; i < totalPieces; i++) {
      pieces.push({ id: i, value: i, isBlank: false });
    }
    pieces.push({ id: totalPieces, value: 0, isBlank: true });
    
    // Shuffle the puzzle
    let shuffledPuzzle = [...pieces];
    for (let i = 0; i < settings.shuffleMoves; i++) {
      shuffledPuzzle = makeRandomMove(shuffledPuzzle);
    }
    
    setPuzzle(shuffledPuzzle);
    setMoves(0);
    setSolved(false);
  };

  const makeRandomMove = (currentPuzzle: PuzzlePiece[]): PuzzlePiece[] => {
    const blankIndex = currentPuzzle.findIndex(p => p.isBlank);
    const possibleMoves = getPossibleMoves(blankIndex, currentPuzzle);
    
    if (possibleMoves.length === 0) return currentPuzzle;
    
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    return movePiece(currentPuzzle, blankIndex, randomMove);
  };

  const getPossibleMoves = (blankIndex: number, currentPuzzle: PuzzlePiece[]): number[] => {
    void currentPuzzle; // suppress unused warning for currentPuzzle in type-only sense
    const moves: number[] = [];
    const gridSize = settings.gridSize;
    const row = Math.floor(blankIndex / gridSize);
    const col = blankIndex % gridSize;

    // Check up
    if (row > 0) moves.push(blankIndex - gridSize);
    // Check down
    if (row < gridSize - 1) moves.push(blankIndex + gridSize);
    // Check left
    if (col > 0) moves.push(blankIndex - 1);
    // Check right
    if (col < gridSize - 1) moves.push(blankIndex + 1);

    return moves;
  };

  const movePiece = (currentPuzzle: PuzzlePiece[], fromIndex: number, toIndex: number): PuzzlePiece[] => {
    const newPuzzle = [...currentPuzzle];
    [newPuzzle[fromIndex], newPuzzle[toIndex]] = [newPuzzle[toIndex], newPuzzle[fromIndex]];
    return newPuzzle;
  };

  const handlePieceClick = (clickedIndex: number) => {
    if (!isActive || solved) return;

    const blankIndex = puzzle.findIndex(p => p.isBlank);
    const possibleMoves = getPossibleMoves(blankIndex, puzzle);

    if (possibleMoves.includes(clickedIndex)) {
      const newPuzzle = movePiece(puzzle, blankIndex, clickedIndex);
      setPuzzle(newPuzzle);
      setMoves(prev => prev + 1);

      // Check if puzzle is solved
      if (isPuzzleSolved(newPuzzle)) {
        setSolved(true);
        const puzzleScore = calculateScore();
        setScore(puzzleScore);
        
        if (puzzleScore >= successThreshold) {
          setTimeout(() => endChallenge(), 1000);
        }
      }
    }
  };

  const isPuzzleSolved = (currentPuzzle: PuzzlePiece[]): boolean => {
    for (let i = 0; i < currentPuzzle.length - 1; i++) {
      if (currentPuzzle[i].value !== i + 1) {
        return false;
      }
    }
    return currentPuzzle[currentPuzzle.length - 1].isBlank;
  };

  const calculateScore = (): number => {
    const maxMoves = settings.gridSize * settings.gridSize * 10;
    const moveEfficiency = Math.max(0, 100 - (moves / maxMoves) * 100);
    const timeEfficiency = Math.max(0, (timeLeft / timeLimit) * 100);
    
    return Math.floor((moveEfficiency + timeEfficiency) * settings.moveMultiplier);
  };

  const startChallenge = () => {
    setIsActive(true);
    setTimeLeft(timeLimit);
    setScore(0);
    generatePuzzle();
    
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

  const endChallenge = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const finalScore = solved ? score : calculateScore();
    const success = finalScore >= successThreshold;
    
    onComplete({
      success,
      score: finalScore,
      timeTaken: timeLimit - timeLeft,
      accuracy: Math.min(100, (finalScore / successThreshold) * 100),
      efficiency: Math.min(100, (timeLeft / timeLimit) * 100),
      bonusRewards: success ? { 
        mentalFortitude: 1,
        insight: 1
      } : undefined,
      penaltyConsequences: !success ? { 
        qi: -1 
      } : undefined
    });
  };

  const renderPuzzleGrid = () => {
    const gridSize = settings.gridSize;
    const grid = [];
    
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const piece = puzzle[index];
        
        row.push(
          <div
            key={index}
            onClick={() => handlePieceClick(index)}
            style={{
              width: `${300 / gridSize}px`,
              height: `${300 / gridSize}px`,
              border: '2px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: piece.isBlank ? '#e0e0e0' : '#4CAF50',
              color: piece.isBlank ? '#666' : 'white',
              cursor: piece.isBlank ? 'default' : 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            {!piece.isBlank && piece.value}
          </div>
        );
      }
      grid.push(
        <div key={i} style={{ display: 'flex' }}>
          {row}
        </div>
      );
    }
    
    return grid;
  };

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h3>Puzzle Solving Challenge</h3>
      <p>Difficulty: {difficulty.toUpperCase()}</p>
      
      {!isActive ? (
        <div>
          <p>Rearrange the tiles to solve the puzzle</p>
          <p>Click adjacent tiles to move them to the empty space</p>
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
            Start Puzzle
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</h4>
            <p>Moves: {moves}</p>
            <p>Score: {score} / {successThreshold}</p>
            {solved && <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>Puzzle Solved!</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            {renderPuzzleGrid()}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={generatePuzzle}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Reset Puzzle
            </button>
            
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
        </div>
      )}
    </div>
  );
};
