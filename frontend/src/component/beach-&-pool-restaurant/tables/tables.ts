export type TableStatus = "Selected" | "Empty" | "Reserved";

export interface Table {
  id: string;
  label: string;
  status: TableStatus;
}

// export const tables: Table[] = [
//   { id: "T01", label: "T 01", status: "empty" },
//   { id: "T02", label: "T 02", status: "reserved" },
//   { id: "T03", label: "T 03", status: "empty" },
//   { id: "T04", label: "T 04", status: "reserved" },
//   { id: "T05", label: "T 05", status: "empty" },
//   { id: "T06", label: "T 06", status: "reserved" },
//   { id: "T07", label: "T 07", status: "empty" },
//   { id: "T08", label: "T 08", status: "reserved" },
//   { id: "T09", label: "T 09", status: "empty" },
//   { id: "T10", label: "T 10", status: "reserved" },
//   { id: "T11", label: "T 11", status: "empty" },
//   { id: "T12", label: "T 12", status: "reserved" },
//   { id: "T13", label: "T 13", status: "empty" },
//   { id: "T14", label: "T 14", status: "reserved" },
//   { id: "T15", label: "T 15", status: "empty" },
//   { id: "T16", label: "T 16", status: "reserved" },
// ];
