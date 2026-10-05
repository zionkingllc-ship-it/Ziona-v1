const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '../..');
const deps = createRequire(path.join(root, 'package.json'));
const ts = deps('typescript');

function loadAnchorRef() {
  const file = path.join(root, 'utils/anchorRef.ts');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const requireMock = (name) => {
    if (name === './storage') return { storage: { get: async () => null, set: async () => {}, remove: async () => {} } };
    throw new Error(`unexpected import: ${name}`);
  };
  vm.runInNewContext(source, { module, exports: module.exports, require: requireMock, console }, { filename: file });
  return module.exports;
}

const { mapServerAnchorReference: mapRaw } = loadAnchorRef();

// Objects created inside the VM realm carry a different prototype, so
// normalize through JSON before strict comparison.
const mapServerAnchorReference = (ref) => {
  const r = mapRaw(ref);
  return r === null || r === undefined ? r ?? null : JSON.parse(JSON.stringify(r));
};

// JSON round-trip on both sides: drops undefined-valued keys so they
// compare equal regardless of key presence.
const same = (actual, expected) =>
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), JSON.parse(JSON.stringify(expected)));

test('maps a full server snapshot to local shape', () => {
  same(mapServerAnchorReference({
    anchorId: 'a1',
    anchorType: 'text',
    title: 'Morning',
    content: '<p>Hello</p>',
    mediaUrl: null,
    backgroundImage: 'https://img/x.jpg',
    backgroundColors: ['#111111', '#222222'],
    bibleReference: 'John 3:16',
    bibleText: null,
  }), {
    type: 'text',
    title: 'Morning',
    content: '<p>Hello</p>',
    mediaUrl: undefined,
    anchorId: 'a1',
    bibleReference: 'John 3:16',
    bibleText: undefined,
    backgroundImage: 'https://img/x.jpg',
    backgroundColors: '#111111,#222222',
  });
});

test('normalizes anchorType casing and unknown types', () => {
  assert.equal(mapServerAnchorReference({ anchorType: 'IMAGE', content: 'x' })?.type, 'image');
  assert.equal(mapServerAnchorReference({ anchorType: 'Video', content: 'x' })?.type, 'video');
  assert.equal(mapServerAnchorReference({ anchorType: 'BIBLE', content: 'x' })?.type, 'text');
  assert.equal(mapServerAnchorReference({ anchorType: '', content: 'x' })?.type, 'text');
});

test('returns null for empty or missing snapshots', () => {
  assert.equal(mapServerAnchorReference(null), null);
  assert.equal(mapServerAnchorReference(undefined), null);
  assert.equal(mapServerAnchorReference({ anchorType: 'text' }), null);
  assert.equal(
    mapServerAnchorReference({ anchorType: 'text', title: '  ', content: '   ', backgroundColors: [] }),
    null
  );
});

test('blank strings and empty color lists are dropped', () => {
  same(mapServerAnchorReference({
    anchorType: 'text',
    title: '',
    content: 'hi',
    backgroundColors: [],
  }), {
    type: 'text',
    title: 'Anchor',
    content: 'hi',
    mediaUrl: undefined,
    anchorId: undefined,
    bibleReference: undefined,
    bibleText: undefined,
    backgroundImage: undefined,
    backgroundColors: undefined,
  });
});
