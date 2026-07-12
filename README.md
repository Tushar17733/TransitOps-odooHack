# TransitOps — Smart Fleet Operations Platform

A full-stack fleet management system built for the Odoo Hackathon. TransitOps helps transport companies manage their vehicles, drivers, trips, maintenance schedules, fuel consumption, and operational costs — all through a role-aware interface that shows each user only what's relevant to their job. It is secured end-to-end with JWT authentication and a four-role RBAC system enforced at both the API and UI levels.

---

## Screenshots / Demo

> **[Add screenshots or GIF here before submission]**
>
> Suggested captures: Login page → Fleet Dashboard (fleet_manager) → Add Vehicle dialog with validation → Create Trip with cargo check → Maintenance close form → Reports tabs → Role-specific dashboards for each of the 4 roles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22, Angular Material M3, SCSS, TypeScript 6 |
| Backend | Node.js v24, Express.js, Sequelize ORM (MySQL dialect) |
| Database | MySQL 8.0 |
| Auth | JWT (HS256, 7-day expiry) + Role-Based Access Control |
| Styling | Custom SCSS design tokens, Google Fonts (Inter, Plus Jakarta Sans) |

---

## Project Structure

```
TransitOps-odooHack/
├── backend/
│   ├── server.js                  # Entry point — DB connect, sync, seed, listen
│   ├── .env                       # Secret config (never committed — see setup below)
│   └── src/
│       ├── app.js                 # Express setup, CORS, route mounting
│       ├── config/                # constants.js (roles, statuses, types)
│       ├── database/              # Sequelize instance + all model associations
│       ├── middlewares/           # auth.js, rbac.js (permit()), validate.js, errorHandler.js
│       ├── utils/                 # AppError class, success/error response helpers
│       └── modules/
│           ├── auth/              # Login, register, /me
│           ├── dashboard/         # Aggregated KPI query
│           ├── vehicles/          # CRUD + retire + dispatchable list
│           ├── drivers/           # CRUD + dispatchable list
│           ├── trips/             # Full lifecycle: draft→dispatch→complete/cancel + /mine
│           ├── maintenance/       # Open/close workflow with vehicle status sync
│           ├── fuelExpense/       # Fuel logs + expense ledger
│           ├── reports/           # Fuel efficiency, operational cost, fleet utilization, ROI
│           └── users/             # User listing (admin use)
│
└── frontend/
    └── src/
        ├── styles.scss            # Global styles, Angular Material overrides, animations
        ├── styles/
        │   ├── _variables.scss    # Design tokens (colors, shadows, radii, fonts)
        │   └── _mixins.scss       # Shared SCSS mixins
        └── app/
            ├── app.routes.ts      # Route definitions with roleGuard on all protected paths
            ├── core/
            │   ├── auth/          # AuthService (signals), JWT storage
            │   ├── guards/        # auth.guard.ts, role.guard.ts (functional factory)
            │   ├── interceptors/  # JWT attach + 401 redirect interceptor
            │   ├── models/        # TypeScript interfaces for all entities + API response
            │   ├── services/      # Per-module API services (api.service wraps HttpClient)
            │   └── validators/    # app.validators.ts — shared reactive form validators
            ├── features/
            │   ├── auth/          # Login page with demo account cards
            │   ├── dashboard/     # Role-specific KPI dashboard
            │   ├── vehicles/      # Vehicle list + add/edit dialog
            │   ├── drivers/       # Driver list + add/edit dialog
            │   ├── trips/         # Trip list + create dialog (fleet_manager / driver views)
            │   ├── maintenance/   # Maintenance log per vehicle + inline close form
            │   ├── fuel-expense/  # Tabbed fuel logs + expense ledger
            │   └── reports/       # 4-tab report suite (Fuel / Ops Cost / Utilization / ROI)
            └── layout/
                └── shell.component.ts  # Dark sidebar + toolbar shell with role-filtered nav
```

---

## Implemented Features

### Auth & RBAC
- JWT login with bcrypt-verified passwords (10 rounds)
- Four roles: `fleet_manager`, `safety_officer`, `financial_analyst`, `driver`
- Route guards on every frontend route (`roleGuard` factory)
- API RBAC middleware (`permit(...roles)`) on every write endpoint
- Demo accounts seeded automatically on every server start (idempotent)
- Login page has one-click demo account cards that auto-fill credentials

### Dashboard (role-specific)
| Role | Title | KPI Cards Shown |
|---|---|---|
| fleet_manager | Fleet Dashboard | All 7 cards + full breakdown |
| safety_officer | Safety Dashboard | Vehicles, In Maintenance, Available, Drivers On Duty |
| financial_analyst | Financial Dashboard | Total Vehicles, Active Trips, Pending Trips, Fleet Utilization |
| driver | My Dashboard | Active Trips, Pending Trips only |

Each role also sees a personalised greeting ("Good morning, Rajesh 👋") and a colour-coded role badge.

### Vehicles (fleet_manager full access; safety_officer read)
- Add, edit, retire vehicles
- Fields: registration number, name, model, type, max load capacity, acquisition cost, odometer, region
- Status: `available` → `on_trip` (auto on trip dispatch) → `in_shop` (auto on maintenance open) → `available` (auto on trip complete / maintenance close) → `retired`
- Dispatchable endpoint filters to `available` vehicles only

