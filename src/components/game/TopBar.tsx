import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import ConfirmModal from '@/components/ui/ConfirmModal';
import RichTooltip from '@/components/ui/RichTooltip';
import SmallChip from '@/components/ui/SmallChip';

type TopBarProps = {
  currentScreen: string;
  compactLayout?: boolean;
  showRealmList?: boolean;
  setUIProperty?: (k: string, v: any) => void;
};

const TopBar: React.FC<TopBarProps> = ({ currentScreen, compactLayout, showRealmList, setUIProperty }) => {
  // selectors from store
  const musicPlaying = useGameStore(s => s.musicPlaying ?? false);
  const playMusic = useGameStore(s => s.playMusic);
  const stopMusic = useGameStore(s => s.stopMusic);
  const musicMuted = useGameStore(s => s.musicMuted ?? false);
  const setMusicMuted = useGameStore(s => s.setMusicMuted);
  const world: any = useGameStore(s => s.world) || {};
  const player: any = useGameStore(s => s.player) || {};
  // saveInProgress / lastSavedAt live under ui in the central store
  const saveInProgress = useGameStore(s => s.ui?.saveInProgress ?? false);
  const lastSavedAt = useGameStore(s => s.ui?.lastSavedAt ?? null);
  // requestEnableAudio isn't declared on the public GameStore interface in some
  // build configs, so read it via `any` to avoid a type error while still
  // preserving runtime behavior (other modules use the same pattern).
  const requestEnableAudio = useGameStore(s => (s as any).requestEnableAudio);

  const [showSavedToast, setShowSavedToast] = React.useState(false);
  const savedTimerRef = React.useRef<number | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    if (!lastSavedAt) return;
    setShowSavedToast(true);
    if (savedTimerRef.current != null) {
      window.clearTimeout(savedTimerRef.current);
    }
    savedTimerRef.current = window.setTimeout(() => {
      setShowSavedToast(false);
      savedTimerRef.current = null;
    }, 2500) as unknown as number;
    return () => {
      if (savedTimerRef.current != null) {
        window.clearTimeout(savedTimerRef.current);
        savedTimerRef.current = null;
      }
    };
  }, [lastSavedAt]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: 8, gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button"
          onClick={() => setUIProperty?.('currentScreen', 'game')}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
        >
          Core
        </button>

        <button type="button"
          onClick={() => setUIProperty?.('currentScreen', 'social')}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: currentScreen === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
        >
          Social
        </button>

        <button type="button"
          onClick={() => setUIProperty?.('currentScreen', 'domain')}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: currentScreen === 'domain' ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
        >
          Domain
        </button>
      </div>

      <button type="button"
        onClick={() => setUIProperty?.('currentScreen', 'tutorial')}
        style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer' }}
      >
        Tutorial
      </button>

      {/* Music controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
        {!musicPlaying ? (
          <RichTooltip content="Play music">
            <button type="button"
              onClick={() => playMusic?.('china-chinese-asian-music-346568.mp3')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'transparent', color: 'var(--primary)' }}
              aria-label="Play music"
            >
              ▶ Music
            </button>
          </RichTooltip>
        ) : (
          <RichTooltip content="Pause music">
            <button type="button"
              onClick={() => stopMusic?.()}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.15)', color: 'var(--primary)' }}
              aria-label="Pause music"
            >
              ⏸ Music
            </button>
          </RichTooltip>
        )}

        <RichTooltip content={musicMuted ? 'Unmute' : 'Mute'}>
          <button type="button"
            onClick={() => setMusicMuted?.(!musicMuted)}
            aria-pressed={musicMuted}
            aria-label={musicMuted ? 'Unmute' : 'Mute'}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: musicMuted ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)' }}
          >
            <span aria-hidden>{musicMuted ? '🔇' : '🔊'}</span>
            <span className="sr-only">{musicMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        </RichTooltip>

        {Boolean(requestEnableAudio) && (
          <RichTooltip content="Enable audio (click to allow)">
            <button type="button"
              onClick={() => { try { requestEnableAudio?.(); } catch (e) { void e; } }}
              aria-label="Enable audio"
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: 'linear-gradient(90deg,#2b2 0%, #274 100%)', color: '#fff' }}
            >
              Enable Audio
            </button>
          </RichTooltip>
        )}
      </div>

      {world?.currentEraId && (
        <RichTooltip content={`Era ${(world.currentEraId || '')} #${world.currentEraIndex ?? ''}\nBias: D${world?.eventBias?.dark ?? '-'} / N${world?.eventBias?.neutral ?? '-'} / L${world?.eventBias?.light ?? '-'}\nQi x${world?.eraNormalized?.qiDensityNorm ?? '-'} | Artifacts x${world?.eraNormalized?.artifactDensityNorm ?? '-'}`}>
          <SmallChip style={{ marginLeft: 8, fontSize: '0.8rem' }}>{`Era ${world.currentEraIndex}`}</SmallChip>
        </RichTooltip>
      )}

      {player?.alignment?.id && (
        <RichTooltip content={`${player.alignment.displayName || player.alignment.id}`}>
          <SmallChip style={{ marginLeft: 8, borderRadius: 8, background: 'rgba(255,255,255,0.02)', color: 'var(--primary)' }}>{player.alignment.displayName || player.alignment.id}</SmallChip>
        </RichTooltip>
      )}

      <RichTooltip content="Inventory">
        <button type="button"
          onClick={() => setUIProperty?.('showInventoryModal', true)}
          aria-label="Inventory"
          title="Inventory"
          style={{ padding: 0, marginLeft: 8 }}
        >
          <SmallChip>Inventory</SmallChip>
        </button>
      </RichTooltip>

      <RichTooltip content="Settings">
        <button type="button"
          onClick={() => setUIProperty?.('showSettings', true)}
          aria-label="Settings"
          style={{ padding: 0, marginLeft: 8 }}
        >
          <SmallChip>Settings</SmallChip>
        </button>
      </RichTooltip>

      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 8, gap: 6 }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          {saveInProgress ? 'Saving…' : (lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved')}
        </div>
      </div>

      <RichTooltip content="Toggle minimal UI">
        <button type="button"
          onClick={() => setUIProperty?.('compactLayout', !compactLayout)}
          aria-label="Toggle minimal UI"
          style={{ padding: 0, marginLeft: 8 }}
        >
          <SmallChip style={{ background: compactLayout ? 'rgba(212,175,55,0.15)' : 'transparent' }}>Minimal UI</SmallChip>
        </button>
      </RichTooltip>

      <RichTooltip content="Toggle realm list">
        <button type="button"
          onClick={() => setUIProperty?.('showRealmList', !showRealmList)}
          aria-label="Toggle realm list"
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: showRealmList ? 'rgba(212,175,55,0.15)' : 'transparent', color: 'var(--primary)', cursor: 'pointer', marginLeft: 8 }}
        >
          {showRealmList ? 'Hide' : 'Show'} realms
        </button>
      </RichTooltip>

      <RichTooltip content="Save game">
        <button type="button"
          onClick={() => { try { useGameStore.getState().saveGame(); } catch (e) { /* ignore */ } }}
          aria-label="Save game"
          title="Save game"
          disabled={saveInProgress}
          aria-disabled={saveInProgress}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: saveInProgress ? 'rgba(255,255,255,0.03)' : 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', cursor: saveInProgress ? 'not-allowed' : 'pointer', marginLeft: 8, position: 'relative' }}
        >
          💾 Save
          {saveInProgress ? (
            <div style={{ position: 'absolute', top: '-28px', right: 0 }}>
              <SmallChip style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--muted)', background: 'rgba(0,0,0,0.6)', borderRadius: 6 }}>Saving…</SmallChip>
            </div>
          ) : (showSavedToast && (
            <div style={{ position: 'absolute', top: '-28px', right: 0 }}>
              <SmallChip style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(0,0,0,0.6)', borderRadius: 6 }}>Saved</SmallChip>
            </div>
          ))}
        </button>
      </RichTooltip>

      <RichTooltip content="Load game">
        <button type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Load game"
          title="Load game"
          disabled={saveInProgress}
          aria-disabled={saveInProgress}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(212,175,55,0.25)', background: saveInProgress ? 'rgba(255,255,255,0.03)' : 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', cursor: saveInProgress ? 'not-allowed' : 'pointer', marginLeft: 8 }}
        >
          📁 Load
        </button>
      </RichTooltip>

      <ConfirmModal
        open={confirmOpen}
        title="Load saved game?"
        message="Loading will overwrite your current progress. Are you sure you want to load the most recent save?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          try { useGameStore.getState().loadGame(); } catch (e) { /* ignore */ }
        }}
      />
    </div>
  );
};

export default TopBar;
