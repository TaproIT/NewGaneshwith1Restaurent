# 03 · Backend Review — correctness, data integrity, performance, maintainability

Scope: every file in `backend/` (76 source files, ~10,750 lines). Security issues are in
[02-security-review.md](./02-security-review.md) and are only cross-referenced here. Two independent passes were
made (my own full read, and a separate reviewer agent that also checked several Mongoose behaviours in a scratch
install of mongoose without a database; the lockfile pins 8.24.5, where the same behaviours hold); every finding below was re-checked against the source.

**Bottom line:** the core ideas are sound (transactions for check-in/checkout, server-side re-pricing of restaurant
items), but money, dates and stock are each handled in several inconsistent ways, two very large controllers hold
almost all logic, and there are no tests. The most serious functional risks are a crash path in order processing,
double-billing after a room switch, and restaurant room-charges that can silently miss the guest's bill.

---

## 1. Scorecard

| Area | Rating | Why |
|---|---|---|
| Architecture & layering | ⚠️ Weak | routes → controllers → models only; no services, validation layer, error handler or config module |
| Data model | ⚠️ Weak | denormalised flags (`isBooked`), money as floats, mixed units in one field, missing unique indexes, `enums:` typos |
| Billing correctness | ❌ At risk | double-billing paths, client-trusted tax/discount, GET with side effects, FX applied at view time |
| Inventory correctness | ❌ At risk | non-atomic stock writes outside transactions, no reversal on cancel, liquor never deducted |
| Date/time handling | ❌ At risk | 8 different date mechanisms (2 correct); reports shift by 5 h 30 min |
| Concurrency | ⚠️ Mixed | booking create/checkout are transactional; room switch, stock, tables, counters are not |
| Performance | ⚠️ OK today | N+1 lookups, unbounded lists and growing arrays will hurt as data grows |
| Maintainability | ❌ Poor | 2 controllers > 1,900 lines, ~30 % commented-out code, inconsistent naming and response shapes |
| Tests | ❌ None | `npm test` is the npm placeholder |

## 2. Findings summary

| ID | Severity | Area | Title |
|---|---|---|---|
| BE-01 | Critical | Reliability | Un-awaited liquor-volume update can crash the API process (= SEC-13) |
| BE-02 | Critical | Billing | Extending a stay after a room switch re-bills the room the guest already left |
| BE-03 | High | Billing | Restaurant "charge to room" is two separate browser calls; the order can be completed but never reach the guest's bill |
| BE-04 | High | Billing | Billing-summary `GET` rewrites money fields and has no checked-out guard |
| BE-05 | High | Billing | Checkout trusts client tax/discount/extras and compares against stale stored totals |
| BE-06 | High | Inventory | Stock writes are non-atomic, outside the order transaction, failures ignored, never reversed |
| BE-07 | High | Orders | Closed orders remain editable/billable; cancelling a room-charged order still bills the guest |
| BE-08 | High | Rooms | Room switching is not transactional and books new rooms without a conditional check |
| BE-09 | High | Rooms | Availability is a single `isBooked` flag; maintenance rooms can be sold; no cancellation/no-show flow |
| BE-10 | High | Money | Exchange rate applied at viewing time; future-dated or zero rates accepted |
| BE-11 | High | Numbering | Invoice numbers can repeat; invoice total is client-supplied |
| BE-12 | High | Quality | No automated tests for booking, billing, stock or auth |
| BE-13 | Medium | Billing | A same-day room switch charges an extra night |
| BE-14 | Medium | Money | `finalRoomTotalPrice` holds room currency or LKR depending on which code wrote it last |
| BE-15 | Medium | Money | Floating-point money, inconsistent types and rounding; tax/service-charge rules hard-coded and inconsistent |
| BE-16 | Medium | Dates | Dates handled eight different ways; reports and IDs shift by 5 h 30 min |
| BE-17 | Medium | Rooms | Prices and currencies from the client without bounds; edits hit the first matching history row |
| BE-18 | Medium | Orders | Token writes are not idempotent; re-saves recreate items and decrement stock again |
| BE-19 | Medium | Orders | Stored line items keep client title/price; hidden or other-restaurant items accepted |
| BE-20 | Medium | Orders | Admin/Super-Admin have no restaurant, so order endpoints they are allowed to call fail |
| BE-21 | Medium | Reports | "Sold" beverage/liquor summaries count cancelled, held and orphaned items |
| BE-22 | Medium | Jobs | Nightly cron extends bookings on the morning of their checkout day and runs on every instance |
| BE-23 | Medium | Data model | `enums:` typo disables validation on 6 fields in 5 schemas; missing unique indexes |
| BE-24 | Medium | Data model | Writes to fields not in the schema are silently dropped (several features silently broken) |
| BE-25 | Medium | Performance | N+1 queries, unbounded queries, in-memory pagination, growing embedded arrays, no indexes on hot paths |
| BE-26 | Medium | Reliability | External calls (Cloudinary, SMTP, TinyURL) inside requests, no timeouts, orphaned data |
| BE-27 | Medium | Reports | Room report: preview and saved service-charge formulas differ; counts always wrong |
| BE-28 | Medium | API design | Inconsistent response shapes and status codes; no validation layer; errors leak internals |
| BE-29 | Medium | Architecture | No service layer; 2,000-line controllers; ~1,500 lines of commented-out code |
| BE-30 | Low | Various | 20+ smaller defects (see §4 table) |

