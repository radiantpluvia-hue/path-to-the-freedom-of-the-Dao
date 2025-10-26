"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MusicPlayer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useGameStore_1 = require("@/store/useGameStore");
function MusicPlayer() {
    const playing = (0, useGameStore_1.useGameStore)(s => s.musicPlaying);
    const track = (0, useGameStore_1.useGameStore)(s => s.currentMusicTrack);
    const playMusic = (0, useGameStore_1.useGameStore)(s => s.playMusic);
    const stopMusic = (0, useGameStore_1.useGameStore)(s => s.stopMusic);
    const setAutoplayBlocked = (0, useGameStore_1.useGameStore)(s => s.setAutoplayBlocked);
    const autoplayBlocked = (0, useGameStore_1.useGameStore)(s => s.autoplayBlocked);
    const enableAudioRequestTimestamp = (0, useGameStore_1.useGameStore)(s => s.enableAudioRequestTimestamp ?? 0);
    const audioRef = (0, react_1.useRef)(null);
    const volume = (0, useGameStore_1.useGameStore)(s => s.musicVolume ?? 1);
    const muted = (0, useGameStore_1.useGameStore)(s => s.musicMuted ?? false);
    (0, react_1.useEffect)(() => {
        const a = audioRef.current;
        if (!a)
            return;
        try {
            // Ensure audio element has a ready source to satisfy user gesture requirements
            const defaultTrack = 'china-chinese-asian-music-346568.mp3';
            if (track) {
                a.src = `/assets/music/${track}`;
            }
            else if (!a.src) {
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
                try {
                    a.pause();
                }
                catch (e) { /* ignore */ }
            }
        }
        catch (e) {
            // jsdom warns about unimplemented media operations; ignore in tests
        }
    }, [playing, track, volume, muted, setAutoplayBlocked]);
    // listen for external requests to enable audio (user-gesture proxy from other UI)
    (0, react_1.useEffect)(() => {
        if (!enableAudioRequestTimestamp)
            return;
        // run the same flow as handleEnableAudio
        const run = async () => {
            const a = audioRef.current;
            if (!a)
                return;
            try {
                const prevSrc = a.src;
                a.src = `/assets/music/${track || 'china-chinese-asian-music-346568.mp3'}`;
                a.currentTime = 0;
                await a.play();
                setTimeout(() => {
                    try {
                        a.pause();
                        if (prevSrc)
                            a.src = prevSrc;
                    }
                    catch (e) {
                        void e;
                    }
                }, 1500);
                setAutoplayBlocked?.(false);
            }
            catch (e) {
                setAutoplayBlocked?.(true);
            }
        };
        void run();
    }, [enableAudioRequestTimestamp, track, setAutoplayBlocked]);
    const handleEnableAudio = async () => {
        const a = audioRef.current;
        if (!a)
            return;
        try {
            // play a short preview clip to confirm audio is enabled
            const prevSrc = a.src;
            a.src = `/assets/music/${track || 'china-chinese-asian-music-346568.mp3'}`;
            a.currentTime = 0;
            await a.play();
            // pause after short preview
            setTimeout(() => {
                try {
                    a.pause();
                    if (prevSrc)
                        a.src = prevSrc;
                }
                catch (e) {
                    void e;
                }
            }, 1500);
            setAutoplayBlocked?.(false);
        }
        catch (e) {
            setAutoplayBlocked?.(true);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "music-player", children: [(0, jsx_runtime_1.jsx)("audio", { ref: audioRef }), !playing ? ((0, jsx_runtime_1.jsx)("button", { onClick: () => playMusic?.('china-chinese-asian-music-346568.mp3'), children: "Play Music" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => stopMusic?.(), children: "Stop Music" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'inline-block', marginLeft: 8 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleEnableAudio, style: { marginRight: 8 }, "aria-pressed": !autoplayBlocked, children: "Enable Audio" }), autoplayBlocked ? (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 12, color: '#a00' }, children: "Audio blocked \u2014 click to enable preview" }) : (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 12, color: '#080' }, children: "Audio enabled" })] })] }))] }));
}
