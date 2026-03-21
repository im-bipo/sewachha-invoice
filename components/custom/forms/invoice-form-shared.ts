export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type InvoiceFormRecord = {
  invoiceId: string;
  customerId: string;
  invoiceDate: string;
  status: InvoiceStatus;
  note: string;
  items: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vat: number;
  }>;
};

export type CustomerOption = {
  customerId: string;
  name: string;
  address: string | null;
  phoneNumber: string | null;
};

export type ServiceOption = {
  serviceId: string;
  name: string;
  cost: number;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type ItemRow = {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vat: number;
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  vat: number;
  grandTotal: number;
};

export const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export function statusToLabel(status: InvoiceStatus) {
  if (status === "PAID") return "Paid";
  if (status === "PENDING") return "Pending";
  if (status === "OVERDUE") return "Overdue";
  if (status === "CANCELLED") return "Cancelled";
  return "Draft";
}
