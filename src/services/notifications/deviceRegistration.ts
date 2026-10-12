// One registrar per authenticated session. Serialize different tokens without dropping refreshes.
export function createDeviceRegistration(
  register: (token: string) => Promise<boolean>,
  isCurrentSession: () => boolean,
  onRegistered: () => void,
) {
  let registeredToken: string | undefined;
  let queue: Promise<void> = Promise.resolve();
  return (token: string): Promise<void> => {
    const result = queue.then(async () => {
      if (!isCurrentSession()) return;
      if (!token) throw new Error("Firebase returned an empty device token");
      if (token === registeredToken) return;
      const success = await register(token);
      if (!success) throw new Error("Backend rejected FCM device token registration");
      if (!isCurrentSession()) return;
      registeredToken = token;
      onRegistered();
    });
    queue = result.catch(() => {});
    return result;
  };
}
