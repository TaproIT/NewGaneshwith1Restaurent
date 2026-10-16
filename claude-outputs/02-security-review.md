# 02 · Security Review

Scope: every backend source file, the auth-related frontend code, the git index, the CI workflow and the
dependency lockfiles. Method: manual code reading plus `npm audit --package-lock-only` on both lockfiles. Nothing
was executed against a live server; "Confirmed" means verified line-by-line in the code, not exploited.

**Bottom line:** the API is not safe to keep on the public internet in its current state. Anyone who can reach it
can create a Super-Admin account in one request, read guest personal data, change exchange rates, prices and stock,
and send e-mails from the hotel's Gmail account. All of this can be fixed with focused work; see the order in
§4.

Severity scale: **Critical** = exploitable remotely without credentials or leads to full compromise · **High** =
serious impact, needs a low-privilege account or specific conditions · **Medium** = defence-in-depth gap or
limited impact · **Low** = hygiene.

---

## 1. Findings summary

| ID | Severity | Title | Status |
|---|---|---|---|
| SEC-01 | Critical | Production secrets committed to git (`backend/.env`, `frontend/.env` tracked) | Confirmed |
| SEC-02 | Critical | Public self-registration with any role, including Super-Admin | Confirmed |
| SEC-03 | Critical | 64 business endpoints have no authentication (31 non-GET; 28 of them write data) | Confirmed |
| SEC-04 | Critical | Password-reset takeover: 4-digit code, unlimited attempts, NoSQL operator injection | Confirmed |
| SEC-05 | Critical | Login brute force: 4-digit PIN passwords, no rate limit or lockout, user enumeration | Confirmed |
| SEC-06 | High | Password, refresh-token and temp-password hashes returned by user APIs | Confirmed |
| SEC-07 | High | Deactivated users can still log in and use the API | Confirmed |
| SEC-08 | High | Admin can create/deactivate Super-Admins (role hierarchy only enforced in the UI) | Confirmed |
| SEC-09 | High | Missing object- and function-level authorization (restaurant isolation, checkout, price edits, free bills, cancellations) | Confirmed |
| SEC-10 | High | Unauthenticated e-mail endpoint sends attacker-controlled HTML from the hotel's Gmail | Confirmed |
| SEC-11 | High | Guest personal data exposed (public endpoints, public QR images, TinyURL) | Confirmed |
| SEC-12 | High | Vulnerable dependency: `nodemailer` 7.0.13 (13 advisories, several High) | Confirmed (npm audit) |
| SEC-13 | High | Any restaurant/admin user (and anyone, via SEC-02) can crash the API process (un-awaited promise rejection) | Confirmed in code; crash depends on Node's default `--unhandled-rejections=throw` |
| SEC-14 | Medium | Regular-expression injection / ReDoS from user input | Confirmed |
| SEC-15 | Medium | Mass assignment and update-operator injection (`req.body` written straight into documents) | Confirmed |
| SEC-16 | Medium | No security middleware; internal error messages and PII in responses/logs | Confirmed |
| SEC-17 | Medium | Token handling weaknesses (localStorage, refresh-token rotation ineffective, blacklist skipped on booking routes, session confusion on user creation, passwords logged in console) | Confirmed |
| SEC-18 | Medium | Third-party script injected at runtime, unpinned (QZ Tray from jsDelivr) and no QZ signing | Confirmed |
| SEC-19 | Medium | Unauthenticated socket.io; origin list does not protect WebSocket; placeholder origins | Confirmed |
| SEC-20 | Medium | Backups: unencrypted, no retention/restore test, possible wrong database name | Needs confirmation |
| SEC-21 | Low | Unsigned, PII-bearing QR codes used for "guest identification" | Confirmed |
| SEC-22 | Low | Invoice counter can be reset by Reception → duplicate invoice numbers | Confirmed |

The review was done twice independently (once by me while reading every file, once by a separate reviewer agent
that had not seen my notes); this report merges both and every item was re-checked against the source.

---

## 2. Findings in detail

### SEC-01 · Critical · Production secrets committed to git

