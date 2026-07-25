# chau-s-app-sat-jul-25-2-54-22-pm

This app is part of a Datadog Apps workspace. Shared guidance lives at the workspace root.

## Read relevant guides
- Embedded app context / routing / storage: ../../docs/agents/runtime-context.md
- Backend functions (*.backend.ts): ../../docs/agents/backend-functions.md
- Local dev / auth / build / upload: ../../docs/agents/build-upload-auth.md
- Workspace overview: ../../AGENTS.md

## This app
- This app owns its unique `apps.identifier` in `./vite.config.ts` — never share or copy it.
- Run locally: `npm run dev -w apps/chau-s-app-sat-jul-25-2-54-22-pm`.
- Upload: `npm run upload -w apps/chau-s-app-sat-jul-25-2-54-22-pm`.

## Rules
- Keep app-specific code inside this directory.
- Never hardcode API keys, app keys, or OAuth tokens.
- Prefer the generated npm scripts; this workspace uses npm.
- After changing this app's package manifest, run `npm install` at the workspace root and commit the root lockfile.
