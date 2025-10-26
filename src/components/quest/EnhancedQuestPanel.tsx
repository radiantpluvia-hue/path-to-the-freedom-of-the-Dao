/* eslint-disable no-restricted-imports -- component imports EnhancedQuestSystem for display */
import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { Card } from '../core/Card';
import { Progress } from '../core/Progress';
import { EnhancedQuest, QuestType, QuestDifficulty } from '../../systems/EnhancedQuestSystem';
import SmallChip from '../ui/SmallChip';

interface EnhancedQuestPanelProps {
  quests: EnhancedQuest[];
  onQuestSelect?: (questId: string) => void;
  showType?: QuestType;
  maxQuests?: number;
}

// Button import removed (unused)
export const EnhancedQuestPanel: React.FC<EnhancedQuestPanelProps> = ({
  quests,
  onQuestSelect,
  showType,
  maxQuests = 5
}) => {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  // Filter quests by type if specified
  const filteredQuests = showType 
    ? quests.filter(quest => quest.type === showType)
    : quests;

  // Sort quests by priority (main > side > daily > achievement)
  const sortedQuests = filteredQuests
    .slice(0, maxQuests)
    .sort((a, b) => {
      const typePriority = { main: 0, side: 1, sect: 2, daily: 3, achievement: 4 };
      return typePriority[a.type] - typePriority[b.type];
    });

  const getDifficultyColor = (difficulty: QuestDifficulty): string => {
    switch (difficulty) {
      case 'trivial': return '#10b981'; // green
      case 'easy': return '#3b82f6'; // blue
      case 'normal': return '#f59e0b'; // yellow
      case 'hard': return '#ef4444'; // red
      case "D": return '#8b5cf6'; // purple
      default: return '#6b7280'; // gray
    }
  };

  const getTypeIcon = (type: QuestType): string => {
    switch (type) {
      case 'main': return '📜';
      case 'side': return '📋';
      case 'sect': return '🏛️';
      case 'daily': return '🌅';
      case 'achievement': return '🏆';
      default: return '❓';
    }
  };

  const getQuestProgress = (quest: EnhancedQuest) => {
    const requiredObjectives = quest.objectives.filter(obj => !obj.isOptional);
    const completedObjectives = requiredObjectives.filter(obj => obj.isCompleted);
    return {
      completed: completedObjectives.length,
      total: requiredObjectives.length,
      percentage: requiredObjectives.length > 0 ? (completedObjectives.length / requiredObjectives.length) * 100 : 0
    };
  };

  const getObjectiveProgress = (objective: any) => {
    const current = objective.currentProgress || 0;
    const target = typeof objective.value === 'number' ? objective.value : 1;
    return {
      current,
      target,
      percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0
    };
  };

  const handleQuestClick = (questId: string) => {
    setSelectedQuest(selectedQuest === questId ? null : questId);
    if (onQuestSelect) {
      onQuestSelect(questId);
    }
  };

  // Animation for quest completion
  useEffect(() => {
    const newlyCompleted = quests
      .filter(quest => quest.status === 'completed' && !completedQuests.has(quest.id))
      .map(quest => quest.id);

    if (newlyCompleted.length > 0) {
      setCompletedQuests(prev => new Set([...prev, ...newlyCompleted]));
      
      // Show completion animation/notification
      newlyCompleted.forEach(questId => {
        const quest = quests.find(q => q.id === questId);
        if (quest) {
          // You could trigger a toast notification here
          logger.debug(`Quest completed: ${quest.title}`);
        }
      });
    }
  }, [quests, completedQuests]);

  if (sortedQuests.length === 0) {
    return (
      <Card title={`${getTypeIcon(showType || 'main')} ${showType ? showType.charAt(0).toUpperCase() + showType.slice(1) : 'Active'} Quests`}>
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--muted)', 
          padding: '20px',
          fontStyle: 'italic'
        }}>
          No active quests. Continue your cultivation journey to unlock new quests.
        </div>
      </Card>
    );
  }

  return (
    <Card title={`${getTypeIcon(showType || 'main')} ${showType ? showType.charAt(0).toUpperCase() + showType.slice(1) : 'Active'} Quests`} aria-label={`${showType || 'Active'} quests list`}>
      <div style={{ display: 'grid', gap: '12px' }}>
        {sortedQuests.map(quest => {
          const progress = getQuestProgress(quest);
          const isSelected = selectedQuest === quest.id;
          const isCompleted = quest.status === 'completed';
          
          return (
            <div
              key={quest.id}
              style={{
                border: `2px solid ${isCompleted ? '#10b981' : getDifficultyColor(quest.difficulty)}`,
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: isCompleted 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : isSelected 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: isCompleted ? 0.8 : 1
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isSelected}
              onClick={() => handleQuestClick(quest.id)}
              aria-label={`${quest.title}, difficulty ${quest.difficulty}, ${isCompleted ? 'completed' : `${progress.completed} of ${progress.total} objectives`}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleQuestClick(quest.id);
                }
              }}
            >
              {/* Quest Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {quest.title}
                    </span>
                    {isCompleted && <SmallChip variant="success" style={{ fontSize: '0.9rem' }}>✓</SmallChip>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <SmallChip style={{
                      fontSize: '0.8rem',
                      background: getDifficultyColor(quest.difficulty),
                      color: 'white',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}>{quest.difficulty}</SmallChip>
                    <SmallChip style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}</SmallChip>
                    {quest.experience > 0 && (
                      <>
                        <span style={{ color: 'var(--muted)' }}>•</span>
                        <SmallChip variant="accent" style={{ fontSize: '0.8rem' }}>{quest.experience} XP</SmallChip>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--primary)',
                  fontWeight: 'bold',
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  {progress.completed}/{progress.total}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '8px' }}>
                <Progress 
                  value={progress.percentage} 
                  style={{ 
                    height: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>

              {/* Quest Description */}
              <p style={{ 
                color: 'var(--muted)', 
                fontSize: '0.85rem', 
                margin: '0 0 8px 0',
                lineHeight: 1.4
              }}>
                {quest.description}
              </p>

              {/* Expanded Details */}
              {isSelected && (
                <div style={{ 
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {/* Objectives */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ 
                      color: 'var(--secondary)', 
                      fontSize: '0.9rem', 
                      margin: '0 0 8px 0',
                      fontWeight: 'bold'
                    }}>
                      Objectives:
                    </h4>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {quest.objectives.map(objective => {
                        const objProgress = getObjectiveProgress(objective);
                        return (
                          <div key={objective.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}>
                              <SmallChip variant={objective.isCompleted ? 'success' : 'neutral'} style={{ fontSize: '0.85rem', textDecoration: objective.isCompleted ? 'line-through' : 'none' }}>
                                {objective.isCompleted ? '\u2713' : '\u25cb'} {objective.description}
                              </SmallChip>
                              {objective.isOptional && (
                                <SmallChip style={{ color: 'var(--muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>Optional</SmallChip>
                              )}
                              {!objective.isCompleted && objProgress.target > 1 && (
                                <SmallChip variant="accent" style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>{objProgress.current}/{objProgress.target}</SmallChip>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rewards */}
                  {quest.rewards.length > 0 && (
                    <div>
                      <h4 style={{ 
                        color: 'var(--secondary)', 
                        fontSize: '0.9rem', 
                        margin: '0 0 8px 0',
                        fontWeight: 'bold'
                      }}>
                        Rewards:
                      </h4>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '6px',
                        fontSize: '0.8rem'
                      }}>
                        {quest.experience > 0 && (
                          <SmallChip variant="accent" style={{ borderRadius: 4, fontSize: '0.8rem' }}>
                            {quest.experience} XP
                          </SmallChip>
                        )}
                        {quest.rewards.map((reward, index) => (
                          <SmallChip key={index} variant="success" style={{ borderRadius: 4, fontSize: '0.8rem' }}>
                            {reward.description}
                          </SmallChip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Limit */}
                  {quest.timeLimit && quest.startedAt && (
                    <div style={{ 
                      marginTop: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--danger)'
                    }}>
                      ⏰ Time Limit: {quest.timeLimit} days
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default EnhancedQuestPanel;