import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import ModalCloseButton from '@/components/ui/ModalCloseButton';
import { tierLabelFor } from '../../data/statTiers';
// Removed unused import

interface RivalInfoPanelProps {
  rivalId: string;
  onClose: () => void;
  onChallenge: (rivalId: string) => void;
}

export const RivalInfoPanel: React.FC<RivalInfoPanelProps> = ({
  rivalId,
  onClose,
  onChallenge
}) => {
  const store = useGameStore();
  const rival = store.getRivalById(rivalId);
  const relationship = store.getRivalRelationship(rivalId);
  const canEncounter = store.canEncounterRival(rivalId);
  const status = store.getRivalEncounterStatus(rivalId); // detailed status with cooldown and reason
  const encounters = store.getRivalEncounters(rivalId);

  if (!rival) {
    return (
      <div className="rival-info-panel">
        <div className="panel-header">
          <h3>Rival Not Found</h3>
          <ModalCloseButton onClick={onClose} ariaLabel="Close rival panel" title="Close" />
        </div>
        <p>This rival could not be found.</p>
      </div>
    );
  }

  const getRelationshipColor = (rel: number) => {
    if (rel >= 50) return 'text-green-600';
    if (rel >= 0) return 'text-yellow-600';
    if (rel >= -50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRelationshipText = (rel: number) => {
    if (rel >= 50) return 'Ally';
    if (rel >= 0) return 'Neutral';
    if (rel >= -50) return 'Rival';
    return 'Enemy';
  };

  return (
    <div className="rival-info-panel bg-gray-800 text-white p-6 rounded-lg max-w-2xl mx-auto">
      <div className="panel-header flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{rival.name}</h3>
        <ModalCloseButton onClick={onClose} ariaLabel="Close rival panel" title="Close" />
      </div>

      <div className="rival-details grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="basic-info">
          <h4 className="text-lg font-semibold mb-2">Basic Information</h4>
          <div className="info-grid space-y-2">
            <div><strong>Title:</strong> {rival.title}</div>
            <div><strong>Realm:</strong> {rival.realm.replace('_', ' ').toUpperCase()}</div>
            <div><strong>Level:</strong> {rival.level}</div>
            <div><strong>Sect:</strong> {rival.sect.replace('_', ' ').toUpperCase()}</div>
            <div><strong>Faction:</strong> {rival.faction.replace('_', ' ').toUpperCase()}</div>
            <div><strong>Personality:</strong> {rival.personality}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats">
          <h4 className="text-lg font-semibold mb-2">Combat Stats</h4>
          <div className="stats-grid grid grid-cols-2 gap-2">
            <div className="stat-item">
              <div className="text-sm text-gray-400">HP</div>
              <div className="text-lg font-bold text-red-400">{rival.stats.hp}</div>
            </div>
            <div className="stat-item">
              <div className="text-sm text-gray-400">Qi</div>
              <div className="text-lg font-bold text-blue-400">{tierLabelFor(rival.stats.qi)}</div>
            </div>
            <div className="stat-item">
              <div className="text-sm text-gray-400">Attack</div>
              <div className="text-lg font-bold text-orange-400">{tierLabelFor(rival.stats.atk)}</div>
            </div>
            <div className="stat-item">
              <div className="text-sm text-gray-400">Defense</div>
              <div className="text-lg font-bold text-green-400">{tierLabelFor(rival.stats.def)}</div>
            </div>
            <div className="stat-item">
              <div className="text-sm text-gray-400">Speed</div>
              <div className="text-lg font-bold text-purple-400">{tierLabelFor(rival.stats.speed)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship Status */}
      <div className="relationship-section mt-4 p-3 bg-gray-700 rounded">
        <h4 className="text-lg font-semibold mb-2">Relationship Status</h4>
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-lg font-bold ${getRelationshipColor(relationship)}`}>
              {getRelationshipText(relationship)}
            </span>
            <span className="text-gray-400 ml-2">({relationship})</span>
          </div>
          <div className="text-sm text-gray-400">
            Encounters: {rival.encounterCount}
          </div>
        </div>
      </div>

      {/* Special Abilities */}
      {rival.specialAbilities.length > 0 && (
        <div className="abilities-section mt-4">
          <h4 className="text-lg font-semibold mb-2">Special Abilities</h4>
          <div className="abilities-list flex flex-wrap gap-2">
            {rival.specialAbilities.map((ability, index) => (
              <span
                key={index}
                className="ability-tag bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                {ability.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Techniques */}
      {rival.techniques.length > 0 && (
        <div className="techniques-section mt-4">
          <h4 className="text-lg font-semibold mb-2">Known Techniques</h4>
          <div className="techniques-list flex flex-wrap gap-2">
            {rival.techniques.map((technique, index) => (
              <span
                key={index}
                className="technique-tag bg-purple-600 text-white px-2 py-1 rounded text-sm"
              >
                {technique.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="description-section mt-4 p-3 bg-gray-700 rounded">
        <h4 className="text-lg font-semibold mb-2">Description</h4>
        <p className="text-gray-300">{rival.description}</p>
      </div>

      {/* Recent Encounters */}
      {encounters.length > 0 && (
        <div className="encounters-section mt-4">
          <h4 className="text-lg font-semibold mb-2">Recent Encounters</h4>
          <div className="encounters-list space-y-2 max-h-32 overflow-y-auto">
            {encounters.slice(-3).map((encounter, index) => (
              <div key={index} className="encounter-item p-2 bg-gray-700 rounded text-sm">
                <div className="flex justify-between">
                  <span>{encounter.description || 'Encounter'}</span>
                  <span className={`font-bold ${
                    encounter.outcome === 'victory' ? 'text-green-400' :
                    encounter.outcome === 'defeat' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {encounter.outcome}
                  </span>
                </div>
                <div className="text-gray-400 text-xs">Year {encounter.year}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons mt-6 flex gap-3">
        {canEncounter && !rival.defeated ? (
          <button
            onClick={() => onChallenge(rivalId)}
            className="challenge-button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold flex-1"
          >
            Challenge to Combat
          </button>
        ) : rival.defeated ? (
          <div className="defeated-notice bg-gray-600 text-gray-300 px-4 py-2 rounded text-center flex-1">
            Defeated
          </div>
        ) : (
          <div className="cooldown-notice bg-gray-600 text-gray-300 px-4 py-2 rounded text-center flex-1">
            ⏰ Cooldown Active: {status.reason || 'Unavailable'}{!status.canEncounter && typeof status.cooldownDays === 'number' ? ` (${status.cooldownDays} day(s) remaining)` : ''}
          </div>
        )}

        <button
          onClick={onClose}
          className="close-button bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RivalInfoPanel;
