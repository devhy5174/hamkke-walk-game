import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "hamkke-walk-game",
  brand: {
    displayName: "산책길 모험",
    primaryColor: "#3B82F6",
    icon: "public/app_logo.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
