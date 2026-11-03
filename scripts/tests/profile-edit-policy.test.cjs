const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const moduleMock = { exports: {} };
const source = ts.transpileModule(
  fs.readFileSync(path.resolve(__dirname, "../../utils/profileEditPolicy.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
vm.runInNewContext(source, { module: moduleMock, exports: moduleMock.exports });
const { getEditAvailability } = moduleMock.exports;

const createdAt = "2026-11-01T00:00:00.000Z";
const signup = Date.parse(createdAt);
const policy = {
  createdAt,
  lastNameChange: "2026-11-01T01:00:00.000Z",
  lastUsernameChange: null,
  displayNameEditableUntil: "2026-11-03T00:00:00.000Z",
  usernameEditableUntil: "2026-11-03T00:00:00.000Z",
  usernameGraceChangesRemaining: 2,
};

test("name edits during signup grace are never locally locked", () => {
  const status = getEditAvailability(policy, signup + 47 * 60 * 60 * 1000);
  assert.equal(status.inGrace, true);
  assert.equal(status.nameLockedUntil, null);
  assert.equal(status.usernameLockedUntil, null);
  assert.equal(status.graceChangesRemaining, 2);
});

test("exhausting username grace edits locks only the handle until 48 hours", () => {
  const status = getEditAvailability({ ...policy, usernameGraceChangesRemaining: 0 }, signup + 60 * 60 * 1000);
  assert.equal(status.nameLockedUntil, null);
  assert.equal(status.usernameLockedUntil, signup + 48 * 60 * 60 * 1000);
});

test("after grace, an early name edit does not start the 14-day lock", () => {
  const status = getEditAvailability(policy, signup + 48 * 60 * 60 * 1000);
  assert.equal(status.inGrace, false);
  assert.equal(status.nameLockedUntil, null);
  assert.equal(status.usernameLockedUntil, null);
});

test("post-grace edits use server timestamps for both cooldowns", () => {
  const changed = new Date(signup + 49 * 60 * 60 * 1000).toISOString();
  const status = getEditAvailability({ ...policy, lastNameChange: changed, lastUsernameChange: changed }, signup + 50 * 60 * 60 * 1000);
  assert.equal(status.nameLockedUntil, Date.parse(changed) + 14 * 24 * 60 * 60 * 1000);
  assert.equal(status.usernameLockedUntil, Date.parse(changed) + 30 * 24 * 60 * 60 * 1000);
});
