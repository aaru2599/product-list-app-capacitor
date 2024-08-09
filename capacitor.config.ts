import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Product-app',
  webDir: 'dist',
  "bundledWebRuntime": true,
  server:{
androidScheme:"https"
  }
};

export default config;
