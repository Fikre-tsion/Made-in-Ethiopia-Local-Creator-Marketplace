# Made in Ethiopia

Local creator marketplace for discovering Ethiopian products and contacting their makers.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. In Supabase Project Settings > API, set `NEXT_PUBLIC_SUPABASE_URL` to the project URL and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the publishable (formerly anon) key. Never use a service-role key in this app.
4. In Supabase Authentication > URL Configuration, add `http://localhost:3000/auth/callback` and your deployed `/auth/callback` URL as allowed redirect URLs.
5. Run the SQL migrations in `supabase/migrations/` in the Supabase SQL Editor (especially the user-roles migration) to create profiles and role-based access.
6. In Authentication > Providers, enable Email. Configure email confirmation and password minimums to match the application policy: 12 characters, uppercase, lowercase, number, and special character.
7. Restart `npm run dev` after changing `.env.local`; `NEXT_PUBLIC_` values are bundled by Next.js.

Without these values, public sample marketplace browsing remains available, while authentication and creator data are intentionally unavailable. The repository does not contain credentials or claim to modify the Supabase project.

If registration reports that authentication is unavailable, confirm that `.env.local` contains the two variables above (without quotes or placeholder values), stop the running Next.js process, and start it again. A browser refresh alone cannot update public environment variables already bundled into the client.

## Development

```bash
npm install
npm run dev
```

Run the production checks with:

```bash
npm run lint
npm run build
```

The basket and favorites are intentionally local browser state for this discovery MVP. There is no payment, checkout, delivery, or order-fulfillment flow.
