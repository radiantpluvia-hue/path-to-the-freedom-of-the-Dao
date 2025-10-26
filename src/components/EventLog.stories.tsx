import React from 'react';
import EventLog, { EventLogProps } from './EventLog';
import { useGameStore } from '../store/useGameStore';

export default {
  title: 'Components/EventLog',
  component: EventLog,
} as Meta;

const Template: StoryFn<EventLogProps> = (args: EventLogProps) => {
  // Seed some events for the story
  const s = useGameStore.getState();
  if (!s.eventLog || s.eventLog.length === 0) {
    // Story-only helper: directly mutate the store for demo purposes
    (s as any).setState({ eventLog: ['Welcome to the game', 'You gained 10 XP', 'You found a relic'] } as any);
  }

  return <EventLog {...args} />;
};

export const Default = Template.bind({});
Default.args = { maxVisible: 10 };
