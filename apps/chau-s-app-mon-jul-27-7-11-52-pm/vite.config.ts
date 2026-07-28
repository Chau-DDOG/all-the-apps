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
        site: process.env.DD_SITE,
        apiKey: process.env.DD_API_KEY,
        appKey: process.env.DD_APP_KEY,
      },
      apps: {
        enable: true,
        authOverrides: {
          method: hasDatadogApiKeys ? "apiKey" : "oauth",
        },
        identifier: "5ef80791dc764ecf9c77e68fd3cc41b4",
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
