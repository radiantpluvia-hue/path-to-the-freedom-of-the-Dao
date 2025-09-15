// Backwards compatibility wrapper that delegates to consolidated helper in ./helpers/
const { loadWithAliases } = require('./helpers/require_with_aliases.cjs');
module.exports = { loadWithAliases };
