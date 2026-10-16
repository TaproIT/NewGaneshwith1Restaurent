# 04 · Frontend Engineering Review

**Scope:** every file in `frontend/` (227 source files in `src/`, ~22.9k lines, plus the Vite/TS/ESLint/Vercel
config). The backend's `server.js`, routes and the relevant controllers were read to check API contracts.
**Method:** manual reading of every file, including both print utilities in full (each carries a ~30 KB base64
logo). For verification only, `tsc --noEmit`, `eslint .` and `vite build` were run on a **scratch copy outside the
repository** (images were stubbed in that copy because only source files had been copied — the real repository
does contain `src/assets` and `public/`). **No project file was modified.** A dedicated frontend reviewer pass
produced the first draft; I re-checked the key claims against the source (the PATCH/PUT stock mismatch, the
Excel/Daily-Summary `restaurantType` wiring, the invoice-list `_id` and 0.00 print lines, the discount sign bug,
logout state, the socket env var and lock/unlock keys, the empty-category reducer crash, response-key mismatches,
console logging of passwords, and the hard-coded `breakfast: "Included"` in saved room reports).
**Conventions:** paths are relative to `frontend/src/` unless prefixed with `backend/`. Severity is Critical, High,
Medium or Low. Items that could not be fully verified are marked **Needs confirmation**. `.env` values are never
quoted; only variable names are used. Security items that are mainly server-side are in `02-security-review.md`
(cross-referenced as SEC-nn); UX consequences are in `05-uiux-review.md` (UX-nn).

---

## 0. Executive summary (top issues)

| # | ID | Sev | One-liner |
|---|----|-----|-----------|
| 1 | FE-04 | Critical | Role gating exists only in the sidebar. `ProtectedRoute` checks only that a token exists. Any logged-in user can open `/admin/currency-config`, `/admin/room-config`, `/reports` and the beverage inventory pages, and the backend endpoints behind these pages have **no auth at all**. |
| 2 | FE-28 | High | The bearer token sits in `localStorage`. An **unpinned, SRI-less third-party script** (`qz-tray` from jsDelivr) is injected at runtime from 7 components (two of them unused), and there is no CSP. A compromised CDN package could steal the token. |
| 3 | FE-40 | High | "Remove beverage stock" calls `PATCH /beverages/reduce-beverage-quantity/:id`, but the backend only defines `PUT`, so the request returns 404 and the feature is broken. |
| 4 | FE-41 | High | A Pool-Restaurant-Admin's Excel download is hard-wired to `restaurantType=Beach`, so they export the other restaurant's data. The admin restaurant filter on Daily Summary is never sent. |
| 5 | FE-19 | High | Restaurant order totals are derived in a `useEffect` and stored in Redux. The effect adds the discount instead of subtracting it, and reads stale values. The backend compares client totals with strict or `toFixed(2)` equality, so this is fragile and can produce 400 "mismatch" errors. |
| 6 | FE-20 | High | The invoice `total` is computed only when the user clicks "Confirm Rooms", and the backend stores it as-is. Invoices can be saved with a 0 or stale total. |
| 7 | FE-24 | High | A4 bill and invoice HTML is assembled by string interpolation of **unescaped** guest, charge and item names. Anyone who can type a name can alter official printed documents. |
| 8 | FE-29 | High | Passwords (temp, new and confirm) are `console.log`ged, along with full guest bills and booking PII. 37 `console.log` calls survive into the production bundle. |
| 9 | FE-13 | High | There is no refresh-token flow, although the backend issues one. Any 401 does `window.location.href="/"`, a hard reload that wipes in-progress carts and checkouts. Access tokens live 3h. |
| 10 | FE-08 | High | Logout does not reset Redux. Guest PII, the order cart and the previous role persist for the next user on a shared terminal. |
| 11 | FE-34 | Medium | The room-lock socket uses `import.meta.env.SOCKET_URL`, which is not `VITE_`-prefixed, so the value is `undefined` and real-time locking never connects. Lock and unlock also use different keys. |
| 12 | FE-32 | Medium | The whole app ships as one 1.21 MB JS chunk (369 KB gzip). There is no lazy loading, unused dependencies are included, and the base64 logo is bundled twice. |

---

## 1. Stack & structure overview

**Stack** (`package.json`): React 19.1, TypeScript ~5.8 (strict), Vite 7, Tailwind v4 via `@tailwindcss/vite`, shadcn/ui (new-york style, `components.json`), Redux Toolkit 2 with react-redux 9, react-router-dom 7, axios, react-hook-form with zod (zod is used only on Login), react-toastify, chart.js with react-chartjs-2, socket.io-client, date-fns, and QZ Tray loaded from a CDN at runtime for printing. Deployment is Vercel (`vercel.json` SPA rewrite only).

**Folder layout (as found)**

```
src/
  App.tsx, main.tsx, index.css
  Layout/            Header, Sidebar, Layout (capitalised folder)
  api/axios.tsx      axios instance (.tsx without JSX)
  api/order/*.ts     30 createAsyncThunk files (restaurant domain only)
  app/store.ts       configureStore (15 slices)
  component/         custom components (+ domain model .ts files!)
  components/ui/     shadcn primitives (alias target in components.json)
  context/           CurrencyContext, RateContext
  features/*/        RTK slices (some contain thunks + axios calls)
  lib/               utils.ts (cn), order-util.ts, enums/
  util/              priceConverter, currencySymbol, printCheckout, printInvoice, printerConfig
  pages/             route-level components
  types/             shared TS types (partially duplicated elsewhere)
```

**Build and quality signals (scratch copy):**

| Check | Result |
|---|---|
| `tsc -p tsconfig.app.json --noEmit` | passes (strict mode, but see FE-18: `any` everywhere) |
| `eslint .` | **132 errors, 25 warnings**: 107 `no-explicit-any`, 25 `exhaustive-deps`, 14 `no-unused-vars`, **3 `rules-of-hooks`**, 5 `only-export-components`, 2 `no-wrapper-object-types`, 1 `prefer-const` |
| `vite build` | one JS chunk `index-*.js` **1,212.94 kB (368.95 kB gzip)** plus 83 kB CSS, with a Vite >500 kB warning |
| Tests | none (no runner, no `*.test.*` / `*.spec.*`) |
| CI | the repo's `.github/workflows` has only `google-drive-backup.yml`; no lint, typecheck or test job |

---

## 2. Route map (App.tsx)

All routes except `/` sit under `<ProtectedRoute><Layout/></ProtectedRoute>` (`App.tsx:55-61`). `ProtectedRoute` only checks `localStorage.getItem("authToken")` (`component/ProtectedRoute.tsx:9-14`). **No route checks a role.** The "Sidebar exposes" column shows which roles see the link (`Layout/Layout.tsx:21-86`). The "Reachable by" column is the same for every protected route: **any holder of a token**.

| Route (App.tsx line) | Component | Sidebar exposes to | Main backend endpoints, with backend auth as verified in `backend/src/routes` |
|---|---|---|---|
| `/` (52) | `pages/login/Login` | public | `POST /auth/login` (public) |
| `/onboarding` (62) | `Onboarding` (Step01/Step02) | Reception; Admin/Super-Admin via "Reception" link | `GET /room` **no auth**; `POST /booking` auth, no role |
| `/room-availability` (63) | `RoomAvailability` | Reception | `GET /room` **no auth**; `GET /booking/active-rooms-with-prices/:no` **no auth** |
| `/switch-rooms` (64) | `SwitchRooms` | Reception | `PUT /booking/:id/switch-rooms` **no auth** |
| `/checkouts` (65) | `Checkouts` | Reception | as above |
| `/checkout-details` (66) | `component/checkout/CheckoutDetails` | (via Checkouts footer) | `GET /booking/final-billing/:id/billing-summary`, `POST .../checkout` (auth, no role); `GET /order/:bookingId/pending-orders` (role-checked) |
| `/completed-checkout-details` (67) | `component/checkout/CheckoutCompletedDetails` | (from Bookings) | `GET /booking/completed/:id` **no auth** |
| `/invoice` (68) | `Invoice` | Reception | `/invoice` role-checked (Admin, Reception, Super-Admin) |
| `/room-config` (69) | `RoomConfig` | nobody (commented out, Layout.tsx:49) | `POST /room`, `PUT /room/update/:id`, `POST /room/room-category`: **no auth** |
| `/bookings` (70), `/bookings/:id` (71) | `bookings`, `BookingUpdate` | Reception | `POST /booking/get-all-active-bookings`, `GET /booking/get-booking/:id`: **no auth**; `PUT /booking/:id/update-booking` auth, no role |
| `/reports` (72) | `pages/admin/Reports` | Reception ("Room Reports") | `GET/POST /reports`, `/reports/export`: **no auth** |
| `/restaurant/home` (74-77) | `BeachRestaurantHomePage` | Beach/Pool Staff, Beach/Pool Admin | `POST /order` role-checked |
| `/restaurant/tables/:id` (78-81) | `BeachRestaurantTablesPage` | same | `GET /order/table` role-checked |
| `/restaurant/menu/:id` (82-85) | `BeachRestaurantMenuPage` (id `0` = menu management) | same | `/pbfoodcategories/available` and `/pbfoodnets/available` role-checked (Super-Admin excluded); `PUT/DELETE /pbfoodcategories/:id`, `PATCH/DELETE /pbfoodnets/:id`, all `/extra-beverages` item CRUD, `/beverages/special/details`: **no auth** |
| `/restaurant/hold` (86-89) | `BeachRestaurantHoldPage` | same | `GET /order/hold-orders` role-checked |
| `/restaurant/daily-summary` (90-93) | `BeachRestaurantDailySummaryPage` | same | `GET /order/daily-summary` role-checked (Reception excluded, although the UI treats Reception as "admin") |
| `/restaurant/report` (94-97) | `RestaurantSummaryPage` | Beach/Pool **Admin** | `GET /order/restaurant/summary`, `/excel-report` role-checked (includes **staff** too) |
| `/beverage-inventory/dashboard` (99-102) | `pages/admin/beverage_inventory/Dashboard` | "Beverage-Inventory" key (no such role exists), Admin/Super-Admin via link | `GET /beverages/categories/summary`, `/order/beverage/sold/liquor-summary`: **no auth** |
| `/beverage-inventory/manage-inventory` (103-106) | `ManageInventory` | same | `/beverages` CRUD: **no auth** |
| `/admin/dashboard` (107) | `AdminDashboard` | Admin, Super-Admin | `/hotel-dashboard/*` **no auth**; `/order/order-summary` role-checked; `/order/beverage/sold-summary` **no auth** |
| `/admin/currency-config` (108-111) | `CurrencyConfig` | Admin, Super-Admin | `GET/POST/PUT /currency-values`: **no auth** |
| `/admin/user-config` (112) | `UserConfig` | Admin, Super-Admin | `/admin/*` role-checked |
| `/admin/room-config` (113) | `RoomConfig` (duplicate of `/room-config`) | Admin, Super-Admin | `/room` **no auth** |
| `/admin/reports` (114) | `Reports` (duplicate of `/reports`) | Admin, Super-Admin | `/reports` **no auth** |
| `/admin/restaurant/reports` (115) | `RestaurantSummaryPage` (duplicate) | Admin, Super-Admin | role-checked |
| *(none)* | `pages/admin/PrinterDiagnostics` | not routed (dead) | n/a |
| `*` | (no catch-all route) | n/a | unknown URLs render a blank page |

