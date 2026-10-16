# 06 · Remediation Roadmap

A sequenced plan that turns the findings in documents 02–05 into work. Sizes are relative (S ≈ under a day,
M ≈ 2–4 days, L ≈ 1–2 weeks for one developer familiar with the code); treat them as planning aids, not
commitments. IDs refer to `SEC-*` (02), `BE-*` (03), `FE-*` (04) and `UX-*` (05).

Guiding rules for every phase:
- **One finding ID per PR** where practical, with a test or a written manual check in the description.
- **Do not change URLs or response shapes** that the frontend uses without updating the caller in the same PR.
- **Money/date changes** carry a worked example (input → expected LKR total / Colombo date) in the PR.

---

## Phase 0 — Contain (this week)

Goal: close the doors that are open to anyone on the internet and stop the two ways the system can lose money or go
down without anyone noticing.

| # | Work item | Fixes | Size | Owner |
|---|---|---|---|---|
| 0.1 | Rotate MongoDB, JWT, Cloudinary, Twilio and Gmail credentials; restrict Atlas network access | SEC-01 | S | DevOps |
| 0.2 | `git rm --cached` both `.env` files, add `.env.example`, purge history (`git filter-repo`), force-push, enable GitHub secret scanning + push protection | SEC-01 | S | DevOps |
| 0.3 | Delete `POST /auth/register` | SEC-02 | S | BE |
| 0.4 | Router-level guard: `verifyTokenNotBlacklisted + authenticateToken + authorizeRoles` on every router; explicit allow-list for login/forgot/reset/refresh; role lists per route (Reception for bookings/billing, restaurant roles for orders, Admin for config) | SEC-03, SEC-09 (partly), UX-22 | M | BE |
| 0.5 | Rate-limit `/auth/*` (per IP and per account), identical error for unknown user/wrong password, `mongoose.set('sanitizeFilter', true)` + `String()` casts on auth inputs | SEC-04, SEC-05 | S | BE |
| 0.6 | `select: false` on password/refresh/temp fields; DTOs for user endpoints | SEC-06 | S | BE |
| 0.7 | Enforce `isActive` in login, refresh and `authorizeRoles` | SEC-07 | S | BE |
| 0.8 | `await` the liquor-volume calls; validate amounts; add an `unhandledRejection` logger | SEC-13, BE-01 | S | BE |
| 0.9 | `updateBooking`: only modify active history rows when the checkout changes; clamp all rows to today in the summary | BE-02 | S | BE |
| 0.10 | Hotel checkout: separate payment result from print result; never show "Payment failed" after a 200; stay on page on error | UX-02, UX-31 | S | FE |
| 0.11 | `send-email`: auth + Reception role, server-side template only (ignore client `message`) | SEC-10 | S | BE |
| 0.12 | Upgrade `nodemailer` to ≥ 10.1.1 and re-test both mail paths | SEC-12 | S | BE |
| 0.13 | Remove `console.log` of passwords, bills and guest data; drop console calls from production builds | FE-29 | S | FE |
| 0.14 | Logout always clears the token and resets the Redux store (shared terminals) | FE-08, UX-61 | S | FE |

Exit check: an automated script (or Postman collection) that calls every route without a token and expects 401,
except the four auth routes.

## Phase 1 — Make money, stock and dates trustworthy (sprints 1–2)

