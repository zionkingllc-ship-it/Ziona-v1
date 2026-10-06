const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient, MutationObserver } = require('@tanstack/react-query');

function setup(api) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../hooks/useToggleCommentLike.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: name => {
    if (name === '@tanstack/react-query') return { useQueryClient: () => client, useMutation: options => new MutationObserver(client, options) };
    if (name === '@/services/graphQL/mutation/actions/comments') return api;
    throw new Error('Unexpected import: ' + name);
  } });
  const reply = { id: 'reply', viewerState: { liked: false }, stats: { likesCount: 2 } };
  const parent = { id: 'parent', viewerState: { liked: true }, stats: { likesCount: 10, repliesCount: 1 }, replies: [reply] };
  const page = comments => ({ pages: [{ comments }], pageParams: [null] });
  client.setQueryData(['postComments', 'post'], page([parent]));
  const observer = module.exports.useToggleCommentLike();
  return { client, observer, parent: () => client.getQueryData(['postComments', 'post']).pages[0].comments[0] };
}

test('unliking a liked parent calls unlikeComment and stays unliked', async () => {
  const calls = [];
  const state = setup({
    likeComment: async id => { calls.push(['like', id]); return { liked: true, commentStats: { likesCount: 11 } }; },
    unlikeComment: async id => { calls.push(['unlike', id]); return { liked: false, commentStats: { likesCount: 9 } }; },
  });
  await state.observer.mutate({ commentId: 'parent', isLiked: true });
  assert.deepEqual(calls, [['unlike', 'parent']]);
  assert.equal(state.parent().viewerState.liked, false);
  assert.equal(state.parent().stats.likesCount, 9);
  state.client.clear();
});

test('liking an unliked parent calls likeComment and stays liked', async () => {
  const calls = [];
  const state = setup({
    likeComment: async id => { calls.push(['like', id]); return { liked: true, commentStats: { likesCount: 11 } }; },
    unlikeComment: async id => { calls.push(['unlike', id]); return { liked: false, commentStats: { likesCount: 9 } }; },
  });
  state.parent().viewerState.liked = false;
  await state.observer.mutate({ commentId: 'parent', isLiked: false });
  assert.deepEqual(calls, [['like', 'parent']]);
  assert.equal(state.parent().viewerState.liked, true);
  assert.equal(state.parent().stats.likesCount, 11);
  state.client.clear();
});

test('unlike without isLiked derives the direction from cache', async () => {
  const calls = [];
  const state = setup({
    likeComment: async id => { calls.push(['like', id]); return { liked: true, commentStats: { likesCount: 11 } }; },
    unlikeComment: async id => { calls.push(['unlike', id]); return { liked: false, commentStats: { likesCount: 9 } }; },
  });
  await state.observer.mutate({ commentId: 'parent' });
  assert.deepEqual(calls, [['unlike', 'parent']]);
  assert.equal(state.parent().viewerState.liked, false);
  state.client.clear();
});

test('failed parent unlike rolls back to liked', async () => {
  const state = setup({ unlikeComment: async () => { throw new Error('network failure'); } });
  await assert.rejects(state.observer.mutate({ commentId: 'parent', isLiked: true }), /network failure/);
  assert.equal(state.parent().viewerState.liked, true);
  assert.equal(state.parent().stats.likesCount, 10);
  state.client.clear();
});
