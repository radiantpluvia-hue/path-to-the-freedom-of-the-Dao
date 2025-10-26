const { ALL_BLOODLINES } = require('../src/data/xianxiaIntegration');

test('Check for duplicate bloodline IDs', () => {
  const ids = ALL_BLOODLINES.map(b => b.id);
  const uniqueIds = new Set(ids);
  
  console.log('Total bloodlines:', ALL_BLOODLINES.length);
  console.log('Unique IDs:', uniqueIds.size);
  
  // Find duplicates
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  console.log('Duplicate IDs:', duplicates);
  
  if (duplicates.length > 0) {
    console.log('\nDuplicate entries:');
    ALL_BLOODLINES.forEach(bloodline => {
      if (duplicates.includes(bloodline.id)) {
        console.log(`ID: ${bloodline.id}, Name: ${bloodline.name}`);
      }
    });
  }
  
  expect(uniqueIds.size).toBe(ALL_BLOODLINES.length);
});

test('Check dragon bloodline special effects', () => {
  const dragonBloodline = ALL_BLOODLINES.find(b => b.name.toLowerCase().includes('dragon'));
  if (!dragonBloodline) {
    console.log('No dragon bloodline found');
    return;
  }
  
  console.log('Dragon bloodline found:', dragonBloodline.name);
  console.log('Special effects:', dragonBloodline.effects.special);
  
  expect(dragonBloodline.effects.special).toBeDefined();
  expect(dragonBloodline.effects.special?.length).toBeGreaterThan(0);
  // Accept either explicit 'dragon' substring or common draconic identifiers like 'draconic_power'
  expect(dragonBloodline.effects.special?.some(effect => /dragon|drac/i.test(effect))).toBe(true);
});
