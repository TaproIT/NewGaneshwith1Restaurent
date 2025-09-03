export type RoomStatus = "reserved" | "empty" | "maintain" | "selected";

export interface Room {
  _id?: string; // MongoDB automatically generates this
  no: string;
  type: string;
  perDayPrice: number;
  facilities: string[];
  isBooked?: boolean; // optional since default is false
  isMaintenance?: boolean; // optional since default is false
  createdAt?: Date;
  updatedAt?: Date;
}