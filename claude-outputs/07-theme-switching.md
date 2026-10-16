# 07 · Theme switching (built 2026-10-16)

Approved by the owner after the theme preview. Branch: `sanuda/system_enhance`. **Not committed yet**. Review with
`git diff` and commit when happy.

## What it does

- A palette button sits next to the bell in the header. It opens a menu with six light themes: **Ganesh Classic**
  (today's colours, the default), Ocean, Sunset, Garden, Lotus and Monsoon. There are no dark themes, because the
  touch screens are low quality.
- Each person keeps their own theme. It is saved in that browser under their email
  (`localStorage` key `ggh.palette.<email>`).
- Reloading a signed-in page applies the theme straight away (`ggh.palette.active`), so the screen does not flash.
- Logging out returns to Ganesh Classic, and the login page always uses Classic.
- A theme changes only the brand colours: primary, secondary, the page background and a soft primary tint.
- These stay the same in every theme:
  - room and table status colours (Reserved, Empty, Maintenance)
  - Checked-In and Walk-In order colours
  - menu category colours (Food, Liquor and Soft Drinks, Extra Beverages)
  - danger red
  - the Admin dashboard chart
  - every printout
- No behaviour, wording, calculation, API call or data changes.

## Files

New:
- `frontend/src/lib/theme-palettes.ts`: the list of palettes, used for the menu swatches.
- `frontend/src/context/ThemeContext.tsx`: `ThemeProvider` and `useTheme()`. It sets `<html data-palette="…">`
  and saves each person's choice.
- `frontend/src/component/ThemeSwitcher.tsx`: the header button and menu.

Changed:
- `frontend/src/index.css`:
  - `Primary_blue`, `primary-dup`, `Primary_orange`, `bg-highlight` and `bg` now read the CSS variables.
  - Adds a new `primary-soft` token.
  - Adds the five extra `[data-palette]` blocks.
- `frontend/src/App.tsx`: wraps the app in `ThemeProvider`.
- `frontend/src/Layout/Header.tsx`: shows the switcher and loads the signed-in person's theme.
- `frontend/src/Layout/Sidebar.tsx`: Logout resets to Ganesh Classic.
- 24 components swap hard-coded brand colours for theme tokens:
  - `[#0A869D]` becomes `primary`
  - `[#B24E0E]` becomes `secondary`
  - `bg-[#F4F4F4]` becomes `bg-bg`
  - `bg-[#e6f3f5]` becomes `bg-primary-soft`

  They are in `component/beach-&-pool-restaurant/**`, `component/checkout/PaymentModal.tsx` and
  `component/beverage-inventory/manage-inventory/InventoryItems.tsx`.

Line endings stay CRLF, as in the existing files. Real diff: 28 files, +82 / −47 (`git diff --ignore-cr-at-eol --stat`).

## How it was checked

- `npm run build` (tsc + vite) passes. `tsc --noEmit` reports 0 errors before and after.
- ESLint: one new finding, `react-refresh/only-export-components` for exporting `useTheme`. It is the same pattern
  as the existing `useRates` and `useCurrency`.
- **Ganesh Classic is pixel-identical to the old UI.** The real Layout and pages were screenshotted on sample data
  before and after the change. The only difference is the new palette icon. Pages checked:
  - Onboarding
  - Room Availability
  - Bookings
  - Restaurant Home
  - Tables
  - Menu
  - Hold (with an order open)
  - Daily Summary
- Theme memory was tested:
  - after a reload, the theme is applied before the user details load
  - a second person gets their own theme
  - after logout the app is back to Classic

## How to test on your machine

1. `cd frontend && npm run dev`, then sign in.
2. Tap the palette icon next to the bell and pick a theme.
3. Move around Reception and restaurant pages.
4. Reload the page: the theme stays.
5. Log out: the login page is Classic.
6. Sign in as a different user: they start on Classic, or on their own saved choice.

## Rules for new code

- Use theme tokens for brand colours, never hex:
  - `bg-primary`, `text-primary`, `border-primary`
  - `bg-secondary`, `text-secondary`
  - `bg-bg`, `bg-primary-soft`
- Only status, category and danger colours stay fixed.
- To add a palette:
  1. Add a `:root[data-palette="<id>"]` block in `index.css` that sets `--primary`, `--secondary`, `--bg` and
     `--primary-soft`.
  2. Add the same id to `PALETTES` in `src/lib/theme-palettes.ts`.
