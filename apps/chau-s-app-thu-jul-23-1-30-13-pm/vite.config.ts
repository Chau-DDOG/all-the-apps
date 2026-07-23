import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import rootManifest from '../../package.json';
import { version } from './package.json';

const hasDatadogApiKeys = Boolean(
    (process.env.DD_API_KEY || process.env.DATADOG_API_KEY) &&
        (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY),
);
const datadogSite = process.env.DD_SITE || rootManifest.datadogApps?.site || 'datad0g.com';

// The plugin also reads DD_SITE directly and treats an empty sandbox value as invalid.
process.env.DD_SITE = datadogSite;

export default defineConfig({
    base: './',
    build: { sourcemap: true },
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
                authOverrides: { method: hasDatadogApiKeys ? 'apiKey' : 'oauth' },
                identifier: '8c1b23a8780104e8127362943509d0ad',
            },
            errorTracking: {
                enable: hasDatadogApiKeys,
                sourcemaps: {
                    minifiedPathPrefix: '/',
                    releaseVersion: version,
                    service: 'little-legs-big-alps',
                },
            },
            metadata: { name: 'Little Legs, Big Alps' },
            metrics: { enable: hasDatadogApiKeys },
        }),
    ],
});
