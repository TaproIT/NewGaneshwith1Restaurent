# 09 · Third restaurant: "New Restaurant" (built 2026-10-17)

Branch `sanuda/system_enhance`, **not committed**. Review with `git diff --ignore-cr-at-eol` and commit when happy.

"New Restaurant" is a **placeholder name**. See [Renaming it](#renaming-it) before real orders are taken.

## What it does

A third restaurant that works the same way as Beach and Pool. It has its own:

- staff and admin logins: roles `New-Restaurant-Staff` and `New-Restaurant-Admin`, shown as "New Staff" and "New Admin"
  on the Login and Create User screens
- tables
- food menu and food categories
- extra-beverage categories and the drinks in them
- order numbers, starting at 00001
- hold orders
- daily summary
- restaurant report and Excel (admins only)

It shares with Beach and Pool, as they share with each other today:

- the hard liquor and soft drink stock
- the room list, for checked-in guests and "Save to room"

The code value stored on orders, tables and menu items is `New`; the label is "New Restaurant".

### Receipts

The kitchen token and the customer bill print this header, in the same layout as Beach and Pool:

```
GANESH GARDEN BEACH CABANA
NEW RESTAURANT
Tangalle
TP : +94 472242529 / +94 705505705
```

- **Phone:** the same as Beach, as asked.
- **Hotel line:** the code does not tie a restaurant to a property. I used Ganesh Garden Beach Cabana because the phone
  number is Beach's. If the restaurant belongs to Marakolliya Beach Resort, change one line in
  `frontend/src/util/receiptHeader.ts`, and the Excel title (see [Renaming it](#renaming-it)).
- Beach and Pool receipts are unchanged, byte for byte.

The reception checkout bill lists restaurant orders as "<code value> Restaurant". It shows "New Restaurant" with no
change needed.

## Reports: New is the third restaurant everywhere

| Where | Who sees it | What you get |
|---|---|---|
| Admin dashboard | Super-Admin, Admin | A third section, **New Restaurant**, after Pool and Beach. It shows New's own orders, customers and sold liquor / soft drinks. |
| Restaurant Reports | Super-Admin, Admin, Reception | The Restaurant Type list is now Beach, Pool, **New Restaurant**. Totals, the table and the Excel follow the choice. |
| Restaurant Report | New Admin | New's totals, table and Excel, exactly like the Beach and Pool admins get theirs. |
| Excel title | — | `GANESH GARDEN BEACH CABANA - NEW RESTAURANT` |
| Daily Summary | New Staff / New Admin | New's orders only. The admin-only Restaurant Type list on that screen also gets New Restaurant. That list is not sent to the server today, so it still has no effect, the same as for Beach and Pool. |
| Beverage inventory dashboard (liquor used) | Admins | The toggle is now Pool, Beach, **New Restaurant**. |
| Monthly order summary, sold-beverage summary, liquor-in-other-items summary (server) | — | These already list every restaurant, so New is included automatically as the third entry. |

### Left as it is today (as asked)

On the admin dashboard, the **Pool** section shows Beach's sold liquor / soft drink totals, and the **Beach** section
shows Pool's. That swap is unchanged. The New section shows New's own numbers.

## A fix that changes what Pool admins download

**Before:** on the Restaurant Report, **Download Excel** always sent "Beach" for restaurant admins. That is the default
of a dropdown only admins can see. So:

- a Pool admin saw Pool totals on screen, but the Excel had Beach's numbers and Beach's title
- a New admin would have had the same problem

**Now:** for restaurant admins, the Excel uses the same rule as the on-screen totals: the server picks the restaurant
from the user's role. The result for each role:

- **Beach admin:** the same file as before.
- **Pool admin:** now Pool's numbers and Pool's title. Before, it was Beach's.
- **New admin:** New's numbers.
- **Super-Admin, Admin, Reception:** unchanged. They pick the restaurant in the dropdown.

The Excel title is now chosen from the restaurant actually reported, not from the raw request value.

## Setting it up

1. **Deploy the backend first, then the frontend.** If the frontend goes first, the New options appear but the old
   server rejects the new roles.
2. **Create the tables.** There is no screen for tables. Run this from `backend/`; it uses `MONGO_URI` from
   `backend/.env`:
   ```
   node scripts/add-restaurant-tables.js New 12 --dry-run   # shows what it would create
   node scripts/add-restaurant-tables.js New 12             # creates tables 1–12
   ```
   - Use the client's real number of tables in place of 12.
   - Each table copies the name of the Beach table with the same number. If Beach has no table with that number, it
     is called "Table <n>".
   - Tables that already exist are skipped, so it is safe to run again.
3. **Create the users.** Go to User Config → **+ Create** → role **New Staff** or **New Admin**. On the Login screen,
   they pick the same role.
4. **Build the menu.** Log in as a New Admin and add food categories, food items and extra beverages on the Menu
   page. The menu starts empty. Hard liquor and soft drinks come from the shared stock, as they do for Beach and Pool.

## Renaming it

Rename it before New takes real orders.

**Option A: change only the name people see (recommended).** Keep the code value `New` and the role values. No data
changes. Edit:

- the label, in both enum files:
  - `frontend/src/lib/enums/order-related-enums.ts` (`NEW.label`)
  - `backend/src/utils/enums/order-related-enums.js` (`NEW.label`)
- `frontend/src/util/receiptHeader.ts`: the `NEW` receipt lines (restaurant, and hotel or phone if needed)
- `backend/src/controllers/order-controller.js`: search for `NEW RESTAURANT` (the Excel title)
- `frontend/src/pages/admin/AdminDashboard.tsx`: the "New Restaurant" heading
- `frontend/src/component/beverage-inventory/dashboard/MonthlyBeverageSales.tsx`: the "New Restaurant" button
- "New Staff" and "New Admin" option text:
  - `frontend/src/pages/login/Login.tsx`
  - `frontend/src/component/admin/CreateUser.tsx`
- role labels in `backend/src/utils/enums/user-role.js`

Two places still use the code value:

- The checkout bill prints "<code value> Restaurant", so it keeps saying "New Restaurant". Change
  `frontend/src/util/printCheckout.ts` line 113 if it should not.
- The liquor-used heading on the beverage dashboard shows the code value `New`.

**Option B: change the code value too** (for example `New` → `Garden`). Change everything listed under [Files](#files),
plus the role values `New-Restaurant-*`. If any test data was created, also update the stored data:

- orders and order items
- tables, food items and categories, extra-beverage categories
- the order counter (`restaurantType: "New"`)
- users' roles

## Files

New:

- `backend/scripts/add-restaurant-tables.js`: creates the tables
- `frontend/src/util/receiptHeader.ts`: receipt header lines for each restaurant. The Beach and Pool text was moved
  here unchanged.
- `frontend/src/component/beach-&-pool-restaurant/pool-&-beach-resturant-dashboard/NewResturantDashboard.tsx`: a copy
  of the Beach section that reads New's numbers

Changed, backend:

- `utils/enums/order-related-enums.js`: `NEW` added
- `utils/enums/user-role.js`: the two roles
- `utils/user-util.js`: role → restaurant
- `models/user/user-model.js`: role list
- `models/order/order-model.js`, `models/order/food-order-item-model.js`, `models/order/beverage-order-item-model.js`,
  `models/order/restaurant-table-model.js`, `models/PoolAndBeachResturant/PBFoodNet.js`,
  `models/PoolAndBeachResturant/PBFoodNetCategory.js`, `models/ExtraBeverages/extraBeverageCategory.js`: `New`
  allowed
- `routes/order-routes.js`, `routes/PoolAndBeachResturant/pbfoodnetRoutes.js`,
  `routes/PoolAndBeachResturant/pbfoodnetCategoryRoutes.js`, `routes/ExtraBeverageRoutes/extra-beverage-routes.js`:
  the New roles get access wherever the Pool roles have it (42 role checks compared, 0 differences)
- `controllers/order-controller.js`: Excel title (3 restaurants, chosen from the reported restaurant)

Changed, frontend:

- `lib/enums/order-related-enums.ts`
- `types/roleTypes.ts`
- `Layout/Layout.tsx`: sidebar for the two roles, the same as Beach and Pool
- `pages/login/Login.tsx`
- `component/admin/CreateUser.tsx`
- `features/user/userSlice.ts`
- the menu admin rights (edit and hide items), in:
  - `pages/beach-restaurant/BeachRestaurantMenuPage.tsx`
  - `component/beach-&-pool-restaurant/menu/` (`FoodList`, `FoodCategorySelector`, `BeverageList`,
    `BeverageCategorySelector`)
- `component/beach-&-pool-restaurant/order-details/OrderTokenModal.tsx` and `OrderBillDetailsModal.tsx`: use
  `receiptHeader.ts`
- `component/beach-&-pool-restaurant/restaurant-summary/RestaurantSummaryFilter.tsx`: third option and the Excel fix
- `component/beach-&-pool-restaurant/daily-summary/DailyOrderSummaryFilterAndCount.tsx`
- `component/beverage-inventory/dashboard/MonthlyBeverageSales.tsx`
- `pages/admin/AdminDashboard.tsx`

## How it was checked

No database was available, so the real server code was run with the database calls replaced by sample data. The
original code was run the same way for comparison.

**Server:**

- `New` and the two roles are accepted, and unknown values are still rejected.
- Each role maps to the right restaurant.
- New orders get their own numbers (00001, 00002).
- A New user's tables, menu and daily summary are filtered to `New`.
- Restaurant totals and the Excel give the right restaurant, numbers and title for every role.
- The monthly, sold-beverage and liquor summaries list Beach, Pool and New.
- Every Beach and Pool result matches the original code. The one exception is the Excel title fix described above.
- All 14 route files load and are mounted as the real server mounts them. Requests went through the real login,
  token and role checks:
  - New staff and admins can log in, and can be created from User Config. Unknown roles are still refused.
  - On all 109 endpoints, the New roles get exactly the access the Pool roles have.
  - No existing role's access changed on any endpoint.
- The table script was run against sample tables. It skips existing tables and copies Beach's names. The tables it
  creates pass the model's checks, and a dry run writes nothing.

**Frontend:** the real screens were driven on sample data as every restaurant role, before and after the change.

- Beach and Pool screens are pixel-identical: home, tables, menu, hold, daily summary and report, staff and admin.
- Beach and Pool kitchen tokens and bills are identical, byte for byte.
- New staff and admin get the same sidebar and buttons as Beach and Pool, with the New receipt header.
- Restaurant report for admins:
  - Beach, Pool and New totals are correct.
  - The Excel request sends the chosen restaurant.
- Restaurant report for restaurant admins: the Excel request now leaves the restaurant to the server.
- The admin dashboard shows the third section with New's own numbers.
- The beverage toggle and the Login and Create User role lists show New.

**Build:** the type-check and `npm run build` pass, and `node --check` passes on every backend file. The type-check
and `node --check` were also run in the project folder on the development PC.

- ESLint has 3 more findings than before (158 → 161). All three are in `NewResturantDashboard.tsx`, copied as-is from
  the Beach section, which has the same three.

**Not yet tried** against the real database or on the hotel's printers. After deploying, take one test order in New
and print its token and bill.
