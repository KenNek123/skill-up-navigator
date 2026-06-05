# Skill-Up Navigator

Career Intelligence Operating System built with React, TypeScript and Vite.

## Core rule

The LLM is not the recommendation engine. The deterministic engine in `src/engine/scoring.ts`
calculates every score from structured inputs, Career DNA, market signals and AI risk signals.
Gemini is used only by `api/parse-cv.ts` to parse and normalize CV inputs.

## Routes

- `/` - mobile-first user dashboard
- `/judge` - methodology, formulas, data sources and reproducibility audit

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server does not run Vercel serverless functions by itself. To test CV parsing locally,
use Vercel CLI:

```bash
cp .env.example .env.local
# add GOOGLE_API_KEY to .env.local
npx vercel dev
```

## Deploy to Vercel

Use the default Vite settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Environment Variables:
  - `GOOGLE_API_KEY`
  - `GEMINI_MODEL` optional, defaults to `gemini-flash-lite-latest`

`vercel.json` rewrites all routes to `index.html`, so `/judge` works after deployment.

If Google returns "high demand", wait a few minutes or try another available Gemini model in
`.env.local`, then restart `npx vercel dev`.
