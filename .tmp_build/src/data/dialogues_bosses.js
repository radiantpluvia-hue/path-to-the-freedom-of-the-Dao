"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BOSS_DIALOGUES = [
    { id: 'boss_sentinel_entry', title: 'Boss - Sentinel Entry', mono: true, lines: [{ speaker: 'boss_sentinel', text: 'I stand where mountains end. Your efforts are merely changes in dust.' }], tags: ['boss', 'entry'] },
    { id: 'boss_sentinel_shift', title: 'Boss - Sentinel Shift', lines: [{ speaker: 'boss_sentinel', text: 'Steel remembers; it will not forgive your trespass.' }], tags: ['boss', 'shift'] },
    { id: 'boss_sentinel_finale', title: 'Boss - Sentinel Finale', mono: true, lines: [{ speaker: 'boss_sentinel', text: 'You thought the end was mercy. Mercy was only the preface.' }], tags: ['boss', 'finale'] },
    { id: 'boss_azure_arrival', title: 'Boss - Azure Arrival', lines: [{ speaker: 'boss_azure', text: 'You have crossed into my tide. The sea answers with teeth.' }], tags: ['boss', 'arrival', 'taunt'] },
    { id: 'boss_azure_rage', title: 'Boss - Azure Rage', mono: true, lines: [{ speaker: 'boss_azure', text: 'Storm into being. Let the sky break and be remade by my hands.' }], tags: ['boss', 'rage', 'phase'] },
    { id: 'boss_oblivion_whisper', title: 'Boss - Oblivion Whisper', lines: [{ speaker: 'boss_oblivion', text: 'Names mean little where the void eats the hours. Stand and be forgotten.' }], tags: ['boss', 'void', 'taunt'] },
    { id: 'boss_phase_shift_1', title: 'Boss - Phase Shift (I)', lines: [{ speaker: 'boss_azure', text: 'You claw at the surface of power. Now see its depths.' }], tags: ['boss', 'phase', 'shift'] },
    { id: 'boss_phase_shift_2', title: 'Boss - Phase Shift (II)', mono: true, lines: [{ speaker: 'boss_oblivion', text: 'Ash and breath — both will answer my command.' }], tags: ['boss', 'phase'] }
];
exports.default = BOSS_DIALOGUES;
