import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getPrinterDetails, clearPrinterCache, testPrinter } from "@/util/printerConfig";
import type { PrinterInfo } from "@/util/printerConfig";

export default function PrinterDiagnostics() {
  const [thermalPrinter, setThermalPrinter] = useState<PrinterInfo | null>(null);
  const [a4Printer, setA4Printer] = useState<PrinterInfo | null>(null);
  const [allPrinters, setAllPrinters] = useState<PrinterInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [qzStatus, setQzStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const checkQzTray = async () => {
    if (!window.qz) {
      setQzStatus('disconnected');
      return false;
    }

    try {
      if (!window.qz.websocket.isActive()) {
        await window.qz.websocket.connect();
      }
      setQzStatus('connected');
      return true;
    } catch (error) {
      console.error('QZ Tray connection failed:', error);
      setQzStatus('disconnected');
      return false;
    }
  };

  const loadPrinters = async () => {
    setLoading(true);
    try {
      const isConnected = await checkQzTray();
      if (!isConnected) {
        setLoading(false);
        return;
      }

      const details = await getPrinterDetails();
      setThermalPrinter(details.thermal);
      setA4Printer(details.a4);
      setAllPrinters(details.all);
    } catch (error) {
      console.error('Failed to load printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrinter = async (printerName: string) => {
    setTestResults(prev => ({ ...prev, [printerName]: false }));
    const result = await testPrinter(printerName);
    setTestResults(prev => ({ ...prev, [printerName]: result }));
  };

  const handleClearCache = () => {
    clearPrinterCache();
    alert('Printer cache cleared! Reload to detect printers again.');
  };

  useEffect(() => {
    // Load QZ Tray script
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js";
    script.onload = () => {
      console.log("QZ Tray loaded");
      loadPrinters();
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Printer Diagnostics</h1>

      {/* QZ Tray Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">QZ Tray Status</h2>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            qzStatus === 'connected' ? 'bg-green-500' :
            qzStatus === 'disconnected' ? 'bg-red-500' :
            'bg-yellow-500'
          }`} />
          <span className="font-medium">
            {qzStatus === 'connected' ? '✅ Connected' :
             qzStatus === 'disconnected' ? '❌ Disconnected' :
             '⏳ Checking...'}
          </span>
        </div>
        {qzStatus === 'disconnected' && (
          <p className="mt-2 text-sm text-red-600">
            Please ensure QZ Tray is installed and running on your computer.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <Button onClick={loadPrinters} disabled={loading || qzStatus !== 'connected'}>
          {loading ? '⏳ Loading...' : '🔄 Refresh Printers'}
        </Button>
        <Button onClick={handleClearCache} variant="outline">
          🗑️ Clear Cache
        </Button>
      </div>

      {/* Selected Printers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Thermal Printer */}
        <div className="p-4 border rounded-lg bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">🖨️ Thermal Printer (Receipts)</h2>
          {thermalPrinter ? (
            <div>
              <p className="font-medium text-green-700">{thermalPrinter.name}</p>
              <p className="text-sm text-gray-600">Priority: {thermalPrinter.priority}</p>
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => handleTestPrinter(thermalPrinter.name)}
              >
                Test Connection
              </Button>
              {testResults[thermalPrinter.name] !== undefined && (
                <p className={`text-sm mt-1 ${testResults[thermalPrinter.name] ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults[thermalPrinter.name] ? '✅ Available' : '❌ Not Available'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-red-600">❌ No thermal printer detected</p>
          )}
        </div>

        {/* A4 Printer */}
        <div className="p-4 border rounded-lg bg-green-50">
          <h2 className="text-lg font-semibold mb-2">🖨️ A4 Printer (Invoices)</h2>
          {a4Printer ? (
            <div>
              <p className="font-medium text-green-700">{a4Printer.name}</p>
              <p className="text-sm text-gray-600">Priority: {a4Printer.priority}</p>
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => handleTestPrinter(a4Printer.name)}
              >
                Test Connection
              </Button>
              {testResults[a4Printer.name] !== undefined && (
                <p className={`text-sm mt-1 ${testResults[a4Printer.name] ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults[a4Printer.name] ? '✅ Available' : '❌ Not Available'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-red-600">❌ No A4 printer detected</p>
          )}
        </div>
      </div>

      {/* All Printers */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">All Detected Printers</h2>
        {allPrinters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Printer Name</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Priority</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {allPrinters.map((printer, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{printer.name}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        printer.type === 'thermal' ? 'bg-blue-100 text-blue-800' :
                        printer.type === 'a4' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {printer.type}
                      </span>
                    </td>
                    <td className="py-2 px-3">{printer.priority}</td>
                    <td className="py-2 px-3">
                      {printer === thermalPrinter && (
                        <span className="text-blue-600 text-xs">🔵 Active Thermal</span>
                      )}
                      {printer === a4Printer && (
                        <span className="text-green-600 text-xs">🟢 Active A4</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">
            {loading ? 'Loading printers...' : 'No printers detected'}
          </p>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Troubleshooting Tips</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Ensure QZ Tray is installed and running</li>
          <li>Check that printers are connected and turned on</li>
          <li>Verify printers appear in Windows printer settings</li>
          <li>Try refreshing if printers don't appear</li>
          <li>Clear cache if you've connected/disconnected printers</li>
        </ul>
      </div>
    </div>
  );
}
