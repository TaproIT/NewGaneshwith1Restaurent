// Automatic Printer Configuration Utility
// Detects and configures printers without requiring user intervention

declare global {
  interface Window {
    qz: any;
  }
}

export interface PrinterInfo {
  name: string;
  type: 'thermal' | 'a4' | 'unknown';
  priority: number;
}

/**
 * Known printer patterns with priorities
 * Higher priority = preferred printer
 */
const PRINTER_PATTERNS = {
  // Thermal POS Printers (for receipts/tokens)
  thermal: [
    { pattern: /POS80/i, priority: 100 },
    { pattern: /POS-80/i, priority: 100 },
    { pattern: /TM-T88/i, priority: 95 },
    { pattern: /TM-T82/i, priority: 90 },
    { pattern: /thermal/i, priority: 80 },
    { pattern: /receipt/i, priority: 75 },
    { pattern: /XP-80/i, priority: 70 },
    { pattern: /RP80/i, priority: 70 },
  ],
  // A4 Printers (for invoices/checkout)
  a4: [
    { pattern: /Pantum.*P2500/i, priority: 100 },
    { pattern: /M6600/i, priority: 95 },
    { pattern: /M6600NW/i, priority: 95 },
    { pattern: /HP.*LaserJet/i, priority: 85 },
    { pattern: /Canon.*LBP/i, priority: 80 },
    { pattern: /Brother.*HL/i, priority: 80 },
    { pattern: /Epson.*L\d+/i, priority: 75 },
    { pattern: /Samsung.*M\d+/i, priority: 70 },
  ],
};

/**
 * Classify printer type based on name
 */
function classifyPrinter(printerName: string): PrinterInfo {
  // Check thermal patterns
  for (const { pattern, priority } of PRINTER_PATTERNS.thermal) {
    if (pattern.test(printerName)) {
      return {
        name: printerName,
        type: 'thermal',
        priority,
      };
    }
  }

  // Check A4 patterns
  for (const { pattern, priority } of PRINTER_PATTERNS.a4) {
    if (pattern.test(printerName)) {
      return {
        name: printerName,
        type: 'a4',
        priority,
      };
    }
  }

  // Unknown printer type
  return {
    name: printerName,
    type: 'unknown',
    priority: 0,
  };
}

/**
 * Get all available printers from QZ Tray
 */
async function getAvailablePrinters(): Promise<PrinterInfo[]> {
  const qz = window.qz;
  
  if (!qz) {
    throw new Error('QZ Tray not loaded');
  }

  // Connect to QZ Tray if not already connected
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect();
  }

  // Get list of all printers
  const printerNames: string[] = await qz.printers.find();
  
  // Classify and sort printers
  const printers = printerNames
    .map(name => classifyPrinter(name))
    .sort((a, b) => b.priority - a.priority);

  return printers;
}

/**
 * Automatically select the best printer for a given type
 */
export async function autoSelectPrinter(
  preferredType: 'thermal' | 'a4' = 'thermal'
): Promise<string> {
  try {
    const printers = await getAvailablePrinters();
    
    console.log('🖨️ Available printers:', printers);

    // First, try to find printer of preferred type
    const preferredPrinter = printers.find(p => p.type === preferredType);
    if (preferredPrinter) {
      console.log(`✅ Auto-selected ${preferredType} printer:`, preferredPrinter.name);
      return preferredPrinter.name;
    }

    // If no preferred type found, try opposite type
    const alternateType = preferredType === 'thermal' ? 'a4' : 'thermal';
    const alternatePrinter = printers.find(p => p.type === alternateType);
    if (alternatePrinter) {
      console.warn(
        `⚠️ No ${preferredType} printer found, using ${alternateType}:`,
        alternatePrinter.name
      );
      return alternatePrinter.name;
    }

    // If no known printers, try system default
    const defaultPrinter = await getDefaultPrinter();
    if (defaultPrinter) {
      console.warn(
        '⚠️ No known printers found, using system default:',
        defaultPrinter
      );
      return defaultPrinter;
    }

    // Last resort: use first available printer
    if (printers.length > 0) {
      console.warn(
        '⚠️ Using first available printer:',
        printers[0].name
      );
      return printers[0].name;
    }

    throw new Error('No printers available');
  } catch (error) {
    console.error('❌ Printer auto-selection failed:', error);
    throw error;
  }
}

/**
 * Get system default printer
 */
async function getDefaultPrinter(): Promise<string | null> {
  try {
    const qz = window.qz;
    if (!qz) return null;

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    const defaultPrinter = await qz.printers.getDefault();
    return defaultPrinter || null;
  } catch (error) {
    console.error('Failed to get default printer:', error);
    return null;
  }
}

/**
 * Cache for selected printers to avoid repeated detection
 */
const printerCache: {
  thermal?: string;
  a4?: string;
  timestamp?: number;
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached or auto-detect printer
 */
export async function getPrinter(
  type: 'thermal' | 'a4' = 'thermal'
): Promise<string> {
  const now = Date.now();
  
  // Check if cache is valid
  if (
    printerCache[type] &&
    printerCache.timestamp &&
    now - printerCache.timestamp < CACHE_DURATION
  ) {
    console.log(`📦 Using cached ${type} printer:`, printerCache[type]);
    return printerCache[type]!;
  }

  // Auto-detect printer
  const printerName = await autoSelectPrinter(type);
  
  // Update cache
  printerCache[type] = printerName;
  printerCache.timestamp = now;

  return printerName;
}

/**
 * Clear printer cache (useful when printer configuration changes)
 */
export function clearPrinterCache(): void {
  printerCache.thermal = undefined;
  printerCache.a4 = undefined;
  printerCache.timestamp = undefined;
  console.log('🗑️ Printer cache cleared');
}

/**
 * Test if printer is available and working
 */
export async function testPrinter(printerName: string): Promise<boolean> {
  try {
    const qz = window.qz;
    if (!qz) return false;

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect();
    }

    const printers: string[] = await qz.printers.find();
    return printers.includes(printerName);
  } catch (error) {
    console.error('Printer test failed:', error);
    return false;
  }
}

/**
 * Get printer details including capabilities
 */
export async function getPrinterDetails(): Promise<{
  thermal: PrinterInfo | null;
  a4: PrinterInfo | null;
  all: PrinterInfo[];
}> {
  try {
    const printers = await getAvailablePrinters();
    
    return {
      thermal: printers.find(p => p.type === 'thermal') || null,
      a4: printers.find(p => p.type === 'a4') || null,
      all: printers,
    };
  } catch (error) {
    console.error('Failed to get printer details:', error);
    return {
      thermal: null,
      a4: null,
      all: [],
    };
  }
}
