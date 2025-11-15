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
  spa,
  miniBar,
  laundary,
  additionalPrice,
  selectedPayment,
  convertAndFormatPrice,
  detailRooms,
  detailOrders,
}: any) {
  const qz = window.qz;
  if (!qz) {
    alert("QZ Tray not loaded. Start QZ Tray first.");
    return;
  }

  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }

  const printer = "Pantum P2500 Series";
  const config = qz.configs.create(printer);


  // ROOM CHARGES HTML
  const roomChargesHTML =
  detailRooms
    ?.map(
      (room: any) => `
        <tr class="row-line">
          <td>
            Room ${room.roomNo} 
            (${room.nights} × ${room.perDayPrice} ${room.currency}${
        room.lkrRate ? ` × ${room.lkrRate} LKR` : ""
      })
          </td>
          <td class="right">${room.displayPrice}</td>
        </tr>
      `
    )
    .join("") || "";


  // ORDERS HTML
  const ordersHTML =
  detailOrders
    ?.map(
      (order: any) => `
        <tr class="row-line">
          <td>${order.date} — ${order.type}</td>
          <td class="right">${order.displayTotal}</td>
        </tr>
      `
    )
    .join("") || "";

  // ADDITIONAL CHARGES HTML
  const additionalHTML = `
      ${spa ? `<tr class="row-line"><td>Spa</td><td class="right">${convertAndFormatPrice(spa)}</td></tr>` : ""}
      ${miniBar ? `<tr class="row-line"><td>Mini Bar</td><td class="right">${convertAndFormatPrice(miniBar)}</td></tr>` : ""}
      ${laundary ? `<tr class="row-line"><td>Laundry</td><td class="right">${convertAndFormatPrice(laundary)}</td></tr>` : ""}
      ${
        additionalPrice?.length
          ? additionalPrice
              .map(
                (item: any) => `
          <tr class="row-line">
            <td>${item.name}</td>
            <td class="right">${convertAndFormatPrice(item.price)}</td>
          </tr>
        `
              )
              .join("")
          : ""
      }
  `;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
  hr { border: 0; border-top: 1px solid #888; margin: 14px 0; }

  .section-title {
    font-size: 15px;
    font-weight: bold;
    margin-top: 22px;
    margin-bottom: 6px;
    border-bottom: 1px solid #444;
    padding-bottom: 4px;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  table {
    width: 80%;
    border-collapse: collapse;
    margin: 8px auto;
  }

  table td { padding: 6px 2px; }
  .row-line td { border-bottom: 1px solid #ddd; }
  .total-row td {
    font-size: 15px;
    font-weight: bold;
    padding-top: 10px;
    border-top: 2px solid #444;
  }

  .footer {
    margin-top: 40px;
    text-align: center;
    font-size: 12px;
    color: #555;
  }
</style>
</head>

<body>

  <div class="center">
    <img src=${logoBase64} style="width:130px; margin-bottom:6px;" />
    <div style="font-size: 17px; font-weight: bold;">Ganesh Garden Beach Cabanas & Restaurant</div>
    <div>Marakolliya Beach, Tangalle, Sri Lanka</div>
    <div>Tel: +94 47 2242529</div>
    <hr/>
  </div>

  <div class="section-title">Guest Details</div>
  <table>
    <tr class="row-line"><td>Booking ID</td><td class="right">#${booking?._id}</td></tr>
    <tr class="row-line"><td>Customer</td><td class="right">${booking?.customerName}</td></tr>
    <tr class="row-line"><td>Check-In</td><td class="right">${booking?.checkIn.split("T")[0]}</td></tr>
    <tr class="row-line"><td>Check-Out</td><td class="right">${booking?.checkOut.split("T")[0]}</td></tr>
  </table>

  <div class="section-title">Room Charges</div>
  <table>${roomChargesHTML}</table>

  <div class="section-title">Orders</div>
  <table>${ordersHTML}</table>

  <div class="section-title">Additional Charges</div>
  <table>${additionalHTML}</table>

  <div class="section-title">Summary</div>
  <table>
    <tr><td>Subtotal</td><td class="right">${convertAndFormatPrice(subtotal)}</td></tr>
    <tr><td>Tax</td><td class="right">${convertAndFormatPrice(tax)}</td></tr>
    <tr><td>Service Charge</td><td class="right">${convertAndFormatPrice(serviceCharge)}</td></tr>
    <tr><td>Discount</td><td class="right">-${convertAndFormatPrice(discount)}</td></tr>

    <tr class="total-row"><td>Total</td><td class="right">${convertAndFormatPrice(totalBill)}</td></tr>
    <tr><td>Payment Method</td><td class="right">${selectedPayment}</td></tr>
  </table>

  <div class="footer">
    <br><br>_______________________________<br>
    Signature & Stamp<br><br>
    Thank you for staying with us!
  </div>

</body>
</html>
`;

  const data = [{ type: "html", format: "plain", data: html }];
  await qz.print(config, data);
}
