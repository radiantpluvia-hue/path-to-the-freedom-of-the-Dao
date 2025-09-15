import React from 'react';
import { MentorTeaching } from '../types/MentorTeaching';
import { PlayerState } from '../types/index';

interface PrerequisiteVisualizationProps {
  teaching: MentorTeaching;
  playerState: PlayerState;
}

export const TeachingPrerequisiteVisualization: React.FC<PrerequisiteVisualizationProps> = ({ 
  teaching, 
  playerState 
}) => {
  const checkRequirement = (key: string, required: any): boolean => {
    if (key === 'mentorAffinity') {
      for (const [mentor, value] of Object.entries(required as Record<string, number>)) {
        if ((playerState.mentorAffinity?.[mentor] || 0) < (value as number)) return false;
      }
      return true;
    }
    
    if (typeof required === 'number') {
      return (playerState[key as keyof PlayerState] as number || 0) >= required;
    }
    
    if (typeof required === 'boolean') {
      return !!playerState[key as keyof PlayerState] === required;
    }
    
    return true;
  };

  const entries = Object.entries(teaching.prerequisites || {});

  return (
    <div style={{ 
      padding: '15px', 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px', 
      backgroundColor: '#f8f9fa',
      marginBottom: '15px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Prerequisites</h4>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        {entries.map(([key, value]) => {
          const isMet = checkRequirement(key, value);
          
          return (
            <div 
              key={key}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: isMet ? '#d4edda' : '#f8d7da',
                border: `1px solid ${isMet ? '#c3e6cb' : '#f5c6cb'}`
              }}
            >
              <span style={{ fontWeight: '500' }}>
                {key === 'mentorAffinity' ? 'Mentor Affinity' : key.charAt(0).toUpperCase() + key.slice(1)}:
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {key === 'mentorAffinity' ? (
                  Object.entries(value as Record<string, number>).map(([mentor, required]) => (
                    <span key={mentor} style={{ fontSize: '14px' }}>
                      {mentor}: {playerState.mentorAffinity?.[mentor] || 0}/{required}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '14px' }}>
                    {typeof value === 'number' 
                      ? `${(playerState[key as keyof PlayerState] as number) || 0}/${value}`
                      : typeof value === 'boolean'
                      ? (playerState[key as keyof PlayerState] ? '✓' : '✗')
                      : 'Unknown'
                    }
                  </span>
                )}
                
                <span style={{ 
                  fontSize: '16px', 
                  color: isMet ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  {isMet ? '✓' : '✗'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};