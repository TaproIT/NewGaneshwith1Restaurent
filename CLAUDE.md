# CLAUDE.md — Ganesh Garden Hotel Management System

Guidance for Claude (and humans) working in this repository. Read this first, then the analysis in
[`claude-outputs/`](./claude-outputs/README.md) before changing anything.

> Last reviewed: 2026-10-16 · Branch at time of review: `sanuda/system_enhance` (from `main` @ `3296671`)

---

## 1. What this system is

An internal hotel operations app for two properties on Marakolliya Beach, Tangalle, Sri Lanka:

| Code value (`hotel` / `restaurantType`) | Property | Restaurant |
|---|---|---|
| `Ganesh Garden Beach Cabana` / `Beach` | Ganesh Garden Beach Cabana | Mahi Mahi Sea Food Restaurant |
| `Marakolliya Beach Resort` / `Pool` | Marakolliya Beach Resort | Sunset Pool Bar & Restaurant |

Modules: **Reception** (check-in/onboarding, room availability, room switching, booking updates, checkout & final bill,
proforma invoices, room reports), **Pool & Beach restaurants** (POS-style orders with tokens, tables, hold orders,
bills, daily summaries, Excel export), **Beverage inventory** (stock, liquor usage), **Admin** (users, rooms,
currency rates, reports). Receipts/invoices print through **QZ Tray** (thermal ESC/POS + A4 HTML).

Staff roles (`backend/src/utils/enums/user-role.js`): `Super-Admin`, `Admin`, `Reception`,
`Beach-Restaurant-Staff`, `Pool-Restaurant-Staff`, `Beach-Restaurant-Admin`, `Pool-Restaurant-Admin`.
A user's restaurant (`Beach`/`Pool`) is derived from their role (`utils/user-util.js`); Admin/Super-Admin have none.

## 2. Stack

| Layer | Tech |
|---|---|
| Backend | Node.js (ES modules), Express 5, Mongoose 8 (MongoDB Atlas, transactions used in places), JWT (jsonwebtoken), bcrypt, socket.io, node-cron, ExcelJS, Cloudinary (QR images), Nodemailer (Gmail), qrcode |
| Frontend | React 19 + TypeScript 5.8, Vite 7, Redux Toolkit, React Router 7, Tailwind CSS 4, shadcn/ui (Radix), react-hook-form + zod, react-toastify, chart.js, socket.io-client |
| Hosting (from config) | API on Render (`*.onrender.com`), frontend on Vercel (SPA rewrite in `frontend/vercel.json`) |
| Ops | `.github/workflows/google-drive-backup.yml` — daily `mongodump` → Cloudflare R2 (despite the file name) |

## 3. Commands

```bash
# Backend (from backend/)
npm install
npm run dev        # nodemon server.js  (port from PORT, default 4000)
npm start          # node server.js

# Frontend (from frontend/)
npm install
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # tsc -b && vite build
npm run lint       # eslint (currently fails: 132 errors, mostly no-explicit-any — don't add more)
```

There are **no automated tests** in either package (`backend` `npm test` is the npm placeholder) and no CI checks.
`npm run build` type-checks (`tsc -b`) and passes; the output is a single ~1.2 MB JS chunk.

## 4. Repository map

```
backend/
  server.js                    # app bootstrap: CORS, routes, socket.io, cron
  src/config/                  # db-config.js, cors-config.js (UNUSED), " cloudinary.js" (filename has a leading space; unused)
  src/routes/                  # one router per module; mounted under /api/v1/* in server.js
  src/controllers/             # all business logic lives here (no service layer)
    Reception/booking-controller.js            # ~2k lines: create/switch/update bookings, lists, email/WhatsApp
    Reception/total-bill-calculation-controller.js  # billing summary (GET that also writes) + checkout
    order-controller.js                        # ~2.2k lines: restaurant orders, tokens, tables, summaries, Excel
  src/models/                  # Mongoose schemas (Booking, Room, Order, OrderToken, Beverage, ...)
  src/middleware/              # verify-token.js, check-black-list-token.js, role-authorize.js
  src/utils/                   # token/auth helpers, counters, QR, WhatsApp link, stock updates, cron, socket
  src/validations/             # auth-validations.js (used), guest-validations.js (UNUSED)
frontend/
  src/App.tsx                  # all routes (single ProtectedRoute = "has a token"; no role guard)
  src/Layout/                  # Layout, Sidebar (role-based nav config), Header
  src/api/axios.tsx            # axios instance, Bearer token from localStorage, 401 => hard redirect to "/"
  src/api/order/*.ts           # createAsyncThunk wrappers for restaurant endpoints
  src/features/**              # Redux slices
  src/pages/**                 # route-level pages (reception, beach-restaurant, admin, login)
  src/component/**             # feature components (NOTE: two folders: component/ and components/ui/)
  src/components/ui/**         # shadcn primitives — keep generated style
  src/util/print*.ts           # QZ Tray printing (A4 HTML bills/invoices; base64 logo inline)
claude-outputs/                # analysis reports written by Claude (see README inside)
```

## 5. Environment variables (names only — never paste values anywhere)

