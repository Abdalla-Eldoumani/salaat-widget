// Geolocation is handled from the frontend using @tauri-apps/plugin-http's
// fetch API (scoped to https://ipapi.co/* in capabilities). This avoids adding
// reqwest as a direct Rust dependency. The useGeolocation hook calls the API
// and returns a LocationResult.
