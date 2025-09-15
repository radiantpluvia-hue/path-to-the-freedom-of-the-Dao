const { ALL_BLOODLINES } = require('./src/data/xianxiaIntegration');

const ids = ALL_BLOODLINES.map(b => b.id);
const uniqueIds = new Set(ids);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

console.log('Total bloodlines:', ALL_BLOODLINES.length);
console.log('Unique IDs:', uniqueIds.size);
console.log('Duplicate IDs:', duplicates);

// Find which bloodlines have duplicate IDs
const duplicateEntries = ALL_BLOODLINES.filter(bloodline => 
  duplicates.includes(bloodline.id)
);

console.log('\nDuplicate entries:');
duplicateEntries.forEach(entry => {
  console.log(`ID: ${entry.id}, Name: ${entry.name}`);
});
