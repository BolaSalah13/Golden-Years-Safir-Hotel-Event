# Event Registration & QR Check-in

Public registration → instant QR ticket → webcam scanner check-in → live dashboard.
Stack: **Next.js 14 (App Router) + Tailwind + Firebase Firestore**. Free-tier deployable on Vercel + Firebase.

## Pages

| Route | Purpose |
|---|---|
| `/` | Public registration form (Arabic-name + Egyptian-phone validation, duplicate-phone guard → `/ticket/[id]`) |
| `/ticket/[id]` | QR ticket (QR = raw `attendeeId`), QR PNG / full-ticket PNG / print |
| `/admin/scan` | Live webcam scanner (`html5-qrcode`) + manual search fallback |
| `/admin/dashboard` | Real-time counts, attendee table, CSV export, undo/delete |
| `/admin` | Index linking scanner + dashboard |

## Quick start

1. **Firebase setup**
   - Console → Create project (no billing needed) → Build → Firestore Database → Create database (production mode, any region).
   - Project Settings → General → Your apps → Web `</>` → Register app → copy the config values.
   - Firestore → Rules tab → paste `firestore.rules` → Publish.

2. **Local run**
   ```bash
   cd event-registration
   cp .env.local.example .env.local
   # fill in NEXT_PUBLIC_FIREBASE_* in .env.local
   npm install
   npm run dev
   # open http://localhost:3000
   ```
   Camera scanning needs `https://` or `localhost` — `npm run dev` on localhost is fine.

3. **Deploy to Vercel (free)**
   - Push this folder to GitHub, import in Vercel, set the same `NEXT_PUBLIC_*` env vars in Project Settings → Environment Variables.
   - `vercel --prod` or merge to main. No server config needed (all Firestore access is client-side).

## Firestore schema

Collection `attendees`, document ID = `attendeeId`:

```json
{
  "id": "attendeeId",
  "name": "بولا صلاح فتحي",
  "email": "",
  "phone": "010xxxxxxxx",
  "age": 60,
  "organization": "مصر الجديدة",
  "checkedIn": false,
  "checkedInAt": null,
  "createdAt": "Timestamp"
}
```

> `email` is kept as `""` for backward compatibility with older records.
> `phone` is stored normalized (digits only, `01xxxxxxxxx`) and is unique.

## Optional: admin passcode

Set `NEXT_PUBLIC_ADMIN_CODE=1234` in `.env.local` / Vercel to gate `/admin/*` behind a simple passcode (stored in `localStorage`). Leave empty to disable. For hard security, add Firebase Auth and tighten `firestore.rules`.

## Edge cases handled

- Duplicate phone → error card with link to existing ticket.
- Invalid / already-checked-in / not-found scan states with distinct colors + chime + vibration.
- Camera denied / no camera / HTTPS-required / in-use errors with actionable messages + manual search fallback.
- Offline registration/scan shows an explicit message.
- Dashboard live `onSnapshot` with unordered fallback if `orderBy` fails; CSV export of the filtered view.
