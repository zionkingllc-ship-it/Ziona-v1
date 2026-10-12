const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const root = path.resolve(__dirname, '../..');
const deps = createRequire(path.join(root, 'package.json'));
const ts = deps('typescript');

function loadNavigation() {
  const file = path.join(root, 'src/services/notifications/notificationNavigation.ts');
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(source, { module, exports: module.exports, console }, { filename: file });
  return module.exports;
}

const { resolveDestinationFromNotification: resolveRaw } = loadNavigation();

// Objects created inside the VM realm carry a different prototype, so
// normalize through JSON before strict comparison.
const resolveDestination = (n) => {
  const r = resolveRaw(n);
  return r === null || r === undefined ? r ?? null : JSON.parse(JSON.stringify(r));
};
const resolveDestinationFromNotification = resolveDestination;

const POST_ID = 'post-123';
const CIRCLE_ID = 'circle-456';

// Backend contract: circle-post notifications navigate to the circle.
// entityId = circle-post ID, circle ID arrives via legacy secondaryEntityId
// or the explicit destination.circleId (three-ID case: circle → post → comment).

test('circle_post legacy payload navigates to the circle', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      referenceType: 'circle_post',
      referenceId: POST_ID,
      destination: {
        route: '/circleFeed',
        entityType: 'circle_post',
        entityId: POST_ID,
        secondaryEntityId: CIRCLE_ID,
      },
    }),
    { pathname: '/circleFeed', params: { id: CIRCLE_ID } }
  );
});

test('circle_post explicit destination.circleId navigates to the circle', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      referenceType: 'circle_post',
      referenceId: POST_ID,
      destination: {
        route: '/circleFeed',
        entityType: 'circle_post',
        entityId: POST_ID,
        secondaryEntityId: CIRCLE_ID,
        circleId: CIRCLE_ID,
      },
    }),
    { pathname: '/circleFeed', params: { id: CIRCLE_ID } }
  );
});

test('explicit circleId wins over stale secondaryEntityId', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      referenceType: 'circle_post',
      referenceId: POST_ID,
      destination: {
        route: '/circleFeed',
        entityType: 'circle_post',
        entityId: POST_ID,
        secondaryEntityId: 'stale-circle',
        circleId: CIRCLE_ID,
      },
    }),
    { pathname: '/circleFeed', params: { id: CIRCLE_ID } }
  );
});

test('circle_post with no circle id does not navigate', () => {
  assert.equal(
    resolveDestinationFromNotification({
      referenceType: 'circle_post',
      referenceId: POST_ID,
      destination: {
        route: '/circleFeed',
        entityType: 'circle_post',
        entityId: POST_ID,
      },
    }),
    null
  );
});

test('circle_post push-style top-level payload navigates to the circle', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      route: '/circleFeed',
      entityType: 'circle_post',
      entityId: POST_ID,
      secondaryEntityId: CIRCLE_ID,
      referenceType: 'circle_post',
      referenceId: POST_ID,
    }),
    { pathname: '/circleFeed', params: { id: CIRCLE_ID } }
  );
});

test('circle_post top-level circleId wins over stale secondaryEntityId', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      route: '/circleFeed',
      entityType: 'circle_post',
      entityId: POST_ID,
      secondaryEntityId: 'stale-circle',
      circleId: CIRCLE_ID,
      referenceType: 'circle_post',
      referenceId: POST_ID,
    }),
    { pathname: '/circleFeed', params: { id: CIRCLE_ID } }
  );
});

test('anchor notification still routes with explicit circleId', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      referenceType: 'anchor',
      referenceId: 'anchor-1',
      destination: {
        route: '/anchor/abc',
        entityType: 'anchor',
        entityId: 'anchor-1',
        circleId: CIRCLE_ID,
      },
    }),
    { pathname: '/(tabs)/circle/anchorUnifiedView', params: { id: 'anchor-1', circleId: CIRCLE_ID, source: 'notification' } }
  );
});

test('push payload destination* keys reach Path A for comments', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      destinationRoute: '/viewer/post-9',
      destinationEntityId: 'comment-3',
      destinationEntityType: 'comment',
      destinationSecondaryEntityId: 'post-9',
      referenceType: 'comment',
      referenceId: 'comment-3',
    }),
    { pathname: '/viewer/post-9', params: { postId: 'post-9' } }
  );
});

test('comment fallback uses parent post id, never the comment id', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      secondaryEntityId: 'post-9',
      referenceType: 'comment',
      referenceId: 'comment-3',
    }),
    { pathname: '/viewer/post-9', params: { postId: 'post-9' } }
  );
});

test('comment fallback with no post id does not navigate', () => {
  assert.equal(
    resolveDestinationFromNotification({
      referenceType: 'comment',
      referenceId: 'comment-3',
    }),
    null
  );
});

test('comment fallback prefers nested destination secondaryEntityId', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      referenceType: 'comment',
      referenceId: 'comment-3',
      destination: { entityType: 'comment', entityId: 'comment-3', secondaryEntityId: 'post-9' },
    }),
    { pathname: '/viewer/post-9', params: { postId: 'post-9' } }
  );
});

test('circle-nested comment routes to its circle', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      referenceType: 'comment',
      referenceId: 'comment-3',
      destination: { entityType: 'comment', entityId: 'comment-3', secondaryEntityId: 'post-9', circleId: 'circle-7' },
    }),
    { pathname: '/circleFeed', params: { id: 'circle-7' } }
  );
});

test('follow rows resolve to the actor profile', () => {
  const { isFollowNotification, resolveFollowRowHref } = loadNavigation();
  const clean = (v) => (v === null || v === undefined ? null : JSON.parse(JSON.stringify(v)));
  assert.equal(isFollowNotification({ type: 'new_follower' }), true);
  assert.equal(isFollowNotification({ title: 'New Follower' }), true);
  assert.equal(isFollowNotification({ type: 'comment', title: 'New comment' }), false);
  assert.deepEqual(
    clean(resolveFollowRowHref({ referenceType: 'follow', type: 'follow', user: { id: 'user-7' } })),
    { pathname: '/guest', params: { userId: 'user-7' } }
  );
  assert.deepEqual(
    clean(resolveFollowRowHref({ type: 'new_follower', title: 'New Follower', user: { id: 'user-9' } })),
    { pathname: '/guest', params: { userId: 'user-9' } }
  );
  assert.deepEqual(
    clean(resolveFollowRowHref({ type: 'suggest', user: { id: 'user-8' } })),
    { pathname: '/guest', params: { userId: 'user-8' } }
  );
  assert.equal(clean(resolveFollowRowHref({ referenceType: 'comment', referenceId: 'c1' })), null);
  assert.equal(clean(resolveFollowRowHref({ referenceType: 'follow', referenceId: 'f1' })), null);
  assert.equal(clean(resolveFollowRowHref(null)), null);
});

test('non-circle routing is unchanged', () => {
  assert.deepEqual(
    resolveDestinationFromNotification({
      destination: { route: '/posts/xyz', entityType: 'post', entityId: 'xyz' },
    }),
    { pathname: '/viewer/xyz', params: { postId: 'xyz' } }
  );
  assert.deepEqual(
    resolveDestinationFromNotification({ referenceType: 'follow', referenceId: 'user-1' }),
    { pathname: '/guest', params: { userId: 'user-1' } }
  );
});
