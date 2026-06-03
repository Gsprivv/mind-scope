import type { CapacitorConfig } from "@capacitor/cli";
import { APP_NAME } from "./src/constants/brand";

const config: CapacitorConfig = {
  appId: "uk.co.mindscope.app",
  appName: APP_NAME,
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
