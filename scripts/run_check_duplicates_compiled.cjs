const path = require('path');
const x = require(path.join(__dirname,'..','.tmp_build','src','data','xianxiaIntegration.cjs'));
const ALL_BLOODLINES = x.ALL_BLOODLINES || x.default?.ALL_BLOODLINES || require(path.join(__dirname,'..','src','data','xianxiaIntegration'))?.ALL_BLOODLINES;
if(!ALL_BLOODLINES) { console.error('Could not find ALL_BLOODLINES'); process.exit(2); }
const ids = ALL_BLOODLINES.map(b => b.id);
const uniqueIds = new Set(ids);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('Total bloodlines:', ALL_BLOODLINES.length);
console.log('Unique IDs:', uniqueIds.size);
console.log('Duplicate IDs:', duplicates);

const duplicateEntries = ALL_BLOODLINES.filter(bloodline => duplicates.includes(bloodline.id));
console.log('\nDuplicate entries:');
duplicateEntries.forEach(entry => console.log(`ID: ${entry.id}, Name: ${entry.name}`));
