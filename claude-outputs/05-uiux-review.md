# 05 · UI/UX & Accessibility Review

**Scope:** a read-only source review of `frontend/` (React 19, TypeScript, Tailwind v4.1, shadcn/Radix, Redux
Toolkit, react-toastify, QZ Tray printing) from the point of view of the staff who use it every day: receptionists,
restaurant/bar cashiers on tablets, and managers.
**Method:** every file in `frontend/src/` was read: `App.tsx`, `Layout/`, `pages/**`, `component/**`,
`components/ui/**`, `index.css`, `util/print*.ts`, `util/printerConfig.ts`, the contexts and Redux slices, plus
`index.html`. The app was not run. A dedicated UI/UX reviewer pass produced the first draft; I then re-checked the
key claims against the source (clickable-`div` controls, the invoice total, currency relabelling, swapped dashboard
data, the ignored Daily Summary filter, kitchen-token content, false success toasts, the discount display bug,
zero `aria-label`/confirm-dialog usage, the 189 hex colour literals and every contrast ratio in §4) and corrected
two items (UX-18, UX-56) where the backend behaves differently than the first draft assumed.
**Paths:** unless a path is given in full, it is relative to `frontend/src/`.
**Verification:** items that depend on runtime behaviour are marked **"Needs confirmation (verify in running app)"**
and listed in §6.
**Contrast:** ratios use the WCAG 2.x relative-luminance formula. Tailwind v4 grey values are approximated from their
oklch definitions; see §4.

Severity scale:
- **Critical:** blocks a core task for some users, or can cause financial or data errors without the user noticing.
- **High:** a significant error risk, a WCAG Level A failure on a core flow, or a major source of friction.
- **Medium:** friction, a WCAG AA failure, or an inconsistency that degrades trust or efficiency.
- **Low:** polish.

Heuristic codes: N1 to N10 are Nielsen's heuristics:
- N1: Visibility of system status
- N2: Match between system and the real world
- N3: User control and freedom
- N4: Consistency and standards
- N5: Error prevention
- N6: Recognition rather than recall
- N7: Flexibility and efficiency of use
- N8: Aesthetic and minimalist design
- N9: Help users recognise, diagnose and recover from errors
- N10: Help and documentation

---

## 0. Executive summary: top findings

| # | ID | Sev | One-line summary |
|---|----|-----|------------------|
| 1 | UX-01 | Critical | Payment methods, room tiles, table tiles, customer/service-type tiles, hold orders and menu categories are clickable `div`s. A keyboard or assistive-technology user cannot check out a guest, book a room or take an order. |
| 2 | UX-02 | Critical | Hotel checkout: if printing fails after the payment API has succeeded, staff see **"Payment failed. Try again."**, which invites a second checkout. |
| 3 | UX-03 | Critical | The invoice total is only calculated by a non-obvious "Confirm Rooms" button and is never shown. "Generate Invoice" can save a 0 total silently. |
| 4 | UX-04 | High | False or contradictory success toasts: cancel order, delete category or item, empty Hold, stock removal with quantity 0, and print failure followed by "printed successfully". |
| 5 | UX-05 | High | There is no confirmation step anywhere in the app: cancel order, delete item or category, Clear All, deactivate user, Free Bill, remove stock. |
| 6 | UX-06 | High | Room status is shown by colour alone. Reserved and Maintenance fills differ by only **1.08:1** luminance, and Maintenance and Empty tiles have no text label. |
| 7 | UX-07 | High | Choosing USD or EUR for a room relabels the LKR amount without converting it, so a room can be booked at "USD 15000". |
| 8 | UX-08 | High | Checkout totals don't add up as shown: Massage, Laundry and Mini Bar are excluded from "Subtotal" but included in "Total", both on screen and on the printed bill. |
| 9 | UX-09 / UX-10 | High | The admin dashboard shows Beach and Pool beverage figures swapped, and the Daily Summary "Restaurant Type" filter has no effect. |
| 10 | UX-11 | High | The kitchen token print omits the **table number and service type**, and its TOTAL includes a 10% service charge that is never itemised. |

Systemic themes:
- **Zero** `aria-label`, `aria-live`, `tabIndex` or confirmation dialogs exist in the app code outside the shadcn primitives.
- There are about 189 hard-coded hex colour utilities.
- There are seven different money formats and at least six date formats.
- Layouts use fixed `grid-cols-4` and `grid-cols-7` with `h-[calc(100vh-…)]` and no tablet breakpoints, on screens that restaurant staff use on tablets.

---

## 1. Information architecture and navigation

### 1.1 Screen inventory per role

Navigation is defined in `Layout/Layout.tsx:21-86`, routes in `App.tsx:51-118`, and the post-login redirect in `pages/login/Login.tsx:68-76`.

**Reception** (lands on `/onboarding`)

| Sidebar item | Route | Screen / sub-states |
|---|---|---|
| Onboarding | `/onboarding` | Step 1 is the guest form (`component/onboarding/Step01.tsx`). Step 2 is the room grid with a details/booking panel and the "Send QR Code" modal (`Step02.tsx`, `RoomGrid.tsx`, `RoomDetails.tsx`, `QrCodeModal.tsx`). |
| Room Availability | `/room-availability` | Read-only room grid with a booking-details panel. |
| Bookings | `/bookings` | A "Bookings" (active) / "Completed Checkouts" toggle. **Update** leads to `/bookings/:id` (BookingUpdate). **View** leads to `/completed-checkout-details` (no sidebar entry). |
| Switch Rooms | `/switch-rooms` | Grid of reserved rooms with a SwitchRoomCollection panel. "Switch Room" goes back to `/onboarding` Step 2 with router state. |
| Checkouts | `/checkouts` | Grid of reserved rooms with a panel. **Checkout** leads to `/checkout-details` (BillingTabs, AdditionalCharges, TotalSummary, PaymentModal), then printing, then back to `/checkouts`. |
| Invoice | `/invoice` | A Create Invoice / Invoice List toggle (`InvoiceForm.tsx`, `InvoiceList.tsx`). |
| Room Reports | `/reports` | The same `Reports.tsx` page that admins use, with editable commission and breakfast columns and Excel export. |

**Restaurant staff** (Beach-Restaurant-Staff and Pool-Restaurant-Staff; lands on `/restaurant/home`)

| Sidebar item | Route | Screen |
|---|---|---|
| Home | `/restaurant/home` | Customer type, service type, guest/room selection, then "Get Started". |
| Tables | `/restaurant/tables/0` (from the sidebar) or `/tables/:orderId` (from the flow) | Table grid with a details panel and a "Book" button. |
| Menu | `/restaurant/menu/0` or `/menu/:orderId` | Category tabs, item grid, and an order panel with tokens, Token, Hold and Proceed To Payment. Two modals: OrderTokenModal and OrderBillDetailsModal. |
| Hold | `/restaurant/hold` | Grid of held orders with a details panel (Cancel order, Proceed to menu). |
| Daily Summary | `/restaurant/daily-summary` | Date range, service-type counts, order list and order details (read-only). |

**Restaurant admin** (Beach- and Pool-Restaurant-Admin) gets the staff screens plus:
- **Restaurant Report** (`/restaurant/report`), which is `RestaurantSummaryPage`.
- Menu at id `0`, which becomes a menu-management mode with Add/Update Item and Add/Update Category panels.

**Admin / Super-Admin** (lands on `/admin/dashboard`)

| Sidebar item | Route | Notes |
|---|---|---|
| Dashboard | `/admin/dashboard` | Reception stats and chart, plus Pool and Beach restaurant stat cards. |
| Reception | `/admin/reception` (not a route) | An `<a>` with `onClick` navigates to `/onboarding` and swaps the sidebar to the Reception set plus "Back to Admin". |
| Beverage Inventory | `/admin/beverage-inventory` (not a route) | Navigates to `/beverage-inventory/dashboard`, which has Dashboard and Manage Inventory. |
| Currency Config | `/admin/currency-config` | LKR-per-USD and LKR-per-EUR form. |
| User Config | `/admin/user-config` | User table with a Create / Details side panel. |
| Room Config | `/admin/room-config` | Room grid with Add Room / Update Room panels and an "Add Room Type" modal. |
| Reports | `/admin/reports` | Same page as Reception's "Room Reports". |
| Restaurant Reports | `/admin/restaurant/reports` | `RestaurantSummaryPage`, with a restaurant-type selector. |

**Orphans and unreachable screens:**
- **Beverage-Inventory role:** it has a nav set (`Layout.tsx:82-85`), but it can't be chosen at login (`Login.tsx:142-156`) or in Create User (`CreateUser.tsx:118-131`).
- **PrinterDiagnostics** (`pages/admin/PrinterDiagnostics.tsx`) has no route in `App.tsx`.
- `SamplePrint.tsx` is commented out of `App.tsx`.
- `room-config` is also mounted at `/room-config` (`App.tsx:69`) with no sidebar entry.
- Admins have no sidebar access to the restaurant POS screens; they can only reach the reports.

### 1.2 How users move between tasks
- The **sidebar** is the only global navigation. It is collapsed by default (`Layout.tsx:139`), showing icons only, and only `<Link>` items get a `title` tooltip (`Sidebar.tsx:111`).
- There are **no breadcrumbs**.
- The **page title** is a small grey `h1` in the header (`Header.tsx:58`), mapped from `pathTitles` (`Layout.tsx:88-116`).
- Several flows rely on `navigate()` plus router `state` (switch rooms, completed checkout) or Redux state (checkout details, onboarding step). Those screens break on refresh (UX-21).
- Restaurant flows auto-navigate after artificial delays: 1200 ms (`GetStartedButton.tsx:46-48`), 1000 ms (`TableDetails.tsx:41-43`), and 2000 ms at login (`Login.tsx:79-83`).

### 1.3 Dead ends, missing back/cancel paths and titles (details in UX-12, UX-20, UX-21)
- There is no catch-all/404 route, and no error boundary anywhere in `src/`.
- Onboarding Step 2 has no Back button; `prevStep` exists in `onboardingSlice.ts:49-51` but nothing uses it.
- `/checkout-details`, `/bookings/:id` and `/completed-checkout-details` have no Back or Cancel control.
- Opening Tables or Menu from the sidebar uses id `0`. On Tables the Book button can never be enabled, and on Menu staff see "Order not found / Select a order from the left", with nothing on the left.
- Header titles are missing for `/bookings/:id`, `/completed-checkout-details` and `/admin/restaurant/reports`. The last is a key mismatch: `Layout.tsx:115` has `"/admin/restaurant/report"` while the route is `/admin/restaurant/reports`.
- `document.title` is static, "Ganesh Garden Hotel" (`index.html:7`).

---

## 2. Core task flows: step-by-step walkthroughs and friction points

### 2.1 Login and forgot password
1. Select a **User Role** from seven options. This is required, and the user must know their own role.
2. Enter "Username", which is actually validated as an email.
3. Enter the password and press Login.
4. A spinner shows for at least **2 s**, then the app redirects by role and shows a toast.
5. **Forgot Password?** replaces the card with a modal:
   - Step 1: email, then "Send Temporary Password".
   - Step 2: temporary password, new password, confirm password, then "Update Password". The modal closes after 1 s.

Friction: UX-24 (role pick, Username/email mismatch, double submit, fixed 500 px width) and UX-25 (step-2 validation errors are never displayed; generic errors).

### 2.2 Guest onboarding / check-in
**Step 1** (`Step01.tsx`):
1. Pick the hotel from two unlabelled toggle buttons.
2. Fill in Guest Name\*, Country, Customer Type\*, Breakfast\*, Passport, Email and WhatsApp.
3. Total Guests and Length of Stay are disabled and computed.
4. Set Adults and Kids with − / + steppers (default 0).
5. Check-in is locked to today; set Check-out.
6. Press **Continue**.

**Step 2** (`Step02.tsx`):
1. Pick rooms on the grid. Only Empty rooms are clickable, and they are locked over a socket.
2. In the right panel, choose a currency from a per-room select that changes **all** rooms, and edit the per-day price.
3. Press **Book**.
4. If an email or WhatsApp number was entered, a "Send QR Code" modal opens. Closing it does a **full page reload** (`Step02.tsx:227-234`).

Friction:
- No way back to Step 1 (UX-12).
- WhatsApp numbers are truncated to 12 characters (UX-26).
- Validation errors appear under disabled fields (UX-26).
- Book is disabled until a currency is chosen, with no hint (UX-27).
- Choosing a currency relabels the price without converting it (UX-07).
- Room status is shown by colour only (UX-06).
- Rooms are not keyboard-operable (UX-01).
- The QR modal is not an accessible dialog and closing it reloads the page (UX-47).

### 2.3 Room availability and room grid
1. Click a room to see its HeaderBadge, guest details, facilities and the per-day price.

