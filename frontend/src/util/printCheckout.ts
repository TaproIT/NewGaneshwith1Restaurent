// src/utils/printReceipt.ts

declare global {
  interface Window {
    qz: any;
  }
}

export async function printFinalBill({
  booking,
  subtotal,
  tax,
  serviceCharge,
  discount,
  totalBill,
  additionalPrice,
  selectedPayment,
}: any) {
  const qz = window.qz;
  if (!qz) {
    alert("QZ Tray not loaded. Start QZ Tray first.");
    return;
  }

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }

  const printerName = "Pantum P2500 Series"; // Change if needed
  const config = qz.configs.create(printerName);

  // ✅ Render Additional Charges
  const extraRows =
    additionalPrice?.map((c: any) => {
      return `<tr><td>${c.name}</td><td style="text-align:right;">${c.price.toFixed(2)}</td></tr>`;
    }).join("") || "";

  // ✅ Render Room Details
  const roomRows =
    booking.roomDetails?.map((r: any) => {
      return `<tr><td>Room ${r.roomNo} (${r.nights} nights)</td><td style="text-align:right;">${r.finalRoomTotalPrice.toFixed(2)}</td></tr>`;
    }).join("") || `<tr><td colspan="2">No room charges</td></tr>`;

  // ✅ Render Order Details
  const orderRows =
    booking.orderDetails?.map((o: any) => {
      return `<tr><td>Order #${o.orderNumber}</td><td style="text-align:right;">${o.totalBill.toFixed(2)}</td></tr>`;
    }).join("") || `<tr><td colspan="2">No orders</td></tr>`;

  const html = `
  <html>
    <body style="font-family: monospace; font-size: 14px; width: 80mm;">

      <div style="text-align:center;">
        <h2 style="margin:0;">${booking.hotel || "HOTEL / RESORT NAME"}</h2>
        <p style="margin:0;">Receipt</p>
        <p style="margin:0;">${new Date().toLocaleString()}</p>
        <hr/>
      </div>

      <table style="width:100%; font-size:14px;">
        <tr><td>Booking ID:</td><td style="text-align:right;">${booking.bookingId}</td></tr>
        <tr><td>Guest:</td><td style="text-align:right;">${booking.guestName}</td></tr>
        <tr><td>Check-In:</td><td style="text-align:right;">${booking.checkInDateLocal}</td></tr>
        <tr><td>Check-Out:</td><td style="text-align:right;">${booking.checkOutDateLocal}</td></tr>
      </table>

      <hr/>

      <b>Room Charges</b>
      <table style="width:100%;">${roomRows}</table>

      <br/>

      <b>Orders</b>
      <table style="width:100%;">${orderRows}</table>

      <br/>

      ${
        extraRows
          ? `<b>Additional Charges</b><table style="width:100%;">${extraRows}</table><br/>`
          : ""
      }

      <hr/>

      <table style="width:100%; font-size:14px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${subtotal.toFixed(2)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right;">${tax.toFixed(2)}</td></tr>
        <tr><td>Service Charge</td><td style="text-align:right;">${serviceCharge.toFixed(2)}</td></tr>
        <tr><td>Discount</td><td style="text-align:right;">-${discount.toFixed(2)}</td></tr>
        <tr><td colspan="2"><hr/></td></tr>
        <tr><td><b>Total Bill</b></td><td style="text-align:right;"><b>${totalBill.toFixed(2)}</b></td></tr>
        <tr><td>Payment</td><td style="text-align:right;">${selectedPayment}</td></tr>
      </table>

      <div style="text-align:center;margin-top:10px;">
        <p>Thank you! Come Again!</p>
      </div>

    </body>
  </html>
  `;

  await qz.print(config, [{ type: "html", format: "plain", data: html }]);
}