---

## 3. Findings in detail

### BE-01 · Critical · Un-awaited stock logging can crash the API

`order-controller.js:699-702` and `:802-805` call `updateBeverageVolumeManually(...)` without `await`/`.catch`.
The helper throws when `volume <= 0` or the beverage is missing (`utils/beverageStock.js:46-53`).
`PBFoodNet.liquor[].amount` defaults to `0` (`models/PoolAndBeachResturant/PBFoodNet.js:14`). No
`unhandledRejection` handler exists, so on Node ≥ 15 the process exits — taking every user offline mid-shift.
**Fix:** await inside the transaction with the session; validate liquor references/amounts first; add a logging
`unhandledRejection` handler and a restart policy as a safety net.

### BE-02 · Critical · Extending a stay after a room switch re-bills the old room

`updateBooking` rewrites **every** `roomsHistory` row when the checkout date changes:
`r.switchOutDate = newCheckOutDate; r.night = …; r.finalRoomTotalPrice = r.perDayPrice * booking.lengthOfStay`
(`booking-controller.js:1541-1545`). The billing summary then bills switched-out rows from `switchInDate` to that
(possibly future) `switchOutDate` without clamping to today (`total-bill-calculation-controller.js:131-134`).

*Worked example:* check in 1 May in room 101, switch to 102 on 3 May, extend checkout to 10 May on 4 May. At
checkout on 10 May the bill contains 101 for 9 nights (1→10 May) **and** 102 for 7 nights (3→10 May) — 16 room
nights for a 9-night stay.
**Fix:** only touch the active (`isSwitched === false`) rows; never modify history of rooms the guest has left;
clamp every row's end date to "today" in the summary.

### BE-03 · High · "Charge to room" can silently miss the guest's bill

`OrderBillDetailsModal.tsx:220-238` first completes the order (`PATCH /order/:id/bill-details`, payment "Room"),
then in a **second** call links it to the booking (`PATCH /booking/:id/add-order`). The hotel bill only sums
`booking.orders` (`total-bill-calculation-controller.js:95-98`). If the second call fails (network, tab closed) the
order is closed as "paid by room" but never billed. `addOrderToBooking` also returns **200** "Order not added —
does not belong to this booking" when `order.bookingId` is missing (`booking-controller.js:1182-1184`), which the
UI treats as success; and it does not check that the booking is still open.
**Fix:** do the link server-side in the same transaction as completing the order; reject room charges for
checked-out bookings; or compute the folio from `Order.bookingId` instead of a second list.

