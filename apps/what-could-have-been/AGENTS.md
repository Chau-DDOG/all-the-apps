# what-could-have-been

This app is part of a Datadog Apps workspace. Shared guidance lives at the workspace root.

Run locally with `npm run dev -w apps/what-could-have-been`; build with `npm run build -w apps/what-could-have-been`.

Keep secret-dependent work in backend functions and never hardcode credentials.

After changing this app's `package.json` or workspace location, run `npm install` from the workspace root and commit the root `package-lock.json`. Before finishing a workspace or dependency change, run `npm ci --ignore-scripts` from the workspace root. Do not create an app-level lockfile.
