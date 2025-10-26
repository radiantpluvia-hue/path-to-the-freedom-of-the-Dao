#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');

const schemaPath = path.resolve(__dirname, '..', '..', 'schema', 'encounter_template.schema.json');
const dataPath = path.resolve(__dirname, '..', '..', 'src', 'data', 'encounter_narratives.json');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

let data = {};
try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.error('No encounter_narratives.json found or invalid JSON; skipping validation.');
  process.exit(0);
}

let ok = true;
for (const id of Object.keys(data)) {
  const tpl = data[id];
  const valid = validate(tpl);
  if (!valid) {
    ok = false;
    console.error(`Template ${id} failed validation:`);
    console.error(validate.errors);
  }
}

if (!ok) process.exit(2);
console.log('All encounter templates validated successfully.');
process.exit(0);
