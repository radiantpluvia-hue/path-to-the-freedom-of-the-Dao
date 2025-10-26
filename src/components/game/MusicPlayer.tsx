import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function MusicPlayer() {
  const playing = useGameStore(s => s.musicPlaying);
  const track = useGameStore(s => s.currentMusicTrack);
  const playMusic = useGameStore(s => s.playMusic);
  const stopMusic = useGameStore(s => s.stopMusic);
  const setAutoplayBlocked = useGameStore(s => (s as any).setAutoplayBlocked);
  const autoplayBlocked = useGameStore(s => (s as any).autoplayBlocked);
  const enableAudioRequestTimestamp = useGameStore(s => (s as any).enableAudioRequestTimestamp ?? 0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const volume = useGameStore(s => s.musicVolume ?? 1);
  const muted = useGameStore(s => s.musicMuted ?? false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    try {
      // Ensure audio element has a ready source to satisfy user gesture requirements
      const defaultTrack = 'china-chinese-asian-music-346568.mp3';
      if (track) {
        a.src = `/assets/music/${track}`;
      } else if (!a.src) {
        a.src = `/assets/music/${defaultTrack}`;
      }
      a.loop = true;
      a.preload = 'auto';
      a.muted = muted;
      a.volume = typeof volume === 'number' ? Math.max(0, Math.min(1, volume)) : 1;

      if (playing && track && typeof a.play === 'function') {
        // Attempt to play — if browser blocks autoplay this will reject
        void a.play().then(() => {
          setAutoplayBlocked?.(false);
        }).catch(() => {
          // mark blocked so UI can prompt user to enable audio
          setAutoplayBlocked?.(true);
        });
      }

      if ((!playing || !track) && typeof a.pause === 'function') {
        try { a.pause(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // jsdom warns about unimplemented media operations; ignore in tests
    }
  }, [playing, track, volume, muted, setAutoplayBlocked]);

  // listen for external requests to enable audio (user-gesture proxy from other UI)
  useEffect(() => {
    if (!enableAudioRequestTimestamp) return;
    // run the same flow as handleEnableAudio
    const run = async () => {
      const a = audioRef.current;
      if (!a) return;
      try {
        const prevSrc = a.src;
        a.src = `/assets/music/${track || 'china-chinese-asian-music-346568.mp3'}`;
        a.currentTime = 0;
        await a.play();
        setTimeout(() => {
          try { a.pause(); if (prevSrc) a.src = prevSrc; } catch (e) { void e; }
        }, 1500);
        setAutoplayBlocked?.(false);
      } catch (e) {
        setAutoplayBlocked?.(true);
      }
    };
    void run();
  }, [enableAudioRequestTimestamp, track, setAutoplayBlocked]);

  const handleEnableAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      // play a short preview clip to confirm audio is enabled
      const prevSrc = a.src;
      a.src = `/assets/music/${track || 'china-chinese-asian-music-346568.mp3'}`;
      a.currentTime = 0;
      await a.play();
      // pause after short preview
      setTimeout(() => {
        try { a.pause(); if (prevSrc) a.src = prevSrc; } catch (e) { void e; }
      }, 1500);
      setAutoplayBlocked?.(false);
    } catch (e) {
      setAutoplayBlocked?.(true);
    }
  };

  return (
    <div className="music-player">
  <audio ref={audioRef} />
      {!playing ? (
        <button onClick={() => playMusic?.('china-chinese-asian-music-346568.mp3')}>Play Music</button>
      ) : (
        <>
          <button onClick={() => stopMusic?.()}>Stop Music</button>
          <div style={{display:'inline-block', marginLeft:8}}>
            <button onClick={handleEnableAudio} style={{ marginRight:8 }} aria-pressed={!autoplayBlocked}>Enable Audio</button>
            {autoplayBlocked ? <span style={{fontSize:12, color:'#a00'}}>Audio blocked — click to enable preview</span> : <span style={{fontSize:12, color:'#080'}}>Audio enabled</span>}
          </div>
        </>
      )}
    </div>
  );
}
