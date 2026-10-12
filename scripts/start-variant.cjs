const { spawn } = require('node:child_process');
const path = require('node:path');
const profiles = require('../eas.json').build;

const variant = process.argv[2];
const profileName = { development: 'development', staging: 'preview', production: 'production' }[variant];
if (!profileName) throw new Error('Expected development, staging, or production');
const expoCli = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');
const child = spawn(process.execPath, [expoCli, 'start', ...process.argv.slice(3)], {
  stdio: 'inherit',
  env: { ...process.env, ...profiles[profileName].env, APP_VARIANT: variant },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
