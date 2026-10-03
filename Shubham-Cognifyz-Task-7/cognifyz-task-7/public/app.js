const form = document.querySelector("#searchForm");
const cityInput = document.querySelector("#city");
const result = document.querySelector("#result");
const errorBox = document.querySelector("#error");
const hint = document.querySelector("#formHint");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  result.hidden = true; errorBox.hidden = true; hint.textContent = "Asking the weather service...";
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
    const weather = payload.data;
    document.querySelector("#place").textContent = `${weather.city}, ${weather.country}`;
    document.querySelector("#time").textContent = `Local time zone · ${weather.timezone}`;
    document.querySelector("#temperature").textContent = Math.round(weather.current.temperature_2m);
    document.querySelector("#humidity").textContent = `${weather.current.relative_humidity_2m}%`;
    document.querySelector("#wind").textContent = `${Math.round(weather.current.wind_speed_10m)} km/h`;
    document.querySelector("#coordinates").textContent = `${weather.coordinates.latitude.toFixed(2)}, ${weather.coordinates.longitude.toFixed(2)}`;
    document.querySelector("#cacheBadge").textContent = payload.meta.cached ? "served from cache" : "fresh result";
    result.hidden = false; hint.textContent = "";
  } catch (error) { errorBox.textContent = error.message; errorBox.hidden = false; hint.textContent = ""; }
});