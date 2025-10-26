import React, { useState, useMemo } from 'react';
import { logger } from '@/utils/logger';
import TierBadge from '@/components/ui/TierBadge';
import { useGameStore } from '../store/useGameStore';
import { DomainSystem } from '../systems/DomainSystem';
import RichTooltip from '@/components/ui/RichTooltip';
import type { TerritoryState, FactionState } from '../types';
import FormationSelector from './FormationSelector';
import RandomizedCharacters from './RandomizedCharacters';
import './DomainPanel.css';

const DomainPanel: React.FC = () => {
  const { systems, addDomainResource, setDomainUnlock, addDomainBonus: _addDomainBonus, gainDomainXP, addEventLog } = useGameStore();
  const domainState = systems.domain;

  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  const domainSystem = useMemo(() => {
    if (domainState) {
      return new DomainSystem(domainState);
    }
    return null;
  }, [domainState]);

  const resourceIncome = useMemo(() => {
    return domainSystem ? domainSystem.calculateResourceGeneration() : {
      gold: 0,
      food: 0,
      spirit_ore: 0,
      spirit_stone: 0,
      influencePoint: 0
    };
  }, [domainSystem]);

  const territories = Object.values(domainState?.territories || {});
  const factions = Object.values(domainState?.factions || {});

  const recruitTerritoryGarrison = useGameStore(s => (s as any).recruitTerritoryGarrison);

  const handleTerritoryAction = (territoryId: string, action: string) => {
    try {
      if (action === 'recruit') {
        // simple default: hire 10 troops of quality 1.0 — this is intentionally conservative
        const ok = recruitTerritoryGarrison?.(territoryId, 10, 1.0);
        addEventLog?.(ok ? `Recruited 10 troops to ${territoryId}.` : `Recruit failed for ${territoryId}.`);
        return;
      }
      // Placeholder for other territory actions
      addEventLog?.(`Territory ${territoryId}: ${action} (coming soon)`);
    } catch (e) { void e; }
  };

  const handleFactionAction = (factionId: string, action: string) => {
    // Placeholder actions: log intent so players get feedback
    try { addEventLog?.(`Faction ${factionId}: ${action} (coming soon)`); } catch (e) { void e; }
  };
  // intentionally reference addDomainBonus alias to silence unused-var warning
  void _addDomainBonus;

  const getTerritoryStatus = (territory: TerritoryState) => {
    if (territory.contestedSince) {
      return 'contested';
    }
    if (territory.ownerFactionId) {
      return 'controlled';
    }
    return 'neutral';
  };

  const getFactionRelationship = (faction: FactionState) => {
    // Use faction.contribution as proxy for relationship for now
    const influence = faction.contribution || 0;
    if (influence > 50) return 'allied';
    if (influence > 0) return 'friendly';
    if (influence > -25) return 'neutral';
    if (influence > -50) return 'unfriendly';
    return 'hostile';
  };

  if (!domainState) {
    return (
      <div className="domain-panel">
        <h3>Domain Management</h3>
        <p>Domain system not initialized.</p>
      </div>
    );
  }

  return (
    <div className="domain-panel">
      <h3>Domain Management</h3>

      {/* Domain Overview */}
      <div className="domain-overview">
        <div className="domain-header">
          <h4>Domain Level {domainState.level}</h4>
          <div className="domain-xp">
            <span>XP: {domainState.xp}</span>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{
                  width: `${(domainState.xp % 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="domain-resources">
          <h4>Resources</h4>
            <div className="resource-grid">
              <RichTooltip key="gold" content={`Gold • income: +${resourceIncome.gold}/tick`}>
                <div className="resource-item">
                  <div className="resource-label">Gold</div>
                  <div className="resource-value">{resourceIncome.gold}/tick</div>
                </div>
              </RichTooltip>
              <RichTooltip key="food" content={`Food • income: +${resourceIncome.food}/tick`}>
                <div className="resource-item">
                  <div className="resource-label">Food</div>
                  <div className="resource-value">{resourceIncome.food}/tick</div>
                </div>
              </RichTooltip>
              <RichTooltip key="spirit_ore" content={`Spirit Ore • income: +${resourceIncome.spirit_ore}/tick`}>
                <div className="resource-item">
                  <div className="resource-label">Spirit Ore</div>
                  <div className="resource-value">{resourceIncome.spirit_ore}/tick</div>
                </div>
              </RichTooltip>
              <RichTooltip key="spirit_stone" content={`Spirit Stone • income: +${resourceIncome.spirit_stone}/tick`}>
                <div className="resource-item">
                  <div className="resource-label">Spirit Stone</div>
                  <div className="resource-value">{resourceIncome.spirit_stone}/tick</div>
                </div>
              </RichTooltip>
              <RichTooltip key="influence" content={`Influence • income: +${resourceIncome.influencePoint}/tick`}>
                <div className="resource-item">
                  <div className="resource-label">Influence</div>
                  <div className="resource-value">{resourceIncome.influencePoint}/tick</div>
                </div>
              </RichTooltip>
          </div>
        </div>
      </div>

      {/* Territories and Factions in a responsive grid */}
      <div className="territories-section" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 16,
        alignItems: 'start'
      }}>
        <div style={{ minWidth: 0 }}>
          <h4>Territories ({territories.length})</h4>
          {territories.length === 0 ? (
            <p className="empty-state">No territories controlled. Expand your domain to gain resources and influence.</p>
          ) : (
            <div className="territories-grid">
              {territories.map(territory => (
                <div
                  key={territory.id}
                  className={`territory-card ${getTerritoryStatus(territory)} ${selectedTerritory === territory.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTerritory(selectedTerritory === territory.id ? null : territory.id)}
                >
                  <div className="territory-header">
                    <h5>{territory.nodeType.charAt(0).toUpperCase() + territory.nodeType.slice(1)}</h5>
                    <span className={`rarity-badge rarity-${territory.rarity}`}>
                      <TierBadge tier={territory.rarity} />
                    </span>
                  </div>

                  <div className="territory-info">
                    <div className="info-item">
                      <span>Owner:</span>
                      <span>{territory.ownerFactionId || 'Neutral'}</span>
                    </div>

                    {territory.garrison && (
                      <div className="info-item">
                        <span>Garrison:</span>
                        <span>{territory.garrison.troops} troops</span>
                      </div>
                    )}

                    <div className="influence-breakdown">
                      {Object.entries(territory.influence).map(([factionId, influence]) => (
                        <div key={factionId} className="influence-item">
                          <span>{factionId}:</span>
                          <span className={influence > 0 ? 'positive' : 'negative'}>
                            {influence > 0 ? '+' : ''}{influence}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTerritory === territory.id && (
                    <div className="territory-actions">
                      <RichTooltip content="Recruit garrison to bolster defense">
                        <button type="button" onClick={() => handleTerritoryAction(territory.id, 'recruit')}>
                          Recruit Garrison
                        </button>
                      </RichTooltip>
                        <RichTooltip content="Construct a structure to boost yields or defense">
                        <button type="button" onClick={() => handleTerritoryAction(territory.id, 'build')}>
                          Build Structure
                        </button>
                      </RichTooltip>
                        <RichTooltip content="Invest resources to harden defenses">
                        <button type="button" onClick={() => handleTerritoryAction(territory.id, 'fortify')}>
                          Fortify
                        </button>
                      </RichTooltip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          <h4>Factions ({factions.length})</h4>
          {factions.length === 0 ? (
            <p className="empty-state">No factions present in your domain.</p>
          ) : (
            <div className="factions-grid">
              {factions.map(faction => (
                <div
                  key={faction.id}
                  className={`faction-card ${getFactionRelationship(faction)} ${selectedFaction === faction.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFaction(selectedFaction === faction.id ? null : faction.id)}
                >
                  {/* Show randomized characters for this faction depending on its strength */}
                  <div style={{ marginBottom: 8 }}>
                    <RandomizedCharacters strength={faction.contribution || 0} size={4} seed={faction.id} />
                  </div>
                  <div className="faction-header">
                    <h5>{faction.name}</h5>
                    <span className={`relationship-badge relationship-${getFactionRelationship(faction)}`}>
                      {getFactionRelationship(faction)}
                    </span>
                  </div>

                  <div className="faction-info">
                    <div className="info-item">
                      <span>Type:</span>
                      <span>{faction.relationToPlayer || 'neutral'}</span>
                    </div>

                    <div className="info-item">
                      <span>Power:</span>
                      <span>{faction.contribution || 0}</span>
                    </div>

                    <div className="influence-summary">
                      <span>Total Influence:</span>
                      <span>{faction.influenceGlobal || 0}</span>
                    </div>
                  </div>

                  {selectedFaction === faction.id && (
                    <div className="faction-actions">
                      <RichTooltip content="Open diplomatic talks to shift relations">
                        <button onClick={() => handleFactionAction(faction.id, 'diplomacy')}>
                          Diplomacy
                        </button>
                      </RichTooltip>
                      <RichTooltip content="Propose a trade agreement">
                        <button onClick={() => handleFactionAction(faction.id, 'trade')}>
                          Trade Agreement
                        </button>
                      </RichTooltip>
                      <RichTooltip content="Seek a formal alliance">
                        <button onClick={() => handleFactionAction(faction.id, 'alliance')}>
                          Form Alliance
                        </button>
                      </RichTooltip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formation Management */}
      <div className="formation-section">
        <h4>Formation Management</h4>
        <FormationSelector
          onFormationSelect={(formationId) => logger.debug(`Selected formation: ${formationId}`)}
          unitIds={[]} // Empty for now, can be populated with domain units later
        />
        {/* intentionally reference unused binding to satisfy lint */}
        {void _addDomainBonus}
      </div>

      {/* Domain Actions */}
      <div className="domain-actions">
        <h4>Domain Actions</h4>
        <div className="action-buttons">
          <button onClick={() => gainDomainXP(10)}>
            Gain XP (Test)
          </button>
          <button onClick={() => addDomainResource('gold', 100)}>
            Add Gold (Test)
          </button>
          <button onClick={() => setDomainUnlock('advanced_buildings', true)}>
            Unlock Advanced Buildings (Test)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainPanel;
