const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withAndroidOrientation(config) {
  return withAndroidManifest(config, withAndroidOrientationManifest);
};

function withAndroidOrientationManifest(config) {
  const manifest = config.modResults;
  const application = manifest.manifest.application[0];
  const activities = application.activity;

  if (!manifest.manifest.$["xmlns:tools"]) {
    manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
  }

  const mainActivity = activities.find(
    (a) =>
      a.$["android:name"] === ".MainActivity" ||
      a.$["android:name"] === "com.zionking.ziona.MainActivity",
  );
  if (mainActivity) {
    delete mainActivity.$["android:screenOrientation"];
  }

  const BARCODE_ACTIVITY =
    "com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity";

  const barcodeActivity = activities.find(
    (a) => a.$["android:name"] === BARCODE_ACTIVITY,
  );

  if (barcodeActivity) {
    delete barcodeActivity.$["android:screenOrientation"];
  } else {
    activities.push({
      $: {
        "android:name": BARCODE_ACTIVITY,
        "tools:replace": "android:screenOrientation",
        "android:screenOrientation": "unspecified",
      },
    });
  }

  return config;
}
