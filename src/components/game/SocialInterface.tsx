import { useGameStore } from '../../store/useGameStore';
import { Card } from '../core/Card';
import { ChoiceModal } from '../../../ChoiceModal';
import { CodexModal } from '../Codex';
import { RivalInfoPanel } from '@/components/info/RivalInfoPanel';
import { FactionStandingPanel } from '@/components/info/FactionStandingPanel';
import { FactionPanel } from '../../../FactionPanel';
import { RivalsPanel } from '../../../RivalsPanel';
import { ManualsPanel } from './ManualsPanel';

import InventoryPanel from './InventoryPanel';
import { useEffect, useRef, useState } from 'react';
export function SocialInterface() {
  // Select only what we need to reduce render churn
  const ui = useGameStore(s => s.ui);
  const world = useGameStore(s => s.world);
  const setUIProperty = useGameStore(s => s.setUIProperty);
  const focusInventory = useGameStore(s => (s.ui as any).focusInventory ?? false);
  const [announce, setAnnounce] = useState('');
  const inventoryRef = useRef<HTMLDivElement | null>(null);
  const [inventoryVisibleClass, setInventoryVisibleClass] = useState('');

  useEffect(() => {
    if (focusInventory) {
      setAnnounce('Inventory opened and focused');
      setInventoryVisibleClass('inventory-reveal');
      // remove class after animation ends to keep DOM clean
      const t = setTimeout(() => setInventoryVisibleClass(''), 700);
      return () => clearTimeout(t);
    }
  }, [focusInventory]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Tabs for Core | Social */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 20px',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, var(--dark), var(--darker))',
          zIndex: 5,
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <button
          onClick={() => setUIProperty('currentScreen', 'game')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: ui.currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Core
        </button>
        <button
          onClick={() => setUIProperty('currentScreen', 'social')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: ui.currentScreen === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Social
        </button>
        <button
          onClick={() => setUIProperty('currentScreen', 'relationships')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: (ui.currentScreen as string) === 'relationships' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Relationships
        </button>
      </div>

      <div style={{ padding: 20 }}>
        {/* Global Rival Info Modal */}
        {(ui as any).selectedRival && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500
          }}>
            <div style={{ backgroundColor: 'var(--dark)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
              <RivalInfoPanel
                rivalId={(ui as any).selectedRival}
                onClose={() => setUIProperty('selectedRival', null)}
                onChallenge={(rid) => {
                  (useGameStore.getState() as any).startRivalEncounter(rid);
                  setUIProperty('selectedRival', null);
                }}
              />
            </div>
          </div>
        )}

  <ChoiceModal />
  <CodexModal open={ui.showCodex} onClose={() => setUIProperty('showCodex', false)} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            alignItems: 'start'
          }}
        >
          <div style={{ display: 'grid', gap: 20 }}>
            {(world.currentWorldType && world.currentWorldType !== 'mortal') && (
              <Card title="🏛️ Relations">
                <FactionStandingPanel />
              </Card>
            )}
            {(world.currentWorldType && world.currentWorldType !== 'mortal') && <FactionPanel />}
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <Card title="⚔️ Rivals">
              <RivalsPanel />
            </Card>

            {/* Legacy Skills card removed */}



            {/* Surface Inventory on Social page for unified navigation */}
            <Card title="🎒 Inventory">
              {/* ARIA live region for screen readers */}
              <div aria-live="polite" style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>{announce}</div>
              <div
                ref={(el) => {
                  inventoryRef.current = el;
                  // If the store indicated focus, scroll this card into view once
                  if (el && focusInventory) {
                    try {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Try to focus the search input inside InventoryPanel for keyboard users
                      try {
                        const input = el.querySelector('input');
                        if (input && (input as HTMLElement).focus) {
                          // small timeout so that smooth scrolling won't clash with focusing in some browsers
                          setTimeout(() => { try { (input as HTMLElement).focus(); } catch(e) { void e; } }, 120);
                        }
                      } catch (e) { /* ignore */ }
                    } catch(e) { void e; }
                    // clear the flag so we don't re-scroll on every render
                    setUIProperty('focusInventory', false);
                  }
                }}
                className={inventoryVisibleClass}
                style={{ transition: 'transform 0.45s cubic-bezier(.2,.9,.2,1), opacity 0.45s', transformOrigin: 'center top' }}
              >
                <InventoryPanel />
              </div>
              <style>{`
                .inventory-reveal { transform: translateY(-6px) scale(1.02); opacity: 0.98; box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
              `}</style>
            </Card>
            <ManualsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}