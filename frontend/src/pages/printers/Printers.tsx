// src/pages/printers/Printers.tsx
// Shows the printers on THIS computer (through QZ Tray), their live status,
// which printer the app uses for each printout, and a test print for each printer.
import { useCallback, useEffect, useState, type FC } from "react";
import { Printer as PrinterIcon, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { connectQz, type QzApi, type QzEvent } from "@/util/qz";
import { clearPrinterCache, getPrinter, getPrinterDetails, type PrinterInfo } from "@/util/printerConfig";
import { printTestPage } from "@/util/printerTest";

type QzState = "checking" | "connected" | "not-running";
interface LiveStatus {
  code: string;
  severity: string;
}

const TYPE_LABEL: Record<PrinterInfo["type"], string> = {
  thermal: "Receipt printer",
  a4: "A4 printer",
  unknown: "Other",
};

const STATUS_LABEL: Record<string, string> = {
  OK: "Ready",
  OFFLINE: "Offline",
  PAPER_OUT: "Out of paper",
  PAPER_JAM: "Paper jam",
  DOOR_OPEN: "Cover open",
  NO_TONER: "No toner",
  TONER_LOW: "Toner low",
  PAUSED: "Paused",
  ERROR: "Error",
};

const statusLabel = (code: string) =>
  STATUS_LABEL[code] ?? code.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// Status colours mean the same thing in every theme, so they are fixed
const statusClass = (status?: LiveStatus) => {
  if (!status) return "bg-gray-100 text-gray-600";
  if (status.code === "OK") return "bg-green-50 text-green-700";
  if (status.severity === "WARN") return "bg-amber-50 text-amber-800";
  return "bg-red-50 text-red-700";
};

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

const Printers = () => {
  const [qzState, setQzState] = useState<QzState>("checking");
  const [version, setVersion] = useState("");
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [defaultPrinter, setDefaultPrinter] = useState("");
  const [receiptPrinter, setReceiptPrinter] = useState("");
  const [billPrinter, setBillPrinter] = useState("");
  const [statuses, setStatuses] = useState<Record<string, LiveStatus>>({});
  const [statusSupported, setStatusSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState<string | null>(null);

  const onEvent = useCallback((event: QzEvent | QzEvent[]) => {
    const events = Array.isArray(event) ? event : [event];
    setStatuses((prev) => {
      const next = { ...prev };
      for (const e of events) {
        if (!e?.printerName || !e.statusText) continue;
        if (e.eventType && e.eventType !== "PRINTER") continue; // ignore print-job events
        next[e.printerName] = { code: e.statusText, severity: e.severity ?? "INFO" };
      }
      return next;
    });
  }, []);

  const listenForStatus = useCallback(
    async (qz: QzApi) => {
      try {
        qz.printers.setPrinterCallbacks(onEvent);
        await qz.printers.startListening(null);
        const current = await qz.printers.getStatus();
        if (current) onEvent(current as QzEvent | QzEvent[]);
        setStatusSupported(true);
      } catch {
        setStatusSupported(false); // QZ Tray 2.0 or older cannot report printer status
      }
    },
    [onEvent]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qz = await connectQz();
      setQzState("connected");
      setVersion(qz.api ? await qz.api.getVersion().catch(() => "") : "");

      clearPrinterCache(); // pick up printers that were just plugged in
      const details = await getPrinterDetails();
      setPrinters(details.all);
      setDefaultPrinter(await qz.printers.getDefault().catch(() => ""));
      // The same choice the app makes when it prints
      setReceiptPrinter(details.all.length ? await getPrinter("thermal").catch(() => "") : "");
      setBillPrinter(details.all.length ? await getPrinter("a4").catch(() => "") : "");

      setStatuses({});
      await listenForStatus(qz);
    } catch (error) {
      console.error("QZ Tray connection failed:", error);
      setQzState("not-running");
      setPrinters([]);
      setReceiptPrinter("");
      setBillPrinter("");
    } finally {
      setLoading(false);
    }
  }, [listenForStatus]);

  useEffect(() => {
    load();
    return () => {
      const qz = window.qz as QzApi | undefined;
      if (!qz?.websocket?.isActive()) return;
      qz.printers.stopListening().catch(() => {});
      qz.printers.setPrinterCallbacks(() => {});
    };
  }, [load]);

  const handleTest = async (printer: PrinterInfo) => {
    setPrinting(printer.name);
    try {
      await printTestPage(printer.name, printer.type);
      toast.success(`Test page sent to ${printer.name}`);
    } catch (error) {
      toast.error(`Test print failed: ${errorText(error)}`);
    } finally {
      setPrinting(null);
    }
  };

  const qzTitle =
    qzState === "connected"
      ? "QZ Tray is connected"
      : qzState === "checking"
      ? "Connecting to QZ Tray..."
      : "QZ Tray is not running on this computer";

  const qzHelp =
    qzState === "connected"
      ? `${version ? `Version ${version} · ` : ""}Showing the printers installed on this computer.`
      : qzState === "checking"
      ? "If QZ Tray asks whether to allow this website, press Allow."
      : "Start QZ Tray from the Windows Start menu, then press Refresh.";

  return (
    <div className="p-6 rounded-2xl bg-mainWhite h-[calc(100vh-140px)] overflow-y-auto flex flex-col gap-5 text-gray">
      {/* QZ Tray status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${
              qzState === "connected" ? "bg-green-600" : qzState === "checking" ? "bg-amber-500" : "bg-red-600"
            }`}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium">{qzTitle}</p>
            <p className="text-sm text-gray-500">{qzHelp}</p>
          </div>
        </div>
        <Button onClick={load} disabled={loading} className="w-32">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="Refreshing" />
          ) : (
            <>
              <RefreshCw /> Refresh
            </>
          )}
        </Button>
      </div>

      {/* Which printer each printout uses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsedFor title="Receipts and kitchen tokens" printer={receiptPrinter} />
        <UsedFor title="Checkout bills and invoices" printer={billPrinter} />
      </div>

      {/* All printers */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="py-3 px-4 text-left">Printer</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {printers.length > 0 ? (
              printers.map((printer) => {
                const status = statuses[printer.name];
                return (
                  <tr key={printer.name} className="border-b last:border-b-0">
                    <td className="py-3 px-4">
                      <p className="font-medium">{printer.name}</p>
                      {printer.name === defaultPrinter && <p className="text-xs text-gray-500">Windows default</p>}
                    </td>
                    <td className="py-3 px-4">{TYPE_LABEL[printer.type]}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusClass(status)}`}>
                        {status ? statusLabel(status.code) : statusSupported ? "Not reported" : "Not available"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button size="sm" className="w-36" onClick={() => handleTest(printer)} disabled={printing === printer.name}>
                        {printing === printer.name ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-label="Printing" />
                        ) : (
                          "Print test page"
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500 italic">
                  {qzState === "connected"
                    ? "No printers found on this computer."
                    : qzState === "checking"
                    ? "Looking for printers..."
                    : "Printers appear here once QZ Tray is running."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        This page shows the printers of the computer you are using. Thermal printers get a short receipt with a paper cut;
        other printers get one A4 page. Some USB receipt printers do not report their status.
      </p>
    </div>
  );
};

const UsedFor: FC<{ title: string; printer: string }> = ({ title, printer }) => (
  <div className="p-4 rounded-xl bg-bg flex items-center gap-3">
    <div className="p-3 flex items-center justify-center bg-primary-soft rounded-full shrink-0">
      <PrinterIcon size={22} className="text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-medium truncate">{printer || "No printer found"}</p>
    </div>
  </div>
);

export default Printers;
