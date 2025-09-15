const fs = require('fs');
const path = 'c:\\Users\\xbo4k.ZLOVE.000\\Downloads\\xianxia game\\act2_events.json';
const ids = [
  'act2_outer_sect_trial',
  'act2_investigate_ancient_ruins',
  'act2_time_sensitive_breakthrough',
  'act2_guarded_by_spirit_fox',
  'act2_secret_mission_from_upper_north_sect',
  'act2_rumor_of_relic_heist',
  'act2_find_hidden_treasure_map',
  'act2_shadow_assassin_request',
  'act2_duel_with_immortal_disciple',
  'act2_festival_of_moons_aligning'
];
try {
  const arr = JSON.parse(fs.readFileSync(path,'utf8'));
  const res = {};
  for (const id of ids) {
    res[id] = !!arr.find(e => e && e.id === id);
  }
  console.log(JSON.stringify(res, null, 2));
} catch (err) {
  console.error('ERROR', err && err.message);
  process.exit(1);
}
