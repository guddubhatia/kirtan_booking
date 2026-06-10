# SSBBN Kirtan Panel

> **☬ Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh ☬**

A complete mobile-first React Native (Expo) application for managing temple Kirtan events.

---

## Apps

| App | Purpose |
|-----|---------|
| **SSBBN Kirtan Panel** | Public client — view calendar, events, announcements |
| **SSBBN Kirtan Booking Admin Panel** | Secured admin — manage events, send notifications |

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
- Send push notifications broadcast to all users
- Dashboard with stats cards

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Framework | React Native + Expo SDK 56 |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Auth | Firebase Authentication |
| Database | Google Sheets API v4 |
| Push Notifications | Expo Push Notifications |
| Styling | Custom design system (saffron/cream/gold) |
| Language | TypeScript |

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
│   │   └── about.tsx            # About + color legend
│   ├── event/[id].tsx           # Event detail screen
│   └── admin/
│       ├── _layout.tsx          # Admin stack
│       ├── login.tsx            # Admin login + forgot password
│       ├── dashboard.tsx        # Admin dashboard + stats
│       ├── calendar.tsx         # Calendar event management
│       ├── add-event.tsx        # Add / Edit event form
│       └── notifications.tsx    # Send push notifications
├── components/
│   ├── calendar/KirtanCalendar.tsx  # Full calendar grid
│   ├── cards/
│   │   ├── EventCard.tsx
│   │   ├── AnnouncementCard.tsx
│   │   └── StatCard.tsx
│   ├── admin/
│   │   ├── EventForm.tsx
│   │   └── NotificationForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Header.tsx
│       ├── TempleLogoPlaceholder.tsx
│       └── LoadingSpinner.tsx
├── services/
│   ├── firebase.ts
│   ├── auth.ts
│   ├── googleSheets.ts
│   └── notifications.ts
├── store/eventStore.ts
├── hooks/
│   ├── useAuth.ts
│   └── useNotifications.ts
├── types/index.ts
├── constants/
│   ├── theme.ts
│   └── config.ts
├── utils/dateUtils.ts
├── .env.example
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)

### 1. Clone & Install

```bash
cd kirtan-booking
npm install --legacy-peer-deps
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. `ssbbn-kirtan`)
3. Enable **Authentication** → Email/Password provider
4. Go to **Project Settings** → Your Apps → Add Web App
5. Copy the config values into `.env`

```bash
cp .env.example .env
# Fill in your Firebase values
```

### 3. Google Sheets Setup

1. Create a Google Spreadsheet with two sheets:
   - Sheet 1 named: `Events`
   - Sheet 2 named: `Announcements`
   - Sheet 3 named: `PushTokens`

2. **Events** sheet column headers (Row 1):
   ```
   A: Event ID | B: Title | C: Event Type | D: Date | E: Time | F: Location | G: Description | H: Status | I: Notes | J: Created At
   ```

3. **Announcements** sheet column headers (Row 1):
   ```
   A: ID | B: Title | C: Body | D: Created At
   ```

4. Make the sheet **publicly readable**:
   - Share → Anyone with link → Viewer

5. Enable **Google Sheets API** at [Google Cloud Console](https://console.cloud.google.com):
   - APIs & Services → Enable APIs → Google Sheets API
   - Create an **API Key** for client-side reads
   - Create a **Service Account** for server-side writes

6. Add your Spreadsheet ID and API key to `.env`

### 4. Run the App

```bash
npx expo start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code with **Expo Go** app on your phone

---

## Google Sheets Data Format

### Event Types
| Value | Color | Meaning |
|-------|-------|---------|
| `kirtan` | 🟢 Green | Kirtan event |
| `temple_event` | 🟡 Amber | Temple program |
| `unavailable` | 🔴 Red | Temple closed |

### Event Status
| Value | Meaning |
|-------|---------|
| `confirmed` | Definite event |
| `tentative` | May change |
| `cancelled` | Cancelled |

### Date Format
All dates use `YYYY-MM-DD` format (e.g. `2024-12-25`)

### Time Format
24-hour `HH:MM` format (e.g. `18:30` for 6:30 PM)

---

## Admin Access

1. Open the app → go to **About** tab → tap **Admin Panel**
   (or navigate to `/admin/login`)
2. Sign in with your Firebase admin email + password
3. Use **Firebase Console** to create the first admin account:
   - Authentication → Users → Add User

---

## Adding Temple Logo

Replace the placeholder in `components/ui/TempleLogoPlaceholder.tsx`:

```tsx
// Replace the khanda text with your actual logo:
<Image
  source={require('../../assets/temple-logo.png')}
  style={{ width: dim, height: dim, borderRadius: dim / 2 }}
/>
```

Place your logo at `assets/temple-logo.png`.

---

## Environment Variables

See `.env.example` for all required variables.

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_SPREADSHEET_ID=
EXPO_PUBLIC_GOOGLE_SHEETS_API_KEY=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
EXPO_PUBLIC_BACKEND_URL=
```

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

## Push Notifications

The app uses **Expo Push Notifications** (wrapping Firebase Cloud Messaging).

- Users auto-register their push token on first launch
- Tokens are saved to the `PushTokens` sheet
- Admin can broadcast from the Notifications screen

For production broadcasting, deploy a simple Firebase Cloud Function:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendKirtanNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  await admin.messaging().send({
    notification: { title: data.title, body: data.body },
    topic: 'all_users',
  });
});
```

---

## License

Built with ❤️ for the SSBBN Sangat  
Sat Sri Akal 🙏
# kirtan_booking_app
# kirtan_booking_app
# kirtan_booking_app
