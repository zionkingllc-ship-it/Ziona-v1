const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const deps = createRequire(path.join(process.env.ZIONA_DEPENDENCY_ROOT || root, 'package.json'));
const ts = deps('typescript');

function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(root, file);
    if (!path.extname(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const requireMock = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/')) return load(name.slice(2));
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
      return deps(name);
    };
    vm.runInNewContext(source, {
      module, exports: module.exports, require: requireMock, process, console: { ...console, error() {}, warn() {} },
      setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask, atob, Error, ...globals,
    }, { filename: file });
    return module.exports;
  }
  return load;
}

const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const deferred = () => {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
};

test('HTML slides obey the line budget and preserve content', () => {
  const { chunkHtmlByBlocks } = loader()('lib/anchorHtmlChunk.ts');
  const html = Array.from({ length: 10 }, () => '<p>' + 'x'.repeat(180) + '</p>').join('');
  const chunks = chunkHtmlByBlocks(html);
  assert.equal(chunks.length, 10);
  assert.equal(chunks.join(''), html);
  assert.equal(chunkHtmlByBlocks('<p>short</p><p>also short</p>').length, 1);
});

function refreshHarness(fetch) {
  const state = { tokens: { accessToken: 'old', refreshToken: 'keep-me' }, setTokens(tokens) { this.tokens = tokens; } };
  const load = loader({ '@/store/useAuthStore': { useAuthStore: { getState: () => state } } }, { fetch });
  return { state, load, refresh: load('services/auth/refresh.ts') };
}

test('refresh preserves an unrotated token and accepts a rotated token', async () => {
  for (const rotated of [undefined, 'rotated']) {
    const { refresh, state } = refreshHarness(async () => response(200, { accessToken: 'new', refreshToken: rotated }));
    await refresh.restRefresh('keep-me');
    assert.equal(state.tokens.refreshToken, rotated || 'keep-me');
  }
});

test('refresh cannot restore credentials after logout', async () => {
  const pending = deferred();
  const { refresh, load, state } = refreshHarness(() => pending.promise);
  const operation = refresh.restRefresh('keep-me');
  load('services/auth/session.ts').advanceSession();
  state.tokens = null;
  pending.resolve(response(200, { accessToken: 'stale' }));
  await assert.rejects(operation, { code: 'SESSION_CHANGED' });
  assert.equal(state.tokens, null);
});

test('refresh distinguishes temporary failure from rejected credentials', async () => {
  const transient = refreshHarness(async () => response(503, {}));
  await assert.rejects(transient.refresh.refreshWithRetry(1), { retryable: true });
  assert.equal(transient.state.tokens.refreshToken, 'keep-me');
  const rejected = refreshHarness(async () => response(401, {}));
  assert.equal(await rejected.refresh.refreshWithRetry(1), null);
});

test('concurrent refreshes share a request', async () => {
  const pending = deferred();
  let calls = 0;
  const { refresh } = refreshHarness(() => { calls++; return pending.promise; });
  const a = refresh.refreshWithRetry(1);
  const b = refresh.refreshWithRetry(1);
  pending.resolve(response(200, { accessToken: 'new' }));
  assert.deepEqual(await Promise.all([a, b]), ['new', 'new']);
  assert.equal(calls, 1);
});

function graphqlHarness(replies, refreshResult = 'new') {
  let clears = 0;
  let refreshes = 0;
  const state = { tokens: { accessToken: 'old' }, clearSession: async () => { clears++; } };
  const load = loader({
    '@/store/useAuthStore': { useAuthStore: { getState: () => state } },
    '@/services/auth/refresh': {
      refreshTokenProactively: async () => true,
      refreshWithRetry: async () => { refreshes++; if (refreshResult instanceof Error) throw refreshResult; return refreshResult; },
    },
  }, { fetch: async () => replies.shift() });
  return { request: load('services/graphQL/graphqlClient.ts').graphqlRequest, clears: () => clears, refreshes: () => refreshes };
}

test('FORBIDDEN is surfaced without refreshing or logging out', async () => {
  const h = graphqlHarness([response(200, { errors: [{ message: 'Not allowed', extensions: { code: 'FORBIDDEN' } }] })]);
  await assert.rejects(h.request('query {}'), { code: 'FORBIDDEN' });
  assert.equal(h.clears(), 0);
  assert.equal(h.refreshes(), 0);
});