Friction:
- Room status by colour (UX-06).
- Non-clickable tiles are faded to 60% opacity, which drops text contrast to 2.25–2.71:1 (UX-45).
- There's no search or filter by room number, guest or status (UX-58).
- A deselected room keeps its black "active" border (UX-63).

### 2.4 Room switch
1. On Switch Rooms, click a **reserved** room.
2. The panel lists that booking's rooms, each with a disabled currency select, a Discount input and an **"Update"** button. Pressing Update actually removes the room from the list and marks it for switching.
3. Press "Switch Room". A fake 1.5 s spinner runs, then the app navigates to `/onboarding` Step 2 and shows an "Old Rooms Bill" line.
4. Select the new rooms, then press **Book**.
5. The toast says "Rooms booked successfully!" and the app redirects to Room Availability.

Friction: UX-32.

### 2.5 Booking update and extension
1. Bookings → Update opens `BookingUpdate`, which has the same layout as Step 1 plus a "Room Price Update" list.
2. Change Check-out, then press **Update Booking**.
3. A QR modal or a redirect to `/bookings` follows.

Friction:
- Length of Stay is not recalculated when Check-out changes.
- A booking whose Check-out is already in the past can't be edited at all.
- Pressing "Email" in the modal swaps the whole page to "Loading...".
- The button isn't disabled while submitting.
- There's no Cancel (UX-28, UX-13).

### 2.6 Checkout and payment
1. On Checkouts, click a reserved room.
2. The panel shows guest details (days stayed so far, with today as the check-out date), a room list with final totals, and a footer with "Total Bill" and **Checkout**.
3. `/checkout-details` has two cards:
   - Left: BookingInfo with a "Discount Amount" input, and BillingTabs (Summary / Detail).
   - Right: AdditionalCharges (Massage, Laundry, Mini Bar, custom rows) and TotalSummary.
4. Press **Proceed to Payment**. It is disabled if there are pending restaurant orders; a single toast explains why.
5. In PaymentModal, pick Cash, Card or Free Bill (clickable `div`s), then press **Confirm**.
6. The API is called, the A4 bill prints twice via QZ Tray, and the app navigates to `/checkouts`.

Friction:
- Payment options aren't keyboard-operable (UX-01).
- Print failure is reported as payment failure (UX-02).
- Subtotal and Total don't reconcile (UX-08).
- The modal doesn't show the amount due (UX-31).
- Discount is an amount here but a percentage elsewhere (UX-29).
- AdditionalCharges usability issues (UX-30).
- Free Bill can be chosen with no confirmation (UX-18).
- There's no back/cancel path, and the skeleton never resolves if a fetch fails (UX-21, UX-23).

### 2.7 Invoices
**Create:**
1. Pick the hotel, then fill in Guest, Agent, Adults/Kids steppers, Check-in, Check-out and Currency (LKR, USD or "EURO").
2. Add room rows (Category, Count, Per Day Price).
3. Press **Confirm Rooms**. This silently calculates the total; it is not displayed.
4. Press **Generate Invoice**.

**List:**
1. Pick From and To dates. Both are required before anything loads.
2. Search if needed, then press **Print** on a row.

Friction:
- The total is hidden and can be 0 (UX-03).
- Generate Invoice can be double-submitted (UX-13).
- Print feedback is contradictory (UX-04).
- The list's empty state is misleading (UX-34).
- Print layout issues (UX-56).

### 2.8 Restaurant order flow
1. **Home:** choose Checked-In or Walk-In and Dine In, Take Away or Save to Room. Checked-In requires a room from a combobox, which auto-fills the guest name. Walk-In requires a typed name. Press **Get Started**; the app waits 1.2 s.
2. **Dine In → Tables:** select an Empty table and press **Book** ("Table reserved successfully"); after 1 s the menu opens.
3. **Menu:**
   - Choose a food category (horizontal, drag-to-scroll, scrollbar hidden) or a beverage category (vertical).
   - Press **+** on an item; it appears in the token on the right, where − / + / trash and "Clear All" adjust it.
4. **Token:** the modal shows a preview; **Print** saves the token and prints two copies on the thermal printer.
5. **More items:** press a tiny unlabelled "+" under the tokens (`component/beach-&-pool-restaurant/menu/OrderDetailsSection.tsx:66-77`). Until then, every item "+" is disabled.
6. **Hold:** saves any pending items and returns to Home.
7. **Proceed To Payment** (needs at least one printed token and no unsaved items):
   - Bill step 1: summary and Discount (%).
   - Bill step 2: Cash, Card, Free Bill or Room (`div`s), then **Confirm & Print**, which prints twice and returns to Home.
8. **Hold page:** select a held order, then **Cancel order** (only possible when it has no tokens) or **Proceed to menu**.

Friction:
- Tiles and payment options aren't keyboard-operable (UX-01).
- The second-round "+" is hidden (UX-17).
- Touch targets are tiny (UX-16).
- False success messages (UX-04).
- No confirmations (UX-05).
- The kitchen token lacks the table number (UX-11).
- Free Bill data mismatch (UX-18).
- No reprint (UX-37).
- Switching customer type can leave a hidden service-type selection (UX-39).
- Hard-coded "Seats: 04" (UX-38).

### 2.9 Daily summary, restaurant summary and downloads
- **Daily Summary:** two DatePickers, plus a Restaurant Type select for Admin and Reception that does nothing (UX-10). Shows three count cards and an order list with read-only details. There are no money totals and no export (UX-37).
- **Restaurant Report:** start and end dates (default: first of the month to today), Restaurant Type (admins only), income cards and a "Download Excel" button.

Friction: UX-36.

### 2.10 Beverage inventory
- **Dashboard:** Total in Stock and Restock cards, and Monthly Beverage Sales (date range plus a Pool/Beach toggle).
- **Manage Inventory:** Soft Drinks / Hard Liquor tabs and an item grid. The "+" tile opens the Add Beverage modal. Selecting an item fills a right-hand panel titled "Add item", with **Remove** (reduce stock) and **Update** (restock and price) buttons that open a modal.

Friction: UX-40.

### 2.11 Admin configuration
- **User Config:** table, then the "+ Create" side panel. Row click shows details; the kebab menu offers Activate/Deactivate. There's no edit, delete or password reset.
- **Room Config:** the "+" tile opens Add Room, a room click opens Update Room (Edit/Cancel), and there's an "Add Room Type" modal. There's no delete.
- **Currency Config:** LKR-per-USD and LKR-per-EUR fields, then "Update Exchange Rates".

Friction: UX-41 and UX-42.

### 2.12 Reports
1. Pick start and end dates, then press **Load Reports**.
2. Enter Booking Commission and Breakfast for each new row, then press **Save**.
3. Optionally press **Download Excel**.

Friction: UX-35.

### 2.13 Printer diagnostics
Not reachable, because no route is registered (UX-21). If it were reachable, it uses `alert()` and briefly shows "❌ Not Available" while a test is running (`PrinterDiagnostics.tsx:54-56`).

---

## 3. Findings

### A. Accessibility blockers and errors on core flows

#### UX-01 · Critical · Core selection controls are non-focusable `div`s
- **Heuristic:** WCAG 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A); N7
- **Where:**
  - Payment methods (hotel): `component/checkout/PaymentModal.tsx:149-160`
  - Payment methods (restaurant): `component/beach-&-pool-restaurant/order-details/OrderBillDetailsModal.tsx:380-391`
  - Room tiles: `component/room/RoomGrid.tsx:132-148`; add-room tile: `:108-113`
  - Table tiles: `…/tables/TableSelectionSection.tsx:93-98`
  - Customer and service type: `…/home/CustomerType.tsx:40-49`, `…/home/ServiceType.tsx:49-58`
  - Food and beverage categories: `…/menu/FoodCategorySelector.tsx:146-158`, `…/menu/BeverageCategorySelector.tsx:117-129, 138-150`
  - Admin Add/Edit category controls: `FoodCategorySelector.tsx:173-200`, `BeverageCategorySelector.tsx:159-187`
  - Hold orders: `…/hold/HoldOrderSelectionSection.tsx:89-93`; daily-order rows: `…/daily-summary/DailyOrdersList.tsx:104-113`
  - Inventory items: `component/beverage-inventory/manage-inventory/InventoryItems.tsx:38-55`
  - User rows: `component/admin/UserTable.tsx:116-120`
  - Sidebar anchors without `href`: `Layout/Sidebar.tsx:94-107`
  - "Clear All": `…/order-details/OrderToken.tsx:120-125` (a `<p>`)
  - Password eye: `component/admin/CreateUser.tsx:171-180` (a `<span>`)
- **Evidence:**
  ```tsx
  <div key={method.value} onClick={() => setSelectedPayment(method.value)}
       className={cn("border rounded-md py-3 px-4 cursor-pointer ...",
  ```
- **User impact:**
  - A keyboard-only user, or someone using a screen reader, switch or keyboard-dock tablet, cannot select a payment method, room, table or category, so **checkout, booking and ordering are impossible**.
  - Screen readers announce plain text with no role or selected state.
- **Recommendation:**
  - Use real `<button>`s, or Radix `RadioGroup` / `ToggleGroup` for mutually exclusive choices (payment method, customer type, service type, hotel).
  - Expose state with `aria-pressed`, `aria-checked` or `aria-selected`.
  - Make grids (rooms, tables) a list of buttons whose accessible name includes status, e.g. "Room 104, Deluxe, Reserved".
  - Give `<a>` an `href`, or use `<button>`.

#### UX-02 · Critical · Print failure after a successful hotel checkout is reported as "Payment failed"
- **Heuristic:** N1, N9; WCAG 3.3.4 (error prevention, financial)
- **Where:** `component/checkout/PaymentModal.tsx:95-130`; `util/printCheckout.ts:27-35`
- **Evidence:**
  ```tsx
  if (response.status === 200) { toast.success(...); await printFinalBill({...});
  } catch (error: any) { toast.error(error.response?.data?.message || "Payment failed. Try again.");
  } finally { setLoading(false); navigate("/checkouts"); }
  ```
- **User impact:**
  - `printFinalBill` throws if QZ Tray isn't running (`qz.websocket.connect()`, `printCheckout.ts:33-35`). That exception lands in the *payment* catch block, so the cashier sees "Payment processed successfully!" followed by "Payment failed. Try again.".
  - The cashier may charge the guest again or attempt a second checkout.
  - If QZ isn't loaded at all, a blocking `alert()` appears mid-transaction.
- **Recommendation:**
  - Separate the transaction result from the print result.
  - After a 200, show a persistent success state: "Checkout complete. Bill #… · Total LKR …".
  - Show print status separately: "Printing… / Couldn't print. [Retry print] [Printer help]".
  - Never use payment-failure wording for printer errors. Replace `alert()` with in-app messaging.

#### UX-03 · Critical · Invoice total is hidden and only calculated on "Confirm Rooms"
- **Heuristic:** N1, N5
- **Where:** `component/invoice/InvoiceForm.tsx:459-480` (Confirm Rooms), `:100` (payload `total: data.total`), `:33` (default `total: 0`), `:484-490` (submit)
- **Evidence:**
  ```tsx
  onClick={() => { ... total += price * count * stay; setValue("total", total); console.log(total); }}
  >Confirm Rooms</Button>
  ```
- **User impact:**
  - The total is never rendered.
  - If a receptionist presses **Generate Invoice** without first pressing "Confirm Rooms", or edits rooms or dates afterwards, the invoice is saved and printed with a 0 or stale total.
- **Recommendation:**
  - Compute the total reactively from rooms × count × nights.
  - Show a live summary (Subtotal / Discount / Total) above the submit button.
  - Remove "Confirm Rooms", and validate that total > 0 before submitting.

#### UX-04 · High · False or contradictory success feedback
- **Heuristic:** N1, N9
- **Where:**
  - Cancel order: `…/order-details/OrderPaymentDetails.tsx:84-85`. `dispatch(cancelOrder(...))` is called without `.unwrap()`, so success is always shown.
  - Delete category: `…/menu/UpdateFoodCategorySection.tsx:84-85, 88-93`. Same pattern.
  - Update and delete item: `…/menu/UpdateFoodItemSection.tsx:91, 109-112, 121-128`. Not awaited.
  - Hold with an empty token: `OrderPaymentDetails.tsx:58-63` shows "Order token held successfully".
  - Remove stock with quantity 0: `beverage-inventory/manage-inventory/UpdateBeverageModal.tsx:72-80` makes no API call but toasts "Beverage removed successfully".
  - Invoice print: `util/printInvoice.ts:220-224` swallows errors and toasts itself; then `component/invoice/InvoiceList.tsx:139-140` toasts "Printed successfully". A failure produces both "Printing failed" **and** "Printed successfully".
  - Restaurant bill: `OrderBillDetailsModal.tsx:193-196` catches the print error internally, then `:250` toasts "Order payment processed & printed!".
  - Kitchen token: `OrderTokenModal.tsx:186-189` raises `alert("Print failed! Check console…")`, then `:207` toasts "Order updated successfully!".
