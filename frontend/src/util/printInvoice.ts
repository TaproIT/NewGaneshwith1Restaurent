// src/util/printInvoice.ts
import { toast } from "react-toastify";

declare global {
  interface Window {
    qz: any;
  }
}

export async function printInvoice(_invoice: any) {
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
    const printerName = "Pantum P2500 Series"; 
    const config = qz.configs.create(printerName);

    const html = `
      <html>
<head>
<meta charset="UTF-8" />
<title>Payment Invoice</title>
<style>
  body {
    font-family: "Times New Roman", serif;
    width: 210mm;
    margin: 0;
    padding: 20mm;
    font-size: 14px;
  }

  .header {
    text-align: center;
    border-bottom: 1px solid black;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  .header img {
    height: 60px;
    margin-bottom: 5px;
  }

  .title {
    text-align: center;
    font-weight: bold;
    text-decoration: underline;
    margin-bottom: 20px;
  }

  .row {
    display: flex;
    line-height: 1.6;
  }
  .col {
    flex: 1;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    margin-bottom: 20px;
  }
  table th, table td {
    padding: 6px;
    border-bottom: 1px solid #444;
  }

  .footer-note {
    margin-top: 20px;
    font-size: 12px;
    opacity: 0.7;
  }

  @media print {
    body {
      margin: 0;
    }
  }
</style>
</head>
<body>

<div class="header">
  <img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAJoAAAA1CAIAAAA212V7AAAACXBIWXMAAC4jAAA...EtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2Afk" />
  <div><strong>Ganesh Garden Beach Cabanas & Restaurant</strong></div>
  <div>Marakolliya Beach, Tangalle, Sri Lanka</div>
  <div>Tel: +94 47 2242529</div>
</div>

<div class="title">PAYMENT INVOICE</div>

<div class="row">
  <div class="col"><strong>RECEIPT #:</strong> {{receiptNo}}</div>
  <div class="col"><strong>Date:</strong> {{invoiceDate}}</div>
</div>

<div class="row">
  <div class="col"><strong>Name:</strong> {{guestName}}</div>
  <div class="col"><strong>Contact:</strong> {{guestContact}}</div>
</div>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Unit Cost (USD)</th>
      <th>Total (USD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{{roomDescription}}</td>
      <td>{{unitCost}}</td>
      <td>{{totalCost}}</td>
    </tr>
  </tbody>
</table>

<div><strong>Total Nights:</strong> {{nights}}</div>
<div><strong>Check-in:</strong> {{checkIn}}</div>
<div><strong>Check-out:</strong> {{checkOut}}</div>

<div style="margin-top: 15px;">
  <strong>Advance Payment:</strong> {{advanceAmount}} USD <br>
  <strong>Balance Due:</strong> {{balanceAmount}} USD
</div>

<div class="footer-note">
  Additional Information: Check-in & check-out time, house rules etc.
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
