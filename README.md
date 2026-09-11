# NSA Evaluation Appointment Management System

A standalone prototype for replacing a manual evaluation appointment workflow with a centralized NSS Personnel and administrator portal. It is intentionally designed as an independent application and does not copy NSA source code, proprietary assets, or the existing NSA website design.

## Problem being solved

The traditional workflow can require NSS Personnel to submit a form, administrators to manually allocate dates and time slots, and appointment lists to be distributed as PDFs. This prototype centralizes registration, slot availability, booking, appointment status, attendance, search, and reporting in one application.

## Features

### NSS Personnel portal
- NSS Personnel registration, login and logout
- Secure bcrypt password hashing
- NSS Personnel dashboard with current appointment
- Published evaluation discovery
- Capacity-aware time slot selection
- Duplicate-booking prevention
- Database-backed appointment references such as `EVA-2026-00001`
- Immediate appointment confirmation
- Appointment history and status
- Cancellation of eligible BOOKED appointments
- Same-evaluation rescheduling flow
- Mobile-responsive interface

### Admin portal
- Separate administrator login
- Dashboard statistics
- Evaluation creation and publishing
- Time slot creation and capacity management
- Protection against deleting slots with active bookings
- Appointment search by name, NSS Personnel ID or reference
- Date and status filters
- Attendance/status management: BOOKED, CHECKED_IN, COMPLETED, MISSED, CANCELLED
- NSS Personnel list showing NSS Personnel who have not booked
- CSV export
- Printable PDF export

### Security and reliability
- Express session authentication
- Role-based route middleware
- Helmet security headers
- Server-side validation
- Database constraints and indexes
- PostgreSQL transaction with row locking and serializable isolation for booking capacity protection
- Friendly error pages without stack traces

## Technology stack

- Node.js
- Express.js
- EJS
- HTML5/CSS3
- Bootstrap 5
- Vanilla JavaScript
- PostgreSQL
- node-postgres (`pg`)
- bcrypt
- express-session
- dotenv
- Helmet
- PDFKit for PDF export

Helmet is included because it is explicitly required as a security best practice. PDFKit is the lightweight additional dependency used for the requested PDF export.

## Project structure

```text
nsa-evaluation-system/
├── database/
│   ├── schema.sql
│   ├── setup.js
│   └── seed.js
├── public/
│   ├── css/style.css
│   └── js/app.js
├── views/
│   ├── partials/
│   ├── auth/
│   ├── student/
│   ├── admin/
│   └── errors/
├── routes/
├── controllers/
├── middleware/
├── services/
├── utils/
├── app.js
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## Database setup

Create a PostgreSQL database, for example:

```sql
CREATE DATABASE nsa_evaluation;
```

Copy `.env.example` to `.env` and set `DATABASE_URL` to the PostgreSQL connection string.

Example:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nsa_evaluation"
```

## Environment variables

```text
DATABASE_URL=PostgreSQL connection string
SESSION_SECRET=long random session secret
PORT=3000
NODE_ENV=development
```

Never commit `.env` or production secrets.

## Installation

```bash
npm install
npm run db:setup
```

## PostgreSQL schema setup

Create the tables and enum types directly in PostgreSQL:

```bash
npm run db:setup
```

## Seed data

```bash
npm run seed
```

The seed creates fictional demonstration data only.

## Demo credentials

### Administrator
- Email: `admin@nsa-demo.local`
- Password: `Admin@12345`

### NSS Personnel
- Email: `ama.student@nsa-demo.local`
- Password: `Student@12345`

Other seeded NSS Personnel emails include `kojo.student@nsa-demo.local`, `efua.student@nsa-demo.local`, `kofi.student@nsa-demo.local`, and `abena.student@nsa-demo.local`, all using the same demo password.

Do not use these credentials in a real deployment.

## Run locally

```bash
npm install
npm run db:setup
npm run seed
npm run dev
```

Production-style startup:

```bash
npm start
```

Open `http://localhost:3000`.

## Routes overview

### Public
- `GET /`
- `GET /login`
- `POST /login`
- `GET /register`
- `POST /register`
- `GET /logout`
- `GET /admin/login`
- `POST /admin/login`

### NSS Personnel
- `GET /student/dashboard`
- `GET /student/evaluation`
- `POST /student/book`
- `GET /student/appointment/:id`
- `POST /student/appointment/:id/cancel`
- `POST /student/appointment/:id/reschedule`
- `GET /student/history`
- `GET /student/profile`
- `GET /student/api/evaluations/:evaluationId/slots`

### Admin
- `GET /admin/dashboard`
- `GET /admin/evaluations`
- `GET /admin/evaluations/create`
- `POST /admin/evaluations`
- `GET /admin/evaluations/:id`
- `POST /admin/evaluations/:id/slots`
- `POST /admin/slots/:id/update`
- `POST /admin/slots/:id/delete`
- `GET /admin/appointments`
- `POST /admin/appointments/:id/status`
- `GET /admin/students`
- `GET /admin/reports`
- `GET /admin/reports/export.csv`
- `GET /admin/reports/export.pdf`

## Booking concurrency

The booking service runs the booking operation inside a PostgreSQL transaction using serializable isolation. The selected `TimeSlot` row is explicitly locked with `SELECT ... FOR UPDATE` before the active appointment count is checked. The capacity check and appointment creation therefore occur as one protected operation. The database also enforces a unique `(studentId, evaluationId)` constraint so a student cannot have two non-cancelled bookings for the same evaluation through normal application flow.

For a larger production deployment, the appointment reference generator should be moved to a database sequence/counter to make reference allocation fully independent of appointment IDs, and retry handling for serialization conflicts should be added around high-contention transactions.

## Validation and error handling

The application validates registration and login server-side, performs browser validation for required fields, rejects invalid dates/times/capacities, handles duplicate accounts and bookings, checks authorization, prevents deletion of occupied slots, and returns generic server-error pages without exposing stack traces.

## Deployment

1. Provision PostgreSQL.
2. Set production `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, and `PORT`.
3. Install dependencies with `npm install`.
4. Run `npm run db:setup`.
5. Run `npm run seed` if demonstration data is required.
6. Seed only if demonstration data is desired.
7. Start with `npm start`.
8. Put the Node.js process behind a TLS-terminating reverse proxy or managed platform.
9. Use a production session store instead of the default in-memory session store before handling real traffic.
10. Rotate demo credentials and use a strong randomly generated session secret.

## Future improvements

- PostgreSQL-backed session store
- CSRF protection
- Rate limiting and account lockout
- Email/SMS appointment notifications
- Audit log for administrator actions
- Multi-evaluation booking rules configurable by administrators
- Pagination for large appointment and NSS Personnel datasets
- Calendar views
- Bulk import of NSS Personnel
- More granular administrator permissions
- Database-backed appointment reference sequence
- Automated reminders and missed-appointment workflows
- Accessibility audit and WCAG-focused refinements
- Automated integration/load tests for booking concurrency

## Testing notes

The source tree has been checked for JavaScript syntax errors. The build environment used to assemble this prototype does not have PostgreSQL or npm registry DNS/network access, so a live migration, seed execution, and full browser/database integration test could not be executed in this environment. On a machine with PostgreSQL and normal npm registry access, follow the installation and migration steps above before starting the server.
