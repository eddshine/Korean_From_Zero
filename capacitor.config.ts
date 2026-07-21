import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.koreanfromzero.app',
  appName: 'Korean From Zero',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#FAFAFA',
    allowMixedContent: true,
  },
}

export default config
