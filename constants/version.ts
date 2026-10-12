import Constants from "expo-constants";

/** App version — sourced from app.json (expo.version). Bump app.json on release. */
export const APP_VERSION = Constants.expoConfig?.version ?? "0.0.0";