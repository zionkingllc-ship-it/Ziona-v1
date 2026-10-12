const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const moduleMock = { exports: {} };
const source = ts.transpileModule(
  fs.readFileSync(
    path.resolve(__dirname, "../../services/auth/googleAuthErrors.ts"),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
vm.runInNewContext(source, { module: moduleMock, exports: moduleMock.exports });
const { getGoogleAuthFailure } = moduleMock.exports;

test("Google cancellation does not become a sign-in failure", () => {
  assert.equal(
    getGoogleAuthFailure({ code: "SIGN_IN_CANCELLED" }, "google-sign-in")
      .cancelled,
    true,
  );
});

test("Android developer error explains package and signing-certificate setup", () => {
  const result = getGoogleAuthFailure(
    { code: 10 },
    "google-sign-in",
    "com.zionking.ziona.staging",
  );
  assert.match(result.error, /com\.zionking\.ziona\.staging/);
  assert.match(result.error, /SHA-1/);
});

test("missing ID token points to the Google web client configuration", () => {
  assert.match(
    getGoogleAuthFailure(new Error("No token"), "id-token").error,
    /web client ID/,
  );
});

test("Play services and connectivity failures have distinct guidance", () => {
  assert.match(
    getGoogleAuthFailure(
      { code: "PLAY_SERVICES_NOT_AVAILABLE" },
      "play-services",
    ).error,
    /Google Play services/,
  );
  assert.match(
    getGoogleAuthFailure({ code: "NETWORK_ERROR" }, "google-sign-in").error,
    /internet connection/,
  );
});

test("backend authorization errors include Axios response status", () => {
  const result = getGoogleAuthFailure({ response: { status: 401 } }, "backend");
  assert.match(result.error, /server rejected the account/);
});
