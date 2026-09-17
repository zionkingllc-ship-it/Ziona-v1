import { Platform } from "react-native";

let sdkInitialized = false;

function getFbsdk() {
  const { Settings, AppEventsLogger } = require("react-native-fbsdk-next");
  return { Settings, AppEventsLogger };
}

/**
 * Initializes the Meta SDK at app startup so events can be logged right
 * away (e.g. CompleteRegistration during signup, before the user ever
 * reaches the ATT prompt). isAutoInitEnabled/autoLogAppEventsEnabled are
 * off in the config plugin, so nothing is sent to Meta until this runs.
 * Advertiser tracking defaults to off until `setAdvertiserTrackingEnabled`
 * is called with the resolved ATT decision.
 */
export function initMetaSDK() {
  if (sdkInitialized) return;

  const { Settings } = getFbsdk();

  if (Platform.OS === "ios") {
    Settings.setAdvertiserTrackingEnabled(false);
  }

  Settings.setAutoLogAppEventsEnabled(true);
  Settings.initializeSDK();
  sdkInitialized = true;
}

/** Call once the iOS ATT permission decision is known. No-op on other platforms. */
export function setAdvertiserTrackingEnabled(granted: boolean) {
  if (Platform.OS !== "ios") return;
  const { Settings } = getFbsdk();
  Settings.setAdvertiserTrackingEnabled(granted);
}

export function logCompleteRegistrationEvent(registrationMethod: "google" | "apple") {
  if (!sdkInitialized) return;

  const { AppEventsLogger } = getFbsdk();
  AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
    [AppEventsLogger.AppEventParams.RegistrationMethod]: registrationMethod,
  });
}
