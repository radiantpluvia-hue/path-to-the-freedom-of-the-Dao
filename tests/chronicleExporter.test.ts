import { exportChronicleToMarkdown } from '../src/utils/chronicleExporter';

describe('chronicleExporter', () => {
  it('exports a simple lifePhaseSnapshot to Markdown', () => {
    const save = {
      player: { name: 'Li Bai' },
      lifePhaseSnapshot: {
        summary: 'A brief life summary.',
        phases: [
          { title: 'Mortal Youth', events: ['Born in a village', 'Met a teacher'] },
          { title: 'Cultivator Years', events: [{ title: 'Learned Sword' }, { name: 'First Duel' }] },
        ],
      },
    };

    const md = exportChronicleToMarkdown(save);
    expect(md).toContain('# Chronicle of Li Bai');
    expect(md).toContain('## Summary');
    expect(md).toContain('A brief life summary.');
    expect(md).toContain('### Mortal Youth');
    expect(md).toContain('- Born in a village');
    expect(md).toContain('- Learned Sword');
  });

  it('handles missing snapshot gracefully', () => {
    const save = { playerName: 'Zhang' };
    const md = exportChronicleToMarkdown(save as any);
    expect(md).toContain('# Chronicle of Zhang');
    expect(md).toContain('No chronicle data found');
  });
});
