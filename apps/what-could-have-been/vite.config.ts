import { datadogVitePlugin } from '@datadog/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import rootManifest from '../../package.json';
import { version } from './package.json';

const hasDatadogApiKeys = Boolean((process.env.DD_API_KEY || process.env.DATADOG_API_KEY) && (process.env.DD_APP_KEY || process.env.DATADOG_APP_KEY));
export default defineConfig({ base: './', build: { sourcemap: true }, plugins: [react(), datadogVitePlugin({ logLevel: 'debug', auth: { site: process.env.DD_SITE || rootManifest.datadogApps?.site || 'datadoghq.com', apiKey: process.env.DD_API_KEY, appKey: process.env.DD_APP_KEY }, apps: { enable: true, authOverrides: { method: hasDatadogApiKeys ? 'apiKey' : 'oauth' }, identifier: 'fa1fa4e2858f24ddcc8189066f49de2b' }, errorTracking: { enable: hasDatadogApiKeys, sourcemaps: { minifiedPathPrefix: '/', releaseVersion: version, service: 'what-could-have-been' } }, metadata: { name: 'what-could-have-been' }, metrics: { enable: hasDatadogApiKeys } })] });
