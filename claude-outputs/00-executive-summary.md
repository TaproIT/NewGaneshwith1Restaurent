# 00 · Executive Summary — Ganesh Garden Hotel Management System

*Review date: 2026-10-16 · Scope: entire repository (`backend/`, `frontend/`, CI workflow, git index, lockfiles) ·
Static review only — nothing was run against a live server and no code was changed.*

## Verdict

The system covers a lot of real hotel work — check-in, room switching, checkout billing in three currencies, two
restaurant POS flows with kitchen tokens and thermal printing, bar stock, invoices and reports — and several core
ideas are right (database transactions at check-in/checkout, server-side re-pricing of restaurant items). But it is
**not safe to leave on the public internet as it is**, and **its money, stock and date logic cannot yet be
trusted without checking**:

- **Anyone on the internet** can create a Super-Admin account with one request, read guest passport/contact data,
  change exchange rates, menu prices and bar stock, and send e-mails from the hotel's Gmail account. Production
  credentials (database, JWT signing keys, Cloudinary, Gmail) are committed to the git repository.
- **Bills can be wrong without anyone noticing**: extending a stay after a room switch bills the old room again;
  restaurant "charge to room" can complete without reaching the guest's bill; a cancelled room-charged order is still
  billed; reports shift sales between days by 5 h 30 min; the dashboard shows Beach and Pool liquor sales swapped.
- **The API can be crashed** by an ordinary restaurant order containing a menu item whose liquor amount is 0.
- **Staff experience** is held back by keyboard-inaccessible controls, misleading success/failure messages
  (e.g. "Payment failed" shown after a successful checkout when the printer is off), no confirmations for
  destructive actions, and a restaurant screen not designed for tablets.
- **There are no automated tests and no CI checks**, so none of this is protected against regressions.

All of it is fixable incrementally without a rewrite. The first week of work (Phase 0 below) removes the
internet-facing risk and the two most dangerous money/availability bugs.

## Scorecard

| Area | Status | Headline |
|---|---|---|
| Security | 🔴 Critical | 68 of 109 API endpoints have no authentication (64 of them should not be public); public Super-Admin sign-up; 4-digit PINs with no rate limit; secrets in git |
| Billing & money | 🔴 At risk | double-billing paths, client-trusted totals, floats, FX applied at view time, inconsistent tax/service-charge rules |
| Inventory | 🔴 At risk | stock updated outside transactions, never reversed on cancel, liquor in cocktails/food never deducted, "reduce stock" button calls a non-existent route |
| Dates & reporting | 🟠 Weak | eight different date mechanisms (only two of them correct); day boundaries wrong between 00:00 and 05:30 Sri Lanka time |
| Reliability | 🟠 Weak | crash path in order processing; room switch not atomic; external calls inside requests |
| Backend code health | 🟠 Weak | two ~2,000-line controllers, ~30 % commented-out code, five response shapes, no validation layer |
| Frontend code health | 🟠 Weak | 1.21 MB single bundle, 132 lint errors (107 explicit `any`), no refresh-token flow, logout leaves previous user's data in memory |
| UI/UX & accessibility | 🟠 Weak | core controls are clickable `div`s; 0 `aria-label`s; colour-only room status; 7 money formats; no confirm dialogs |
| Tests & CI | 🔴 None | no unit, API or UI tests; only a backup workflow in CI |
| Operations | 🟠 Partial | daily backups exist (unencrypted, no restore test); no health check, error tracking or structured logs |

## Top 10 risks (in order of urgency)

