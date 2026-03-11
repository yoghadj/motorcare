# Deploy MotorCare to Vercel

## 1. Database: Neon (PostgreSQL)

This project uses **Neon** (PostgreSQL). In the [Neon dashboard](https://console.neon.tech):

1. Create or open your project and database (e.g. `neondb`).
2. Go to **Connection details** and copy the connection string.
3. **Use the pooled URL** for Vercel (serverless). It usually contains `-pooler` in the host and is recommended for most uses. Example format:
   ```txt
   postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
4. For running migrations or seed from your machine, you can use the same pooled URL, or the **unpooled** URL if Neon suggests it for long-running connections.

Put the URL in `.env` as `DATABASE_URL` (see `.env.example`).

---

## 2. Push schema and seed (one-time)

From your **local machine**, with `DATABASE_URL` in `.env` pointing at your Neon database:

```bash
cd web
npx prisma db push
npx prisma db seed
```

This creates tables and seeds the admin user + dictionary. Use the same `ADMIN_EMAIL` / `ADMIN_PASSWORD` you want for production (or set them in `.env` when seeding).

---

## 3. Deploy on Vercel

### 3.1 Connect the repo

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New** → **Project**.
3. Import your Git repository (e.g. `your-username/motorcare`).
4. If the app lives in a **subfolder** (e.g. `web/`), set **Root Directory** to `web` and click **Edit** next to it to save.

### 3.2 Environment variables

In the Vercel project: **Settings** → **Environment Variables**. Add:

| Name | Value | Notes |
|------|--------|--------|
| `DATABASE_URL` | Your Neon pooled URL | From Neon dashboard (use the pooler URL for serverless) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your Vercel URL (replace after first deploy if needed) |
| `NEXTAUTH_SECRET` | (random string) | e.g. `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Your admin email | Optional; used if you run seed against prod |
| `ADMIN_PASSWORD` | Your admin password | Optional; use a strong password |

For `NEXTAUTH_URL`: you can set it to `https://your-project.vercel.app` after the first deploy when you know the URL, then redeploy.

### 3.3 Deploy

1. Click **Deploy** (or push to the connected branch).
2. Wait for the build. The build runs `prisma generate && next build` (see `package.json`).
3. After deploy, open **Settings** → **Environment Variables**, set `NEXTAUTH_URL` to the real URL (e.g. `https://motorcare-xxx.vercel.app`), then redeploy once so auth works.

---

## 4. After first deploy

1. **Apply schema and seed** (if you didn’t in step 2):
   - Set `DATABASE_URL` locally to the production URL and run:
     ```bash
     cd web && npx prisma db push && npx prisma db seed
     ```
2. Open your Vercel URL and log in (register or use the seeded admin).
3. If you use a **custom domain**, set it in Vercel and update `NEXTAUTH_URL` to that domain, then redeploy.

---

## 5. Troubleshooting

| Issue | What to do |
|-------|------------|
| Build fails: “Prisma Client not generated” | Ensure `package.json` has `"build": "prisma generate && next build"` and redeploy. |
| “Database not found” or connection errors | Check `DATABASE_URL` in Vercel; ensure DB exists and IP/access allow Vercel (or use a public URL with TLS). |
| NextAuth redirect / session issues | Set `NEXTAUTH_URL` exactly to your app URL (no trailing slash), then redeploy. |
| 404 or wrong routes | If the app is in `web/`, set **Root Directory** to `web` in Vercel. |

---

## Quick checklist

- [ ] Neon database created and `DATABASE_URL` (pooled URL) set
- [ ] `prisma db push` and `prisma db seed` run once against production DB
- [ ] Repo connected to Vercel; Root Directory = `web` if app is in `web/`
- [ ] `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` set in Vercel
- [ ] Deploy; then set `NEXTAUTH_URL` to final URL and redeploy if needed
- [ ] Log in and test
