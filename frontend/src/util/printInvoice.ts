// src/util/printInvoice.ts
import { toast } from "react-toastify";

declare global {
  interface Window {
    qz: any;
  }
}

export async function printInvoice(invoice: any) {
  try {
    const qz = window.qz;
    if (!qz) {
      toast.error("⚠ QZ Tray not loaded. Please start QZ Tray.");
      return;
    }

    // ✅ Ensure websocket is active
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect().catch(() => {
        toast.error("Failed to connect QZ Tray.");
        return;
      });
    }

    // ✅ Change this printer name to your actual POS printer name
    const printerName = "ET PT-30"; 
    const config = qz.configs.create(printerName);

    const html = `
      <html>
      <body style="font-family: monospace; width: 80mm; font-size: 14px;">
        <div style="text-align:center;">
          <h3 style="margin:0;">Invoice</h3>
          <p style="margin:0;">${new Date(invoice.createdAt).toLocaleString()}</p>
          <hr/>
        </div>

        <table style="width:100%;">
          <tr><td>Invoice No:</td><td style="text-align:right;">${invoice.invoiceNumber}</td></tr>
          <tr><td>Customer:</td><td style="text-align:right;">${invoice.customerName || "-"}</td></tr>
          <tr><td>Members:</td><td style="text-align:right;">${invoice.numberOfMembers || "-"}</td></tr>
        </table>

        <hr/>

        <table style="width:100%; font-size:14px;">
          <tr>
            <td><b>Total</b></td>
            <td style="text-align:right;"><b>${invoice.total?.$numberDecimal}</b></td>
          </tr>
        </table>

        <div style="text-align:center;margin-top:10px;">
          <p>Thank You!</p>
        </div>
      </body>
      </html>
    `;

    await qz.print(config, [
      { type: "html", format: "plain", data: html },
    ]);

    toast.success("Invoice sent to printer!");

  } catch (err) {
    console.error(err);
    toast.error("Printing failed. Check printer or QZ Tray.");
  }
}
