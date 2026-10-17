import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.olearn.app',
  appName: 'OLearn',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
