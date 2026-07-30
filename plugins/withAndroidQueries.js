const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withAndroidQueries(config) {
  return withAndroidManifest(config, withAndroidQueriesManifest);
};

function withAndroidQueriesManifest(config) {
  const manifest = config.modResults;

  const queriesExists = manifest.manifest.queries?.length > 0;
  if (queriesExists) return config;

  manifest.manifest.queries = [
    {
      intent: [
        { action: { $: { "android:name": "android.intent.action.VIEW" } } },
        { data: { $: { "android:scheme": "whatsapp" } } },
      ],
    },
    {
      intent: [
        { action: { $: { "android:name": "android.intent.action.VIEW" } } },
        { data: { $: { "android:scheme": "sms" } } },
      ],
    },
    {
      intent: [
        { action: { $: { "android:name": "android.intent.action.VIEW" } } },
        { data: { $: { "android:scheme": "mailto" } } },
      ],
    },
  ];

  return config;
}
