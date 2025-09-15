import React from 'react';
import { Button } from './core/Button';

interface DialogueOption {
  id: string;
  text: string;
}
interface MentorDialogueSystemProps {
  mentorId: string;
  dialogue: string;
  options: DialogueOption[];
  onOptionSelect: (optionId: string) => void;
  onClose: () => void;
}
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1500,
  },
  modal: {
    backgroundColor: 'var(--dark-secondary, #2a2a2a)',
    color: 'var(--light, #f0f0f0)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    maxWidth: '600px',
    width: '90%',
    border: '1px solid var(--primary-dark, #444)',
  },
  dialogueText: {
    marginBottom: '20px',
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: 'var(--muted, #aaa)',
    lineHeight: 1.6,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionButton: {
    padding: '12px',
    border: '1px solid var(--primary-dark, #444)',
    borderRadius: '5px',
    backgroundColor: 'var(--dark, #1e1e1e)',
    color: 'var(--light, #f0f0f0)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
};
export const MentorDialogueSystem: React.FC<MentorDialogueSystemProps> = ({
  dialogue,
  options,
  onOptionSelect,
  onClose,
}) => {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.dialogueText}>"{dialogue}"</div>
        <div style={styles.optionsContainer}>
          {options.map(option => (
            <button key={option.id} onClick={() => onOptionSelect(option.id)} style={styles.optionButton}>
              {option.text}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="secondary" size="small">
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
};