### BE-04 · High · A `GET` that writes the bill

`getBookingBillingSummary` recalculates and **saves** `finalAllRoomsTotalPrice`, `totalOrdersBill`, `totalBill`
and every history row (`total-bill-calculation-controller.js:184-232`) on each call, with no `isCheckOut` guard.
Called on a checked-out booking (any authenticated user can), it overwrites the final bill — dropping extras and
discount and adding nights up to today. It also races with checkout (no transaction). The UI currently calls it
only for open bookings (`component/checkout/CheckoutDetails.tsx`), so this is a latent data-loss path.
**Fix:** make the summary a pure computation; persist totals only inside the checkout transaction.

### BE-05 · High · Checkout trusts the client and stale totals

`finalizeBookingBill` checks the client's `originalBillTotal`/`totalRoomCharge`/`totalOrdersPrice` against the
values **stored by the last summary call**, not against a fresh computation
(`total-bill-calculation-controller.js:460-494`). Orders added after the summary are therefore not billed even
though the numbers "match". `tax` is accepted as any number (negative allowed), `discount` has no upper bound
(only `< 0` rejected, `:390-415`), service charge is forced to 0 (`:339`). The early-checkout check
`isCheckOutValid` is computed and never used (`:443`). `booking.miniBar = Number(miniBar)` stores `NaN` (cast error)
if the field is omitted (`:558-560`; the current UI always sends it).
**Fix:** recompute everything inside the checkout transaction from the database; accept only operator inputs
(extras, discount within policy, payment method); bound and authorise discounts.

### BE-06 · High · Stock integrity

- `updateBeverageQuantityManually` is read-modify-write (`utils/beverageStock.js:5-42`) — two concurrent sales can
  lose a decrement; it runs **outside** the order transaction (no session), so stock is reduced even if the order
  aborts; when stock is insufficient it returns `{success:false}` and the caller ignores it (order succeeds, stock
  unchanged).
- A sale is written to `historyQuantity` as `purchasedStock` with `isPurchased: true` (`:25-35`) — the same fields
  that mean "purchase" elsewhere, so history cannot distinguish sales from restocks.
- `cancelOrder` never restores stock (`order-controller.js:1840-1873`).
- Liquor poured into food/cocktails is only appended to `historyVolumeForPBFoodNet`; `runningStock` never
  decreases (`beverageStock.js:45-68`). Units are undefined (bottles vs ml — Needs confirmation).
- `addBeverageQuantity` does `oldStock + quantity` without `Number()` (`beverageController.js:100`) — a string
  quantity concatenates (`10 + "5"` → `"105"`, saved as 105).
- Every sale pushes into an embedded array on the beverage document, which grows without bound.
**Fix:** a `StockMovement` collection (type: purchase/sale/waste/adjustment/reversal, qty, unit, ref), atomic
`$inc` with a `runningStock >= qty` filter inside the order transaction, reversal on cancellation, defined units.

### BE-07 · High · Closed orders stay changeable and billable

`addOrderToken` and `updateOrderBillDetails` do not check `orderStatus`, so items can be added to, and bills
re-finalised on, COMPLETED or CANCELED orders. `cancelOrder` cancels anything, including completed room-charged
orders — which stay in `booking.orders` and are still summed into the hotel bill
(`total-bill-calculation-controller.js:95-117` sums all linked orders regardless of status). Free-Bill takes a path
that does not even check the order exists (`order-controller.js:1005-1026`).
**Fix:** an explicit state machine (open → printed → billed → closed / cancelled) enforced on every write; exclude
cancelled orders from folios; reversal entries instead of edits.

### BE-08 · High · Room switching is not atomic

`switchRoomsBulk` (`booking-controller.js:870-1006`) reads `isBooked`, then frees old rooms and books new ones with
unconditional `updateMany` calls, uploads a new QR, and only then saves the booking — no transaction. Two
receptionists can switch different guests into the same room; a Cloudinary failure leaves rooms freed/booked while
the booking is unchanged. New `currentRooms` entries are written with `perDayPrice` (not in the schema; `price` is
dropped) and `hist.isActiveForCheckout` is also dropped (BE-24).
**Fix:** one transaction with conditional `updateMany({no: {$in}, isBooked: false})` + modified-count check, QR
after commit.

