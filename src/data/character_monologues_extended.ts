import type { Dialogue } from '../types';
import RIVAL_DIALOGUES from './dialogues_rivals';
import BOSS_DIALOGUES from './dialogues_bosses';
import VILLAIN_DIALOGUES from './dialogues_villains';
import CINEMATIC_DIALOGUES from './dialogues_cinematic';

// Extended catalogue of short dialogues and monologues for characters.
// Author: generated content to populate ambient lines, combat taunts, and scene beats.

const EXTENDED_MONOLOGUES: Dialogue[] = [
  // Sect leaders (variety of tones)
  { id: 'leader_jade_welcome', title: 'Jade Leader - Welcome', lines: [{ speaker: 'leader_jade', text: 'Welcome to the Jade Gate. Your first lesson is humility; learn it before you learn how to hold a sword.' }], tags: ['leader','intro'] },
  { id: 'leader_jade_calculation', title: 'Jade Leader - Calculation', mono: true, lines: [{ speaker: 'leader_jade', text: 'A leader weighs futures like stones; each choice sinks another life deeper into consequence.' }], tags: ['leader','monologue'] },
  { id: 'leader_iron_resolution', title: 'Iron Leader - Resolution', lines: [{ speaker: 'leader_iron', text: 'Steel bends in fire, and so must we in trial. Break once, and the forge forgives not.' }], tags: ['leader','stern'] },
  { id: 'leader_iron_secret', title: 'Iron Leader - Secret', mono: true, lines: [{ speaker: 'leader_iron', text: 'There is a ledger of debts only I can read—names that will be repaid in blood or silence.' }], tags: ['leader','dark'] },
  { id: 'leader_serene_advice', title: 'Serene Leader - Gentle Advice', lines: [{ speaker: 'leader_serene', text: 'Sit with your fear until it becomes a teacher; then it loses its teeth.' }], tags: ['leader','advice'] },

  // Vice leaders
  { id: 'vice_jade_pragmatic', title: 'Vice - Pragmatic', lines: [{ speaker: 'vice_jade', text: 'We will take what the world gives and make it useful. Sentiment lives in murals, not strategy.' }], tags: ['vice','pragmatic'] },
  { id: 'vice_iron_impatient', title: 'Vice - Impatient', lines: [{ speaker: 'vice_iron', text: 'Hesitation gets you slaughtered. Act and then explain if you must.' }], tags: ['vice','impatient'] },

  // Senior disciples and instructors
  { id: 'instructor_silva_sharp', title: 'Instructor - Sharp', lines: [{ speaker: 'instructor_silva', text: 'You assume form without foundation. Build the root, then the branches will obey.' }], tags: ['instructor','teaching'] },
  { id: 'senior_liang_pride', title: 'Senior Disciple - Pride', lines: [{ speaker: 'senior_liang', text: 'Years of training fit me like armor; still, I polish my blade each night as if it were new.' }], tags: ['disciple','pride'] },
  { id: 'senior_liang_doubt', title: 'Senior Disciple - Doubt', mono: true, lines: [{ speaker: 'senior_liang', text: 'Sometimes I wonder if the path made me or I made the path to justify my steps.' }], tags: ['disciple','monologue'] },

  // Junior disciples and trainees
  { id: 'junior_hopeful', title: 'Junior - Hopeful', lines: [{ speaker: 'junior_han', text: 'I will learn every technique, then one day the world will call me master.' }], tags: ['junior','hope'] },
  { id: 'junior_exhausted', title: 'Junior - Exhausted', lines: [{ speaker: 'junior_han', text: 'My limbs ache, but I will not stop. Pain is the blacksmith of will.' }], tags: ['junior','grind'] },

  // Mentors and elders
  { id: 'mentor_old_sage', title: 'Mentor - Old Sage', lines: [{ speaker: 'mentor_old', text: 'Knowledge passed without understanding is a lamp handed to the blind.' }], tags: ['mentor','sage'] },
  { id: 'mentor_old_private', title: 'Mentor - Private', mono: true, lines: [{ speaker: 'mentor_old', text: 'There are regrets that never leave the heart. We teach not to forget them, but to carry them lightly.' }], tags: ['mentor','sad'] },

  // Rivals: cocky, cold, bitter
  { id: 'rival_cocky_bold', title: 'Rival - Cocky', lines: [{ speaker: 'rival_wu', text: 'A pretty stance won’t save you. Let your technique do the talking.' }], tags: ['rival','taunt'] },
  { id: 'rival_cold_observe', title: 'Rival - Cold Observe', mono: true, lines: [{ speaker: 'rival_wu', text: 'I watch the world and choose the moment it forgets to look at me.' }], tags: ['rival','cold'] },
  { id: 'rival_bitter_vow', title: 'Rival - Bitter Vow', mono: true, lines: [{ speaker: 'rival_qing', text: 'They took autumn from my family; I will take spring from their heirs.' }], tags: ['rival','bitter'] },

  // Villains - charismatic, pragmatic, cruel
  { id: 'villain_charisma', title: 'Villain - Charisma', lines: [{ speaker: 'villain_yu', text: 'I offer order where there was chaos — a small price to pay for a world remade.' }], tags: ['villain','charisma'] },
  { id: 'villain_practical', title: 'Villain - Practical', mono: true, lines: [{ speaker: 'villain_yu', text: 'Compassion is an indulgence. Efficiency is salvation.' }], tags: ['villain','practical'] },
  { id: 'villain_cruel_sneer', title: 'Villain - Cruel', lines: [{ speaker: 'villain_yu', text: 'Scream now. It is part of the ritual I enjoy most.' }], tags: ['villain','cruel'] },

  // Friends and comrades
  { id: 'friend_jovial', title: 'Friend - Jovial', lines: [{ speaker: 'friend_bao', text: 'You owe me tea for the trouble you caused me today. Also, you owe your life to me, but that is cheaper.' }], tags: ['friend','banter'] },
  { id: 'friend_steady', title: 'Friend - Steady', lines: [{ speaker: 'friend_bao', text: 'When the storm comes, stand close. Two people make less wind.' }], tags: ['friend','support'] },

  // Lovers / romantic lines
  { id: 'lover_whisper', title: 'Lover - Whisper', mono: true, lines: [{ speaker: 'lover_rou', text: 'Your hand in mine anchors the world. Do not let go.' }], tags: ['lover','romance'] },
  { id: 'lover_scold', title: 'Lover - Scold', lines: [{ speaker: 'lover_rou', text: 'You are reckless. If you die, who will listen to my stories about you?' }], tags: ['lover','tease'] },

  // Scholars and town archivists
  { id: 'scholar_murmur', title: 'Scholar - Murmur', lines: [{ speaker: 'scholar_lin', text: 'Most histories are accidental lies stitched together with truth.' }], tags: ['scholar','lore'] },
  { id: 'scholar_warning', title: 'Scholar - Warning', lines: [{ speaker: 'scholar_lin', text: 'There are pages bound in silence — best left unread by hungry hands.' }], tags: ['scholar','warning'] },

  // Commanders and generals
  { id: 'general_order', title: 'General - Order', lines: [{ speaker: 'general_zhou', text: 'Hold the line. If you fall, the next man holds it in your name.' }], tags: ['general','command'] },
  { id: 'general_reflect', title: 'General - Reflect', mono: true, lines: [{ speaker: 'general_zhou', text: 'War reveals character like fire reveals ore. Some pieces are worthless afterward.' }], tags: ['general','sombre'] },

  // Bandits & low-level antagonists
  { id: 'bandit_snarl', title: 'Bandit - Snarl', lines: [{ speaker: 'bandit_kai', text: 'Your purse or your pride — either serves us well.' }], tags: ['bandit','threat'] },
  { id: 'bandit_regret', title: 'Bandit - Regret', mono: true, lines: [{ speaker: 'bandit_kai', text: 'I used to fish for a living. This was easier to learn than patience.' }], tags: ['bandit','sad'] },

  // Cultivator contemplations (ambient)
  { id: 'cultivator_stillness', title: 'Cultivator - Stillness', mono: true, lines: [{ speaker: 'cultivator_generic', text: 'To sit still is to gather wind; stillness is the first step toward control.' }], tags: ['cultivator','ambient'] },
  { id: 'cultivator_flare', title: 'Cultivator - Flare', lines: [{ speaker: 'cultivator_generic', text: 'Qi surges like river-born flame — ride it, and you may scorch the sky.' }], tags: ['cultivator','combat'] },

  // Temple acolytes and townsfolk
  { id: 'acolyte_prayer', title: 'Acolyte - Prayer', lines: [{ speaker: 'acolyte', text: 'May the Dao shelter the lost and sharpen the blades of the righteous.' }], tags: ['acolyte','ambient'] },
  { id: 'merchant_patron', title: 'Merchant - Patron', lines: [{ speaker: 'merchant', text: 'Goods fresh from the caravan — no, I cannot lower the price for sentimental heroes.' }], tags: ['merchant','banter'] },

  // Lovers parted / tragic
  { id: 'lover_parting', title: 'Lover - Parting', mono: true, lines: [{ speaker: 'lover_yi', text: 'If fate insists we leave, then I will fold every memory like a map and keep it close.' }], tags: ['lover','tragic'] },

  // Rival rivalry development lines
  { id: 'rival_rivalry_edge', title: 'Rival - Edge', lines: [{ speaker: 'rival_hao', text: 'I grow tired of second place. Your medal will taste like metal and regret.' }], tags: ['rival','rivalry'] },

  // Quiet villain plotting
  { id: 'villain_plot_whisper', title: 'Villain - Plot Whisper', mono: true, lines: [{ speaker: 'villain_min', text: 'A whisper here, a nudge there; by next moon the council will bend to my will.' }], tags: ['villain','plot'] },

  // Friendly mentor ribbing
  { id: 'mentor_ribbing', title: 'Mentor - Ribbing', lines: [{ speaker: 'mentor_rui', text: 'You call that a stance? My grandmother could block that with a fan and a laugh.' }], tags: ['mentor','banter'] },

  // Exploration ambience for ruins and temples
  { id: 'temple_echo', title: 'Temple - Echo', mono: true, lines: [{ speaker: 'temple_echo', text: 'Echoes layer upon echoes; step lightly or awaken what sleeps between.' }], tags: ['ambient','ruins'] },

  // Short combat one-liners for variety
  { id: 'combat_quick_1', title: 'Combat - Quick 1', lines: [{ speaker: 'combat_generic', text: 'Strike true!' }], tags: ['combat','short'] },
  { id: 'combat_quick_2', title: 'Combat - Quick 2', lines: [{ speaker: 'combat_generic', text: 'Now!' }], tags: ['combat','short'] },

  // Closing reflective monologue for leaders
  { id: 'leader_close_reflect', title: 'Leader - Close Reflect', mono: true, lines: [{ speaker: 'leader_jade', text: 'In the end, a leader is simply a mirror. The world sees what we offer and returns it doubled.' }], tags: ['leader','reflect'] }
  ,
    // Player internal training monologues
    { id: 'player_practice_focused', title: 'Player - Focused Practice', mono: true, lines: [{ speaker: 'player', text: 'Breathe. Feel the Qi pulse along the tendon — the strike is a promise, not an impulse.' }], tags: ['player','training','monologue'] },
    { id: 'player_practice_doubt', title: 'Player - Doubt', mono: true, lines: [{ speaker: 'player', text: 'The movement flinches. Is this fatigue, or the part of me that still fears being wrong?' }], tags: ['player','training','monologue','doubt'] },
    { id: 'player_practice_epiphany', title: 'Player - Small Epiphany', mono: true, lines: [{ speaker: 'player', text: 'A tiny correction — the world feels different. The technique answers back, faint but real.' }], tags: ['player','training','monologue','epiphany'] },
    { id: 'player_practice_strain', title: 'Player - Strain', mono: true, lines: [{ speaker: 'player', text: 'My limbs twinge and the Qi pools sluggishly. It will cost more to coax it into motion.' }], tags: ['player','training','monologue','strain'] },
    { id: 'player_practice_botch', title: 'Player - Botched Practice', mono: true, lines: [{ speaker: 'player', text: 'Pain flares — the form collapses. For a heartbeat I am only human, and the Dao laughs.' }], tags: ['player','training','monologue','botch'] }
    ,
    // Weapon-specific training monologues
    { id: 'player_weapon_practice_1', title: 'Player - Weapon Practice (Short)', mono: true, lines: [{ speaker: 'player', text: 'Grip the haft. Feel the weight, then let skill carry it.' }], tags: ['player','training','weapon','monologue'] },
    { id: 'player_weapon_practice_sequence', title: 'Player - Weapon Practice (Sequence)', mono: true, lines: [
      { speaker: 'player', text: 'Swing one — the arc is obedient.' },
      { speaker: 'player', text: 'Swing two — the breath syncs with momentum.' },
      { speaker: 'player', text: 'A pause, a correction. The weapon and I map a shared intent.' }
    ], tags: ['player','training','weapon','sequence'] },
    { id: 'player_weapon_epiphany', title: 'Player - Weapon Epiphany', mono: true, lines: [{ speaker: 'player', text: 'The haft hums with purpose; a rhythm reveals the missing link in my form.' }], tags: ['player','training','weapon','epiphany'] },
    { id: 'player_weapon_botch', title: 'Player - Weapon Botch', mono: true, lines: [{ speaker: 'player', text: 'The weapon slips. Shame is a heavier burden than the blow.' }], tags: ['player','training','weapon','botch'] },

    // Cultivation/internal technique training monologues
    { id: 'player_cultivation_practice_1', title: 'Player - Cultivation Practice (Short)', mono: true, lines: [{ speaker: 'player', text: 'Draw the Qi inward. Like a hidden spring, it waits for direction.' }], tags: ['player','training','cultivation','monologue'] },
    { id: 'player_cultivation_sequence', title: 'Player - Cultivation Practice (Sequence)', mono: true, lines: [
      { speaker: 'player', text: 'Breathe slow — the world narrows.' },
      { speaker: 'player', text: 'Heat pools behind the ribs; patience shapes its flow.' },
      { speaker: 'player', text: 'A small clarity trembles at the edge of thought; I reach for it.' }
    ], tags: ['player','training','cultivation','sequence'] },
    { id: 'player_cultivation_epiphany', title: 'Player - Cultivation Epiphany', mono: true, lines: [{ speaker: 'player', text: 'A new channel opens. The Dao answers in a breath and I understand its tone.' }], tags: ['player','training','cultivation','epiphany'] },
    { id: 'player_cultivation_botch', title: 'Player - Cultivation Botch', mono: true, lines: [{ speaker: 'player', text: 'Qi recoils — the attempt fractures. My body remembers pain better than grace.' }], tags: ['player','training','cultivation','botch'] }
];

