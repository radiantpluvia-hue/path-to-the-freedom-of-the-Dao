import { useState, useEffect } from 'react';

interface DuelProps {
  onComplete: (result: { success: boolean; level: number }) => void;
  difficulty?: number;
}

export function DuelIntent({ onComplete, difficulty = 1 }: DuelProps) {
  const [intent, setIntent] = useState(0);
  const [enemyAttack, setEnemyAttack] = useState(0);
  const [parryWindow, setParryWindow] = useState(false);
  const [round, setRound] = useState(0);
  const [maxRounds] = useState(5 + difficulty);
  const [successfulParries, setSuccessfulParries] = useState(0);

  useEffect(() => {
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
    } else if (parryWindow) {
      // Early parry penalty
      setIntent(prev => Math.max(0, prev - 5));
    }
  };

  const getIntentColor = () => {
    if (intent < 30) return 'bg-red-500';
    if (intent < 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="duel-ui p-6 bg-gradient-to-b from-gray-900 to-blue-900 rounded-lg">
      <h3 className="text-xl text-white mb-4">Sword Intent Duel</h3>
      <p className="text-gray-300 mb-4">
        Channel your sword intent. Parry at the peak of enemy attacks!
      </p>

      <div className="intent-meter mb-4">
        <label className="text-gray-300">Sword Intent</label>
        <div className="w-full h-6 bg-gray-700 rounded-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getIntentColor()}`}
            style={{ width: `${intent}%` }}
          />
        </div>
      </div>

      <div className="enemy-attack mb-4">
        <label className="text-gray-300">Enemy Attack Power</label>
        <div className="w-full h-6 bg-gray-700 rounded-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              parryWindow ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
            }`}
            style={{ width: `${enemyAttack}%` }}
          />
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={parry}
          className={`px-6 py-3 text-white rounded-lg ${
            parryWindow ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 
            'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          Parry!
        </button>
        <p className="mt-2 text-gray-300">
          Round: {round + 1}/{maxRounds} | Successful Parries: {successfulParries}
        </p>
        {parryWindow && (
          <p className="text-yellow-400 animate-pulse">PARRY NOW!</p>
        )}
      </div>
    </div>
  );
}