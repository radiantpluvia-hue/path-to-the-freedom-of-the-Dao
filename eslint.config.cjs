const fs = require('fs');
const path = require('path');

let rc = {};
try {
  const rcPath = path.resolve(__dirname, '.eslintrc.json');
  if (fs.existsSync(rcPath)) rc = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
} catch (e) {
  // ignore
}

// Strip unsupported keys for flat config
const { root, env, plugins, extends: _extends, ...rest } = rc || {};
module.exports = {
  ...(rest || {}),
  languageOptions: rc.parserOptions ? { parserOptions: rc.parserOptions } : undefined,
};
