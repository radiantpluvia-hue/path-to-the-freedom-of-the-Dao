/* eslint-disable no-restricted-imports -- dev-only playground imports */
import React from 'react';
import { MiniGameSystem } from '@/systems/MiniGameSystem';
import BracketView from './BracketView';
import FactionWarSummary from './FactionWarSummary';

const sys = new MiniGameSystem();

export default function MinigamePlayground() {
  const [tRes, setTRes] = React.useState<any>(null);
  const [wRes, setWRes] = React.useState<any>(null);

  const runTournament = () => {
    const res = sys.runSectTournament(10);
    setTRes(res);
  };

  const runWar = () => {
    const res = sys.runFactionWar(120, 100);
    setWRes(res);
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div>
        <button onClick={runTournament}>Run Tournament (10)</button>
        {tRes && <div style={{ marginTop: 8 }}><BracketView {...tRes} /></div>}
      </div>
      <div>
        <button onClick={runWar}>Run Faction War</button>
        {wRes && <div style={{ marginTop: 8 }}><FactionWarSummary result={wRes} /></div>}
      </div>
    </div>
  );
}
