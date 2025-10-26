// Small utility to export a life-phase chronicle to Markdown.
// Designed to be tolerant of different save shapes: looks for common fields and falls back to JSON.
export function exportChronicleToMarkdown(save: any): string {
  const playerName = save?.player?.name || save?.playerName || save?.name || 'Unknown';
  const snapshot = save?.lifePhaseSnapshot || save?.lifePhase || save?.chronicle || {};

  let md = `# Chronicle of ${playerName}\n\n`;

  if (snapshot?.summary) {
    md += `## Summary\n\n${snapshot.summary}\n\n`;
  }

  if (snapshot?.phases && Array.isArray(snapshot.phases) && snapshot.phases.length > 0) {
    md += '## Life Phases\n\n';
    snapshot.phases.forEach((phase: any, idx: number) => {
      const title = phase.title || phase.phase || `Phase ${idx + 1}`;
      md += `### ${title}\n\n`;

      if (Array.isArray(phase.events) && phase.events.length > 0) {
        phase.events.forEach((e: any) => {
          const label = e.title || e.name || (typeof e === 'string' ? e : null) || JSON.stringify(e);
          md += `- ${label}\n`;
        });
        md += '\n';
      } else if (Array.isArray(phase.entries) && phase.entries.length > 0) {
        phase.entries.forEach((e: any) => md += `- ${String(e)}\n`);
        md += '\n';
      } else if (phase.note) {
        md += `${phase.note}\n\n`;
      } else {
        md += 'No events recorded.\n\n';
      }
    });
  } else if (snapshot && Object.keys(snapshot).length > 0) {
    // If snapshot exists but doesn't match expected shape, include a JSON dump for debugging.
    md += '## Chronicle Data\n\n';
    md += '```json\n' + JSON.stringify(snapshot, null, 2) + '\n```\n';
  } else {
    md += '_No chronicle data found._\n';
  }

  return md;
}

export default exportChronicleToMarkdown;
