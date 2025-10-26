import { useGameStore } from '@/store/useGameStore';
import { createDefaultChoiceHandler } from './src/systems/choiceHandler';
import { EventChoice } from '@/types';
import { Card } from '@/components/core/Card';
import { Button } from '@/components/core/Button';

export function ChoiceModal() {
  // Use separate selectors to avoid returning a new object identity each render
  const choiceData = useGameStore(state => state.ui.activeStoryChoice);
  const player = useGameStore(state => state.player);
  const addEventLog = useGameStore(state => state.addEventLog);
  const setUIProperty = useGameStore(state => state.setUIProperty);

  if (!choiceData) return null;

  const handleChoice = (choice: EventChoice) => {
    const handler = createDefaultChoiceHandler();
    const gs = useGameStore.getState() as any;
    const { newState, narrative } = handler.handleChoice(gs, choice as any);
    useGameStore.setState(newState as any);
    addEventLog(choice.narrative || `You chose to "${choice.text}".`);
    if (narrative) addEventLog(narrative);
    setUIProperty('activeStoryChoice', undefined);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000,
    }}>
      <div style={{
        width: 'clamp(300px, 60vw, 600px)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <Card title={`📜 ${choiceData.title}`}>
          <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.5 }}>{choiceData.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {choiceData.choices.map(choice => (
              <Button key={choice.text} onClick={() => handleChoice(choice)} size="large">
                {choice.text}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}