import { useState, useEffect } from 'react';

interface ForgingProps {
  onComplete: (result: { success: boolean; quality: number }) => void;
  difficulty?: number;
}

export function ForgingGame({ onComplete, difficulty = 1 }: ForgingProps) {
  const [heat, setHeat] = useState(50);
  const [targetZone] = useState({ min: 70, max: 90 });
  const [strikes, setStrikes] = useState(0);
  const [maxStrikes] = useState(5 + difficulty);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setHeat(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 200);

    return () => clearInterval(timer);
  }, [isActive]);

  const strike = () => {
    if (!isActive) {
      setIsActive(true);
      return;
    }

    const newStrikes = strikes + 1;
    setStrikes(newStrikes);

    const inZone = heat >= targetZone.min && heat <= targetZone.max;
    const quality = inZone ? 20 : Math.max(0, 20 - Math.abs(heat - 80));

    if (newStrikes >= maxStrikes) {
      const totalQuality = quality * newStrikes;
      onComplete({ 
        success: totalQuality > maxStrikes * 15, 
        quality: totalQuality 
      });
    }
  };

  const getHeatColor = () => {
    if (heat < 30) return 'bg-blue-500';
    if (heat < 60) return 'bg-yellow-500'; 
    if (heat < targetZone.min) return 'bg-orange-500';
    if (heat <= targetZone.max) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <div className="forging-ui p-6 bg-gradient-to-b from-red-900 to-orange-900 rounded-lg">
      <h3 className="text-xl text-white mb-4">Spiritual Forging</h3>
      <p className="text-gray-300 mb-4">
        Strike when the spiritual fire reaches the perfect temperature!
      </p>

      <div className="heat-meter mb-4">
        <div className="w-full h-8 bg-gray-700 rounded-lg overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${getHeatColor()}`}
            style={{ width: `${heat}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>Cold</span>
          <span className="text-green-400">Perfect Zone: {targetZone.min}-{targetZone.max}</span>
          <span>Overheated</span>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={strike}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          disabled={strikes >= maxStrikes}
        >
          {!isActive ? 'Begin Forging' : 'Strike!'}
        </button>
        <p className="mt-2 text-gray-300">
          Strikes: {strikes}/{maxStrikes} | Heat: {Math.round(heat)}°
        </p>
      </div>
    </div>
  );
}