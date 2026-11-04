const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function load(file, mocks = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, console, require(id) {
    if (id in mocks) return mocks[id];
    throw Error(`Unmocked import: ${id}`);
  }});
  return module.exports;
}
const errors = load('utils/error.ts');
test('REST auth envelope preserves message, code, status, details and retry timing', () => {
  const details = { email: ['Try resending'] };
  const error = errors.normalizeRestError({ response: { status: 503, data: { success: false, error: {
    code: 'OTP_EMAIL_QUEUE_FAILED', message: 'Unable to queue verification code', details,
  } }, headers: { 'retry-after': '60' } } });
  assert.equal(error.message, 'Unable to queue verification code');
  assert.equal(error.code, 'OTP_EMAIL_QUEUE_FAILED');
  assert.equal(error.status, 503);
  assert.equal(error.details, details);
  assert.equal(error.retryAfter, '60');
  assert.equal(error.retryable, true);
  assert.equal(errors.normalizeRestError({ response: { status: 400, data: { error: { message: 'Username taken', code: 'USERNAME_TAKEN' } } } }).retryable, false);
});
test('REST errors handle network, legacy and non-JSON server responses', () => {
  assert.equal(errors.normalizeRestError({ message: 'Network Error' }).code, 'NETWORK_ERROR');
  assert.equal(errors.normalizeRestError({ response: { status: 400, data: { message: 'Legacy error' } } }).message, 'Legacy error');
  assert.match(errors.normalizeRestError({ response: { status: 502, data: '<html>bad gateway</html>' } }).message, /temporarily unavailable/);
});
test('signup queue failure stays on resend recovery after another error', () => {
  const { signupRecovery } = load('utils/signupRecovery.ts');
  assert.equal(signupRecovery('OTP_EMAIL_QUEUE_FAILED').action, 'resend');
  assert.equal(signupRecovery('NETWORK_ERROR', true).action, 'resend');
  assert.equal(signupRecovery('USERNAME_TAKEN').label, 'Choose another username');
  assert.equal(signupRecovery('EMAIL_ALREADY_REGISTERED').action, 'signin');
  assert.equal(signupRecovery('UNKNOWN').action, 'edit');
});
function conversion(manipulateAsync, compress = async uri => uri) {
  return load('services/utils/imageConversion.ts', {
    'expo-image-manipulator': { manipulateAsync, SaveFormat: { JPEG: 'jpeg' } },
    'react-native-compressor': { Image: { compress } },
  });
}
test('HEIC/HEIF decode and encode JPEG even when picker MIME claims JPEG', async () => {
  const calls = [];
  const converter = conversion(async (...args) => { calls.push(args); return { uri: 'file:///converted.jpg' }; });
  assert.equal(await converter.convertToSupportedFormat('file:///photo.heic', 'image/jpeg'), 'file:///converted.jpg');
  assert.equal(await converter.convertToSupportedFormat('file:///photo', 'image/heif'), 'file:///converted.jpg');
  assert.equal(calls.length, 2);
  assert.equal(calls[0][2].format, 'jpeg');
  assert.equal(await converter.convertToSupportedFormat('file:///photo.jpg', 'image/jpeg'), 'file:///photo.jpg');
  assert.equal(calls.length, 2);
});
test('conversion failure stops processing; compressor HEIC output is reencoded', async () => {
  const converter = conversion(async () => { throw Error('decode failed'); });
  await assert.rejects(converter.convertToSupportedFormat('file:///bad.heic'), /Could not convert/);
  const successful = conversion(async () => ({ uri: 'file:///safe.jpg' }), async () => 'file:///compressed.heif');
  assert.equal(await successful.compressImage('file:///input.jpg'), 'file:///safe.jpg');
});
test('upload descriptor uses final URI, filename, MIME and measured size for images and MOV', async () => {
  const measured = [];
  const helper = load('services/utils/prepareUploadMedia.ts', {
    './imageConversion': { convertToSupportedFormat: async () => 'file:///converted.jpg', compressImage: async () => 'file:///compressed.jpg' },
    './videoCompression': { compressVideo: async uri => uri },
    './mime': load('services/utils/mime.ts'), '@/utils/error': errors,
    'expo-file-system/legacy': { getInfoAsync: async uri => { measured.push(uri); return { exists: true, size: 1234 }; } },
  });
  const image = await helper.prepareUploadMedia('file:///original.heic', 'IMAGE');
  assert.equal(image.uri, 'file:///compressed.jpg');
  assert.equal(image.fileName, 'compressed.jpg');
  assert.equal(image.fileType, 'image/jpeg');
  assert.equal(image.fileSize, 1234);
  const video = await helper.prepareUploadMedia('file:///clip.mov', 'VIDEO');
  assert.equal(video.fileType, 'video/quicktime');
  assert.deepEqual(measured, ['file:///compressed.jpg', 'file:///clip.mov']);
  await assert.rejects(helper.prepareUploadMedia('file:///clip.avi', 'VIDEO'), /supported media/);
});
const readiness = load('services/auth/notificationReadiness.ts');
const ready = { _hasHydrated: true, isBootstrapping: false, isInitializing: false, isAuthenticated: true, tokens: { accessToken: 'test-only' } };
test('notification readiness requires hydration, completed bootstrap and authentication', () => {
  assert.equal(readiness.canQueryNotifications(ready), true);
  for (const override of [{ _hasHydrated: false }, { isBootstrapping: true }, { isInitializing: true }, { isAuthenticated: false }, { tokens: null }]) {
    assert.equal(readiness.canQueryNotifications({ ...ready, ...override }), false);
  }
});
test('unread count sends no guest request and discards a response from an old session', async () => {
  let state = { ...ready, isAuthenticated: false }, version = 0, requests = 0, resolve;
  const query = load('services/graphQL/queries/actions/notifications.ts', {
    '@/store/useAuthStore': { useAuthStore: { getState: () => state } },
    '@/services/auth/notificationReadiness': readiness,
    '@/services/auth/session': { getSessionVersion: () => version },
    '@/services/graphQL/graphqlClient': { graphqlRequest: () => { requests++; return new Promise(r => { resolve = r; }); } },
  });
  assert.equal(await query.getUnreadNotificationCount(), 0);
  assert.equal(requests, 0);
  state = ready;
  const pending = query.getUnreadNotificationCount();
  version++;
  state = { ...ready, isAuthenticated: false };
  resolve({ unreadNotificationCount: 9 });
  assert.equal(await pending, 0);
});
test('unread hook disables polling when logged out', () => {
  let state = ready;
  const hooks = load('hooks/useNotifications.ts', {
    '@/store/useAuthStore': { useAuthStore: selector => selector(state) },
    '@/services/auth/notificationReadiness': readiness,
    '@tanstack/react-query': { useQuery: options => options },
    '@/services/graphQL/queries/actions/notifications': { getUnreadNotificationCount: async () => 0 },
    'expo-notifications': { setBadgeCountAsync: async () => {} },
  });
  assert.equal(hooks.useUnreadCount().refetchInterval, 30000);
  state = { ...ready, isAuthenticated: false };
  assert.equal(hooks.useUnreadCount().enabled, false);
  assert.equal(hooks.useUnreadCount().refetchInterval, false);
});
test('empty prepared files are rejected before upload', async () => {
  const { prepareUploadMedia } = load('services/utils/prepareUploadMedia.ts', {
    './imageConversion': { convertToSupportedFormat: async uri => uri, compressImage: async uri => uri },
    './videoCompression': { compressVideo: async uri => uri },
    './mime': load('services/utils/mime.ts'), '@/utils/error': errors,
    'expo-file-system/legacy': { getInfoAsync: async () => ({ exists: true, size: 0 }) },
  });
  await assert.rejects(prepareUploadMedia('file:///empty.jpg', 'IMAGE'), { code: 'MEDIA_PREPARATION_FAILED' });
});
test('circle and avatar upload requests use the prepared file descriptor', async () => {
  const prepared = { uri: 'file:///converted.jpg', fileName: 'converted.jpg', fileType: 'image/jpeg', fileSize: 4321 };
  const requests = [], transfers = [];
  const prepare = { prepareUploadMedia: async () => prepared };
  const circle = load('services/graphQL/mutation/media/circleMediaUpload.ts', {
    '@/services/utils/prepareUploadMedia': prepare,
    '@/services/graphQL/mutation/media/mediaUpload': {
      requestUploadSession: async (...args) => { requests.push(args); return { mediaId: 'id' }; },
      uploadWithStrategy: async (...args) => transfers.push(args),
      confirmMediaUpload: async () => ({ mediaUrl: 'https://example.com/converted.jpg' }),
    },
  });
  await circle.uploadCircleMedia('file:///original.heic', 'image/heic');
  assert.deepEqual(requests[0], ['converted.jpg', 'image/jpeg', 4321]);
  assert.deepEqual(transfers[0].slice(1), ['file:///converted.jpg', 'image/jpeg', 4321]);
  const avatar = load('services/profile/profileService.ts', {
    '@/services/utils/prepareUploadMedia': prepare,
    '@/utils/error': errors,
    '@/services/utils/cleanAvatarUrl': { cleanAvatarUrl: url => url },
    '@/services/graphQL/graphqlClient': { graphqlRequest: async () => ({ updateProfile: { success: true, profile: { avatarUrl: 'url' } } }) },
    '@/services/graphQL/mutation/media/mediaUpload': {
      requestMediaUpload: async (...args) => { requests.push(args); return { uploadUrl: 'url' }; },
      uploadFileToStorage: async (...args) => transfers.push(args),
      extractPublicUrl: url => url,
    },
  });
  await avatar.updateAvatar({ uri: 'file:///original.heic' });
  assert.deepEqual(requests[1], ['converted.jpg', 'image/jpeg', 4321]);
  assert.deepEqual(transfers[1], ['url', 'file:///converted.jpg', 'image/jpeg']);
});
