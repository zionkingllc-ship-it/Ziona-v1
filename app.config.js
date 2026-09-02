const variants = {
  development: {
    appName: "Ziona Dev",
    bundleIdentifier: "com.zionking.ziona.dev",
    package: "com.zionking.ziona.dev",
    scheme: "zionadev",
    googleServicesFileIos: "./GoogleService-Info.dev.plist",
    googleServicesFileAndroid: "./google-services.dev.json",
    googleIosClientId: "511999112847-r44sgjgqbgmnl5s83v9iiiqsgfbg05a9.apps.googleusercontent.com",
    googleIosReversedClientId: "com.googleusercontent.apps.511999112847-r44sgjgqbgmnl5s83v9iiiqsgfbg05a9",
  },
  staging: {
    appName: "Ziona Staging",
    bundleIdentifier: "com.zionking.ziona.staging",
    package: "com.zionking.ziona.staging",
    scheme: "zionastaging",
    googleServicesFileIos: "./GoogleService-Info.staging.plist",
    googleServicesFileAndroid: "./google-services.staging.json",
    googleIosClientId: "511999112847-r44sgjgqbgmnl5s83v9iiiqsgfbg05a9.apps.googleusercontent.com",
    googleIosReversedClientId: "com.googleusercontent.apps.511999112847-r44sgjgqbgmnl5s83v9iiiqsgfbg05a9",
  },
  production: {
    appName: "Ziona",
    bundleIdentifier: "com.zionking.ziona",
    package: "com.zionking.ziona",
    scheme: "ziona",
    googleServicesFileIos: "./GoogleService-Info.plist",
    googleServicesFileAndroid: "./google-services.json",
    googleIosClientId: "433767985127-af63p5o4ahgk4voiqv4u7mj0a7fm3gfv.apps.googleusercontent.com",
    googleIosReversedClientId: "com.googleusercontent.apps.433767985127-af63p5o4ahgk4voiqv4u7mj0a7fm3gfv",
  },
};

const variant = variants[process.env.APP_VARIANT ?? "production"];

// Helper: attempt variant file(s); fall back to production if missing
const fs = require("fs");
const resolveGoogleServicesFile = (...candidates) => {
  for (const f of candidates) if (f && fs.existsSync(f)) return f;
  return candidates[candidates.length - 1];
};

module.exports = {
  expo: {
    name: variant.appName,
    slug: "ziona",
    version: "1.0.3",
    scheme: variant.scheme,
    // Carried from app.json (deduplicated & cleaned)
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    ios: {
      bundleIdentifier: variant.bundleIdentifier,
      googleServicesFile: resolveGoogleServicesFile(
        variant.googleServicesFileIos,
        "./GoogleService-Info." + variant.scheme + ".plist",
        "./GoogleService-Info.plist"
      ),
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
      },
      associatedDomains: ["applinks:ziona.app", "applinks:api.ziona.app"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          "Ziona needs access to your photo library to let you upload profile pictures and attach images to posts and comments.",
        NSPhotoLibraryAddUsageDescription:
          "Ziona needs access to save images to your photo library.",
        LSApplicationQueriesSchemes: ["whatsapp", "sms", "mailto", "ziona"],
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: variant.googleIosReversedClientId,
          },
        ],
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      googleServicesFile: resolveGoogleServicesFile(
        variant.googleServicesFileAndroid,
        "./google-services." + variant.scheme + ".json",
        "./google-services.json"
      ),
      softwareKeyboardLayoutMode: "resize",
      package: variant.package,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "ziona.app",
              pathPrefix: "/post",
            },
            {
              scheme: "https",
              host: "api.ziona.app",
              pathPrefix: "/post",
            },
            {
              scheme: "ziona",
              host: "*",
              pathPrefix: "/viewer",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.POST_NOTIFICATIONS",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "./plugins/withFirebaseNotificationColor",
      "expo-router",
      ["@react-native-google-signin/google-signin", { iosUrlScheme: variant.googleIosReversedClientId }],
      ["expo-build-properties", { ios: { useFrameworks: "static" }, android: { enableProguardInReleaseBuilds: true, enableShrinkResourcesInReleaseBuilds: true, edgeToEdge: true, enableMinifyInReleaseBuilds: true } }],
      ["expo-splash-screen", { image: "./assets/images/splash-icon.png", backgroundColor: "#ffffff", resizeMode: "contain", imageWidth: 200 }],
      "expo-asset",
      "expo-font",
      "expo-web-browser",
      "expo-video",
      "expo-apple-authentication",
      "./plugins/withAndroidOrientation",
      "./plugins/withImagePickerCropColors",
      ["expo-notifications", { color: "#742092" }],
      "./plugins/withAndroidQueries",
      // NOTE: withFirebaseConfig removed — source files never existed; variant googleServicesFile above handles native config
    ],
    extra: {
      router: {},
      eas: {
        projectId: "ae56ecb7-5133-4048-849f-b5f191d82d6a",
      },
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/ae56ecb7-5133-4048-849f-b5f191d82d6a",
    },
  },
};