import React, { useState, useMemo } from 'react';
import RichTooltip from '@/components/ui/RichTooltip';
import TierBadge from '@/components/ui/TierBadge';
import { EnhancedFormation, FORMATIONS } from '../data/formations';
import NodeMapSystem, { FormationLayout } from '../systems/NodeMapSystem';

interface FormationSelectorProps {
  selectedFormation?: string;
  onFormationSelect: (formationId: string) => void;
  unitIds: string[];
  className?: string;
}

const FormationSelector: React.FC<FormationSelectorProps> = ({
  selectedFormation,
  onFormationSelect,
  unitIds,
  className = ''
}) => {
  const [previewFormation, setPreviewFormation] = useState<EnhancedFormation | null>(null);
  const [layout, setLayout] = useState<FormationLayout | null>(null);

  const nodeMapSystem = useMemo(() => NodeMapSystem.getInstance(), []);

  const handleFormationPreview = (formation: EnhancedFormation) => {
    setPreviewFormation(formation);
    const newLayout = nodeMapSystem.createFormationLayout(formation, 5, 5);
    const assignedLayout = nodeMapSystem.assignUnitsToFormation(newLayout, unitIds);
    setLayout(assignedLayout);
  };

  const handleFormationSelect = (formationId: string) => {
    onFormationSelect(formationId);
    setPreviewFormation(null);
    setLayout(null);
  };

  const renderFormationGrid = () => {
    if (!layout) return null;

    const gridSize = 11; // 11x11 grid to show positions around center
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

    // Mark formation positions on grid
    layout.nodes.forEach(node => {
      const gridX = node.x;
      const gridY = node.y;
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        grid[gridY][gridX] = node;
      }
    });

    return (
      <div className="formation-grid">
        {grid.map((row, y) => (
          <div key={y} className="formation-row">
            {row.map((node, x) => (
              <div
                key={`${x}-${y}`}
                className={`formation-cell ${node ? 'occupied' : 'empty'}`}
              >
                {node ? (
                  <RichTooltip content={`Position: ${node.positionBonus ? Object.entries(node.positionBonus).map(([key, value]) => `${key}: ${value}`).join(', ') : 'No bonuses'}`}>
                    <div>
                      {node.occupied && (
                        <div className={`unit-marker role-${node.positionBonus ? 'front' : 'back'}`}>
                          {node.unitId ? '⚔️' : '👤'}
                        </div>
                      )}
                      <div className="position-role">{node.positionBonus ? 'front' : 'back'}</div>
                    </div>
                  </RichTooltip>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const getFormationEffectiveness = (_formation: EnhancedFormation) => {
    if (!layout) return 0;
    return nodeMapSystem.getFormationEffectiveness(layout);
  };

  return (
    <div className={`formation-selector ${className}`}>
      <h3>Formation Selection</h3>

      <div className="formation-list">
  {FORMATIONS.map(_formation => (
          <div
            key={_formation.id}
            className={`formation-card ${selectedFormation === _formation.id ? 'selected' : ''}`}
            onClick={() => handleFormationPreview(_formation)}
          >
            <div className="formation-header">
              <h4>{_formation.name}</h4>
              <div style={{ marginLeft: 8 }}>
                <TierBadge tier={_formation.tier} small={true} />
              </div>
            </div>

            <p className="formation-description">{_formation.description}</p>

            <div className="formation-stats">
              <div className="stat-group">
                <span className="stat-label">Positions:</span>
                <span className="stat-value">{(_formation.positions || []).length}</span>
              </div>

                  {_formation.globalBonuses && (
                <div className="bonus-group">
                    {_formation.globalBonuses.flankingEfficiency !== undefined && _formation.globalBonuses.flankingEfficiency !== 1 && (
                    <div className="bonus-item">
                      <span className="bonus-label">Flanking:</span>
                      <span className={`bonus-value ${_formation.globalBonuses.flankingEfficiency > 1 ? 'positive' : 'negative'}`}>
                        {((_formation.globalBonuses.flankingEfficiency - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}

                    {_formation.globalBonuses.backAttackEfficiency !== undefined && _formation.globalBonuses.backAttackEfficiency !== 1 && (
                    <div className="bonus-item">
                      <span className="bonus-label">Back Attack:</span>
                      <span className={`bonus-value ${_formation.globalBonuses.backAttackEfficiency > 1 ? 'positive' : 'negative'}`}>
                        {((_formation.globalBonuses.backAttackEfficiency - 1) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}

                    {_formation.globalBonuses.coordinationBonus !== undefined && _formation.globalBonuses.coordinationBonus > 0 && (
                    <div className="bonus-item">
                      <span className="bonus-label">Coordination:</span>
                      <span className="bonus-value positive">+{_formation.globalBonuses.coordinationBonus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button type="button"
              className="select-formation-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleFormationSelect(_formation.id);
              }}
              disabled={selectedFormation === _formation.id}
            >
              {selectedFormation === _formation.id ? 'Selected' : 'Select Formation'}
            </button>
          </div>
        ))}
      </div>

      {previewFormation && layout && (
        <div className="formation-preview">
          <h4>Formation Preview: {previewFormation.name}</h4>

          <div className="preview-stats">
            <div className="effectiveness-meter">
              <span className="effectiveness-label">Effectiveness:</span>
              <div className="effectiveness-bar">
                <div
                  className="effectiveness-fill"
                  style={{ width: `${getFormationEffectiveness(previewFormation)}%` }}
                ></div>
              </div>
              <span className="effectiveness-value">{getFormationEffectiveness(previewFormation).toFixed(1)}%</span>
            </div>
          </div>

          <div className="formation-visualization">
            {renderFormationGrid()}
          </div>

          <div className="position-legend">
            <div className="legend-item">
              <div className="legend-color front"></div>
              <span>Front Line</span>
            </div>
            <div className="legend-item">
              <div className="legend-color back"></div>
              <span>Back Line</span>
            </div>
            <div className="legend-item">
              <div className="legend-color flank"></div>
              <span>Flank</span>
            </div>
            <div className="legend-item">
              <div className="legend-color center"></div>
              <span>Center</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationSelector;
