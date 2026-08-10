# TRUMP FILE — v0.4

A mobile-first PWA for a sourced, satirical archive of Donald Trump's second presidential term.

## What is working
- Database-driven live archive counter
- Today / 7-day / 30-day counts
- Search and filters
- Receipts Only mode
- Random entry
- **Trump Defense Mode** with common talking-point shortcuts + buzzer
- Campaign Promise Reality Check
- Trump vs. Trump section
- Primary/independent source-tier labels
- Offline-capable PWA shell
- Daily source-discovery workflow for GitHub Actions
- Federal Register API ingestion
- White House Presidential Actions feed ingestion
- Candidate queue so raw discoveries do **not** inflate the verified counter

## Why the counter is editorial, not a scrape
The large number should remain defensible. A speech containing 20 sentences is not automatically 20 incidents.
`data/candidates.json` is the machine-discovered inbox. `data/entries.json` is the published, reviewed archive.
The UI counter is calculated only from the published archive.

## Run locally
    python3 -m http.server 8080
Open http://localhost:8080

## Turn on real daily updating
1. Create a GitHub repository and put this project in it.
2. Enable GitHub Actions.
3. The included `.github/workflows/daily-update.yml` runs every day and updates the candidate queue.
4. Enable GitHub Pages (or deploy to Netlify/Vercel/Cloudflare Pages) to make the PWA reachable by iPhone.
5. Reviewed candidates can be promoted into `entries.json`; after deployment the counter updates automatically.

## Adding hundreds or thousands of records
No UI change is necessary. Add records matching the `entries.json` schema. Search, counters, Promise mode, and Trump-vs-Trump operate from that data.

## Editorial standard
- Satire is explicitly presentation.
- Factual assertions require evidence.
- Prefer primary source + independent corroboration when possible.
- Include material context that could change the meaning.
- Keep favorable or exculpatory facts when relevant.
- Update court entries after appeals.
- Mark promises kept when they were kept.
- Never manufacture an entry simply to increase the counter.


## v0.4: Full historical-source pipeline

This version separates two important numbers:

1. **Verified Archive Entries** — reviewed, sourced entries that are allowed to increment the satirical counter.
2. **Primary-source records indexed** — the much larger research corpus from White House remarks/actions and Federal Register presidential documents.

### First deployment
After putting this repository on GitHub:

1. Go to **Settings → Pages → Source: GitHub Actions**.
2. Open **Actions → Historical source backfill → Run workflow**.
3. The crawler builds `data/source_archive.json` and fills the review queue.
4. `Deploy Trump File to GitHub Pages` publishes the app.
5. Run reviewed candidate records through the editorial process into `data/entries.json`.
6. The daily discovery workflow keeps finding newer records afterward.

The historical crawler is deliberately source-first. It can index hundreds or thousands of primary records without pretending that every official document is a “dumb thing.” That judgment belongs only in reviewed public entries.
