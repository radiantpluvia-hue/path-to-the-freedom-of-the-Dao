import { ALL_PHYSIQUES } from './src/data/xianxiaIntegration.js';

const physiqueIds = ALL_PHYSIQUES.map(p => p.id);
const uniqueIds = new Set(physiqueIds);

console.log('Total physiques:', ALL_PHYSIQUES.length);
console.log('Unique IDs:', uniqueIds.size);

// Find duplicates
const duplicates = physiqueIds.filter((id, index) => physiqueIds.indexOf(id) !== index);
console.log('Duplicate IDs:', duplicates);

if (duplicates.length > 0) {
  console.log('\nDuplicate entries:');
  ALL_PHYSIQUES.forEach(physique => {
    if (duplicates.includes(physique.id)) {
      console.log(`ID: ${physique.id}, Name: ${physique.name}`);
    }
  });
}
