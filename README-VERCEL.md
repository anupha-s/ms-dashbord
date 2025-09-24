# Vercel Notes
- Node >= 18 (set via `package.json` engines).
- Build Command: `npm ci && npm run build`
- Output Directory: `dist`
- Do **NOT** commit `node_modules`.
If you hit `Permission denied: node_modules/.bin/vite`, keep `postinstall` chmod script.
