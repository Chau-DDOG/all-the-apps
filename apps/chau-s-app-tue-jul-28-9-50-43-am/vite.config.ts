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
        identifier: "a942f6e4817b4b46a28db69cf33d5097",
      },
      errorTracking: {
        enable: hasDatadogApiKeys,
        sourcemaps: {
          minifiedPathPrefix: "/",
          releaseVersion: version,
          service: "madrid-weather-wardrobe",
        },
      },
      metadata: {
        name: "Madrid Weather Wardrobe",
      },
      metrics: {
        enable: hasDatadogApiKeys,
      },
    }),
  ],
});