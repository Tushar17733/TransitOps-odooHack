# TransitOps — Fleet Management System

A production-grade, full-stack fleet management platform built for the Odoo Hackathon. Features a premium SaaS UI with live KPI dashboards, end-to-end trip lifecycle management, driver safety tracking, maintenance scheduling, and financial reporting — all secured with JWT-based role access control.

---

## Screenshots

> Login in → Dashboard → Vehicles / Drivers / Trips / Maintenance / Fuel & Expenses / Reports

The UI uses a dark indigo/violet sidebar, glassmorphism cards, smooth animations, and Angular Material M3 components throughout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22, Angular Material M3, SCSS, TypeScript |
| Backend | Node.js v24, Express.js, Sequelize ORM |
| Database | SQLite (file-based, zero-config) |
| Auth | JWT (RS256) + Role-Based Access Control |
| Fonts | Inter, Plus Jakarta Sans (Google Fonts) |

---

## Features

### Core Modules
- **Dashboard** — Live KPI cards (fleet count, active trips, utilization %), fleet status breakdown with animated gradient progress bar and real-time LIVE badge
- **Vehicles** — Full CRUD with status tracking (Available, On Trip, In Maintenance, Decommissioned), capacity & type filters
- **Drivers** — Driver profiles with license category, expiry warnings, safety scores, status management (Available, On Trip, Off Duty, Suspended)
- **Trips** — Complete trip lifecycle: Draft → Dispatched → Completed / Cancelled; cargo weight, route (source → destination), vehicle & driver assignment
- **Maintenance** — Log maintenance events per vehicle (Preventive / Corrective / Emergency), open/close workflow that auto-updates vehicle status to "In Shop"
- **Fuel & Expenses** — Fuel logs with litre/cost tracking; general expense ledger linked to vehicles and trips
- **Reports** — Aggregated financial and operational reports for fleet managers and financial analysts

### Design Highlights
- Premium dark sidebar with `linear-gradient(175deg, #0D1117→ #19213A)` and indigo/violet active nav highlight
- Glassmorphism toolbar (`backdrop-filter: blur(12px)`)
- Animated login page with floating CSS orb blobs
- Status chips with pulsing dot animations
- Card hover lift effects and micro-interaction transitions
- Fully responsive (collapses to mobile overlay sidenav at ≤ 768 px)

### Security
- JWT tokens signed with a configurable secret, expiring in 7 days
- RBAC middleware enforces route-level access per role
- Passwords hashed with bcrypt (10 rounds)
- Auth interceptor auto-redirects on token expiry (ignores 401s on the login endpoint itself)

---

## Roles

| Role | Access |
|---|---|
| `fleet_manager` | Full access to all modules including Reports |
| `safety_officer` | Vehicles, Drivers, Maintenance |
| `financial_analyst` | Fuel & Expenses, Reports |
| `driver` | View-only on assigned trips |

---

## Default Login

| Field | Value |
|---|---|
| Email | `admin@transitops.com` |
| Password | `admin123` |
| Role | Fleet Manager (full access) |

> To create additional users, call `POST /api/auth/register` with `{ name, email, password, role }`.

---

## Project Structure

