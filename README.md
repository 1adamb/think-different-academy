**[Čeština](#čeština)** · **[English](#english)**

# Čeština

## Začínáme

Tato složka obsahuje tři části:

- `frontend/`: webová aplikace.
- `backend/`: API.
- `caddy/`: reverzní proxy pro produkci (Tour de Cloud). Lokální vývoj ji nepoužívá.

Spuštění všeho lokálně:

```bash
docker compose up
```

Frontend běží na `http://localhost:3000`, API na `http://localhost:3001/api`. Porty 3000, 3001 a 3306 (MySQL) musí být před spuštěním volné. V Docker Desktopu pro macOS nebo Windows nejdřív zapněte host networking (Settings → Resources → Network → "Enable host networking"); Linux a OrbStack to podporují bez nastavování.

## Nasazení

Push do větve `main` spustí `.github/workflows/deploy.yml`, který nahraje projekt na Tour de Cloud. Před prvním pushem:

1. Přidejte repository secret `TDC_TOKEN` (Settings → Secrets and variables → Actions) s vaším Tour de Cloud tokenem.
2. Otevřete `tourdeapp.yaml` a nahraďte `<slug>` slugem vašeho projektu, ve všech čtyřech řádcích `image:`.

Pak pushněte do `main`.

## Frontend: React (JavaScript, Vite)

Jednostránková aplikace v Reactu postavená na Vite.

Kód je v `frontend/src/`:

- `api.js`: komunikace s backendem (`getProducts`, `createProduct`, `updateProduct`, `deleteProduct`).
- `App.jsx`: hlavní komponenta, drží stav seznamu produktů.
- `ProductForm.jsx`: formulář pro přidání a úpravu.
- `ProductTable.jsx`: vykresluje seznam produktů.
- `index.css`: styly.

`docker compose up` spustí vývojový server Vite s live reloadem: úprava kterékoli komponenty se v prohlížeči projeví bez ručního refreshe.

Spuštění mimo Docker: `cd frontend && npm install && npm run dev -- --port 3000`. Backend volá na `http://localhost:3001/api` (nastaveno v `.env` jako `VITE_API_URL`).

## Backend: TypeScript Express

API v Express s MySQL (přes `mysql2`). Celá aplikace je v jediném souboru `backend/src/index.ts`: routy, databázové dotazy i start na jednom místě.

`docker compose up` ho spustí přes `tsx watch`, který se restartuje po každé změně: úprava `src/index.ts` se projeví okamžitě.

Spuštění mimo Docker: nejdřív spusťte MySQL příkazem `docker compose up -d mysql`, pak `npm install` a `npm run dev`. API poslouchá na `http://localhost:3001/api/product`. Připojení k databázi se nastavuje proměnnou `DATABASE_URL` v `.env`.

# English

## Getting started

This folder has three parts:

- `frontend/`: the web app.
- `backend/`: the API.
- `caddy/`: the reverse proxy used in production (Tour de Cloud). Local development skips it.

Run everything locally:

```bash
docker compose up
```

The frontend is at `http://localhost:3000`, the API at `http://localhost:3001/api`. Ports 3000, 3001 and 3306 (MySQL) must be free before you start. On Docker Desktop for macOS or Windows, turn on host networking first (Settings → Resources → Network → "Enable host networking"); Linux and OrbStack support it by default.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which uploads the project to Tour de Cloud. Before the first push:

1. Add a repository secret named `TDC_TOKEN` (Settings → Secrets and variables → Actions) with your Tour de Cloud token.
2. Open `tourdeapp.yaml` and replace `<slug>` with your project's slug in all four `image:` lines.

Then push to `main`.

## Frontend: React (JavaScript, Vite)

A React single-page app built with Vite.

Code lives in `frontend/src/`:

- `api.js`: talks to the backend (`getProducts`, `createProduct`, `updateProduct`, `deleteProduct`).
- `App.jsx`: the top-level component, holds the product list state.
- `ProductForm.jsx`: the add/edit form.
- `ProductTable.jsx`: renders the product list.
- `index.css`: styling.

`docker compose up` runs the Vite dev server with live reload: edit any component and the browser updates without a manual refresh.

To run it outside Docker: `cd frontend && npm install && npm run dev -- --port 3000`. It calls the backend at `http://localhost:3001/api` by default (set in `.env` as `VITE_API_URL`).

## Backend: TypeScript Express

An Express API with MySQL (via `mysql2`). The whole app is one file, `backend/src/index.ts`: routes, database queries and startup all in one place.

`docker compose up` runs it with `tsx watch`, which restarts on every change: edit `src/index.ts` and it picks up the change immediately.

To run it outside Docker: start MySQL with `docker compose up -d mysql`, then `npm install` and `npm run dev`. The API listens on `http://localhost:3001/api/product`. The database connection comes from `DATABASE_URL` in `.env`.
