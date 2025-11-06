"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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

      // ✅ Set your printer name exactly as shown in QZ Tray’s printer list
      const printerName = "POS80";

      // Create printer config
      const config = qz.configs.create(printerName);

      // ESC/POS Commands
      const ESC = "\x1B";
      const GS = "\x1D";

      // ✅ Use RAW ESC/POS text with center alignment
      const data = [
        {
          type: "raw",
          format: "plain",
          data:
            ESC + "@"+                       // Initialize printer
            ESC + "a" + "\x01" +              // Align center
            "============================\n" +
             "     GANESH GARDEN BEACH HOTEL\n" +
            "     POOL RESTAURANT BILL\n" +
            "============================\n" +
            ESC + "a" + "\x00" +              // Align left
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
            "----------------------------\n" +
            "TOTAL:                   5250 LKR\n" +
            "============================\n" +
            ESC + "a" + "\x01" +              // Align center
            "   Thank you! Come again!   \n\n\n" +
            GS + "V" + "\x00",               // Cut paper
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
