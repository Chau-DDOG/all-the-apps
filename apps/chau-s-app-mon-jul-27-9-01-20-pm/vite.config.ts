import { datadogVitePlugin } from "@datadog/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import rootManifest from "../../package.json";
import { version } from "./package.json";

process.env.DD_SITE ||= rootManifest.datadogApps?.site;
process.env.DATADOG_SITE ||= process.env.DD_SITE;

const hasDatadogApiKeys = Boolean(
  (process.env.DD_API_KEY || process.env.DATADOG_API_KEY) &&
    (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY),
);
const datadogSite = process.env.DD_SITE || rootManifest.datadogApps?.site;

export default defineConfig({
  base: "./",
  build: {
    sourcemap: true,
  },
  plugins: [
    react(),
    datadogVitePlugin({
      logLevel: "debug",
      auth: {
        site: datadogSite,
        apiKey: process.env.DD_API_KEY,
        appKey: process.env.DD_APP_KEY,
      },
      apps: {
        enable: true,
        authOverrides: {
          method: hasDatadogApiKeys ? "apiKey" : "oauth",
        },
        identifier: "d769e50c55cb16321d519bcda0d3211c",
      },
      errorTracking: {
        enable: hasDatadogApiKeys,
        sourcemaps: {
          minifiedPathPrefix: "/",
          releaseVersion: version,
          service: "tic-tac-toe",
        },
      },
      metadata: {
        name: "Tic Tac Toe",
      },
      metrics: {
        enable: hasDatadogApiKeys,
      },
    }),
  ],
});