| # | Work item | Fixes | Size |
|---|---|---|---|
| 1.1 | **Test harness first:** Jest + supertest + `mongodb-memory-server` (replica set). Unit tests for nights/FX/total calculation and the restaurant total check | BE-12 | M |
| 1.2 | Restaurant "charge to room": link order → booking **inside** the bill-details transaction; reject if booking checked out; remove the second browser call | BE-03 | M |
| 1.3 | Billing summary becomes read-only; checkout recomputes everything from the DB inside its transaction; bound discount/tax; require manager role above a threshold | BE-04, BE-05 | M |
| 1.4 | Order state machine (open → printed → billed → closed / cancelled); reject writes on closed orders; exclude cancelled orders from folios; Free-Bill/cancel/large discount need manager role + reason; audit log collection | BE-07, SEC-09, UX-18 | L |
| 1.5 | Stock movements: `StockMovement` collection, atomic `$inc` with a non-negative filter inside the order transaction, reversal on cancel, decide units (bottle/ml) and deduct liquor used in food/cocktails | BE-06, BE-18, BE-21 | L |
| 1.6 | Room switch in one transaction with conditional updates; QR after commit | BE-08, BE-26 | M |
| 1.7 | Reject maintenance rooms at check-in; add a "void/cancel booking" endpoint with audit | BE-09 | M |
| 1.8 | FX policy: store the rate used on the booking; ignore future-dated rates; require rate > 0 | BE-10 | S |
| 1.9 | Invoice: unique indexes, server-computed total (and a live total in the form), Super-Admin-only counter reset | BE-11, SEC-22, UX-03, FE-20 | S |
| 1.10 | One `hotelTime` helper; replace `new Date("YYYY-MM-DD")`, `setHours`, `$dayOfMonth` without timezone; store business dates as Colombo start-of-day | BE-16 | M |
| 1.11 | Night-attribution rule: minimum one night per **booking**, each night billed to exactly one room | BE-13 | S |
| 1.12 | Fix the `enums:` typos; add missing unique/plain indexes; `min: 0` on money | BE-23, BE-25 | S |
| 1.13 | Restaurant scoping from the user's role (ignore client `restaurantType` for staff); token ↔ order ownership; positive integer quantities; items built from DB records | SEC-09, BE-19, BE-20 | M |
| 1.14 | Restore correct report and inventory data: swap-fix dashboards, pass the Daily Summary filter, never send `restaurantType` for non-admins (Excel export), labels from the effective restaurant, sales from completed printed tokens only, fix the stock-reduction method mismatch (PATCH vs PUT), return `_id` from the invoice list, stop hard-coding `breakfast: "Included"` in saved room reports | UX-09, UX-10, BE-21, FE-40, FE-41, FE-42, FE-46, FE-47 | M |

## Phase 2 — Frontend reliability and UX quick wins (sprints 2–3, can run in parallel with Phase 1)

