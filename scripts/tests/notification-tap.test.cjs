const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
test('a notification tap navigates after the app is already mounted', async () => {
  const hooks = []; let cursor = 0, effects = [], tap; const pushes = [];
  const React = {
    createElement: () => null,
    useRef: value => { const i = cursor++; return hooks[i] ??= { current: value }; },
    useState: value => { const i = cursor++; if (!(i in hooks)) hooks[i] = value; return [hooks[i], next => { hooks[i] = next; }]; },
    useEffect: (fn, deps) => {
      const i = cursor++, old = hooks[i];
      if (!old || deps.some((dep, n) => dep !== old.deps[n])) effects.push(() => { old?.cleanup?.(); hooks[i] = { deps, cleanup: fn() }; });
    },
  };
  const auth = { isAuthenticated: true, user: { id: 'me' } };
  const useAuthStore = selector => selector(auth); useAuthStore.getState = () => auth;
  const notifications = {
    setNotificationHandler() {}, getPermissionsAsync: async () => ({ status: 'denied' }),
    requestPermissionsAsync: async () => ({ status: 'denied', canAskAgain: true }),
    setBadgeCountAsync: async () => {}, clearLastNotificationResponseAsync: async () => {},
    getLastNotificationResponseAsync: async () => null,
    addNotificationResponseReceivedListener: fn => { tap = fn; return { remove() {} }; },
    addNotificationReceivedListener: () => ({ remove() {} }),
  };
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../providers/notificationProvider.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, console: { log() {}, warn() {} }, require: name => {
    if (name === 'react') return React;
    if (name === 'react-native') return { NativeModules: {}, Platform: { OS: 'ios' }, AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } };
    if (name === 'expo-notifications') return notifications;
    if (name === 'expo-router') return { router: { push: href => pushes.push(href) } };
    if (name.endsWith('/platform')) return { isIOS: true };
    if (name.endsWith('useRootNavigationReady')) return { useRootNavigationReady: () => true };
    if (name.endsWith('/actions/notifications')) return { getUnreadNotificationCount: async () => 0 };
    if (name.endsWith('/deviceRegistration')) return { createDeviceRegistration: () => async () => {} };
    if (name.endsWith('/notificationNavigation')) return { resolveNotificationDestination: data => ({ pathname: '/viewer/' + data.referenceId }) };
    if (name.endsWith('/notificationService')) return { emitNotificationReceived() {} };
    if (name.endsWith('/useAuthStore')) return { useAuthStore };
    if (name.endsWith('/storage')) return { storage: { get: async () => null, remove: async () => {}, set: async () => {} } };
    throw new Error(name);
  } });
  const render = () => { cursor = 0; effects = []; module.exports.default({ children: null }); effects.forEach(fn => fn()); };
  render(); await new Promise(resolve => setImmediate(resolve));
  tap({ notification: { request: { identifier: 'push-1', content: { data: { referenceId: 'post-1' } } } } });
  render();
  assert.equal(pushes.length, 1);
  assert.equal(pushes[0].pathname, '/viewer/post-1');
});
