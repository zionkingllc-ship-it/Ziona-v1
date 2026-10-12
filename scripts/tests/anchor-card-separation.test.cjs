const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function render(file, props) {
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../components/circles', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: name => {
    if (name === 'react') return { createElement: (type, props, ...children) => ({ type, props, children }) };
    if (name === 'react-native') return { Dimensions: { get: () => ({ width: 390, height: 844 }) }, StyleSheet: { create: x => x }, View: 'View', ScrollView: 'ScrollView' };
    if (name === 'tamagui') return { Text: 'Text', YStack: 'YStack' };
    if (name.endsWith('AnchorHtmlText')) return 'AnchorHtmlText';
    throw new Error(name);
  } });
  return JSON.stringify(module.exports.default(props));
}
const scripture = { bibleReference: 'John 3:16', bibleText: 'For God so loved the world' };
test('Word card cannot render scripture props even if supplied by an old caller', () => {
  const output = render('AnchorTextCard.tsx', { ...scripture, showBibleVerse: true, text: '<p>Reflection</p>', label: 'Word' });
  assert.ok(output.includes('<p>Reflection</p>'));
  assert.ok(!output.includes(scripture.bibleReference));
  assert.ok(!output.includes(scripture.bibleText));
});
test('Bible Verse card renders scripture independently of Word HTML', () => {
  const output = render('AnchorBibleVerseCard.tsx', { ...scripture, text: '<p>Reflection</p>' });
  assert.ok(output.includes(scripture.bibleReference));
  assert.ok(output.includes(scripture.bibleText));
  assert.ok(output.includes('ScrollView'));
  assert.ok(!output.includes('<p>Reflection</p>'));
});
