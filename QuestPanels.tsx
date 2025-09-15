import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/core/Card';
import { sectQuests } from '@/events/storyData';
import { revengeQuests } from './revengeQuests';
import { RandomMission } from '@/types';

export function MainQuestPanel() {
  const { getActiveQuests, getCurrentAct } = useGameStore(state => ({ 
    getActiveQuests: state.getActiveQuests,
    getCurrentAct: state.getCurrentAct
  }));

  const activeQuests = getActiveQuests();
  const currentAct = getCurrentAct();
  
  if (!currentAct || activeQuests.length === 0) {
    return (
      <Card title="📜 Main Quests">
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          No active quests. Continue your cultivation journey to unlock new quests.
        </p>
      </Card>
    );
  }

  // Show main quests (filter out side quests if needed)
  const mainQuests = activeQuests.filter((quest: any) => 
    currentAct.mainQuests?.some((mq: any) => mq.id === quest.id)
  );

  if (mainQuests.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      {mainQuests.map((quest: any) => (
        <Card key={quest.id} title={`📜 ${quest.title}`}>
          <p style={{ color: 'var(--muted)', marginBottom: '15px', fontSize: '0.9rem', lineHeight: 1.4 }}>
            {quest.description}
          </p>
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
            <strong>Objectives:</strong>
            {quest.objectives.map((obj: any, index: number) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                opacity: obj.isCompleted ? 0.5 : 1,
                padding: '4px 0'
              }}>
                <span>- {obj.description}</span>
                {obj.isCompleted && (
                  <span style={{ color: 'var(--success)' }}>✓</span>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Status: <span style={{ color: quest.status === 'completed' ? 'var(--success)' : 'var(--primary)' }}>
              {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SectQuestsPanel() {
  const { story, player, addEventLog } = useGameStore(state => ({
    story: state.story,
    player: state.player,
    addEventLog: state.addEventLog,
  }));

  if (!player.sect || story.activeSectQuests.length === 0) {
    return null;
  }

  const getQuestData = (questId: string) => {
    const sectId = player.sect!;
    return sectQuests[sectId]?.[questId] || revengeQuests[sectId]?.[questId];
  };

  return (
    <>
      {story.activeSectQuests.map(questId => {
        const quest = getQuestData(questId);
        if (!quest) return null;

        return (
          <Card key={quest.id} title={`🛕 ${quest.title}`}>
            <p style={{ color: 'var(--muted)', marginBottom: '15px', fontSize: '0.9rem', lineHeight: 1.4 }}>{quest.description}</p>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
              <strong>Objectives:</strong>
              {quest.objectives.map((obj: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: obj.isCompleted(useGameStore.getState()) ? 0.5 : 1 }}>
                  <span>- {obj.description}</span>
                  {obj.type === 'trigger_event' && !obj.isCompleted(useGameStore.getState()) && (
                    <Button onClick={() => addEventLog(`Trigger event: ${String(obj.target)}`)} size="small">
                      Begin
                    </Button>
                  )}
                  {obj.isCompleted(useGameStore.getState()) && (
                    <span style={{ color: 'var(--success)' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </>
  );
}

export function BetrayalMissionsPanel() {
  const { story, addEventLog } = useGameStore(state => ({
    story: state.story,
    addEventLog: state.addEventLog,
  }));

  if (!story.activeBetrayalMissions || story.activeBetrayalMissions.length === 0) {
    return null;
  }

  return (
    <Card title="🤫 Secret Missions">
      <div style={{ display: 'grid', gap: '15px' }}>
        {story.activeBetrayalMissions.map(mission => (
          <div key={mission.id} style={{ border: '1px solid var(--danger)', padding: '10px', borderRadius: '4px', backgroundColor: 'rgba(255, 0, 0, 0.05)' }}>
            <strong style={{ color: 'var(--danger)' }}>{mission.title}</strong>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '5px 0' }}>{mission.description}</p>
            <Button 
              onClick={() => addEventLog(`Complete betrayal mission: ${mission.id}`)} 
              size="small"
              variant="danger"
            >
              Complete Task
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RandomMissionsPanel() {
  const { story, player, attemptMission } = useGameStore(state => ({
    story: state.story,
    player: state.player,
    attemptMission: state.attemptMission,
  }));

  if (!player.sect || story.activeRandomMissions.length === 0) {
    return null;
  }

  return (
    <Card title="Sect Missions">
      <div style={{ display: 'grid', gap: '15px' }}>
        {story.activeRandomMissions.map((mission: RandomMission) => (
          <div key={mission.id} style={{ border: '1px solid var(--border)', padding: '10px', borderRadius: '4px' }}>
            <strong style={{ color: 'var(--primary)' }}>{mission.title}</strong>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '5px 0' }}>{mission.description}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button onClick={() => attemptMission(mission.id)} size="small">
                Attempt Mission
              </Button>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Location: {mission.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}