# FredoCloud

FredoCloud is a collaborative team workspace application built in a Turborepo monorepo. It combines workspace management, goal tracking, announcements, action-item planning, realtime collaboration, analytics, and role-based permissions in a single product.

## Live URLs

- Web: `https://web-production-a2ba1.up.railway.app`
- API: `https://scheduler-production-f0d4.up.railway.app`
- API health: `https://scheduler-production-f0d4.up.railway.app/api/health`
- Swagger UI: `https://scheduler-production-f0d4.up.railway.app/api/docs`
- OpenAPI JSON: `https://scheduler-production-f0d4.up.railway.app/api/openapi.json`

## Demo Account

- Email: `demo@fredocloud.com`
- Password: `Demo@12345`

## Highlights

- JWT authentication with access and refresh tokens in `httpOnly` cookies
- Multi-workspace support with switching, invitations, and member management
- Goals with milestones, progress tracking, and activity updates
- Announcements with rich-text content, reactions, threaded comments, and mentions
- Action items with Kanban and list views, filters, and bulk status updates
- Realtime updates with Socket.io for presence, comments, reactions, announcements, notifications, and action items
- Analytics dashboard with charts and CSV export
- Database-backed RBAC with editable workspace permission matrices
- Optimistic UI flows for key interactions
- Email notifications for invitations and mentions
- Swagger/OpenAPI API documentation

## Advanced Features Implemented

- `Optimistic UI`
- `Advanced RBAC`

## Tech Stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 14, App Router, Tailwind CSS, Zustand
- Backend: Node.js, Express.js
- Database: PostgreSQL + Prisma ORM
- Authentication: JWT + `httpOnly` cookies
- Realtime: Socket.io
- File uploads: Cloudinary
- Email: EmailJS
- Charts: Recharts
- Deployment: Railway

## Project Structure

```text
apps/
  api/        Express API, Prisma schema, auth, workspaces, goals, announcements, action items, analytics, docs
  web/        Next.js application, protected UI, Zustand stores, realtime bridge, charts, and public landing page
packages/
  config/     Shared lint/format configuration
  types/      Shared constants and enum-like exports
  utils/      Shared helpers
```

## Core Modules

### Authentication

- Registration, login, token refresh, logout, and current-user profile endpoints
- Cookie-based session flow with protected frontend routes

### Workspaces

- Create, update, switch, and delete workspaces
- Invite members and manage roles
- Permission matrix editing for workspace roles

### Goals

- Goal CRUD with assignees, due dates, statuses, and progress
- Nested milestones and progress rollups
- Goal update feed

### Announcements

- Rich-text announcement publishing
- Pinning, reactions, threaded comments, mentions, and comment moderation

### Action Items

- Kanban board
- Filterable list view
- Quick status changes and bulk updates

### Realtime + Notifications

- Workspace presence
- Live announcement/comment/reaction updates
- Live action-item updates
- In-app notification feed with unread count

### Analytics

- Workspace summary metrics
- Goal and action-item visualizations
- CSV export endpoint

## API Documentation

Swagger UI is available at `/api/docs`, and the raw OpenAPI document is available at `/api/openapi.json`.

Documented API areas include:

- Auth
- Workspaces
- Goals
- Announcements
- Action items
- Notifications
- Analytics
- Uploads
- Health

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Generate Prisma client and run migrations

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

### 4. Seed demo data

```bash
pnpm --filter api db:seed
```

### 5. Start the monorepo

```bash
pnpm dev
```

## Environment Variables

### Backend

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
COOKIE_SAME_SITE=
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAILJS_SERVICE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
EMAILJS_INVITE_TEMPLATE_ID=
EMAILJS_MENTION_TEMPLATE_ID=
APP_NAME=FredoCloud
```

### Frontend

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
ACCESS_TOKEN_COOKIE_NAME=fredocloud_access_token
```

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

## Realtime Events

- `announcement:new`
- `reaction:update`
- `comment:new`
- `comment:update`
- `comment:delete`
- `action-item:update`
- `user:online`
- `user:offline`
- `notification:new`

## Notes

- Production is deployed on Railway for frontend and backend services.
- Production data currently uses Neon PostgreSQL.
- Cloudinary credentials are required for avatar and file upload flows.
- EmailJS credentials and template IDs are required for invite and mention emails.
