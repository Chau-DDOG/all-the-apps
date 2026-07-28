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
        site: process.env.DD_SITE || rootManifest.datadogApps?.site,
        apiKey: process.env.DD_API_KEY,
        appKey: process.env.DD_APP_KEY,
      },
      apps: {
        enable: true,
        authOverrides: {
          method: hasDatadogApiKeys ? "apiKey" : "oauth",
        },
        identifier: "f825bcdbe8d934868a2c1d1eae976dfd",
      },
      errorTracking: {
        enable: hasDatadogApiKeys,
        sourcemaps: {
          minifiedPathPrefix: "/",
          releaseVersion: version,
          service: "chau-s-app-tue-jul-28-11-26-20-am",
        },
      },
      metadata: {
        name: "Chau's App Tue, Jul 28, 11:26:20 am",
      },
      metrics: {
        enable: hasDatadogApiKeys,
      },
    }),
  ],
});
