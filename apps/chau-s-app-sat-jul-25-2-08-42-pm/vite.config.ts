import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { version } from './package.json';

const hasDatadogApiKeys = Boolean(
    (process.env.DD_API_KEY || process.env.DATADOG_API_KEY) &&
        (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY),
);
const datadogSite = process.env.DD_SITE || process.env.DATADOG_SITE || 'datadoghq.com';

// The plugin also reads DD_SITE directly and rejects an empty sandbox value.
process.env.DD_SITE = datadogSite;

export default defineConfig({
    base: './',
    build: {
        sourcemap: true,
    },
    plugins: [
        react(),
        datadogVitePlugin({
            logLevel: 'debug',
            auth: {
                site: datadogSite,
                apiKey: process.env.DD_API_KEY,
                appKey: process.env.DD_APP_KEY,
            },
            apps: {
                enable: true,
                authOverrides: {
                    method: hasDatadogApiKeys ? 'apiKey' : 'oauth',
                },
                identifier: '3e129ede6713628d38ed75a084c01129',
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    releaseVersion: version,
                    service: 'weatherwise',
                }
            },
            metadata: {
                name: 'Weatherwise',
            },
            metrics: {
                enable: hasDatadogApiKeys,
            },
        }),
    ],
});
