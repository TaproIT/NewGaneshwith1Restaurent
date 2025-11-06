"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PrintButton() {
  useEffect(() => {
    // Dynamically load QZ Tray
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => console.log("QZ Tray script loaded");
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
        console.log("Connected to QZ Tray");
      }

      // ✅ Set your printer name exactly as shown in QZ Tray’s printer list
      const printerName = "POS80";

      // Create printer config
      const config = qz.configs.create(printerName);

      // ✅ Use RAW ESC/POS text
      const data = [
        {
          type: "raw",
          format: "plain",
          data:
            "\x1B\x40" + // Initialize printer
            "============================\n" +
            "       POOL RESTAURANT BILL      \n" +
            "============================\n" +
            "Order Token: 165\n" +
            "Date: " + new Date().toLocaleString() + "\n" +
            "----------------------------\n" +
            "Item           Qty   Price\n" +
            "Coffee          2     800\n" +
            "Sandwich        1     450\n" +
            "----------------------------\n" +
            "TOTAL:                1250 LKR\n" +
            "============================\n" +
            "  Thank you! Come again!  \n\n\n" +
            "\x1D\x56\x00", // Cut paper (ESC/POS command)
        },
      ];

      await qz.print(config, data);
      console.log("✅ Print job sent to ET PT 30 successfully!");
    } catch (err) {
      console.error("❌ Printing error:", err);
      alert("Print failed! Check the console for details.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button onClick={printReceipt}>🖨️ Print POS Receipt</Button>
    </div>
  );
}
