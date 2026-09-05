# Smart CRM — Full-Stack DBMS Mini Project

> **DBMS Mini Project | Third Year** | React + TypeScript + Express + MySQL + Tailwind CSS

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Design (ER Schema)](#3-database-design-er-schema)
4. [10-Minute Demo Script (Timed)](#4-10-minute-demo-script-timed)
5. [Key Features Deep-Dive](#5-key-features-deep-dive)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Scalability & Best Practices](#7-scalability--best-practices)
8. [Vercel Deployment Guide](#8-vercel-deployment-guide)
9. [Local Development Setup](#9-local-development-setup)
10. [Folder Structure](#10-folder-structure)
11. [Login Credentials](#11-login-credentials)

---

## 1. Project Overview

**Smart CRM** is a production-ready Customer Relationship Management system built for sales teams. It tracks the entire customer lifecycle:

- 👥 **Customers** with churn risk scoring
- 🎯 **Leads** with drag-and-drop pipeline Kanban
- 💼 **Deals** with win probability & forecasting
- ✅ **Tasks** with priorities, due dates, and assignees
- 📊 **Dashboard** with KPIs, revenue trend, and lead funnel
- 🤖 **AI Lead Intelligence** (Python-based lead scorer)
- 👤 **Staff Authentication** with role-based workspace

The system falls back gracefully to embedded mock data when the MySQL backend is not reachable, making it fully functional in static demo environments (Vercel preview).

---

## 2. Tech Stack & Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       BROWSER / CLIENT                        │
│   React 18 + TypeScript + Vite + Tailwind CSS + Zustand      │
│   Recharts (visualizations)  |  Lucide React (icons)         │
└──────────────────────────────┬───────────────────────────────┘
                               │  REST / JSON over HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       EXPRESS API SERVER                       │
│   Node.js  |  Express 5  |  mysql2/promise (pooled)          │
│   CORS | JWT-ready | Error middleware | 2MB body limit       │
└──────────────────────────────┬───────────────────────────────┘
                               │  SQL (utf8mb4)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        MySQL / MariaDB                         │
│   Tables, Views, Indexes, Stored Data, Seeded Records         │
│   Connection pooling (20 conns) + keepalive + timeouts        │
└──────────────────────────────────────────────────────────────┘
```

| Layer      | Technologies                                                                 |
|------------|------------------------------------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, React Router 7 |
| Backend    | Node.js, Express 5, mysql2/promise, CORS, dotenv                             |
| Database   | MySQL 8+ / MariaDB 10+ with InnoDB, utf8mb4, Indexes, Views                 |
| AI Module  | Python 3.10+ lead scoring engine (spawned via child_process)                |
| Deployment | Vercel (frontend static) + any Node host (Railway/Render) + remote MySQL    |

---

## 3. Database Design (ER Schema)

### Core Tables

| Table            | Purpose                                      | Key Fields                                           |
|------------------|----------------------------------------------|------------------------------------------------------|
| **`staff`**      | Sales team / users                           | `id`, `name`, `email`, `password_hash`, `role`       |
| **`customers`**  | Company contacts (accounts)                  | `id`, `name`, `company`, `email`, `industry`, `churn_score` |
| **`leads`**      | Sales pipeline opportunities                 | `id`, `customer_id`, `stage` (enum), `value`, `lead_score`, `assigned_to` |
| **`deals`**      | Negotiated contracts                         | `id`, `customer_id`, `stage`, `value`, `win_probability`, `expected_close` |
| **`tasks`**      | Follow-ups & reminders                       | `id`, `title`, `status` (enum), `priority`, `due_date`, `assignee` |
| **`interactions`** | Call/email/note history per customer      | `id`, `type` (enum), `customer_id`, `user_id`, `timestamp` |
| **`lead_scores`**   | AI scoring cache (per-lead)             | `id`, `lead_id` (FK→UNIQUE), `score`, `features_json` |
| **`churn_scores`**  | Customer churn scoring history           | `id`, `customer_id` (FK→UNIQUE), `score`, `features_json` |
| **`monthly_revenue`** | Materialized revenue summary view       | `month`, `won_value`, `pipeline_value`, `deal_count`  |
| **`funnel_summary`**  | Stage conversion counts                 | `stage`, `lead_count`, `total_value`, `pct_of_leads`  |

### Key Indexes

```sql
-- Optimized for the most frequent WHERE / JOIN patterns
CREATE INDEX idx_leads_stage       ON leads(stage);
CREATE INDEX idx_leads_assigned    ON leads(assigned_to);
CREATE INDEX idx_customers_churn   ON customers(churn_score);
CREATE INDEX idx_customers_industry ON customers(industry);
CREATE INDEX idx_tasks_status_priority ON tasks(status, priority, due_date);
CREATE INDEX idx_deals_stage_value ON deals(stage, value DESC);
CREATE INDEX idx_interactions_customer ON interactions(customer_id, timestamp DESC);
```

### Views

- `customer_health` — joins customers with aggregated lead counts, deal totals, recent interaction freshness
- `rep_performance` — per-staff KPIs: leads assigned, deals won, tasks completed, revenue

### Integrity Constraints

- **FK cascades** — deleting a customer removes all their leads/deals/interactions
- **`SET NULL`** — removing a staff member un-assigns their records (not data loss)
- **CHECK** — `win_probability BETWEEN 0 AND 100`
- **UNIQUE** — customer email, staff email, (churn_scores.customer_id), (lead_scores.lead_id)

---

## 4. 10-Minute Demo Script (Timed)

> Practice this flow before presenting. Each section is strictly timed.

```
TOTAL: 10:00
├─ 00:00 – 00:45   Intro & Architecture            (0:45)
├─ 00:45 – 02:15   Database Design Walkthrough     (1:30)
├─ 02:15 – 03:30   Login → Dashboard Overview      (1:15)
├─ 03:30 – 05:00   Dashboard KPIs + Analytics      (1:30)
├─ 05:00 – 06:15   Customers List → Detail View    (1:15)
├─ 06:15 – 07:30   Pipeline Kanban (drag-drop)     (1:15)
├─ 07:30 – 08:30   Deals + Tasks                   (1:00)
├─ 08:30 – 09:15   Admin Controls / DBA Panel      (0:45)
└─ 09:15 – 10:00   Deployment + Q&A / Wrap-up      (0:45)
```

---

### ▶️ Part 1 — Intro & Architecture (0:00 → 0:45)

> **Script to say:** *"Hi everyone, today I'll demonstrate Smart CRM — our DBMS Mini Project. It's a full-stack Customer Relationship Management system with 3 tiers: React frontend, Express REST API, and MySQL database. The goal: help a sales team track leads, close deals, and stop customers from churning. Let me quickly show you the architecture."*

**Show:** Project root folder structure → point at `src/` (frontend), `api/` (backend), `database/` (SQL).

---

### ▶️ Part 2 — Database Design (0:45 → 2:15)

> **Script:** *"Before we jump into the UI, the heart of this project is the relational schema. We have 8 tables plus 2 summary views."*

**Open:** `database/schema.sql` — walk through:

1. **`customers`** (PK `id`, UNIQUE email, `churn_score` DECIMAL(5,4))
2. **`leads`** — ENUM stage, FK→customers, FK→staff, DECIMAL lead_score
3. **`deals`** — CHECK win_probability 0-100, FKs, expected_close DATE
4. **`tasks`** — ENUMs for status & priority, FK→staff (SET NULL on delete)
5. **`interactions`** — polymorphic history, FK to both customer and staff
6. **Scoring tables** (`lead_scores`, `churn_scores`) — 1:1 via UNIQUE FK + JSON features
7. **Views:** `monthly_revenue`, `funnel_summary` (pre-aggregated for dashboard)

**Then open** `database/indexes.sql` and show 6-8 index definitions. *"We added these indexes specifically because our dashboard queries filter by stage, churn score, and date range — without them, the dashboard gets slow at 10K+ rows."*

---

### ▶️ Part 3 — Login & Dashboard Overview (2:15 → 3:30)

> **Script:** *"Now let's actually use the product. The app uses staff-based auth; these users are seeded in the MySQL staff table."*

**Action:** Open the app at `/` (if on Vercel it redirects to `/login`).

- Email pre-filled: `aarav@smartcrm.io`
- Password: `smartcrm123`
- Click **Sign in** (0:20)

> *"On the left is the sidebar with quick-nav and a 72% monthly progress indicator. The top bar has global search, notifications, theme toggle, and DBA controls. The dashboard itself uses Zustand for state management and hydrates from the API in parallel."*

**Quickly point out:** 4 KPI cards, 2 big charts (revenue + funnel), Activity feed, At-Risk panel, AI Lead Intelligence panel.

---

### ▶️ Part 4 — Dashboard KPIs + Analytics (3:30 → 5:00)

> **Script:** *"Let's start with the 4 KPI cards at the top — these are computed live from the MySQL backend on every login."*

1. **Revenue card** (₹Xk, +13%) → sum of deal values
2. **Leads** (N, +8%) → `COUNT(*)` from leads table
3. **Conversion** (X.X%) → SUM(won)/COUNT
4. **Churn Risk** (N) → customers with churn_score ≥ 0.35

> **Script:** *"The KPI endpoint (`GET /api/dashboard/kpis`) is a single SQL call that joins 3 aggregations in parallel on the backend."*

**Next — Revenue Trend line chart:**

- Hover over **March (₹8.2L)** and **September (₹8.4L)** peaks
- *"This data comes from the `monthly_revenue` SQL view — pre-aggregated so the dashboard loads in under 100 ms instead of re-summing 50K rows per visit."*

**Next — Lead Funnel (right of revenue):**

- *"From 142 leads down to 19 won — that's about 13% end-to-end conversion, which is pretty healthy. Stages are colour-coded, progress bars animate in on load."*

**Next — At-Risk Customers panel (dark gradient card):**

- Scroll to see 3 customers with churn ≥ 35%
- *"Rahul Verma (BuildMat) is 52% — High risk. We use a MySQL DECIMAL column `churn_score` with 4 decimal places, and any account ≥35% shows up here. Clicking any row would take us to their profile."*

**Next — AI Lead Intelligence panel:**

- *"We call the Python lead scorer (`python/lead_insights.py`) via child_process spawn. Even if Python isn't installed, the UI gracefully degrades with an offline banner."*
- Show the "Focus" summary and per-lead scores.

---

### ▶️ Part 5 — Customers List → Detail (5:00 → 6:15)

**Action:** Click **Customers** in sidebar.

> **Script:** *"Customers page. We can search by name/company/email, filter by industry (10 sectors), and filter by churn tier. Let's filter High risk (≥40%)."*

**Actions:**
- Industry dropdown → *"See the 10 different sectors seeded."*
- Churn risk dropdown → select **High risk (≥40%)** → shows ~2 rows
- Reset churn filter back to **All**
- Click on **Vikram Singh (Tecnova Solutions)** row to enter detail view

> **Script:** *"Inside a customer profile, we have contact info, churn risk meter with recommended action, and 3 sections: their leads, active deals, and an interactions timeline. Note that the header banner is colour-coded per customer using the `avatar_color` column."*

Scroll and point to:
- **Churn Risk = 12% (Healthy)** → green progress bar
- **Leads card:** Enterprise API License, proposal stage, ₹480,000, score 91%
- **Activity Timeline:** meeting/email/call icons with staff attribution

---

### ▶️ Part 6 — Pipeline Kanban (Drag & Drop) (6:15 → 7:30)

**Action:** Click **Pipeline** in sidebar.

> **Script:** *"This is the team's favourite page — a 6-column Kanban board: New → Contacted → Qualified → Proposal → Won → Lost. Each card is draggable; when you drop it into another column, it calls PATCH /api/leads/:id/stage which updates both the stage and `last_updated` column atomically."*

**Action: Demo drag-drop**
- Pick **Patient Module Rollout (Helix Health)** from the **New** column
- Drop into **Contacted** column
- Wait 0.5s (store updates optimistically, then syncs with API)
- *(Drop another lead back if needed to show bidirectional movement)*

> **Script:** *"Notice the optimistic UI update — the card moves instantly even if the DB call is slow, and if the API fails, Zustand rolls it back. Each column shows pipeline value in INR at the top."*

---

### ▶️ Part 7 — Deals + Tasks (7:30 → 8:30)

**Action:** Click **Deals**.

> **Script:** *"Deals page has 4 summary stats: Total Pipeline ₹X, Weighted Value (value × win%), Avg Probability %, and count. The table colour-codes each stage — Discovery, Qualified, Proposal, Negotiation, Closed Won, Closed Lost. Win probability bar is colour-coded too: green ≥70%, amber ≥40%, rose below 40%."*

Quickly scan a row: e.g. "Wealth Suite - 2yr Plan" is **Closed Won** (accent green, 100% bar).

**Action:** Click **Tasks**.

> **Script:** *"Tasks are grouped into To Do / In Progress / Done. Overdue tasks pulse red with the AlertTriangle icon. Due-today tasks have a yellow badge. Clicking the circular checkbox cycles todo → in_progress → done atomically via the PATCH endpoint."*

**Action:** Click the open circle checkbox on any task — watch it cycle status → done with strikethrough.

---

### ▶️ Part 8 — DBA Controls Panel (8:30 → 9:15)

**Action:** Click the **⚙️ Settings (gear) icon** in the top bar (between notification bell and user avatar).

> **Script:** *"This last panel is for DBAs and examiners. It exposes 3 direct write operations that go through the full Express → MySQL pipeline."*

Walk through the 3 mini-forms:

1. **Customer Risk** — pick Vikram Singh, set churn 0.2 → Save → "Customer churn score updated" confirmation
2. **Lead Stage** — pick a lead, set to "qualified" → Update
3. **Task Status** — pick a task, set to "in_progress" → Update

> **Script:** *"Behind the scenes, each submit goes through the same Zustand store → API client → Express route → MySQL parameterized-query path. This is great for demos because we can prove the write path end-to-end without going through all the screens."*

**Bonus:** Click the sun/moon icon in this panel to toggle **dark mode**.

---

### ▶️ Part 9 — Deployment + Wrap-Up / Q&A (9:15 → 10:00)

> **Script:** *"To wrap up: this project is production-ready for Vercel. The frontend is statically built — `npm run build` produces chunk-split bundles in `dist/` with vendor, charts, and icons split into separate JS files for caching. We ship a `vercel.json` with SPA rewrites so deep links like /customers/c1 work. CORS is permissive for *.vercel.app origins, and the API base URL can be overridden with VITE_API_BASE env var if we put the Express backend on Railway or Render."*

Close with:
- *"Scalability features: MySQL connection pool (20 conns), parameterized queries everywhere (no SQL injection risk), query result limits (200 rows on list endpoints), and parallel API hydration. On the DX side: TypeScript strict-friendly build, Zustand selector optimization, and Tailwind with custom design tokens for the brand/accent/ink palette."*
- *"That's the 10-minute tour. Any questions?"*

---

## 5. Key Features Deep-Dive

### 5.1 Churn Risk Detection
- **Data model:** `DECIMAL(5,4)` column on customers
- **Risk tiers:** Safe (<10%) → Monitor (10-25%) → At Risk (25-40%) → Critical (≥40%)
- **UI:** Badge colours, gradient progress bars, contextual recommendation copy in Customer Detail
- **SQL endpoint:** PATCH `/api/customers/:id/churn-score` validates `0 ≤ score ≤ 1`

### 5.2 Optimistic UI Updates
The Zustand store in [crmStore.ts](file:///c:/Users/nakul/OneDrive/Documents/Third%20Year/DBMS/Mini_Project/src/store/crmStore.ts) wraps every write with a try/catch:
1. Optimistically mutate local state
2. Fire the API in parallel
3. If API fails → silently ignore OR roll back (pattern shown for lead stage and tasks)

### 5.3 API Fallback / Graceful Degradation
Every `hydrateFromApi()` call is wrapped in a catch. If the MySQL/Express backend isn't available, the frontend runs 100% on embedded mock data from [mockData.ts](file:///c:/Users/nakul/OneDrive/Documents/Third%20Year/DBMS/Mini_Project/src/data/mockData.ts) — including leads, deals, tasks, activities, revenue chart, and funnel.

This is why the **Vercel static demo is fully usable without MySQL running**.

### 5.4 Parallel Hydration
```ts
await Promise.all([
  api.listCustomers(),    // MySQL
  api.listLeads(),        // MySQL
  api.listDeals(),        // MySQL
  api.listTasks(),        // MySQL
  api.listStaff(),        // MySQL
  api.getActivity(),      // MySQL (interactions)
  api.getKPIs(),          // MySQL (aggregation)
  api.getRevenue(),       // MySQL (view)
  api.getFunnel(),        // MySQL (view)
]);
```

9 concurrent API calls → React mounts with a complete store instead of waterfalling requests.

### 5.5 Dark Mode
Toggle via the DBA gear panel (sun/moon icons). Uses `darkMode: "class"` in Tailwind and persists to `localStorage` with OS preference fallback.

---

## 6. API Endpoints Reference

All endpoints live under `/api/*` (Express routes in `api/routes/`).

### Auth
| Method | Path                  | Body { email, password } | Returns Staff JSON or 401 |
|--------|-----------------------|--------------------------|---------------------------|
| POST   | `/api/auth/login`     | ✅                        | [auth.ts](file:///c:/Users/nakul/OneDrive/Documents/Third%20Year/DBMS/Mini_Project/api/routes/auth.ts) |

### Dashboard
| Method | Path                        | Query           | Returns                          |
|--------|-----------------------------|-----------------|----------------------------------|
| GET    | `/api/dashboard/kpis`       | —               | Revenue, leads, conv%, churn count |
| GET    | `/api/dashboard/revenue`    | —               | 12 months from `monthly_revenue` view |
| GET    | `/api/dashboard/funnel`     | —               | Stages from `funnel_summary` view |
| GET    | `/api/dashboard/activity`   | —               | Last 20 interactions (joined)    |
| GET    | `/api/dashboard/at-risk`    | —               | Customers with churn ≥ 0.35 (LIMIT 10) |

### CRUD
| Method | Path                                       | Query / Body                                |
|--------|--------------------------------------------|---------------------------------------------|
| GET    | `/api/customers`                           | `search`, `industry`, `churn_tier`          |
| GET    | `/api/customers/:id`                       | Returns customer + leads + deals + interactions |
| PATCH  | `/api/customers/:id/churn-score`           | `{ churn_score: number }`                   |
| GET    | `/api/leads`                               | `stage`                                     |
| PATCH  | `/api/leads/:id/stage`                     | `{ stage: LeadStage }`                      |
| GET    | `/api/deals`                               | `search`                                    |
| GET    | `/api/tasks`                               | — (ordered by status → priority → due)      |
| PATCH  | `/api/tasks/:id/status`                    | `{ status? }` (auto-cycle if omitted)       |
| GET    | `/api/staff`                               | —                                           |
| GET    | `/api/staff/:id`                           | —                                           |
| POST   | `/api/ai/lead-insights`                    | `{ leads: Lead[] }` → Python scorer JSON    |

### Health
| Method | Path          | Returns DB status + app version |
|--------|---------------|----------------------------------|
| GET    | `/healthz`    | `{ ok: true, database: "connected", version: "1.0.0" }` |

---

## 7. Scalability & Best Practices

### ✅ Done
- **MySQL connection pooling** — 20 connections, 60s idle timeout, keepalive enabled
- **Parameterized queries** — **no SQL string interpolation anywhere** (grep: all route handlers use `?` placeholders)
- **Payload size cap** — `express.json({ limit: "2mb" })` to prevent body-based DoS
- **LIMIT clauses** — customer list capped at 200 rows, activity at 20, at-risk at 10
- **SPA chunk splitting** — vendor/charts/icons split for browser cache reuse
- **Immutable asset caching** — Vercel `/assets/*` = `Cache-Control: max-age=31536000, immutable`
- **CORS with origin safelist** — localhost + vercel.app wildcard + explicit comma-list

### 🚦 Easy next steps (for post-demo scaling)
- Rate limiting with `express-rate-limit`
- JWT sessions instead of localStorage-only login
- Password hashing: replace plain `password_hash` compare with `bcrypt`
- Add `node-cluster` or PM2 for multi-core API process
- Redis cache layer for dashboard KPIs (TTL 60s)
- Read replica MySQL for GET-only routes

---

## 8. Vercel Deployment Guide

This project ships with a production-ready [vercel.json](file:///c:/Users/nakul/OneDrive/Documents/Third%20Year/DBMS/Mini_Project/vercel.json). Two deployment modes:

### 🅰️ Mode A — Frontend Only (Static, Works Out of the Box)
*(Used for the 10-min demo. All mock data embedded. Login always succeeds with the seeded user.)*

1. Push this repository to GitHub.
2. Visit [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework = **Vite** (auto-detected).
4. Build command / output dir auto-populated from `vercel.json`.
5. **No environment variables required** for this mode.
6. Click Deploy → wait ~60 s → open the `*.vercel.app` URL.

### 🅱️ Mode B — Full Stack (Frontend + Remote MySQL + Hosted API)
*(For real usage. Requires a public MySQL and a Node host.)*

1. **Host MySQL publicly**: PlanetScale, Aiven MySQL, Railway MySQL, AWS RDS, or Supabase (which exposes MySQL port).
2. Run `database/schema.sql` → `indexes.sql` → `views.sql` → `seed_data.sql` on the remote DB.
3. **Host Express API** on Railway / Render / Fly.io / DigitalOcean App Platform with env vars:
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
   - `WEB_ORIGIN=https://your-vercel-project.vercel.app`
4. **Deploy the Vercel frontend again**, this time adding the Env Variable in Vercel dashboard:
   - `VITE_API_BASE = https://your-api-host.example.com/api`
5. Redeploy in Vercel (the new env var takes effect after redeploy).

**Login still works** — `aarav@smartcrm.io` / `smartcrm123` is in the seed data.

---

## 9. Local Development Setup

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8 or MariaDB ≥ 10.5 running locally (XAMPP works great)
- Optional: Python ≥ 3.10 for AI scoring module

### 1. Install
```bash
cd "c:\Users\nakul\OneDrive\Documents\Third Year\DBMS\Mini_Project"
npm install
```

### 2. Environment
Copy `.env.example` → `.env` and set MySQL creds. **Do NOT commit `.env`** (it's already gitignored).

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=smart_crm
API_PORT=4000
WEB_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

### 3. Seed the Database
Runs schema, indexes, views, and sample data all at once:
```bash
npm run db:setup
```

### 4. Run Both Servers
```bash
npm run dev:all   # WEB :5173 + API :4000 together in one terminal
```

Or separately:
```bash
npm run dev:server   # Express on http://localhost:4000
npm run dev          # Vite    on http://localhost:5173
```

### 5. Verify
```bash
curl http://localhost:4000/healthz
# → {"ok":true,"database":"connected","version":"1.0.0"}
```

### 6. Quality Gates
```bash
npm run check    # TypeScript strict compile (no emit)
npm run lint     # ESLint + typescript-eslint
npm run build    # Production build → dist/
```

---

## 10. Folder Structure

```
Mini_Project/
├── api/                         # Express backend (Node + TS via tsx)
│   ├── routes/                  # One Router per domain entity
│   │   ├── auth.ts
│   │   ├── customers.ts
│   │   ├── dashboard.ts
│   │   ├── deals.ts
│   │   ├── leads.ts
│   │   ├── staff.ts
│   │   ├── tasks.ts
│   │   └── ai.ts                # Python scorer bridge
│   ├── db.ts                    # mysql2 pool + helpers
│   └── server.ts                # Express app + CORS + routes
│
├── database/                    # All SQL artefacts
│   ├── migrations/              # Flyway-style versioned DDL
│   │   ├── V1__init_schema.sql
│   │   ├── V2__add_lead_scores.sql
│   │   └── V3__add_churn_scores.sql
│   ├── schema.sql               # All CREATE TABLEs (reference)
│   ├── indexes.sql              # Non-key indexes for perf
│   ├── views.sql                # monthly_revenue, funnel_summary
│   ├── seed_data.sql            # Demo records (staff + customers + …)
│   ├── queries.sql              # Example SELECT queries (exam Q&A ref)
│   └── users.sql                # Staff auth records
│
├── python/
│   ├── lead_insights.py         # Pure-Python lead scorer
│   └── tests/test_lead_insights.py
│
├── scripts/                     # One-off helper scripts
│   └── setup_db.ts              # Runs schema + seeds in order
│
├── src/                         # React / Vite frontend
│   ├── api/client.ts            # typed fetch wrapper for all /api/* endpoints
│   ├── components/              # Layout, Sidebar, Topbar, AdminPanel, Empty
│   ├── data/mockData.ts         # Fallback seed data (used when API offline)
│   ├── hooks/useTheme.ts        # Light/Dark mode hook
│   ├── lib/utils.ts             # cn() — clsx + tailwind-merge
│   ├── pages/                   # React Router pages
│   │   ├── Dashboard.tsx        # KPIs, charts, AI panel
│   │   ├── Customers.tsx        # Searchable table
│   │   ├── CustomerDetail.tsx   # 360° account profile
│   │   ├── Pipeline.tsx         # Drag-drop Kanban
│   │   ├── Deals.tsx
│   │   ├── Tasks.tsx            # Kanban tasks
│   │   ├── Login.tsx
│   │   └── UserProfile.tsx
│   ├── store/crmStore.ts        # Zustand store: state + hydrators + selectors
│   ├── types/index.ts           # Customer, Lead, Deal, Task, Staff interfaces
│   ├── App.tsx                  # React Router routes
│   ├── main.tsx
│   └── index.css                # Tailwind directives + design tokens
│
├── public/favicon.svg
├── dist/                        # Build output (auto-generated)
├── index.html                   # Vite entry
├── package.json
├── vite.config.ts               # Chunk splitting + TS paths
├── tailwind.config.js           # Brand/accent/ink tokens + animations
├── tsconfig.json                # @/* → src/* alias included
├── postcss.config.js
├── eslint.config.js
├── .env.example                 # Template (no real secrets)
├── .gitignore                   # .env, node_modules, .vercel, XAMPP data
├── vercel.json                  # Vercel build config + SPA rewrites
├── postman_collection.json      # Import into Postman for API testing
├── RUN.md                       # Terse quick-start
└── README.md                    # You are here
```

---

## 11. Login Credentials

These users are seeded by `database/seed_data.sql`:

| Email                   | Password      | Role               |
|-------------------------|---------------|--------------------|
| `aarav@smartcrm.io`     | `smartcrm123` | Sales Manager      |
| `priya@smartcrm.io`     | `smartcrm123` | Account Executive  |
| `rohan@smartcrm.io`     | `smartcrm123` | SDR                |
| `ananya@smartcrm.io`    | `smartcrm123` | CSM                |
| `karan@smartcrm.io`     | `smartcrm123` | Account Executive  |

> 💡 **For the demo, use:** `aarav@smartcrm.io` / `smartcrm123` (Sales Manager account)

---

**End of documentation.** Good luck with the presentation! 🎯
#   S m a r t _ C R M  
 