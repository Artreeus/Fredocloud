# FredoCloud Collaborative Team Hub

FredoCloud is a collaborative team workspace built for the internship assignment using a Turborepo monorepo. It combines a Next.js frontend, an Express + Prisma backend, PostgreSQL, JWT cookie authentication, Socket.io realtime updates, analytics, optimistic UI, and database-backed RBAC controls.

## Live deployment

- Web: `https://web-production-a2ba1.up.railway.app`
- API: `https://scheduler-production-f0d4.up.railway.app`
- Health check: `https://scheduler-production-f0d4.up.railway.app/api/health`

## Demo account

- Email: `demo@fredocloud.com`
- Password: `Demo@12345`

## Features

- JWT auth with access and refresh tokens stored in `httpOnly` cookies
- Workspace creation, switching, invitations, member management, and role changes
- Goals with nested milestones, progress calculation, and update feed
- Announcements with rich-text content, pinning, reactions, and threaded comments
- Action items with Kanban drag-and-drop, list view, filters, and bulk updates
- Socket.io realtime events for announcements, comments, reactions, action item updates, and presence
- Notifications with unread badge, dropdown panel, and `@mention` support
- Workspace analytics dashboard with Recharts and CSV export

## Advanced features chosen

- `Optimistic UI`
- `Advanced RBAC`

## Tech stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 14 App Router, Tailwind CSS, Zustand
- Backend: Node.js, Express.js, Prisma ORM
- Database: PostgreSQL
- Realtime: Socket.io
- Auth: JWT access + refresh cookies
- Uploads: Cloudinary
- Deployment: Railway

## Repository structure

```text
apps/
  api/        Express API, Prisma schema, auth, workspace, goals, announcements, action items, analytics
  web/        Next.js app with protected routes, Zustand stores, realtime bridge, charts, and polished UI
packages/
  config/     Shared ESLint and Prettier config
  types/      Shared constants and enum-like exports
  utils/      Shared helpers
```

## Local setup

1. Install dependencies.

   ```bash
   pnpm install
   ```

2. Copy the environment templates.

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Generate Prisma client and run migrations.

   ```bash
   pnpm --filter api db:generate
   pnpm --filter api db:migrate
   ```

4. Seed demo data.

   ```bash
   pnpm --filter api db:seed
   ```

5. Start both apps.

   ```bash
   pnpm dev
   ```

## Environment variables

### Backend `apps/api/.env`

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=replace-with-access-secret
JWT_REFRESH_SECRET=replace-with-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ACCESS_TOKEN_COOKIE_NAME=fredocloud_access_token
REFRESH_TOKEN_COOKIE_NAME=fredocloud_refresh_token
CLIENT_URL=http://localhost:3000
COOKIE_DOMAIN=
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend `apps/web/.env.local`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
ACCESS_TOKEN_COOKIE_NAME=fredocloud_access_token
```

## Production deployment notes

- Railway is used for the frontend and backend as separate services.
- The production database is hosted on Neon PostgreSQL.
- On Railway, the backend needs `COOKIE_DOMAIN=up.railway.app` so auth cookies can be shared across the frontend and API Railway subdomains.
- The backend service expects:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_EXPIRES_IN`
  - `JWT_REFRESH_EXPIRES_IN`
  - `ACCESS_TOKEN_COOKIE_NAME`
  - `REFRESH_TOKEN_COOKIE_NAME`
  - `CLIENT_URL`
  - `COOKIE_DOMAIN`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- The frontend service expects:
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_SOCKET_URL`
  - `ACCESS_TOKEN_COOKIE_NAME`

## Advanced feature usage

### Optimistic UI

- Goal creation appears instantly before the server confirms it.
- Announcement reaction toggles update immediately and roll back on failure.
- Kanban status changes move cards right away and reconcile after the API response.
- Rollback failures are surfaced through toast notifications.

### Advanced RBAC

- Permissions are stored in the database via `WorkspaceRolePermission`.
- Admins can edit the permission matrix from `/settings/workspace`.
- Frontend actions are conditionally shown or hidden based on real workspace permissions.
- Backend routes enforce the same permissions server-side.

## Realtime coverage

- `announcement:new`
- `reaction:update`
- `comment:new`
- `action-item:update`
- `user:online`
- `user:offline`
- `notification:new`

## Useful commands

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm --filter api db:generate`
- `pnpm --filter api db:migrate`
- `pnpm --filter api db:seed`

## Known limitations

- Railway PostgreSQL plugin provisioning was blocked by the current free-plan resource limit, so Neon is used as the production database instead.
- Cloudinary uploads require valid production Cloudinary credentials to be fully testable end to end.
- The video walkthrough is still a manual submission step and should be recorded separately.

## Walkthrough checklist

Use this 3-5 minute flow for the final video:

1. Show the landing page and login with the demo account.
2. Open the dashboard and explain workspace analytics cards and charts.
3. Create or switch a workspace and show member management.
4. Open goals, show milestones and progress updates.
5. Open announcements, create a comment with an `@mention`, and show the notification bell.
6. Open action items, switch between Kanban and list views, and drag a card between columns.
7. Show realtime updates or presence with a second logged-in browser if available.
8. Show workspace permissions and one permission-gated action.
