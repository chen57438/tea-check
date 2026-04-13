# TeaCheck AI

TeaCheck AI is a React + Vite + Tailwind web app for behavior-driven relationship diagnostics.

## Local Run

```bash
npm install
npm run dev
```

## Static Build

```bash
npm run build
```

The static output is generated in `dist/`.

## Cloudflare Pages

This project is now structured for a safer Cloudflare Pages deployment:

- The React frontend is still built with Vite into `dist/`.
- AI requests are sent to `functions/api/analyze.ts`.
- The Gemini API key stays on the server side as a Cloudflare secret.

### Recommended deploy flow

1. Push this repository to GitHub.
2. In Cloudflare dashboard, open `Workers & Pages`.
3. Create a new `Pages` project and connect the GitHub repository.
4. Use these build settings:

   - Build command: `npm run build`
   - Build output directory: `dist`

5. In `Settings -> Environment variables`, add:

   - `GEMINI_API_KEY` as a Secret
   - `GEMINI_MODEL` as an optional Variable, for example `gemini-2.5-flash`

6. Redeploy the project.

### Local development notes

The frontend can be built locally with:

```bash
npm run build
```

For local Cloudflare-style function testing, create `.dev.vars` from `.dev.vars.example` and run the app with Wrangler if you want the `/api/analyze` function available locally.

### Security model

This version is safer than a pure static deployment because:

1. The browser no longer sends requests directly to Gemini.
2. The Gemini API key lives in Cloudflare Pages Secrets.
3. Visitors only call your `/api/analyze` endpoint.

## GitHub Pages Note

GitHub Pages is still fine for a static demo build, but it is not a safe place to expose your own Gemini API key in a public AI product.
