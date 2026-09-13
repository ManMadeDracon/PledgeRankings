# Pledge Points

Live leaderboard and activity feed, built with Nuxt 4 and Supabase.

The public page is a mobile-first port of the Figma design
([Pledge Points](https://www.figma.com/design/Yrcd9TFSR5SbSHuC6xOobV/Pledge-Points?node-id=0-1)).

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the secrets:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | public | Supabase project URL |
| `SUPABASE_ANON_KEY` | public | Browser client key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Used by `/server/api/*` for privileged writes |
| `ADMIN_PASSWORD` | **server only** | Doubles as the secret registration key |

These are the same names the original Vercel deployment used, so existing
project variables carry over unchanged. `NUXT_*` equivalents override them at
runtime (e.g. `NUXT_SUPABASE_SERVICE_ROLE_KEY`).

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
```

Deploys to Vercel as-is — Nitro detects the platform and builds the
`server/api` routes as functions.

## Structure

```
app/
  components/       Figma components + dashboard sections
  composables/      Supabase client, auth, leaderboard, feed, API wrappers
  middleware/       auth guard for /dashboard
  pages/            index, login, register, dashboard
server/
  api/              submit-tip, admin-action, manage-users, register
  utils/            service-role client, requireUser / requireSuperuser
```

### Database

Supabase tables `rankings`, `tip_logs`, `profiles`, `system_settings`, plus the
`submit_tip` and `undo_tip` RPCs. Nothing in this repo creates them.

## Notes on the design port

- The background is a CSS port of the Figma "Soft bloom" shader fill. The
  original is WGSL/WebGPU, which most mobile browsers still lack, so the same
  parameters (gradient ramp, four blobs, offset glow, grain) are reproduced
  with gradients in `components/AppBackground.vue`.
- `--color-points-up` is darkened from the Figma `#8bff73`, which is
  unreadable against the light background. See `assets/css/main.css`.
