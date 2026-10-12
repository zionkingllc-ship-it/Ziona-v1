const variants = {
  staging: {
    appName: "Ziona Staging",
    slug: "ziona-staging",
    bundleIdentifier: "com.zionking.ziona.staging",
    package: "com.zionking.ziona.staging",
    scheme: "zionastaging",
    projectId: "c8393003-78c7-4225-81d6-96807a7afa04",
    googleServicesFileIos: "./GoogleService-Info.staging.plist",
    googleServicesFileAndroid: "./google-services.staging.json",
    googleAndroidClientId:
      "273573551303-bafar3va69072q29jbcgp2l4aivs7mol.apps.googleusercontent.com",
    googleIosClientId:
      "273573551303-fpipdq89n28lv7t3la0bsh1n5do0bp89.apps.googleusercontent.com",
    googleWebClientId:
      "273573551303-lhghjjbh4qa1tad0ml3bat95igggfp18.apps.googleusercontent.com",
    googleIosReversedClientId:
      "com.googleusercontent.apps.273573551303-fpipdq89n28lv7t3la0bsh1n5do0bp89",
  },
  production: {
    appName: "Ziona",
    slug: "ziona",
    bundleIdentifier: "com.zionking.ziona",
    package: "com.zionking.ziona",
    scheme: "ziona",
    projectId: "ae56ecb7-5133-4048-849f-b5f191d82d6a",
    googleServicesFileIos: "./GoogleService-Info.plist",
    googleServicesFileAndroid: "./google-services.json",
    googleAndroidClientId:
      "433767985127-g78pqsa8bhtaqmh98n9khka2hdvti17d.apps.googleusercontent.com",
    googleIosClientId:
      "433767985127-af63p5o4ahgk4voiqv4u7mj0a7fm3gfv.apps.googleusercontent.com",
    googleWebClientId:
      "433767985127-j7ruvcarb1fk4191gbi8v44vkunjppqk.apps.googleusercontent.com",
    googleIosReversedClientId:
      "com.googleusercontent.apps.433767985127-af63p5o4ahgk4voiqv4u7mj0a7fm3gfv",
  },
};

const requestedVariant = process.env.APP_VARIANT ?? "production";
// Development intentionally uses the same native app and Firebase registration as staging.
const variant =
  variants[requestedVariant === "development" ? "staging" : requestedVariant];
if (!variant) throw new Error(`Unknown APP_VARIANT: ${requestedVariant}`);

const META_APP_ID = "4373332852958136";
const META_CLIENT_TOKEN = process.env.EXPO_PUBLIC_META_CLIENT_TOKEN ?? "";

const fs = require("fs");
const resolveGoogleServicesFile = (...candidates) => {
  for (const f of candidates) if (f && fs.existsSync(f)) return f;
  throw new Error(
    `Missing Firebase config for ${variant.scheme}: ${candidates.join(", ")}`,
  );
};
const googleServicesFileIos = resolveGoogleServicesFile(
  variant.googleServicesFileIos,
  ...(variant.scheme === "ziona"
    ? []
    : [`./GoogleService-Info.${variant.scheme}.plist`]),
);
const googleServicesFileAndroid = resolveGoogleServicesFile(
  variant.googleServicesFileAndroid,
  ...(variant.scheme === "ziona"
    ? []
    : [`./google-services.${variant.scheme}.json`]),
);
const androidFirebaseConfig = JSON.parse(
  fs.readFileSync(googleServicesFileAndroid, "utf8"),
);
const androidFirebaseApp = androidFirebaseConfig.client?.find(
  (client) =>
    client.client_info?.android_client_info?.package_name === variant.package,
);
if (!androidFirebaseApp) {
  throw new Error(
    `Firebase config ${googleServicesFileAndroid} has no Android app registered for ${variant.package}`,
  );
}
if (
  !androidFirebaseApp.oauth_client?.some((client) => client.client_type === 1)
) {
  const signingGuidance =
    variant.scheme === "zionastaging"
      ? "Play App Signing SHA-1 and EAS staging keystore SHA-1 for direct installs"
      : "the Android package's distributed signing SHA-1";
  console.warn(
    `[config] Firebase config for ${variant.package} has no Android OAuth client. Register this package and ${signingGuidance} in Firebase/Google Cloud, then download the updated config.`,
  );
}

