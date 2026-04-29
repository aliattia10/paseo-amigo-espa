import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'es.paseo.app',
  appName: 'Paseo',
  webDir: 'dist',
  // Keep production URL outside source control; set CAPACITOR_SERVER_URL in your build/release environment.
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false
        }
      }
    : {})
};

export default config;
