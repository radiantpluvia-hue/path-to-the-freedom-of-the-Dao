import React from 'react';
import { getActiveSynergies, calculateSynergyBonuses } from '@/utils/physiqueSynergies';
import { Physique } from '@/types';

interface PhysiqueSynergyPanelProps {
  activePhysiques: Physique[]; // Array of active physique objects
  className?: string;
}

export const PhysiqueSynergyPanel: React.FC<PhysiqueSynergyPanelProps> = ({
  activePhysiques,
  className = ''
}) => {
  // Narrow the loosely-typed synergies to a predictable shape for rendering
  const activeSynergies = getActiveSynergies(activePhysiques) as Array<{
    id: string;
    name: string;
    description?: string;
    bonuses: Record<string, number>;
    requiredPhysiques: string[];
  }>;
  const synergyBonuses = calculateSynergyBonuses(activePhysiques);

  if (activeSynergies.length === 0) {
    return (
      <div className={`physique-synergy-panel ${className}`}>
        <h3 className="text-lg font-bold text-amber-400 mb-2">Physique Synergies</h3>
        <p className="text-gray-400 text-sm">
          No physique synergies active. Combine compatible physiques to unlock powerful synergies.
        </p>
      </div>
    );
  }

  const formatBonusName = (bonusType: string): string => {
    return bonusType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatBonusValue = (value: number, bonusType: string): string => {
    if (bonusType.includes('speed') || bonusType.includes('damage') || bonusType.includes('resistance')) {
      return `+${(value * 100).toFixed(1)}%`;
    }
    return `+${value.toFixed(1)}`;
  };

  return (
    <div className={`physique-synergy-panel ${className}`}>
      <h3 className="text-lg font-bold text-amber-400 mb-4">Active Physique Synergies</h3>

      <div className="space-y-4">
        {activeSynergies.map((synergy, index) => (
          <div
            key={synergy.id}
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/30"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-md font-semibold text-purple-300">{synergy.name}</h4>
              <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                Synergy #{index + 1}
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              {synergy.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(synergy.bonuses as Record<string, number>).map(([bonusType, bonusValue]: [string, number]) => (
                <div
                  key={bonusType}
                  className="flex justify-between items-center bg-black/20 rounded px-3 py-2"
                >
                  <span className="text-gray-300 text-sm">
                    {formatBonusName(bonusType)}:
                  </span>
                  <span className="text-green-400 font-semibold text-sm">
                    {formatBonusValue(bonusValue, bonusType)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <div className="text-xs text-gray-400">
                <span className="font-medium">Required Physiques:</span>{' '}
                {synergy.requiredPhysiques.map(physiqueId => {
                  const physique = activePhysiques.find((p: Physique) => p.id === physiqueId);
                  return physique ? physique.name : physiqueId;
                }).join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(synergyBonuses).length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
          <h4 className="text-md font-semibold text-green-300 mb-3">Total Synergy Bonuses</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(synergyBonuses as Record<string, number>).map(([bonusType, totalValue]: [string, number]) => (
              <div
                key={bonusType}
                className="flex justify-between items-center bg-black/30 rounded px-3 py-2"
              >
                <span className="text-gray-300 text-sm">
                  {formatBonusName(bonusType)}:
                </span>
                <span className="text-green-400 font-bold text-sm">
                  {formatBonusValue(totalValue, bonusType)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>
          * Synergy bonuses are multiplicative and stack with individual physique effects.
          Combine more physiques to discover new synergies!
        </p>
      </div>
    </div>
  );
};

export default PhysiqueSynergyPanel;
