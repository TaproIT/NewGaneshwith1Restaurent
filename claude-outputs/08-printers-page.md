# 08 · Printers page (built 2026-10-16)

Branch `sanuda/system_enhance`, **not committed**. Review with `git diff` and commit when happy.

## What it does

A printer icon in the header (every role) opens **Printers** at `/printers`. The page works with QZ Tray on **the
computer you are using**. It shows:

- whether QZ Tray is running, and its version; if QZ Tray is not running, how to start it
- which printer the app uses on this computer for:
  - **receipts and kitchen tokens** (thermal)
  - **checkout bills and invoices** (A4)

  This is the same automatic choice the print screens make (`util/printerConfig.ts`); this page doesn't change it.
- every installed printer, with its type, which one is the Windows default, and live status from QZ Tray 2.1+
  (Ready, Offline, Out of paper, Paper jam, Cover open, No toner, Toner low, Paused, Error). Some USB receipt
  printers do not report status; they show "Not reported".
- **Print test page** on each printer. A receipt printer gets a short ESC/POS receipt (42-character width check,
  paper cut), sent the same way as the kitchen token. Other printers get one A4 HTML page, sent the same way as
  invoices. Only the row being printed shows a spinner.
- **Refresh**, which also clears the 5-minute printer cache, so a newly plugged-in printer is used straight away.

No existing print flow, receipt layout or printer choice changed.

## Files

New:
- `frontend/src/util/qz.ts`: loads QZ Tray's script once (same source as the existing print screens) and connects
- `frontend/src/util/printerTest.ts`: the two test printouts
- `frontend/src/pages/printers/Printers.tsx`: the page

Changed:
- `frontend/src/App.tsx`: the `/printers` route
- `frontend/src/Layout/Layout.tsx`: header title "Printers"
- `frontend/src/Layout/Header.tsx`: printer icon link

The old `pages/admin/PrinterDiagnostics.tsx` was never routed. It is left untouched and can be deleted.

## How it was checked

- Type-check, `npm run build` and ESLint pass. The new files have no lint findings.
- Rendered with a simulated QZ Tray (3 printers, mixed statuses). Checked:
  - status labels
  - default-printer label
  - "used for" cards
  - one-row spinner
  - success toasts
  - the exact data sent: ESC/POS ending in the cut command for the thermal printer, HTML for A4
  - the "QZ Tray not running" state
  - access from a restaurant role
- Existing pages are unchanged apart from the new header icon.
- **Not yet tried on real printers.** Please press Print test page once on each hotel computer.

## Removing QZ Tray's "Allow" pop-up (not done yet)

This needs a certificate: free and self-made with `override.crt` on each PC, or QZ Premium Support at $599/year.
It also needs a small signing route on the backend (`POST /api/v1/qz/sign`, Node `crypto.createSign("SHA512")`,
private key path in `QZ_PRIVATE_KEY_PATH`). Waiting for the owner's choice.
