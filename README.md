# Istanbul Live Events

Open the folder in a local web server (opening `index.html` directly may block its JSON request):

```powershell
cd C:\Users\Amer\Documents\Codex\2026-07-12\hey\outputs\istanbul-events-live
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Updating the live feed

The app fetches `events.json` every five minutes and when the visitor selects **Refresh now**. Update the `updatedAt` value and event records in that file, then deploy the folder to any static host. The board will pick up changes without a browser redeploy.

## Deploy to Netlify with Exa discovery

1. Import this folder as a new Netlify site (or deploy it with the Netlify CLI).
2. In **Project configuration → Environment variables**, create `EXA_API_KEY` and paste the key you supplied. Do not put the key in a file or in the browser code.
3. Deploy. The `refresh-events` Scheduled Function searches Exa every six hours and stores results in Netlify Blobs. The public `event-search` function returns that stored feed to the website.
4. In Netlify’s **Functions** panel, run `refresh-events` once to populate the feed immediately. Scheduled functions execute only in published production deployments.

The dynamic Exa results are marked **new** and intentionally say “Date: check organiser” unless a human confirms the date. This prevents search snippets from being presented as a reliable event date. The original source-checked items remain on the board.

The included event set was source-checked on 12 July 2026. It intentionally excludes unverified aggregator listings and dates that have already passed. For genuine automatic source ingestion, a hosted backend plus approved organiser/API feeds is required; third-party pages cannot be safely or reliably crawled from browser JavaScript.
