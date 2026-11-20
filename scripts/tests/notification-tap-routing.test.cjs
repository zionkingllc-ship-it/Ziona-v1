const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");

function loadNavigation() {
  const module = { exports: {} };
  const source = ts.transpileModule(
    fs.readFileSync(
      path.join(root, "src/services/notifications/notificationNavigation.ts"),
      "utf8",
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  ).outputText;
  vm.runInNewContext(source, { module, exports: module.exports });
  return module.exports;
}

const { resolveNotificationDestination } = loadNavigation();

// Objects created inside the VM realm carry a different prototype.
const resolve = (payload) => {
  const href = resolveNotificationDestination(payload);
  return href == null ? null : JSON.parse(JSON.stringify(href));
};

// Shape of the flat FCM data payload the backend builds in
// core/notifications/services.py (create_notification).
function pushData(overrides = {}) {
  return {
    type: "like",
    referenceId: "",
    referenceType: "",
    destinationRoute: "",
    destinationEntityType: "",
    destinationEntityId: "",
    destinationSecondaryEntityId: "",
    destinationCircleId: "",
    ...overrides,
  };
}

test("post push opens the post viewer", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "like",
        referenceType: "post",
        referenceId: "post-1",
        destinationRoute: "post_detail",
        destinationEntityType: "post",
        destinationEntityId: "post-1",
      }),
    ),
    { pathname: "/viewer/post-1", params: { postId: "post-1" } },
  );
});

test("comment push opens the post with the comments sheet and comment id", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "comment",
        referenceType: "comment",
        referenceId: "comment-1",
        destinationRoute: "comment_thread",
        destinationEntityType: "comment",
        destinationEntityId: "comment-1",
        destinationSecondaryEntityId: "post-1",
      }),
    ),
    {
      pathname: "/viewer/post-1",
      params: { openComments: "1", commentId: "comment-1", postId: "post-1" },
    },
  );
});

test("follow push opens the actor profile", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "follow",
        referenceType: "user",
        referenceId: "user-1",
        destinationRoute: "profile",
        destinationEntityType: "user",
        destinationEntityId: "user-1",
      }),
    ),
    { pathname: "/guest", params: { userId: "user-1" } },
  );
});

test("circle post push opens the circle post detail, not just the circle feed", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "circle_post",
        referenceType: "circle_post",
        referenceId: "cpost-1",
        destinationRoute: "circle_post_detail",
        destinationEntityType: "circle_post",
        destinationEntityId: "cpost-1",
        destinationSecondaryEntityId: "circle-1",
        destinationCircleId: "circle-1",
      }),
    ),
    { pathname: "/posts/[id]", params: { circleId: "circle-1", postId: "cpost-1" } },
  );
});

test("circle comment push opens the circle post with the comments sheet", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "comment",
        referenceType: "circle_post_comment",
        referenceId: "ccomment-1",
        destinationRoute: "circle_post_comment_thread",
        destinationEntityType: "circle_post_comment",
        destinationEntityId: "ccomment-1",
        destinationSecondaryEntityId: "cpost-1",
        destinationCircleId: "circle-1",
      }),
    ),
    {
      pathname: "/posts/[id]",
      params: {
        openComments: "1",
        commentId: "ccomment-1",
        circleId: "circle-1",
        postId: "cpost-1",
      },
    },
  );
});

test("anchor response push opens the anchor, not the response id", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "anchor_response",
        referenceType: "anchor_response",
        referenceId: "response-1",
        destinationRoute: "anchor_response",
        destinationEntityType: "anchor_response",
        destinationEntityId: "response-1",
        destinationSecondaryEntityId: "anchor-1",
        destinationCircleId: "circle-1",
      }),
    ),
    {
      pathname: "/(tabs)/circle/anchorUnifiedView",
      params: { id: "anchor-1", circleId: "circle-1", source: "notification" },
    },
  );
});

test("generic notification destination opens the activity list", () => {
  assert.deepEqual(
    resolve(
      pushData({
        type: "system",
        referenceType: "notification",
        referenceId: "notif-1",
        destinationRoute: "notification_detail",
        destinationEntityType: "notification",
        destinationEntityId: "notif-1",
      }),
    ),
    { pathname: "/notifications" },
  );
});

test("in-app GraphQL destination object routes comments to the comments sheet", () => {
  assert.deepEqual(
    resolve({
      type: "comment",
      referenceType: "comment",
      referenceId: "comment-2",
      destination: {
        route: "comment_thread",
        entityType: "comment",
        entityId: "comment-2",
        secondaryEntityId: "post-2",
        circleId: "",
      },
    }),
    {
      pathname: "/viewer/post-2",
      params: { openComments: "1", commentId: "comment-2", postId: "post-2" },
    },
  );
});

test("legacy payload without a route still maps reference types", () => {
  assert.deepEqual(
    resolve({
      type: "comment",
      referenceType: "comment",
      referenceId: "comment-3",
      secondaryEntityId: "post-3",
    }),
    { pathname: "/viewer/post-3", params: { postId: "post-3" } },
  );

  assert.deepEqual(
    resolve({
      type: "mention",
      referenceType: "Anchor",
      referenceId: "anchor-2",
      secondaryEntityId: "circle-2",
    }),
    {
      pathname: "/(tabs)/circle/anchorUnifiedView",
      params: { id: "anchor-2", circleId: "circle-2", source: "notification" },
    },
  );
});

test("unknown destinations do not navigate", () => {
  assert.equal(
    resolve(pushData({ referenceType: "unmapped", referenceId: "x" })),
    null,
  );
});