Backend (`backend/.env`): `PORT`, `MONGO_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `API_ORIGINS`
(comma-separated, used for CORS), `SOCKET_IO_ORIGINS` (comma-separated), `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`, `EMAIL_USER`, `EMAIL_PASS`, optional
`EMAIL_FROM_NAME`. Present but unused by code: `SALT_ROUNDS` (code reads `SALT`), `BASE_LOCAL_URL`, `BASE_DEV_URL`,
`TWILIO_*`, `WHATSAPP_NUMBER`.

Frontend (`frontend/.env`): `VITE_API_URL` (optional override), `VITE_API_URL_LOCAL`, `VITE_API_URL_DEV`.
`Step02.tsx` reads `import.meta.env.SOCKET_URL`, which Vite never exposes (needs a `VITE_` prefix).

> ⚠️ Both `.env` files are **tracked in git** even though `.gitignore` lists them. Treat every secret in them as
> compromised; see `claude-outputs/02-security-review.md` (SEC-01).

## 6. Domain rules & gotchas (read before touching billing, dates or stock)

- **Timezone:** business day = `Asia/Colombo` (UTC+05:30). Some code uses dayjs `.tz(TZ)`, other code uses
  `new Date("YYYY-MM-DD")` / `setHours` / `$dayOfMonth` (UTC or server-local). The server likely runs in UTC.
  Always normalise to Colombo start-of-day for anything date-based.
- **Room availability** is a single boolean `Room.isBooked` (+ `isMaintenance`), not a date-range calendar. The UI
  fixes check-in to today; there is no future-reservation model and no booking-cancellation endpoint.
- **Money:** stored as JS `Number` (floats), except `Invoice.total` (`Decimal128`). Room prices can be LKR/USD/EUR;
  billing converts to LKR with the **latest** `CurrencyValue` (`usd`/`eur` = LKR per unit) at billing time.
- **Hotel checkout:** `GET /booking/final-billing/:id/billing-summary` recomputes and **persists** totals;
  `POST .../checkout` then validates the client's numbers against those persisted values. Tax and service charge
  are hard-coded to 0 on hotel checkout; restaurant bills add a hard-coded 10 % service charge.
- **Restaurant "Room" payment** = two separate calls from the browser (complete order, then attach order to booking).
  The booking bill only includes orders in `booking.orders`.
- **Passwords are 4-digit numeric PINs** (enforced by `validations/auth-validations.js`). Login also requires the
  user's role.
- **Stock:** selling a beverage decrements `Beverage.runningStock` outside the order transaction; liquor used in
  food/cocktails is only logged (`historyVolumeForPBFoodNet`), not decremented.
- Response shapes are inconsistent across controllers (`{status,message,data}` vs `{success,data}` vs raw arrays vs
  `{error}`); check the specific controller before consuming an endpoint.
- Mongoose option typos: several schemas use `enums:` instead of `enum:` (no validation happens).

## 7. Conventions to keep (and the ones not to copy)

Keep: ES modules; `src/routes → src/controllers → src/models` layering; `sendSuccessResponse/sendErrorResponse`
for new endpoints; `verifyTokenNotBlacklisted, authenticateToken, authorizeRoles([...])` on every non-public route;
dayjs with `Asia/Colombo` for dates; new frontend calls as Redux Toolkit thunks under `src/api/**` (until the planned
move to RTK Query, see FE-02 in `claude-outputs/04-frontend-review.md`); shadcn
primitives from `@/components/ui`; `@/` import alias.

Do not copy: large commented-out blocks, `console.log` of request data, `req.body` spread into models,
`new RegExp(userInput)`, fire-and-forget async calls, client-side-only role checks, hard-coded hex colours.

Theme colours: use the tokens `primary`, `secondary`, `bg`, `primary-soft` (e.g. `bg-primary`, `text-secondary`)
for brand colours so the theme switcher works. Room/table status, order-type, menu-category and danger colours stay
fixed. Palettes live in `frontend/src/index.css` (`[data-palette]` blocks) and `frontend/src/lib/theme-palettes.ts`;
see `claude-outputs/07-theme-switching.md`.

## 8. How Claude should work in this repo

1. **Ask before changing code.** The owner requested analysis only on 2026-10-16, then approved one change the same
   day: theme switching (`claude-outputs/07-theme-switching.md`). Do not edit source, configs,
   lockfiles or git state unless explicitly asked for that specific change.
2. Put generated reports, plans and notes in `claude-outputs/` (never in `src/`). Update
   `claude-outputs/README.md` when adding a file.
3. Never print, copy or commit secret values (from `.env` or anywhere). Refer to variables by name.
4. When changing an endpoint, check both sides: backend route + controller response shape **and** every frontend
   caller (`grep` the path in `frontend/src`).
5. Money/date changes need a worked example in the PR description (input → expected LKR total / Colombo date).
6. Prefer small, reviewable PRs that map to finding IDs in `claude-outputs/` (e.g. "Fixes SEC-02").
7. Branch naming in use: `<name>/<topic>` (e.g. `sanuda/system_enhance`). Remote: `origin` (GitHub).

## 9. Where to start

`claude-outputs/00-executive-summary.md` → top risks and the remediation order.
`claude-outputs/01-system-overview.md` → architecture, data model, full API inventory, route map.
