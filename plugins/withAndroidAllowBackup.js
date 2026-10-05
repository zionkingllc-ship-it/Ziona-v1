const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withAndroidAllowBackup(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    if (!manifest.manifest.$["xmlns:tools"]) {
      manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }
    const application = manifest.manifest.application?.[0];
    if (application?.$) {
      // Resolve manifest merger conflict with TAndroidLame (allowBackup true vs false)
      application.$["tools:replace"] = application.$["tools:replace"]
        ? `${application.$["tools:replace"]},android:allowBackup`
        : "android:allowBackup";
    }
    return config;
  });
};