**Evidence.** The git index (`.git/index`) lists `backend/.env` and `frontend/.env` as tracked files, although both
`backend/.gitignore` and `frontend/.gitignore` ignore `.env` (ignore rules do not apply to files that are already
tracked). `backend/.env` holds: `MONGO_URI` (MongoDB Atlas SRV string with embedded credentials),
`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CLOUDINARY_API_SECRET`, `TWILIO_AUTH_TOKEN`, `EMAIL_USER`/`EMAIL_PASS`
(Gmail app password). The remote is `github.com/TaproIT/NewGaneshHotel`. (Values were inspected only for length/
format and are not reproduced anywhere.) The JWT secrets are 64-character hex — strong, but exposed.

**Impact.** Anyone with read access to the repository or any clone/fork — now or in the future — can read and
modify the whole database, mint valid JWTs for any user ID (full API access as Super-Admin, bypassing passwords),
use the Cloudinary account, and send mail as the hotel.

**Fix.**
1. Rotate everything now: MongoDB user password (and restrict Atlas network access to the Render egress IPs),
   both JWT secrets (this logs everyone out — expected), Cloudinary API secret, Twilio token, Gmail app password.
2. `git rm --cached backend/.env frontend/.env`, commit, then purge history with `git filter-repo` (or BFG) and
   force-push all branches; ask collaborators to re-clone.
3. Keep secrets only in Render/Vercel environment settings; commit `.env.example` files with names only.
4. Enable GitHub secret scanning + push protection on the repository.

### SEC-02 · Critical · Public self-registration with any role

**Evidence.** `backend/src/routes/auth-routes.js:8` — `router.post("/register", registerNewUser);` (no middleware).
`registerNewUser` (`controllers/auth-controller.js:9-71`) accepts `userRole` from the body; the validator
(`validations/auth-validations.js:44-52`) only checks that it is one of the seven roles, `Super-Admin` included. The
response contains a valid access token.

**Impact.** One unauthenticated request yields a Super-Admin session.

**Fix.** Delete the public `/auth/register` route (user creation already exists at `POST /admin/create-user`). If
self-service is ever needed, it must never accept a role from the client.

### SEC-03 · Critical · 64 business endpoints have no authentication

