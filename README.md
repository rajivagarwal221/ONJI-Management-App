# ONJI Management App

Next.js 14 + Firebase intern portal. Admin provisions interns from the admin
console; interns log in with emailed credentials and work through their
tracks.

## Features

- **Admin portal** (`/admin`): list all interns, provision new ones
  (auto-generates password + reference number + emails credentials), reset
  passwords, enable/disable accounts.
- **Intern portal** (`/intern`): dashboard, profile, onboarding checklist,
  Anthropic certs, tracks, assignments, schedule, events, completion,
  resources, study notes, free-tier perks, announcements, inbox,
  submissions, questions, feedback, LinkedIn share.
- **Single-device sign-in**: a session UUID is stamped on the user doc at
  login. If the user signs in on another device, the first device is signed
  out instantly via a Firestore listener.
- **Reference numbers**: unique per intern (`ONJI-YYYY-####` by default —
  swap `formatReference` in `lib/refs.ts` when the final format is confirmed).

## Setup

### 1. Firebase project

1. Create a Firebase project at <https://console.firebase.google.com>.
2. Enable **Authentication → Email/Password**.
3. Create a **Firestore database** (production mode).
4. (Optional) Enable **Storage** if you plan to upload files.

### 2. Admin service account

1. Firebase console → *Project settings → Service accounts* →
   *Generate new private key*. Download the JSON.
2. Open the JSON. You need three values for `.env.local`:
   `project_id`, `client_email`, and `private_key`.

### 3. Gmail credentials for sending

1. Turn on 2-Step Verification on the Google account that will send
   credential emails (default: `onjisoftware@gmail.com`).
2. Create an App Password at
   <https://myaccount.google.com/apppasswords>. Pick "Mail", "Other", name
   it "ONJI".
3. Save the 16-character password.

### 4. Local env

Copy `.env.example` → `.env.local` and fill it in. Minimum required:

- All `NEXT_PUBLIC_FIREBASE_*` keys (from Firebase console → Project
  settings → General → *Your apps* → Web).
- `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`,
  `FIREBASE_ADMIN_PRIVATE_KEY` (from step 2).
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` (from step 3).
- `NEXT_PUBLIC_ADMIN_EMAIL` / `ADMIN_EMAIL`: whoever runs the admin console.
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` in dev, your real URL in
  prod. Used in credential emails.

### 5. First-run admin bootstrap

The admin account needs to exist in Firebase Auth before you can sign in:

1. Firebase console → Authentication → *Users* → *Add user*. Use the admin
   email + any password you'll remember.
2. Run the app (`npm run dev`) and go to `/login`.
3. Sign in with that email. The app auto-creates your `users/{uid}` doc
   with `role: 'admin'` on first sign-in. You'll land in `/admin`.

### 6. Deploy Firestore rules & indexes

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore
```

### 7. Run

```bash
npm install
npm run dev
```

- `/login` — sign in
- `/admin` — admin console
- `/intern` — intern portal
- `/admin/interns/new` — provision an intern (sends email automatically)

## Provisioning an intern

1. From `/admin`, click **Provision a new intern**.
2. Fill in name, email, track, cohort → **Generate credentials & email**.
3. Server-side: Firebase Admin SDK creates the Auth user with a random
   12-char password → Firestore `users/{uid}` doc with a unique
   `referenceNo` → sends the welcome email via Gmail SMTP.
4. If the email fails, the admin UI shows the password so you can relay it
   manually. The password is **never stored**.

## Device enforcement

- On every successful sign-in, the client generates a random
  `activeSessionId` and writes it to `users/{uid}.activeSessionId` plus
  `localStorage`.
- Every signed-in client subscribes to its own `users/{uid}` doc. If
  `activeSessionId` on the server no longer matches `localStorage`, the
  client signs out automatically.
- Admin **Reset password** clears `activeSessionId` and revokes refresh
  tokens, so the device is kicked immediately.
- Admin **Disable** does the same plus flips `disabled: true` on both the
  Auth user and the Firestore doc.

## Reference-number format

Current placeholder: `ONJI-YYYY-####` (year + 4-digit sequence from a
transactional Firestore counter).

Swap the implementation when the real format arrives:
`lib/refs.ts` → `formatReference(year, seq)`.

## Email templates (to come)

Offer letter and completion letter templates will be added under
`lib/mail-templates.ts` when provided. They'll be sent via the same
Gmail transport.

## Project layout

```
app/
  login/                 Sign-in page (no self-signup)
  admin/                 Admin console
    layout.tsx           Role-guarded shell
    page.tsx             Overview + stats
    interns/
      page.tsx           List + reset / disable actions
      new/page.tsx       Provision new intern
  intern/                Intern portal (device-guarded)
    layout.tsx           Auth-guarded shell
    page.tsx             Dashboard
    …                    All other nav pages
  api/
    admin/
      create-intern/     POST — Admin SDK creates auth user + mails creds
      reset-password/    POST — rotates password + mails
      toggle-intern/     POST — enable/disable + revoke tokens
components/
  AdminShell.tsx         Admin layout wrapper
  InternShell.tsx        Intern layout wrapper (device enforcement)
  Sidebar.tsx            Intern side nav
  Logo.tsx               ONJI mark + wordmark
  ui.tsx                 PageHeader, Card, Chip, Button, Empty
lib/
  firebase.ts            Client SDK (auth / firestore / storage)
  firebase-admin.ts      Admin SDK + requireAdmin()
  auth.tsx               AuthProvider + useAuth() + device sessions
  db.ts                  Typed collections + read/write helpers
  mail.ts                Nodemailer Gmail transport + templates
  refs.ts                Reference-number generator + password generator
firestore.rules          Security rules (admin-provisioned users)
firestore.indexes.json   Composite indexes
firebase.json            Firebase CLI config
```