```
TransitOps-odooHack/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app setup, CORS, routes
│   │   ├── config/                 # Environment config, constants
│   │   ├── database/               # Sequelize instance + model associations
│   │   ├── middlewares/            # auth.js, rbac.js, validate.js, errorHandler.js
│   │   ├── modules/
│   │   │   ├── auth/               # Login / Register
│   │   │   ├── dashboard/          # Aggregated KPI queries
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── trips/
│   │   │   ├── maintenance/
│   │   │   ├── fuelExpense/
│   │   │   ├── reports/
│   │   │   └── users/
│   │   └── utils/                  # AppError, response helpers
│   ├── database.sqlite             # SQLite data file (auto-created on first run)
│   ├── server.js                   # Entry point
│   └── .env                        # Secret config (never committed)
│
└── frontend/
    └── src/
        ├── app/
        │   ├── core/
        │   │   ├── auth/           # AuthService, AuthGuard, JWT interceptor
        │   │   ├── interceptors/   # HTTP auth + error interceptor
        │   │   ├── models/         # TypeScript interfaces
        │   │   └── services/       # Per-module API services
        │   ├── features/
        │   │   ├── auth/           # Login component
        │   │   ├── dashboard/
        │   │   ├── vehicles/
        │   │   ├── drivers/
        │   │   ├── trips/
        │   │   ├── maintenance/
        │   │   ├── fuel-expense/
        │   │   └── reports/
        │   └── layout/
        │       └── shell.component.ts  # Sidebar + toolbar shell
        ├── styles/
        │   └── _variables.scss     # Design tokens (colors, shadows, radii)
        └── styles.scss             # Global styles, Material overrides, animations
```

---

## Getting Started

### Prerequisites
- Node.js v18+ (developed on v24)
- npm

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
PORT=3000
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

Start the API server:

```bash
npm run dev      # nodemon (hot reload)
# or
npm start        # production
```

The API will be available at `http://localhost:3000`. The SQLite database (`database.sqlite`) is created automatically on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200` in your browser.

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login, returns JWT token |
| POST | `/auth/register` | Create a new user account |

### Vehicles
| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/vehicles` | Yes |
| POST | `/vehicles` | fleet_manager |
| PUT | `/vehicles/:id` | fleet_manager |
| DELETE | `/vehicles/:id` | fleet_manager |

### Drivers
| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/drivers` | Yes |
| POST | `/drivers` | fleet_manager, safety_officer |
| PUT | `/drivers/:id` | fleet_manager, safety_officer |

### Trips
| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/trips` | Yes |
| POST | `/trips` | fleet_manager |
| PATCH | `/trips/:id/dispatch` | fleet_manager |
| PATCH | `/trips/:id/complete` | fleet_manager |
| PATCH | `/trips/:id/cancel` | fleet_manager |

### Maintenance
| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/maintenance?vehicleId=` | Yes |
| POST | `/maintenance` | fleet_manager |
| PATCH | `/maintenance/:id/close` | fleet_manager |

### Fuel & Expenses
| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/fuel-expense/fuel` | Yes |
| POST | `/fuel-expense/fuel` | fleet_manager |
| GET | `/fuel-expense/expenses` | Yes |
| POST | `/fuel-expense/expenses` | fleet_manager, financial_analyst |

### Dashboard & Reports
| Method | Endpoint | Auth Required |
|---|---|---|
| GET | `/dashboard/kpis` | Yes |
| GET | `/reports/summary` | fleet_manager, financial_analyst |

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `3000` |
| `JWT_SECRET` | Secret for signing JWT tokens | `changeme_in_production` |
| `JWT_EXPIRES_IN` | Token validity period | `7d` |
| `BCRYPT_ROUNDS` | bcrypt salt rounds | `10` |

> `.env` is git-ignored. Never commit real secrets.

---

## Design System

| Token | Value |
|---|---|
| Primary | `#6366F1` (Indigo) |
| Secondary | `#8B5CF6` (Violet) |
| Accent | `#06B6D4` (Cyan) |
| Success | `#10B981` (Emerald) |
| Warning | `#F59E0B` (Amber) |
| Error | `#EF4444` (Red) |
| Sidebar BG | `#0D1117 → #19213A` (gradient) |
| Page BG | `#F1F5F9` (Slate 100) |
| Font | Inter (body), Plus Jakarta Sans (headings) |

---

## Built With

- [Angular](https://angular.dev/) — Frontend framework
- [Angular Material](https://material.angular.io/) — M3 component library
- [Express.js](https://expressjs.com/) — REST API framework
- [Sequelize](https://sequelize.org/) — ORM for SQLite
- [JSON Web Tokens](https://jwt.io/) — Stateless authentication
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — Password hashing
