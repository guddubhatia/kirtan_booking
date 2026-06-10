# SSBBN Kirtan Panel — Backend

REST API for the Expo app, built with **Express + SQLite (better-sqlite3) + JWT**.
Implements exactly the endpoints the app calls in `services/api.ts` and
`services/notifications.ts`.

## Quick start

```bash
cd server
cp .env.example .env          # then edit JWT_SECRET + ADMIN_PASSWORD
npm install
npm run seed                  # creates the admin user from .env
npm start                     # http://localhost:4000
```

`npm run dev` runs with `node --watch` (auto-restart on change).

## Admin login

The seed script creates an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
(default `admin@ssbbn.local` / `changeme123`). Re-run `npm run seed` after changing
`ADMIN_PASSWORD` to rotate it.

## Endpoints

| Method | Path                            | Auth  | Purpose                          |
|--------|---------------------------------|-------|----------------------------------|
| GET    | `/api/health`                   | —     | Health check                     |
| POST   | `/api/auth/login`               | —     | `{email,password}` → `{email,role,token}` |
| GET    | `/api/events`                   | —     | List events                      |
| GET    | `/api/events/:id`               | —     | One event                        |
| POST   | `/api/events`                   | admin | Create event                     |
| PUT    | `/api/events/:id`               | admin | Update event (partial)           |
| DELETE | `/api/events/:id`               | admin | Delete event                     |
| GET    | `/api/announcements`            | —     | List announcements               |
| POST   | `/api/announcements`            | admin | Create announcement              |
| DELETE | `/api/announcements/:id`        | admin | Delete announcement              |
| POST   | `/api/notifications/register`   | —     | Device registers its push token  |
| GET    | `/api/notifications/tokens`     | admin | All stored push tokens           |
| POST   | `/send-notifications`           | —     | Relay `{messages:[…]}` to Expo push (matches the app) |
| POST   | `/api/notifications/broadcast`  | admin | `{title,body}` → push to all stored tokens (recommended) |

Public reads (events, announcements) need no auth — the public client app uses them.
Writes require `Authorization: Bearer <token>`.

## Connecting the app

Set `EXPO_PUBLIC_BACKEND_URL` in the **app** `.env` (repo root):

- **Web / iOS simulator:** `http://localhost:4000`
- **Android emulator:** `http://10.0.2.2:4000`
- **Physical device (Expo Go):** `http://<your-computer-LAN-IP>:4000`
- **Production:** your deployed HTTPS URL

For web, the server also serves the exported build from `../dist` if present, so
the web app runs same-origin (no URL needed). Rebuild it with `npx expo export`.

## Data

SQLite file at `server/kirtan.db` (configurable via `DB_PATH`). It's gitignored.
Back it up by copying that file.

## Notes / not included

- `/send-notifications` is unauthenticated to match the app's current call (the app
  sends no token there). If you expose this publicly, prefer the authenticated
  `/api/notifications/broadcast` and drop `/send-notifications`.
- No rate limiting / HTTPS termination — put this behind a reverse proxy (nginx/Caddy)
  in production.
