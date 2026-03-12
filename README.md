# ChatGPT Archive

A client-side web app to ingest, browse, search, and export your ChatGPT conversation history. No backend required except a lightweight serverless function for Notion API proxying.

## Tech stack

- React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui
- Zustand, Dexie.js (IndexedDB), JSZip, React Router v6

## Development

```bash
npm install
npm run dev
```

## Testing Phase 1 (Import)

1. Export your data from ChatGPT (Settings → Data → Export data) to get a ZIP with `conversations.json`, or
2. Create a test ZIP: put `fixtures/sample-conversations.json` inside a ZIP and rename the file to `conversations.json` (must be at the root of the ZIP), then drop it on the app.

You should see a progress bar and then "X conversations imported".

## Build

```bash
npm run build
npm run preview
```
