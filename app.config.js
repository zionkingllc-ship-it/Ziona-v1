/**
 * Multi-variant EAS configuration.
 * Reads APP_VARIANT environment variable to determine the active variant.
 * Variants: development, staging, production
 */
const variants = {
  development: {
    appName: "Ziona Dev",
    bundleId: "com.zionking.ziona.dev",
    packageId: "com.zionking.ziona.dev",
    scheme: "zionadev",
    associatedDomains: ["applinks:ziona.dev"],
    googleServicesFile: "./google-services.dev.json",
    googleServicesAndroid: "./google-services.dev.json",
  },
  staging: {
    appName: "Ziona Staging",
    bundleId: "com.zionking.ziona.staging",
    packageId: "com.zionking.ziona.staging",
    scheme: "zionastaging",
    associatedDomains: ["applinks:staging.ziona.app", "applinks:api.staging.ziona.app"],
    googleServicesFile: "./google-services.staging.json",
    googleServicesAndroid: "./google-services.staging.json",
  },
  production: {
    appName: "Ziona",
    bundleId: "com.zionking.ziona",
    packageId: "com.zionking.ziona",
    scheme: "ziona",
    associatedDomains: ["applinks:ziona.app", "applinks:api.ziona.app"],
    googleServicesFile: "./google-services.json",
    googleServicesAndroid: "./google-services.json",
  },
};

const variant = process.env.APP_VARIANT || "production";
const config = variants[variant];

if (!config) {
  throw new Error(`Unknown APP_VARIANT: ${process.env.APP_VARIANT}`);
}

// The bundle identifier for iOS and Android
const bundleId = config.bundleId;
const packageId = config.packageId;

// App name to display
const appName = config.appName;

// Deep link scheme
const scheme = config.scheme;

// Associated domains for universal links
const associatedDomains = config.associatedDomains;

// Google Services files path
const googleServicesFile = config.googleServicesFile;
const googleServicesAndroid = config.googleServicesAndroid;

module.exports = {
  expo: {
    name: config.appName,
    slug: "ziona",
    slug: config.appName.replace(/\s+/g, "-").toLowerCase(),
    version: "1.0.3",
    orientation: "portrait",
    orientationLock: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    npm: {
      // "expo-go" only supports expo-manifest v2
      "peerDependencies": {
        "expo": "~52.0.0"
      },
    },
    // The form below matches the form used by Expo Application Services
    // to build and publish your app to the app stores.
    // Instead of learning the exact shape of the native config experience
    // expected by EAS, you can preview the rendered config here.
    // learn more at https://docs.expo.dev/config/app-config/
    // find more info on native config experience at
    // https://docs.expo.dev/bare/#configuring-xcode-and-android-studio
    plugins: [
      "./plugins/withFirebaseConfig",
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-apple-authentication",
      "./plugins/withAndroidQueries",
      "./plugins/withImagePickerCropColors",
    ],
    // The following keys are part of the Expo application configuration
    // format, and will be evaluated when building your app on EAS.
    // The config will be merged with app.json values, with app.config.js
    // taking precedence.
    ios: {
      // The bundle identifier for iOS.
      bundleIdentifier: config.bundleId,
      // The iOS associated domains for universal links
      associatedDomains: config.associatedDomains,
      // The iOS google services file
      googleServicesFile: config.googleServicesFile,
      // The iOS google services file for Android (same as iOS in this config)
      googleServicesAndroid: config.googleServicesAndroid,
      // The iOS google services file path (for Expo Google Services)
      googleServicesFileIOS: config.googleServicesFile,
      // The iOS google services file path (for Android)
      googleServicesFileAndroid: config.googleServicesAndroid,
    },
    android: {
      // The package name for Android.
      package: config.packageId,
      // The Android version code (autoIncrement handled by EAS)
      versionCode: 1,
      // The Android version name
      version: "1.0.3",
      // The Android theme engine
      theme: "Theme.Styled.NoActionBar",
      // The Android google services file path
      googleServicesFile: config.googleServicesAndroid,
      // The Android google services file path (for iOS compatibility)
      googleServicesFileIOS: config.googleServicesFile,
      // The Android google services file path (for iOS compatibility)
      googleServicesFileAndroid: config.googleServicesAndroid,
    },
    // The following keys are part of the Expo application configuration
    // and will be evaluated when building your app on EAS.
    // The config will be merged with app.json values, with app.config.js
    // taking precedence.
    extra: {
      // These values are available via process.env.extra in your app.
      APP_VARIANT: process.env.APP_VARIANT || "production",
      APP_NAME: config.appName,
    },
    // The runtimeVersion is used for EAS Updates.
    // The runtimeVersion is set to "runtimeVersion": "1.0.0" by default,
    // but you can use "runtimeVersion: { policy: "appVersion" }"
    // to have Expo automatically increment the runtimeVersion when
    // appVersion is incremented in app.json.
    // Uncomment the following line if you want to use this feature:
    // runtimeVersion: { policy: "appVersion" },
    "extra": {
      "APP_VARIANT": process.env.APP_VARIANT || "production",
    },
    "extra": {
      "channel": process.env.APP_VARIANT || "production",
    },
    "plugins": [
      "./plugins/withFirebaseConfig",
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-apple-authentication",
      "./plugins/withAndroidQueries",
      "./plugins/withImagePickerCropColors",
    ],
    "runtimeVersion": "1.0.3",
    "slug": "ziona",
    "ios": {
      "associatedDomains": config.associatedDomains,
      "googleServicesFile": config.googleServicesFile,
      "googleServicesAndroid": config.googleServicesAndroid,
    },
    "android": {
      "package": config.packageId,
      "version": "1.0.3",
      "versionCode": 1,
      "googleServicesFile": config.googleServicesAndroid,
    },
    "plugins": [
      "./plugins/withFirebaseConfig",
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-apple-authentication",
      "./plugins/withAndroidQueries",
      "./plugins/withImagePickerCropColors",
    ],
  };
}
`;

Now let me also update the eas.json to set the APP_VARIANT per profile and add channels:Now let me update the eas.json to set the APP_VARIANT per profile and add channels:
<tool_call>
<function=bash>
<parameter=workdir>
D:\work\Ziona\ziona-v1