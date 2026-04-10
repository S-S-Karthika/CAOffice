import type { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'com.caoffice.app',
  appName: 'CA Office',
  webDir: 'build',
  server: {
    url: 'https://ca-office.vercel.app/',
    cleartext: true
  }
};

export default config;
