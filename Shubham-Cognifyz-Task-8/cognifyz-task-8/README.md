# Shubham's Operations Room — Cognifyz Task 8

An Express operations dashboard demonstrating server-side middleware, a background job worker, and a small TTL cache.

## Task coverage

- Request logging middleware with method, path, status, and duration
- JSON body parsing with a request-size limit
- In-memory background queue with a worker loop and job states
- `202 Accepted` response for queued jobs
- Cache with TTL, cache-hit reporting, and expired-entry cleanup
- Dashboard that refreshes live from the API

## Run

```bash
npm install
npm start
```

Open `http://localhost:3008`.

**Owner:** Shubham