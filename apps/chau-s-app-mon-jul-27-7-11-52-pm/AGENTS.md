# chau-s-app-mon-jul-27-7-11-52-pm

This is a Datadog App scaffolded with `npm create @datadog/apps`.

Datadog Apps are React + TypeScript applications bundled by Vite and embedded in the Datadog product experience.

## General rules

- Keep privileged API calls and secret-dependent work in backend functions.
- Do not hardcode credentials.
- Prefer the generated npm scripts in `package.json`.
- Use Playwright for browser validation of visual changes.
- After changing this app's `package.json` or workspace location, run `npm install` from the workspace root and commit the root `package-lock.json`.
- Before finishing a workspace or dependency change, run `npm ci --ignore-scripts` from the workspace root. Do not create an app-level lockfile.