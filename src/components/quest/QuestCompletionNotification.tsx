/* eslint-disable no-restricted-imports -- temporary: importing core systems for UI integration */
import React, { useState, useEffect } from 'react';
import { EnhancedQuest, QuestReward } from '@/systems/EnhancedQuestSystem';

interface QuestCompletionNotificationProps {
  quest: EnhancedQuest | null;
  onClose: () => void;
  duration?: number;
}

export const QuestCompletionNotification: React.FC<QuestCompletionNotificationProps> = ({
  quest,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (quest) {
      setIsVisible(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [quest, duration, onClose]);

  if (!quest || !isVisible) return null;

  const formatReward = (reward: QuestReward): string => {
    switch (reward.type) {
      case 'currency':
        return `${reward.amount} ${reward.target === 'yuan' ? 'Yuan' : 'Spirit Stones'}`;
      case 'stat':
        return `+${reward.amount} ${reward.target.charAt(0).toUpperCase() + reward.target.slice(1)}`;
      case 'skill':
        return `+${reward.amount} ${reward.target.replace(/_/g, ' ')} XP`;
      case 'item':
        return `${reward.amount}x ${reward.target.replace(/_/g, ' ')}`;
      case 'reputation':
        return `+${reward.amount} ${reward.target} Reputation`;
      case 'unlock':
        return `Unlocked: ${reward.target.replace(/_/g, ' ')}`;
      default:
        return reward.description;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
      transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      maxWidth: '400px',
      width: '90%'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        border: '2px solid #10b981',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%)',
          animation: 'shimmer 2s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        {/* Close button */}
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(() => {
              setIsVisible(false);
              onClose();
            }, 300);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>🎉</span>
            <h3 style={{ 
              color: '#10b981', 
              margin: 0, 
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              Quest Completed!
            </h3>
          </div>
          <h4 style={{ 
            color: 'var(--primary)', 
            margin: 0, 
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            {quest.title}
          </h4>
        </div>

        {/* Experience Reward */}
        {quest.experience > 0 && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ 
              color: '#3b82f6', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              marginBottom: '4px'
            }}>
              Experience Gained
            </div>
            <div style={{ 
              color: '#60a5fa', 
              fontSize: '1.4rem', 
              fontWeight: 'bold'
            }}>
              +{quest.experience} XP
            </div>
          </div>
        )}

        {/* Rewards */}
        {quest.rewards.length > 0 && (
          <div>
            <h4 style={{ 
              color: 'var(--secondary)', 
              margin: '0 0 12px 0',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}>
              Rewards Received:
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {quest.rewards.map((reward, index) => (
                <div key={index} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {reward.type === 'currency' ? '💰' : 
                     reward.type === 'stat' ? '📈' :
                     reward.type === 'skill' ? '🎯' :
                     reward.type === 'item' ? '📦' :
                     reward.type === 'reputation' ? '⭐' :
                     reward.type === 'unlock' ? '🔓' : '🎁'}
                  </span>
                  <span style={{ 
                    color: '#10b981', 
                    fontWeight: 'bold',
                    flex: 1
                  }}>
                    {formatReward(reward)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quest Type Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: quest.type === 'main' ? 'rgba(239, 68, 68, 0.2)' :
                     quest.type === 'side' ? 'rgba(59, 130, 246, 0.2)' :
                     quest.type === 'daily' ? 'rgba(245, 158, 11, 0.2)' :
                     quest.type === 'achievement' ? 'rgba(139, 92, 246, 0.2)' :
                     'rgba(107, 114, 128, 0.2)',
          color: quest.type === 'main' ? '#ef4444' :
                 quest.type === 'side' ? '#3b82f6' :
                 quest.type === 'daily' ? '#f59e0b' :
                 quest.type === 'achievement' ? '#8b5cf6' :
                 '#6b7280',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          border: `1px solid ${
            quest.type === 'main' ? 'rgba(239, 68, 68, 0.3)' :
            quest.type === 'side' ? 'rgba(59, 130, 246, 0.3)' :
            quest.type === 'daily' ? 'rgba(245, 158, 11, 0.3)' :
            quest.type === 'achievement' ? 'rgba(139, 92, 246, 0.3)' :
            'rgba(107, 114, 128, 0.3)'
          }`
        }}>
          {quest.type}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default QuestCompletionNotification;