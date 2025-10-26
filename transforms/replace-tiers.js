module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const map = { common:'H', uncommon:'G', rare:'F', epic:'E', legendary:'D', mythic:'C', transcendent:'B' };

  // Replace string literals equal to legacy tier names
  root.find(j.Literal, { value: (v) => typeof v === 'string' && Object.keys(map).includes(v) })
    .forEach(p => { p.node.value = map[p.node.value]; });

  // Also handle template literal raw parts
  root.find(j.TemplateLiteral).forEach(path => {
    path.node.quasis.forEach(q => {
      Object.keys(map).forEach(k => {
        if (q.value.raw.includes(k)) q.value.raw = q.value.raw.replace(new RegExp(`\\b${k}\\b`, 'g'), map[k]);
        if (q.value.cooked && q.value.cooked.includes(k)) q.value.cooked = q.value.cooked.replace(new RegExp(`\\b${k}\\b`, 'g'), map[k]);
      });
    });
  });

  return root.toSource();
};
