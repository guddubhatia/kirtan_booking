# SSBBN Kirtan Panel

> **☬ Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh ☬**

A mobile-first React Native (Expo) application for managing temple Kirtan events.
Fully **serverless** — the app talks directly to **Firebase** (Authentication +
Cloud Firestore), and the web build is served from **Firebase Hosting**.

---

## Apps

| App | Purpose |
|-----|---------|
| **SSBBN Kirtan Panel** | Public client — view calendar, events, announcements |
| **SSBBN Kirtan Booking Admin Panel** | Secured admin — manage events, send notifications |

Both ship from one codebase. The Admin Panel link is shown unless the build sets
`EXPO_PUBLIC_IS_ADMIN_BUILD=false` (see `eas.json` build profiles).

---

## Features

### Client (Public)
- 📅 Full monthly calendar with color-coded events
- 🟢 Kirtan | 🟡 Temple Event | 🔴 Unavailable dates
- Tap any date to view all events for that day
- Event detail screens (title, date, time, location, status, notes)
- Announcements / push notification history
- Pull-to-refresh

### Admin (Secured)
- 🔐 Firebase email/password login + forgot password
- Add, edit, delete kirtan events
- Manage calendar dates and mark unavailable
- Broadcast push notifications to all registered devices
- Dashboard with stats cards

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 56 |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore (`events`, `announcements`, `pushTokens`) |
| Web hosting | Firebase Hosting (Expo web export → `dist/`) |
| Push Notifications | Expo Push Notifications (mobile only) |
| Styling | Custom design system (saffron/cream/gold) |
| Language | TypeScript |

There is **no separate backend server** — Firestore + Firebase Auth are the backend.

---

## Project Structure

```
kirtan-booking/
├── app/
│   ├── _layout.tsx              # Root layout + notification setup
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar navigator
│   │   ├── index.tsx            # Home — Calendar + Upcoming
│   │   ├── announcements.tsx    # Announcements list
│   │   └── about.tsx            # About + color legend + admin link
│   ├── event/[id].tsx           # Event detail screen
│   └── admin/
│       ├── _layout.tsx          # Admin stack
│       ├── login.tsx            # Admin login + forgot password
│       ├── dashboard.tsx        # Admin dashboard + stats
│       ├── calendar.tsx         # Calendar event management
│       ├── add-event.tsx        # Add / Edit event form
│       └── notifications.tsx    # Send push notifications
├── components/
│   ├── calendar/KirtanCalendar.tsx
│   ├── cards/{EventCard,AnnouncementCard,StatCard}.tsx
│   ├── admin/{EventForm,NotificationForm}.tsx
│   └── ui/{Button,Header,TempleLogoPlaceholder,LoadingSpinner}.tsx
├── services/
│   ├── firebase.ts              # Firebase App / Auth / Firestore init
│   ├── auth.ts                  # Email/password auth wrapper
│   ├── api.ts                   # Firestore data layer (events/anns/tokens)
│   ├── database.ts              # Native re-export of api.ts
│   ├── database.web.ts          # Web re-export of api.ts
│   └── notifications.ts         # Expo push registration + broadcast
├── store/{eventStore,adminStore}.ts
├── hooks/{useAuth,useNotifications}.ts
├── types/index.ts
├── constants/{theme,config}.ts
├── utils/dateUtils.ts
├── firebase.json                # Hosting + Firestore config
├── .firebaserc                  # Firebase project id
├── firestore.rules              # Security rules
├── firestore.indexes.json
├── .env.example
└── README.md
```

---

## Setup

### Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- (Optional, for Android builds) EAS CLI: `npm install -g eas-cli`

### 1. Install

```bash
cd kirtan-booking
npm install
```

### 2. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com) (free **Spark** plan is enough).
2. **Authentication** → Get started → enable **Email/Password**.
3. **Build → Firestore Database** → create database (production mode).
4. **Project settings → Your apps → Add Web app** → copy the `firebaseConfig` values.
5. Create your first admin: **Authentication → Users → Add user** (email + password).

### 3. Environment variables

```bash
cp .env.example .env
# Fill in the EXPO_PUBLIC_FIREBASE_* values from step 2.4
```

| Variable | Source |
|----------|--------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase web config `apiKey` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |
| `EXPO_PUBLIC_IS_ADMIN_BUILD` | *(optional)* `false` hides the admin link |

> The Firebase web API key is **not** a secret — `EXPO_PUBLIC_*` vars are inlined
> into the JS bundle at build time. Access is enforced by `firestore.rules` + Auth.

### 4. Run locally

```bash
npx expo start          # press w (web) / a (Android) / i (iOS)
```

---

## Deploy

See **`../DEPLOYMENT.md`** for the full step-by-step guide. In short, from inside `kirtan-booking/`:

```bash
# one-time
firebase login
# set your project id in .firebaserc (replace YOUR_FIREBASE_PROJECT_ID)

# build the web bundle and ship rules + hosting
npx expo export -p web          # outputs to dist/
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

Android APKs (optional) are built with EAS using the `client` / `admin` profiles in `eas.json`.

---

## Firestore Data Model

### `events`
`title`, `eventType`, `date` (`YYYY-MM-DD`), `time` (`HH:MM`), `location`,
`description`, `status`, `notes`, `createdAt` (ISO). Document id is auto-generated.

| `eventType` | Color | Meaning |  | `status` | Meaning |
|-------------|-------|---------|--|----------|---------|
| `kirtan` | 🟢 Green | Kirtan event | | `confirmed` | Definite |
| `temple_event` | 🟡 Amber | Temple program | | `tentative` | May change |
| `unavailable` | 🔴 Red | Temple closed | | `cancelled` | Cancelled |

### `announcements`
`title`, `body`, `createdAt` (ISO).

### `pushTokens`
Document id = the Expo push token. Devices self-register; only admins can list/delete
(see `firestore.rules`).

---

## Admin Access

1. Open the app → **About** tab → tap **Admin Panel** (or go to `/admin/login`).
2. Sign in with the Firebase admin email + password created above.

---

## Temple Logo

The logo is at `assets/temple-logo.jpg` and rendered by
`components/ui/TempleLogoPlaceholder.tsx`. Replace that file to change the logo.

---

## Push Notifications

Mobile only. Devices register their Expo push token (saved to the `pushTokens`
Firestore collection on first launch). The **admin app** reads all tokens and posts
directly to Expo's push API — no backend/Cloud Function required. Browser broadcasts
may be blocked by CORS, so broadcast from the Android admin build.

---

## Design System

| Token | Value | Use |
|-------|-------|-----|
| `cream` | `#FDF6E3` | Main background |
| `saffron` | `#E8791A` | Primary brand color |
| `gold` | `#C9A84C` | Accent highlights |
| `kirtan` | `#2E7D32` | Kirtan event green |
| `templeEvent` | `#F57F17` | Temple event amber |
| `unavailable` | `#C62828` | Unavailable red |

---

## License

Built with ❤️ for the SSBBN Sangat
Sat Sri Akal 🙏