### Drivers (fleet_manager + safety_officer)
- Add, edit driver profiles
- Fields: full name, contact number, license number, license category (LMV/HMV/MCWG/TRANS/PSV), expiry date, safety score (0–100)
- Safety score visible/editable only by `safety_officer`
- Expiry warning shown in edit form when < 30 days to expiry
- Dispatchable endpoint filters to `available` drivers with valid (non-expired) licenses

### Trips (fleet_manager creates; driver views own trips)
- Full lifecycle: `draft` → `dispatched` → `completed` / `cancelled`
- Vehicle status auto-transitions on dispatch (`available` → `on_trip`) and complete/cancel (`on_trip` → `available`)
- Driver status syncs the same way
- Cargo weight validated against vehicle max load capacity (cross-field, real-time)
- `/trips/mine` endpoint scoped to the authenticated driver's own trips
- Driver role UI shows only assigned trips with filtered view

### Maintenance (fleet_manager + safety_officer)
- Log maintenance events per vehicle (Preventive / Corrective / Emergency)
- Open → Close workflow; closing requires a final cost entry (inline form, no browser prompt)
- Vehicle status auto-updates: open → `in_shop`, close → `available`
- Maintenance type chips colour-coded (blue / yellow / red)

### Fuel & Expenses
- **Fuel tab** (fleet_manager + driver): log liters, cost/liter, date, odometer; live total cost preview calculated as you type
- **Expenses tab** (fleet_manager + financial_analyst): log toll, parking, other expenses with amount and date
- Both tabs scoped by vehicle selection

### Reports (fleet_manager + financial_analyst)
All four tabs load real MySQL-aggregated data:
- **Fuel Efficiency** — per-vehicle total liters, total fuel cost, fill-up count, avg ₹/liter
- **Operational Cost** — fuel + maintenance + expense breakdown per vehicle, with stacked colour bar
- **Fleet Utilization** — trip counts (total/completed/cancelled/active), total distance, completion rate progress bar
- **Vehicle ROI** — acquisition cost vs total operational cost, cost ratio badge (green/yellow/red), net investment

Each tab: 4 KPI summary cards + data table + CSV export button.

### Form Validation (project-wide)
- Shared validators in `core/validators/app.validators.ts`: `noWhitespace`, `phoneNumber` (10-digit), `registrationNumber` (uppercase alphanumeric), `licenseNumber`, `minIfPresent`, `maxIfPresent`
- All submit buttons disabled when form is invalid
- `markAllAsTouched()` on every submit attempt
- Guidance hints auto-hide when the field shows an error (never both at once)
- Keystroke-level digit blocking on all numeric and phone fields
- Auto-uppercase on registration and license number inputs

---

## Business Rules Enforced

| Rule | Where enforced |
|---|---|
| Cargo weight ≤ vehicle max load capacity | Frontend (real-time cross-field validator) + backend validation |
| Vehicle must be `available` to be dispatched | Backend `/trips` create + `/dispatchable` query |
| Driver must be `available` with non-expired license to be dispatched | Backend `/drivers/dispatchable` query |
| Vehicle status auto-transitions on trip events | Backend trip service (dispatch/complete/cancel) |
| Vehicle status auto-transitions on maintenance events | Backend maintenance service (open/close) |
| Registration number is unique | MySQL unique constraint on `vehicles.registrationNumber` |
| License number is unique | MySQL unique constraint on `drivers.licenseNumber` |
| Fuel logs and expenses cannot be future-dated | Frontend `[max]="today"` on date inputs |
| Safety score must be 0–100 | Frontend validator + backend |
| Contact number must be exactly 10 digits | Frontend validator (digit-strip on input) |

---

## Setup & Installation

### Prerequisites
- Node.js v18 or above
- MySQL 8.0 running locally
- npm

### 1. Clone

```bash
git clone <repo-url>
cd TransitOps-odooHack
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tushar
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

> **MySQL setup** — If MySQL is not running as a Windows service, start it manually:
> ```powershell
> mysqld.exe --datadir=C:\Users\YourName\MySQLData
> ```
> Create the database before starting the server:
> ```sql
> CREATE DATABASE IF NOT EXISTS tushar;
> ```

Start the backend:

```bash
npm run dev      # nodemon (hot reload)
# or
npm start
```

On first start the server will:
1. Connect to MySQL and run `sequelize.sync({ alter: true })` — creates/updates all tables
2. Seed four demo user accounts (idempotent — safe to run multiple times)

API available at: `http://localhost:3000`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App available at: `http://localhost:4200`

---

## Demo Accounts

These are seeded automatically every time the backend starts.

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `fleet@transitops.com` | `fleet123` |
| Safety Officer | `safety@transitops.com` | `safety123` |
| Financial Analyst | `finance@transitops.com` | `finance123` |
| Driver | `driver@transitops.com` | `driver123` |

> One-click demo cards on the login page fill these in automatically.

---

## API Endpoints

