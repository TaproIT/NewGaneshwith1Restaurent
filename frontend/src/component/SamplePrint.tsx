"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getPrinter } from "@/util/printerConfig";

export default function PrintButton() {
  useEffect(() => {
    // Dynamically load QZ Tray
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => console.log("✅ QZ Tray script loaded");
    document.body.appendChild(script);
  }, []);

  const printReceipt = async () => {
    if (!window.qz) {
      alert("QZ Tray not loaded yet!");
      return;
    }

    const qz = window.qz;

    try {
      // Connect if not connected
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect();
        console.log("✅ Connected to QZ Tray");
      }

      // Automatically detect and select thermal printer
      const printerName = await getPrinter('thermal');
      console.log("🖨️ Using printer:", printerName);
      const config = qz.configs.create(printerName);

      const ESC = "\x1B";
      const GS = "\x1D";

      const data = [
        {
          type: "raw",
          format: "plain",
          data:
            ESC + "@" + // Initialize printer
            ESC + "a" + "\x01" + // Align center
            "============================\n" +
            " GANESH GARDEN BEACH HOTEL\n" +
            "      POOL RESTAURANT BILL\n" +
            "============================\n" +
            ESC + "a" + "\x00" + // Align left
            "Order Token: 165\n" +
            "Date: " + new Date().toLocaleString() + "\n" +
            "----------------------------\n" +
            "Item                Qty  Price\n" +
            "----------------------------\n" +
            "Coffee               2   800\n" +
            "Sandwich             1   450\n" +
            "Pasta                1   950\n" +
            "Orange Juice         3   900\n" +
            "Cheese Burger        2  1600\n" +
            "French Fries         1   550\n" +
            "Grilled Chicken      1  1200\n" +
            "Mango Juice          2   600\n" +
            "Club Sandwich        1   750\n" +
            "Chocolate Shake      1   700\n" +
            "Tuna Salad           1   650\n" +
            "Ice Cream Sundae     2   900\n" +
            "Lemon Tea            1   400\n" +
            "Fish Curry Rice      1  1100\n" +
            "Egg Fried Rice       1   950\n" +
            "Spaghetti Bolognese  1  1050\n" +
            "Garlic Bread         1   500\n" +
            "Spring Rolls         1   650\n" +
            "Prawn Curry          1  1300\n" +
            "Bottle Water (1L)    2   400\n" +
            "----------------------------\n" +
            "TOTAL:                   16500 LKR\n" +
            "============================\n" +
            ESC + "a" + "\x01" + // Align center
            "     Thank you! Come again!    \n\n\n" +
            "        \n\n\n" +
            GS + "V" + "\x00", // Cut paper
        },
      ];

      await qz.print(config, data);
      console.log("✅ Print job sent successfully to POS80!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      alert("Print failed! Check console for details.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button onClick={printReceipt}>🖨️ Print POS Receipt</Button>
    </div>
  );
}
