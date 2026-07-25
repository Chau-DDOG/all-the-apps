# chau-s-app-sat-jul-25-8-45-55-am

This is a Datadog App scaffolded with `npm create @datadog/apps`.

Datadog Apps are React + TypeScript applications bundled by Vite and embedded in the Datadog product experience. Frontend code runs in the browser. Backend functions live in `*.backend.*` files and execute through Datadog's managed runtime.

## Read relevant guides

- For embedded Datadog app context, routing, navigation, browser storage, or parent-page constraints, read `docs/agents/runtime-context.md`.
- For writing backend functions in `*.backend.ts` or `*.backend.js` files, or for calling backend functions from frontend code, read `docs/agents/backend-functions.md`.
- For local development, auth, deploy, publish, `DD_APPS_PUBLISH`, or deploy troubleshooting, read `docs/agents/build-upload-auth.md`.
- For GitHub Actions CI/CD setup, read `docs/agents/cicd.md`.
- For choosing between DDSQL and Action Catalog, configuring Connections, or querying app datastores, read `docs/agents/data.md`.
- For triggering or polling a Workflow Automation workflow from a backend function, read `docs/agents/workflow-automation.md`.
- For upgrading `@datadog/vite-plugin` or `@datadog/action-catalog`, read `docs/agents/upgrading.md`.

## General rules

- Keep privileged Datadog API calls, third-party calls, and secret-dependent work in backend functions.
- Do not hardcode API keys, app keys, OAuth tokens, passwords, or third-party credentials.
- Prefer the generated npm scripts in `package.json`; this scaffold uses npm.
- Before inventing package imports or component props, inspect installed package exports and TypeScript definitions.

## Broader Datadog Apps guidance

- For scaffolding a new app from scratch, use the Datadog Apps agent skill when it is available.
- Use Playwright when available for browser validation, including screenshots for visual design changes.
- Use the Datadog `pup` CLI (https://github.com/DataDog/pup) when available for Datadog API inspection and troubleshooting.
- Use Datadog MCP tools when available for Datadog-specific lookup, diagnostics, or API-backed workflows.

Primary docs: https://docs.datadoghq.com/actions/datadog_apps/