### BE-09 · High · Availability model

Availability is `Room.isBooked` (+ `isMaintenance`), not date ranges. Consequences: no future reservations (the UI
forces check-in = today), `createBooking` sells rooms under maintenance (it filters only `isBooked: false`,
`booking-controller.js:139-142, 172-176`), anyone can flip the flag via the public `PUT /room/update/:id`
(SEC-03), and there is **no booking cancellation / no-show endpoint** — a mistaken check-in can only be undone by
checking out or by manually toggling the room. The model also has no `hotel` field although bookings belong to one
of two hotels (Needs confirmation: do the hotels share room numbers?).
**Fix (incremental):** keep `isBooked` as a cache but add `status` (occupied/vacant-clean/vacant-dirty/out-of-order)
and `hotel` to rooms, a cancel/void booking endpoint with audit, and reject maintenance rooms. **Fix (strategic):**
a reservations model with date ranges if advance bookings are wanted.

### BE-10 · High · Exchange-rate handling

Billing converts USD/EUR → LKR with the latest `CurrencyValue` by `effectiveAt` at the moment the summary is viewed
(`total-bill-calculation-controller.js:54, 143-155`); every night of a stay uses that one rate. `PUT
/currency-values/:id` can set `effectiveAt` in the future (`currency-value-controller.js:108`), which then becomes
"latest" immediately; the schema allows `0` (`models/currency-value.js:6-7`, `min: 0`). The frontend's own rate
context reads a non-existent `lkr` field (FE-22).
**Fix:** decide the policy (rate at check-in, per night, or at checkout) and store the rate used on the booking;
ignore future-dated rates; require `> 0`; restrict who can edit rates (SEC-03).

### BE-11 · High · Invoice numbering

`generateInvoiceNumber` uses an atomic `$inc` with `upsert` (`utils/invoice-util.js`), but the counter's unique
index is commented out (`models/Reception/invoice-counter.model.js:7`), so two concurrent first calls can create two
counters; `invoiceNumber` has no unique index; Reception can reset the counter (SEC-22). The invoice `total` comes
from the client and is not recomputed from `selectedRooms` × nights (`invoice-controller.js:11-88`).
**Fix:** unique indexes, Super-Admin-only reset with audit, server-side totals.

### BE-12 · High · No tests

Nothing protects the billing, timezone and stock rules described here. **Fix:** start with unit tests for the
nights/FX/total calculation and the order total check, then API tests (Jest + supertest + mongodb-memory-server
replica set) for check-in → switch → extend → checkout and order → token → bill → room-charge.

### BE-13 · Medium · Same-day switch charges an extra night

`diffNightsTZ` returns at least 1 night **per history row** (`total-bill-calculation-controller.js:32-38`).
Switching on the arrival day bills the old room 1 night plus the new room from the same day.
**Fix:** apply the minimum per booking; attribute each night to the room occupied at night-audit time.

### BE-14 · Medium · One field, two currencies

`finalRoomTotalPrice` is written in the room's currency at create/update (`booking-controller.js:239, 1544`) and
in LKR by the billing summary (`total-bill-calculation-controller.js:198`); the fallback branch (`:213`) explicitly
does not convert. The room report then labels it with the room's currency (`controllers/Excel/room-report.js:52-67`).
**Fix:** store `{amount, currency}` pairs, separate original-currency and LKR totals, plus the rate used.

### BE-15 · Medium · Money arithmetic and rules

