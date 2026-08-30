# CRM / Sales Management Portal

A B2B CRM for managing leads, sales opportunities, customers, and follow-ups.
Built with the MERN stack (MongoDB, Express, React, Node).

## Features implemented

- **Auth & roles** — JWT auth, Admin/Sales Manager vs Sales Representative roles
- **Lead management** — create, search/filter, assign, status tracking, duplicate detection, convert to customer/opportunity
- **Sales pipeline** — Kanban board (drag & drop) across New → Contacted → Qualified → Proposal → Negotiation → Won/Lost, pipeline value
- **Customer & activity management** — customer profiles, notes, calls/meetings/follow-ups, interaction history
- **Dashboard** — total/qualified leads, open opportunities, won/lost deals, pipeline value, follow-ups due, conversion rate; role-scoped (admins see everything, reps see their own)
- **Bonus** — CSV import/export for leads, audit log (admin only), role-specific dashboard scoping

## Project structure

```
crm-project/
  server/     Express REST API (MongoDB via Mongoose)
  client/     React (Vite) + Tailwind frontend
```

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env      # edit MONGO_URI / JWT_SECRET as needed
npm install
npm run seed               # creates demo admin + sales rep users and sample leads
npm run dev                 # starts on http://localhost:5000
```

Demo accounts created by the seed script:
- Admin: `admin@crm.test` / `password123`
- Sales rep: `rep@crm.test` / `password123`

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts on http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api` by default (see `client/src/api/axios.js`).
Set `VITE_API_URL` in a `client/.env` file to override.

## API overview

| Method | Endpoint                          | Description                          |
|--------|------------------------------------|---------------------------------------|
| POST   | /api/auth/register                | Create account                        |
| POST   | /api/auth/login                   | Log in, returns JWT                   |
| GET    | /api/leads                        | List leads (search/filter, scoped)    |
| POST   | /api/leads                        | Create lead (duplicate check)         |
| POST   | /api/leads/:id/convert            | Convert lead to customer + opportunity|
| GET    | /api/leads/export/csv             | Export leads as CSV                   |
| POST   | /api/leads/import/csv             | Import leads from CSV                 |
| GET    | /api/opportunities/pipeline       | Kanban board grouped by stage         |
| PATCH  | /api/opportunities/:id/stage      | Move opportunity between stages       |
| GET    | /api/customers/:id                | Customer profile + interaction history|
| POST   | /api/activities                   | Log a call/meeting/note + follow-up   |
| GET    | /api/activities/due               | Follow-ups due today/overdue          |
| GET    | /api/dashboard                    | Role-scoped summary stats             |
| GET    | /api/dashboard/audit-log          | Audit trail (admin only)              |

## Notes / next steps

- Email integration is not yet implemented (mock endpoint could be added under `/api/activities`).
- CSV import uses a simple built-in parser (no external dependency); swap in `csv-parse` for production-grade quoting/escaping.
- Consider adding pagination to `/api/leads` and `/api/customers` for larger datasets.
