import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meruq.viaticos',
  appName: 'MeruQViaticos',
  webDir: 'public',
  server: {
    // Apunta al servidor Next.js que está corriendo localmente
    url: 'http://192.168.0.199:3000',
    cleartext: true
  }
};

export default config;
