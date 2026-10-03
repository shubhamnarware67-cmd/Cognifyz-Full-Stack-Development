# Shubham's Weather Desk — Cognifyz Task 7

A weather lookup app that integrates two Open-Meteo endpoints through a server-side API boundary.

## Task coverage

- External geocoding and weather API integration
- Server-side provider calls with timeout and upstream error handling
- Per-IP rate limiting with response headers
- Five-minute in-memory response cache
- Helpful 400, 404, 429, and 502 responses
- OAuth approach documented in `docs/oauth-notes.md` without exposing fake credentials

## Run

```bash
npm install
npm start
```

Open `http://localhost:3007`.

**Owner:** Shubham