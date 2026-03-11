# MotorCare Web

Next.js 15 app for MotorCare (motorcycle maintenance & cost tracking). Implements **checklist 1–3**: User Account & Authentication, Locale (EN/ID), and Roles & Admin Area.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Neon in production, or local Postgres)
- **NextAuth.js** (credentials, JWT session)

## Setup

1. **Install dependencies**

   ```bash
   cd web && npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string (e.g. your Neon pooled URL from the [Neon dashboard](https://console.neon.tech), or local `postgresql://user:pass@localhost:5432/motorcare`)
   - `NEXTAUTH_URL` – e.g. `http://localhost:3000`
   - `NEXTAUTH_SECRET` – e.g. `openssl rand -base64 32`
   - Optional: `ADMIN_EMAIL`, `ADMIN_PASSWORD` for seed

3. **Database**

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign up or log in; use the seeded admin to access `/admin/users`.

## Features (Checklist 1–3)

- **1. User Account & Authentication**  
  Register (email, password, terms), Login/Logout, Profile (name, email, phone), Change password, Forgot password (API placeholder), validation (email format, min 8 chars, unique email).

- **2. Locale**  
  EN / Bahasa Indonesia via header switcher; preference stored in cookie; localized UI strings.

- **3. Roles & Admin**  
  `user` | `admin` (Prisma `User.role`). Users see own garage only; admins see Users list and full dictionary (later). Admin routes protected by layout + middleware. Seed creates default admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Deploy to Vercel

See **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** for step-by-step: cloud MySQL (PlanetScale/Railway), env vars, Root Directory, and first deploy.

## Layout

Flux-style dashboard: collapsible sidebar (Dashboard, Garage, Profile, Admin/Users for admin) and top header with locale switcher and logout.
