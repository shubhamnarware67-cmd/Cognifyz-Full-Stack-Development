const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3007;
const requests = new Map();
const cache = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

app.use(express.json());
app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip || "local";
  const record = requests.get(key) || { count: 0, startedAt: now };
  if (now - record.startedAt > WINDOW_MS) { record.count = 0; record.startedAt = now; }
  record.count += 1;
  requests.set(key, record);
  res.set("X-RateLimit-Limit", MAX_REQUESTS);
  res.set("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - record.count));
  if (record.count > MAX_REQUESTS) return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  next();
});
app.use(express.static(path.join(__dirname, "public")));

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(7000), headers: { "User-Agent": "Shubhams-weather-desk/1.0" } });
  if (!response.ok) throw new Error(`External service returned ${response.status}.`);
  return response.json();
}
function cached(key) {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) { cache.delete(key); return null; }
  return item.value;
}
function saveCache(key, value) { cache.set(key, { value, expiresAt: Date.now() + 5 * 60_000 }); return value; }

app.get("/api/weather", async (req, res) => {
  const city = String(req.query.city || "").trim();
  if (city.length < 2 || city.length > 50) return res.status(400).json({ error: "Enter a city name between 2 and 50 characters." });
  const key = city.toLowerCase();
  const existing = cached(key);
  if (existing) return res.json({ data: existing, meta: { cached: true } });
  try {
    const location = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!location.results?.length) return res.status(404).json({ error: `I couldn't find a city named "${city}".` });
    const place = location.results[0];
    const weather = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
    const data = { city: place.name, country: place.country, timezone: weather.timezone, current: weather.current, coordinates: { latitude: place.latitude, longitude: place.longitude } };
    res.json({ data: saveCache(key, data), meta: { cached: false } });
  } catch (error) {
    console.error("weather provider error:", error.message);
    res.status(502).json({ error: "The weather provider is taking a moment. Please try again shortly." });
  }
});
app.get("/api/health", (req, res) => res.json({ ok: true, provider: "Open-Meteo", cachedCities: cache.size }));
app.listen(port, () => console.log(`Shubham's weather desk is running at http://localhost:${port}`));