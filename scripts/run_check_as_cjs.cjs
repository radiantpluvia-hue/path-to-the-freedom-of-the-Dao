const { runCheckAsCjs } = require('./helpers/run_check_as_cjs.cjs');
// Delegate to consolidated helper
runCheckAsCjs(process.argv.slice(2));
