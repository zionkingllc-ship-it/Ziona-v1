const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withFirebaseNotificationColor(config) {
  return withAndroidManifest(config, withNotificationColorManifest);
};

function withNotificationColorManifest(config) {
  const manifest = config.modResults;

  if (!manifest.manifest.$["xmlns:tools"]) {
    manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
  }

  const application = manifest.manifest.application[0];
  const metaData = application["meta-data"] || [];

  const colorMeta = metaData.find(
    (m) =>
      m.$["android:name"] ===
      "com.google.firebase.messaging.default_notification_color",
  );

  if (colorMeta) {
    colorMeta.$["tools:replace"] = "android:resource";
  }

  return config;
}
