import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import SmallChip from './SmallChip';
import exportChronicleToMarkdown from '@/utils/chronicleExporter';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

export interface LifeNovelModalProps {
  open: boolean;
  onClose: () => void;
}

export const LifeNovelModal: React.FC<LifeNovelModalProps> = ({ open, onClose }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const { lifePhaseSystem, systems } = useGameStore();
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  let novel = '';
  let hasLife = false;
  try {
    if (lifePhaseSystem && typeof lifePhaseSystem.renderNovel === 'function') {
      novel = lifePhaseSystem.renderNovel();
      try { hasLife = !!(lifePhaseSystem.getState && (lifePhaseSystem.getState().pastPhases?.length || lifePhaseSystem.getState().currentPhase)); } catch (e) { void e; }
    } else if (systems && systems.lifePhase) {
      const snap = systems.lifePhase;
      const lines: string[] = [];
      const appendPhase = (p: any) => {
        if (!p) return;
        lines.push(`--- ${p.title || p.id} (${p.type || 'Life'}) ---`);
        for (const ev of p.events || []) {
          lines.push(`${ev.title || ev.id}: ${ev.description || ''}`);
        }
      };
      for (const p of snap.pastPhases || []) appendPhase(p);
      appendPhase(snap.currentPhase);
      novel = lines.join('\n');
      hasLife = !!(snap && ((snap.pastPhases && snap.pastPhases.length) || snap.currentPhase));
    }
  } catch (e) {
    novel = 'Failed to render novel.';
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2200 }} ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div style={{ width: 'min(900px, 95vw)', maxHeight: '85vh', overflowY: 'auto', background: 'var(--darkest)', padding: '18px', borderRadius: 10, color: 'var(--text-primary)' }}>
  <ModalCloseButton onClick={onClose} ariaLabel="Close novel" title="Close" />
        <h2 style={{ marginTop: 0 }}>Life Chronicle</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button type="button"
            onClick={() => {
              try {
                const store = useGameStore.getState();
                const saveLike = { player: { name: store.player.name || store.playerState?.name || 'Unknown' }, lifePhaseSnapshot: store.systems?.lifePhase || store.lifePhaseSystem?.getState?.() };
                const ts = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `Chronicle_${(saveLike.player.name || 'player')}_${ts}.md`;
                setPreviewFilename(filename);
                const md = exportChronicleToMarkdown(saveLike as any);
                const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                setExportMessage(`Exported ${filename}`);
                setTimeout(() => setExportMessage(null), 2500);
              } catch (e) {
                console.error('Export failed', e);
                setExportMessage('Export failed');
                setTimeout(() => setExportMessage(null), 2500);
              }
            }}
            disabled={!hasLife}
            aria-label={!hasLife ? 'No life data to export yet' : 'Export Chronicle as Markdown'}
            style={{ padding: 0 }}
          >
            <SmallChip style={{ borderRadius: 6, background: hasLife ? 'transparent' : 'rgba(255,255,255,0.04)', color: 'var(--text)' }}>Export Chronicle</SmallChip>
          </button>
          {previewFilename && <div style={{ marginLeft: 8, color: 'var(--muted)', fontSize: 13 }}>Will download: {previewFilename}</div>}
          {exportMessage && <div style={{ marginLeft: 8, color: 'lightgreen', fontSize: 13 }}>{exportMessage}</div>}
        </div>
        <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--muted)' }}>{novel || 'No life recorded yet.'}</pre>
      </div>
    </div>
  );
};

export default LifeNovelModal;
