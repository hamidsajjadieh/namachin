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
- **Admin CMS backend** (`api` service, Express + better-sqlite3): binds :4000
  inside compose; Vite proxies `/api/*` to it (env `API_PROXY_TARGET`). SQLite DB
  and uploaded images persist in the `api_data` named volume (`/data`).
- CMS login: `/:lang/admin` — default seed user `admin` / `admin1234`
  (change it via the admin's Users page). Seed content (12 products, 12 nested
  categories, 3 news, media folders) runs on first boot; delete
  `/data/nemachin.db` + restart `api` to re-seed.

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
- **Client-side persistence**: favorites →
  `nemachin_favs`, inquiries (offline fallback only) →
  `nemachin_inquiries`, newsletter → `nemachin_newsletter`, chosen language →
  `nemachin_lang`. Inquiry forms now POST to the backend: product inquiries →
  `/api/public/order-request` (admin "Order Requests"), general contact →
  `/api/public/message` (admin "Consultations & Messages").
- **Admin CMS** (`src/admin/`): routes at `/:lang/admin/*` with its own chrome
  (no site header/footer); sidebar sits on the right for fa/ar, left for en
  (RTL-aware flex). Auth token → `namadmin_token` in localStorage, 7-day
  sessions. CMS dictionary in `src/i18n/admin-dict.js`; styles in
  `src/styles/admin.css`.
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
