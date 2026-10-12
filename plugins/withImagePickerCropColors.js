const { withAndroidColors, withAndroidColorsNight, AndroidConfig } = require("expo/config-plugins");

const { Colors } = AndroidConfig;

// expo-image-picker ships these as #00000000 (transparent) on SDK 54,
// which makes the Android crop toolbar/buttons invisible on dark backgrounds.
// Match the SDK 55 light-mode defaults: white toolbar with dark icons/text.
const CROP_OVERRIDES = {
  expoCropBackgroundColor: "#ffffff",
  expoCropBackButtonIconColor: "#000000",
  expoCropToolbarColor: "#ffffff",
  expoCropToolbarIconColor: "#000000",
  expoCropToolbarActionTextColor: "#000000",
};

function assignCropColors(config) {
  Object.entries(CROP_OVERRIDES).forEach(([name, value]) => {
    Colors.assignColorValue(config.modResults, { name, value });
  });
  return config;
}

module.exports = function withImagePickerCropColors(config) {
  config = withAndroidColors(config, assignCropColors);
  config = withAndroidColorsNight(config, assignCropColors);
  return config;
};