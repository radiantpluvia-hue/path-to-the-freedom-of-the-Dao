const fs = require('fs');
const path = require('path');

function findEventFiles(root) {
  const entries = fs.readdirSync(root);
  return entries.filter(n => n.endsWith('.json') && n.toLowerCase().includes('event'));
}

function validateItem(it) {
  const errs = [];
  if (typeof it !== 'object' || it === null) {
    errs.push('item is not an object');
    return errs;
  }
  if (!it.id || typeof it.id !== 'string') errs.push('missing or invalid id');
  if (!it.title || typeof it.title !== 'string') errs.push('missing or invalid title');
  if (!it.description || typeof it.description !== 'string') errs.push('missing or invalid description');
  if (!Array.isArray(it.choices) || it.choices.length === 0) errs.push('missing or empty choices');
  else {
    it.choices.forEach((c, i) => {
      if (!c || typeof c !== 'object') errs.push(`choice[${i}] not an object`);
      else {
        if (!c.id || typeof c.id !== 'string') errs.push(`choice[${i}].id missing/invalid`);
        if (!c.text || typeof c.text !== 'string') errs.push(`choice[${i}].text missing/invalid`);
      }
    });
  }

  if (it.raceVariations && typeof it.raceVariations === 'object') {
    Object.keys(it.raceVariations).forEach(k => {
      const rv = it.raceVariations[k];
      if (!rv || typeof rv !== 'object') {
        errs.push(`raceVariations.${k} not an object`);
        return;
      }
      if (!rv.description || typeof rv.description !== 'string') errs.push(`raceVariations.${k}.description missing/invalid`);
      if (!Array.isArray(rv.choices) || rv.choices.length === 0) errs.push(`raceVariations.${k}.choices missing/empty`);
    });
  }

  return errs;
}

function validateEvents(root) {
  const files = findEventFiles(root);
  const errors = [];
  files.forEach(file => {
    const p = path.join(root, file);
    let raw;
    try {
      raw = fs.readFileSync(p, 'utf8');
    } catch (e) {
      errors.push({ file, error: `read error: ${e.message}` });
      return;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      errors.push({ file, error: `invalid json: ${e.message}` });
      return;
    }
    // Accept either a top-level array of events, or an object with an `events` array
    const list = Array.isArray(data) ? data : data && Array.isArray(data.events) ? data.events : null;
    if (!list) {
      errors.push({ file, error: 'root value is not an array and no events[] property found' });
      return;
    }

    list.forEach((it, idx) => {
      const itemErrs = validateItem(it);
      // allow empty choices when an executorId is present (executor may handle outcomes)
      const filteredErrs = itemErrs.filter(e => !(e === 'missing or empty choices' && it && it.executorId));
      if (filteredErrs.length) {
        errors.push({ file, index: idx, id: it && it.id, errors: filteredErrs });
      }
    });
  });

  return errors;
}

module.exports = { validateEvents };
