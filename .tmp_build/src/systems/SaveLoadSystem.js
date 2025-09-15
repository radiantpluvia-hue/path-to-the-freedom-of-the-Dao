"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveLoadSystem = void 0;
class SaveLoadSystem {
    static saveGame(gameState) {
        try {
            const saveData = {
                // Ensure the entire game state is saved
                gameState,
                gameVersion: '1.0.0',
                timestamp: Date.now()
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        }
        catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }
    static loadGame() {
        try {
            const saveString = localStorage.getItem(this.SAVE_KEY);
            if (!saveString)
                return null;
            const saveData = JSON.parse(saveString);
            // Run conservative legacy migrations to keep old saves compatible.
            this.migrateLegacyKeys(saveData);
            return saveData;
        }
        catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }
    /**
     * Conservative migration for legacy keys in save data.
     * Maps `hermit*` keys to `seclusion*` variants where found.
     */
    static migrateLegacyKeys(saveData) {
        try {
            if (!saveData || !saveData.gameState)
                return;
            const gs = saveData.gameState;
            // small helper: conservative copy only when new key missing
            const copyIfMissing = (obj, oldKey, newKey) => {
                if (!obj || typeof obj !== 'object')
                    return;
                if (obj[oldKey] !== undefined && obj[newKey] === undefined) {
                    obj[newKey] = obj[oldKey];
                }
            };
            // top-level legacy mappings (non-destructive)
            copyIfMissing(gs, 'hermitPath', 'seclusionPath');
            copyIfMissing(gs, 'hermitCurse', 'seclusionCurse');
            copyIfMissing(gs, 'hermitStudyProgress', 'seclusionStudyProgress');
            // mentorTeachings: update known legacy mentor IDs conservatively and nested fields
            if (gs.mentorTeachings && Array.isArray(gs.mentorTeachings)) {
                gs.mentorTeachings = gs.mentorTeachings.map((m) => {
                    try {
                        if (m && m.id === 'hermitCurse') {
                            // replace id but keep other fields intact
                            return { ...m, id: 'seclusionCurse' };
                        }
                        // For nested objects (prerequisites, reward, failureConsequence) copy hermit* -> seclusion*
                        ['prerequisites', 'reward', 'failureConsequence'].forEach((k) => {
                            if (m && m[k] && typeof m[k] === 'object') {
                                copyIfMissing(m[k], 'hermitCurse', 'seclusionCurse');
                                copyIfMissing(m[k], 'hermitStudyProgress', 'seclusionStudyProgress');
                            }
                        });
                        return m;
                    }
                    catch (e) {
                        // Be best-effort: if a malformed teaching exists, leave it as-is.
                        return m;
                    }
                });
            }
            // player-level conservative mappings
            if (gs.player && typeof gs.player === 'object') {
                copyIfMissing(gs.player, 'hermitStatus', 'seclusionStatus');
                copyIfMissing(gs.player, 'hermitStudyProgress', 'seclusionStudyProgress');
            }
            // Basic shape validation: ensure world/day/tick exist to avoid runtime errors.
            // Only apply conservative shape defaulting for legacy save versions (pre-1.x)
            // to avoid mutating up-to-date save files created by this code (v1.0.0+).
            const isLegacyVersion = !saveData.gameVersion || String(saveData.gameVersion).startsWith('0');
            if (isLegacyVersion) {
                if (!gs.world || typeof gs.world !== 'object') {
                    gs.world = { day: 0, tick: 0 };
                }
                else {
                    if (typeof gs.world.day !== 'number')
                        gs.world.day = 0;
                    if (typeof gs.world.tick !== 'number')
                        gs.world.tick = 0;
                }
            }
            // write-back is implicit since we mutate saveData
        }
        catch (e) {
            console.warn('SaveLoadSystem: migrateLegacyKeys failed', e);
        }
    }
    static deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            return true;
        }
        catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }
}
exports.SaveLoadSystem = SaveLoadSystem;
SaveLoadSystem.SAVE_KEY = 'cultivation_game_save';
