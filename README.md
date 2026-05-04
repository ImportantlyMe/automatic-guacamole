# Diana James Measurement App

A Next.js Progressive Web App for capturing dressmaker's measurements on iPhone.
No backend, no auth — sessions are stored in the browser's `localStorage`.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- `pdf-lib` for PDF generation
- Service worker + manifest for "Add to Home Screen" PWA install

## Develop

```
npm install
npm run dev
```

Open <http://localhost:3000> on your phone (same Wi-Fi) for the closest test
to the production experience. The service worker only registers in production
builds (`npm run build && npm start`).

## Deploy

Push to GitHub and import the repo on Vercel. No environment variables
required.

## Routes

- `/` — list of saved sessions
- `/session/new` — metadata form
- `/session/[id]/m/[n]` — single measurement entry (n = 3..42, 45..50)
- `/session/[id]/review` — review + export PDF / CSV

## Storage shape

Sessions persist under `localStorage["dj-sessions"]` as a JSON array. See
`lib/types.ts`.
