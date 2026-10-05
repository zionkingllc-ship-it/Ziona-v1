const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

function withFirebaseConfig(config) {
  const env = process.env.FIREBASE_ENV || 'staging'
  config = withDangerousMod(config, ['android', (config) => {
    const projectRoot = config.modRequest.projectRoot
    const src = path.join(projectRoot, `android/app/google-services-${env}.json`)
    const dst = path.join(projectRoot, 'android/app/google-services.json')
    if (fs.existsSync(src)) { fs.copyFileSync(src, dst) }
    else { console.warn(`[Firebase Config] ${src} not found`) }
    return config
  }])
  config = withDangerousMod(config, ['ios', (config) => {
    const projectRoot = config.modRequest.projectRoot
    const src = path.join(projectRoot, `ios/GoogleService-Info-${env}.plist`)
    const dst = path.join(projectRoot, 'ios/GoogleService-Info.plist')
    if (fs.existsSync(src)) { fs.copyFileSync(src, dst) }
    else { console.warn(`[Firebase Config] ${src} not found`) }
    return config
  }])
  return config
}
module.exports = withFirebaseConfig