module.exports = {
  expo: {
    name: variant.appName,
    slug: variant.slug,
    version: "1.0.5",
    scheme: variant.scheme,
    // Carried from app.json (deduplicated & cleaned)
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    ios: {
      bundleIdentifier: variant.bundleIdentifier,
      googleServicesFile: googleServicesFileIos,
      entitlements: {
        "com.apple.developer.applesignin": ["Default"],
      },
      associatedDomains:
        variant.scheme === "ziona"
          ? ["applinks:ziona.app", "applinks:api.ziona.app"]
          : ["applinks:staging.ziona.app", "applinks:api.staging.ziona.app"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          "Ziona needs access to your photo library to let you upload profile pictures and attach images to posts and comments.",
        NSPhotoLibraryAddUsageDescription:
          "Ziona needs access to save images to your photo library.",
        LSApplicationQueriesSchemes: ["whatsapp", "sms", "mailto", "ziona"],
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [variant.googleIosReversedClientId],
          },
        ],
        UIBackgroundModes: ["remote-notification"],
      },
    },
    android: {
      googleServicesFile: googleServicesFileAndroid,
      softwareKeyboardLayoutMode: "resize",
      package: variant.package,
      intentFilters: [
        ...[variant.scheme === "ziona" ? "ziona.app" : "staging.ziona.app",
            variant.scheme === "ziona" ? "api.ziona.app" : "api.staging.ziona.app"].map((host) => ({
          action: "VIEW",
          autoVerify: true,
          data: ["/post/", "/profile/", "/viewer/"].map((pathPrefix) => ({ scheme: "https", host, pathPrefix })),
          category: ["BROWSABLE", "DEFAULT"],
        })),
        {
          action: "VIEW",
          data: [{ scheme: variant.scheme }],
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
      "./plugins/withAndroidAllowBackup",
      "./plugins/withFirebaseNotificationColor",
      "expo-router",
      [
        "@react-native-google-signin/google-signin",
        { iosUrlScheme: variant.googleIosReversedClientId },
      ],
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            forceStaticLinking: ["RNFBApp", "RNFBMessaging"],
          },
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            edgeToEdge: true,
            enableMinifyInReleaseBuilds: true,
          },
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          backgroundColor: "#ffffff",
          resizeMode: "contain",
          imageWidth: 200,
        },
      ],
      "expo-asset",
      "expo-font",
      "expo-web-browser",
      "expo-video",
      "expo-apple-authentication",
      [
        "react-native-fbsdk-next",
        {
          appID: META_APP_ID,
          clientToken: META_CLIENT_TOKEN,
          displayName: variant.appName,
          scheme: `fb${META_APP_ID}`,
          isAutoInitEnabled: false,
          autoLogAppEventsEnabled: false,
          advertiserIDCollectionEnabled: true,
        },
      ],
      [
        "expo-tracking-transparency",
        {
          userTrackingPermission:
            "Ziona uses this to personalize your experience and measure how well our ads perform. Your data is never sold to third parties.",
        },
      ],
      "./plugins/withAndroidOrientation",
      "./plugins/withImagePickerCropColors",
      ["expo-notifications", { color: "#742092" }],
      "./plugins/withAndroidQueries",
      // NOTE: withFirebaseConfig removed — source files never existed; variant googleServicesFile above handles native config
    ],
    extra: {
      router: {},
      google: {
        androidClientId: variant.googleAndroidClientId,
        iosClientId: variant.googleIosClientId,
        webClientId: variant.googleWebClientId,
      },
      eas: {
        projectId: variant.projectId,
      },
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    runtimeVersion: "1.0.5",
    updates: {
      url: `https://u.expo.dev/${variant.projectId}`,
    },
  },
};
