import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Button } from './core/Button';
import { Card } from './core/Card';

interface StoryEvent {
  id: string;
  title: string;
  description: string;
  choices: StoryChoice[];
}

interface StoryChoice {
  id: string;
  text: string;
  description?: string;
  conditions?: any;
  consequences: any;
  unavailableReason?: string;
}

export const StoryEventPanel: React.FC = () => {
  const { 
    getAvailableEvents, 
    triggerStoryEvent, 
    makeStoryChoice,
  // addEventLog intentionally not used here
  } = useGameStore();
  
  const [availableEvents, setAvailableEvents] = useState<StoryEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<StoryEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    const events = getAvailableEvents();
    setAvailableEvents(events);
  }, [getAvailableEvents]);

  const handleTriggerEvent = (eventId: string) => {
    const success = triggerStoryEvent(eventId);
    if (success) {
      const event = availableEvents.find(e => e.id === eventId);
      if (event) {
        setActiveEvent(event);
        setShowEventModal(true);
      }
    }
  };

  const handleMakeChoice = (choiceId: string) => {
    if (!activeEvent) return;
    
    const success = makeStoryChoice(activeEvent.id, choiceId);
    if (success) {
      setShowEventModal(false);
      setActiveEvent(null);
      // Refresh available events
      const events = getAvailableEvents();
      setAvailableEvents(events);
    }
  };

  const closeModal = () => {
    setShowEventModal(false);
    setActiveEvent(null);
  };

  if (availableEvents.length === 0 && !showEventModal) {
    return null;
  }

  return (
    <>
      {/* Available Events */}
      {availableEvents.length > 0 && (
        <Card title="📖 Story Events">
          <div style={{ display: 'grid', gap: '10px' }}>
            {availableEvents.map(event => (
              <div 
                key={event.id} 
                style={{ 
                  border: '1px solid var(--border)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 215, 0, 0.05)'
                }}
              >
                <strong style={{ color: 'var(--primary)' }}>{event.title}</strong>
                <p style={{ 
                  color: 'var(--muted)', 
                  fontSize: '0.85rem', 
                  margin: '5px 0',
                  lineHeight: 1.4
                }}>
                  {event.description}
                </p>
                <Button 
                  onClick={() => handleTriggerEvent(event.id)} 
                  size="small"
                  style={{ marginTop: '8px' }}
                >
                  Begin Event
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Story Event Modal */}
      {showEventModal && activeEvent && (
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
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ 
                color: 'var(--primary)', 
                marginBottom: '12px',
                fontSize: '1.4rem'
              }}>
                {activeEvent.title}
              </h2>
              <p style={{ 
                color: 'var(--text)', 
                lineHeight: 1.5,
                marginBottom: '20px'
              }}>
                {activeEvent.description}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                color: 'var(--secondary)', 
                marginBottom: '12px',
                fontSize: '1.1rem'
              }}>
                Choose your response:
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {activeEvent.choices.map(choice => (
                  <div 
                    key={choice.id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '12px',
                      backgroundColor: choice.unavailableReason 
                        ? 'rgba(128, 128, 128, 0.1)' 
                        : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <strong style={{ 
                        color: choice.unavailableReason ? 'var(--muted)' : 'var(--text)'
                      }}>
                        {choice.text}
                      </strong>
                    </div>
                    
                    {choice.description && (
                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--muted)', 
                        margin: '4px 0 8px 0',
                        lineHeight: 1.3
                      }}>
                        {choice.description}
                      </p>
                    )}

                    {choice.unavailableReason ? (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--danger)',
                        fontStyle: 'italic'
                      }}>
                        {choice.unavailableReason}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleMakeChoice(choice.id)}
                        size="small"
                        style={{ marginTop: '4px' }}
                      >
                        Choose
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              borderTop: '1px solid var(--border)',
              paddingTop: '16px'
            }}>
              <Button onClick={closeModal} variant="secondary">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};