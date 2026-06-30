# SSBBN Kirtan Panel — Production Deployment Guide (Firebase)

> **Architecture: Full Firebase (serverless).** No Express server, no PostgreSQL, no Render, no Neon.
> The Expo app talks **directly** to Firebase: **Authentication** (admin login) + **Cloud Firestore**
> (events / announcements / push tokens). The web build is hosted on **Firebase Hosting**. Android
> apps (optional) are built with EAS and use the same Firebase project.

```
                          ┌─────────────────────────────────────────┐
   Android APK (admin)  ──┤  Firebase project (free "Spark" plan)    │
   Android APK (client) ──┤   • Firebase Authentication (admins)     │
   Browser (web app,    ──┤   • Cloud Firestore  (events/anns/tokens)│
   Firebase Hosting)      │   • Firebase Hosting (the web build)     │
                          └─────────────────────────────────────────┘
```

App + config live in the `kirtan-booking/` subdirectory (note the space in the repo root path).
Run all `firebase` and `expo` commands from **inside `kirtan-booking/`**.

---

## 0. Key facts

| Thing | Value |
|-------|-------|
| Auth | Firebase Authentication, email/password. Any signed-in user is treated as an admin (`firestore.rules`). |
| Database | Cloud Firestore — collections `events`, `announcements`, `pushTokens`. No schema/migration needed. |
| Web frontend | Expo SDK 56 web export → `dist/`, served by **Firebase Hosting**. |
| Mobile (optional) | EAS Android APKs (`client` / `admin` profiles). |
| Config delivery | `EXPO_PUBLIC_FIREBASE_*` env vars are **inlined into the JS bundle at build time**. The web API key is **not secret** — Firestore rules + Auth enforce access. |
| Security rules | `kirtan-booking/firestore.rules` — public read for events/announcements, admin-only writes. |
| Push notifications | Mobile only. The admin app reads tokens from Firestore and posts directly to Expo's push API. |

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** → name it (e.g. `ssbbn-kirtan`). Disable Google Analytics (not needed). Stay on the free **Spark** plan.
2. **Add a Web app:** Project Overview → click the **`</>`** (Web) icon → register an app (nickname `ssbbn-web`). Copy the `firebaseConfig` values — these become your `EXPO_PUBLIC_FIREBASE_*` env vars (see §4).
3. **Enable Authentication:** Build → Authentication → **Get started** → **Sign-in method** → enable **Email/Password** → Save.
4. **Create your admin user:** Authentication → **Users** → **Add user** → enter the admin email + a strong password → Add. *(This replaces the old `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars — admins are created here, in the console.)*
5. **Create the Firestore database:** Build → Firestore Database → **Create database** → **Start in production mode** → pick a location close to your users (e.g. `asia-south1` Mumbai) → Enable. *(Our security rules are deployed in §5 — don't worry about the default rules.)*

---

## 2. Install tooling (one time)

```bash
npm install -g firebase-tools     # the Firebase CLI
firebase login                    # opens a browser to authenticate
```

---

## 3. Point the repo at your project

Edit `kirtan-booking/.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your real
project id (shown in Firebase console → Project settings → Project ID), **or** run from
inside `kirtan-booking/`:

```bash
firebase use --add        # select your project, give it the alias "default"
```

---

## 4. Environment variables

Create `kirtan-booking/.env` (copy from `.env.example`) with the six values from your Web app config:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...                       # apiKey
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ssbbn-kirtan.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ssbbn-kirtan
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ssbbn-kirtan.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> `.env` is gitignored. These must be present **at build time** (`expo export`) — they get
> baked into the bundle. There is no server-side env config on Firebase Hosting.

---

## 5. Deploy

From inside `kirtan-booking/`:

```bash
npm install --legacy-peer-deps          # install app deps (first time only)
npx expo export --platform web --clear  # build the web app → dist/
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

- `firestore:rules` uploads `firestore.rules` (public read, admin-only write).
- `firestore:indexes` uploads `firestore.indexes.json` (currently empty — sorting is client-side).
- `hosting` uploads `dist/`. The CLI prints your live URL: `https://<project-id>.web.app`.

To redeploy after a change: re-run the `expo export` + `firebase deploy` lines.

---

## 6. Verify

1. Open `https://<project-id>.web.app` — the app loads (public event calendar).
2. Go to the admin login, sign in with the user you created in §1.4 → you reach the dashboard.
3. Create an event → it appears in Firestore console (Build → Firestore → `events`) and on the public calendar.
4. Sign out → confirm you can still *read* events but the admin screens are gated.

There are **no** `/api/*` endpoints any more — the app reads/writes Firestore directly.

---

## 7. Android apps (optional)

The web app above is the main deliverable. To also ship Android APKs:

1. `app.json` → `extra.eas.projectId` is empty — run `eas init` (inside `kirtan-booking/`) to fill it.
2. EAS build profiles already carry the `EXPO_PUBLIC_FIREBASE_*` env via your shell `.env` (or add them under each profile's `env` in `eas.json`).
3. Build: `eas build -p android --profile admin` (and `--profile client`).
4. Push notifications need a real device + the EAS `projectId`; broadcasting works from the **admin APK** (Expo's push endpoint may be CORS-blocked from the web).

---

## 8. Free-tier notes

- **Firebase Spark (free)** covers Hosting, Auth, and Firestore comfortably for a temple app: 1 GiB stored, 50K reads / 20K writes / 20K deletes per day, 10 GiB/month hosting transfer. No credit card needed.
- **No cold starts** — Hosting serves static files from a CDN and Firestore is always on (unlike the previous Render free tier).
- Firestore "production mode" denies everything until `firestore.rules` is deployed — make sure §5 ran successfully or the app will show permission errors.