Lazy loading and code splitting: **none**. All 27 page and component imports in `App.tsx:1-30` are static.

---

## 3. State map

### 3.1 Redux store (`app/store.ts:18-36`). Nothing is persisted.

| Key | Slice file | Holds | Notes |
|---|---|---|---|
| `user` | features/user/userSlice.ts | `role`, `restaurantType` | `restaurantType` is never read; Pool roles map to `Beach` (L36-40); `resetRole` is never dispatched |
| `auth` | features/auth/authSlice.ts | forgot-password modal flag, `resetPassword` thunk | the thunk is **never dispatched** and has the wrong payload contract (FE-30) |
| `onboarding` | features/onboarding/onboardingSlice.ts | step, guest PII (passport, email, WhatsApp) | not cleared on logout |
| `invoice` | features/invoice/invoiceSlice.ts | invoice form data | used as a side channel by `RoomDetails` (`lengthOfStay`) |
| `order` | features/beach-restaurant/orderSlice.ts (560 lines) | server Order entity + UI flags (2 modals) + 9 request-status objects + **derived money totals** | `Object.assign(state, payload)` merges; see FE-11 and FE-19 |
| `food`, `foodCategory`, `beverage`, `beverageCategory` | features/beach-restaurant/*.ts | menu lists + selection + UI-mode flags + statuses | reducer bugs (FE-09, FE-10) |
| `holdOrder`, `dailyOrderSummary`, `restaurantSummary` | features/beach-restaurant/*.ts | query results | `dailySummarySlice.ts:23` is named `holdOrderSlice` |
| `booking` | features/booking/bookingSlice.ts | `roomData` (active booking for a room) | `CheckoutDetails` depends on it (FE-06) |
| `rooms` | features/rooms/selectedRoomsSlice.ts (`name:"selectedRooms"`) | room numbers | key and slice name differ |
| `removedRooms` | features/switch-rooms/removedRooms.ts | `oldRooms[]` | **write-only**: never read, never cleared (`clearOldRooms` unused) |

### 3.2 Browser storage

The only browser storage is `localStorage["authToken"]`. It is written in `pages/login/Login.tsx:64`, read in `api/axios.tsx:18`, `ProtectedRoute.tsx:9`, `Layout.tsx:142`, `Header.tsx:31` and `Sidebar.tsx:59`, and removed in `axios.tsx:40` and `Sidebar.tsx:68`. Nothing else is persisted. A refresh therefore loses all workflow state (orders in progress, onboarding step, the checkout booking id).

### 3.3 React contexts

- `RateContext` (`context/RateContext.tsx`) fetches `/currency-values` once and computes `USD_LKR` and `LKR_USD` from `rateObj.lkr`. That field **does not exist** in the backend model (`backend/src/models/currency-value.js:6-7` has only `usd` and `eur`), so both rates are `NaN` (FE-22).
- `CurrencyContext` (`context/CurrencyContext.tsx`) holds `displayCurrency`. Its only setter is used by `component/currencyDropdown.tsx`, which is commented out in `Header.tsx:5,63`. The display currency is therefore permanently LKR, and all the conversion code is effectively dead.
- Duplication: the same rates are fetched again ad hoc in `component/checkout/BillingTabs.tsx:56-69` and `component/admin/CurrencyConverter.tsx:18-39`. None of this lives in Redux, and the provider `value` objects are rebuilt on every render (`CurrencyContext.tsx:17`, `RateContext.tsx:41`).

---

## 4. API contract matrix (frontend call to backend route)

Backend mount points are in `backend/server.js:66-97`, all under `/api/v1/*`. The axios `baseURL` is chosen from the `VITE_API_URL`, `VITE_API_URL_LOCAL` and `VITE_API_URL_DEV` variables. Status: OK = method and path match; MISMATCH = see the referenced finding.

| Frontend call (file:line) | Backend route | Status |
|---|---|---|
| `POST /auth/login` (Login.tsx:61), `POST /auth/logout` (Sidebar.tsx:64), `POST /auth/forgot-password` (ForgotPasswordModal.tsx:58) | auth-routes.js:10,12,16 | OK |
| `POST /auth/reset-password`, payload `{tempPassword,newPassword,confirmPassword,email}` (ForgotPasswordModal.tsx:84) | auth-routes.js:18, expects `{email,tempPassword,newPassword}` | OK |
| `POST /auth/reset-password`, payload `{token,password}` (authSlice.ts:28) | same | **MISMATCH**; dead thunk (FE-30) |
| `GET /user/user-role`, `/user/details` | user-routes.js | OK |
| `/admin/create-user`, `get-users`, `deactivate-user/:id`, `activate-user/:id` | user-handelling-routes.js | OK |
| `GET/POST/PUT /currency-values[/:id]` | currency-value-routes.js | OK, but PUT edits a historical record (FE-22) |
| `GET/POST /room`, `PUT /room/update/:id`, `GET/POST /room/room-category` | room-routes.js | OK |
| `POST /booking`, `PUT /booking/:id/switch-rooms`, `POST /booking/:id/send-whatsapp`, `/send-email`, `GET /booking/active-rooms-with-prices/:no`, `/details/reserved-all-rooms`, `PATCH /booking/:id/add-order`, `PUT /booking/:id/update-booking`, `POST /booking/get-all-active-bookings`, `GET /booking/get-booking/:id`, `/completed`, `/completed/:id`, `/final-billing/:id/billing-summary`, `POST /final-billing/:id/checkout` | booking-routes.js:26-44 | paths OK; `update-booking` drops `passportId` (FE-43); `completed` `totalPages` ignored (FE-45) |
| `POST/GET /invoice` | invoice-routes.js | paths OK; **response shape MISMATCH** (FE-42) |
| `GET /hotel-dashboard/monthly-summary`, `/monthly-guests` | dashboardRoutes.js | OK |
| `GET /reports/?start&end`, `POST /reports`, `GET /reports/export/` | Excel/room-report.js | OK |
| All `/order/*` calls (POST `/`, PATCH `/:id`, `/:id/token`, `/:id/bill-details`, `/:id/cancel`, GET `/:id`, `/table`, `/hold-orders`, `/daily-summary`, `/restaurant/summary`, `/restaurant/excel-report`, `/order-summary`, `/beverage/sold-summary`, `/beverage/sold/liquor-summary`, `/:bookingId/pending-orders`) | order-routes.js | paths OK; **date format** (FE-44); **restaurantType semantics** (FE-41); dashboard key swap (FE-46) |
| `GET /order/table/:id` (api/order/get-table-api.ts:13) | order-routes.js:75 | OK, but the thunk is never used (dead) |
| `/pbfoodcategories` (GET `/`, `/available`, POST, PUT/DELETE `/:id`) | pbfoodnetCategoryRoutes.js | OK; GET `/` is called by a never-dispatched "beverage categories" thunk (get-beverage-categories-api.ts:13) |
| `/pbfoodnets` (POST, GET `/available`, PATCH/DELETE `/:id`) | pbfoodnetRoutes.js | OK; `/available` returns **404 when empty** (pbfoodnetController.js:239), which the UI treats as an error (FE-10) |
| `/beverages` (POST, GET `/`, `/special/details`, `/categories/summary`, `/:id`, PUT `/price-and-volume/:id`, PUT `/add-beverage-quantity/:id`) | beverageRoutes.js | OK |
| **`PATCH /beverages/reduce-beverage-quantity/:id`** (UpdateBeverageModal.tsx:73) | **`PUT`** only (beverageRoutes.js:44) | **MISMATCH (404)**: FE-40 |
| `/extra-beverages` (POST, GET `/available`, PUT/DELETE `/:id`, POST `/category`, GET `/available/category`, PUT/DELETE `/category/:id`) | extra-beverage-routes.js | paths OK; response keys MISMATCH (FE-45) |

**Backend routes the frontend never calls:** `POST /auth/register` (public), `POST /auth/refresh-token` (see FE-13), `GET /user/`, `GET /admin/get-user/:id`, `GET /booking/details/all-rooms`, `/booking/extended-today`, `/booking/specific/details/:id`, `GET /room/available`, `GET/PUT/DELETE /room/room-category/:id`, `GET /currency-values/latest` (the frontend downloads the full history instead), `GET/DELETE /currency-values/:id`, `POST /invoice/reset-counter`, `GET /invoice/:id`, `POST /order/table`, `PATCH /order/table/:id`, `GET /pbfoodcategories/:id`, `GET /pbfoodnets/`, `/pbfoodnets/:id`, `/pbfoodnets/:id/available`, `GET /extra-beverages/`, `/extra-beverages/category`, `/extra-beverages/:id`, `/extra-beverages/category/:id`, `PATCH .../toggle-visibility` (×2), `DELETE /beverages/:id`.

**Frontend endpoints the backend does not define:** only the `PATCH` reduce-quantity call above. All other paths resolve.

---

## 5. Findings

### A. Architecture & folder structure

**FE-01: Two component trees, models in component folders, inconsistent naming. Medium**
- Files: `component/` (custom) vs `components/ui/` (shadcn alias, `components.json:14-16`); `component/beach-&-pool-restaurant/order-model.ts`, `food-model.ts`, `beverage-model.ts`, `daily-summary-model.ts`, etc.; `component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/BeachResturantDashboard.tsx`; `api/order/add-bevetage-category-api.ts`; `api/order/get-extra-beverge-categories-api.ts`; `api/order/delete-extra-beverage-api.ts:18`
- Evidence:
  ```
  import type { Order } from "@/component/beach-&-pool-restaurant/order-model";   // in api/ and features/
  return response.data.data.beverageIem as ExtraBeverageItem;                     // delete-extra-beverage-api.ts:18
  ```
- Impact: Domain types live inside a UI folder, so `api/` and `features/` import from `component/`, which creates layering inversions and circular-risk imports. `&` in paths is shell- and URL-hostile. The typos ("resturant", "bevetage", "beverge", "Iem", "laundary") are spread across code and API fields. Other inconsistencies: the "beach-restaurant" name covers both restaurants, the folders are `Layout/` vs `lib/` vs `util/`, `pages/.../bookings.tsx` is lowercase, `api/axios.tsx` uses a TSX extension without JSX, and header comments are wrong (`removedRooms.ts:1` says `features/room/roomSlice.ts`; `printCheckout.ts:1` says `src/utils/printReceipt.ts`).
- Recommendation: Adopt a feature-first layout (e.g. `features/restaurant/{api,model,slice,components}`) and keep one `components/ui` for primitives. Move domain types to `types/` or the feature `model/`. Rename the files with typos and `&`. Add a lint rule for file naming.

**FE-02: Four competing data-access patterns and duplicated request logic. Medium**
- Files: thunks in `api/order/*.ts` (restaurant); thunks inside slices (`features/booking/bookingSlice.ts:6-16`, `features/user/userSlice.ts:12-22`, `features/auth/authSlice.ts:20-34`); direct axios in components (`Layout/Header.tsx:37`, `Layout/Sidebar.tsx:64`, `component/onboarding/Step02.tsx:48,164,191`, `component/room/RoomDetails.tsx:188,212`, `component/checkout/CheckoutDetails.tsx:44,54`, `component/checkout/PaymentModal.tsx:95`, `component/invoice/InvoiceForm.tsx:103,122`, both restaurant dashboards, `pages/admin/*`); fetch in context (`context/RateContext.tsx:20`).
- Evidence: `GET /room` is fetched independently in 5 places (`Step02.tsx:48`, `RoomAvailability.tsx:37`, `Checkouts.tsx:22`, `SwitchRooms.tsx:22`, `RoomConfig.tsx:50`). `GET /room/room-category` is fetched in 3 (`AddRoom.tsx:31`, `UpdateRoom.tsx:40`, `InvoiceForm.tsx:122`). `GET /currency-values` is fetched in 3 (`RateContext.tsx:20`, `BillingTabs.tsx:59`, `CurrencyConverter.tsx:21`).
- Impact: There is no single place for caching, cancellation, retries, error normalization or typing. The same data goes stale differently on each screen, and changes have to be made in N places.
- Recommendation: Move server state to RTK Query (already available in `@reduxjs/toolkit`). Define one `createApi` with tagged endpoints (rooms, roomCategories, currency, orders, bookings), which gives dedupe, caching, invalidation and abort for free. Keep Redux slices only for client and UI state.

**FE-03: Duplicate, divergent type definitions. Low**
- Files: `Booking` is defined in `types/booking.ts:30`, `types/bookingUpdate.ts:56`, `types/guestDetails.ts:2` and `pages/admin/Reports.tsx:8`. `CompletedBooking` is defined in `types/checkoutCompleted.ts:31` and `pages/reception/bookings/bookings.tsx:13`. `Table` is in `order-model.ts:35` and `tables/tables.ts:3`. `BeverageItem` is in `types/BeverageItem.ts:2` and `beverage-model.ts:41`. `Room` is in `features/invoice/invoiceSlice.ts:3` and `types/roomTypes.ts:8`. `Step01FormData` is in `types/guestDataTypes.ts:10` and `component/onboarding/Step01.tsx:34`. `OrganizedRoom` is in `types/details.ts:1` and `BillingTabs.tsx:9`. `OldRoom` is in `removedRooms.ts:4` and `SwitchRoomCollection.tsx:8`. `declare global { interface Window { qz: any } }` appears 4 times (`printCheckout.ts:5`, `printInvoice.ts:6`, `printerConfig.ts:4`, `OrderBillDetailsModal.tsx:27`).
- Impact: The same backend entity has incompatible shapes, so components silently disagree. `types/booking.ts` lacks `checkIn` and `checkOut`, although `printCheckout` reads them.
- Recommendation: Keep one canonical type per backend DTO, ideally generated from a backend schema (OpenAPI or zod shared package), with one `global.d.ts`.

### B. Routing & access control

**FE-04: No role-based route guarding; client-side hiding is the only control for many admin features. Critical** (Critical only in combination with the backend gaps SEC-03/SEC-09; on its own the frontend issue would be High)
- Files: `component/ProtectedRoute.tsx:8-18`; `App.tsx:55-116`; `Layout/Sidebar.tsx:38`. Backend cross-ref: `backend/src/routes/currency-value-routes.js:14-25`, `room-routes.js:13-25`, `Excel/room-report.js:13-19`, `Beverage/beverageRoutes.js:22-49`, `Reception/booking-routes.js:27-40` (no `authenticateToken` / `authorizeRoles`).
- Evidence:
  ```
  const token = localStorage.getItem("authToken");
  if (!token) { return <Navigate to="/" replace />; }
  return <>{children}</>;
  ```
- Impact: A Pool-Restaurant-Staff user (or anyone holding any token) can open `/admin/currency-config` and overwrite exchange rates, `/admin/room-config` to change prices and maintenance flags, `/reports` to save room reports, or `/beverage-inventory/manage-inventory` to change stock. The backend accepts these calls because those routes have no auth. The token itself is not validated client-side (an expired token still renders pages).
- Recommendation: Add a `RequireRole roles={[...]}` route wrapper driven by a single route config shared with the sidebar. Wait for `fetchUserRole` before rendering, and redirect to a 403 page. **Treat this as UX only.** The fix of record is server-side `authenticateToken` + `authorizeRoles` on every route; raise this with the backend team.

**FE-05: No 404 route, phantom nav paths, title mismatches, duplicate routes. Medium**
- Files: `App.tsx:51-118` (no `path="*"`); `Layout/Layout.tsx:24-25,34-35` (`/admin/reception` and `/admin/beverage-inventory` are not routes; `Sidebar.tsx:92-109` patches them with `onClick` navigation on an `<a>` without `href`); `Layout.tsx:115` `"/admin/restaurant/report"` vs route `/admin/restaurant/reports` (`App.tsx:115`), so that page has an empty header title; duplicate routes `/room-config` and `/admin/room-config`, `/reports` and `/admin/reports`, `/restaurant/report` and `/admin/restaurant/reports`.
- Impact: Mistyped or stale URLs show a blank shell. The nav is not keyboard-accessible for the patched items. Maintaining parallel route and title tables already shows drift.
- Recommendation: Use one typed route config (path, element, roles, title, nav group) that generates `<Route>`s, the sidebar and the titles. Add a `*` NotFound route and use `<Link>` for all nav items.

**FE-06: Pages depend on non-persisted Redux state or `location.state`, so refresh and deep links break. Medium**
- Files: `component/checkout/CheckoutDetails.tsx:35-45`; `component/checkout/CheckoutCompletedDetails.tsx:20-21,39,50`; `component/onboarding/Step02.tsx:30-31`; `pages/reception/bookings/bookings.tsx:201-206`
- Evidence:
  ```
  const id = useSelector((state: RootState) => state.booking.roomData?.bookingId);
  if (!id) navigate("/checkouts");          // no return
  const res = await api.get(`/booking/final-billing/${id}/billing-summary`);
  ```
- Impact: Refreshing `/checkout-details` fires a request to `/booking/final-billing/undefined/...` and then redirects. Refreshing `/completed-checkout-details` shows the skeleton forever, because no fetch happens when `bookingId` is undefined and there is no error state. The switch-room flow loses `oldRooms` and `daysStayed` on refresh.
- Recommendation: Put identifiers in the URL (`/checkouts/:bookingId`, `/bookings/:id/completed`), fetch by param, and render explicit not-found and error states.

**FE-07: Login and role bootstrap edge cases. Low**
- Files: `pages/login/Login.tsx:66-83,206`; `Layout/Layout.tsx:141-159`; `features/user/userSlice.ts:33-41`
- Evidence: `setTimeout(() => { setIsLoading(false); navigate(redirectPath); ... }, 2000);` and `builder.addCase(fetchUserRole.fulfilled, ...)` (no rejected case).
- Impact: Every login waits an artificial 2 seconds. The submit button is not disabled, so a double submit is possible. `/` does not redirect already-authenticated users. If `/user/user-role` fails with a non-401 error, `Layout` shows `SidebarSkeleton` forever.
- Recommendation: Remove the delay, disable the button while submitting, and redirect from `/` when a valid session exists. Handle `fetchUserRole.rejected` with an error or logout state, and derive the redirect from the role returned by the server (the login response includes `userRole`).

### C. State management

**FE-08: Logout does not clear client state (shared reception and POS terminals). High**
- Files: `Layout/Sidebar.tsx:56-78`; `features/user/userSlice.ts:31` (`resetRole` unused); `features/onboarding/onboardingSlice.ts` (guest PII); `app/store.ts`
- Evidence:
  ```
  localStorage.removeItem("authToken");
  toast.success("Logout successful");
  navigate('/');
  ```
- Impact: The in-memory Redux store keeps the previous user's role, guest PII (passport ID, email, WhatsApp in `onboarding.step01Data`), the restaurant cart and the booking data. The next user on the same tab briefly sees the previous role's sidebar and can see leftover form data. If logout fails, the token is kept.
- Recommendation: Add a root reducer that resets on a `auth/logout` action (always dispatched, whether or not the API call succeeds), clear the token in `finally`, and call `queryClient`/RTKQ `resetApiState`.

**FE-09: Wrong request-status bookkeeping in reducers (stuck spinners, wrong flags). Medium**
- Files: `features/beach-restaurant/orderSlice.ts:462-479` (`addNewOrderTokenToOrder.fulfilled` never sets `addNewOrderTokenStatus.loading=false`); `features/beach-restaurant/beverageSlice.ts:154-156` (fulfilled leaves loading true), `:159`, `:177`, `:195` (rejected **sets `loading = true`**), `:237` (pending clears the wrong status object); `features/beach-restaurant/foodSlice.ts:109-127` (`updateFoodItem` writes `addFoodItemStatus`, and `updateFoodItemStatus` is never used)
- Evidence:
  ```
  .addCase(addNewBeverage.rejected, (state, action) => {
    state.addBeverageItemStatus.loading = true;
  ```
- Impact: Spinners and disabled states never clear after an error. Status flags are not reliable for UI decisions, and the code is copy-paste-prone (9 hand-rolled status objects in `order` alone).
- Recommendation: Replace hand-rolled status objects with RTK Query hooks (`isLoading`, `isError`), or one generic `requestStatus` helper built with `isPending`/`isFulfilled`/`isRejected` matchers. Add reducer unit tests.

**FE-10: Reducer crash or permanent loading on empty lists; backend 404 on empty. Medium**
- Files: `features/beach-restaurant/foodCategorySlice.ts:76-80`; `backend/src/controllers/PoolAndBeachResturant/pbfoodnetController.js:239`; `features/beach-restaurant/foodSlice.ts:83-86`
- Evidence:
  ```
  state.categories = [...state.categories, ...action.payload];
  state.selectedCategoryId = state.categories[0]._id;   // TypeError when []
  ```
- Impact: With zero visible food categories, the fulfilled reducer throws. The state is never committed, `fetchAllFoodCategoriesStatus.loading` stays `true`, and the menu page shows skeletons forever. `/pbfoodnets/available` returns 404 when nothing is available, so the UI shows "Failed to load food items" and keeps the **previous** list, because `rejected` does not clear `foodItems`.
- Recommendation: Guard with `state.categories[0]?._id ?? null`. Have the backend return `200 []` for empty lists, and clear lists on rejection.

**FE-11: `order` slice mixes the server entity, UI flags and statuses, merges via `Object.assign`, and contains dead or wrong logic. Medium**
- Files: `features/beach-restaurant/orderSlice.ts:18-95,424,452,489,500,511,434-440`; `features/user/userSlice.ts:36-40`; `features/beach-restaurant/beverageCategorySlice.ts:87-92`; `api/order/get-beverage-categories-api.ts:13` (thunk never dispatched); `features/switch-rooms/removedRooms.ts` (never read); `api/order/add-bevetage-category-api.ts:22-23`
- Evidence:
  ```
  Object.assign(state, action.payload);                          // orderSlice.ts:424
  }else if (action.payload === "Pool-Restaurant-Staff"){ state.restaurantType = RestaurantTypes.BEACH.value;
  state.extraCategories = [...state.categories, ...action.payload];   // beverageCategorySlice.ts:92
  ```
- Impact: Fields that the server omits keep values from the **previous** order, which risks cross-order leakage when switching between hold or summary orders. The Pool-to-Beach mapping is wrong (latent, since the field is unused). `extraCategories` would show food or beverage categories as "extra beverage" categories once `categories` is populated. Adding an extra-beverage category also refetches *food* categories. The `removedRooms` slice is write-only dead state.
- Recommendation: Normalize: server entities in RTK Query or entity adapters, a separate `orderUi` slice for modal flags, and replace the state rather than merging it. Delete the dead thunks and slices.

**FE-12: Context/Redux duplication; currency context is dead; unmemoized provider values. Low**
- Files: `context/CurrencyContext.tsx:13-21`; `context/RateContext.tsx:13-45`; `Layout/Header.tsx:5,63`
- Impact: All of `convertAndFormatPrice` is pinned to LKR because the switcher is commented out. Rates are fetched in three different ways, and each provider render re-renders every consumer.
- Recommendation: Either delete multi-currency display entirely, or move rates into the server cache (`/currency-values/latest`) and memoize the provider values.

### D. API layer

**FE-13: 401 handling is a hard reload with no refresh flow, so work in progress is lost. High**
- Files: `api/axios.tsx:30-46`; backend `backend/src/utils/token-util.js:12` (`expiresIn:"3h"`), `backend/src/routes/auth-routes.js:14` (`/refresh-token` exists), `backend/src/controllers/auth-controller.js:105-109` (refresh cookie `SameSite=Strict`)
- Evidence:
  ```
  if (error.response.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  ```
- Impact: After 3 hours, any request (a token print, a checkout) bounces the user to login with a full page reload. The Redux cart, the onboarding step and the checkout form are all lost, mid-service. Concurrent 401s trigger multiple redirects. The refresh endpoint is unused. Because the cookie is `SameSite=Strict` and the API is on a different domain from the Vercel app, refresh would also need cookie and domain changes. Marked **Needs confirmation** of the deployed domains.
- Recommendation: Implement single-flight refresh (queue requests during the refresh, then retry the original request), or at minimum warn before expiry. Use router navigation instead of `window.location`, and handle 403 distinctly.

**FE-14: Inconsistent error handling: silent toasts, stale messages, false success. Medium**
- Files: rejecting with whole response objects: `api/order/get-tables-api.ts:16`, `get-order-data-api.ts:16`, `add-table-to-order-api.ts:20`, `get-daily-order-summary.ts:30`, `get-restaurant-summary-api.ts:31`, consumed as strings in `TableSelectionSection.tsx:22-26`, `TableDetails.tsx:50-54`, `DailyOrderSummaryFilterAndCount.tsx:157-161`, `RestaurantSummaryFilter.tsx:63-65`. Backend uses `{error}` vs `{message}`: `booking-controller.js:147`, extra-beverage controller. `add-food-item-api.ts:24` reads `.error`. Stale closure messages: `AddFoodItemSection.tsx:143-147`, `AddCategorySection.tsx:43-52`, `UpdateFoodCategorySection.tsx:72-77`, `GetStartedButton.tsx:50`. Dispatch without `unwrap()`, so failures show success: `OrderPaymentDetails.tsx:84-85`, `UpdateFoodItemSection.tsx:91,109,112,121,125,128`, `UpdateFoodCategorySection.tsx:84-85,88-93`.
- Evidence:
  ```
  await dispatch(cancelOrder({ orderId: order._id }));   // no unwrap
  toast.success("Order canceled successfully");
  ```
- Impact: `toast.error(object)` is **silently dropped**. I verified that react-toastify 11 renders only strings, numbers, elements or functions (the guard `z=t=>isValidElement||string||fn||number`). Users get no feedback on table, order or summary failures. Item and category deletes, updates and order cancel report success even when the API fails. Error messages shown are frequently those from the previous render, or the generic fallback, because the backend uses `error` rather than `message`.
- Recommendation: Add one `normalizeApiError(e): {status, message}` used by all thunks and queries. Always `unwrap()` before showing success. Agree a single error envelope with the backend. Add a top-level React `ErrorBoundary`; none exists (verified by grep).

**FE-15: Race conditions and no request cancellation. Medium**
- Files: `component/beach-&-pool-restaurant/daily-summary/DailyOrderDetailSection.tsx:21-24`; `hold/HoldOrderDetailSection.tsx:22-25`; `pages/beach-restaurant/BeachRestaurantMenuPage.tsx:31-34` plus `OrderTokenModal.tsx:203` (double fetch); `component/invoice/InvoiceList.tsx:16,46-61`; `pages/reception/bookings/bookings.tsx:84-100`. There is no `AbortController` or `signal` anywhere (verified by grep).
- Evidence:
  ```
  useEffect(() => { if (!id) return; dispatch(fetchOrderById(id)); }, [id, date]);
  ```
- Impact: Clicking quickly through orders can show order A's tokens and totals while order B is selected, because the last response wins and is merged by `Object.assign`. That risks taking payment against the wrong displayed order. The invoice search debounce keeps its timer handle in state (an extra render, and the date effect and the search effect both fire). Toggling Active/Completed bookings can interleave results.
- Recommendation: Use RTK Query (automatic last-arg wins and abort), or `const p = dispatch(thunk); return () => p.abort()` in effects, and keep timers in `useRef`.

**FE-16: Base URL selection, manual query strings, header duplication. Medium**
- Files: `api/axios.tsx:4-12`; manual query strings without encoding: `bookings.tsx:70`, `InvoiceList.tsx:35`, `get-daily-order-summary.ts:25`, `get-restaurant-summary-api.ts:26`, `DownloadButton.tsx:15`, `pages/admin/beverage_inventory/Dashboard.tsx:25`, `MonthlyBeverageSales.tsx:41`, `BeachResturantDashboard.tsx:31`; duplicate auth header: `Header.tsx:37-40`, `Sidebar.tsx:64-66`; inconsistent relative paths: `AddRoom.tsx:31` (`"room/room-category"` with a "CHANGE IF YOUR ENDPOINT DIFFERS" comment), `InvoiceForm.tsx:122`, `PaymentModal.tsx:95`
- Evidence:
  ```
  baseURL: import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? LOCAL_API_URL : DEV_API_URL),
  `/booking/completed?searchTerm=${term}&page=${pageNumber}&limit=${pageSize}`
  ```
- Impact: `VITE_API_URL` is not defined in `.env`, so production resolves to the variable named "DEV". Any non-`localhost` access (a LAN IP, `127.0.0.1`, a preview URL) silently targets that API. The local API URL is **inlined into the production bundle** (verified in `dist`). Search text containing `&`, `#` or `+` corrupts the query, and the backend feeds it to `new RegExp(searchText)` (`invoice-controller.js:131`, `booking-controller.js:1884`), so regex metacharacters cause 500s.
- Recommendation: Use a single `VITE_API_BASE_URL` per environment, chosen at build time. Pass query parameters through axios `params` (auto-encoded). Remove the manual headers, since the interceptor already sets them. Centralize endpoints in one module.

**FE-17: Non-atomic multi-request workflows and misleading outcomes. Medium**
- Files: `component/beach-&-pool-restaurant/order-details/OrderBillDetailsModal.tsx:217-257`; `component/checkout/PaymentModal.tsx:92-130`; `component/beverage-inventory/manage-inventory/UpdateBeverageModal.tsx:59-74`; `AddBeverageModal.tsx:52-74`
- Evidence:
  ```
  if (response.status === 200) { toast.success("Payment processed successfully!"); await printFinalBill({...}) ... }
  } catch (error: any) { toast.error(error.response?.data?.message || "Payment failed. Try again.");
  } finally { setLoading(false); navigate("/checkouts"); }
  ```
- Impact: At checkout, if QZ Tray fails to connect, `printFinalBill` throws inside the same `try`. The user is then told "Payment failed" **after** the checkout succeeded, which invites a second checkout attempt (the backend returns 409 "already checked out"). The `finally` block navigates away even on real failures, so the form is lost. For restaurant bills, the order is marked COMPLETED with payment method "Room" and *then* the booking link is attempted; if the second call fails, the order is paid but not on the room bill. Restock sends 2 separate PUTs, so partial updates are possible. `AddBeverageModal` closes and resets the form even on error.
- Recommendation: Separate post-commit side effects (printing) from the transaction, with their own error UI ("Saved, but printing failed: Retry print"). Make server endpoints atomic (one call for "settle to room"). Only navigate on success.

### E. Type safety

**FE-18: `strict` is on, but `any` and unchecked casts defeat it; types diverge from backend responses. Medium**
- Files: `tsconfig.app.json:19` (`strict: true`); ESLint reports 107 `no-explicit-any` errors; `util/printCheckout.ts:26` (`}: any)`); `component/room/RoomDetails.tsx:74` (`useDispatch<any>()`); `FoodCategorySelector.tsx:44` (`as any`); `UpdateRoom.tsx:30`; `component/room/room_details/SelectedRoomsList.tsx:43` (`null as unknown as SupportedCurrency`); `component/beach-&-pool-restaurant/order-model.ts:6,16` (`Boolean` wrapper type); response casts with wrong keys: `api/order/add-beverage-api.ts:22`, `add-extra-beverage-api.ts:21`, `update-extra-beverage-item-api.ts:25` (`.data.order`, while the backend returns `.data`), `delete-extra-beverage-api.ts:18` (`beverageIem`); `types/invoice.ts:2,10-12` (`_id`, `subTotal`, `tax`, `discount` are not returned; FE-42); `package.json:51` (`@types/react-redux@7` alongside react-redux 9, which ships its own types)
- Evidence:
  ```
  return response.data.data.order as BeverageItem;      // backend: { success, message, data: savedBeverage }
  ```
- Impact: TypeScript passes, but runtime shapes are unknown. Contract drift (FE-40 to FE-45) is not caught at compile time, and `catch (error: any)` hides error typing.
- Recommendation: Enable `@typescript-eslint/recommendedTypeChecked` and `no-unsafe-*`. Validate responses with zod at the API boundary, or generate types from an OpenAPI spec. Remove `@types/react-redux`. Type thunks with `rejectValue: ApiError`.

### F. Money and currency on the client

**FE-19: Restaurant totals derived in effects and stored in Redux (sign bug, stale reads, float equality with the server). High**
- Files: `component/beach-&-pool-restaurant/order-details/OrderPaymentDetails.tsx:96-139`; `OrderBillDetailsModal.tsx:44-48,201-209`; `api/order/add-new-order-token-to-order-api.ts:19-40`; backend `backend/src/controllers/order-controller.js:563-663` (`toFixed(2)` comparisons), `:1050-1061` (strict `backendTotal !== totalBill`)
- Evidence:
  ```
  const tokenTotalBill = tokenSubTotal + newOrderToken.tokenTax + newOrderToken.tokenServiceCharge - newOrderToken.tokenDiscount; // stale tokenServiceCharge
  const totalBill = order.subTotal + order.tax + order.discount + order.serviceCharge;                                           // + discount
  ```
- Impact: Totals converge only after several effect and dispatch cycles, each reading the previous render's values. Clicking "Token" quickly can send inconsistent numbers, which the backend rejects with "mismatch" 400s. The discount is **added**; this is latent because it is 0 during token creation. Floating-point money (`subTotal * 0.1`, sums of unrounded floats) compared with strict equality on the server is fragile at `x.xx5` boundaries (**Needs confirmation** with real data). The 10% service charge is hard-coded on the client in several places (and on the backend).
- Recommendation: Do not store derived totals in Redux. Compute them with a pure memoized selector (`createSelector`) from line items, and preferably let the server be the sole calculator: send line items and the discount percent, and receive totals back. Use integer minor units (cents) or a decimal library on both sides. Put the service-charge rate in configuration served by the API.

**FE-20: Invoice total computed only on a button click and persisted as-is. High**
- Files: `component/invoice/InvoiceForm.tsx:84-115` (payload `total: data.total`), `:459-479` ("Confirm Rooms" computes the total), `:426-446` (count and price inputs, strings), `:372` (`"EURO"`), `:484` (submit not disabled while loading); backend `backend/src/controllers/Reception/invoice-controller.js` stores `total` from `req.body` (no recompute; Decimal128 field `models/Reception/invoice.js:39`)
- Evidence:
  ```
  total: data.total,                       // 0 unless "Confirm Rooms" was clicked after the last edit
  <option value="EURO">EURO</option>       // rest of app & backend enum use "EUR"
  ```
- Impact: Invoices can be generated with `total = 0`, or a stale total if rooms, dates or prices change after "Confirm Rooms". `count` and `perDayPrice` are sent as strings. Currency "EURO" is not handled by `getCurrencySymbol` or the backend enum (the backend schema uses the misspelled `enums:` key, so it does not validate). Double submits are possible.
- Recommendation: Compute the total reactively (`useWatch` or a derived value) and show it read-only, and have the backend recompute and validate it. Use `valueAsNumber` for numeric inputs, a shared currency enum, and disable submit while pending.

**FE-21: Discount semantics are inconsistent (percent vs amount) and mislabelled. Medium**
- Files: `OrderBillDetailsModal.tsx:36,205` (sends `discount` as a **percent**); backend `order-controller.js:1050,1072` (stores it in `order.discount`); `OrderPaymentDetails.tsx:193-198` (displays `LKR {order.discount}`); `component/checkout/BookingInfo.tsx:60-73` (an absolute amount, but `max={100}` with validation against `subtotal`); `component/footer/InvoiceFooter.tsx:127-136` (percent)
- Evidence:
  ```
  <p>LKR {order.discount.toFixed(2)}</p>     // shows "LKR 10.00" for a 10% discount
  ```
- Impact: Completed orders in Daily Summary show the discount percentage as a rupee amount. Reports that aggregate `discount` across orders (percent) and bookings (amount) are incomparable.
- Recommendation: Use explicit field names (`discountPercent`, `discountAmount`) end to end, rendered with a typed money formatter.

**FE-22: Currency conversion is broken or dead; formatting and mixing are inconsistent. Medium**
- Files: `context/RateContext.tsx:22-27`; `util/priceConverter.ts:15-19`; `component/admin/CurrencyConverter.tsx:12-13,65-67` (PUT edits the latest historical record); backend `currency-value-controller.js:15-31` (POST is an upsert for *today*); `component/checkout/AdditionalCharges.tsx:42-55` vs `:80-123`; `component/room/room_details/SwitchRoomCollection.tsx:145-150`; `component/footer/InvoiceFooter.tsx:101-111,191-199`; `component/room/room_details/SelectedRoomsList.tsx:79-82`; `component/invoice/InvoiceList.tsx:128`; `lib/order-util.ts:50-54`
- Evidence:
  ```
  'USD_LKR': rateObj.lkr / rateObj.usd,   // rateObj.lkr is undefined -> NaN
  rate = rates[rateKey] || 1;             // NaN/missing -> silently 1
  ```
- Impact: If USD or EUR display is re-enabled, LKR amounts would be shown with "$" or "€" signs unconverted. EUR never has a rate. Custom additional charges are "converted" while spa, laundry and minibar are not, so mixed units are summed. The room booking UI forces one currency for all rooms, but totals are shown as `LKR ${grandTotal + totalOldRoomsPrice}`, mixing currencies. Invoice totals are printed as raw `$numberDecimal` strings. Number formatting differs across screens (Intl currency, `"LKR " + n`, `toLocaleString`, space-grouped `formatNumber`). Saving rates via PUT overwrites yesterday's record instead of creating today's, which rewrites rate history.
- Recommendation: Define a single `Money {amountMinor, currency}` type and one formatter, and use server-side conversion with explicit rate snapshots per booking. Use `POST /currency-values` (upsert today) and `GET /currency-values/latest`. Remove the NaN fallback and fail loudly when a rate is missing.

**FE-23: Night and length-of-stay calculations duplicated with divergent formulas; UTC and local dates mixed. Medium**
- Files: `component/room/room_details/GuestDetailsCard.tsx:31-39`; `SwitchRoomCollection.tsx:32-41,58`; `component/onboarding/Step01.tsx:72-96,116`; `component/invoice/InvoiceForm.tsx:70-78`; `pages/reception/bookings/BookingUpdate.tsx:41` (no `lengthOfStay` recompute when `checkOut` changes)
- Evidence:
  ```
  Math.ceil((today - checkIn)/864e5) - 1 || 1               // GuestDetailsCard
  const todayDate = new Date().toISOString().split("T")[0];  // UTC date (Sri Lanka is UTC+5:30)
  ```
- Impact: Different screens show different night counts for the same booking. Between 00:00 and 05:30 local time, "today" validation uses yesterday's date. `BookingUpdate` keeps a stale `lengthOfStay`.
- Recommendation: Have the server return nights, and use one `date-fns` helper with an explicit `Asia/Colombo` time zone everywhere.

### G. Printing

How printing works: all physical printing goes through **QZ Tray** (`window.qz`), a local desktop agent reached over WebSocket. **Thermal receipts and kitchen tokens** are built as raw ESC/POS strings (`type:"raw"`) inline in `OrderBillDetailsModal.tsx:95-197` and `OrderTokenModal.tsx:84-190`. **A4 checkout bills and invoices** are built as HTML strings (`type:"html"`) in `util/printCheckout.ts` and `util/printInvoice.ts`. The printer is auto-selected by name regex with a 5-minute cache (`util/printerConfig.ts`). `window.print` and `react-to-print` are not used; they are leftovers (`index.css:118-157`, `package.json:40`).

**FE-24: Unescaped interpolation into A4 HTML print templates (document forgery). High**
- Files: `util/printCheckout.ts:86-104,111-120,158-163,223,231-239,273`; `util/printInvoice.ts:127,136-147,172-174`
- Evidence:
  ```
  <tr class="row-line"><td>Customer</td><td class="right">${booking?.guestName}</td></tr>
  <td>${item.name}</td>     // additional-charge name typed at checkout (AdditionalCharges.tsx:128-136)
  ```
- Impact: Guest names (entered at onboarding or update), custom charge names (typed by the cashier), room types, `hotelType` and `travelAgentName` are injected as raw HTML. A value such as `</td></tr><style>.total-row{display:none}</style>` can hide or forge lines on an **official bill or invoice**. External `<img>` or `<link>` URLs would be fetched from the reception PC when printing. Whether QZ's HTML renderer executes `<script>` is **Needs confirmation**. The unquoted `src=${logoBase64}` attribute (`printCheckout.ts:222`, `printInvoice.ts:126`) is also fragile.
- Recommendation: Escape every interpolated value (one `escapeHtml` helper), or better, build print documents from a typed template component rendered to a string with React (`renderToStaticMarkup`), which escapes by default. Whitelist numeric fields with formatters. Apply the same treatment to ESC/POS by stripping control characters from item titles (FE-27).

**FE-25: Print-path maintainability and reliability. Medium**
- Files: `formatItemLine` duplicated in `OrderBillDetailsModal.tsx:62-90` and `OrderTokenModal.tsx:52-81`; header, address and phone numbers hard-coded in `OrderBillDetailsModal.tsx:132-144`, `OrderTokenModal.tsx:147-159`, `printCheckout.ts:224-225`, `printInvoice.ts:128-129`; every job printed twice in `OrderBillDetailsModal.tsx:190-191`, `OrderTokenModal.tsx:183-184` and `printCheckout.ts:289-290`; the ~30 KB base64 logo is duplicated in `printCheckout.ts:73` and `printInvoice.ts:71` (both end up in the bundle); errors are swallowed and followed by success toasts in `printInvoice.ts:221-224` + `InvoiceList.tsx:139-140`, `OrderBillDetailsModal.tsx:193-196` + `:241-251`, and `OrderTokenModal.tsx:186-189` + `:201-207`; `printInvoice.ts:29-32` `connect().catch(()=>{...; return;})` does not stop execution; `alert()` is used in `printCheckout.ts:29`, `OrderTokenModal.tsx:86,188`, `SamplePrint.tsx:17,89` and `PrinterDiagnostics.tsx:61`
- Evidence:
  ```
  await qz.print(config, [{ type: "raw", format: "plain", data: receiptData }]);
  await qz.print(config, [{ type: "raw", format: "plain", data: receiptData }]);
  ```
- Impact: The double print (customer and merchant copy?) is undocumented and wastes paper on every token. A print failure is reported as success ("Order payment processed & printed!", "Printed successfully"), so staff believe a kitchen ticket printed when it did not. Branding or contact changes require code edits in 4 places.
- Recommendation: Create one `printing/` module exposing `printReceipt(model)`, `printToken(model)` and `printA4(model)` that return results or throw. Move the copy count, hotel profile and phone numbers into configuration. Load the logo as a static asset URL or a QZ image resource. Replace `alert` with toasts.

**FE-26: QZ Tray bootstrap. Medium** (security aspect in FE-28)
- Files: `OrderBillDetailsModal.tsx:51-56`, `OrderTokenModal.tsx:40-46`, `CheckoutCompletedDetails.tsx:42-48`, `PaymentModal.tsx:58-64`, `InvoiceList.tsx:22-27`, `PrinterDiagnostics.tsx:64-73`, `SamplePrint.tsx:7-13`; there is no `qz.security.setCertificatePromise` / `setSignaturePromise` anywhere (verified by grep)
- Evidence:
  ```
  script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
  document.body.appendChild(script);
  ```
- Impact: A new `<script>` tag is appended on **every mount** of these components (never removed or deduped). The version floats to whatever "latest" is on npm. Without certificate signing, QZ Tray shows "untrusted website" prompts or blocks, depending on its configuration (**Needs confirmation** on the target PCs). There is a race: printing before the script has loaded fails with "QZ Tray not loaded yet". `PrinterDiagnostics` is not routed, and `SamplePrint` prints hard-coded fake items; both are dead.
- Recommendation: Install `qz-tray` as a pinned npm dependency, import it once in a `printing/qz.ts` singleton with `connect()` memoized, configure signing with a server-side signing endpoint, and route the diagnostics page for admins.

**FE-27: Minor printing defects. Low**
- Files: ESC/POS injection of raw item titles in `OrderBillDetailsModal.tsx:163-168` and `OrderTokenModal.tsx:126-130` (control characters such as `\x1D V` in an admin-entered name would cut paper); `util/printerConfig.ts:183-216` (one shared timestamp for both cache entries); `printCheckout.ts:241,244` (`booking?.checkIn.split` crashes when `checkIn` is null)
- Recommendation: Sanitize to printable ASCII (or the printer codepage), keep per-type cache timestamps, and use null-safe date formatting.

### H. Client-side security

**FE-28: Token in `localStorage` + runtime third-party script + no CSP. High**
- Files: `pages/login/Login.tsx:64`; `api/axios.tsx:18-21`; the QZ injection sites listed in FE-26; `vercel.json:1-8` (rewrites only, no `headers`); `index.html` (no CSP meta). `dangerouslySetInnerHTML` is not used anywhere (verified by grep), which is good.
- Evidence:
  ```
  localStorage.setItem("authToken", response.data.data.accessToken);
  script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";   // unpinned, no integrity attr
  ```
- Impact: Any script running in the origin, including a compromised or typosquatted CDN package, can read the bearer token (valid 3h) and call every API. Many of those APIs have no server-side role checks (FE-04).
- Recommendation: Keep the access token in memory only and rely on the httpOnly refresh cookie (FE-13). Bundle QZ from npm, or at minimum pin the exact version and add `integrity` + `crossorigin`. Add a CSP (`script-src 'self'`, `connect-src` API and QZ websocket hosts), `X-Frame-Options`/`frame-ancestors` and `Referrer-Policy` via `vercel.json` headers.

**FE-29: Sensitive data written to the console (including in production). High**
- Files: `component/authentication/ForgotPasswordModal.tsx:78` (**temp, new and confirm passwords**); `util/printCheckout.ts:286` and `util/printInvoice.ts:216` (full HTML bills with guest name and booking ID); `component/checkout/CheckoutCompletedDetails.tsx:127` (entire booking: passport ID, email, WhatsApp); `PaymentModal.tsx:94,97`; `component/onboarding/Step02.tsx:225` (every render); `api/order/get-available-rooms-with-guest-details-api.ts:14` (guest list); `api/order/update-booking-details-with-order-id-api.ts:18`; `get-restaurant-summary-api.ts:28`; `bookings.tsx:73`; `InvoiceList.tsx:38`; `OrderBillDetailsModal.tsx:188`; `OrderTokenModal.tsx:182`
- Evidence:
  ```
  console.log("data", data);   // { tempPassword, newPassword, confirmPassword }
  ```
- Impact: Credentials and PII are exposed to anyone with DevTools on shared front-desk PCs, and to any browser extension or logging tool. There are 43 active `console.log` calls in source (plus 2 commented out), and 37 of them survive in the production bundle (counted in a scratch `vite build`).
- Recommendation: Remove them, add the ESLint `no-console` rule (error), and set `esbuild.drop: ['console','debugger']` for production in `vite.config.ts`.

**FE-30: Password-reset flow weaknesses and dead code. Medium**
- Files: `ForgotPasswordModal.tsx:94-97` (the modal closes after 1s even when `status !== "success"`), `:168-176` (temp password field `type="text"`), `:38-39` (`error`/`success` state never set); `features/auth/authSlice.ts:20-34` (unused thunk posting `{token,password}`, contradicting the backend's `{email,tempPassword,newPassword}` at `auth-controller.js:252`); `pages/login/Login.tsx:86` displays backend messages verbatim (the backend returns 404 "User not found" vs 400 "Invalid username or password", `auth-controller.js:84-93`, which enables user enumeration; this is a backend issue the UI surfaces)
- Recommendation: Use one reset implementation with a masked temp-password input, close only on success, show a generic login error, and delete the dead thunk.

**FE-31: Minor hardening. Low**
- Files: `window.open(link, "_blank")` without `noopener` in `component/room/RoomDetails.tsx:194` and `pages/reception/bookings/BookingUpdate.tsx:155`; `index.html:5` declares the favicon as `image/svg+xml` for a `.png`; the login screen lists every role name (`Login.tsx:141-157`).
- Recommendation: Use `window.open(url, "_blank", "noopener,noreferrer")`; minor cleanups.

### I. Performance

**FE-32: Single 1.2 MB bundle; no code splitting; unused and odd dependencies. Medium**
- Files: `App.tsx:1-30` (no `React.lazy`/`Suspense`); `package.json:31` (`"dialog": "^0.3.1"`, an unrelated npm package that is never imported), `:23` (`@shadcn/ui` CLI package, never imported), `:40` (`react-to-print`, unused), `:51` (`@types/react-redux` v7), `:55,60` (`autoprefixer`/`postcss`, unneeded with `@tailwindcss/vite`); chart.js used by a single admin widget (`component/reception/MonthlyGuestRegistration.tsx`); two ~30 KB base64 logos in JS (`printCheckout.ts:73`, `printInvoice.ts:71`)
- Evidence: `dist/assets/index-*.js 1,212.94 kB │ gzip: 368.95 kB` and "Some chunks are larger than 500 kB".
- Impact: Slow first load on POS tablets and front-desk PCs, and every role downloads every module (admin charts, printing, onboarding). Unused packages enlarge the supply-chain surface.
- Recommendation: Lazy-load route groups (reception, restaurant, admin, inventory) with `React.lazy`, and split `chart.js` and the print code. Remove unused dependencies. Move the logos to `/public` assets.

**FE-33: Excessive re-renders and refetch storms. Medium**
- Files: whole-slice selectors `useSelector(s => s.order)` in `FoodItemSelector.tsx:23`, `BeverageItemSelector.tsx:24`, `ServiceType.tsx:34`, `GetStartedButton.tsx:14`, `TableDetails.tsx:17`, `OrderDetailsSection.tsx:15`, `OrderBillDetailsModal.tsx:35`, `OrderTokenModal.tsx:36`; effect cascade in `OrderPaymentDetails.tsx:96-139` (6 dispatches per run, with deps on the values it dispatches); `pages/admin/beverage_inventory/ManageInventory.tsx:18-31` (refetches all beverages on every tab switch, item click and modal toggle); `AddItem.tsx:43-57`; every add, update or delete thunk refetches entire lists (`api/order/*`); `/currency-values` downloads the full history 3 times; only 2 `useMemo`/`memo` uses in the whole app
- Evidence:
  ```
  }, [active, isModalOpen, selectedBeverage, isModal]);   // ManageInventory.tsx:31
  ```
- Impact: Each `+`/`-` quantity click re-renders every menu card (each subscribes to the whole `order` slice) and then triggers 2 or 3 more passes from the totals effect, which is noticeable on low-end POS tablets. There is unnecessary network load.
- Recommendation: Use narrow selectors (`s => s.order.newOrderToken.foodOrders.some(...)`), `createSelector`, `React.memo` on list items, RTK Query cache and tag invalidation instead of refetch-all, and `/currency-values/latest`.

**FE-34: Real-time room locking is non-functional; no polling elsewhere. Medium**
- Files: `component/onboarding/Step02.tsx:17,59,113-118,140-142,200`; `component/room/RoomDetails.tsx:176-181`; backend `backend/src/utils/realtime/room-socket.js:10-27` (unauthenticated, in-memory, keyed by whatever the client sends); `.env` defines only `VITE_API_URL_LOCAL` and `VITE_API_URL_DEV`
- Evidence:
  ```
  const SOCKET_URL = import.meta.env.SOCKET_URL;           // not VITE_-prefixed -> undefined
  socketRef.current?.emit("lockRoom", room.no);            // lock by room number
  roomIds.forEach((id) => socketRef.current?.emit("unlockRoom", id));   // unlock by _id (never matches)
  ```
- Impact: `io(undefined)` connects to the page origin (Vercel or the Vite dev server), not the API, so room locks are never shared. If the socket is fixed, unlocks after booking will not match, and the server's disconnect handler will later broadcast `roomUnlocked` for rooms that are actually booked, so other terminals show them as free. Room IDs and room numbers are also confused in `selectedRoomsData` (always empty, so `addRoom` is never dispatched). Server-side, `createBooking` rejects already-booked rooms (`booking-controller.js:139-147`), so actual double booking is prevented and the impact is conflicts and UX. Tables, hold orders and room grids have no polling or socket updates, so multi-terminal data is stale until a manual refresh.
- Recommendation: Use `VITE_SOCKET_URL` and authenticate the socket with the token. Use one key (room `_id`) for lock and unlock, release locks on unmount and after booking, and add socket events, or RTK Query `pollingInterval`, for tables, hold orders and rooms.

### J. Code quality & tooling

**FE-35: Rules-of-Hooks violations (latent crash). Medium**
- Files: `component/room/room_details/RoomDetailsPanel.tsx:29-36`; `component/room/room_details/GuestDetailsCard.tsx:15,42` (flagged by ESLint `react-hooks/rules-of-hooks`)
- Evidence:
  ```
  if (!viewedRoom || !readOnly) { return ... }
  const { rates } = useRates();          // hook after conditional return
  ```
- Impact: If an instance ever re-renders from "has room" to "no room" (for example, a future "close details" button), React throws "Rendered fewer hooks than expected" and, with no error boundary, unmounts the app. The current parents happen to avoid that transition, which makes this fragile.
- Recommendation: Move hooks above early returns, make `rules-of-hooks` a blocking CI check, and add an error boundary.

**FE-36: Giant components and copy-paste duplication. Medium**
- Files and sizes: `pages/reception/bookings/BookingUpdate.tsx` (566), `component/invoice/InvoiceForm.tsx` (498), `component/onboarding/Step01.tsx` (497), `pages/login/Login.tsx` (442, of which lines 233-442 are commented-out code with **merge-conflict markers** at 285 and 316), `OrderBillDetailsModal.tsx` (424), `UpdateFoodItemSection.tsx` (423, with imports at the *bottom*, :352-356), `AddFoodItemSection.tsx` (391). Duplicates: `BeachResturantDashboard.tsx` vs `PoolResturantDashboard.tsx` (identical apart from keys; see FE-46); `formatDate` ×3 (`TotalOrders.tsx:28`, `TotalCustomers.tsx:23`, `SoldLiqueurAmount.tsx:18`); `Legend` ×5; `FormRow` ×4; Add vs Update food item sections; Step01 vs BookingUpdate (about 300 near-identical JSX lines); `ReportsTable.tsx:53-127` vs `:130-204`; order grouping in `BillingTabs.tsx:100-118` and `:220-238` and `CheckoutCompletedDetails.tsx:78-88`; `RoomAvailability`/`Checkouts`/`SwitchRooms` pages are near-identical
- Impact: Bugs are fixed in one copy only (for example, FE-46), review is hard, and the large components mix data fetching, business rules, printing and UI.
- Recommendation: Extract a `GuestForm` shared by Step01 and BookingUpdate, `RestaurantDashboard({type})`, a `ReportRow` component, a `groupOrdersByDay` util, a `RoomsPage({mode})` component and shared `ui/Legend` and `ui/FormRow` components. Keep components under about 200 lines.

**FE-37: Dead code and debug leftovers. Low**
- Files: `component/beach-&-pool-restaurant/daily-summary/DailyOrderSummaryFilterAndCount.tsx:1-101` (commented copy of the component); `orderSlice.ts:135-162,192-210,240-258,396-418`; `pages/reception/invoice/Invoice.tsx:38-77`; `component/SamplePrint.tsx`; `pages/admin/PrinterDiagnostics.tsx` (unrouted); `component/currencyDropdown.tsx`; `component/beverage-inventory/dashboard/OutOfStock.tsx` (hard-coded "12,450"/"5623"); `api/order/get-table-api.ts` (exports a second `fetchOrderById`); `api/order/get-beverage-categories-api.ts`; `api/order/get-tables-api.ts:11` (typePrefix contains a query string); empty effects `FoodCategoryList.tsx:11-13` and `TableDetails.tsx:56-58`; `console.log()` at `InvoiceForm.tsx:117`
- Recommendation: Delete them, since git has the history. Enable `noUnusedLocals` and ESLint unused-import rules (already partly flagged).

**FE-38: Lint, tests and CI absent or unenforced. Medium**
- Files: `eslint.config.js:8-22` (recommended, non-type-aware); `package.json:6-11` (`build` = `tsc -b && vite build`, so lint is not part of it); `.github/workflows/google-drive-backup.yml` only; there are no test files.
- Evidence: `eslint .` reports 132 errors and 25 warnings (see §1).
- Impact: Regressions like FE-09, FE-19, FE-35 and FE-40 ship unnoticed, and money logic has zero tests.
- Recommendation: Add a CI pipeline (typecheck + type-aware ESLint + Vitest + Testing Library + Playwright smoke tests for login, order, checkout and print-mock). Prioritize unit tests for totals and the night calculation, and MSW contract tests against the backend routes.

**FE-39: Miscellaneous UI and logic defects. Low**
- `component/footer/InvoiceFooter.tsx:149`: `{totalOldRoomsPrice && (...)}` renders the literal "0" when the value is 0.
- `component/admin/UserDetails.tsx:46-51` and `UserTable.tsx:126-128`: the "Created Date" column shows `updatedAt`.
- `component/beach-&-pool-restaurant/tables/TableDetails.tsx:116-118`: "Seats: 04" is hard-coded.
- `component/beach-&-pool-restaurant/menu/FoodCategorySelector.tsx:145-160`: the key is placed on the inner `div` instead of the `<>` fragment; `FoodList.tsx:74` uses index keys.
- `BeverageCategorySelector.tsx:119-121,140-142`: the `itemRefs` indexes of base and extra categories collide.
- `OrderBillDetailsModal.tsx:378` and `PaymentModal.tsx:144-146`: payment methods are filtered by the magic index `3`; in `PaymentModal` this is dead code, because "Room" was already filtered out.
- `pages/reception/bookings/BookingUpdate.tsx:101-104`: mutates state objects in place (`updated[index].newPrice = value`).
- `component/onboarding/Step02.tsx:227-234`: `window.location.reload()` is used to reset state.
- `GetStartedButton.tsx:46-48` and `TableDetails.tsx:41-43`: artificial `setTimeout` navigations.
- `index.css:42-43`: an empty `--color-bg-text-primary:` declaration swallows the next `--radius-sm` override (Tailwind's default `.25rem` is used instead); `--color-primary` is declared twice in `@theme inline` (`:30` and `:53`).
- `pages/admin/Reports.tsx:115-119`: hard-codes `currencyRate: 1, breakfast: "Included"` on every saved report (the backend spreads `...r` into the saved document, so breakfast is always "Included"); the service charge formula `/11` is duplicated in `ReportsTable.tsx:119,124`.
- `DailyOrderSummaryFilterAndCount.tsx:135` and `RestaurantSummaryFilter.tsx:38`: `isAdmin` includes `Reception`, but the backend excludes Reception from `/order/daily-summary`.

### K. API contract mismatches (frontend vs backend)

**FE-40: Beverage stock removal calls `PATCH`; the backend only has `PUT`. High**
- Files: `component/beverage-inventory/manage-inventory/UpdateBeverageModal.tsx:72-74`; `backend/src/routes/Beverage/beverageRoutes.js:44`
- Evidence:
  ```
  await api.patch(`/beverages/reduce-beverage-quantity/${selectedBeverage}`, payload);   // frontend
  router.put("/reduce-beverage-quantity/:id", reduceBeverageQuantity);                 // backend
  ```
- Impact: "Remove" on Manage Inventory always fails with 404, so stock write-offs cannot be recorded and inventory counts drift.
- Recommendation: Align the method (PATCH is semantically right; change one side) and add a contract test.

**FE-41: The `restaurantType` filter is client-controlled and mis-wired. High**
- Files: `component/beach-&-pool-restaurant/restaurant-summary/RestaurantSummaryFilter.tsx:36,53-61,133-137,200`; `restaurant-summary/DownloadButton.tsx:14-16`; `daily-summary/DailyOrderSummaryFilterAndCount.tsx:123,150-154`; backend `order-controller.js:1301-1315,1877-1885,1987-1995`
- Evidence:
  ```
  const [restaurantType, setRestaurantType] = React.useState<string>(RestaurantTypes.BEACH.value);
  <DownloadExcelButton ... restaurantType={restaurantType} />      // always sent, even for non-admins
  dispatch(fetchDailyOrderSummary({ startDate, endDate }));        // admin-selected type never sent
  ```
- Impact: A **Pool-Restaurant-Admin** sees Pool totals on screen (the type is sent as `""`, so the backend falls back to the role), but the **Excel export downloads Beach data**: the selector is hidden, the state stays "Beach", and the backend honors a non-empty query parameter. On Daily Summary, the admin "Restaurant Type" dropdown does nothing. Cross-ref: the backend lets any restaurant staff read the other restaurant's data by passing the parameter.
- Recommendation: For non-admin roles, never send `restaurantType`; the server should derive it from the role and ignore or forbid the parameter. Pass the admin's selection into `fetchDailyOrderSummary`.

**FE-42: The invoice list response lacks fields the UI and the printout rely on. Medium**
- Files: `component/invoice/InvoiceList.tsx:122,135-153`; `util/printInvoice.ts:187-195`; `types/invoice.ts:2,10-12`; backend `backend/src/controllers/Reception/invoice-controller.js:147-165` (no `_id`, `subTotal`, `tax` or `discount`; the model has no such fields, `models/Reception/invoice.js`)
- Evidence:
  ```
  <tr key={inv._id} ...>   disabled={printingId === inv._id}      // inv._id is undefined for all rows
  <tr><td>Subtotal</td><td class="right">${invoice.currencyType} ${formatPrice(invoice.subTotal)}</td></tr>   // always 0.00
  ```
- Impact: All rows share key `undefined`, which causes React reconciliation bugs. Clicking Print on one row sets `printingId=undefined`, so **every** row shows "Printing..." and is disabled. Printed invoices show Subtotal, Tax and Discount as **0.00** next to a non-zero Total.
- Recommendation: Return `_id` (and computed `subTotal`, `tax` and `discount`, or remove them from the template), and type the DTO from the backend.

**FE-43: Booking update contract drift. Medium**
- Files: `pages/reception/bookings/BookingUpdate.tsx:76,101-116,166-184,295-309`; backend `backend/src/controllers/Reception/booking-controller.js:1379-1394`
- Evidence:
  ```
  const payload = { ...data, updatedRooms: roomsForUpdate };   // entire booking doc incl. totals, history, qr
  // backend destructures: guestName, country, email, whatsapp, totalGuests, kids, adults, checkOut, updatedRooms, customerType, breakfast
  ```
- Impact: **Passport ID edits are silently discarded**: the field is editable in the UI but ignored by the API. The whole document is sent, including totals, history and QR, which is wasteful and invites accidental mass-assignment if the backend changes. `newPrice` is sent as a string. `handleEmail` sets the **page-level** `loading`, which unmounts the form and modal (`:168` with `:184`), and navigates twice (`:172` and `:179`).
- Recommendation: Send an explicit DTO, either accept `passportId` server-side or make it read-only, coerce numbers, and use a separate `sending` state.

**FE-44: Date format contract for summary endpoints. Medium**
- Files: `lib/order-util.ts:34-48` (`formatToYMD` produces `"2026 Oct 16"`); used in `DailyOrderSummaryFilterAndCount.tsx:141,146`, `RestaurantSummaryFilter.tsx:28-34,45,50` and `DownloadButton.tsx`; backend `order-controller.js:1301` (comment `// YYYY-MM-DD`), `:1318-1320` (`new Date(startDate)`)
- Impact: This works only because V8's lenient parser accepts "YYYY Mon DD", and it parses as **server local midnight**, while ISO `YYYY-MM-DD` would be UTC midnight. Date boundaries therefore depend on the server time zone. The same helper's output is also fed back into `new Date()` on the client for the DatePicker (`RestaurantSummaryFilter.tsx:98,124`), which is non-standard parsing (**Needs confirmation** on Safari).
- Recommendation: Send ISO `yyyy-MM-dd` (date-fns `format`) together with an explicit time zone, and have the backend parse with dayjs in `Asia/Colombo`, as checkout already does.

**FE-45: Smaller response-shape mismatches. Low**
- `api/order/add-beverage-api.ts:22`, `add-extra-beverage-api.ts:21` and `update-extra-beverage-item-api.ts:25` read `.data.data.order`, but the backend returns `.data` (`beverageController.js:57-61`; extra-beverage controller `:198`), so the thunk payloads are always `undefined`.
- `delete-extra-beverage-api.ts:18` reads `data.beverageIem`, but the backend returns none.
- `pages/reception/bookings/bookings.tsx:62-79` ignores `totalPages` for completed bookings (the backend returns it at `booking-controller.js:1925`), so pagination shows stale page counts. `totalPages` can be 0, giving "Page 1 of 0" with Next enabled.
- Extra-beverage and booking controllers return `{error}`, which the UI never reads (FE-14).
- `fetchAllFoodCategories` and `fetchAllFoodItems` (`get-food-categories-api.ts:14`, `get-food-list-api.ts:14`) expect raw arrays while most other endpoints use the `{status,message,data}` envelope. This is inconsistent but currently matches the controllers.

**FE-46: Admin dashboard shows the other restaurant's liquor sales. Medium**
- Files: `component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/BeachResturantDashboard.tsx:21,34`; `PoolResturantDashboard.tsx:22,35`; backend `order-controller.js:1715-1741` (keys `"Beach"`/`"Pool"`)
- Evidence:
  ```
  const summary = response.data.data.summaryByRestaurantType.Beach;   // Beach dashboard
  setBeverageSummary(res.data.data.summaryByRestaurantType.Pool);     // ...but Pool beverage totals
  ```
- Impact: The "Sold Liqueur Amount" cards are swapped between Beach and Pool on the admin dashboard, which misleads liquor stock control.
- Recommendation: Replace both files with one `RestaurantDashboard({ type })`, which removes the possibility of this class of bug.

**FE-47: Saving room reports overwrites breakfast and re-sends every saved row. Medium**
- Files: `pages/admin/Reports.tsx:104-131`; backend `controllers/Excel/room-report.js:128-203`
- Evidence:
  ```
  ...bookings.map((b) => ({ ...b, currencyRate: 1, breakfast: "Included" })),
  ```
- Impact: Every new report row is saved with `breakfast: "Included"` regardless of the booking's real breakfast option (the backend recalculates `currencyRate` but keeps `breakfast` from the client), so the finance report's breakfast column is wrong for "Not-Included" and "Full Board" stays. Each save also posts all previously saved rows again, re-running the backend recalculation on them (which uses a different service-charge formula from the preview, BE-27).
- Recommendation: Send only new or changed rows, take `breakfast` from the booking, and let the server own all derived figures.

---

## 6. Items marked "Needs confirmation"

1. Whether QZ Tray's HTML renderer executes `<script>` from injected print HTML (FE-24). Markup and CSS injection is certain.
2. QZ Tray trust configuration on the deployment PCs (unsigned requests: prompt vs block) (FE-26).
3. Whether float rounding produces observable 400 "mismatch" errors with real price lists (FE-19). The code paths are verified.
4. Deployed domains and cookie behavior for a refresh-token flow (FE-13).
5. Safari and Firefox parsing of `"YYYY Mon DD"` strings via `new Date()` (FE-44).
6. ~~`src/assets/*` and `public/favicon.png` absent~~ — resolved: they are tracked in the repository; only the review copy lacked them.

## 7. Suggested remediation order

1. **Security and correctness hot-fixes:** FE-04 (plus backend auth), FE-29 (remove logs), FE-40, FE-41, FE-42, FE-46, FE-47, FE-20, FE-24 (escape helper).
2. **Session and state:** FE-08 (root reset), FE-13 (refresh flow or in-memory token), FE-28 (bundle QZ, CSP).
3. **Data layer refactor:** move server state to RTK Query (fixes FE-02, FE-09, FE-14, FE-15, FE-33) and put money math behind selectors and the server (FE-19, FE-21, FE-22, FE-23).
4. **Hygiene:** route config with roles and 404 (FE-05, FE-06), lazy routes (FE-32), dedupe components (FE-36), CI with type-aware lint and tests (FE-38).
