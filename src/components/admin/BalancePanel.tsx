import React, { useState } from 'react';
import { getEncounterTemplate } from '@/data/encounterTemplates';
import { useGameStore } from '../../store/useGameStore';
import dataIndex from '@/data/index';
import SeedViewerModal from './SeedViewerModal';
import { validateSeed } from '@/utils/seedValidator';
import { saveDraft } from '@/utils/draftSaver';

export default function BalancePanel() {
  const [selected, setSelected] = useState<string>('roadbandit_small');
  const [preview, setPreview] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [seedType, setSeedType] = useState<string>('none');
  const [seedSelected, setSeedSelected] = useState<string>('');
  const store = useGameStore();

  const tmpl = getEncounterTemplate(selected);

  const handlePreview = () => {
    setPreview(tmpl);
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>Balance / Encounter Editor (Dev)</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="roadbandit_small">Road Bandit</option>
          <option value="spirit_hound">Spirit Hound</option>
        </select>
        <button onClick={handlePreview}>Preview</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <h4>Dev Seeds (optional)</h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={seedType} onChange={(e) => { setSeedType(e.target.value); setSeedSelected(''); }}>
            <option value="none">-- seeds --</option>
            <option value="events">Events</option>
            <option value="items">Items</option>
            <option value="manuals">Manuals</option>
            <option value="passives">Passives</option>
          </select>
          <select value={seedSelected} onChange={(e) => setSeedSelected(e.target.value)}>
            <option value="">(select)</option>
            {(() => {
              const idx = (dataIndex as any) || {};
              const list: any[] = seedType === 'events' ? (idx.SEED_EVENTS || []) : seedType === 'items' ? (idx.SEED_ITEMS || []) : seedType === 'manuals' ? (idx.SEED_MANUALS || []) : seedType === 'passives' ? (idx.SEED_PASSIVES || []) : [];
              return list.map((s:any) => <option key={s.id || s} value={s.id || s}>{s.title || s.name || s.id}</option>);
            })()}
          </select>
          <button onClick={() => {
            const idx = (dataIndex as any) || {};
            const list: any[] = seedType === 'events' ? (idx.SEED_EVENTS || []) : seedType === 'items' ? (idx.SEED_ITEMS || []) : seedType === 'manuals' ? (idx.SEED_MANUALS || []) : seedType === 'passives' ? (idx.SEED_PASSIVES || []) : [];
            const found = list.find((s:any) => (s.id || s) === seedSelected);
            setPreview(found || null);
          }}>Preview Seed</button>
          <button onClick={() => { setModalOpen(true); }}>View</button>
          <button onClick={async () => {
            const idx = (dataIndex as any) || {};
            const list: any[] = seedType === 'events' ? (idx.SEED_EVENTS || []) : seedType === 'items' ? (idx.SEED_ITEMS || []) : seedType === 'manuals' ? (idx.SEED_MANUALS || []) : seedType === 'passives' ? (idx.SEED_PASSIVES || []) : [];
            const found = list.find((s:any) => (s.id || s) === seedSelected);
            if (!found) return alert('No seed selected');
            const errs = validateSeed(found, seedType);
            if (errs && errs.length) {
              // show simple alert for now
              return alert('Validation failed:\n' + errs.join('\n'));
            }
            try {
              await saveDraft(found, seedType);
              alert('Draft saved to data/drafts/');
            } catch (err:any) {
              alert('Failed to save draft: ' + (err && err.message));
            }
          }}>Save Draft</button>
        </div>
      </div>
      <SeedViewerModal open={modalOpen} onClose={() => setModalOpen(false)} seed={preview} />
      {preview && (
        <div style={{ marginTop: 12 }}>
          <div><strong>{preview.name}</strong></div>
          <div>HP: {preview.hp} ATK: {preview.atk} DEF: {preview.def} SPD: {preview.speed}</div>
          <div style={{ marginTop: 8 }}>Techniques: {Array.isArray(preview.techniques) ? preview.techniques.join(', ') : 'none'}</div>
          <div style={{ marginTop: 8 }}>Loot: {Array.isArray(preview.loot) ? preview.loot.map((l:any)=> JSON.stringify(l)).join(', ') : 'none'}</div>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => { store.addEventLog(`Previewed template ${preview.id}`); }}>Log Preview</button>
          </div>
        </div>
      )}
    </div>
  );
}
