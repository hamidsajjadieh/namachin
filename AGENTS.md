# Nemachin Brick — Base44 Notes

Premium facade-brick showroom (React 18 + Vite 5 + react-router 6). Trilingual:
Persian (default, RTL), English (LTR), Arabic (RTL).

## Run in the sandbox

```sh
docker compose -f docker-compose.base44.yml up -d
# app on http://localhost:3000 (vite dev server, hot reload, polling enabled)
```

- `node_modules` lives in a named volume; deps install automatically on container
  start (`npm install` — lockfile-preserving).
- Vite binds 0.0.0.0:3000; host allowlists are passed through the
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var supplied by the platform.

## Architecture

- **Routing**: `/:lang/*` prefix (`/fa`, `/en`, `/ar`) — language is part of the
  URL; `Shell` in `src/App.jsx` wraps every page in `LangProvider`.
- **i18n**: dictionaries in `src/i18n/{fa,en,ar}.js` (identical key shape).
  `useI18n()` gives `t(key)`, `tr(localizedObject)`, `fmt(number)` (locale-aware
  digits) and `fmtDate(iso)`. Language switcher preserves the current route and
  query string (so catalog filters survive switching).
- **Data**: `src/data/products.js` etc. hold shared records with localized
  `name/description` fields — ready to move to a DB with a translations table.
  Product codes (e.g. `NB-FC-101`) stay Latin in every language; wrap them in
  `.ltr` spans inside RTL text.
- **Client-side persistence** (no backend yet): favorites →
  `nemachin_favs`, inquiries → `nemachin_inquiries`, newsletter →
  `nemachin_newsletter`, chosen language → `nemachin_lang`.
- **Styling**: design tokens in `src/styles/tokens.css`; use CSS logical
  properties (`margin-inline-start` etc.) so RTL/LTR both work without
  duplicate rules.
- **Images**: hotlinked from images.pexels.com via the `px()` helper in
  `src/data/company.js`.

## Verify

- `docker compose -f docker-compose.base44.yml ps` + `curl localhost:3000`.
- Manual: switch languages from a product detail page with filters applied on
  the catalog; check `dir` attribute flips and layout mirrors; test the carousel
  by mouse-drag (desktop) and swipe (mobile).
