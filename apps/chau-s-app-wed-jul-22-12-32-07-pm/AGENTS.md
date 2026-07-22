# chau-s-app-wed-jul-22-12-32-07-pm

This is a Datadog App scaffolded with `npm create @datadog/apps`.

Datadog Apps are React + TypeScript applications bundled by Vite and embedded in the Datadog product experience.

## General rules

- Keep privileged API calls and secret-dependent work in backend functions.
- Do not hardcode credentials.
- Prefer the generated npm scripts in `package.json`.
- Use Playwright for browser validation of visual changes.