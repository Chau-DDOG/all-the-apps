# third-place-game

This app is part of a Datadog Apps workspace. Shared guidance lives at the workspace root.

## Read relevant guides
- Embedded app context / routing / storage: ../../docs/agents/runtime-context.md
- Backend functions (*.backend.ts): ../../docs/agents/backend-functions.md
- Local dev / auth / build / upload: ../../docs/agents/build-upload-auth.md
- Workspace overview: ../../AGENTS.md

## This app
- This app owns its unique `apps.identifier` in `./vite.config.ts` — never share or copy it.
- Run locally: `npm run dev -w apps/third-place-game` (from the workspace root) or `npm run dev` (from this directory).
- Upload: `npm run upload -w apps/third-place-game`.

## Rules
- Keep secret-dependent work and privileged API calls in backend functions.
- Never hardcode API keys, app keys, or OAuth tokens.
- Prefer the generated npm scripts; this workspace uses npm.