test('authentication rejection throws instead of returning successful null data', async () => {
  const h = graphqlHarness([response(401, {})], null);
  await assert.rejects(h.request('query {}'), { code: 'SESSION_EXPIRED' });
  assert.equal(h.clears(), 1);
});

test('temporary refresh failure leaves the session intact', async () => {
  const h = graphqlHarness([response(401, {})], new Error('offline'));
  await assert.rejects(h.request('query {}'), /offline/);
  assert.equal(h.clears(), 0);
});

test('a refreshed request can succeed without clearing the session', async () => {
  const h = graphqlHarness([response(401, {}), response(200, { data: { ok: true } })]);
  assert.equal((await h.request('query {}')).ok, true);
  assert.equal(h.clears(), 0);
});

test('media creation supplies the category argument, not just an unused variable', async () => {
  const { parse } = deps('graphql');
  let sent;
  const load = loader({ '@/services/graphQL/graphqlClient': { graphqlRequest: async (query, variables) => {
    sent = { query: parse(query), variables };
    return { createPost: { success: true, post: { id: 'new' } } };
  } } });
  await load('services/graphQL/mutation/createPost.ts').createMediaPost({ category: 'chosen' });
  const field = sent.query.definitions[0].selectionSet.selections[0];
  assert.equal(field.arguments.find(a => a.name.value === 'category').value.name.value, 'category');
  assert.equal(sent.variables.category, 'chosen');
});

function uploadHarness() {
  const transfer = deferred();
  let published = 0;
  const draft = { type: 'MEDIA', category: { id: 'chosen' }, media: { items: [{ uri: 'file:///video.mp4', type: 'VIDEO' }] } };
  const load = loader({
    '@/store/createPostStore': { useCreatePostStore: { getState: () => ({ draft, resetDraft() {} }) } },
    '@/services/feed/invalidateFeed': { invalidateFeed: async () => {}, movePostToFeedTop() {} },
    '@/utils/uploadEvents': { notifyUploadComplete() {} },
    '@/utils/network/getNetworkModalCopy': { getNetworkModalCopy: () => ({ title: 'Failed', message: 'Failed' }) },
    '@/utils/feed/normalizePost': { normalizePost: p => p },
    '@/services/utils/mime': { getMimeType: () => 'video/mp4' },
    '@/services/utils/imageConversion': {},
    '@/services/utils/videoCompression': { compressVideo: async uri => uri },
    'expo-file-system/legacy': { getInfoAsync: async () => ({ exists: true, size: 1 }) },
    '../mutation/media/mediaUpload': {
      requestUploadSession: async () => ({ mediaId: 'media' }),
      uploadWithStrategy: () => transfer.promise,
      confirmMediaUpload: async () => ({ mediaUrl: 'url' }),
      waitForMediaProcessing: async () => {},
    },
    '../mutation/createPost': { createMediaPost: async () => { published++; return { post: { id: 'new' } }; } },
  });
  const store = load('store/uploadStore.ts').useUploadStore;
  const run = load('services/upload/postUploadController.ts').runPostUpload;
  const client = { setQueryData() {}, refetchQueries: async () => {} };
  return { store, run: () => run(client), transfer, published: () => published };
}

test('cancelled media never publishes, even after the screen resets its store', async () => {
  const h = uploadHarness();
  const operation = h.run();
  await new Promise(setImmediate);
  h.store.getState().requestCancel();
  h.store.getState().reset();
  const newUpload = h.store.getState().startUpload();
  h.transfer.resolve();
  await operation;
  assert.equal(h.published(), 0);
  assert.equal(h.store.getState().uploadId, newUpload);
  assert.equal(h.store.getState().status, 'uploading');
});

test('successful uploads publish once and complete', async () => {
  const h = uploadHarness();
  const operation = h.run();
  await h.run(); // A repeated mount cannot start a duplicate upload.
  h.transfer.resolve();
  await operation;
  assert.equal(h.published(), 1);
  assert.equal(h.store.getState().status, 'completed');
});

test('publication cannot be falsely labelled cancelled after commit begins', () => {
  const store = loader()('store/uploadStore.ts').useUploadStore;
  store.getState().startUpload();
  store.getState().setStatus('publishing');
  store.getState().requestCancel();
  assert.equal(store.getState().status, 'publishing');
  assert.equal(store.getState().cancelRequested, false);
});

