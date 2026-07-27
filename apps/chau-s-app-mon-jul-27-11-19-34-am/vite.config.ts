import { datadogVitePlugin } from "@datadog/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { version } from "./package.json";

process.env.DD_SITE ||= "datadoghq.com";
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
        site: process.env.DD_SITE || "datadoghq.com",
        apiKey: process.env.DD_API_KEY,
        appKey: process.env.DD_APP_KEY,
      },
      apps: {
        enable: true,
        authOverrides: {
          method: hasDatadogApiKeys ? "apiKey" : "oauth",
        },
        identifier: "1faf6b5d80f1051f2adae6ac596781de",
      },
      errorTracking: {
        enable: hasDatadogApiKeys,
        sourcemaps: {
          minifiedPathPrefix: "/",
          releaseVersion: version,
          service: "weather-wear",
        },
      },
      metadata: {
        name: "Weather & Wear",
      },
      metrics: {
        enable: hasDatadogApiKeys,
      },
    }),
  ],
});
