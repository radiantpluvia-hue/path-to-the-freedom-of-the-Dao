import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import SmallChip from '../ui/SmallChip';

export default function MusicSettings({ onClose }: { onClose: () => void }) {
  const { musicVolume = 1, musicMuted = false, setMusicVolume, setMusicMuted, ui, setUIProperty } = useGameStore();
  const store = useGameStore();

  const dialoguePos = ui?.dialoguePanelPosition || 'bottom-left';
  const dialogueOpacity = typeof ui?.dialoguePanelOpacity === 'number' ? ui.dialoguePanelOpacity : 0.85;

  return (
    <div style={{ background: 'var(--dark)', color: 'var(--text)', padding: 16, borderRadius: 8, minWidth: 320 }}>
      <h3 style={{ marginTop: 0 }}>Audio Settings</h3>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Volume: {(Math.round((musicVolume ?? 1) * 100))}%</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={musicVolume}
          onChange={e => setMusicVolume?.(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>
          <input type="checkbox" checked={musicMuted} onChange={e => setMusicMuted?.(e.target.checked)} />{' '}
          Mute
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}><SmallChip style={{ borderRadius: 6 }}>Close</SmallChip></button>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)', margin: '12px 0' }} />
      <h4 style={{ margin: '8px 0' }}>Dialogue Panel</h4>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Position</label>
        <select value={dialoguePos} onChange={e => setUIProperty('dialoguePanelPosition', e.target.value)} style={{ width: '100%' }}>
          <option value="bottom-left">Bottom left</option>
          <option value="bottom-right">Bottom right</option>
          <option value="top-left">Top left</option>
          <option value="top-right">Top right</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Opacity: {(Math.round(dialogueOpacity * 100))}%</label>
        <input type="range" min={0.3} max={1} step={0.01} value={dialogueOpacity} onChange={e => setUIProperty('dialoguePanelOpacity', Number(e.target.value))} style={{ width: '100%' }} />
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.04)', margin: '12px 0' }} />
      <h4 style={{ margin: '8px 0' }}>Inner Voice</h4>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>
          <input type="checkbox" checked={(store as any).getSettings?.()?.innerVoice?.showPanel !== false} onChange={e => (store as any).setSettings?.({ innerVoice: { ...((store as any).getSettings?.()?.innerVoice || {}), showPanel: e.target.checked } })} /> Show panel
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Display duration (ms)</label>
        <input type="number" min={1000} step={250} value={(store as any).getSettings?.()?.innerVoice?.displayMs || 4500} onChange={e => (store as any).setSettings?.({ innerVoice: { ...((store as any).getSettings?.()?.innerVoice || {}), displayMs: Number(e.target.value) } })} style={{ width: '100%' }} />
      </div>
    </div>
  );
}
