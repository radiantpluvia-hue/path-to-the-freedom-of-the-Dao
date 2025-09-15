import React, { useState } from 'react';
import CURATED from '../minigames/sutras';
// useGameStore import removed (unused)
import StudyModal from './StudyModal';

export default function SutraBrowser() {
  const sutras = CURATED;
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  // player not used in this browser; keep for future UI extensions

  function openStudy(sutra: any) {
    setSelected(sutra);
    setOpen(true);
  }

  return (
    <div className="xui-panel">
      <h2 className="xui-title">Sutras & Manuals</h2>
      <ul className="sutra-list">
        {sutras.map((s: any) => (
          <li key={s.id} className="sutra-item">
            <div>
              <div><strong>{s.name}</strong> <span className="xui-muted">(Tier {s.tier})</span></div>
              <div className="xui-muted">{s.description}</div>
            </div>
            <div>
              <button className="xbtn" onClick={() => openStudy(s)} data-testid={`study-${s.id}`}>Study</button>
            </div>
          </li>
        ))}
      </ul>
      <StudyModal open={open} sutra={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
