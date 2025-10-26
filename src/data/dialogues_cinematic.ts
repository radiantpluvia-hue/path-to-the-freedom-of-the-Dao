import type { Dialogue } from '../types';

const CINEMATIC_DIALOGUES: Dialogue[] = [
  { id: 'cinematic_rain_still', title: 'Cinematic - Rain Still', mono: true, lines: [{ speaker: 'narrator', text: 'Rain stilled for a single breath; the world held it like a secret before letting it fall.' }], tags: ['cinematic','ambient'] },
  { id: 'cinematic_moon_drop', title: 'Cinematic - Moon Drop', lines: [{ speaker: 'narrator', text: 'The moon drops a sliver and the shadows take a different shape.' }], tags: ['cinematic','visual'] },
  { id: 'cinematic_boss_intro', title: 'Cinematic - Boss Intro', mono: true, lines: [ { speaker: 'narrator', text: 'The sky cracks as the herald trudges in, dragging the world’s shadow behind him.' } ], tags: ['cinematic','boss','intro'] }
];

// Additional cinematic beats and atmospheric lines
CINEMATIC_DIALOGUES.push(
  { id: 'cinematic_street_light', title: 'Cinematic - Street Light', lines: [{ speaker: 'narrator', text: 'A single lantern sways; in its pool of light, secrets are briefly honest.' }], tags: ['cinematic','ambient'] },
  { id: 'cinematic_slow_pan', title: 'Cinematic - Slow Pan', mono: true, lines: [{ speaker: 'narrator', text: 'The camera of the mind pans slowly across ruins, lingering where memories hurt.' }], tags: ['cinematic','visual'] },
  { id: 'cinematic_heartbeat', title: 'Cinematic - Heartbeat', lines: [{ speaker: 'narrator', text: 'A distant heartbeat matches the city, and for a moment the world seems less lonely.' }], tags: ['cinematic','sound'] },
  { id: 'cinematic_fear_shiver', title: 'Cinematic - Fear Shiver', mono: true, lines: [{ speaker: 'narrator', text: 'A wind carries a shiver through the crowd; someone remembers the scream.' }], tags: ['cinematic','ambient'] },
  { id: 'cinematic_finale_breath', title: 'Cinematic - Finale Breath', mono: true, lines: [{ speaker: 'narrator', text: 'Breath held, world paused; the final chord waits to be struck.' }], tags: ['cinematic','finale'] },
  { id: 'cinematic_gate_open', title: 'Cinematic - Gate Open', lines: [{ speaker: 'narrator', text: 'The ancient gate groans and opens; beyond it, something older stirs.' }], tags: ['cinematic','gate'] },
  { id: 'cinematic_shadows_walk', title: 'Cinematic - Shadows Walk', mono: true, lines: [{ speaker: 'narrator', text: 'Shadows do not always belong to the living; sometimes they march ahead.' }], tags: ['cinematic','mood'] },
  { id: 'cinematic_dust_settle', title: 'Cinematic - Dust Settle', lines: [{ speaker: 'narrator', text: 'Dust settles on the battlefield like an unwelcome audience.' }], tags: ['cinematic','visual'] },
  { id: 'cinematic_echoed_chant', title: 'Cinematic - Echoed Chant', mono: true, lines: [{ speaker: 'narrator', text: 'A chant echoes from a valley and returns, changed and hungry.' }], tags: ['cinematic','sound'] }
);

// Additional cinematic extras (5 prioritized)
CINEMATIC_DIALOGUES.push(
  { id: 'cinematic_extra_01', title: 'Cinematic - Extra 01', mono: true, lines: [{ speaker: 'narrator', text: 'A long road ends in a single step; the camera holds on that foot.' }], tags: ['cinematic','visual'] },
  { id: 'cinematic_extra_02', title: 'Cinematic - Extra 02', lines: [{ speaker: 'narrator', text: 'Fog folds the valley like a sleeping hand; something moves beneath it.' }], tags: ['cinematic','ambient'] },
  { id: 'cinematic_extra_03', title: 'Cinematic - Extra 03', mono: true, lines: [{ speaker: 'narrator', text: 'The sun blade-streaks the horizon and every silhouette sharpens into intent.' }], tags: ['cinematic','visual'] },
  { id: 'cinematic_extra_04', title: 'Cinematic - Extra 04', lines: [{ speaker: 'narrator', text: 'A bell tolls once. The sound finds the bones of the town and it answers.' }], tags: ['cinematic','sound'] },
  { id: 'cinematic_extra_05', title: 'Cinematic - Extra 05', mono: true, lines: [{ speaker: 'narrator', text: 'Eyes close, then open: the reveal is a breath and a bruise.' }], tags: ['cinematic','beat'] }
);

// Tone-focused cinematic additions (~5)
CINEMATIC_DIALOGUES.push(
  { id: 'cinematic_tone_tender_01', title: 'Cinematic - Tender 01', lines: [{ speaker: 'narrator', text: 'Two hands touch briefly in the crowd; the camera lingers on the small courage.' }], tags: ['cinematic','tender'] },
  { id: 'cinematic_tone_comic_01', title: 'Cinematic - Comic 01', lines: [{ speaker: 'narrator', text: 'A goat knocks over the banner; for a beat, the court remembers to laugh.' }], tags: ['cinematic','comic'] },
  { id: 'cinematic_tone_prophetic_01', title: 'Cinematic - Prophetic 01', mono: true, lines: [{ speaker: 'narrator', text: 'A child draws a circle in dust; later, leaders will mark it on maps.' }], tags: ['cinematic','prophetic'] },
  { id: 'cinematic_tone_mourn_01', title: 'Cinematic - Mourn 01', mono: true, lines: [{ speaker: 'narrator', text: 'The town lights a candle for every house emptied by the war.' }], tags: ['cinematic','mourn'] },
  { id: 'cinematic_tone_uplift_01', title: 'Cinematic - Uplift 01', lines: [{ speaker: 'narrator', text: 'A choir rises on the hill and something in the crowd decides to hope again.' }], tags: ['cinematic','uplift'] }
);
export default CINEMATIC_DIALOGUES;
