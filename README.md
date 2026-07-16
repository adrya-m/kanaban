# Sundance Renovations

Kanban boards for renovations and Europe vacation planning (Next.js + optional Supabase).

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

## Database (Supabase, no login)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste and run [`frontend/supabase/schema.sql`](frontend/supabase/schema.sql).
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Put both values in `frontend/.env.local`.
5. Restart `npm run dev`.

When env vars are set, both boards sync to Supabase (any device using the same project shares the same data). Without env vars, the app falls back to browser storage.

**Security note:** No login means anyone who has your site URL (and the public anon key in the frontend) can read and edit the boards. Fine for a personal MVP; add login later if you need private data.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test          # unit tests (uses local storage fallback)
npm run test:e2e  # Playwright e2e tests
```

## Production / Vercel

1. Deploy the `frontend` folder to Vercel.
2. In Vercel → Project → Settings → Environment Variables, add the same two `NEXT_PUBLIC_SUPABASE_*` values.
3. Redeploy.

## Production (local)

```bash
npm run build
npm start
```
