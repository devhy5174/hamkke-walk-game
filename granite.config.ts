import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "hamkke-walk-game",
  brand: {
    displayName: "산책길 모험",
    primaryColor: "#3B82F6",
    icon: "https://static.toss.im/appsintoss/30605/1d03e4d5-fe38-40ca-b4f1-74403c565f2f.png",
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
