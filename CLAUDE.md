# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step. Open `index.html` directly or serve with:

```bash
npx serve .
```

There are no tests, no linter config, and no package.json. All JS is loaded via `<script>` tags in `index.html`.

## Code guidelines

### HTML
- Semantic tags (`<section>`, `<header>`, `<nav>`, `<button>`, etc.)
- `data-*` attributes for JS hooks (`data-action`, `data-nav`, `data-screen-id`, etc.)

### CSS
- BEM methodology — block, element (`__`), modifier (`--`)
- Mobile-first; breakpoints live in `src/css/responsive/breakpoints.css`
- Font: IBM Plex Sans (loaded from Google Fonts in `index.html`)
- All CSS variables in `src/css/colors/variables.css`
- `src/css/main.css` is the single import entry; add new files there

### JavaScript
- Functional style, no classes
- Each module is an IIFE that exports one object to `window.JustJazz*`
- All constants go in `src/js/constants.js` → `window.JUST_JAZZ`
- Scripts are loaded in dependency order in `index.html` — constants first, `app.js` last

## Architecture

### Screen routing
All screens are `<section data-screen-id="...">` elements in `index.html`, hidden by default. `showScreen(screenId)` in `app.js` toggles `hidden` / `screen--active`. The active screen id is mirrored on `document.body` as `data-screen`.

Routes defined in `JUST_JAZZ.ROUTES`: `home`, `playlist`, `playing`, `search`, `queue`, `settings`.

### Module hierarchy

```
constants.js        → JUST_JAZZ (routes, colors, mood sections, rain sounds)
youtube-client.js   → JustJazzYouTubeClient  (wraps YT IFrame API — main music player)
rain-player.js      → JustJazzRainPlayer     (second hidden YT player for ambient rain)
player.js           → JustJazzPlayer         (playlist state + playback, wraps YTClient)
now-playing-bar.js  → JustJazzNowPlayingBar  (fixed mini bar + rain picker dropdown)
playing.js          → JustJazzPlaying        (full player screen UI + state change listener)
home.js             → JustJazzHome
playlist.js         → JustJazzPlaylist
search.js           → JustJazzSearch
queue.js            → JustJazzQueue
toast.js            → JustJazzToast
settings.js         → JustJazzSettings
app.js              → (no export) — orchestrator, wires all modules together
```

### Data flow
1. `app.js` fetches `src/data/seed.json` at startup and stores `tracks[]` in closure scope.
2. `tracks[]` is passed to every screen module that needs it.
3. `seed.json` is **never written to disk** — all runtime mutations are in-memory only.

### Track data schema
```json
{
  "id": "uuid-v4",
  "name": "string",
  "youtubeId": "youtube-video-id",
  "genres": ["string"],
  "category": "blues | jazz | ..."
}
```
- `category` drives the main mood cards on the home screen.
- `genres[]` drives the sub-mood pills (grouped by `JUST_JAZZ.MOOD_SECTIONS`).

### YouTube audio
Two hidden `YT.Player` instances (1×1 px) are created inside `onYouTubeIframeAPIReady` in `youtube-client.js`, which then calls `JustJazzRainPlayer.onAPIReady()` to create the second player. The IFrame API script is the last `<script>` tag in `index.html`, so `onYouTubeIframeAPIReady` fires after all modules are loaded.

### Play/pause state sync
`playing.js` registers the sole `setOnStateChange` callback via `JustJazzPlayer.setOnStateChange`. All play/pause icon updates, rain sync (`JustJazzRainPlayer.play/pause`), progress interval, and now-playing-bar visibility are driven from this single callback.

### Settings / volume
`settings.js` listens to range slider `input` events and calls:
- `JustJazzYouTubeClient.setVolume(val)` for music (default 100)
- `JustJazzRainPlayer.setVolume(val)` for rain (default 50, set via `onReady`)
