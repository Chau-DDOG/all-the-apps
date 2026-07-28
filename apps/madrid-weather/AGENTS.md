# madrid-weather

This is a Datadog App scaffolded for the all-the-apps workspace. Shared guidance lives at the workspace root.

## Read relevant guides

- Embedded app context / routing / storage: ../../docs/agents/runtime-context.md
- Backend functions (*.backend.ts): ../../docs/agents/backend-functions.md
- Local dev / auth / build / upload: ../../docs/agents/build-upload-auth.md
- Workspace overview: ../../AGENTS.md

## This app

- This app owns its unique `apps.identifier` in `./vite.config.ts` - never share or copy it.
- Run locally: `npm run dev -w apps/madrid-weather` from the workspace root or `npm run dev` from this directory.
- Upload: `npm run upload -w apps/madrid-weather`.

## Rules

- Keep secret-dependent work and privileged API calls in backend functions.
- Never hardcode API keys, app keys, OAuth tokens, passwords, or third-party credentials.
- Prefer the generated npm scripts; this workspace uses npm.
- After changing this app's `package.json` or workspace location, run `npm install` from the workspace root and commit the root `package-lock.json`.
- Before finishing a workspace or dependency change, run `npm ci --ignore-scripts` from the workspace root. Do not create an app-level lockfile.
