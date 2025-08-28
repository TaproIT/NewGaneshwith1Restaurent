export type RoomStatus = "reserved" | "empty" | "maintain" | "selected";

export interface Room {
  id: number;
  number: string;
  status: RoomStatus;
  guest?: string; // only present if reserved
  price: number;
  beds: number;
  lockers: number;
  tables: number;
  ac: boolean;
  tv: boolean;
}