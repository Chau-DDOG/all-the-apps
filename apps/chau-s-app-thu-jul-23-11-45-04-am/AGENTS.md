# chau-s-app-thu-jul-23-11-45-04-am

This is a Datadog App scaffolded with `npm create @datadog/apps`.

Datadog Apps are React + TypeScript applications bundled by Vite and embedded in the Datadog product experience. Frontend code runs in the browser. Backend functions live in `*.backend.*` files and execute through Datadog's managed runtime.

## Read relevant guides

- For embedded Datadog app context, routing, navigation, browser storage, or parent-page constraints, read `docs/agents/runtime-context.md`.
- For writing backend functions in `*.backend.ts` or `*.backend.js` files, or for calling backend functions from frontend code, read `docs/agents/backend-functions.md`.
- For local development, auth mode, build scripts, upload scripts, or Datadog site config, read `docs/agents/build-upload-auth.md`.

## General rules

- Keep privileged Datadog API calls, third-party calls, and secret-dependent work in backend functions.
- Do not hardcode API keys, app keys, OAuth tokens, passwords, or third-party credentials.
- Prefer the generated npm scripts in `package.json`; this scaffold uses npm.
- Before inventing package imports or component props, inspect installed package exports and TypeScript definitions.

## Broader Datadog Apps guidance

- For general Datadog Apps workflows such as scaffolding, OAuth/key setup, `.env.local`, CI/CD, upgrades, DDSQL, Connections, Workflow Automation, upload troubleshooting, or publishing behavior, use the Datadog Apps agent skill when it is available.
- Use Playwright when available for browser validation, including screenshots for visual design changes.
- Use the Datadog `pup` CLI (https://github.com/DataDog/pup) when available for Datadog API inspection and troubleshooting.
- Use Datadog MCP tools when available for Datadog-specific lookup, diagnostics, or API-backed workflows.

Primary docs: https://docs.datadoghq.com/actions/datadog_apps/
