import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "./src/constants/brand";

function injectAppName(): Plugin {
  return {
    name: "inject-app-name",
    transformIndexHtml(html) {
      return html
        .replace(/__APP_NAME__/g, APP_NAME)
        .replace(/__APP_DESCRIPTION__/g, APP_DESCRIPTION);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectAppName(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg", "icons/icon-source.png", "favicon.svg", "favicon.png"],
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        description: `${APP_TAGLINE}. Insights, journaling, and ${APP_NAME} support.`,
        theme_color: "#0f766e",
        background_color: "#f8faf9",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        categories: ["health", "medical", "lifestyle"],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
      minify: false,
    }),
  ],
});
