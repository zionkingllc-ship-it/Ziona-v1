const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '../..');
const deps = createRequire(path.join(root, 'package.json'));
const ts = deps('typescript');

function loadCircleJoin() {
  const file = path.join(root, 'utils/circleJoin.ts');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, console }, { filename: file });
  return module.exports;
}

const { isAlreadyCircleMember, shouldShowJoinError } = loadCircleJoin();

test('success:true never shows the join error', () => {
  assert.equal(shouldShowJoinError({ success: true }), false);
  assert.equal(shouldShowJoinError({ success: true, circle: { isSubscribed: true } }), false);
});

test('success:false with subscribed circle is treated as joined', () => {
  assert.equal(
    shouldShowJoinError({ success: false, circle: { isSubscribed: true } }),
    false
  );
});

test('already-member error codes are treated as joined', () => {
  for (const code of ['ALREADY_MEMBER', 'already_member', ' Already_Joined ', 'ALREADY_SUBSCRIBED', 'MEMBER_EXISTS']) {
    assert.equal(
      shouldShowJoinError({ success: false, circle: null, error: { code, message: 'x' } }),
      false,
      code
    );
  }
});

test('already-member messages are treated as joined', () => {
  for (const message of [
    'Already a member of this circle',
    'already joined',
    'User already subscribed',
    'member exists',
  ]) {
    assert.equal(
      shouldShowJoinError({ success: false, error: { code: 'VALIDATION_ERROR', message } }),
      false,
      message
    );
  }
});

test('genuine failures still show the join error', () => {
  assert.equal(
    shouldShowJoinError({ success: false, circle: null, error: { code: 'VALIDATION_ERROR', message: 'Circle is full' } }),
    true
  );
  assert.equal(shouldShowJoinError({ success: false }), true);
  assert.equal(shouldShowJoinError({ success: false, circle: { isSubscribed: false } }), true);
});

test('empty payload preserves the old no-error behavior', () => {
  assert.equal(shouldShowJoinError(undefined), false);
  assert.equal(shouldShowJoinError(null), false);
});

test('isAlreadyCircleMember edge cases', () => {
  assert.equal(isAlreadyCircleMember(undefined), false);
  assert.equal(isAlreadyCircleMember({}), false);
  assert.equal(isAlreadyCircleMember({ circle: { isSubscribed: false } }), false);
  assert.equal(isAlreadyCircleMember({ error: { code: 'SOMETHING_ELSE', message: 'nope' } }), false);
});
