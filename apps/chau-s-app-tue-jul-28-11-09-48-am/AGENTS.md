# chau-s-app-tue-jul-28-11-09-48-am

Madrid 3-week weather forecast + dressing guide + packing list for a 2-week trip starting Aug 4, 2026.

This app is part of a Datadog Apps workspace. Shared guidance lives at the workspace root.

## Read relevant guides
- Embedded app context / routing / storage: ../../docs/agents/runtime-context.md
- Backend functions (*.backend.ts): ../../docs/agents/backend-functions.md
- Local dev / auth / build / upload: ../../docs/agents/build-upload-auth.md
- Workspace overview: ../../AGENTS.md

## This app
- This app owns its unique `apps.identifier` in `./vite.config.ts` — never share or copy it.
- Run locally: `npm run dev -w apps/chau-s-app-tue-jul-28-11-09-48-am` (from the workspace root) or `npm run dev` (from this directory).
- Upload: `npm run upload -w apps/chau-s-app-tue-jul-28-11-09-48-am`.
- Weather data is fetched via `src/weather.backend.ts` from the Open-Meteo API (no auth required).
- Trip dates are hardcoded to Aug 4–17, 2026 per the original request.
- The Open-Meteo free tier returns up to 16 forecast days; trip days beyond that window fall back to typical Madrid August averages.

## Rules
- Keep weather API calls in backend functions (`weather.backend.ts`).
- Never hardcode API keys, app keys, or OAuth tokens.
- Prefer the generated npm scripts; this workspace uses npm.
- After changing this app's `package.json` or workspace location, run `npm install` from the workspace root and commit the root `package-lock.json`.
- Before finishing a workspace or dependency change, run `npm ci --ignore-scripts` from the workspace root. Do not create an app-level lockfile.
