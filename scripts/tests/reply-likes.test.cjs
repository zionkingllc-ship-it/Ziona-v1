const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient, MutationObserver } = require('@tanstack/react-query');

function setup(api) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../hooks/useCommentReplies.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, require: name => {
    if (name === '@tanstack/react-query') return { useQueryClient: () => client, useMutation: options => new MutationObserver(client, options) };
    if (name === '@/services/graphQL/mutation/actions/comments') return api;
    throw new Error('Unexpected import: ' + name);
  } });
  const reply = { id: 'reply', viewerState: { liked: false }, stats: { likesCount: 2 } };
  const parent = { id: 'parent', viewerState: { liked: true }, stats: { likesCount: 10, repliesCount: 2 }, replies: [reply, { ...reply, id: 'sibling' }] };
  const page = comments => ({ pages: [{ comments }], pageParams: [null] });
  client.setQueryData(['postComments', 'post'], page([parent]));
  client.setQueryData(['commentReplies', 'parent'], page(parent.replies));
  const observer = module.exports.useReplyLike();
  return { client, observer, parent: () => client.getQueryData(['postComments', 'post']).pages[0].comments[0],
    replies: () => client.getQueryData(['commentReplies', 'parent']).pages[0].comments };
}
const vars = { postId: 'post', commentId: 'parent', replyId: 'reply', isLiked: false };
function unchangedParent(state) {
  assert.equal(state.parent().stats.likesCount, 10);
  assert.equal(state.parent().viewerState.liked, true);
  assert.equal(state.parent().stats.repliesCount, 2);
  assert.equal(state.parent().replies[1].stats.likesCount, 2);
}

test('reply like and unlike update only the reply in both caches and call the correct endpoint', async () => {
  const calls = [];
  let release;
  const state = setup({
    likeComment: id => { calls.push(['like', id]); return new Promise(resolve => { release = resolve; }); },
    unlikeComment: async id => { calls.push(['unlike', id]); return { liked: false, stats: { likesCount: 2 } }; },
  });
  const pending = state.observer.mutate(vars);
  await new Promise(resolve => setImmediate(resolve));
  unchangedParent(state);
  assert.equal(state.parent().replies[0].stats.likesCount, 3);
  assert.equal(state.replies()[0].viewerState.liked, true);
  release({ liked: true, commentStats: { likesCount: 3 } });
  await pending;
  unchangedParent(state);
  await state.observer.mutate({ ...vars, isLiked: true });
  unchangedParent(state);
  assert.equal(state.parent().replies[0].stats.likesCount, 2);
  assert.equal(state.replies()[0].stats.likesCount, 2);
  assert.equal(state.replies()[0].viewerState.liked, false);
  assert.deepEqual(calls, [['like', 'reply'], ['unlike', 'reply']]);
  state.client.clear();
});

test('failed reply mutation rolls back both caches without changing its parent', async () => {
  const state = setup({ likeComment: async () => { throw new Error('network failure'); } });
  await assert.rejects(state.observer.mutate(vars), /network failure/);
  unchangedParent(state);
  assert.equal(state.parent().replies[0].stats.likesCount, 2);
  assert.equal(state.replies()[0].viewerState.liked, false);
  state.client.clear();
});

test('temporary reply resolution cannot select a parent with a matching alias', async () => {
  const calls = [];
  const state = setup({ likeComment: async id => { calls.push(id); return { liked: true, stats: { likesCount: 7 } }; } });
  state.parent().tempId = 'temp-reply';
  state.parent().replies[0].tempId = 'temp-reply';
  await state.observer.mutate({ ...vars, replyId: 'temp-reply' });
  unchangedParent(state);
  assert.deepEqual(calls, ['reply']);
  assert.equal(state.parent().replies[0].stats.likesCount, 7);
  assert.equal(state.replies()[0].stats.likesCount, 7);
  state.client.clear();
});

test('parent IDs and unresolved temporary replies never reach the like API', async () => {
  const calls = [];
  const state = setup({ likeComment: async id => calls.push(id) });
  await assert.rejects(state.observer.mutate({ ...vars, replyId: 'parent' }), /must target a reply/);
  await assert.rejects(state.observer.mutate({ ...vars, replyId: 'temp-pending' }), /finish posting/);
  unchangedParent(state);
  assert.deepEqual(calls, []);
  state.client.clear();
});
