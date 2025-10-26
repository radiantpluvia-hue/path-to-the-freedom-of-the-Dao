import { InterpersonalTab } from '@/components/InterpersonalTab';
import { useGameStore } from '@/store/useGameStore';
import { useEffect } from 'react';
import { useRelationshipsStore } from '@/store/relationships';

export default function InterpersonalPage() {
  const { setUIProperty } = useGameStore();

  // Optional rival syncing on entry, guarded by includeRival toggle
  useEffect(() => {
    try {
      const relStore = useRelationshipsStore.getState();
      if (!relStore.includeRival) return;
      const rivals = useGameStore.getState().rivalSystem.getAllRivals();
      relStore.syncRivals(rivals);
    } catch {
      // no-op if rival system not initialized or in non-browser env
    }
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 12 }}>
        <button
          style={{ padding: '8px 12px' }}
          onClick={() => setUIProperty('currentScreen', 'social')}
        >
          ← Back to Social
        </button>
      </div>
      <h1 style={{ color: 'var(--primary)', marginBottom: 12 }}>Interpersonal Relationships</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Add, edit, and organize your connections. Rival entries can be included automatically when enabled.</p>
      <InterpersonalTab />
    </div>
  );
}