Amounts are JS floats everywhere except `Invoice.total` (Decimal128, serialised as `{"$numberDecimal": …}`).
Restaurant totals are compared with `toFixed(2)` (`order-controller.js:563-664`) while `updateOrderBillDetails`
uses strict float equality `backendTotal !== totalBill` (`:1056`) — fractional discounts can fail spuriously. Rules
differ by module: restaurant service charge 10 % on subtotal before discount (`:559`), hotel service charge forced 0,
tax never computed anywhere, room report service charge 10 % in preview vs 1/11 on save (BE-27).
**Fix:** integer minor units (or Decimal128 everywhere), one money module, one configurable tax/SC policy with
effective dates.

### BE-16 · Medium · Eight date mechanisms (two of them correct)

| Mechanism | Where | Effect |
|---|---|---|
| `dayjs().tz("Asia/Colombo")` | booking create/update validation, billing, cron, currency upsert | correct |
| fixed `+05:30` offset maths | `utils/findActiveBookingByRoomNo.js` | correct but a second mechanism |
| `new Date("YYYY-MM-DD")` (= UTC midnight = 05:30 Colombo) | `order-controller.js:1318, 1690, 1765, 1895, 2001`; `invoice-controller.js:125-126`; `controllers/Excel/room-report.js:11-12, 230` | report day windows start 5 h 30 min late |
| `setHours`/`setDate` (server-local) mixed with the above | `order-controller.js:1320, 1403, 1692, 1767, 1897, 2003`; `controllers/Excel/room-report.js:235` | windows depend on host TZ |
| `$year/$month/$dayOfMonth` without `timezone` | `order-controller.js:1910-1912, 2016-2018`; `hotelDashboardController.js:126-127` | daily totals grouped by UTC day |
| server-local `new Date()` parts | booking ID date key (`models/Reception/booking.js:185-189`), token IDs, dashboards, beverage month buckets | IDs/months off between 00:00-05:30 |
| local time + literal `Z` | `updateBooking` (`booking-controller.js:1478-1484`); "MM/DD" input assumes the current year | wrong instant; December → January bug |
| raw client strings stored | `createBooking` validates normalised dates but saves the raw `checkIn`/`checkOut` (`:196-197, 240-241`) | stored instant depends on client format |

Restaurant sales between midnight and 05:30 therefore land on the previous day in daily summaries and Excel exports.
**Fix:** one `hotelTime` helper; store business dates as Colombo start-of-day; pass `timezone: "Asia/Colombo"` to
date aggregation operators; parse inputs with an explicit format.

### BE-17 · Medium · Unbounded client prices; wrong history row

Create, switch and update accept any per-day price and currency per room (`booking-controller.js:206-207, 946-947,
1430-1456`) — 0, negative or `NaN` included. `updatedRooms` edits the **first** history row with that room number,
which may be a switched-out row. The frontend sends every room on every update, so a price-history entry is
appended for unchanged rooms too.
**Fix:** validate `price ≥ 0`, enum currency; target the active row; record only real changes, with user and reason.

### BE-18 · Medium · Non-idempotent token writes

A client retry creates a second token and decrements stock again; updating a printed token re-creates its items
(old item documents are orphaned) and decrements stock again for all items; `tokenNumber` is client-supplied
(`order-controller.js:604-629, 675-780, 861-883`). Updating a token that is already in `order.orderTokens` adds its old
totals into the "existing tokens" sum, so the totals check fails unless the client inflates totals.
**Fix:** idempotency key per request; printed tokens immutable (corrections as new tokens); server-generated token
numbers; reads inside the session.

### BE-19 · Medium · Client data stored on line items