// Consolidate themed dialogues to themed files to keep this catalogue maintainable
EXTENDED_MONOLOGUES.push(...RIVAL_DIALOGUES);
EXTENDED_MONOLOGUES.push(...BOSS_DIALOGUES);
EXTENDED_MONOLOGUES.push(...VILLAIN_DIALOGUES);
EXTENDED_MONOLOGUES.push(...CINEMATIC_DIALOGUES);

// Miscellaneous encounter and ambient lines (kept here for now)
EXTENDED_MONOLOGUES.push(
  { id: 'minion_scatter', title: 'Minion - Scatter', lines: [{ speaker: 'minion_c', text: 'Keep them crowded. They panic faster when they cannot breathe.' }], tags: ['minion','combat'] },
  { id: 'minion_jeer', title: 'Minion - Jeer', lines: [{ speaker: 'minion_d', text: 'Run with your tail tucked. We sharpen knives on the backs of runners.' }], tags: ['minion','jeer'] },
  { id: 'minion_cry_for_leader', title: 'Minion - Cry for Leader', mono: true, lines: [{ speaker: 'minion_e', text: 'For the master — for the ledger — for the coin that keeps our mouths fed.' }], tags: ['minion','grim'] },
  { id: 'elite_guard_ritual', title: 'Elite Guard - Ritual', lines: [ { speaker: 'elite_guard', text: 'The sigils are walked; the oath is sworn. Fall now and be hushed by the bell.' } ], tags: ['elite','ritual'] },
  { id: 'elite_guard_last_stand', title: 'Elite Guard - Last Stand', mono: true, lines: [ { speaker: 'elite_guard', text: 'One more breath for the banner. Then let the rest of us sleep.' } ], tags: ['elite','courage'] },
  { id: 'lieutenant_pride', title: 'Lieutenant - Pride', mono: true, lines: [{ speaker: 'lieutenant_hu', text: 'A lieutenant is the hand of command; I bend and the field obeys.' }], tags: ['elite','lieutenant'] },
  { id: 'lieutenant_undermine', title: 'Lieutenant - Undermine', lines: [{ speaker: 'lieutenant_hu', text: 'We will cut the supply line first. A hungry army is an angry one.' }], tags: ['elite','tactic'] },
  { id: 'npc_launderer_tip', title: 'NPC - Launderer Tip', lines: [{ speaker: 'npc_launderer', text: 'Wash the red from the hem before you mend it — stains remember wrong hands.' }], tags: ['npc','tip'] },
  { id: 'npc_tavern_banter', title: 'NPC - Tavern Banter', lines: [{ speaker: 'npc_barkeep', text: 'If you have coin, I have a story. If you have no coin, I have the same story for free.' }], tags: ['npc','banter'] },
  { id: 'npc_hook_old_map', title: 'NPC - Old Map Hook', lines: [{ speaker: 'npc_oldman', text: 'Bring me that ragged map and I will tell you where the well hides a secret path.' }], tags: ['npc','quest'] },
  { id: 'npc_hook_lost_ring', title: 'NPC - Lost Ring Hook', lines: [{ speaker: 'npc_widow', text: 'My ring fell where the lantern light dies. Bring it back and I will trade a blessing.' }], tags: ['npc','quest'] },
  { id: 'combat_death_throe', title: 'Combat - Death Throe', mono: true, lines: [{ speaker: 'combat_generic', text: 'My breath leaves me like a poor coin — small and not worth much.' }], tags: ['combat','death'] },
  { id: 'combat_one_liner_slam', title: 'Combat - One Liner Slam', lines: [{ speaker: 'combat_generic', text: 'Feel the weight of your choices!' }], tags: ['combat','taunt'] },
  { id: 'micro_reflect_1', title: 'Micro Reflect 1', mono: true, lines: [{ speaker: 'narrator', text: 'A small mercy carries further than a grand promise.' }], tags: ['reflect','micro'] },
  { id: 'micro_reflect_2', title: 'Micro Reflect 2', mono: true, lines: [{ speaker: 'narrator', text: 'The path is a conversation; sometimes you must listen more than speak.' }], tags: ['reflect','micro'] }
);

export default EXTENDED_MONOLOGUES;
