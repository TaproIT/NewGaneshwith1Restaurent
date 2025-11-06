export type RoomStatus = "reserved" | "empty" | "maintain" | "selected";

export interface RoomTypeRef {
  _id: string;
  type: string;
}

export interface Room {
  _id?: string;
  no: string;
  type?: RoomTypeRef | null;   // <---- UPDATED
  perDayPrice: number;
  facilities: string[];
  isBooked?: boolean;
  isMaintenance?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}