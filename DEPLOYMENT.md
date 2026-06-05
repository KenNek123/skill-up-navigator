# Deploy Skill-Up Navigator to Vercel

## Option 1: Vercel dashboard

1. Import this folder as a new Vercel project.
2. Use these settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add Environment Variables:
   - `GOOGLE_API_KEY`: your Google Gemini API key
   - `GEMINI_MODEL`: optional, defaults to `gemini-flash-lite-latest`
4. Deploy.

## Option 2: Vercel CLI

```bash
npm install
npm run build
vercel
```

`vercel.json` includes an SPA rewrite so `/judge` works after deployment.

## Local API testing

Vite alone does not run `api/parse-cv.ts`. Use Vercel CLI when testing CV upload locally:

```bash
cp .env.example .env.local
# paste your Gemini key into .env.local
npx vercel dev
```