| # | Risk | IDs |
|---|---|---|
| 1 | Secrets committed to git → full database access and forged logins for anyone with repo access | SEC-01 |
| 2 | Public `POST /auth/register` accepts role "Super-Admin" | SEC-02 |
| 3 | 64 unauthenticated business endpoints (rates, prices, stock, rooms, guest data, reports) | SEC-03 |
| 4 | Account takeover via 4-digit reset code with unlimited attempts (staff e-mails are publicly readable); 4-digit login PINs with no rate limit | SEC-04, SEC-05 |
| 5 | API process crash from an un-awaited stock call | SEC-13 / BE-01 |
| 6 | Re-billing of rooms already vacated when a stay is extended after a switch | BE-02 |
| 7 | Restaurant room-charges and cancellations not reliably reflected on the guest bill | BE-03, BE-07 |
| 8 | Anyone with any login can give free bills, unlimited discounts, cancel paid orders, change room prices — no approval, no audit trail | SEC-09 |
| 9 | Hotel Gmail usable by outsiders to send phishing to real guests | SEC-10 |
| 10 | "Payment failed" shown after a successful checkout when printing fails → risk of charging twice | UX-02 / FE-17 |

## What is good and should be kept

- Check-in and checkout use MongoDB transactions with conditional room updates — the right pattern to extend.
- Restaurant orders are re-priced from the database on the server; totals are cross-checked.
- Most date logic in billing already uses `Asia/Colombo` correctly — a ready template for the rest.
- Passwords and refresh tokens are bcrypt-hashed; logout blacklists tokens; JWT secrets are strong (but leaked).
- TypeScript `strict` mode is on and the frontend type-checks; frontend dependencies have no known advisories.
- Thermal ESC/POS printing with automatic printer detection is a practical solution for the bars.

## Do this week (Phase 0)

1. Rotate every credential in `backend/.env`; remove both `.env` files from git and purge history.
2. Delete `/auth/register`; put token + role checks on every router (allow-list only the 4 auth endpoints).
3. Rate-limit login/reset, sanitise query filters, hide password hashes, block deactivated users.
4. `await` the stock calls (crash fix); stop `updateBooking` rewriting history of vacated rooms.
5. Lock the e-mail endpoint to Reception with a server-side template; upgrade `nodemailer`.
6. Frontend: separate "payment succeeded" from "printing failed"; remove password/PII console logs; clear all
   state on logout.

Full plan with sizes and owners: [06-remediation-roadmap.md](./06-remediation-roadmap.md). It also lists **ten
business decisions** (tax/service-charge policy, FX policy, overstay rule, stock units, approval limits, PIN policy,
…) that the code cannot settle on its own.

## Findings by area

| Report | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| [02 Security](./02-security-review.md) | 5 | 8 | 7 | 2 | 22 |
| [03 Backend](./03-backend-review.md) | 2 | 10 | 17 | 1 group (26 items) | 30 IDs |
| [04 Frontend engineering](./04-frontend-review.md) | 1 | 9 | 29 | 8 | 47 |
| [05 UI/UX & accessibility](./05-uiux-review.md) | 3 | 15 | 40 | 7 | 65 |

Some issues appear from different angles in more than one report (for example the checkout print error is UX-02
and FE-17); each report cross-references the others' IDs.

## Key numbers

| Metric | Value |
|---|---|
| API endpoints / without auth / should be public | 109 / 68 / 4 |
| Non-GET endpoints reachable without login | 31 (28 of them write to the database) |
| Backend source lines / commented-out share in the two biggest controllers | ~10,750 / ~30 % |
| Frontend source lines / files in `src/` | ~22,900 / 227 |
| Automated tests | 0 |
| ESLint errors (frontend) | 132 (107 `no-explicit-any`, 3 rules-of-hooks) |
| Production JS bundle | 1.21 MB (369 KB gzip), one chunk |
| `aria-label`s outside UI primitives / confirm dialogs | 0 / 0 |
| Hard-coded hex colour utilities | 189 (192 including 8-digit alpha values) |
| Known vulnerable backend dependency | `nodemailer` 7.0.13 (fix ≥ 10.1.1) |

## How this review was done

Every tracked source file was read in full. Each area (security, backend logic, frontend engineering, UI/UX) was
reviewed twice — once by me and once by an independent reviewer agent — and the results merged; every
Critical/High item was re-checked against the exact source line. Frontend type-check, lint and build were run on a
scratch copy outside the repository; `npm audit` was run on both lockfiles. Items that depend on deployment details
not in the repository (production environment variables, host timezone, Node version, business intent) are marked
"Needs confirmation". See [README.md](./README.md) for the document map.
