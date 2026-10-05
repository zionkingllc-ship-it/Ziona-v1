const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const requireContext = require('expo-router/build/testing-library/require-context-ponyfill').default;
const { getTypedRoutesDeclarationFile } = require('expo-router/build/typed-routes/generate');
const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '.expo', 'types');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'router.d.ts'), getTypedRoutesDeclarationFile(
  requireContext(path.join(root, 'app'), true, EXPO_ROUTER_CTX_IGNORE),
));
const result = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--incremental', 'false', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
