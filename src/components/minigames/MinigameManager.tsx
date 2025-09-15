import React from 'react';
import { ChallengeResult, TeachingChallengeType } from '../../types/MentorTeaching';
import { MeditationChallenge } from './MeditationChallenge';
import { QiControlTest } from '@/components/minigames/QiControlTest';
import { PuzzleSolving } from './PuzzleSolving';
import CombatSimulation from './CombatSimulation';
import MemoryTest from './MemoryTest';
import ReactionTest from './ReactionTest';
import PatternRecognition from './PatternRecognition';
import ResourceManagement from './ResourceManagement';
import TimingChallenge from './TimingChallenge';
import { RebellionMastery } from './RebellionMastery';

interface MinigameManagerProps {
  challengeType: TeachingChallengeType;
  // allow the manager to accept either the narrower difficulty union used by some minigames or simple strings
  difficulty: string | 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
  timeLimit?: number;
  successThreshold: number;
  onComplete: (result: ChallengeResult) => void;
  onCancel: () => void;
}

export const MinigameManager: React.FC<MinigameManagerProps> = ({
  challengeType,
  difficulty,
  timeLimit,
  successThreshold,
  onComplete,
  onCancel
}) => {
  // Coerce common props to `any` to avoid TS mismatches between different minigame prop shapes
  const commonProps: any = { difficulty, timeLimit, successThreshold, onComplete, onCancel };

  const renderChallengeComponent = () => {
    switch (challengeType) {
      case 'meditation_challenge':
        return (
          <MeditationChallenge {...commonProps} />
        );
      
      case 'qi_control_test':
        return (<QiControlTest {...commonProps} />);
      
      case 'puzzle_solving':
        return (<PuzzleSolving {...commonProps} />);
      
      case 'combat_simulation':
        return (<CombatSimulation {...commonProps} />);
      
      case 'memory_test':
        return (<MemoryTest {...commonProps} />);
      
      case 'reaction_test':
        return (<ReactionTest {...commonProps} />);
      
      case 'pattern_recognition':
        return (<PatternRecognition {...commonProps} />);
      
      case 'resource_management':
        return (<ResourceManagement {...commonProps} />);
      
      case 'timing_challenge':
        return (<TimingChallenge {...commonProps} />);
      
      case 'rebellion_mastery':
        return (<RebellionMastery {...commonProps} />);
      
      case 'transformation_trial':
      case 'custom':
      default:
        return (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '10px'
          }}>
            <h3>Challenge Type: {challengeType}</h3>
            <p>This challenge type is coming soon!</p>
            <p>Difficulty: {difficulty.toUpperCase()}</p>
            <p>Success Threshold: {successThreshold}</p>
            
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={() => onComplete({
                  success: true,
                  score: successThreshold,
                  timeTaken: 60,
                  accuracy: 100,
                  efficiency: 100,
                  bonusRewards: { qi: 1, insight: 1 }
                })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Simulate Success
              </button>
              
              <button 
                onClick={() => onComplete({
                  success: false,
                  score: Math.floor(successThreshold * 0.6),
                  timeTaken: timeLimit || 300,
                  accuracy: 60,
                  efficiency: 0,
                  penaltyConsequences: { qi: -1 }
                })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Simulate Failure
              </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={onCancel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel Challenge
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto'
      }}>
        {renderChallengeComponent()}
      </div>
    </div>
  );
};