| # | Work item | Fixes | Size |
|---|---|---|---|
| 2.1 | Session handling: access token in memory, silent refresh via httpOnly cookie (`SameSite=None; Secure` + CSRF, or same-site API), 401 → refresh → retry, no hard reload | SEC-17, FE-13, FE-08, FE-28 | M |
| 2.2 | Role-aware route guards + "Not authorised" page + 404 + error boundary; URL-addressable detail pages (`/checkouts/:bookingId`, …) so refresh works | UX-21, UX-22, FE-04, FE-05, FE-06 | M |
| 2.3 | Async-state pattern everywhere (loading / error + Retry / empty); `unwrap()` thunks before success toasts | UX-04, UX-23, FE-14, FE-15 | M |
| 2.4 | Disable submit buttons while pending; shared `ConfirmDialog` for destructive actions | UX-05, UX-13 | S |
| 2.5 | Socket URL via `VITE_SOCKET_URL`; real origins on the server | FE-34, SEC-19 | S |
| 2.6 | Bundle `qz-tray` from npm (pinned) and load once; configure QZ signing; one print service that returns a status | SEC-18, FE-24, FE-25, FE-26, UX-04, UX-54 | M |
| 2.7 | Checkout screen + print: one totals function, itemised summary that adds up; one discount control; amount shown in payment modal | UX-08, UX-29, UX-30, UX-31 | M |
| 2.8 | Room currency selection converts (or forces re-entry of) the price; one booking-level currency | UX-07 | S |
| 2.9 | Kitchen token: table + service type at the top, labelled copies, no unlisted service charge | UX-11 | S |
| 2.10 | Accessibility quick wins: `aria-label` on icon buttons, labels bound to inputs, status text on room/table tiles, darker primary (#087A8F) and visible focus ring | UX-06, UX-14, UX-15, UX-45, UX-46 | M |
| 2.11 | Copy and formatting: spelling list, `formatMoney`/`formatDate` helpers used everywhere including prints | UX-43, UX-44, UX-52, UX-53 | M |
| 2.12 | Onboarding Back/Cancel using the existing `prevStep`; no `window.location.reload()` | UX-12 | S |
| 2.13 | Print templates per property (correct address/phone per hotel), bill numbers, timestamps, labelled copies | UX-55, UX-56, UX-57 | M |

## Phase 3 — Structure and operations (months 2–3)

| # | Work item | Fixes | Size |
|---|---|---|---|
| 3.1 | Backend modules with service layer (billing → orders/inventory → bookings → the rest), zod request schemas, one response envelope, central error handler, OpenAPI spec | BE-28, BE-29 | L |
| 3.2 | Delete commented-out code and dead files; naming clean-up (with field aliases for `laundary`/`oderId`) | BE-29, BE-30 | M |
| 3.3 | Security middleware: helmet, CSP on the frontend host, global rate limit, structured logging (pino) without PII, request IDs | SEC-16 | M |
| 3.4 | CI: typecheck, lint, unit + API tests, `npm audit`, secret scan on every PR; Dependabot/Renovate | SEC-12, BE-12 | M |
| 3.5 | Ops: `/healthz`, graceful shutdown, error tracking (e.g. Sentry), uptime alerts; move cron to a single scheduler with a lock | BE-22, BE-30 | M |
| 3.6 | Backups: encrypt, retention rule, monthly restore test, least-privilege DB user, correct DB name | SEC-20 | S |
| 3.7 | Frontend: design tokens (semantic), remove hex literals (lint rule), accessible primitives (RadioGroup/ToggleGroup/Tabs) replacing clickable `div`s, merge `component/` and `components/` structure | UX-01, UX-48, UX-49, FE-01, FE-02, FE-32, FE-36 | L |
| 3.8 | PII minimisation: opaque signed QR, private Cloudinary delivery, no TinyURL, data-retention rule for guest records | SEC-11, SEC-21 | M |

## Phase 4 — Product improvements (after the foundation is stable)

- **Tablet-first restaurant POS** (Beach & Pool): 44 px targets, persistent cart, automatic "rounds", table map
  with order numbers, outlet identity in the header (UX-16, UX-17, UX-50).
- **Reception wizard**: Guest → Rooms → Pricing → Review → Confirm, a dedicated Switch-Room dialog, live
  nights/price recalculation on booking edits (UX-12, UX-28, UX-32).
- **Reservations with date ranges** if advance bookings are wanted (BE-09).
- **Shift close / reconciliation** for restaurants: totals by payment method, reprints (UX-37).
- **Stronger staff authentication** suited to a POS: per-device registration + PIN unlock (SEC-05).

---

## Decisions the business needs to make

These block or shape several items above; the code cannot answer them.

1. **Taxes and service charge:** which taxes apply to rooms and restaurants, are rates inclusive or exclusive, and
   is the room report's 1/11 service-charge formula the intended one? (BE-15, BE-27)
2. **Exchange-rate policy:** rate at check-in, per night, or at checkout? Who may change rates? (BE-10)
3. **Overstay rule:** what should the nightly job do, and at what time? (BE-22)
4. **Stock units:** are beverages counted in bottles, ml, or both (bottle size per item)? (BE-06)
5. **Room numbering:** do the two hotels share one room inventory/numbering? (BE-09)
6. **Approvals:** who may give free bills, discounts above which limit, cancel completed orders, edit room prices?
   (SEC-09, UX-18)
7. **Staff sign-in:** keep 4-digit PINs (then only on registered devices) or move to passwords? (SEC-05)
8. **Advance reservations:** needed in this system, or handled elsewhere (e.g. Booking.com extranet)? (BE-09)
9. **Production database:** which database name does the live API use (backup workflow dumps `production`)?
   (SEC-20)
10. **Personal data:** how long to keep guest passport/contact data, and who may see it? (SEC-11)
