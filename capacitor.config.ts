import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.oraldevicedetector',
  appName: 'Oral Disease Detector',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
