import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { MentorTeaching, ChallengeResult, TeachingChallengeType, TeachingDifficulty } from '../types/MentorTeaching';
import { MinigameManager } from './minigames/MinigameManager';
import allMentors from '../data/mentors_runtime';
import { PlaytestScaling } from '../utils/playtestScaling';

const mentorColors: Record<string, string> = {
  mentor_mo_wuji: '#8B0000',    // Fang Yuan -> Mo Wuji
  mentor_lu_chen: '#2F4F4F',    // Han Jue -> Lu Chen
  mentor_lie_tian: '#DC143C',   // Xiao Yan -> Lie Tian
  mentor_xue_ji: '#8B4513',     // Su Ming -> Xue Ji
  mentor_ling_ni: '#4169E1',    // Fu Yao -> Ling Ni
  mentor_yuan_shan: '#4682B4',  // Han Li -> Yuan Shan
  mentor_qing_xuan: '#ADD8E6',  // Lan Wangji -> Qing Xuan
  mentor_li_jian: '#D3D3D3'     // Ji Ning -> Li Jian
};

const MentorTeachingPanel: React.FC = () => {
  const { 
    player, 
    world, 
    story, 
    ui, 
    updatePlayerState, 
    isMentorOnCooldown, 
    getMentorCooldownRemaining,
    getAvailableTeachingsForMentor,
    mentorTeachingSystem
  } = useGameStore((state) => ({
    player: state.player,
    world: state.world,
    story: state.story,
    ui: state.ui,
    updatePlayerState: state.updatePlayerState,
    isMentorOnCooldown: state.isMentorOnCooldown,
    getMentorCooldownRemaining: state.getMentorCooldownRemaining,
    getAvailableTeachingsForMentor: state.getAvailableTeachingsForMentor,
    attemptMentorTeaching: state.attemptMentorTeaching,
    mentorTeachingSystem: state.mentorTeachingSystem
  }));
  const [selectedMentor, setSelectedMentor] = useState<string>('mentor_mo_wuji');
  const [availableTeachings, setAvailableTeachings] = useState<MentorTeaching[]>([]);
  const [notification, setNotification] = useState<string>('');
  const [isLoading] = useState<boolean>(false);
  const [currentChallenge, setCurrentChallenge] = useState<{
    teachingId: string;
    challengeType: TeachingChallengeType;
    difficulty: TeachingDifficulty;
    timeLimit?: number;
    successThreshold: number;
  } | null>(null);

  const mentors = allMentors.map(m => ({
    id: m.id,
    name: m.displayName,
    title: m.dao,
    color: mentorColors[m.id] || '#6c757d'
  }));

  useEffect(() => {
    if (player && getAvailableTeachingsForMentor) {
      try {
        const teachings = getAvailableTeachingsForMentor(selectedMentor);
        setAvailableTeachings(teachings || []);
      } catch (error) {
        console.error('Error loading teachings:', error);
        setAvailableTeachings([]);
      }
    }
    // Refresh periodically to update cooldown remaining
    const t = setInterval(() => {
      // trigger re-render by setting state from store (no-op read)
      setAvailableTeachings(prev => prev);
    }, 1000);
    return () => clearInterval(t);
  }, [selectedMentor, player, world, story, ui, getAvailableTeachingsForMentor]);

  const attemptTeaching = async (teachingId: string): Promise<void> => {
    if (!mentorTeachingSystem || !player) return;
    
    const teaching = availableTeachings.find(t => t.id === teachingId);
    if (!teaching) return;
    
    // Start the minigame challenge
    setCurrentChallenge({
      teachingId,
      challengeType: teaching.challenge.type,
      difficulty: teaching.challenge.difficulty,
      timeLimit: teaching.challenge.timeLimit,
      successThreshold: teaching.challenge.successThreshold || 70
    });
  };

  const handleChallengeComplete = (result: ChallengeResult) => {
    if (!currentChallenge || !player) return;
    
    const { teachingId } = currentChallenge;
    const teaching = availableTeachings.find(t => t.id === teachingId);
    if (!teaching) return;
    
    // Update teaching progress with the result from the minigame.
    // The previous implementation incorrectly called `attemptTeaching`, which would re-run a simulation.
    const gameState = { player, world, story, ui, systems: useGameStore.getState().systems };
    const challengeResult: ChallengeResult = {
      success: result.success,
      score: result.score || 0,
      timeTaken: result.timeTaken || 0,
    };
    mentorTeachingSystem.recordChallengeResult(teachingId, challengeResult, gameState);
    
    if (result.success) {
      // Apply rewards
      const rewards: Record<string, any> = {};
      
      // Base rewards
      if (teaching?.reward) {
        Object.entries(teaching.reward).forEach(([key, value]) => {
          rewards[key] = (rewards[key] || 0) + value;
        });
      }
      
      // Bonus rewards
      if (result.bonusRewards) {
        Object.entries(result.bonusRewards).forEach(([key, value]) => {
          rewards[key] = (rewards[key] || 0) + value;
        });
      }
      
      if (Object.keys(rewards).length > 0) {
        // Apply minimal playtest scaling to minigame rewards before updating player
        const scaled = PlaytestScaling.applyScaledEffects(rewards, { source: 'minigame' });
        updatePlayerState(scaled);
      }
      
      setNotification(`✅ Teaching completed successfully! Score: ${result.score}%`);
    } else {
      // Apply failure consequences
      if (result.penaltyConsequences) {
        updatePlayerState(result.penaltyConsequences);
      }
      
      setNotification(`❌ Teaching failed. Score: ${result.score}%`);
    }
    
    // Update available teachings
    const teachings = getAvailableTeachingsForMentor(selectedMentor);
    setAvailableTeachings(teachings || []);
    
    // Clear challenge
    setCurrentChallenge(null);
    
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(''), 5000);
  };

  const handleChallengeCancel = () => {
    setCurrentChallenge(null);
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      easy: '#28a745',
      medium: '#ffc107',
      hard: '#fd7e14',
      extreme: '#FF6B35',
      legendary: '#F7931E',
      mythical: '#9B59B6',
      transcendent: '#3498DB',
      impossible: '#E74C3C'
    };
    return colors[difficulty?.toLowerCase()] || '#95A5A6';
  };

  const checkPrerequisites = (teaching: MentorTeaching): boolean => {
    if (!mentorTeachingSystem || !player) return false;
    try {
      const gameState = { player, world, story, ui, systems: useGameStore.getState().systems };
      return mentorTeachingSystem.checkPrerequisites(teaching, gameState);
    } catch (error) {
      console.error('Error checking prerequisites:', error);
      return false;
    }
  };

  if (!player) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading player data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        Mentor Teachings
      </h2>

      {currentChallenge && (
        <MinigameManager
          challengeType={currentChallenge.challengeType}
          difficulty={currentChallenge.difficulty}
          timeLimit={currentChallenge.timeLimit}
          successThreshold={currentChallenge.successThreshold}
          onComplete={handleChallengeComplete}
          onCancel={handleChallengeCancel}
        />
      )}
      
      {notification && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: notification.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${notification.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          textAlign: 'center' as const,
          color: notification.includes('✅') ? '#155724' : '#721c24'
        }}>
          {notification}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '30px'
      }}>
        {mentors.map(mentor => {
          const isSelected = selectedMentor === mentor.id;
          const affinity = player.mentorAffinity?.[mentor.id] || 0;
          const onCooldown = isMentorOnCooldown?.(mentor.id) || false;
          const remaining = onCooldown ? getMentorCooldownRemaining?.(mentor.id) || 0 : 0;
          
          return (
            <button
              key={mentor.id}
              onClick={() => setSelectedMentor(mentor.id)}
              disabled={isLoading}
              style={{
                padding: '15px',
                border: isSelected ? `3px solid ${mentor.color}` : '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: isSelected ? `${mentor.color}20` : 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textAlign: 'center' as const,
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
                position: 'relative' as const
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                {mentor.name}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: mentor.color, 
                marginBottom: '5px',
                fontStyle: 'italic'
              }}>
                {mentor.title}
              </div>
              <div style={{ fontSize: '10px', color: '#666' }}>
                Affinity: {affinity}
              </div>
              {onCooldown && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc3545', fontWeight: 600 }}>
                  Mentor is resting... {remaining} ticks left
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>
          Available Teachings for {mentors.find(m => m.id === selectedMentor)?.name || 'Unknown Mentor'}
        </h3>
        
        {isMentorOnCooldown?.(selectedMentor) && (
          <div style={{ 
            textAlign: 'center' as const, 
            padding: '12px 16px', 
            color: '#663c00',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeeba',
            marginBottom: '12px',
            fontWeight: 600
          }}>
            Mentor is on cooldown. Remaining: {getMentorCooldownRemaining?.(selectedMentor)} ticks
          </div>
        )}
        
        {availableTeachings.length === 0 ? (
          <div style={{ 
            textAlign: 'center' as const, 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            No teachings available. Increase your affinity with this mentor or meet other prerequisites.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {availableTeachings.map(teaching => {
              const canAttempt = checkPrerequisites(teaching);
              const mentorCooldown = isMentorOnCooldown?.(selectedMentor) || false;
              const cooldownRemaining = mentorCooldown ? getMentorCooldownRemaining?.(selectedMentor) || 0 : 0;
              
              return (
                <div key={teaching.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: 0, color: '#333' }}>{teaching.title}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getDifficultyColor(teaching.challenge?.difficulty || 'unknown')
                    }}>
                      {(teaching.challenge?.difficulty || 'UNKNOWN').toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ 
                    margin: '10px 0', 
                    fontStyle: 'italic', 
                    color: '#555',
                    lineHeight: '1.4'
                  }}>
                    {teaching.description}
                  </p>
                  
                  <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Challenge:</strong> {teaching.challenge?.requirements || 'Unknown'}
                    </div>
                    <div>
                      <strong>Restriction:</strong> {teaching.challenge?.restriction || 'None'}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <strong>Rewards:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {Object.entries(teaching.reward || {}).map(([key, value]) => (
                          <li key={key} style={{ color: '#28a745', fontSize: '14px' }}>
                            {key}: {typeof value === 'boolean' ? (value ? 'Gained' : 'Lost') : `+${value}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <strong>Failure Consequences:</strong>
                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                        {Object.entries(teaching.failureConsequence || {}).map(([key, value]) => (
                          <li key={key} style={{ color: '#dc3545', fontSize: '14px' }}>
                            {key}: {typeof value === 'boolean' ? (value ? 'Gained' : 'Lost') : `${value}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => attemptTeaching(teaching.id)}
                    disabled={!canAttempt || isLoading || mentorCooldown}
                    style={{
                      padding: '10px 20px',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: (!canAttempt || isLoading || mentorCooldown) ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      backgroundColor: (!canAttempt || isLoading || mentorCooldown) ? '#6c757d' : '#007bff',
                      opacity: isLoading ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {mentorCooldown
                      ? `On cooldown (${cooldownRemaining} ticks)`
                      : isLoading
                        ? 'Processing...'
                        : canAttempt
                          ? 'Attempt Teaching'
                          : 'Prerequisites Not Met'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorTeachingPanel;
