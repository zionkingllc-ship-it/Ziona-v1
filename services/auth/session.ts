// Invalidates asynchronous work when a user logs in, logs out, or loses a session.
let sessionVersion = 0;

export const getSessionVersion = () => sessionVersion;

export function advanceSession() {
  sessionVersion += 1;
}
