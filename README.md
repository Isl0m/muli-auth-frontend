# Multi Auth Frontend

Frontend for a multi-authentication app built with Next.js, React, Tailwind CSS, and shadcn/ui components.

## What It Does

- Shows password login and registration screens
- Sends passwordless magic link requests
- Verifies passwordless magic link tokens from the URL
- Shows biometric and WebAuthn registration/authentication screens
- Displays a security activity dashboard
- Calls logout and redirects back to the home page

The frontend expects the backend to manage auth with HTTP-only cookies. API requests are sent with credentials enabled.

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

If this value is not set, the frontend falls back to `/api`.

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Main Pages

- `/` - auth method selection
- `/auth/password` - password login/register
- `/auth/passwordless` - magic link request
- `/auth/passwordless/verify` - magic link verification
- `/auth/biometric` - biometric auth screen
- `/auth/webauthn/register` - WebAuthn registration
- `/dashboard` - security activity dashboard
- `/auth/logout` - logout flow
