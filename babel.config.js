module.exports = function (api) {
  api.cache(true)
  const isDev = process.env.NODE_ENV === 'development'
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
          disableExtraction: isDev,
        },
      ],

      'react-native-reanimated/plugin',

      !isDev && 'transform-remove-console',
    ].filter(Boolean),
  }
}