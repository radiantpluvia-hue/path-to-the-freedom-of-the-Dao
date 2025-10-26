import React, { useState, useEffect } from 'react';
import { Card } from '@/components/core/Card';
import { Button } from '@/components/core/Button';
import { EnhancedQuestPanel } from './EnhancedQuestPanel';
import SmallChip from '@/components/ui/SmallChip';
import { useGameStore } from '@/store/useGameStore';

export const QuestManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'main' | 'side' | 'daily' | 'achievement'>('main');

  const [availableQuests, setAvailableQuests] = useState<any[]>([]);

  const {
    getQuestsByType,
    getAvailableEnhancedQuests,
    activateEnhancedQuest
  } = useGameStore();

  useEffect(() => {
    setAvailableQuests(getAvailableEnhancedQuests());
  }, [getAvailableEnhancedQuests]);

  const tabs = [
    { id: 'main' as const, label: 'Main Quests', icon: '📜', color: '#ef4444' },
    { id: 'side' as const, label: 'Side Quests', icon: '📋', color: '#3b82f6' },
    { id: 'daily' as const, label: 'Daily Quests', icon: '🌅', color: '#f59e0b' },
    { id: 'achievement' as const, label: 'Achievements', icon: '🏆', color: '#8b5cf6' }
  ];

  // activeQuests is not used in this component; omit to avoid lint warnings
  const questsByType = getQuestsByType(activeTab);
  const availableQuestsForType = availableQuests.filter(q => q.type === activeTab);

  const getQuestCounts = () => {
    return tabs.map(tab => ({
      ...tab,
      activeCount: getQuestsByType(tab.id).filter(q => q.status === 'active').length,
      availableCount: availableQuests.filter(q => q.type === tab.id).length
    }));
  };

  const questCounts = getQuestCounts();

  return (
    <Card title="🎯 Quest Manager">
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        {questCounts.map(tab => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? `${tab.color}20` : 'transparent',
              border: `2px solid ${activeTab === tab.id ? tab.color : 'transparent'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              color: activeTab === tab.id ? tab.color : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--muted)';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            <span>{tab.icon}</span>
            <SmallChip style={{ fontSize: '0.9rem', background: 'transparent', color: activeTab === tab.id ? tab.color : 'var(--muted)', fontWeight: activeTab === tab.id ? 'bold' : 'normal', padding: 0 }}>
              {tab.label}
            </SmallChip>
            {(tab.activeCount > 0 || tab.availableCount > 0) && (
              <SmallChip style={{ background: tab.color, color: 'white', borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold', minWidth: '18px', textAlign: 'center' }}>
                {tab.activeCount + tab.availableCount}
              </SmallChip>
            )}
          </button>
        ))}
      </div>

      {/* Quest Content */}
      <div style={{ minHeight: '300px' }}>
        {/* Active Quests */}
        {questsByType.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              color: 'var(--primary)', 
              fontSize: '1.1rem', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚡</span>
              Active {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <EnhancedQuestPanel 
              quests={questsByType} 
              showType={activeTab}
              maxQuests={10}
            />
          </div>
        )}

        {/* Available Quests */}
        {availableQuestsForType.length > 0 && (
          <div>
            <h3 style={{ 
              color: 'var(--secondary)', 
              fontSize: '1.1rem', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📋</span>
              Available {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {availableQuestsForType.map(quest => (
                <div
                  key={quest.id}
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ 
                      color: 'var(--primary)', 
                      margin: '0 0 8px 0',
                      fontSize: '1rem'
                    }}>
                      {quest.title}
                    </h4>
                    <p style={{ 
                      color: 'var(--muted)', 
                      fontSize: '0.85rem', 
                      margin: '0 0 12px 0',
                      lineHeight: 1.4
                    }}>
                      {quest.description}
                    </p>
                    
                    {/* Quest Info */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      fontSize: '0.8rem',
                      marginBottom: '12px'
                    }}>
                      <SmallChip style={{ fontSize: '0.8rem', background: tabs.find(t => t.id === activeTab)?.color, color: 'white', textTransform: 'uppercase', fontWeight: 'bold' }}>{quest.difficulty}</SmallChip>
                      {quest.experience > 0 && (
                        <>
                          <span style={{ color: 'var(--muted)' }}>•</span>
                          <SmallChip variant="accent" style={{ fontSize: '0.8rem' }}>{quest.experience} XP</SmallChip>
                        </>
                      )}
                      {quest.rewards.length > 0 && (
                        <>
                          <span style={{ color: 'var(--muted)' }}>•</span>
                          <SmallChip variant="success" style={{ fontSize: '0.8rem' }}>{quest.rewards.length} Reward{quest.rewards.length > 1 ? 's' : ''}</SmallChip>
                        </>
                      )}
                    </div>

                    {/* Prerequisites */}
                    {quest.prerequisites && quest.prerequisites.length > 0 && (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--muted)',
                        marginBottom: '12px'
                      }}>
                        <strong>Prerequisites:</strong> {quest.prerequisites.join(', ')}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      const success = activateEnhancedQuest(quest.id);
                      if (success) {
                        setAvailableQuests(getAvailableEnhancedQuests());
                      }
                    }}
                    aria-label={`Start quest ${quest.title}`}
                    size="small"
                    style={{ 
                      backgroundColor: tabs.find(t => t.id === activeTab)?.color,
                      borderColor: tabs.find(t => t.id === activeTab)?.color
                    }}
                  >
                    <SmallChip>Start Quest</SmallChip>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {questsByType.length === 0 && availableQuestsForType.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--muted)', 
            padding: '40px 20px',
            fontStyle: 'italic'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>
              {tabs.find(t => t.id === activeTab)?.icon}
            </div>
            <p>No {activeTab} quests available at the moment.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
              {activeTab === 'main' && 'Progress through the story to unlock main quests.'}
              {activeTab === 'side' && 'Explore the world and interact with NPCs to find side quests.'}
              {activeTab === 'daily' && 'Daily quests reset every 24 hours.'}
              {activeTab === 'achievement' && 'Achievements unlock as you progress and master different aspects of cultivation.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuestManager;