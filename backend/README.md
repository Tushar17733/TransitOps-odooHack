# TransitOps Backend

Smart Transport Operations Platform API — Node.js + Express + MySQL + Sequelize.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Start MySQL

Create a database named `transitops` in MySQL Workbench or CLI:
```sql
CREATE DATABASE transitops;
```

### 4. Start the server
```bash
npm run dev       # development (nodemon)
npm start         # production
```

Server runs on `http://localhost:3000`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Enables `alter: true` sync in dev |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `transitops` | Database name |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | — | MySQL password |
| `JWT_SECRET` | — | **Change this in production** |
| `JWT_EXPIRES_IN` | `7d` | Token TTL |
| `BCRYPT_ROUNDS` | `10` | Password hash cost |

---

## API Reference

All routes are under `/api/v1/`. JWT required on every route except auth.

### Auth
| Method | Path | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Any authenticated |

### Vehicles
| Method | Path | Access |
|---|---|---|
| GET | `/vehicles` | All |
| GET | `/vehicles/dispatchable` | All |
| GET | `/vehicles/:id` | All |
| POST | `/vehicles` | Fleet Manager |
| PUT | `/vehicles/:id` | Fleet Manager |
| PATCH | `/vehicles/:id/retire` | Fleet Manager |

Query filters: `?status=available&type=truck&region=Gujarat`

### Drivers
| Method | Path | Access |
|---|---|---|
| GET | `/drivers` | All |
| GET | `/drivers/dispatchable` | All |
| GET | `/drivers/:id` | All |
| POST | `/drivers` | Fleet Manager, Safety Officer |
| PUT | `/drivers/:id` | Fleet Manager, Safety Officer |

Query filters: `?status=available`

### Trips
| Method | Path | Access |
|---|---|---|
| GET | `/trips` | All |
| GET | `/trips/:id` | All |
| POST | `/trips` | Fleet Manager |
| PATCH | `/trips/:id/dispatch` | Fleet Manager |
| PATCH | `/trips/:id/complete` | Fleet Manager |
| PATCH | `/trips/:id/cancel` | Fleet Manager |

### Maintenance
| Method | Path | Access |
|---|---|---|
| GET | `/maintenance?vehicleId=1` | All |
| GET | `/maintenance/:id` | All |
| POST | `/maintenance` | Fleet Manager |
| PATCH | `/maintenance/:id/close` | Fleet Manager |

### Fuel & Expenses
| Method | Path | Access |
|---|---|---|
| POST | `/fuel-expenses/fuel` | Fleet Manager, Driver |
| GET | `/fuel-expenses/fuel/vehicle/:vehicleId` | All |
| POST | `/fuel-expenses/expense` | Fleet Manager, Financial Analyst |
| GET | `/fuel-expenses/expense/vehicle/:vehicleId` | All |

### Dashboard
| Method | Path | Access |
|---|---|---|
| GET | `/dashboard/kpis` | All |

### Reports
| Method | Path | Access |
|---|---|---|
| GET | `/reports/fuel-efficiency` | Fleet Manager, Financial Analyst |
| GET | `/reports/operational-cost` | Fleet Manager, Financial Analyst |
| GET | `/reports/fleet-utilization` | Fleet Manager, Financial Analyst |
| GET | `/reports/vehicle-roi` | Fleet Manager, Financial Analyst |

---

## Test Credentials (after seed)

Password for all: `password123`

| Role | Email |
|---|---|
| Fleet Manager | fleet@transitops.com |
| Safety Officer | safety@transitops.com |
| Financial Analyst | finance@transitops.com |
| Driver | driver@transitops.com |

---

## Business Rules Enforced

1. Vehicle registration numbers are unique.
2. Retired / In-Shop vehicles are excluded from dispatch selection.
3. Suspended drivers and expired licenses block trip assignment.
4. Vehicle/driver already On Trip cannot be double-assigned.
5. Cargo weight validated against vehicle max load capacity.
6. **Dispatch** → vehicle + driver set to `on_trip` (transaction).
7. **Complete** → vehicle + driver restored to `available` (transaction).
8. **Cancel dispatched trip** → vehicle + driver restored to `available` (transaction).
9. **Open maintenance** → vehicle set to `in_shop` (transaction).
10. **Close maintenance** → vehicle restored to `available` (transaction, skipped if retired).
11. Safety score updates restricted to Safety Officer role.