All routes prefixed with `/api`. All routes except `/auth/login` and `/auth/register` require a `Authorization: Bearer <token>` header.

### Auth
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, returns JWT + user object |
| POST | `/auth/register` | Public | Create a user account |
| GET | `/auth/me` | Any | Get current authenticated user |

### Vehicles
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/vehicles` | Any | List vehicles (filterable by status, type, region) |
| GET | `/vehicles/dispatchable` | Any | Available vehicles only |
| GET | `/vehicles/:id` | Any | Get single vehicle |
| POST | `/vehicles` | fleet_manager | Create vehicle |
| PUT | `/vehicles/:id` | fleet_manager | Update vehicle |
| PATCH | `/vehicles/:id/retire` | fleet_manager | Retire vehicle |

### Drivers
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/drivers` | Any | List drivers (filterable by status) |
| GET | `/drivers/dispatchable` | Any | Available + valid-license drivers only |
| GET | `/drivers/:id` | Any | Get single driver |
| POST | `/drivers` | fleet_manager, safety_officer | Create driver |
| PUT | `/drivers/:id` | fleet_manager, safety_officer | Update driver |

### Trips
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/trips` | Any | List all trips (fleet_manager, safety_officer, financial_analyst) |
| GET | `/trips/mine` | driver | Driver's own assigned trips only |
| GET | `/trips/:id` | Any | Get single trip |
| POST | `/trips` | fleet_manager | Create trip (draft status) |
| PATCH | `/trips/:id/dispatch` | fleet_manager | Dispatch trip → vehicle & driver go on_trip |
| PATCH | `/trips/:id/complete` | fleet_manager | Complete trip → vehicle & driver return to available |
| PATCH | `/trips/:id/cancel` | fleet_manager | Cancel trip → vehicle & driver return to available |

### Maintenance
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/maintenance?vehicleId=` | Any | List maintenance logs for a vehicle |
| GET | `/maintenance/:id` | Any | Get single log |
| POST | `/maintenance` | fleet_manager, safety_officer | Open maintenance → vehicle → in_shop |
| PATCH | `/maintenance/:id/close` | fleet_manager, safety_officer | Close maintenance → vehicle → available |

### Fuel & Expenses
| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/fuel-expense/fuel` | fleet_manager, driver | Log a fuel fill-up |
| GET | `/fuel-expense/fuel/vehicle/:id` | Any | Fuel logs for a vehicle |
| POST | `/fuel-expense/expense` | fleet_manager, financial_analyst | Log an expense |
| GET | `/fuel-expense/expense/vehicle/:id` | Any | Expenses for a vehicle |

### Dashboard & Reports
| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/dashboard/kpis` | Any | Aggregated fleet KPIs |
| GET | `/reports/fuel-efficiency` | fleet_manager, financial_analyst | Per-vehicle fuel cost & volume |
| GET | `/reports/operational-cost` | fleet_manager, financial_analyst | Fuel + maintenance + expense per vehicle |
| GET | `/reports/fleet-utilization` | fleet_manager, financial_analyst | Trip counts, distance, completion rate |
| GET | `/reports/vehicle-roi` | fleet_manager, financial_analyst | Acquisition vs operational cost, cost ratio |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DB_HOST` | Yes | MySQL host (usually `localhost`) |
| `DB_PORT` | Yes | MySQL port (default `3306`) |
| `DB_NAME` | Yes | MySQL database name |
| `DB_USER` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `JWT_SECRET` | Yes | Secret string for signing tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime (default `7d`) |
| `PORT` | No | API port (default `3000`) |

---

## Design System

| Token | Value |
|---|---|
| Primary | `#6366F1` (Indigo) |
| Accent | `#8B5CF6` (Violet) |
| Success | `#10B981` (Emerald) |
| Warning | `#F59E0B` (Amber) |
| Danger | `#EF4444` (Red) |
| Cyan | `#06B6D4` |
| Sidebar BG | `linear-gradient(175deg, #0D1117, #19213A)` |
| Page BG | `#F1F5F9` |
| Font (body) | Inter |
| Font (headings) | Plus Jakarta Sans |

---

## Known Limitations / Future Work

The following were intentionally out of scope for the hackathon:

- **PDF / Excel export** — reports currently export as CSV only; formatted PDF with branding is not implemented
- **Email notifications** — no email alerts for expiring licenses, overdue maintenance, or trip events
- **Document management** — no file uploads (insurance documents, RC copies, etc.)
- **Real-time updates** — no WebSocket / SSE; page must be manually refreshed to see changes made by other users
- **Dark mode** — light-only UI; dark theme toggle not implemented
- **Mobile app** — web-responsive only, no native Android/iOS build
- **Pagination on reports** — report tables load all rows at once; large fleets may see slow queries
- **Multi-tenant / multi-company** — single-company setup; no organisation isolation
- **Password reset flow** — no forgot-password / reset-by-email feature
- **Audit log** — no change history tracking per record

---

## Credits

Built for the **Odoo Hackathon** by Harsh Gondaliya.

> Frontend: Angular 22 + Angular Material M3
> Backend: Node.js + Express + Sequelize + MySQL
