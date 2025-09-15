import { useState, useEffect } from 'react';

interface MeditationProps {
  onComplete: (result: { success: boolean; score: number }) => void;
  difficulty?: number;
}

export function MeditationRhythm({ onComplete, difficulty = 1 }: MeditationProps) {
  const [rhythm, setRhythm] = useState<number[]>([]);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Generate rhythm pattern based on difficulty
    const pattern = Array.from({ length: 8 + difficulty * 2 }, () => 
      Math.random() > 0.3 ? 1 : 0
    );
    setRhythm(pattern);
  }, [difficulty]);

  useEffect(() => {
    if (!isActive) return;
    
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

  return (
    <div className="meditation-ui p-6 bg-gradient-to-b from-purple-900 to-indigo-900 rounded-lg">
      <h3 className="text-xl text-white mb-4">Dao Meditation Rhythm</h3>
      <p className="text-gray-300 mb-4">
        Focus on the Dao rhythm. Press when you feel the spiritual pulse.
      </p>
      
      <div className="rhythm-display mb-4">
        {rhythm.map((note, i) => (
          <div 
            key={i}
            className={`inline-block w-8 h-8 mx-1 rounded ${
              i === currentBeat ? 'bg-yellow-400' :
              i < currentBeat ? (note ? 'bg-green-500' : 'bg-gray-600') :
              'bg-gray-400'
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        <button 
          onClick={handleBeat}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          {!isActive ? 'Begin Meditation' : 'Channel Qi'}
        </button>
        <p className="mt-2 text-gray-300">Score: {score}/{rhythm.filter(n => n).length}</p>
      </div>
    </div>
  );
}