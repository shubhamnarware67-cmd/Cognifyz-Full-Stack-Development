# OAuth implementation note

This task uses Open-Meteo, a public weather provider that does not require an API key. That keeps the demo easy to run and avoids putting a credential into the repository.

For a provider that requires OAuth, the same `/api/weather` boundary should call a server-side client with:

1. A short-lived access token stored outside source control (environment secret).
2. A refresh flow handled on the server, never in browser JavaScript.
3. A `Bearer <access-token>` header sent only from the server to the provider.
4. A provider-specific error mapper that hides upstream secrets from client responses.

The app already demonstrates the other advanced API concerns: bounded input, request rate limiting, five-minute caching, timeouts, and a clear `502` response when the third-party service is unavailable.