- **Evidence:**
  ```tsx
  await dispatch(cancelOrder({ orderId: order._id }));
  toast.success("Order canceled successfully");
  ```
- **User impact:**
  - Staff believe an order was cancelled, an item deleted or a receipt printed when it wasn't.
  - The guest leaves without a receipt; stock and menu data drift from reality.
- **Recommendation:**
  - Always `unwrap()` thunks before showing success.
  - Have print helpers return or throw a status and let the caller show one message.
  - Disable Hold when the token is empty.
  - Validate quantity > 0.

#### UX-05 · High · No confirmation before destructive or irreversible actions
- **Heuristic:** N3, N5; WCAG 3.3.4 (financial data)
- **Where:**
  - Cancel order: `OrderPaymentDetails.tsx:81-93`
  - Delete category: `UpdateFoodCategorySection.tsx:81-97`
  - Delete item: `UpdateFoodItemSection.tsx:118-133`
  - Clear All token items: `OrderToken.tsx:76-78, 120-125`
  - Deactivate user: `component/admin/UserTable.tsx:159-168`
  - Reduce stock: `UpdateBeverageModal.tsx:72-74`
  - Remove an invoice room row: `InvoiceForm.tsx:448-454`
  - Mark room for switch: `SwitchRoomCollection.tsx:245-249`
  - Hotel and restaurant "Free Bill": see UX-18
  - Logout: `Layout/Sidebar.tsx:56-78`
- **Evidence:** a grep for `confirm(`, `AlertDialog` and any confirm dialog finds **no matches** in the app.
- **User impact:** one mis-tap on a tablet cancels an order, wipes a token or deletes a menu category, with no undo.
- **Recommendation:**
  - Add a shared `ConfirmDialog` (Radix AlertDialog) that names the object and consequence, e.g. "Cancel order #142? This can't be undone.".
  - Use the destructive button variant for the confirming action.
  - Offer "Undo" toasts for low-risk actions such as Clear All.

#### UX-06 · High · Room, table and order status conveyed by colour alone; near-identical hues
- **Heuristic:** WCAG 1.4.1 Use of Color (A), 1.4.11 Non-text Contrast (AA); N2
- **Where:**
  - `component/room/RoomGrid.tsx:35-48` (status colours), `:145-147` (only Reserved shows text, "Booked")
  - `component/room/room_details/HeaderBadge.tsx:21-31`
  - `…/tables/TableSelectionSection.tsx:29-41`
  - `…/hold/HoldOrderSelectionSection.tsx:18-36`
  - `…/daily-summary/DailyOrdersList.tsx:107-112`
  - `component/reports/ReportsHeader.tsx:79-88` with `ReportsTable.tsx:133` (Updated vs Not Updated)
  - `…/menu/FoodMenuDetailsSection.tsx:7-11` (item-type legend)
- **Evidence:**
  ```tsx
  case "reserved": return "bg-quaternary text-gray";   // #F5B67C
  case "maintain": return "bg-quinary text-gray";      // #D3BB5C
  ```
