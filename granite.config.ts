import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "hamkke-walk-game",
  brand: {
    displayName: "함께Walk",
    primaryColor: "#3B82F6",
    icon: "",
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
