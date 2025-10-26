#!/usr/bin/env node
const { ESLint } = require('eslint');

(async function main(){
  try{
    const path = require('path');
    const args = process.argv.slice(2);
    const doFix = args.includes('--fix');
    const eslint = new ESLint({
      overrideConfigFile: path.resolve(__dirname, '..', '.eslintrc.cjs'),
      fix: doFix,
      overrideConfig: {
        ignorePatterns: ['src/demo/**', 'src/**/*.d.ts'],
      },
    });
    const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.tsx']);
    if (doFix) {
      await ESLint.outputFixes(results);
    }
    const formatter = await eslint.loadFormatter('stylish');
    const out = formatter.format(results);
    if (out) console.log(out);
    const errorCount = results.reduce((s,r)=>s+(r.errorCount||0),0);
    const warningCount = results.reduce((s,r)=>s+(r.warningCount||0),0);
    if (errorCount || warningCount) {
      console.log(`ESLint: ${errorCount} errors, ${warningCount} warnings`);
    } else {
      console.log('ESLint: no issues');
    }
    if (errorCount) process.exit(1);
  } catch (e) {
    console.error('ESLint run failed', e);
    process.exit(2);
  }
})();