- **User impact:**
  - Reserved (#F5B67C) and Maintenance (#D3BB5C) differ by only **1.08:1** luminance, so they are nearly indistinguishable for users with red/green colour-vision deficiency, and in sunlight on a beach-side tablet.
  - Maintenance and Empty tiles have no text label.
  - Fills against the white background are 1.36–1.89:1, and the legend dots are 12 px.
- **Recommendation:**
  - Print the status as text on every tile (Available / Occupied / Maintenance / Selected), with a distinct icon (for example a wrench for maintenance).
  - Choose fills with clearly different lightness, and add a ≥ 3:1 border.
  - Show selection with a checkmark, not only a border.

#### UX-07 · High · Room currency selection relabels the amount without converting it
- **Heuristic:** N2, N5
- **Where:** `component/room/room_details/SelectedRoomsList.tsx:40-46` (currency starts as `null`), `:79-95` (change sets the currency only), `:122-124` and `:186` (display)
- **Evidence:**
  ```tsx
  const updated = prev.map((r) => ({ ...r, currency: newCurrency })); // update all rooms
  ...{room.currency ? room.currency : room.perDayCurrency} {room.price ? room.price : room.perDayPrice}
  ```
- **User impact:**
  - The room's base price (LKR) stays the same when the user picks USD or EUR, so the panel reads e.g. "USD 15000" and the booking is saved like that unless staff remember to retype the price.
  - Changing one room's currency also silently changes every other room's.
- **Recommendation:**
  - Either convert automatically using the configured rate and show both amounts ("USD 50.00 ≈ LKR 15,000"), or make the price field required whenever the currency changes, with a clear "Enter price in USD" prompt.
  - Use a single booking-level currency control instead of per-room selects that affect every room.

#### UX-08 · High · Checkout totals don't reconcile on screen or on the printed bill
- **Heuristic:** N1, N2
- **Where:** `component/checkout/CheckoutDetails.tsx:70-79`, `TotalSummary.tsx:26-47`, `util/printCheckout.ts:257-272`
- **Evidence:**
  ```tsx
  const subtotal = booking.totalRoomsCharges + booking.totalOrdersBill + charges.reduce(...);
  const total = subtotal + spa + laundry + miniBar + tax + serviceCharge - discountAmount;
  ```
- **User impact:**
  - "Subtotal − Discount" does not equal "Total" whenever Massage, Laundry or Mini Bar is non-zero. Neither the screen nor the A4 bill shows those three lines in the summary.
  - Guests querying their bill, and cashiers reconciling, see arithmetic that doesn't add up.
  - The printed summary also adds a "Service Charge" row that the UI hides.
- **Recommendation:**
  - Itemise every component in the summary: Rooms, Restaurant, each additional charge, Subtotal, Discount, Tax, Service, Total.
  - Make Subtotal include all charges.
  - Use one calculation function for screen and print.

#### UX-09 · High · Admin dashboard shows Beach and Pool beverage figures swapped
- **Heuristic:** N1 (accuracy of system status)
- **Where:** `component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/BeachResturantDashboard.tsx:34`, `PoolResturantDashboard.tsx:35`
- **Evidence:**
  ```tsx
  // BeachResturantDashboard
  setBeverageSummary(res.data.data.summaryByRestaurantType.Pool);
  // PoolResturantDashboard
  setBeverageSummary(res.data.data.summaryByRestaurantType.Beach);
  ```
- **User impact:** management sees the wrong outlet's liquor and soft-drink sales under each heading.
- **Recommendation:** fix the mapping, show the outlet name inside each card, and add units (bottles or ml).

#### UX-10 · High · Daily Summary "Restaurant Type" filter has no effect
- **Heuristic:** N1
- **Where:** `component/beach-&-pool-restaurant/daily-summary/DailyOrderSummaryFilterAndCount.tsx:150-154` (the fetch omits `restaurantType`), `:225-246` (the select)
- **Evidence:**
  ```tsx
  dispatch(fetchDailyOrderSummary({ startDate, endDate }));
  }, [startDate, endDate, restaurantType, dispatch]);
  ```
- **User impact:** an admin switches to "Pool" and sees the same orders, believing they are Pool orders.
- **Recommendation:** pass the filter to the API and show the active outlet in the list header.

#### UX-11 · High · Kitchen token lacks table and service type; its TOTAL includes an unlisted service charge
- **Heuristic:** N2 (match the real world: kitchen needs), N1
- **Where:** `component/beach-&-pool-restaurant/order-details/OrderTokenModal.tsx:154-159` (header lines), `:137` (total), `:183-184` (printed twice)
- **Evidence:**
  ```tsx
  `Order Number : ${order.orderNumber}\n` + `Order Token  : ${...}\n` + `Customer Type: ${order.customerType}\n` +
  const totalLine = padKey("TOTAL:") + amountPad(order.newOrderToken.tokenTotalBill);
  ```
- **User impact:**
  - Kitchen and bar staff can't see which table or whether the order is take-away, which leads to mis-delivered orders.
  - The TOTAL (subtotal + 10%) doesn't match the sum of the printed lines.
  - The two identical copies aren't labelled (Kitchen / Bar / Customer).
  - Walk-in tokens may print a blank or "0" "Room No" line (`:157`). Needs confirmation (verify in running app).
- **Recommendation:**
  - Put TABLE and SERVICE TYPE at the top in large or bold text (ESC/POS double height).
  - Drop prices and totals from kitchen copies, or itemise the service charge.
  - Label the copies, and print the room line only for checked-in guests.

#### UX-12 · High · Onboarding has no Back/Cancel; leaving the QR modal reloads the page
- **Heuristic:** N3
- **Where:**
  - `pages/reception/onboarding/Onboarding.tsx:10-11` (renders by Redux step)
  - `features/onboarding/onboardingSlice.ts:49-51` (`prevStep` is never used)
  - `component/onboarding/Step02.tsx:227-234` (`window.location.reload()`)
  - `component/onboarding/Step01.tsx:486-491` (only "Continue")
- **Evidence:**
  ```tsx
  const handleCloseModal = () => { setIsModalOpen(false); setTimeout(() => { window.location.reload(); }, 100); };
  ```
- **User impact:**
  - Once on Step 2, the receptionist can't fix a typo in the guest name or dates except by reloading, which discards everything and unlocks the rooms.
  - Clicking "Onboarding" in the sidebar keeps the user on Step 2 because the step lives in Redux.
  - There's no "Start over" for a new guest.
- **Recommendation:**
  - Add a visible stepper ("1 Guest details · 2 Rooms · 3 Confirm") with Back and Cancel.
  - Show a read-only summary of the guest on Step 2 with an "Edit" link.
  - Reset state on success, without a full reload.

#### UX-13 · High · Double submission not prevented on record-creating actions
- **Heuristic:** N5
- **Where:**
  - Generate Invoice: `InvoiceForm.tsx:484-490` (no `disabled`)
  - Update Booking: `pages/reception/bookings/BookingUpdate.tsx:541-547`
  - Table **Book**: `…/tables/TableDetails.tsx:123-130`. The panel is swapped for a skeleton while the request runs, but Book becomes clickable again during the 1 s delay before navigation (`:41-43`), allowing a second reservation call.
  - Reports **Save**: `component/reports/ReportsHeader.tsx:90-96`
  - Add Beverage: `…/manage-inventory/AddBeverageModal.tsx:128`
  - Add food item: `…/menu/AddFoodItemSection.tsx:366-372`
  - Hold and Cancel order: `OrderPaymentDetails.tsx:227-260`
  - Currency save: `component/admin/CurrencyConverter.tsx:138`
  - Login: `pages/login/Login.tsx:206` (the 2 s timer can also be started twice)
- **Evidence:**
  ```tsx
  <Button type="submit" className="w-50">{loading ? <span className="... animate-spin"></span> : "Generate Invoice"}</Button>
  ```
- **User impact:** duplicate invoices, double table reservations and duplicate report rows on slow hotel Wi-Fi.
- **Recommendation:**
  - Disable every submit while pending and keep a text label ("Generating…"), not just a spinner. Add `aria-busy`.
  - Add idempotency guards to handlers.

#### UX-14 · High · Icon-only and glyph-only buttons have no accessible name
- **Heuristic:** WCAG 4.1.2 (A), 1.1.1 (A), 2.4.6
- **Where:**
  - Sidebar collapse: `Layout/Sidebar.tsx:85-87`
  - QR modal close: `component/modal/QrCodeModal.tsx:25-32`
  - Trash: `SelectedRoomsList.tsx:192-198`
  - Remove-charge "X": `AdditionalCharges.tsx:164-169`
  - Eye toggles: `ForgotPasswordModal.tsx:192-198, 216-222`
  - Kebab: `UserTable.tsx:149-156`
  - "✕" closers: `CreateUser.tsx:87-89`, `UserDetails.tsx:15-17`, `AddRoom.tsx:215-222`, `UpdateRoom.tsx:179-181`
  - Token − / + / trash: `OrderToken.tsx:145-180, 207-247`
  - Add-token "+": `OrderDetailsSection.tsx:68-74`
  - Item "+": `FoodItemSelector.tsx:89-95`, `BeverageItemSelector.tsx:105-111`
  - Liquor rows: `AddFoodItemSection.tsx:336-357`, `UpdateFoodItemSection.tsx:284-305`
  - Steppers "−" / "+": `Step01.tsx:391-406, 439-455`, `InvoiceForm.tsx:222-238`
- **Evidence:** a repository-wide grep for `aria-label` finds **0** matches outside `components/ui`.
- **User impact:** screen readers announce "button" or "times" with no purpose. Voice-control users can't target the buttons.
- **Recommendation:**
  - Add descriptive `aria-label`s, e.g. "Remove Chicken Kottu from token 02", "Increase adults", "Close".
  - Collapsed sidebar items need tooltips and `aria-label`s.

#### UX-15 · High · Form labels not programmatically associated with their inputs
- **Heuristic:** WCAG 1.3.1 (A), 3.3.2 (A), 4.1.2 (A)
- **Where:**
  - `Step01.tsx:369, 389, 420, 437, 476` and `BookingUpdate.tsx:386, 404, 435, 457, 496`: plain `<Label>` with no `htmlFor`, so Check-out, Length of Stay, Adults and Kids are unlabelled.
  - `SelectedRoomsList.tsx:146-174`; `SwitchRoomCollection.tsx:188-228`; `BookingInfo.tsx:60-73`
  - `InvoiceFooter.tsx:130-136` (Discount % input has no label)
  - `AdditionalCharges.tsx:80-147` (placeholder only, and the placeholder is hidden because the value is 0)
  - `InvoiceForm.tsx:428-443` (Count and Price `Input` sit outside `FormControl`)
  - `InvoiceList.tsx:68-96`; `CreateUser.tsx:96-181`; `AddRoom.tsx:117-198`; `UpdateRoom.tsx:128-203`; `RoomTypeModal.tsx:40-45`
  - `CurrencyConverter.tsx:91-96, 117-122`; `ReportsHeader.tsx:39-75`; `ReportsTable.tsx:71-112`; `bookings.tsx:128-137`
  - `AddBeverageModal.tsx:85-124` (placeholder only); `UpdateBeverageModal.tsx:104-149`
  - `GuestDetails.tsx:82-87` (`htmlFor="roomNumber"`, but no element has that id)
  - `DatePicker.tsx:53-58` (no label; hard-coded `id="date"` is duplicated when two pickers render)
- **Evidence:**
  ```tsx
  <Label className="w-35">Check-out</Label>
  <FormControl className="w-70"><Input type="date" {...field} min={todayDate} /></FormControl>
  ```
- **User impact:**
  - Screen readers announce "edit text" or "spin button" with no context.
  - Clicking a label doesn't focus its field.
  - Placeholder-only fields lose their label as soon as staff type.
- **Recommendation:**
  - Use `FormLabel` inside `FormItem`, or pair `htmlFor` with an `id`, everywhere.
  - Replace placeholder-only fields with visible labels.
  - Generate DatePicker ids with `useId()`.

#### UX-16 · High · Restaurant POS isn't designed for tablets or touch
- **Heuristic:** WCAG 2.5.8 Target Size (2.2 AA), 2.5.5 (AAA); N7
- **Where:**
  - Fixed 7-column page grids: `pages/beach-restaurant/BeachRestaurantMenuPage.tsx:41-46`, `BeachRestaurantHoldPage.tsx:16-22`, `BeachRestaurantDailySummaryPage.tsx:7-12`
  - Nested item grid: `FoodCategoryList.tsx:18-22`, `FoodList.tsx:57`
  - Tiny controls: `OrderToken.tsx:147, 162, 175` (`!p-1 !h-7`, 10 px icons), `:121` ("Clear All" at 10 px), `OrderDetailsSection.tsx:70` (`!h-7`)
  - Fixed scroll heights: `OrderDetailsSection.tsx:45` (`h-[calc(100vh-530px)]`), `OrderPaymentDetails.tsx:146-147`
  - Hidden scrollbar on the drag-scroll categories: `FoodCategorySelector.tsx:132`
- **Evidence:**
  ```tsx
  <Button variant="outline" className="!p-1 !h-7 !rounded-none cursor-pointer" ...><Minus size={10} strokeWidth={1.5} /></Button>
  ```
- **User impact:**
  - On a 1024 × 768 tablet (about 880 px of content), each menu tile is about 118 px wide and its "+" button about 30 px.
  - Token − / + buttons are about 18 × 28 px, and the token list has about 170–240 px of visible height.
  - The order panel is about 250 px wide with 12 px text.
  - Staff mis-tap often, and categories beyond the visible width aren't discoverable.
- **Recommendation:**
  - Use a touch-first layout: a ≥ 44 × 44 px target for every control, quantity steppers of at least 40 px, and a cart panel at least 320 px wide.
  - Use responsive breakpoints (`md:`/`lg:`) to stack the cart under the menu in portrait.
  - Show scroll affordances (fade edges or arrows) for categories, and avoid `vh-calc` magic numbers by using flex layouts with `min-h-0`.

#### UX-17 · High · Adding a second round is hidden behind an unlabelled 28 px "+"; Add buttons disabled with no reason
- **Heuristic:** N6, N1, N10
- **Where:** `…/menu/FoodItemSelector.tsx:37`, `BeverageItemSelector.tsx:42`, `…/menu/OrderDetailsSection.tsx:66-77`, `OrderPaymentDetails.tsx:264-268`
- **Evidence:**
  ```tsx
  const isDisabled = existFoodItem || (order.orderTokens.length > 0 && !order.isAddNewOrderToken && !order.holdOrderToken) || id==="0";
  ```
- **User impact:**
  - After the first token is printed, every item "+" greys out with no message. Staff must discover a tiny grey "+" under the token list.
  - "Proceed To Payment" is likewise disabled whenever unsaved items exist, without explanation.
  - An item already in the token can't be re-added; staff must find the quantity stepper instead.
- **Recommendation:**
  - Replace the hidden "+" with a labelled "New round / Add more items" button.
  - Alternatively, keep items addable at all times and let "Send to kitchen" create the next token automatically.
  - Explain disabled states ("Send or hold the current items before taking payment").
  - Let tapping an item that's already in the cart increment its quantity.

#### UX-18 · High · "Free Bill" is one tap away with no authorisation or reason; the comped value is not recorded consistently
- **Heuristic:** N5; WCAG 3.3.4
- **Where:** `PaymentModal.tsx:66-68` (Free Bill offered at hotel checkout), `OrderBillDetailsModal.tsx:176-179` (prints zero totals while the item lines keep their prices); backend `order-controller.js:1005-1034` (restaurant Free-Bill stores **all amounts as 0**); backend `total-bill-calculation-controller.js:565-566` (hotel Free-Bill stores the **full** `totalBill` with `paymentMethod: "Free-Bill"`)
- **Evidence:**
  ```tsx
  receiptData += padKey("TOTAL BILL:") + amountPad(isFreeBill? 0 : totalBill) + "\n";
  ```
- **User impact:**
  - Easy to waive a whole stay or meal by accident, or without oversight; nothing records who approved it or why.
  - Restaurant: the receipt and the stored order agree (both 0), but the value of what was given away is lost, so
    management cannot report on complimentary meals.
  - Hotel: the stored booking keeps the full amount under payment method "Free-Bill", so any report that sums
    `totalBill` (or the room report, which uses room totals regardless of payment) counts a comped stay as revenue.
- **Recommendation:**
  - Require a confirmation step with a reason and approver (manager PIN or role).
  - Show "Complimentary" explicitly on screen and on the receipt.
  - Store the gross value **and** a 100 % "complimentary" adjustment, the same way in both modules, so reports can
    show both revenue and comps.

### B. Navigation and information architecture

#### UX-19 · Medium · Sidebar: collapsed by default, ambiguous icons, colour-only active state
- **Heuristic:** N6, N4; WCAG 2.4.4, 1.4.1
- **Where:** `Layout/Layout.tsx:139` (`useState(true)`), `:23-40` (icons), `Layout/Sidebar.tsx:53`, `:94-107`, `:111`
- **Evidence:**
  ```tsx
  { path: "/admin/user-config", title: "User Config", icon: <User size={22} /> },
  { path: "/admin/room-config", title: "Room Config", icon: <User size={22} /> },   // Super-Admin
  ```
- **User impact:**
  - New staff see only icons, and several are duplicated or misleading:
    - User for both User Config and Room Config (Super-Admin)
    - Table2 for both Tables and Beverage Inventory
    - Newspaper for both Daily Summary and Restaurant Reports
    - House for both Home and Dashboard
  - Admin items without `href` have no tooltip and no keyboard focus.
  - Active state is a background colour only, with no `aria-current`.
- **Recommendation:**
  - Default to expanded on desktop and remember the user's choice.
  - Use unique, meaningful icons, and always show a tooltip when collapsed.
  - Use `NavLink` with `aria-current="page"` and a non-colour indicator (bar or weight).

#### UX-20 · Medium · Weak, missing or static page titles
- **Heuristic:** WCAG 2.4.2 Page Titled (A), 2.4.6, 1.3.1; N1
- **Where:**
  - `Layout/Header.tsx:58` (`<h1 className="text-sm text-gray">`)
  - `Layout/Layout.tsx:88-116` (missing `/bookings/:id` and `/completed-checkout-details`; `"/admin/restaurant/report"` doesn't match the route `/admin/restaurant/reports`; stale keys `/settings`, `/kitchen`, `/rooms`, `/tasks`, `/staff`)
  - `index.html:7`
- **Evidence:** `return pathTitles[currentPath] || "";`
- **User impact:**
  - Users can't tell where they are on several screens.
  - Browser tabs and history all read "Ganesh Garden Hotel".
  - Pages contain inconsistent heading levels: "Room Reports" `h2` vs header "Reports"; "Currency Configure" is a `div`.
- **Recommendation:**
  - Derive titles from route metadata, make the `h1` prominent (text-xl), and set `document.title` per route.
  - Restaurant pages should include the outlet name (see UX-50).

#### UX-21 · Medium · Dead ends and unreachable screens
- **Heuristic:** N3, N9
- **Where:**
  - `App.tsx:51-118`: no `*` route and no error element. PrinterDiagnostics isn't imported.
  - `TableDetails.tsx:28`: id `0` means Book stays disabled forever.
  - `OrderDetailsSection.tsx:22-35`: "Order not found / Select a order from the left".
  - `component/checkout/CheckoutCompletedDetails.tsx:20-21, 39, 50`: on refresh the router state is lost, so the skeleton spins forever.
  - `CheckoutDetails.tsx:41-68`.
  - `Login.tsx:142-156` and `CreateUser.tsx:118-131`: no Beverage-Inventory role.
- **Evidence:**
  ```tsx
  if (bookingId) fetchCheckout();   ...   if (!booking) return <CheckoutSkeleton />;
  ```
- **User impact:**
  - Staff opening Tables or Menu from the sidebar hit a screen they can't act on, with misleading copy.
  - Refreshing a detail page leaves an endless skeleton.
  - Typos in URLs show a blank page.
- **Recommendation:**
  - Add a 404 route and an error boundary.
  - Use real ids in URLs (`/checkouts/:bookingId`, `/bookings/:id/receipt`).
  - For id `0` screens, show "Start an order from Home" with a button.
  - Route Printer Diagnostics under Admin and link to it from print errors.
  - Either remove the Beverage-Inventory nav set or make the role creatable.

#### UX-22 · Medium · Route access depends only on token presence (backend does not compensate — see SEC-03)
- **Heuristic:** N5; information architecture
- **Where:** `component/ProtectedRoute.tsx:8-17`; `Layout/Layout.tsx:146-151`
- **Evidence:** `const token = localStorage.getItem("authToken"); if (!token) { return <Navigate to="/" replace />; }`
- **User impact:**
  - Any logged-in role can open `/admin/user-config` or `/checkouts` by URL and see that page next to their own sidebar, which is confusing and, if the API doesn't enforce roles, risky.
  - Most of the corresponding API endpoints don't check the role either (SEC-03, SEC-09), so this is not only cosmetic.
- **Recommendation:** add role-aware route guards with a "Not authorised" page, and derive the sidebar from the same route map.

### C. Feedback, loading, empty and error states

#### UX-23 · Medium · Silent failures and infinite skeletons
- **Heuristic:** N1, N9
- **Where:**
  - `Layout/Layout.tsx:153-158` with `features/user/userSlice.ts:33-41`: no `rejected` case, so the app skeleton never resolves if the role call fails.
  - Room grids: `RoomAvailability.tsx:40`, `Checkouts.tsx:24`, `SwitchRooms.tsx:24`, `Step02.tsx:51` (console only).
  - `bookings.tsx:52-54` (a failure displays "No bookings found.").
  - `CheckoutDetails.tsx:48-50`; `ManageInventory.tsx:24-27`; `MonthlyBeverageSales.tsx:54-55`; `BillingTabs.tsx:63-65`.
  - `Header.tsx:72` ("Loading..." forever).
- **Evidence:** `} catch (err) { console.error("Failed to fetch rooms:", err); }`
- **User impact:**
  - Staff see an empty grid ("Empty 0") or "No bookings" and assume the hotel is empty, when the network actually failed.
  - Reception may double-book after a stale load.
- **Recommendation:** a shared async-state pattern with skeleton, an error message plus **Retry**, a distinct "No results" state, and an offline banner.

#### UX-24 · Medium · Login friction
- **Heuristic:** N2, N5, N7; WCAG 1.3.5 (AA, autocomplete)
- **Where:** `pages/login/Login.tsx:34-37` (email validation), `:173-175` ("Username"), `:130-158` (role select), `:79-83` (2 s delay), `:206-212` (spinner only, not disabled), `:116-127` (fixed `w-[500px]` card **and** fixed `w-[500px]` form with `p-10`)
- **Evidence:** `email: z.string().email("Invalid email address"),` … `<FormLabel>Username</FormLabel>`
- **User impact:**
  - Staff must know their system role, and the field label contradicts the error message.
  - There's no `autocomplete="username"` or `"current-password"`.
  - The form likely overflows its card on narrow screens. Needs confirmation (verify in running app).
- **Recommendation:**
  - Derive the role from the account (or pre-select the last-used role).
  - Label the field "Email" with `type="email" autocomplete="username"`.
  - Remove the artificial delay, disable the button while logging in, and make the card `max-w-md w-full`.

#### UX-25 · Medium · Forgot password: step-2 errors are never shown
- **Heuristic:** N9; WCAG 3.3.1 (A)
- **Where:** `component/authentication/ForgotPasswordModal.tsx:166-223` (no error rendering for tempPassword, newPassword or confirmPassword), `:61`, `:94-97`, `:171`
- **Evidence:** `validate: (v) => v === step2.getValues("newPassword") || "Passwords do not match",` with no `{errors.confirmPassword && …}` anywhere.
- **User impact:**
  - Mismatched or empty passwords silently block submission.
  - The temporary password field is plain text.
  - Error copy is generic ("Something went wrong…").
  - The success toast has grammar errors.
- **Recommendation:**
  - Render each field's error.
  - Use type="password" with a show toggle that has an accessible label.
  - Show a password-requirements hint, and say specifically what failed ("Temporary password is incorrect or expired").

#### UX-26 · Medium · Onboarding form validation and input types
- **Heuristic:** N5, N9; WCAG 3.3.1, 3.3.3
- **Where:**
  - `Step01.tsx:322-327`: WhatsApp has `maxLength={12} minLength={12}` with the placeholder "+947X XXX XXXX" (15 characters).
  - `:340-357` and `:359-379`: errors are shown on *disabled* computed fields.
  - `:132-158`: hotel buttons have no visible label and indicate selection by colour only.
  - `:415-427`: check-in is locked to today.
  - `onboardingSlice.ts:17-18`: adults default to 0.
  - `:121-123`: the form has no `noValidate`, so native browser bubbles mix with inline messages.
- **Evidence:** `<Input placeholder="+947X XXX XXXX" {...field} maxLength={12} minLength={12} />`
- **User impact:**
  - Typing a number with spaces, as the placeholder suggests, truncates it silently, so WhatsApp messages go to wrong numbers.
  - "Total Guests must be greater than 0" appears under an uneditable field instead of beside the Adults stepper.
  - Late-night arrivals and pre-registrations can't be dated correctly.
- **Recommendation:**
  - Use `type="tel"` with a country-code prefix and normalise spaces.
  - Validate at the steppers (default Adults to 1).
  - Add a labelled "Property" radio group, and allow editing check-in within a window.
  - Use a single validation style (`noValidate` plus RHF messages).

#### UX-27 · Medium · Book disabled until a currency is chosen, with no hint
- **Heuristic:** N1, N6
- **Where:** `component/footer/InvoiceFooter.tsx:217-224`; `SelectedRoomsList.tsx:43, 147-158`; the unreachable toast in `Step02.tsx:132-136`
- **Evidence:** `disabled={loadingBooking || (updatedRooms ?? []).some(room => !room.currency)}`
- **User impact:** receptionists can't tell why "Book" is greyed out.
- **Recommendation:** pre-select the booking currency (from Customer Type or the last used one), or show inline "Select a currency to continue" next to the control.

#### UX-28 · Medium · Booking update shortcomings
- **Heuristic:** N1, N3, N5
- **Where:**
  - `BookingUpdate.tsx:66-68`: only totalGuests is recalculated; there's no length-of-stay effect.
  - `:483-493`: a past check-out blocks submit.
  - `:166-182` with `:184`: `setLoading(true)` replaces the page while the email is sent.
  - `:522-532`: price inputs have no label.
  - No Cancel or Back control.
- **Evidence:** `if (loading) return <div className="p-6">Loading...</div>;`
- **User impact:**
  - Extending a stay shows a stale Length of Stay.
  - Editing a guest who is over-staying fails with "Check-out date cannot be before today" until the dates are changed.
  - The QR modal vanishes mid-action.
- **Recommendation:**
  - Recalculate nights and price preview live.
  - Validate check-out only when it is changed, or validate "≥ check-in".
  - Use a separate `sending` state, and add Cancel and Back.

#### UX-29 · Medium · Inconsistent discount models; silent rejection
- **Heuristic:** N4, N5, N9
- **Where:**
  - `BookingInfo.tsx:60-73`: an amount, with `max={100}` but validated against subtotal, and out-of-range input silently ignored.
  - `InvoiceFooter.tsx:128-136`: "Discount %".
  - `OrderBillDetailsModal.tsx:335-345`: a percentage.
  - `OrderPaymentDetails.tsx:193-198, 126-127`: shows `LKR {order.discount}` and **adds** discount to the total.
- **Evidence:** `const totalBill = order.subTotal + order.tax + order.discount + order.serviceCharge;`
- **User impact:**
  - Staff must remember which screen uses a percentage and which an amount. Typing a value too large does nothing, with no message.
  - On held or summary orders the stored discount **percentage** is displayed as an amount ("LKR 10.00") and is
    **added** to the total (`OrderPaymentDetails.tsx:126-127, 197`), so the on-screen total of a discounted order is
    higher than what was charged. (Confirmed in source.)
- **Recommendation:**
  - Use one discount control everywhere, with a %/amount toggle, an inline error for out-of-range values, and the resulting amount shown.
  - Subtract the discount consistently.

#### UX-30 · Medium · Additional-charges entry is awkward and unclear
- **Heuristic:** N2, N4, N6
- **Where:** `component/checkout/AdditionalCharges.tsx:74-79` (disabled inputs used as labels), `:80-87` (the placeholder "Price (LKR)" never shows because the value is 0), `:42-47` (only USD is converted, EUR isn't), `:51` (Add does nothing silently); `CheckoutCompletedDetails.tsx:69` ("Spa")
- **Evidence:** `<input type="text" value="Massage" disabled className="border px-2 py-1 rounded text-sm bg-gray-100 w-32" />`
- **User impact:**
  - The fields look like editable but greyed inputs.
  - The price fields start at "0", so staff must delete the 0 before typing.
  - The charge is called "Massage" here but "Spa" on the completed view.
  - Pressing Add with an empty field gives no feedback.
- **Recommendation:**
  - Use real labels, empty numeric fields with a currency prefix, and validation messages.
  - Name charges consistently, and show the charge list with edit and remove.

#### UX-31 · Medium · Payment modal hides the amount; navigates away on error
- **Heuristic:** N1, N3, N9
- **Where:** `PaymentModal.tsx:136-172` (title, options and "Confirm" only), `:128-130` (`finally { navigate("/checkouts") }`)
- **Evidence:** `<DialogTitle ...>Select a Payment Method</DialogTitle> … : "Confirm"}`
- **User impact:**
  - The cashier confirms without seeing the amount due, a tendered amount or change.
  - On an API error the page navigates away, losing the discount and additional charges entered.
- **Recommendation:**
  - Show "Amount due: LKR 48,500.00" prominently, and add a cash-tendered/change field.
  - Label the button "Confirm payment · LKR 48,500.00".
  - Stay on the page if there's an error.

#### UX-32 · Medium · Room switch flow is hard to understand
- **Heuristic:** N2, N4, N1
- **Where:**
  - `SwitchRoomCollection.tsx:245-249`: "Update" removes the room.
  - `InvoiceFooter.tsx:93-99`: a fake 1.5 s delay.
  - `RoomDetails.tsx:146-164`: navigates to onboarding.
  - `Step02.tsx:191-204`: toast "Rooms booked successfully!".
  - `InvoiceFooter.tsx:149`: `{totalOldRoomsPrice && …}` may render a stray "0". Needs confirmation.
- **Evidence:** `<Button onClick={() => handleRemoveRoom(room)}>Update</Button>`
- **User impact:**
  - Staff don't realise "Update" marks the room to vacate.
  - The flow jumps to a different screen labelled "Onboarding" with a "Book" button, so there's no from → to confirmation.
- **Recommendation:** a dedicated Switch Room dialog: *From* (current room, choose which) → *To* (available rooms filtered by type) → *Price adjustment* → *Review* ("Move Guest X from 104 to 210 from today") → Confirm.

#### UX-33 · Medium · Bookings list issues
- **Heuristic:** N1, N4
- **Where:**
  - `pages/reception/bookings/bookings.tsx:62-79`: completed bookings never call `setTotalPages`.
  - `:235-244`: changing rows per page doesn't reset to page 1.
  - `:128-137`: search input has no label, and searches only on Enter or the button.
  - `:189, 194`: `toLocaleString()` and raw `toFixed(2)` with no currency.
  - `:221`: `colSpan={showCompleted ? 8 : 6}` while the table has 9 or 7 columns.
  - `:106-125`: an `h2` wraps the toggle buttons.
  - `:154`: header "Is Switched".
- **Evidence:** `setCompletedBookings(res.data.data || []);   // totalPages unchanged`
- **User impact:** wrong page counts on Completed Checkouts, empty pages after changing page size, and totals with no currency.
- **Recommendation:** use proper Tabs, a labelled search with debounce, reset pagination on filter changes, and format money and dates with the shared helpers.

#### UX-34 · Medium · Invoice list empty state is misleading
- **Heuristic:** N1, N10
- **Where:** `component/invoice/InvoiceList.tsx:31, 47-49, 158-163, 128`
- **Evidence:** `if (!fromDate || !toDate) return;` … `No invoices found`
- **User impact:**
  - On first visit staff see "No invoices found" before choosing dates.
  - Totals show raw decimals with no currency.
  - There's no pagination.
- **Recommendation:** default to the current month and show "Select a date range to view invoices" until both dates are set. Format the totals.

#### UX-35 · Medium · Reports: crash risk, silent clamping, inconsistent numbers
- **Heuristic:** N5, N9, N4
- **Where:**
  - `component/reports/ReportsHeader.tsx:42-46, 54-58`: clearing a date gives `new Date("")`, which is truthy, so `format(Invalid Date)` throws `RangeError`. With no error boundary, the page goes blank. Needs confirmation (verify in running app).
  - `ReportsTable.tsx:76-81`: values are clamped to grossTotal silently.
  - `:115-124`: mixed raw and `toFixed(2)` numbers.
  - `:133`: saved rows are marked only by a gray-100 tint.
  - `:27-39`: 13 columns.
  - `pages/admin/Reports.tsx:104-108`: "Please fill all values" doesn't identify the rows.
- **Evidence:** `onChange={(e) => setDate({ from: new Date(e.target.value), to: date.to })}`
- **User impact:** possible white screen, unexplained changes to entered numbers, and hard-to-scan wide tables on laptops.
- **Recommendation:**
  - Guard invalid dates.
  - Show inline row errors and highlight incomplete rows.
  - Show "Max: LKR x" instead of silently clamping.
  - Format all money the same way, use a status column (Saved / Unsaved), and freeze the first columns.

#### UX-36 · Medium · Restaurant summary issues
- **Heuristic:** N4, N1
- **Where:**
  - `…/restaurant-summary/SummaryList.tsx:36-39` versus `:80-83`: header widths `w-[70%]` / `w-[100%]` don't match the cells, so columns misalign.
  - `:66-68`: row "selection" does nothing.
  - `RestaurantSummaryFilter.tsx:68-70`: "CheckIN Income", "WalkIN Income".
  - `:64`: wrong error copy, "Failed to fetch daily order summary".
  - `:58` versus `:200`: the fetch sends `""` for non-admins but Download sends the state default `"Beach"`, so a Pool admin may download Beach data. Needs confirmation (verify in running app).
  - `DownloadButton.tsx:12-33`: no loading state.
- **Evidence:** `restaurantType: isAdmin ? restaurantType : "",` … `<DownloadExcelButton ... restaurantType={restaurantType} />`
- **User impact:** misread columns and a possibly wrong export file.
- **Recommendation:** use a real `<table>` with aligned numeric columns, the same filter for view and export, a progress state while downloading, and corrected labels.

#### UX-37 · Medium · No reprint and no money totals in the restaurant daily view
- **Heuristic:** N3, N7
- **Where:** `…/daily-summary/DailyOrderDetailSection.tsx:107-109` (`isSummaryOrder` shows only the total), `DailyOrderSummaryFilterAndCount.tsx:163-167` (counts only)
- **Evidence:** `<OrderPaymentDetails isSummaryOrder={true} />`
- **User impact:**
  - A guest who loses a receipt can't get a reprint.
  - Cashiers can't reconcile the shift by payment method (cash vs card vs room).
- **Recommendation:** add "Reprint bill" and "Reprint token" on the summary detail, plus totals by payment method and a shift-close summary.

#### UX-38 · Medium · Tables screen shows placeholder data and inconsistent legend
- **Heuristic:** N2, N4
- **Where:** `…/tables/TableDetails.tsx:115-119` (hard-coded "04" seats); `TableSelectionSection.tsx:55` (legend "Selected" is a teal border on white, the real selection is a dark border on teal at `:31`); `:44-46` (reserved tables have `cursor-pointer` but ignore taps)
- **Evidence:** `<p>Seats</p><p>:</p><p>04</p>`
- **User impact:** wrong capacity information, and taps on reserved tables give no feedback.
- **Recommendation:** use real seat counts, a legend that matches the tiles, and show "Table 5 is occupied (Order #123)" on tap.

#### UX-39 · Medium · Restaurant start screen keeps hidden selections; Walk-In requires a name
- **Heuristic:** N5, N7
- **Where:** `features/beach-restaurant/orderSlice.ts:107-109` (`setCustomerType` doesn't reset serviceType or guest); `…/home/ServiceType.tsx:40` (Save-to-Room is hidden for Walk-In); `GetStartedButton.tsx:59-62`
- **Evidence:** `const filteredServiceTypes = serviceTypes.filter((service) => customerType === CustomerTypes.WALK_IN.value ? service.value !== ServiceTypes.SAVE_TO_ROOM.value : service );`
- **User impact:**
  - Choosing Checked-In → Save to Room → Walk-In leaves "Save to Room" selected but invisible, so a walk-in order can be created with the room service type.
  - Typing a name for every walk-in slows service.
- **Recommendation:** reset dependent fields when the customer type changes, and make the walk-in name optional (default "Walk-in #n").

#### UX-40 · Medium · Beverage inventory management
- **Heuristic:** N2, N4, N5, N9
- **Where:**
  - `…/manage-inventory/AddBeverageModal.tsx:73-74`: closes and resets *after errors*; no required-field validation.
  - `UpdateBeverageModal.tsx:99, 153-158`: "Remove Beverage" means *reduce stock*, but the button says "Update".
  - `AddItem.tsx:64, 75, 100-103`: panel titled "Add item", "Price per 1", "Remove".
  - `InventoryItems.tsx:60-65`: 10 px text; "In Stock" is always orange.
  - `pages/admin/beverage_inventory/Dashboard.tsx:45`: the OutOfStock card is commented out, so there's no low-stock cue.
- **Evidence:** `onOpenChange(false); // close modal` and `setForm({...}); // reset form` after the `catch` block.
- **User impact:**
  - Data entered is lost on any server error.
  - Staff fear "Remove" deletes the product.
  - There's no low-stock alert.
- **Recommendation:**
  - Keep the modal open on error.
  - Rename the actions "Restock" and "Write off / Reduce stock" with matching buttons and a current-stock display.
  - Add threshold-based low-stock badges and visible labels.

#### UX-41 · Medium · Admin user and room configuration gaps
- **Heuristic:** N3, N4, N9
- **Where:**
  - `component/admin/UpdateRoom.tsx:120-122`: "Cancel" toggles edit mode without reverting changes.
  - `AddRoom.tsx:108-111`: no close or cancel.
  - `pages/admin/RoomConfig.tsx:114-116`: the room-type modal closes even on error.
  - `RoomTypeModal.tsx:25-30`: no Enter-to-submit.
  - `UserTable.tsx:108, 127`: "Created Date" displays `updatedAt`.
  - `CreateUser.tsx:185-193`: submit disabled with no indication of which fields are missing; no email or phone validation.
  - No delete for users or rooms, and no password reset for users.
- **Evidence:** `onClick={() => setEditable((p) => !p)}>{editable ? "Cancel" : "Edit"}`
- **User impact:** edits persist after "Cancel", dates are wrong, and admins can't remove decommissioned rooms or reset staff passwords.
- **Recommendation:** make Cancel revert, add Close buttons, show inline validation, add Delete (with confirmation), add Reset password, and correct the date field.

#### UX-42 · Medium · Currency configuration
- **Heuristic:** N1, N2; WCAG 1.1.1
- **Where:**
  - `context/RateContext.tsx:22-27`: builds only USD rates; the EUR value isn't used.
  - `component/admin/CurrencyConverter.tsx:128`: `alt="usdFlag"` on the EUR flag.
  - `:89, 102, 115`: the other flag alt texts.
  - `:138-140`: button not disabled while saving.
  - `RateContext` fetches once on app load, so updated rates aren't applied until reload.
- **Evidence:** `'USD_LKR': rateObj.lkr / rateObj.usd, 'LKR_USD': rateObj.usd / rateObj.lkr,`
- **User impact:** admins update the EUR rate but EUR displays may still use 1:1 fallbacks (`priceConverter.ts:30`, `SwitchRoomCollection.tsx:149`). Needs confirmation (verify in running app).
- **Recommendation:**
  - Support EUR end-to-end and refresh rates after saving.
  - Show "Last updated" with timestamp and user.
  - Give flags empty `alt` because the code text sits next to them.

### D. Money and date formatting

#### UX-43 · Medium · Seven different money formats
- **Heuristic:** N4; WCAG 3.1 (consistency)
- **Where and evidence:**

  | Format | Source |
  |---|---|
  | "LKR 1,234.00" (Intl) | `util/priceConverter.ts:37-42` |
  | "LKR 1234" (raw) | `SelectedRoomsList.tsx:123, 186`; `OrderToken.tsx:184` |
  | "LKR 1234.00" | `OrderPaymentDetails.tsx:181-213` |
  | "1,234 LKR" | `OrderTokenModal.tsx:275` |
  | "1234.00 LKR" | `OrderBillDetailsModal.tsx:351-364` |
  | "LKR 12 450.00" (space separator) | `lib/order-util.ts:90-94` |
  | "$ 100" / "€ 100" | `InvoiceFooter.tsx:101-111` |
  | "EURO 100.00" | `InvoiceForm.tsx:372`, `printInvoice.ts:174` |
  | No currency at all | `bookings.tsx:194`, `InvoiceList.tsx:128`, `ReportsTable.tsx:67, 115` |
  | Unused "Rs" symbol | `util/currencySymbol.ts:8` |
  | "..." while rates are empty | `priceConverter.ts:22-24` |

- **User impact:** staff and guests compare amounts across screens and receipts in different notations, which invites reading errors (12 450 vs 12,450) and missing-currency mistakes.
- **Recommendation:**
  - One `formatMoney(amount, currency)` helper using `Intl.NumberFormat("en-LK", {style:"currency"})`, always with 2 decimals and an ISO code.
  - Right-align amounts in tables, and use the same helper in print templates (thermal: fixed-width variant).

#### UX-44 · Medium · Six or more date formats, partly browser-locale dependent
- **Heuristic:** N4
- **Where and evidence:**

  | Format | Source |
  |---|---|
  | "16 Oct 2026" | `GuestDetailsCard.tsx:23-28` |
  | "2026-10-16" | `CheckoutCompletedDetails.tsx:164-168`, `ReportsTable.tsx:59`, `UserTable.tsx:127`, prints |
  | "October 16, 2026" | `DatePicker.tsx:17-21` |
  | "2026 Oct 16" (also sent to the API) | `lib/order-util.ts:74-88` |
  | "16th October" | `TotalOrders.tsx:28-48` |
  | `toLocaleString()` / `toLocaleDateString()` | `bookings.tsx:189`, `InvoiceList.tsx:130`, receipt "Date" lines |
  | Server `checkInDateLocal` | `BookingInfo.tsx:51` |

- **User impact:**
  - Ambiguity, such as 03/04 being read as March or April depending on the browser locale.
  - Visual inconsistency, and dates are hard to scan in lists.
- **Recommendation:** standardise on one display format (e.g. "16 Oct 2026, 14:05", with a fixed hotel timezone) through a shared helper, and send ISO `yyyy-MM-dd` to the API.

### E. Visual design system

#### UX-45 · Medium · Colour contrast failures (systemic)
- **Heuristic:** WCAG 1.4.3 Contrast (AA)
- **Where:**
  - All default buttons: white on primary `#0A869D` is **4.28:1** at `text-sm` (`components/ui/button.tsx:13`; `index.css:81`).
  - Link and primary text on white, 4.24–4.28:1: "Forgot Password?" (`Login.tsx:216-222`), header email `text-xs text-primary` (`Header.tsx:72`), `OrderInitialDetails.tsx:59`, "Clear All" (10 px, `OrderToken.tsx:121`).
  - Menu prices `#0A869D` on `#F4F4F4`: **3.89:1** (`FoodItemSelector.tsx:87`).
  - Food-category labels `#E37E0A` on white: **2.89:1** (`FoodCategorySelector.tsx:156`).
  - Reserved table text `#5B5B5B` on `#F5B67C`: **3.84:1** (`TableSelectionSection.tsx:37`).
  - `text-gray-400` hints: **2.58:1** (`UserConfig.tsx:40`, `RoomConfig.tsx:92`, `DailyOrdersList.tsx:95`).
  - Non-clickable room tiles at `opacity-60`: **2.25–2.71:1** (`RoomGrid.tsx:139`).
  - Badges: 4.30:1 and 4.39:1 at 12 px (`UserTable.tsx:131-135`).
- **User impact:** hard to read in bright, outdoor and poolside conditions and for low-vision staff, on the most-used controls.
- **Recommendation:**
  - Darken primary to about **#087A8F** (5.01:1 on white, 4.56:1 on #F4F4F4) and the food-category orange to about **#A85C08** (5.0:1).
  - Use `gray-600` or darker for helper text.
  - Show disabled or unavailable rooms with a pattern or icon instead of opacity.

#### UX-46 · Medium · Weak or missing focus indicators
- **Heuristic:** WCAG 2.4.7 Focus Visible (AA), 1.4.11
- **Where:** `components/ui/button.tsx:8` (`focus-visible:ring-ring/50`, where `--ring` is `oklch(0.708 0 0)` in `index.css:110`); `index.css:160-163` (`* { @apply ... outline-ring/50 }`); `AdditionalCharges.tsx`, `InvoiceFooter.tsx:135` and others (raw `<input>` with only `border`)
- **Evidence:** `outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **User impact:**
  - The focus ring is about #D0D0D0 on white, **1.54:1**, effectively invisible.
  - Native inputs inherit the faint outline colour. Needs confirmation (verify in running app).
  - Combined with UX-01, keyboard use is impractical.
- **Recommendation:** use a 2 px ≥ 3:1 focus ring, e.g. `ring-[#087A8F]` with `ring-offset-2`, applied to all interactive elements including custom inputs.

#### UX-47 · Medium · QR "Send" modal is not an accessible dialog and its purpose is unclear
- **Heuristic:** WCAG 4.1.2, 2.1.2, 2.4.3; N2
- **Where:** `component/modal/QrCodeModal.tsx:17-52`
- **Evidence:** `<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"> … <img src={QR} alt="qr" …/>`
- **User impact:**
  - No `role="dialog"`, focus trap or Escape handling.
  - The QR is a static asset, not booking-specific, and the copy addresses the guest ("How would you like to receive the QR code?") although staff operate the screen.
  - WhatsApp has no loading state.
- **Recommendation:**
  - Rebuild on the Radix Dialog.
  - Retitle it "Send room details to guest", show what will be sent (rooms, Wi-Fi, QR), and give the QR meaningful alt text.
  - Show send status for both channels.

#### UX-48 · Medium · Design tokens duplicated and bypassed; no type scale
- **Heuristic:** N4, N8 (maintainability)
- **Where:**
  - `index.css:12-27` and `:29-41`: tokens defined twice, with aliases `primary` / `primary-dup` / `Primary_blue` and `secondary` / `Primary_orange` / `bg-highlight`.
  - `:42`: a malformed declaration, `--color-bg-text-primary:` with no value, swallows `--radius-sm`. Needs confirmation (verify in running app).
  - `:126-158`: `.dark` overrides `--primary` to grey, but no dark mode exists.
  - About **189** arbitrary hex utilities in components; top ones: `text-[#444444]` ×41, `text-[#6F6868]` ×23, `bg-[#F4F4F4]` ×22, `bg-[#B24E0E]` ×5, `text-[#0A869D]` ×7.
  - Font sizes mix `text-[10px]`, `[11px]`, `[0.625rem]`, `[0.75rem]`, `[0.85rem]`, `[0.875rem]`, `[0.93rem]`, `[0.95rem]`, `[1rem]`, `[1.125rem]`, `[14px]` and `[16px]` with `text-xs`…`text-3xl`.
  - The `text-gray` token (#444) coexists with Tailwind `gray-400`…`gray-800` and hex greys `#5B5B5B` and `#6F6868`.
- **Evidence:** `--color-primary-dup: #0A869D;` … `--color-bg-text-primary: ` followed by `--radius-sm: calc(var(--radius) - 4px);`
- **User impact:** visual drift (five greys for body text, mismatched headings), and brand or contrast changes need edits in roughly 200 places.
- **Recommendation:**
  - One semantic token layer: `--color-brand`, `--color-accent`, `--status-available`, `--status-occupied`, `--status-maintenance`, `--text-primary`, `--text-muted` and so on.
  - Map shadcn variables to it, remove the aliases and hex literals (lint for `\[#`), and define a 6-step type scale.

#### UX-49 · Medium · Inconsistent selected-state, tab and destructive-button patterns
- **Heuristic:** N4
- **Where:**
  - Selected state as an orange `bg-secondary` fill: `Step01.tsx:137-141`, `ManageInventory.tsx:46-59`, `CustomerType.tsx:45-47`.
  - Selected state as default/outline variants: `bookings.tsx:107-124`, `Invoice.tsx:20-31`, `BillingTabs.tsx:139-151`, `MonthlyBeverageSales.tsx:84-95`.
  - Destructive "Remove" actions styled as an outline primary (`UpdateFoodCategorySection.tsx:156-163`, `UpdateFoodItemSection.tsx:323-330`, `AddItem.tsx:100`), while `destructive` is used only at `InvoiceForm.tsx:448-454`.
  - `ManageInventory.tsx:46` uses `hover:bg-secondary` on outline buttons, so dark text sits on #B24E0E when hovered.
  - Seven or more hand-rolled spinner `span`s.
  - Cards: `rounded-2xl bg-mainWhite` vs shadcn `Card` vs `rounded-lg border`.
- **User impact:** users can't learn one visual language for "selected", "tab" or "dangerous".
- **Recommendation:**
  - Standardise on shadcn `Tabs` / `ToggleGroup` with one selected style.
  - Use the `destructive` variant for deletes.
  - Use one `Spinner` component (with sr-only text) and one Card style.

#### UX-50 · Medium · No Beach vs Pool identity in the UI
- **Heuristic:** N1, N2
- **Where:**
  - `Layout/Layout.tsx:52-81`: identical nav for both outlets.
  - `Header.tsx:22-27`: titles like "Home" or "Menu".
  - The outlet appears only on printouts (`OrderTokenModal.tsx:147-148`).
  - `features/user/userSlice.ts:36-40`: Pool staff are mapped to `restaurantType: Beach`; currently unused. Needs confirmation.
- **Evidence:** `}else if (action.payload === "Pool-Restaurant-Staff"){ state.restaurantType = RestaurantTypes.BEACH.value; }`
- **User impact:** on shared devices staff can't confirm on screen which outlet they are billing for, and the printed header decides it after the fact.
- **Recommendation:** show the outlet name and colour accent in the header and sidebar ("Sunset Pool Bar · Menu"). Derive it from the user, and allow an explicit outlet switch for admins.

#### UX-51 · Low · Dark mode not supported
- **Heuristic:** N4
- **Where:** `index.css:6, 126-158`; `App.tsx:47` (`theme="light"`); custom tokens are fixed hex values.
- **User impact:** none today. Enabling `.dark` would turn primary grey and leave hex-coloured text on dark backgrounds.
- **Recommendation:** after token consolidation (UX-48), define dark values for the semantic tokens, or remove the unused `.dark` block.

### F. Microcopy

#### UX-52 · Medium · Spelling and grammar errors visible to users
- **Heuristic:** N4, N8
- **Where and evidence:**
  - "Sold Liqueur Amount" (`SoldLiqueurAmount.tsx:56`); "Hard Liqueur" (`TotalInStock.tsx:33`, `Restock.tsx:31`).
  - "Add Liqueur", "Liqueur :", "Amount of Liqueur" (`AddFoodItemSection.tsx:276, 289, 331`; `UpdateFoodItemSection.tsx:217, 233, 279`). The meaning is *liquor*, not *liqueur*.
  - "Walked-In" (`HoldOrderSelectionSection.tsx:55`, `DailyOrdersList.tsx:34`).
  - "CheckIN Income" / "WalkIN Income" (`RestaurantSummaryFilter.tsx:69-70`).
  - "Select a order" (`OrderDetailsSection.tsx:32`, `DailyOrderDetailSection.tsx:69`).
  - "Successfully send temporary password into email" (`ForgotPasswordModal.tsx:61`).
  - "Currency Configure" (`CurrencyConfig.tsx:7`); "Is Switched" (`bookings.tsx:154`); "Price per 1" (`AddItem.tsx:75`); "Sub Total - (LKR)" (`SummaryList.tsx:36`); "SEA FOOD" (`OrderTokenModal.tsx:148`).
  - "Resturant" appears only in file and component names (`pool-&-beach-resturant-dashboard/*`) and isn't user-visible.
- **User impact:** looks unprofessional, especially on screens shared with guests and on printouts.
- **Recommendation:** fix the strings. Use a central copy file and spell-check it in CI.

#### UX-53 · Medium · Inconsistent terminology and labels
- **Heuristic:** N4, N2
- **Where and evidence:**
  - Guest / Customer: "Customer Name" (`BookingInfo.tsx:32`) vs "Guest Name" (`CheckoutCompletedDetails.tsx:147`) vs "Customer" (prints).
  - Check-in variants: "Checked In / Checked Out" (`BookingInfo.tsx:50-55`), "Check-in / Check-out" (Step01), "CheckIn Date" (`ReportsTable.tsx:30`), "Checkouts" / "Checkout".
  - Room status: "Reserved" (legend) vs "Booked" (tile) vs "Empty"; tables "Reserved".
  - Service types: "Dine In" vs "Dine-In"; "Take Away" vs "Take-Away"; "Save to Room" vs "Save-To-Room" vs "Room-Service" (`TotalOrders.tsx:79`).
  - Charges: "Massage" vs "Spa"; "Additional Prices" vs "Additional Charges".
  - "Booking Id" vs "Booking ID".
  - "Proceed To Payment" vs "Proceed to Payment" vs "Proceed to menu".
  - Buttons: "Update" meaning remove room or reduce stock; "Book" for a table; "Remove" for delete.
  - "Order Type" vs "Service Type"; "EURO" vs "EUR"; login "Username" vs email.
  - Raw enums printed ("Checked-In", "Save-To-Room").
- **User impact:** extra cognitive load and errors while training new staff.
- **Recommendation:**
  - Publish a glossary: Guest; Check-in / Check-out; Available / Occupied / Maintenance; Dine-in / Takeaway / Charge to room; Additional charges; sentence-case buttons; ISO currency codes.
  - Map enums to display labels in a single place.

#### UX-54 · Medium · Technical messages shown to staff
- **Heuristic:** N9, N2
- **Where:**
  - `OrderTokenModal.tsx:86, 188`: `alert("Print failed! Check console for details.")`.
  - `printCheckout.ts:29`: "QZ Tray not loaded. Start QZ Tray first."
  - `printInvoice.ts:23`; `PrinterDiagnostics.tsx:61`.
  - Generic messages: "Something went wrong!" (`Login.tsx:86`), "Successfully added data" (`GetStartedButton.tsx:38`).
- **User impact:** cashiers don't know what QZ Tray is or what the console is, so they stall or call IT.
- **Recommendation:** use human, action-oriented copy, e.g. "Receipt printer not connected. Check the printer is on, then tap Retry.", with a link to Printer Diagnostics. No blocking `alert()`.

### G. Printed outputs

#### UX-55 · Medium · A4 final bill: branding, identifiers and structure
- **Heuristic:** N2, N4
- **Where:**
  - `util/printCheckout.ts:221-226`: the same address and phone for both hotels.
  - `:237-239`: `#${booking?.customerType}` prints "#Booking.com".
  - `:229-246`: no bill/invoice number, issue date/time, room numbers or guest count.
  - `:248-255`: empty sections print their titles.
  - `:134`: "Massage".
  - `:289-290`: two identical copies with no "Guest copy" / "Hotel copy" label.
  - `:90-99`: room lines may use display-currency formatting while the summary is hard-coded "LKR".
  - Also UX-08 (the arithmetic).
- **Evidence:**
  ```html
  <div>Marakolliya Beach, Tangalle, Sri Lanka</div><div>Tel: +94 47 2242529</div>
  <tr class="row-line"><td>Customer Type</td><td class="right">#${booking?.customerType}</td></tr>
  ```
- **User impact:**
  - Guests of Ganesh Garden Beach Cabana receive a bill with another property's details.
  - The bill can't be referenced by number.
  - Totals are hard to audit.
- **Recommendation:**
  - A config-driven template per property (logo, address, phone, tax ID).
  - Bill number and issue timestamp; room numbers and nights; an itemised summary that adds up.
  - Hide empty sections, and label the copies.

#### UX-56 · Medium · Invoice print lacks nights and line totals
- **Heuristic:** N2
- **Where:** `util/printInvoice.ts:158-182` (Type, Count and Per Day only), `:127-129` (same address), `:174, 188-201` ("EURO"), `:136-153` (no issue date)
- **Evidence:** `<td class="bold">Type</td><td class="bold right">Count</td><td class="bold right">Per Day</td>`
- **User impact:**
  - Agents and guests can't verify Total = Σ(count × nights × rate).
  - (The "Type" column prints the category name, because the list API populates it — checked.)
- **Recommendation:** add Nights and Line total columns, an issue date, ISO currency codes, and the property-specific header.

#### UX-57 · Medium · Thermal restaurant bill: clarity and edge cases
- **Heuristic:** N2, N1
- **Where:**
  - `OrderBillDetailsModal.tsx:137-145`: no table number, staff or cashier name.
  - `:150-169`: tokens separated only by blank lines.
  - `:176-179`: Free Bill prints 0 totals while lines keep their prices.
  - `:178`: "Discount (0%): -0.00 LKR".
  - `:62-66` and `OrderTokenModal.tsx:52-57`: 9-character price column, so amounts ≥ 100,000.00 touch the qty column. Needs confirmation (verify in running app).
  - `:190-191`: two unlabelled copies.
- **Evidence:** `const priceWidth = 9; // e.g. "12345.67" fits (including decimals)`
- **User impact:** guests and cashiers can't tie the bill to a table, and complimentary bills look inconsistent.
- **Recommendation:**
  - Add Table, Cashier and Bill No.
  - Print a "COMPLIMENTARY" banner, and hide zero-discount lines.
  - Widen the price column or drop the qty width, and label the copies.

### H. Responsiveness (hotel screens)

#### UX-58 · Medium · Fixed layouts on hotel screens; fragile height hacks
- **Heuristic:** WCAG 1.4.10 Reflow (AA); N7
- **Where:**
  - Fixed 4-column page grids with no breakpoints: `RoomAvailability.tsx:50`, `Step02.tsx:237`, `Checkouts.tsx:40`, `SwitchRooms.tsx:43`, `RoomConfig.tsx:64`, `UserConfig.tsx:29`, `ManageInventory.tsx:40`, `BeachRestaurantTablesPage.tsx:24`; inner `grid-cols-4` at `RoomGrid.tsx:105`.
  - Fixed widths: `Login.tsx:119, 127` (`w-[500px]`), `Step01.tsx` (`w-75`, `w-50`, `w-72`, `w-70`, `w-100`), `QrCodeModal.tsx:21` (`w-96`).
  - Nested `h-screen` inside a padded layout with padding hacks: `bookings.tsx:103, 143` (`pb-[180px]`), `InvoiceList.tsx:101` (`h-screen … pb-[350px]`), `ReportsTable.tsx:23`, `ManageInventory.tsx:68`, `Step02.tsx:238`.
  - `Layout.tsx:170-174`: `main` has no height, inside an `overflow-hidden` parent.
- **Evidence:** `<div className="h-screen overflow-y-auto pb-[350px]">`
- **User impact:**
  - On 1280 × 720 laptops and tablets, the 1/4-width details panel becomes very narrow (about 230 px) and the guest form's two columns overflow.
  - Bottom content may be clipped or double-scrolled. Needs confirmation (verify in running app).
  - There's no search across a large room grid.
- **Recommendation:**
  - Use responsive grids (`lg:grid-cols-[1fr_360px]`).
  - Use flex column layouts with `min-h-0` scroll regions instead of `vh` arithmetic.
  - Put room search and status filters above the grid.

### I. Smaller issues

#### UX-59 · Medium · Dashboards: chart has no text alternative; cards lack units and use odd icons
- **Heuristic:** WCAG 1.1.1 (A); N2
- **Where:** `component/reception/MonthlyGuestRegistration.tsx:120-124` (canvas only); `SoldLiqueurAmount.tsx:60` (no unit, and it sums soft drinks with liquor); `TotalInStock.tsx:2, 18` (Users icon for stock); `CustomerType.tsx:18, 21` (School and UserLock icons)
- **Recommendation:** add a summary table or `aria-label` with the data, show units (bottles or ml), and use semantic icons (Package, Hotel, Footprints).

#### UX-60 · Low · Header bell is decorative but looks interactive; user details fall back to "Loading..."
- **Heuristic:** N8, N1
- **Where:** `Layout/Header.tsx:62` (`cursor-pointer` icon with no handler), `:71-72`
- **Recommendation:** remove the bell until notifications exist (or make it a real button), and show "—" or retry on error.

#### UX-61 · Low · Logout: no confirmation; failure leaves the user logged in; invisible spinner
- **Heuristic:** N3, N1
- **Where:** `Layout/Sidebar.tsx:56-78` (on API failure the token isn't cleared), `:128` (white spinner on a white button)
- **Recommendation:** always clear the local session on logout, even if the API fails. Optionally confirm when there are unsaved orders, and use a visible spinner.

#### UX-62 · Low · Image alt text is unhelpful or wrong
- **Heuristic:** WCAG 1.1.1 (A)
- **Where:** `Sidebar.tsx:84`, `Login.tsx:121` (`alt="logo"`); `QrCodeModal.tsx:38` (`alt="qr"`); `CurrencyConverter.tsx:89, 102, 115, 128` ("lkrFlag", and "usdFlag" on the EUR flag)
- **Recommendation:** use "Ganesh Garden Beach Cabana" for logos, a descriptive alt or empty alt for decorative flags, and meaningful QR alt text.

#### UX-63 · Low · Room-grid selection details
- **Heuristic:** N1, N4
- **Where:** `RoomGrid.tsx:63-66, 141` (`activeRoomId` border persists after deselect, and looks identical to "selected" at `:44`); `:146` (10 px room type)
- **Recommendation:** use a single selection state with a checkmark, and room type at ≥ 12 px.

#### UX-64 · Low · Daily orders list polish
- **Heuristic:** N4
- **Where:** `DailyOrdersList.tsx:53-60` (header `grid-cols-9`) vs `:70` (skeleton `grid-cols-8`); `:58` ("Food Items" also includes beverages); `:120` (room "No" for walk-ins); `:46-47` (date shown as "2026 Oct 16")
- **Recommendation:** use a semantic table with matching skeleton columns, "Items", "—" for no room, and the standard date format.

#### UX-65 · Low · Misc
- `index.html:5` declares `type="image/svg+xml"` for `favicon.png`.
- `GuestDetails.tsx:135-137` returns `<></>` without keys inside a map.
- `OrderToken.tsx:160-167` keeps the "−" button enabled at quantity 1 even though it does nothing.
- `PrinterDiagnostics.tsx:54` briefly shows "❌ Not Available" while a test is running.

**Recommendation:** clean these up during the token and component refactor.

---

## 4. Contrast measurements (WCAG 2.x)

| Pair | Ratio | AA normal text (4.5) | Where used |
|---|---|---|---|
| White on primary #0A869D | 4.28 | Fail | All default `Button`s |
| Primary #0A869D on #FEFEFE | 4.24 | Fail | Header email, links, "Clear All", status labels |
| Primary on #F4F4F4 | 3.89 | Fail | Menu item prices |
| #E37E0A on white | 2.89 | Fail | Food category labels |
| #5B5B5B on #F5B67C | 3.84 | Fail | Reserved table labels |
| #5B5B5B on #2DE2C5 | 4.14 | Fail | Checked-in hold-order tiles |
| gray-400 (~#99A1AF) on #FEFEFE | 2.58 | Fail | Empty-state hints (User/Room Config) |
| #444 at 60% opacity on faded tile | 2.25–2.71 | Fail | Non-clickable room tiles |
| blue-600 on blue-100 / gray-500 on gray-100 | 4.30 / 4.39 | Fail | User status badges (12 px) |
| Focus ring (ring/50 ≈ #D0D0D0) vs white | 1.54 | Fail (3:1 non-text) | All shadcn controls |
| Reserved #F5B67C vs Maintenance #D3BB5C | 1.08 | n/a: indistinguishable | Room grid |
| White on secondary #B24E0E | 5.26 | Pass | Selected tiles |
| #444 on #AEE6E6 / #F5B67C / #D3BB5C | 7.08 / 5.50 / 5.12 | Pass | Room tiles (when not faded) |
| Suggested primary #087A8F on white / #F4F4F4 | 5.01 / 4.56 | Pass | Recommended replacement |
| Suggested orange #A85C08 on white | 5.00 | Pass | Recommended replacement |

---

## 5. Prioritised UX improvement roadmap

### Quick wins (about 1 sprint, low risk, mostly local changes)
1. **Separate transaction and print outcomes:** UX-02, UX-04 (invoice/bill/token prints). Return a print status, show "Retry print", and never show payment failure for a print error.
2. **Stop false success messages:** `unwrap()` every thunk before toasting (cancel order, category, item); disable Hold for empty tokens; validate quantity > 0 (UX-04).
3. **Invoice total:** compute it live, display it, remove "Confirm Rooms", and block a 0 total (UX-03).
4. **Fix data bugs that mislead staff:** swapped Beach/Pool dashboard data (UX-09); Daily Summary filter parameter (UX-10); header title key mismatch and missing titles (UX-20); "Created Date" field (UX-41).
5. **Kitchen token content:** add TABLE and SERVICE TYPE in large text, label the copies, and itemise or remove the service charge (UX-11).
6. **Disable buttons while submitting** on all create/update actions, with text labels (UX-13).
7. **Add `aria-label`s** to every icon-only control (UX-14), and **associate labels** using `FormLabel` or `htmlFor`/`id` (UX-15).
8. **Status text on tiles:** print Available, Occupied or Maintenance on every room or table tile and fix the legend (UX-06, UX-38).
9. **Contrast tokens:** darken primary to about #087A8F and the category orange to about #A85C08; replace gray-400 hints; add a 3:1 focus ring (UX-45, UX-46).
10. **Copy fixes:** the spelling list in UX-52; replace developer messages (UX-54); explain disabled states (UX-17, UX-27).
11. **Onboarding Back button** using the existing `prevStep`; remove `window.location.reload()` (UX-12).
12. **WhatsApp field:** `type="tel"`, normalise spaces, and remove `maxLength` truncation (UX-26).

### Medium-term (2–4 sprints)
1. **Accessible interaction primitives:** replace clickable `div`s with `button` / RadioGroup / ToggleGroup / Tabs across payment, room, table, category and order lists (UX-01). Add keyboard testing and axe-core checks in CI.
2. **Confirmation and undo system:** a shared `ConfirmDialog` for cancel/delete/clear/deactivate/free-bill/remove-stock, plus "Undo" toasts (UX-05, UX-18).
3. **Unified checkout calculation and summary:** a single totals function used by screen and print; itemised additional charges; one discount control; a payment modal with amount due, tendered and change, staying open on error (UX-08, UX-29, UX-30, UX-31).
4. **Formatting layer:** `formatMoney` and `formatDate` helpers used everywhere, including prints and Excel; ISO dates to the API (UX-43, UX-44).
5. **Async state pattern:** error + Retry, true empty states, error boundary, 404 page, role-based route guards, URL-addressable detail pages (UX-21, UX-22, UX-23, UX-33, UX-34).
6. **Design-token consolidation:** a semantic token set, removal of hex literals (lint rule), a type scale, standard Tabs/Toggle/destructive patterns, a single Spinner (UX-48, UX-49).
7. **Print templates:** property-specific header config, bill numbers and timestamps, labelled copies, Free Bill / complimentary handling, wider thermal columns; route and link Printer Diagnostics (UX-55, UX-56, UX-57, UX-21).
8. **Restaurant reconciliation:** reprint token/bill, totals by payment method, shift summary, consistent export filters (UX-36, UX-37).

### Larger redesigns
1. **Restaurant POS for tablets (Beach and Pool):**
   - A touch-first layout: 44 px+ targets, a persistent cart of at least 320 px, a responsive portrait mode.
   - An explicit outlet identity in the header (UX-50).
   - A "Send to kitchen" flow that creates rounds automatically, replacing the hidden "+" (UX-17).
   - A table map with status text, real seat counts, and order numbers on occupied tables.
   - Reset dependent fields on the start screen (UX-39).
2. **Reception booking workflow:**
   - A stepper wizard (Guest → Rooms → Pricing/Currency → Review → Confirm) with Back and Cancel and a review step showing nights × rate per room, with currency conversion shown explicitly (UX-07, UX-12).
   - A room board with search and filters (status, type, floor) and accessible tiles.
   - A dedicated **Switch Room** dialog (from → to → price → review) (UX-32).
   - A booking edit screen with live nights and price recalculation (UX-28).
3. **Accessibility and design-system programme:**
   - Adopt WCAG 2.1 AA (aiming at 2.2 target sizes) as acceptance criteria.
   - Document components (states, focus, labels) and add visual-regression and axe tests.
   - Optionally add dark mode once tokens are semantic (UX-51).

---

## 6. Items marked "Needs confirmation (verify in running app)"
- **UX-11:** walk-in tokens printing a blank or "0" "Room No" line.
- ~~UX-18: whether the backend stores a non-zero total for Free Bill orders~~ — resolved: restaurant stores 0, hotel stores the full amount (see UX-18).
- ~~UX-22: whether the backend enforces role authorisation~~ — resolved: it mostly does not (see SEC-03 in `02-security-review.md`).
- **UX-24:** login form overflowing its 500 px card.
- ~~UX-29: whether `order.discount` is a percentage when displayed as LKR~~ — resolved: confirmed bug.
- ~~UX-32: the stray "0" render when the old-rooms total is 0~~ — resolved: confirmed in code (`InvoiceFooter.tsx:149`, `{totalOldRoomsPrice && …}`; see FE-39).
- **UX-35:** a page crash when clearing a report date input.
- ~~UX-36: a Pool admin downloading Beach data~~ — resolved: confirmed in code (see FE-41).
- **UX-42:** EUR conversions using a 1:1 fallback, and stale rates until reload.
- **UX-46:** faint focus outline on native inputs caused by the global `outline-ring/50`.
- **UX-48:** the malformed CSS token swallowing `--radius-sm`.
- ~~UX-56: invoice "Type" printing a category ID~~ — resolved: it prints the name.
- **UX-57:** thermal column overflow for amounts ≥ 100,000.
- **UX-58:** clipped or double-scrolled content from the nested `h-screen` and `pb-[350px]` hacks.
- **§2.6:** the absolute-positioned per-day price (`RoomDetailsPanel.tsx:62`) possibly overlapping the sticky checkout footer.

## 7. Files reviewed (all under `frontend/src/` unless noted)
- **Shell:** `App.tsx`, `main.tsx`, `index.css`, `Layout/{Layout,Sidebar,Header}.tsx`, `component/ProtectedRoute.tsx`, `../index.html`, `../package.json`
- **Pages:** all files in `pages/**` (login, reception: onboarding, room_availability, bookings and BookingUpdate, switch_rooms, checkouts, invoice; admin: AdminDashboard, CurrencyConfig, UserConfig, RoomConfig, Reports, PrinterDiagnostics, beverage_inventory/*; beach-restaurant/*)
- **Components:** every file in `component/**`, including `admin`, `authentication`, `beach-&-pool-restaurant/*` (home, tables, menu, order-details, hold, daily-summary, restaurant-summary, dashboards), `beverage-inventory/*`, `checkout/*`, `footer`, `invoice`, `modal`, `onboarding`, `reception`, `reports`, `room/**`, `skeleton/*`, `DatePicker`, `currencyDropdown`, `SamplePrint`
- **shadcn primitives:** `components/ui/*` (button, input, label, badge, dialog, select, etc.)
- **Utilities and state:** `util/{printCheckout,printInvoice,printerConfig,priceConverter,currencySymbol}.ts`; `lib/{order-util,utils}.ts`, `lib/enums/order-related-enums.ts`; `context/{RateContext,CurrencyContext}.tsx`; `features/{user,onboarding}/*`, `features/beach-restaurant/orderSlice.ts`; `api/axios.tsx`
