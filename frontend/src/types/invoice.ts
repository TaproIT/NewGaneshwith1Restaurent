export interface Invoice {
  _id: string;
  invoiceNumber: string;
  checkInDate: string;     // ISO date string
  checkOutDate: string;    // ISO date string
  customerName: string;
  numberOfMembers: number;
  roomIds: string[];
  subTotal: DecimalValue;
  tax: DecimalValue;
  discount: DecimalValue;
  total: DecimalValue;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface DecimalValue {
  $numberDecimal: string;
}

export interface InvoiceApiResponse {
  status: string;
  message: string;
  data: {
    invoices: Invoice[];
    total: number;
  };
  timeStamp: string;
}
