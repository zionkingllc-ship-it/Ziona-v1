const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const moduleMock = { exports: {} };
const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../src/services/notifications/deviceRegistration.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(source, { module: moduleMock, exports: moduleMock.exports });
const { createDeviceRegistration } = moduleMock.exports;

test('logs success only after confirmation and deduplicates within a session', async () => {
  let finish, calls = 0, confirmations = 0;
  const register = createDeviceRegistration(() => { calls++; return new Promise(resolve => finish = resolve); }, () => true, () => confirmations++);
  const first = register('token');
  const second = register('token');
  await Promise.resolve();
  assert.equal(confirmations, 0);
  finish(true);
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(confirmations, 1);
});
test('backend rejection is surfaced and the same token can retry', async () => {
  let calls = 0, confirmations = 0;
  const register = createDeviceRegistration(async () => ++calls > 1, () => true, () => confirmations++);
  await assert.rejects(register('token'), /Backend rejected/);
  assert.equal(confirmations, 0);
  await register('token');
  assert.equal(calls, 2);
  assert.equal(confirmations, 1);
});
test('network failures do not block later registrations', async () => {
  let calls = 0;
  const register = createDeviceRegistration(async () => { if (++calls === 1) throw new Error('offline'); return true; }, () => true, () => {});
  await assert.rejects(register('token'), /offline/);
  await register('token');
  assert.equal(calls, 2);
});
test('a refresh arriving during registration is queued rather than dropped', async () => {
  const calls = []; let finish;
  const register = createDeviceRegistration(token => { calls.push(token); return token === 'old' ? new Promise(resolve => finish = resolve) : Promise.resolve(true); }, () => true, () => {});
  const old = register('old');
  const refreshed = register('new');
  await Promise.resolve();
  finish(true);
  await Promise.all([old, refreshed]);
  assert.deepEqual(calls, ['old', 'new']);
});
test('new account sessions register the same device token again', async () => {
  const calls = [];
  for (const user of ['alice', 'bob', 'alice']) {
    const register = createDeviceRegistration(async token => { calls.push([user, token]); return true; }, () => true, () => {});
    await register('device');
  }
  assert.deepEqual(calls, [['alice', 'device'], ['bob', 'device'], ['alice', 'device']]);
});
test('ended sessions skip queued work and ignore late success', async () => {
  let active = true, finish, calls = 0, confirmations = 0;
  const register = createDeviceRegistration(() => { calls++; return new Promise(resolve => finish = resolve); }, () => active, () => confirmations++);
  const first = register('old');
  const queued = register('new');
  await Promise.resolve();
  active = false;
  finish(true);
  await Promise.all([first, queued]);
  assert.equal(calls, 1);
  assert.equal(confirmations, 0);
});