test('large videos use a threshold in megabytes, and small videos are not recompressed', async () => {
  let size = 20 * 1024 * 1024;
  const options = [];
  const load = loader({
    'expo-file-system/legacy': { getInfoAsync: async () => ({ exists: true, size }) },
    'react-native-compressor': { Video: { compress: async (_uri, config) => { options.push(config); return 'file:///compressed.mp4'; } } },
  });
  const { compressVideo } = load('services/utils/videoCompression.ts');
  assert.equal(await compressVideo('file:///large.mp4'), 'file:///compressed.mp4');
  assert.equal(options[0].minimumFileSizeForCompress, 10);
  size = 5 * 1024 * 1024;
  assert.equal(await compressVideo('file:///small.mp4'), 'file:///small.mp4');
  assert.equal(options.length, 1);
});

function authHarness(getMe) {
  const signouts = [];
  const load = loader({
    '@/lib/queryClient': { queryClient: { clear() {}, cancelQueries: async () => {} } },
    '@/services/api/authApi': { authApi: { getMe, signOut: async token => { signouts.push(token); } } },
    '@/services/api/client': { setAuthTokens() {}, clearAuthTokens() {} },
    '@react-native-async-storage/async-storage': {},
    'zustand/middleware': { persist: initializer => initializer, createJSONStorage: () => ({}) },
  }, { setTimeout: callback => { queueMicrotask(callback); return 0; } });
  const store = load('store/useAuthStore.ts').useAuthStore;
  store.setState({ _hasHydrated: true, tokens: { accessToken: 'old', refreshToken: 'refresh' }, user: { id: 'old-user' }, isAuthenticated: true });
  return { store, signouts };
}

test('late bootstrap cannot restore a logged-out user', async () => {
  const pending = deferred();
  const { store, signouts } = authHarness(() => pending.promise);
  const operation = store.getState().initializeAuth();
  await store.getState().logout();
  pending.resolve({ id: 'old-user' });
  await operation;
  assert.equal(store.getState().user, null);
  assert.deepEqual(signouts, ['old']);
});

test('late bootstrap cannot replace a different login', async () => {
  const pending = deferred();
  const { store } = authHarness(() => pending.promise);
  const operation = store.getState().initializeAuth();
  store.getState().setAuth({ id: 'new-user' }, { accessToken: 'new', refreshToken: 'new-refresh' });
  pending.resolve({ id: 'old-user' });
  await operation;
  assert.equal(store.getState().user.id, 'new-user');
});

test('offline bootstrap preserves the stored login', async () => {
  const { store } = authHarness(async () => { throw new Error('offline'); });
  await store.getState().initializeAuth();
  assert.equal(store.getState().isAuthenticated, true);
  assert.equal(store.getState().tokens.accessToken, 'old');
  assert.equal(store.getState().isInitializing, false);
});

test('development and staging use the same native configuration and service endpoints', () => {
  const configFile = path.join(root, 'app.config.js');
  const original = process.env.APP_VARIANT;
  try {
    process.env.APP_VARIANT = 'development';
    delete require.cache[configFile];
    const dev = require(configFile).expo;
    process.env.APP_VARIANT = 'staging';
    delete require.cache[configFile];
    const staging = require(configFile).expo;
    assert.deepEqual(dev, staging);
    const firebase = JSON.parse(fs.readFileSync(path.join(root, dev.android.googleServicesFile)));
    assert.ok(firebase.client.some(c => c.client_info.android_client_info.package_name === dev.android.package));
    const eas = require(path.join(root, 'eas.json'));
    const { APP_VARIANT: ignoredDev, ...devEnv } = eas.build.development.env;
    const { APP_VARIANT: ignoredStaging, ...stagingEnv } = eas.build.preview.env;
    assert.deepEqual(devEnv, stagingEnv);
    const pkg = require(path.join(root, 'package.json'));
    for (const [name, command] of Object.entries(pkg.scripts)) {
      if (name.startsWith('build:')) assert.ok(eas.build[command.match(/--profile (\S+)/)[1]]);
    }
  } finally {
    if (original === undefined) delete process.env.APP_VARIANT;
    else process.env.APP_VARIANT = original;
    delete require.cache[configFile];
  }
});
