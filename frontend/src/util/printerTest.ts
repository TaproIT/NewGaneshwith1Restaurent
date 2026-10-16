// src/util/printerTest.ts
// Test printouts for the Printers page. Nothing here is used by the real bills, invoices or tokens.
import { connectQz } from "@/util/qz";

const ESC = "\x1B";
const GS = "\x1D";
const LINE_WIDTH = 42; // same 80 mm line width as the kitchen token and restaurant bill

const now = () => new Date().toLocaleString();

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

// Raw ESC/POS, the same way the kitchen token is printed
export function buildThermalTest(printerName: string): string {
  const ruler = "1234567890".repeat(5).slice(0, LINE_WIDTH);
  return (
    ESC + "@" +
    ESC + "a" + "\x01" + // center
    "=".repeat(LINE_WIDTH) + "\n" +
    "GANESH GARDEN\n" +
    "PRINTER TEST\n" +
    "=".repeat(LINE_WIDTH) + "\n" +
    ESC + "a" + "\x00" + // left
    `Printer : ${printerName}\n` +
    `Date    : ${now()}\n` +
    "-".repeat(LINE_WIDTH) + "\n" +
    "Full line width check:\n" +
    ruler + "\n" +
    "-".repeat(LINE_WIDTH) + "\n" +
    ESC + "a" + "\x01" +
    "If you can read this,\n" +
    "the printer works.\n\n\n\n\n" +
    GS + "V" + "\x00" // cut
  );
}

// A one-page HTML sheet, the same way invoices are printed
export function buildA4Test(printerName: string): string {
  return `<html><head><style>
  body { font-family: Arial, sans-serif; color: #000; margin: 40px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 16px; font-weight: normal; margin: 0 0 24px; }
  table { border-collapse: collapse; font-size: 14px; }
  td { padding: 6px 16px 6px 0; }
  .box { margin-top: 28px; border: 2px solid #000; padding: 16px; font-size: 14px; }
</style></head><body>
  <h1>Ganesh Garden</h1>
  <h2>Printer test page</h2>
  <table>
    <tr><td><b>Printer</b></td><td>${escapeHtml(printerName)}</td></tr>
    <tr><td><b>Date</b></td><td>${escapeHtml(now())}</td></tr>
  </table>
  <div class="box">If you can read this page, the printer works.</div>
</body></html>`;
}

export async function printTestPage(printerName: string, kind: "thermal" | "a4" | "unknown"): Promise<void> {
  const qz = await connectQz();
  const config = qz.configs.create(printerName);
  if (kind === "thermal") {
    await qz.print(config, [{ type: "raw", format: "plain", data: buildThermalTest(printerName) }]);
  } else {
    // A4 and other printers get a normal page through the Windows driver
    await qz.print(config, [{ type: "html", format: "plain", data: buildA4Test(printerName) }]);
  }
}