The total check uses database prices, but stored items keep the client's `title`/`price` (`order-controller.js:687,
790`), so per-item reports can be skewed while the sum still matches; hidden (`isVisible:false`) and other-restaurant
items are accepted; `subTotal` written on items is not in the schema and is dropped.
**Fix:** build items from the database record; check visibility and restaurant.

### BE-20 · Medium · Admins cannot use the order endpoints they are allowed to call

`getRestaurantTypeByUserRole` returns `undefined` for Admin/Super-Admin (`utils/user-util.js:5-24`), so
`generateOrderNumber(undefined)` throws (`utils/order-util.js:4-7`), item `restaurantType` fails validation, and
table/hold lists filter on `null`. Each call also costs an extra `User.findById`.
**Fix:** require an explicit, validated restaurant for multi-restaurant roles; put role/restaurant in the JWT or a
per-request cache.

### BE-21 · Medium · Sales reports count things that were not sold

`getBeverageSoldSummary` and `getLiquorSummaryForOtherItems` aggregate **all** `BeverageOrderItem`/`FoodOrderItem`
documents in the date range (`order-controller.js:1695-1707, 1770-1780`) — including items of cancelled orders,
unprinted hold tokens and orphaned items from token re-saves (BE-18). The liquor summary key splits on `-`, so
names containing a hyphen are cut (`:1809-1818`). `getOrderSummary`'s beverage pipeline unwinds a non-existent
`items` field on `OrderToken` (always empty, `:1440-1461`) and counts cancelled orders. `getDailyRestaurantTotals`
always reports `restaurantType: "Beach"` (`:1961`); the Excel title uses the raw query parameter, so Beach staff
exporting without it get the Pool title (`:2075-2078`).
**Fix:** derive sales from completed orders' printed tokens; fix labels.

### BE-22 · Medium · Nightly auto-extension

At 00:05 Colombo, bookings whose checkout is **today** get `checkOut += 1 day` (`utils/scheduleExtendCheckouts.js:16-60`)
— before the guest has had a chance to leave, so the stored checkout of an in-house guest is never "today".
`lengthOfStay` and history rows are not updated; the `bulkWrite` filter lacks `isCheckOut:false`; every API
instance schedules the job (no lock); on a sleeping/free host the job may not run at all. Separately,
`getTodayExtendedRooms` selects `currentRooms.roomNo` but then filters on `isActive`, which was not selected, so it
**always returns an empty list** (`booking-controller.js:1132-1137`).
**Fix:** confirm the business rule (an overstay job normally targets `checkOut < startOfToday` after the checkout
hour); single scheduler with a lock; fix the projection.

### BE-23 · Medium · Schema validation gaps

`enums:` (should be `enum:`) silently disables validation on 6 fields in 5 schemas: `models/Reception/invoice.js:16`,
`models/order/restaurant-table-model.js:16,25`, `models/ExtraBeverages/extraBeverageCategory.js:9`,
`models/PoolAndBeachResturant/PBFoodNet.js:7`, `PBFoodNetCategory.js:6`. Missing unique indexes the code relies on:
`Invoice.invoiceNumber`, `InvoiceCounter.name`, `Order.orderNumber`, `RestaurantTable{restaurantType, tableNumber}`,
`RoomCategory.type`, `BlackListToken.token` (not even a plain index). `Beverage` indexes `history.year/month`, a path
that does not exist (`models/Beverage/beverage.js:59`). No `min: 0` on any price.

### BE-24 · Medium · Writes to fields that don't exist

Mongoose strict mode silently drops: `currentRooms[].perDayPrice` and `roomsHistory[].isActiveForCheckout`
(`booking-controller.js:922, 963-969`); `Beverage.status` (`beverageController.js:51`) — so every `status ===
"deleted"` check is dead (soft-deleted beverages are still sold/updated) and `getCategorySummary` filters
`{status:"active"}` and reads `it.history` → **always empty** (`:652-719`); `subTotal` on order items.

### BE-25 · Medium · Performance

N+1: `getAllRoomsWithBookingDetails` / `getAllReservedRoomsWithBookingDetails` do two queries per room
(`booking-controller.js:1011-1075`); `addOrderToken` does one `findById` per line item; `authorizeRoles` +
`getRestaurantTypeByUserRole` re-read the user on every request. Unbounded: `getAllUsers`, `getAllRooms`,
`getInvoices`, room reports (loads **all** report keys into memory, `controllers/Excel/room-report.js:28-29`), beverage summaries,
`getAllActiveBookings` search path (three sequential unbounded queries, then in-memory pagination,
`booking-controller.js:1735-1800`), `limit` query parameters with no maximum. Growing arrays:
`Beverage.historyQuantity` / `historyVolumeForPBFoodNet` (one element per sale). Missing indexes on hot filters:
`Order{restaurantType, orderStatus, createdAt}`, `Order.bookingId`, `Booking.currentRooms.roomNo`,
`*OrderItem.createdAt`, `RoomReport{bookingId, roomNo}`.

### BE-26 · Medium · External calls inside requests

Check-in uploads the QR to Cloudinary **before** the transaction (`booking-controller.js:151-163`): a slow
Cloudinary blocks check-in, and a failed transaction leaves an orphan image. Room switching uploads mid-way
(BE-08). TinyURL and SMTP calls have no timeout; a new Nodemailer transporter is created per e-mail.
**Fix:** generate/upload after commit (or via a job queue) with retries and cleanup; timeouts; reuse transporters.

### BE-27 · Medium · Room report

Preview computes service charge as 10 % of gross and net = 90 % (`controllers/Excel/room-report.js:52-54`); save
computes `serviceCharge = gross / 11`, `net = serviceCharge × 10` (`:144-150`) — different numbers for the same
booking. Save spreads the client row (`...r`, `:152-159`), returns early on a bad row after earlier rows were
written, and relies on `rawResult`, which Mongoose 8 ignores (`:171-175`), so the created/updated counts are always
wrong. Reports are keyed by `bookingId|roomNo`, so a guest who returns to the same room collapses into one row.

### BE-28 · Medium · API consistency

At least five response shapes coexist: `{status,message,data,timeStamp}` (`response-util`), `{success,data}`,
`{success,error}`, raw arrays/objects (`room-controller`), `{error}` / `{message}`. Status codes are inconsistent
(empty lists as 404 in `getAllUsers`, `getHoldOrders`, `getAllBeverages`; 404 for "already checked out";
`res.statusCode(400)` called as a function in `pbfoodnetController.js:243`). There is no request-validation layer
(the well-written `validations/guest-validations.js` is never used). Reads implemented as `POST`
(`/booking/get-all-active-bookings`). This is why several frontend error toasts show generic or no text (FE-14).
**Fix:** one envelope, one error handler, zod/Joi schemas per route, REST resource paths, OpenAPI spec.

### BE-29 · Medium · Code organisation

No service layer; `booking-controller.js` (1,981 lines) and `order-controller.js` (2,251 lines) each mix HTTP,
validation, business rules, persistence and formatting, with the same order-item block duplicated four times
(`order-controller.js:683-859`). About 1,500 lines are commented-out previous versions. Naming: folders
`PoolAndBeachResturant`, `routes/Admin/user-handelling-routes.js`, a config file literally named `" cloudinary.js"`
(leading space; unused, duplicates `utils/cloudinary.js`), persisted typos `laundary` and `oderId`, mixed file
casing, `deleteUserById` that deactivates. Duplicated constants: `TZ` defined in five files (twice in
`booking-controller.js`), `PaymentMethods` in two places, `CustomerTypes` in two places, date helpers in
`utils/Day.js` (exports nothing) and again in the billing controller; hotel names hard-coded in four files.

---

## 4. Lower-severity defects (BE-30)

| Where | Defect |
|---|---|
| `server.js:31` | `connectDB()` not awaited — server listens before the DB is connected; no `/healthz`, no graceful shutdown |
| `server.js:37-38` | `.split` on env vars that may be undefined → crash with unclear error at startup |
| `server.js:61-62, 113-119` | two JSON body parsers; duplicate socket `connection` handler |
| `config/cors-config.js` | imported, unused, references different env vars |
| `utils/auth-util.js:4` | reads `process.env.SALT` (env file defines `SALT_ROUNDS`); if `SALT` were set to `"10"` bcrypt would throw "Invalid salt" |
| `auth-controller.js:75` | default `userRoles.USER.value` — `USER` does not exist, so omitting `userRole` throws a TypeError (500) |
| `room-controller.js:55-58` | `findById("101")` throws CastError, so "update by room number" fallback is unreachable (500) |
| `room-controller.js:207-218` | deleting a room category leaves rooms pointing at nothing |
| `room-controller.js:7-36` | `addRoom` ignores `currency`; price not validated; no delete-room endpoint |
| `booking-controller.js:539` | WhatsApp default text uses `booking.totalPrice` (does not exist) → "Total: $undefined" |
| `booking-controller.js:565, 611` | `room.perDayPrice` dereferenced when `Room.findOne` returns null; `defaultPrice` from the queried room used for every room |
| `booking-controller.js:1781-1789` | search path maps an empty array then overwrites it → `roomSwitchingHappened` missing in search results |
| `booking-controller.js:1747,1759,1771,1809` | populate selects `fullName`; the User field is `name` |
| `booking-controller.js:1571-1663` | `searchBookings` exported, not routed, no try/catch |
| `booking-controller.js:1939-1979` | `getBookingByIdIfCheckedOut` has no ObjectId check → 500 with raw error object |
| `order-controller.js:1169-1182` | `getHoldOrders` `$or` makes the hold condition meaningless — returns every open order |
| `order-controller.js:177-196` | table assignment check-then-act (race); table restaurant not checked; tables never released on re-assignment |
| `extra-beverage-controller.js:29-49` | `listExtraBeverageCategories` reads `req.user` on an unauthenticated route → always 500; reads `req.body` on GET |
| `extra-beverage-controller.js:195, 268` | populates `liquor.beverage` with `name`; Beverage uses `beverageName` |
| `extra-beverage-controller.js:309-352` | "available" extras ignore restaurant and `isEnableBeverage` |
| `pbfoodnetController.js:172` | `runValidators:false` on update; category change not checked against the item's restaurant |
| `invoice-controller.js:140-166` | populate selects `name type description` (only `type` exists); list omits `_id`; `total` as Decimal128 object; unbounded |
| `token-util.js:31-49` | `verifyEncodedToken` uses undefined `res` |
| `utils/order-util.js:16` | `prefix` computed and unused |
| `models/Reception/booking.js:4-10` | booking `PaymentMethods` lacks "Room"; `paymentMethod` not required at checkout schema level |
| `models/Reception/booking.js:182-205` | booking-ID counter increments outside the transaction (gaps; E11000 race on first booking of a day) |

## 5. What is good and worth keeping

- `createBooking` and `finalizeBookingBill` use MongoDB transactions with conditional updates — the right pattern;
  extend it to switching, stock and order billing.
- `addOrderToken` re-prices from the database and checks totals server-side — the right instinct; extend it to
  building the whole line item from the database.
- `findActiveBookingByRoomNo`, the billing summary and the cron consistently use Colombo time — reuse these helpers
  everywhere.
- Atomic `$inc` counters for booking and order numbers.
- Soft-delete (`isVisible`) on menu items rather than hard deletes.

## 6. Target backend shape (incremental, no big-bang rewrite)

```
backend/src/
  app.js                 # express app (helmet, cors, rate-limit, json, routes, 404, error handler)
  server.js              # http + socket + graceful shutdown (cron moved to a worker)
  config/                # env schema (zod) — fail fast on missing vars
  lib/                   # time.js (Colombo), money.js (minor units), logger.js (pino), errors.js
  modules/
    auth/   rooms/   bookings/   billing/   orders/   menu/   inventory/   invoices/   reports/   users/
      *.routes.js        # thin: auth + validate(schema) + controller
      *.controller.js    # HTTP only
      *.service.js       # business rules + transactions
      *.schema.js        # zod request schemas
      *.model.js
  jobs/                  # night audit / overstay job with a lock document
tests/                   # unit (money/time/billing) + API (supertest + mongodb-memory-server replset)
```

Move one module at a time (billing first, then orders/inventory), keeping URLs stable for the frontend.
