const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient, MutationObserver } = require('@tanstack/react-query');
function setup(fail = false) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
  const calls = [];
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../hooks/useFollow.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    if (name === '@tanstack/react-query') return { useQueryClient: () => client, useMutation: options => new MutationObserver(client, options) };
    if (name.endsWith('/actions/index')) return { followUser: async id => { calls.push(id); if (fail) throw new Error('failed'); return { following: true }; } };
    if (name.endsWith('/queries/follow')) return {};
    if (name.endsWith('usePostActionStore')) return { usePostActionsStore: selector => selector({ toggleFollow: () => {} }) };
    if (name.endsWith('useAuthStore')) return { useAuthStore: selector => selector({ user: { id: 'me' } }) };
    throw new Error(name);
  } });
  const items = [
    { id: 'one', type: 'follow', user: { id: 'actor', viewerState: null } },
    { id: 'two', referenceType: 'follow', user: { id: 'actor', viewerState: { isFollowing: false, isFollowedBy: true } } },
    { id: 'other', type: 'follow', user: { id: 'other', viewerState: { isFollowing: false } } },
  ];
  for (const key of [['notifications', 50], ['notifications', 20]]) client.setQueryData(key, { pages: [{ items }], pageParams: [null] });
  return { client, calls, mutation: module.exports.useToggleFollow() };
}
test('follow-back updates every notification for the actor, including missing viewer state', async () => {
  const { client, calls, mutation } = setup();
  await mutation.mutate({ userId: 'actor', currentFollowing: false });
  assert.deepEqual(calls, ['actor']);
  for (const [, data] of client.getQueriesData({ queryKey: ['notifications'] })) {
    assert.equal(data.pages[0].items[0].user.viewerState.isFollowing, true);
    assert.equal(data.pages[0].items[0].user.viewerState.isFollowedBy, true);
    assert.equal(data.pages[0].items[1].user.viewerState.isFollowing, true);
    assert.equal(data.pages[0].items[2].user.viewerState.isFollowing, false);
  }
  client.clear();
});
test('failed follow-back leaves notification relationship unchanged', async () => {
  const { client, mutation } = setup(true);
  await assert.rejects(mutation.mutate({ userId: 'actor', currentFollowing: false }), /failed/);
  assert.equal(client.getQueryData(['notifications', 50]).pages[0].items[1].user.viewerState.isFollowing, false);
  client.clear();
});