**Evidence.** Full table in [01-system-overview.md §6](./01-system-overview.md#6-api-inventory-109-endpoints). Of
109 endpoints, 68 have no `authenticateToken`; only 4 of those should be public. 31 of the unprotected endpoints
are non-GET, and 28 of those write to the database. The unprotected set includes whole
routers: `/room/*`, `/currency-values/*`, `/beverages/*`, `/reports/*`, `/hotel-dashboard/*`, most of `/booking/*`,
most of `/extra-beverages/*`, and `GET/PUT/DELETE /pbfoodcategories/:id`, `GET/PATCH/DELETE /pbfoodnets/:id`. In
`order-routes.js:193-215` the auth middleware is present but commented out.

Selected consequences, each reachable with no account:

| Endpoint | What an outsider can do |
|---|---|
| `POST/PUT/DELETE /currency-values` | change USD/EUR rates → every foreign-currency room bill is recalculated with them at checkout |
| `PUT /room/update/:id` | change room prices, set `isBooked`/`isMaintenance` (block or free any room) |
| `PATCH /pbfoodnets/:id`, `PUT /extra-beverages/:id`, `PUT /beverages/price-and-volume/:id` | change menu prices (the order API re-prices from these, so changed prices are billed) |
| `PUT /beverages/add-beverage-quantity/:id`, `.../reduce-...`, `DELETE /beverages/:id` | falsify bar stock (hides theft) |
| `PUT /booking/:id/switch-rooms`, `PATCH /booking/:id/add-order` | move guests between rooms, attach orders to other guests' bills |
| `POST /reports` | write arbitrary financial report rows |
| `GET /booking/get-booking/:id`, `/booking/completed`, `/booking/details/all-rooms`, `/reports`, `/reports/export` | download guest names, e-mails, WhatsApp numbers, passport IDs, stay dates and bill totals |

Also: 7 endpoints check the token but not the role — notably `PUT /booking/:id/update-booking` (room price edits),
`GET .../billing-summary` and `POST .../checkout`, so any restaurant staff account can reprice rooms and check guests
out.

**Fix.** Apply `verifyTokenNotBlacklisted, authenticateToken, authorizeRoles([...])` to every router by default
(`router.use(...)` at the top of each router file, or a single app-level guard with an explicit allow-list for the
4 public auth routes). Add an automated test that fails if any route is reachable without a token.

### SEC-04 · Critical · Password-reset takeover

**Evidence.** `auth-controller.js:216-290`, `utils/auth-util.js:34-36`.
- The temporary password is `Math.floor(1000 + Math.random()*9000)` — 9,000 possibilities, valid 24 h, and
  `POST /auth/reset-password` has no attempt counter, rate limit or lockout.
- Both handlers do `User.findOne({ email })` with `email` taken straight from the JSON body. Mongoose does not
  sanitise query operators by default, so `{"email": {"$ne": null}}` matches the first user in the collection
  (usually the first account created — typically the owner/Super-Admin). The temp password is saved **before** the
  e-mail is sent, so the request still arms the reset even though sending to an object address fails.
- `forgotPassword` answers 404 "User not found" for unknown e-mails (account enumeration).
- A successful reset does not revoke existing refresh/access tokens.
- Functional bug in the same flow: `resetPassword` does not apply the 4-digit rule, but login does
  (`auth-validations.js:72-85`), so a user who picks a non-numeric password locks themselves out.

- Staff e-mail addresses are publicly readable: `GET /booking/get-booking/:id` (no auth, SEC-03) populates
  `createdById`/`checkOutById` with `"name email"` (`booking-controller.js:1677-1678`).

**Impact.** Remote takeover of any account whose e-mail is known — and staff e-mails are publicly readable (above) —
in at most 9,000 requests. Operator injection lets an attacker reset the first account's password without knowing
its e-mail, but logging in afterwards still needs that e-mail and role, because `validateUserLogin` rejects a
non-string e-mail.

**Fix.** Use a random, single-use, short-lived (≤15 min) token of ≥128 bits sent as a link; store only its hash;
cap attempts per user and per IP; return the same response whether or not the e-mail exists; cast inputs to strings
(`String(email)`) and enable `mongoose.set('sanitizeFilter', true)` globally; revoke sessions after reset; validate the
new password with the same policy as registration.

### SEC-05 · Critical · Login brute force

**Evidence.** Passwords must be numeric and ≤4 characters (`auth-validations.js:29-42, 72-85`), so about 11,110
digit-only values (1–4 digits; the validator also accepts sign/decimal forms such as `-12`, which does not
meaningfully widen the space). `loginUser` (`auth-controller.js:73-128`) has no rate limit, lockout, delay or CAPTCHA and
returns 404 "User not found" vs 400 "Invalid username or password" (enumeration). The role is a second "factor"
but is a 7-value enum. Bcrypt cost is 10 (fine), but with this keyspace an online attack completes in minutes.

**Fix.** Short term: rate-limit `/auth/*` per IP and per account (e.g. `express-rate-limit` + a failed-attempt
counter with exponential lock-out), identical error for unknown user/wrong password. Medium term: if PINs are a
business requirement for speed at the POS, keep them **only** as a quick-unlock on an already-registered device and
require a real password (≥10 chars) for first sign-in on a device; or move to per-staff PIN + device binding.

### SEC-06 · High · Password hashes returned by user APIs

**Evidence.** `user-controller.js` `getAllUsers` (`User.find()`), `getUserById`, `deleteUserById`,
`activateUserById` all return the full Mongoose document — including `password`, `refreshToken` and
`tempPassword` hashes. `GET /user/details` is called by every page header (`Layout/Header.tsx:29-52`), so every
logged-in user receives their own hashes, and Admins receive everybody's via `/admin/get-users`.

**Impact.** A bcrypt hash of a 4-digit PIN is cracked offline in seconds; anyone with an Admin session (or with
XSS, see SEC-17) obtains every staff PIN.

**Fix.** Add `select: false` to `password`, `refreshToken`, `tempPassword`, `tempPasswordExpires` in
`user-model.js` and/or a `toJSON` transform; return explicit DTOs.

### SEC-07 · High · Deactivated users can still log in

**Evidence.** `loginUser` (`auth-controller.js:84`) and `authorizeRoles` (`middleware/role-authorize.js:17-26`) never
check `user.isActive`. Deactivation (`PATCH /admin/deactivate-user/:id`) only flips the flag.

**Fix.** Reject inactive users in login, refresh and `authorizeRoles`; on deactivation clear `refreshToken` and
blacklist outstanding access tokens (or add a `tokenVersion` field checked on every request).

### SEC-08 · High · Admin can manage Super-Admins

**Evidence.** `routes/Admin/user-handelling-routes.js:11-64` allow `Admin` to create users of any role and to
(de)activate any user. The restriction exists only in the UI (`component/admin/CreateUser.tsx:118-123`).

**Fix.** Enforce a role hierarchy on the server: Admin may manage Reception/restaurant roles only; only Super-Admin
manages Admin/Super-Admin; nobody can deactivate themselves or the last Super-Admin.

### SEC-09 · High · Missing object- and function-level authorization

**Evidence and impact.**
- **Restaurant isolation:** `getOrderDetails`, `cancelOrder`, `updateOrderBillDetails`, `addOrderToken`,
  `selectTableForOrder`, `getTableById`, `updateTable` load documents by ID without checking the caller's restaurant
  (`order-controller.js`). `getDailyOrdersSummary`, `getDailyRestaurantTotals`, `exportRestaurantSummaryExcel` and
  several menu endpoints accept a `restaurantType` query/body parameter that overrides the caller's own
  (`order-controller.js:1312-1315, 1882-1885, 1992-1995`).
- **Revenue controls:** any restaurant staff member can mark any order "Free-Bill" (`order-controller.js:1005-1034`
  — also crashes with a 500 if the ID does not exist), apply any discount percentage with no upper bound (`:1047`; even >100 % passes if the client sends matching
  totals), and cancel
  **completed** orders (`cancelOrder`, `:1840-1873`, no status check, no reason, no stock reversal). None of these
  are logged with who/why.
- **Order integrity:** `addOrderToken` accepts `newOrderToken._id` without checking that the token belongs to the
  order (`order-controller.js:675-681`), so a token from another order can be rewritten and attached; it accepts
  negative `quantity` values (the server-side total check passes when the client sends matching negative totals,
  `:501-519`); it does not reject COMPLETED/CANCELED orders; `setInitialOrderDetails` stores any `bookingId` the
  client sends (`:17-45`), so a bill can be charged to another guest's room.
- **Hotel billing:** any authenticated role (restaurant staff included) can create bookings at any nightly price
  (client price wins over the room's price, `booking-controller.js:206`, and the schema has no `min`), change room
  prices (`PUT /booking/:id/update-booking`) and perform checkout with any discount or a negative `tax`
  (`total-bill-calculation-controller.js:390-415` only rejects negative discount/extras).

**Fix.** Scope every order/table/menu query by the caller's restaurant (Admins excepted); ignore client-supplied
`restaurantType` for non-admins; restrict free bills, discounts above a threshold, cancellations of completed orders,
room-price edits and checkouts to manager roles (or require a manager PIN); reject edits to closed orders; require
positive integer quantities; verify token ↔ order and booking ↔ room ownership; write an append-only audit log entry
(user, action, before/after, reason) for each.

### SEC-10 · High · Hotel Gmail usable for phishing

**Evidence.** `POST /booking/:id/send-email` is public (`booking-routes.js:29`). `sendBookingQrViaEmail` uses
`req.body.message` when present (`booking-controller.js:497-513`), and `sendEmailMessage` inserts it into the HTML
body unescaped: `<p>${message.replace(/\n/g, "<br/>")}</p>` (`:1096`). Booking IDs are exposed by other public
endpoints (e.g. `/booking/details/all-rooms`).

**Impact.** Anyone can send arbitrary HTML (links, fake payment requests) to real guests from the hotel's genuine
address — highly convincing phishing, plus reputational/blacklisting risk for the Gmail account.

**Fix.** Require auth + Reception role; never accept free-text HTML from the client (use a server-side template with
escaped fields); add per-booking send limits.

### SEC-11 · High · Guest personal data exposure

**Evidence.** Public endpoints in SEC-03 return guest name, country, e-mail, WhatsApp, passport ID and stay/bill
data (`getBookingById` returns the whole document including `passportId` and `payload`). Every booking's QR image
(guest name, rooms, dates, hotel in plain text — `utils/qr.js`) is uploaded to Cloudinary with default public
delivery (`utils/cloudinary.js:26-40`) and its URL is sent to TinyURL (`utils/sendWhatsAppMessage.js:46-50`).
Many frontend `console.log` calls print guest data and full bills (e.g. `util/printCheckout.ts:286`,
`component/checkout/CheckoutCompletedDetails.tsx:127`, `component/checkout/PaymentModal.tsx:94`,
`util/printInvoice.ts:216`, `component/onboarding/Step02.tsx:225`); see FE-29.

**Impact.** Privacy breach and possible regulatory exposure (for example Sri Lanka's Personal Data Protection
Act, No. 9 of 2022 — confirm obligations with counsel).

**Fix.** Close the endpoints (SEC-03); return minimal DTOs; upload QR images as `type: "authenticated"` or
`private` with signed, expiring URLs (or don't put PII in the QR at all — see SEC-21); drop TinyURL; remove PII
from logs.

### SEC-12 · High · Vulnerable `nodemailer`

**Evidence.** `npm audit` on `backend/package-lock.json`: `nodemailer@7.0.13` is affected by 13 advisories (fix:
10.1.1, semver-major), including address-parser denial-of-service (GHSA-v53p-9fqp-m79j, GHSA-2x7j-588g-ccc2),
SSRF/file-read via message options (GHSA-p6gq-j5cr-w38f) and header/SMTP injection (GHSA-268h-hp4c-crq3,
GHSA-vvjj-xcjg-gr5g). The app passes guest-supplied addresses to `sendMail`. Other backend audit items are
moderate/dev-only: `exceljs` → `uuid` (moderate), `nodemon` → `chokidar`/`braces`/`minimatch` (dev dependency).
The frontend lockfile has 0 known vulnerabilities.

**Fix.** Upgrade `nodemailer` to ≥10.1.1 and re-test both mail paths; run `npm audit` in CI.

### SEC-13 · High · Any restaurant/admin user (and anyone, via SEC-02) can crash the API

**Evidence.** In `addOrderToken`, the liquor-volume logging for food items is called without `await` and without
`.catch` (`order-controller.js:699-702` and `802-805`). `updateBeverageVolumeManually` throws when the amount is
`<= 0` or the beverage is missing (`utils/beverageStock.js:46-53`). There is no `process.on('unhandledRejection')`
handler, and since Node 15 an unhandled rejection terminates the process by default. `PBFoodNet.liquor[].amount`
defaults to `0` (`models/PoolAndBeachResturant/PBFoodNet.js:14`), so ordinary menu data can trigger it, not only a
malicious request.

**Impact.** One printed order containing such an item takes the API down for every user until the host restarts
it; while it restarts, in-flight requests (including checkouts) fail. The un-awaited writes also run outside the
order transaction.

**Fix.** `await` the call inside the transaction (pass the session), validate liquor IDs/amounts before starting,
and add a process-level `unhandledRejection` logger plus a restart policy as a safety net (not as the fix).

### SEC-14 · Medium · Regex injection / ReDoS

**Evidence.** `new RegExp(searchTerm, "i")` with raw user input in `getAllActiveBookings`
(`booking-controller.js:1736`, public), `getCompletedBookings` (`:1884`, public), `getInvoices`
(`invoice-controller.js:131`), `createPBFoodNet` (`pbfoodnetController.js:31`), and `$regex: q/search` in
`extra-beverage-controller.js:41,128,210,326`.

**Fix.** Escape input (`escapeStringRegexp`) and cap length, or use a MongoDB text index / prefix match.

### SEC-15 · Medium · Mass assignment and update-operator injection

**Evidence.** `updateTable` copies every body key onto the document (`order-controller.js:98-100`);
`updateCategory` passes `req.body` to `findByIdAndUpdate` (`pbfoodnetCategoryController.js:36-40`, public) — a raw
body used as an update document also lets the caller send `$unset`/`$rename`/`$inc` operators; `createPBFoodNet`
spreads `req.body` (`pbfoodnetController.js:86`); `saveRoomReports` spreads each row (`controllers/Excel/room-report.js:152-159`,
public), so a caller can set `bookingCommission`/`totalBreakfastPrice` that feed the stored gross/net figures.

**Fix.** Whitelist fields per endpoint (zod/Joi/celebrate schemas), reject unknown keys, and never pass a request
object directly to `create`/`update`.

### SEC-16 · Medium · Missing security middleware; information leakage

**Evidence.** `server.js` has no `helmet`, no rate limiter, no 404 or error handler; `body-parser.json()` and
`express.json()` are both registered (`:61-62`); `config/cors-config.js` is imported but unused. `sendErrorResponse`
returns `error.message` to clients (`utils/response-util.js:24-31`), and several handlers return raw error
objects. Handlers without `try/catch` (`pbfoodnetCategoryController.getCategories`, `getPBFoodNets`, …) fall
through to Express's default handler, which prints stack traces unless `NODE_ENV=production`. CORS allows requests
with no `Origin` (fine for curl, but note CORS is not access control).

**Fix.** Add `helmet`, a global rate limit, a JSON 404 + central error handler that logs details server-side and
returns a generic message with a correlation ID; set `NODE_ENV=production` on Render; structured logging without
PII.

### SEC-17 · Medium · Token handling

**Evidence.**
- Access token stored in `localStorage` (`pages/login/Login.tsx:64`) — readable by any script on the page (see
  SEC-18).
- The refresh flow is never used by the SPA; on any 401 the interceptor wipes the token and hard-redirects
  (`api/axios.tsx:36-44`). The refresh cookie is `SameSite=Strict` while the SPA (`*.vercel.app`) and API
  (`*.onrender.com`) are different sites, so browsers will not send it anyway (Needs confirmation of production
  domains).
- `verifyEncodedToken` references an undefined `res` in its catch block (`utils/token-util.js:37-48`): an
  expired/invalid refresh token produces a `ReferenceError` → 500.
- **Refresh-token rotation does not work.** Refresh tokens are hashed with bcrypt (`utils/auth-util.js:21-31`),
  which only uses the first 72 bytes of its input. For a JWT that is the fixed header plus the start of
  `{"userId":"…"`, identical for every token issued to the same user — so any earlier, unexpired refresh token of
  that user still matches the stored hash after rotation or a new login (the independent reviewer reproduced this
  with bcrypt 6.0.0).
- The booking create/update and billing routes use `authenticateToken` without `verifyTokenNotBlacklisted`
  (`booking-routes.js:26,35,43,44`), so a logged-out token keeps working there for up to 3 h.
- `registerNewUser` sets a refresh-token cookie for the **newly created** user on the response; when an Admin
  creates a user through `/admin/create-user`, the Admin's browser receives the new user's refresh cookie and
  access token (`auth-controller.js:36-65`).
- Cookie `maxAge` is 7 days while the refresh JWT lives 30 days; access tokens are not revoked on password reset or
  deactivation; the blacklist has no index on `token`.
- The forgot-password modal logs the temporary and new password to the browser console
  (`component/authentication/ForgotPasswordModal.tsx:78`), on shared front-desk machines.

**Fix.** Keep the access token in memory, use the httpOnly refresh cookie with `SameSite=None; Secure` + CSRF
protection on `/refresh-token` (or serve the API from the app's own site so `Lax` works), implement silent refresh
in the axios interceptor; hash refresh tokens with SHA-256/HMAC (or store a random `jti`) instead of bcrypt; add a
`tokenVersion` checked on every request; fix `verifyEncodedToken`; apply the blacklist middleware everywhere; never
issue tokens or cookies in the admin create-user path; remove the console logging.

### SEC-18 · Medium · Third-party script injected at runtime; unsigned QZ Tray

**Evidence.** Seven components append `<script src="https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js">` on mount
(no version pin, no Subresource Integrity, re-added on every mount): `InvoiceList.tsx:24`, `SamplePrint.tsx:10`,
`PaymentModal.tsx:61`, `CheckoutCompletedDetails.tsx:45`, `OrderTokenModal.tsx:43`, `OrderBillDetailsModal.tsx:53`,
`PrinterDiagnostics.tsx:67`. No `qz.security.setCertificatePromise/setSignaturePromise` is configured.

**Impact.** A compromised or changed upstream package runs with full access to the app (and the token in
`localStorage`). Without signing, QZ Tray shows "untrusted website" prompts and cannot distinguish this site from
any other site asking to print.

**Fix.** Install `qz-tray` from npm at a pinned version and import it once; configure certificate + server-side
signing so QZ trusts only this app.

### SEC-19 · Medium · Unauthenticated socket.io

**Evidence.** `utils/realtime/room-socket.js` accepts any connection and any `lockRoom` event; locks live in memory
until disconnect, with no cap or validation of the key. The `cors` option on the socket.io server only adds
headers — browsers do not apply CORS to WebSocket upgrades and the server does not check `Origin` (`allowRequest`
is not set), so any site or script can connect. `SOCKET_IO_ORIGINS` in the committed `.env` contains placeholder
hosts (`example2.com`, `example3.com`), and the frontend reads an env var Vite never exposes (see FE-34), so the
feature is likely not working in production anyway.

**Impact.** Anyone can "lock" every room so reception sees them as unavailable, or grow the lock map without bound.

**Fix.** Authenticate the socket handshake with the access token (`io.use`), scope events to Reception users,
validate room IDs, cap and expire locks, check `Origin` in `allowRequest`, and keep enforcing availability on the
server (the booking transaction already does — keep that as the source of truth).

### SEC-20 · Medium · Backups (Needs confirmation)

**Evidence.** `.github/workflows/google-drive-backup.yml` dumps `--db production` to Cloudflare R2 daily
(name says Google Drive). The committed `MONGO_URI` has no database path, so Mongoose would use the default `test`
database unless the production environment's URI differs — **confirm which database the live API writes to**. The
archive (password hashes, guest PII, bills) is not encrypted client-side, there is no retention/lifecycle rule in the
workflow, no restore test, the step comment says "Dump ONLY the test database", the job has no `permissions:` block
(default token scope) and it runs `actions/checkout@v3` although it needs no repository files.

**Fix.** Confirm the DB name; encrypt the archive (e.g. `age`/`gpg`) before upload; set an R2 lifecycle rule;
schedule a monthly restore test; add `permissions: {}`; drop the checkout step; use a read-only database user for
the dump; rename the workflow.

### SEC-21 · Low · Unsigned, PII-bearing QR codes

**Evidence.** The QR is a plain `key=value` list (`utils/qr.js:58-79`) — name, room numbers, dates, hotel — with no
booking ID or signature. Anyone can generate an identical-looking QR.

**Fix.** Encode only an opaque booking reference plus an HMAC (or a signed short-lived token) and look details up
server-side after scanning.

### SEC-22 · Low · Invoice counter reset by Reception

**Evidence.** `POST /invoice/reset-counter` is allowed for Reception (`invoice-routes.js:19-25`); it can set the
sequence to any value, and `name` is taken from the body unchecked (an operator object matches any counter,
`invoice-controller.js:179-194`); `invoiceNumber` has no unique index and `InvoiceCounter.name` uniqueness is
commented out.

**Fix.** Super-Admin only (or remove), unique index on `invoiceNumber`, unique `name` on the counter.

---

## 3. What is already done well

- Passwords and refresh tokens are hashed with bcrypt; JWT secrets (though leaked) are long and random.
- Booking creation and hotel checkout use MongoDB transactions and conditional updates on `isBooked`.
- The restaurant token endpoint re-prices every item from the database instead of trusting client prices.
- Access-token blacklist on logout with a TTL index.
- Frontend dependencies have no known advisories.

## 4. Recommended order of work

1. **Today:** rotate all secrets (SEC-01); remove `/auth/register` (SEC-02); put the API behind auth for every
   non-auth route (SEC-03); rate-limit `/auth/*` (SEC-04/05 short-term); `String()`-cast and sanitise filters.
2. **This week:** fix reset flow (SEC-04), hide hashes (SEC-06), enforce `isActive` (SEC-07), role hierarchy
   (SEC-08), lock down e-mail endpoint (SEC-10), upgrade nodemailer (SEC-12), await the stock calls (SEC-13), purge
   `.env` from history.
3. **Next sprint:** restaurant scoping + manager approvals + audit log (SEC-09), PII minimisation (SEC-11, SEC-21),
   helmet/error handler/logging (SEC-16), regex/mass-assignment fixes (SEC-14/15).
4. **Then:** token storage + refresh (SEC-17), QZ Tray bundling and signing (SEC-18), socket auth (SEC-19), backup
   hardening (SEC-20).
